import { SupabaseClient } from '@supabase/supabase-js';
import { searchNearby, searchByCuisine, PlaceResult } from './external/google-places.service';
import { searchEvents, EventResult } from './external/events.service';
import { generatePlan, GeneratedItem } from './ai/claude.service';
import { getUserFeedbackSummary, formatFeedbackForPrompt } from './feedback.service';

interface GeneratePlanInput {
  userId: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  locationName?: string;
  language: string;
  supabase: SupabaseClient;
}

export interface PlanResult {
  planId: string;
  items: PlanItemResult[];
  totalCost: { min: number; max: number; currency: string };
}

export interface PlanItemResult {
  id: string;
  category: string;
  name: string;
  description: string | null;
  reason: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  price_level: number | null;
  estimated_cost: number | null;
  duration_minutes: number | null;
  image_url: string | null;
  external_url: string | null;
  external_id: string | null;
  sort_order: number;
}

export async function generateUserPlan(input: GeneratePlanInput): Promise<PlanResult> {
  const { userId, latitude, longitude, radiusKm, locationName, language, supabase } = input;

  // 1. Load user preferences
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  // 2. Create plan record
  const { data: plan, error: planError } = await supabase
    .from('plans')
    .insert({
      user_id: userId,
      mode: 'local',
      latitude,
      longitude,
      location_name: locationName,
      radius_km: radiusKm,
      preferences_snapshot: prefs ?? {},
      status: 'generating',
    })
    .select('id')
    .single();

  if (planError || !plan) throw new Error('Failed to create plan: ' + planError?.message);
  const planId = plan.id;

  try {
    // 3. Fetch external data in parallel
    const cuisinePrefs: string[] = prefs?.cuisines ?? [];
    const hasCuisinePrefs = cuisinePrefs.length > 0;

    const [cuisineRestaurants, nearbyRestaurants, activities, events] = await Promise.all([
      hasCuisinePrefs ? searchByCuisine(latitude, longitude, radiusKm, cuisinePrefs) : Promise.resolve([]),
      // Only fetch generic restaurants if user has no cuisine preferences
      !hasCuisinePrefs ? searchNearby(latitude, longitude, radiusKm, 'restaurant') : Promise.resolve([]),
      searchNearby(latitude, longitude, radiusKm, 'activity'),
      searchEvents(latitude, longitude, radiusKm, locationName),
    ]);

    // Use cuisine results if available, otherwise generic nearby
    const seenIds = new Set<string>();
    const restaurants: PlaceResult[] = [];
    for (const r of [...cuisineRestaurants, ...nearbyRestaurants]) {
      if (!seenIds.has(r.id)) {
        seenIds.add(r.id);
        restaurants.push(r);
      }
    }

    // 4. Get feedback summary for personalization
    const feedbackSummary = await getUserFeedbackSummary(supabase, userId);
    const feedbackText = feedbackSummary ? formatFeedbackForPrompt(feedbackSummary) : undefined;

    // 5. Call Claude to generate plan
    const aiPlan = await generatePlan({
      preferences: prefs ?? {},
      feedbackSummary: feedbackText,
      restaurants,
      activities,
      events,
      location: { lat: latitude, lng: longitude },
      radiusKm,
      language,
    });

    // 5. Build plan items from AI response + external data
    const items: PlanItemResult[] = [];
    let sortOrder = 0;

    function enrichItem(
      aiItem: GeneratedItem,
      category: string,
      places: PlaceResult[],
      eventsList: EventResult[],
    ): PlanItemResult {
      const place = places.find((p) => p.id === aiItem.external_id);
      const event = eventsList.find((e) => e.id === aiItem.external_id);

      return {
        id: '',
        category,
        name: aiItem.name,
        description: null,
        reason: aiItem.reason,
        address: place?.address ?? event?.address ?? null,
        latitude: place?.lat ?? event?.lat ?? null,
        longitude: place?.lng ?? event?.lng ?? null,
        rating: place?.rating ?? null,
        price_level: place?.priceLevel ?? null,
        estimated_cost: aiItem.estimated_cost ?? null,
        duration_minutes: aiItem.duration_minutes ?? null,
        image_url: place?.photoUrl ?? event?.imageUrl ?? null,
        external_url: place?.googleMapsUrl ?? event?.ticketUrl ?? null,
        external_id: aiItem.external_id,
        sort_order: sortOrder++,
      };
    }

    for (const r of aiPlan.restaurants) {
      items.push(enrichItem(r, 'restaurant', restaurants, []));
    }
    for (const a of aiPlan.activities) {
      items.push(enrichItem(a, 'activity', activities, []));
    }
    for (const e of aiPlan.events) {
      items.push(enrichItem(e, 'event', [], events));
    }

    // 6. Insert plan items
    if (items.length > 0) {
      const { error: itemsError } = await supabase.from('plan_items').insert(
        items.map((item) => ({
          plan_id: planId,
          category: item.category,
          name: item.name,
          reason: item.reason,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
          rating: item.rating,
          price_level: item.price_level,
          estimated_cost: item.estimated_cost,
          duration_minutes: item.duration_minutes,
          image_url: item.image_url,
          external_url: item.external_url,
          external_id: item.external_id,
          sort_order: item.sort_order,
        }))
      );
      if (itemsError) console.error('[PlanGenerator] Insert items error:', itemsError);
    }

    // 7. Update plan status
    const totalCost = aiPlan.day_cost_estimate;
    await supabase
      .from('plans')
      .update({ status: 'completed', total_estimated_cost: totalCost.max })
      .eq('id', planId);

    // 8. Re-fetch items with IDs
    const { data: savedItems } = await supabase
      .from('plan_items')
      .select('*')
      .eq('plan_id', planId)
      .order('sort_order');

    return {
      planId,
      items: (savedItems ?? []) as PlanItemResult[],
      totalCost,
    };
  } catch (err) {
    await supabase.from('plans').update({ status: 'failed' }).eq('id', planId);
    throw err;
  }
}
