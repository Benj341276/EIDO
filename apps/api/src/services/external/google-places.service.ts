const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const BASE_URL = 'https://places.googleapis.com/v1/places:searchNearby';

// In-memory cache: key = "lat,lng,radius,type" → { data, expiry }
const cache = new Map<string, { data: PlaceResult[]; expiry: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

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
}

const TYPE_MAP: Record<string, string[]> = {
  restaurant: ['restaurant', 'cafe', 'bar', 'bakery'],
  activity: ['museum', 'art_gallery', 'park', 'gym', 'spa', 'movie_theater', 'bowling_alley', 'amusement_park', 'zoo', 'aquarium', 'stadium', 'tourist_attraction'],
};

function cacheKey(lat: number, lng: number, radius: number, category: string): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)},${radius},${category}`;
}

export async function searchNearby(
  lat: number,
  lng: number,
  radiusKm: number,
  category: 'restaurant' | 'activity',
): Promise<PlaceResult[]> {
  const key = cacheKey(lat, lng, radiusKm, category);
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) return cached.data;

  const radiusMeters = Math.min(radiusKm * 1000, 50000);
  const includedTypes = TYPE_MAP[category] ?? ['restaurant'];

  try {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.types,places.photos,places.googleMapsUri,places.websiteUri',
      },
      body: JSON.stringify({
        includedTypes,
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
      }),
    });

    if (!res.ok) {
      console.error('[GooglePlaces] Error:', res.status, await res.text());
      return [];
    }

    const json = await res.json();
    const places: PlaceResult[] = (json.places ?? []).map((p: any) => ({
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
    }));

    cache.set(key, { data: places, expiry: Date.now() + CACHE_TTL });
    return places;
  } catch (err) {
    console.error('[GooglePlaces] Fetch error:', err);
    return [];
  }
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
