const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const NEARBY_URL = 'https://places.googleapis.com/v1/places:searchNearby';
const TEXT_URL = 'https://places.googleapis.com/v1/places:searchText';

// In-memory cache
const cache = new Map<string, { data: PlaceResult[]; expiry: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  priceLevel: number | null;
  types: string[];
  photoUrl: string | null;
  googleMapsUrl: string | null;
  websiteUrl: string | null;
  openNow: boolean | null;
  todayHours: string | null;
}

const FIELD_MASK = 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.types,places.photos,places.googleMapsUri,places.websiteUri,places.currentOpeningHours';

const TYPE_MAP: Record<string, string[]> = {
  restaurant: ['restaurant'],
  activity: ['museum', 'art_gallery', 'park', 'gym', 'spa', 'movie_theater', 'bowling_alley', 'amusement_park', 'zoo', 'aquarium', 'stadium', 'tourist_attraction'],
};

function cacheKey(...parts: (string | number)[]): string {
  return parts.map(String).join(':');
}

// Standard nearby search
export async function searchNearby(
  lat: number,
  lng: number,
  radiusKm: number,
  category: 'restaurant' | 'activity',
): Promise<PlaceResult[]> {
  const key = cacheKey('nearby', lat.toFixed(3), lng.toFixed(3), radiusKm, category);
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) return cached.data;

  const radiusMeters = Math.min(radiusKm * 1000, 50000);
  const includedTypes = TYPE_MAP[category] ?? ['restaurant'];

  const places = await fetchNearby(lat, lng, radiusMeters, includedTypes);
  const filtered = filterPlaces(places);

  cache.set(key, { data: filtered, expiry: Date.now() + CACHE_TTL });
  return filtered;
}

// Text search for specific cuisine preferences (e.g. "restaurant italien Montpellier")
export async function searchByCuisine(
  lat: number,
  lng: number,
  radiusKm: number,
  cuisineKeys: string[],
): Promise<PlaceResult[]> {
  if (cuisineKeys.length === 0) return [];

  const key = cacheKey('cuisine', lat.toFixed(3), lng.toFixed(3), radiusKm, cuisineKeys.join(','));
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) return cached.data;

  // Search for top 3 preferred cuisines
  const topCuisines = cuisineKeys.slice(0, 3);
  const allResults: PlaceResult[] = [];

  for (const cuisine of topCuisines) {
    const results = await fetchTextSearch(
      `restaurant ${cuisine}`,
      lat, lng, radiusKm * 1000,
    );
    allResults.push(...results);
  }

  // Deduplicate by place ID
  const seen = new Set<string>();
  const unique = allResults.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  const filtered = filterPlaces(unique);
  cache.set(key, { data: filtered, expiry: Date.now() + CACHE_TTL });
  return filtered;
}

// Lookup a venue by name to get its Google Maps URL + website
export async function lookupVenue(
  venueName: string,
  lat: number,
  lng: number,
): Promise<{ googleMapsUrl: string | null; websiteUrl: string | null } | null> {
  const key = cacheKey('venue', venueName, lat.toFixed(2), lng.toFixed(2));
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now() && cached.data[0]) {
    return { googleMapsUrl: cached.data[0].googleMapsUrl, websiteUrl: cached.data[0].websiteUrl };
  }

  const results = await fetchTextSearch(venueName, lat, lng, 10000);
  if (results.length === 0) return null;

  const best = results[0];
  cache.set(key, { data: [best], expiry: Date.now() + CACHE_TTL });
  return { googleMapsUrl: best.googleMapsUrl, websiteUrl: best.websiteUrl };
}

// --- Internal fetch functions ---

async function fetchNearby(lat: number, lng: number, radiusMeters: number, types: string[]): Promise<PlaceResult[]> {
  try {
    const res = await fetch(NEARBY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({
        includedTypes: types,
        maxResultCount: 20,
        rankPreference: 'DISTANCE',
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
      }),
    });

    if (!res.ok) {
      console.error('[GooglePlaces] Nearby error:', res.status, await res.text());
      return [];
    }

    const json = await res.json();
    return parsePlaces(json.places ?? []);
  } catch (err) {
    console.error('[GooglePlaces] Nearby fetch error:', err);
    return [];
  }
}

async function fetchTextSearch(query: string, lat: number, lng: number, radiusMeters: number): Promise<PlaceResult[]> {
  try {
    const res = await fetch(TEXT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 20,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
      }),
    });

    if (!res.ok) {
      console.error('[GooglePlaces] Text search error:', res.status, await res.text());
      return [];
    }

    const json = await res.json();
    return parsePlaces(json.places ?? []);
  } catch (err) {
    console.error('[GooglePlaces] Text search error:', err);
    return [];
  }
}

function parsePlaces(raw: any[]): PlaceResult[] {
  return raw.map((p) => {
    // Google's weekdayDescriptions: index 0 = Monday … 6 = Sunday
    // JS getDay(): 0 = Sunday, 1 = Monday … 6 = Saturday
    const jsDay = new Date().getDay();
    const googleDayIndex = (jsDay + 6) % 7;
    const weekdayDescriptions: string[] = p.currentOpeningHours?.weekdayDescriptions ?? [];
    const todayHours = weekdayDescriptions[googleDayIndex] ?? null;

    return {
      id: p.id,
      name: p.displayName?.text ?? '',
      address: p.formattedAddress ?? '',
      lat: p.location?.latitude ?? 0,
      lng: p.location?.longitude ?? 0,
      rating: p.rating ?? null,
      priceLevel: priceLevelToNumber(p.priceLevel),
      types: p.types ?? [],
      photoUrl: p.photos?.[0]?.name
        ? `https://places.googleapis.com/v1/${p.photos[0].name}/media?key=${API_KEY}&maxWidthPx=400`
        : null,
      googleMapsUrl: p.googleMapsUri ?? null,
      websiteUrl: p.websiteUri ?? null,
      openNow: p.currentOpeningHours?.openNow ?? null,
      todayHours,
    };
  });
}

function filterPlaces(places: PlaceResult[]): PlaceResult[] {
  return places
    .filter((p) => !!p.name)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
}

function priceLevelToNumber(level: string | undefined): number | null {
  const map: Record<string, number> = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };
  return level ? (map[level] ?? null) : null;
}
