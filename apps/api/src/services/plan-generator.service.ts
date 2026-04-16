import { SupabaseClient } from '@supabase/supabase-js';
import type { PlanItem as SharedPlanItem, UserPreferences } from '@eido-life/shared';
import { searchNearby, searchByCuisine, lookupVenue, PlaceResult } from './external/google-places.service';
import { searchEvents, EventResult } from './external/events.service';
import { generatePlan, GeneratedItem } from './ai/claude.service';
import { getUserFeedbackSummary, formatFeedbackForPrompt } from './feedback.service';
import { scorePlanItems } from './scoring.service';

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
  metadata: Record<string, any>;
  sort_order: number;
  is_visible: boolean;
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

    // Always search both cuisine-specific AND generic nearby for maximum results
    const [cuisineRestaurants, nearbyRestaurants, activities, events] = await Promise.all([
      hasCuisinePrefs ? searchByCuisine(latitude, longitude, radiusKm, cuisinePrefs) : Promise.resolve([]),
      searchNearby(latitude, longitude, radiusKm, 'restaurant'),
      searchNearby(latitude, longitude, radiusKm, 'activity'),
      searchEvents(latitude, longitude, radiusKm, locationName),
    ]);

    // Merge: cuisine results first (prioritized), then nearby
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

      // Build clean address (no GPS coordinates)
      let address = place?.address ?? null;
      if (!address && event?.venue) address = event.venue;
      if (!address && event?.address) address = event.address;

      return {
        id: '',
        category,
        name: aiItem.name,
        description: event?.date ? `📅 ${event.date}${event.time ? ` à ${event.time}` : ''}` : null,
        reason: aiItem.reason,
        address,
        latitude: place?.lat ?? event?.lat ?? null,
        longitude: place?.lng ?? event?.lng ?? null,
        rating: place?.rating ?? null,
        price_level: place?.priceLevel ?? null,
        estimated_cost: aiItem.estimated_cost ?? event?.priceMin ?? null,
        duration_minutes: aiItem.duration_minutes ?? null,
        image_url: place?.photoUrl ?? event?.imageUrl ?? null,
        // external_url = fiche Google Maps
        external_url: place?.googleMapsUrl ?? null,
        external_id: aiItem.external_id,
        sort_order: sortOrder++,
        is_visible: false, // overridden after scoring
        metadata: {
          // Cuisine: first Google Places type that ends with _restaurant or _place
          // e.g. ["italian_restaurant", "restaurant"] → cuisine: "italian_restaurant"
          ...(category === 'restaurant' && place?.types?.length
            ? { cuisine: place.types.find((t) => t !== 'restaurant' && t !== 'food' && t !== 'point_of_interest' && t !== 'establishment') ?? place.types[0] }
            : {}),
          // Google Maps link (for places or generated for events)
          ...(place?.googleMapsUrl ? { google_maps_url: place.googleMapsUrl } : {}),
          ...(!place?.googleMapsUrl && (event?.venue || event?.lat) ? {
            google_maps_url: event.venue
              ? `https://www.google.com/maps/search/${encodeURIComponent(event.venue)}`
              : `https://www.google.com/maps/@${event.lat},${event.lng},15z`
          } : {}),
          ...(place?.websiteUrl ? { website_url: place.websiteUrl } : {}),
          // Events
          ...(event?.date ? { event_date: event.date } : {}),
          ...(event?.time ? { event_time: event.time } : {}),
          ...(event?.ticketUrl ? { ticket_url: event.ticketUrl } : {}),
          ...(event?.venue ? { venue: event.venue } : {}),
          ...(event?.priceMin != null ? { price_min: event.priceMin } : {}),
          ...(event?.priceMax != null ? { price_max: event.priceMax } : {}),
        },
      };
    }

    for (const r of aiPlan.restaurants) {
      items.push(enrichItem(r, 'restaurant', restaurants, []));
    }
    for (const a of aiPlan.activities) {
      items.push(enrichItem(a, 'activity', activities, []));
    }
    // Enrich events: lookup venues on Google Places for Maps/website links
    for (const e of aiPlan.events) {
      const item = enrichItem(e, 'event', [], events);
      const eventData = events.find((ev) => ev.id === e.external_id);

      // Search venue on Google Places — only if venue name is a real venue (not artist/event name)
      const venueName = eventData?.venue;
      const isRealVenue = venueName
        && venueName.toLowerCase() !== eventData?.name?.toLowerCase()
        && venueName.length > 2;

      if (isRealVenue && eventData?.lat && eventData?.lng) {
        const venueInfo = await lookupVenue(venueName, eventData.lat, eventData.lng);
        if (venueInfo) {
          if (venueInfo.googleMapsUrl) item.metadata.google_maps_url = venueInfo.googleMapsUrl;
          if (venueInfo.websiteUrl) item.metadata.website_url = venueInfo.websiteUrl;
        }
      }

      // If no ticket URL, generate a search link for booking
      if (!item.metadata.ticket_url && eventData) {
        item.metadata.ticket_url = `https://www.google.com/search?q=${encodeURIComponent(`réserver ${eventData.name} billets`)}`;
      }

      items.push(item);
    }

    // 6. Score items by category to surface the most relevant ones first
    if (prefs && items.length > 1) {
      const currentHour = new Date().getHours();

      function toSharedItem(item: PlanItemResult): SharedPlanItem {
        return {
          id: item.id || '',
          plan_id: '',
          category: item.category as SharedPlanItem['category'],
          name: item.name,
          description: item.description,
          address: item.address,
          location: item.latitude != null && item.longitude != null
            ? { lat: item.latitude, lng: item.longitude }
            : null,
          rating: item.rating,
          price_level: item.price_level as 1 | 2 | 3 | 4 | null,
          estimated_cost: item.estimated_cost,
          duration_minutes: item.duration_minutes,
          image_url: item.image_url,
          external_url: item.external_url,
          external_id: item.external_id || null,
          external_source: null,
          metadata: item.metadata ?? {},
          sort_order: item.sort_order,
          created_at: '',
        };
      }

      function scoreCategory(categoryItems: PlanItemResult[]): PlanItemResult[] {
        if (categoryItems.length <= 1) return categoryItems;
        const forScoring = categoryItems.map(toSharedItem);
        const scored = scorePlanItems(forScoring, prefs as UserPreferences, latitude, longitude, currentHour);
        return scored
          .map((s) => categoryItems[forScoring.indexOf(s.item)])
          .filter(Boolean) as PlanItemResult[];
      }

      const restaurants = scoreCategory(items.filter((i) => i.category === 'restaurant'));
      const activities = scoreCategory(items.filter((i) => i.category === 'activity'));
      const events = scoreCategory(items.filter((i) => i.category === 'event'));

      let order = 0;
      items.splice(0, items.length,
        ...restaurants.map((i, idx) => ({ ...i, sort_order: order++, is_visible: idx < 3 })),
        ...activities.map((i, idx) => ({ ...i, sort_order: order++, is_visible: idx < 3 })),
        ...events.map((i, idx) => ({ ...i, sort_order: order++, is_visible: idx < 3 })),
      );
    } else {
      // No prefs or single item — mark first 3 of each category visible
      const countByCategory: Record<string, number> = {};
      for (const item of items) {
        const n = countByCategory[item.category] ?? 0;
        item.is_visible = n < 3;
        countByCategory[item.category] = n + 1;
      }
    }

    // 7. Insert plan items
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
          description: item.description,
          metadata: item.metadata,
          sort_order: item.sort_order,
          is_visible: item.is_visible,
        }))
      );
      if (itemsError) console.error('[PlanGenerator] Insert items error:', itemsError);
    }

    // 8. Update plan status
    const totalCost = aiPlan.day_cost_estimate;
    await supabase
      .from('plans')
      .update({ status: 'completed', total_estimated_cost: totalCost.max })
      .eq('id', planId);

    // 9. Re-fetch items with IDs
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
