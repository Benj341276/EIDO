import type { UserPreferences } from './preferences';

export type PlanMode = 'local' | 'travel';
export type PlanStatus = 'generating' | 'completed' | 'failed';
export type PlanCategory = 'restaurant' | 'activity' | 'event';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Plan {
  id: string;
  user_id: string;
  mode: PlanMode;
  location: GeoPoint;
  location_name: string | null;
  radius_km: number;
  preferences_snapshot: Partial<UserPreferences>;
  status: PlanStatus;
  total_estimated_cost: number | null;
  created_at: string;
  updated_at: string;
}

export interface PlanItem {
  id: string;
  plan_id: string;
  category: PlanCategory;
  name: string;
  description: string | null;
  address: string | null;
  location: GeoPoint | null;
  rating: number | null;        // Note Google Places (lecture seule)
  user_rating: number | null;  // Note laissée par l'utilisateur après visite (1-5)
  price_level: 1 | 2 | 3 | 4 | null;
  estimated_cost: number | null;
  duration_minutes: number | null;
  image_url: string | null;
  external_url: string | null;
  external_id: string | null;
  external_source: string | null;
  metadata: Record<string, unknown>;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

export interface CostEstimate {
  min: number;
  max: number;
  currency: string;
}

export interface PlanWithItems extends Plan {
  items: PlanItem[];
  cost_estimate: CostEstimate | null;
}
