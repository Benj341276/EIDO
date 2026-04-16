import { describe, it, expect } from 'vitest';
import type { PlanItem, UserPreferences } from '@eido-life/shared';
import { scorePlanItems } from './scoring.service';

// Paris centre
const USER_LAT = 48.8566;
const USER_LNG = 2.3522;

const basePrefs: UserPreferences = {
  id: 'prefs-1',
  user_id: 'user-1',
  cuisines: ['italian'],
  music_genres: [],
  activities: ['museums'],
  life_rhythm: null,
  budget_level: 'moderate', // budgetMax = 2
  mobility_mode: null,
  default_radius_km: 5,
  dietary_restrictions: [],
  onboarding_completed: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

function makePlanItem(overrides: Partial<PlanItem>): PlanItem {
  return {
    id: 'item-default',
    plan_id: 'plan-1',
    category: 'restaurant',
    name: 'Test Item',
    description: null,
    address: null,
    location: { lat: USER_LAT, lng: USER_LNG },
    rating: 4.0,
    price_level: 2,
    estimated_cost: null,
    duration_minutes: null,
    image_url: null,
    external_url: null,
    external_id: null,
    external_source: null,
    metadata: {},
    sort_order: 0,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// Fixtures partagés entre les 3 cas de test
// item1 : match parfait — cuisine exacte, budget ok, proche, rating max, heure déjeuner
const item1 = makePlanItem({
  id: 'item1',
  metadata: { cuisine: 'italian' },
  price_level: 2,
  rating: 5.0,
  location: { lat: 48.8611, lng: 2.3522 }, // ~500m
});

// item2 : match partiel — cuisine absente des prefs, autres facteurs bons
const item2 = makePlanItem({
  id: 'item2',
  metadata: { cuisine: 'mediterranean' },
  price_level: 1,
  rating: 5.0,
  location: { lat: 48.8575, lng: 2.3522 }, // ~100m
});

// item3 : hors budget — cuisine exacte mais price_level=4 avec budget moderate (budgetMax=2, ceiling=3)
const item3 = makePlanItem({
  id: 'item3',
  metadata: { cuisine: 'italian' },
  price_level: 4,
  rating: 1.0,
  location: { lat: 48.8998, lng: 2.3522 }, // ~4.8km
});

describe('scorePlanItems', () => {
  describe('Cas 1 — match parfait', () => {
    it("classe l'item en première position avec les bons breakdown", () => {
      const result = scorePlanItems([item1, item2, item3], basePrefs, USER_LAT, USER_LNG, 12, 13);

      expect(result).toHaveLength(3);
      expect(result[0].item.id).toBe('item1');
      expect(result[0].breakdown.taste).toBe(1);
      expect(result[0].breakdown.budget).toBe(1);
      expect(result[0].breakdown.timing).toBe(1); // 13h = créneau déjeuner
      expect(result[0].score).toBeGreaterThanOrEqual(0.85);
    });
  });

  describe('Cas 2 — match partiel (taste = 0)', () => {
    it("breakdown.taste vaut 0 quand la cuisine n'est pas dans les préférences", () => {
      const result = scorePlanItems([item1, item2, item3], basePrefs, USER_LAT, USER_LNG, 12, 13);

      const scored2 = result.find((r) => r.item.id === 'item2');
      expect(scored2).toBeDefined();
      expect(scored2!.breakdown.taste).toBe(0);
      expect(scored2!.score).toBeLessThan(result[0].score);
    });
  });

  describe('Cas 3 — hors budget', () => {
    it('breakdown.budget vaut 0 et item classé dernier', () => {
      const result = scorePlanItems([item1, item2, item3], basePrefs, USER_LAT, USER_LNG, 12, 13);

      expect(result[2].item.id).toBe('item3');
      expect(result[2].breakdown.budget).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('item sans location → distance = 0, pas de throw', () => {
      const item = makePlanItem({ id: 'no-loc', location: null });
      const [result] = scorePlanItems([item], basePrefs, USER_LAT, USER_LNG, 12);
      expect(result.breakdown.distance).toBe(0);
    });

    it('item sans rating → rating score = 0.6 (défaut 3/5)', () => {
      const item = makePlanItem({ id: 'no-rating', rating: null });
      const [result] = scorePlanItems([item], basePrefs, USER_LAT, USER_LNG, 12);
      expect(result.breakdown.rating).toBeCloseTo(0.6);
    });

    it('budget_level null → budget score = 0.5 (neutre)', () => {
      const prefs: UserPreferences = { ...basePrefs, budget_level: null };
      const item = makePlanItem({ id: 'no-budget-pref' });
      const [result] = scorePlanItems([item], prefs, USER_LAT, USER_LNG, 12);
      expect(result.breakdown.budget).toBe(0.5);
    });

    it('tableau vide → retourne []', () => {
      expect(scorePlanItems([], basePrefs, USER_LAT, USER_LNG, 12)).toEqual([]);
    });
  });
});
