export type LifeRhythm = 'early_bird' | 'night_owl' | 'flexible';
export type BudgetLevel = 'budget' | 'moderate' | 'premium' | 'luxury';
export type MobilityMode = 'walking' | 'cycling' | 'driving' | 'transit';

export interface UserPreferences {
  id: string;
  user_id: string;
  cuisines: string[];
  music_genres: string[];
  activities: string[];
  life_rhythm: LifeRhythm | null;
  budget_level: BudgetLevel | null;
  mobility_mode: MobilityMode | null;
  default_radius_km: number;
  dietary_restrictions: string[];
  onboarding_completed: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type PreferencesInput = Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
