export interface EventResult {
  id: string;
  name: string;
  description: string | null;
  date: string;
  venue: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  priceMin: number | null;
  priceMax: number | null;
  imageUrl: string | null;
  ticketUrl: string | null;
  source: string;
}

const TICKETMASTER_KEY = process.env.TICKETMASTER_API_KEY;
const EVENTBRITE_KEY = process.env.EVENTBRITE_API_KEY;

export async function searchEvents(
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<EventResult[]> {
  // Try Ticketmaster first, then Eventbrite as fallback
  if (TICKETMASTER_KEY) {
    const results = await searchTicketmaster(lat, lng, radiusKm);
    if (results.length > 0) return results;
  }

  if (EVENTBRITE_KEY) {
    return searchEventbrite(lat, lng, radiusKm);
  }

  return [];
}

async function searchTicketmaster(lat: number, lng: number, radiusKm: number): Promise<EventResult[]> {
  try {
    const radiusMiles = Math.round(radiusKm * 0.621371);
    const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().replace(/\.\d+Z$/, 'Z');

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_KEY}&latlong=${lat},${lng}&radius=${radiusMiles}&unit=miles&size=10&sort=date,asc&startDateTime=${now}&endDateTime=${weekLater}`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const json = await res.json();
    const events = json._embedded?.events ?? [];

    return events.map((e: any) => ({
      id: e.id,
      name: e.name,
      description: e.info ?? null,
      date: e.dates?.start?.localDate ?? '',
      venue: e._embedded?.venues?.[0]?.name ?? null,
      address: e._embedded?.venues?.[0]?.address?.line1 ?? null,
      lat: parseFloat(e._embedded?.venues?.[0]?.location?.latitude) || null,
      lng: parseFloat(e._embedded?.venues?.[0]?.location?.longitude) || null,
      priceMin: e.priceRanges?.[0]?.min ?? null,
      priceMax: e.priceRanges?.[0]?.max ?? null,
      imageUrl: e.images?.[0]?.url ?? null,
      ticketUrl: e.url ?? null,
      source: 'ticketmaster',
    }));
  } catch {
    return [];
  }
}

async function searchEventbrite(lat: number, lng: number, radiusKm: number): Promise<EventResult[]> {
  try {
    const url = `https://www.eventbriteapi.com/v3/events/search/?location.latitude=${lat}&location.longitude=${lng}&location.within=${radiusKm}km&expand=venue&token=${EVENTBRITE_KEY}`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const json = await res.json();
    const events = json.events ?? [];

    return events.slice(0, 10).map((e: any) => ({
      id: e.id,
      name: e.name?.text ?? '',
      description: e.description?.text?.slice(0, 200) ?? null,
      date: e.start?.local?.split('T')[0] ?? '',
      venue: e.venue?.name ?? null,
      address: e.venue?.address?.localized_address_display ?? null,
      lat: parseFloat(e.venue?.latitude) || null,
      lng: parseFloat(e.venue?.longitude) || null,
      priceMin: null,
      priceMax: null,
      imageUrl: e.logo?.url ?? null,
      ticketUrl: e.url ?? null,
      source: 'eventbrite',
    }));
  } catch {
    return [];
  }
}
