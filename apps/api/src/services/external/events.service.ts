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
const PREDICTHQ_KEY = process.env.PREDICTHQ_API_KEY;

export async function searchEvents(
  lat: number,
  lng: number,
  radiusKm: number,
  cityName?: string,
): Promise<EventResult[]> {
  // PredictHQ as primary (best coverage, especially France)
  // Ticketmaster as supplement for concert details/tickets
  const [predictResults, ticketmasterResults] = await Promise.all([
    PREDICTHQ_KEY ? searchPredictHQ(lat, lng, radiusKm) : Promise.resolve([]),
    TICKETMASTER_KEY ? searchTicketmaster(lat, lng, radiusKm, cityName) : Promise.resolve([]),
  ]);

  // Merge and deduplicate by name similarity
  const allEvents = [...predictResults];
  for (const tm of ticketmasterResults) {
    const isDuplicate = allEvents.some(
      (e) => e.name.toLowerCase().includes(tm.name.toLowerCase().slice(0, 15)) ||
             tm.name.toLowerCase().includes(e.name.toLowerCase().slice(0, 15))
    );
    if (!isDuplicate) allEvents.push(tm);
  }

  // Sort by date, limit to 15
  return allEvents
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 15);
}

// --- PredictHQ (primary) ---

async function searchPredictHQ(lat: number, lng: number, radiusKm: number): Promise<EventResult[]> {
  try {
    const now = new Date().toISOString().split('T')[0];
    const monthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const offsetKm = `${radiusKm}km`;

    const url = `https://api.predicthq.com/v1/events/?location_around.origin=${lat},${lng}&location_around.offset=${offsetKm}&start.gte=${now}&start.lte=${monthLater}&category=concerts,festivals,performing-arts,sports,community,expos&limit=10&sort=start`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${PREDICTHQ_KEY}` },
    });
    if (!res.ok) {
      console.error('[PredictHQ] Error:', res.status);
      return [];
    }

    const json = await res.json();
    return (json.results ?? []).map((e: any) => ({
      id: `phq_${e.id}`,
      name: e.title,
      description: e.description?.slice(0, 200) ?? null,
      date: e.start?.split('T')[0] ?? '',
      venue: e.entities?.[0]?.name ?? null,
      address: e.location?.[1] ? `${e.location[1]}, ${e.location[0]}` : null,
      lat: e.location?.[1] ?? null,
      lng: e.location?.[0] ?? null,
      priceMin: null,
      priceMax: null,
      imageUrl: null,
      ticketUrl: null,
      source: 'predicthq',
    }));
  } catch (err) {
    console.error('[PredictHQ] Fetch error:', err);
    return [];
  }
}

// --- Ticketmaster (supplement) ---

async function searchTicketmaster(lat: number, lng: number, radiusKm: number, cityName?: string): Promise<EventResult[]> {
  let results = await searchTicketmasterByGeo(lat, lng, radiusKm);
  if (results.length === 0 && cityName) {
    results = await searchTicketmasterByCity(cityName);
  }
  return results;
}

async function searchTicketmasterByGeo(lat: number, lng: number, radiusKm: number): Promise<EventResult[]> {
  try {
    const radiusMiles = Math.round(radiusKm * 0.621371);
    const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    const monthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().replace(/\.\d+Z$/, 'Z');

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_KEY}&latlong=${lat},${lng}&radius=${radiusMiles}&unit=miles&size=10&sort=date,asc&startDateTime=${now}&endDateTime=${monthLater}`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const json = await res.json();
    return parseTicketmasterEvents(json);
  } catch {
    return [];
  }
}

async function searchTicketmasterByCity(city: string): Promise<EventResult[]> {
  try {
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_KEY}&city=${encodeURIComponent(city)}&size=10&sort=date,asc`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const json = await res.json();
    return parseTicketmasterEvents(json);
  } catch {
    return [];
  }
}

function parseTicketmasterEvents(json: any): EventResult[] {
  const events = json._embedded?.events ?? [];
  return events.map((e: any) => ({
    id: `tm_${e.id}`,
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
}
