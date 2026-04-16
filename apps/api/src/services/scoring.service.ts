import type { PlanItem, UserPreferences } from '@eido-life/shared';

export interface ScoredItem {
  item: PlanItem;
  score: number; // 0–1
  breakdown: {
    taste: number;
    distance: number;
    budget: number;
    rating: number;
    timing: number;
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Strips Google Places suffixes: "italian_restaurant" → "italian", "pizza_place" → "pizza"
function normalizeCuisineKey(raw: string): string {
  return raw.replace(/_restaurant$/, '').replace(/_place$/, '').replace(/_cafe$/, '');
}

function scoreTaste(item: PlanItem, userPrefs: UserPreferences): number {
  if (item.category === 'event') return 0.5;

  if (item.category === 'restaurant') {
    const cuisine = item.metadata.cuisine;
    // TODO: remove — temporary cuisine debug
    console.log(`[TASTE] ${item.name} | metadata.cuisine=${JSON.stringify(cuisine)} | userPrefs.cuisines=${JSON.stringify(userPrefs.cuisines)}`);
    if (typeof cuisine !== 'string') return 0.0;
    const normalized = normalizeCuisineKey(cuisine);
    if (userPrefs.cuisines.includes(normalized)) return 1.0;
    if (userPrefs.cuisines.some((c: string) => c.includes(normalized) || normalized.includes(c))) return 0.5;
    return 0.0;
  }

  // activity
  const detail = item.metadata.category_detail;
  const key = typeof detail === 'string' ? detail : item.category;
  if (userPrefs.activities.includes(key)) return 1.0;
  if (userPrefs.activities.some((a: string) => a.includes(key) || key.includes(a))) return 0.5;
  return 0.0;
}

function scoreDistance(
  item: PlanItem,
  userPrefs: UserPreferences,
  userLat: number,
  userLng: number,
): number {
  if (item.location === null) return 0;
  const maxDist = userPrefs.default_radius_km * 1000;
  if (maxDist === 0) return 0;
  const dist = haversineMeters(userLat, userLng, item.location.lat, item.location.lng);
  return Math.max(0, 1 - dist / maxDist);
}

const BUDGET_MAX: Record<string, number> = {
  budget: 1,
  moderate: 2,
  premium: 3,
  luxury: 4,
};

function costToLevel(cost: number): number {
  if (cost <= 15) return 1;
  if (cost <= 35) return 2;
  if (cost <= 70) return 3;
  return 4;
}

function scoreBudget(item: PlanItem, userPrefs: UserPreferences): number {
  if (userPrefs.budget_level === null) return 0.5;
  const budgetMax = BUDGET_MAX[userPrefs.budget_level];

  let effectiveLevel: number | null = null;
  if (item.estimated_cost !== null) {
    effectiveLevel = costToLevel(item.estimated_cost);
  } else if (item.price_level !== null) {
    effectiveLevel = item.price_level;
  }

  if (effectiveLevel === null) return 0.5;
  if (effectiveLevel <= budgetMax) return 1.0;

  const ceiling = Math.round(budgetMax * 1.5);
  if (effectiveLevel > ceiling) return 0.0;

  return 1 - (effectiveLevel - budgetMax) / (ceiling - budgetMax);
}

function scoreRating(item: PlanItem): number {
  return (item.rating ?? 3) / 5;
}

function inRange(h: number, start: number, end: number): boolean {
  if (start <= end) return h >= start && h < end;
  return h >= start || h < end; // wraps midnight
}

function detectNightlife(item: PlanItem): boolean {
  const detail = item.metadata.category_detail;
  const detailStr = typeof detail === 'string' ? detail.toLowerCase() : '';
  if (detailStr.includes('nightlife') || detailStr.includes('bar') || detailStr.includes('club')) {
    return true;
  }
  const name = item.name.toLowerCase();
  return name.includes('bar') || name.includes('club');
}

function scoreTiming(item: PlanItem, currentHour: number, targetHour?: number): number {
  const target = targetHour ?? (currentHour + 1) % 24;

  if (item.category === 'event') return 0.6;

  if (item.category === 'restaurant') {
    return inRange(target, 12, 14) || inRange(target, 19, 23) ? 1.0 : 0.5;
  }

  // activity
  if (detectNightlife(item)) {
    return inRange(target, 18, 2) ? 1.0 : 0.2; // 18h–02h wraps midnight
  }
  return inRange(target, 10, 18) ? 1.0 : 0.1;
}

// ── Main export ─────────────────────────────────────────────────────────────

export function scorePlanItems(
  items: PlanItem[],
  userPrefs: UserPreferences,
  userLat: number,
  userLng: number,
  currentHour: number,
  targetHour?: number,
  // TODO: integrate weather-based score adjustments in a future iteration
  _weather?: { isRaining: boolean; tempCelsius: number },
): ScoredItem[] {
  const scored = items
    .map((item) => {
      const taste = scoreTaste(item, userPrefs);
      const distance = scoreDistance(item, userPrefs, userLat, userLng);
      const budget = scoreBudget(item, userPrefs);
      const rating = scoreRating(item);
      const timing = scoreTiming(item, currentHour, targetHour);
      const score =
        0.4 * taste + 0.2 * distance + 0.15 * budget + 0.15 * rating + 0.1 * timing;
      return { item, score, breakdown: { taste, distance, budget, rating, timing } };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);

  // TODO: remove — temporary scoring debug
  for (const { item, score, breakdown } of scored) {
    console.log(`[SCORING] ${item.name} (${item.category}) → ${score.toFixed(2)}`, breakdown);
  }

  return scored;
}
