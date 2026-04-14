import { z } from 'zod';

export const PreferencesSchema = z.object({
  cuisines: z.array(z.string()).min(1, 'Select at least one cuisine'),
  music_genres: z.array(z.string()).default([]),
  activities: z.array(z.string()).default([]),
  life_rhythm: z.enum(['early_bird', 'night_owl', 'flexible']).nullable().default(null),
  budget_level: z.enum(['budget', 'moderate', 'premium', 'luxury']).nullable().default(null),
  mobility_mode: z.enum(['walking', 'cycling', 'driving', 'transit']).nullable().default(null),
  default_radius_km: z.number().min(1).max(50).default(5),
  dietary_restrictions: z.array(z.string()).default([]),
  onboarding_completed: z.boolean().default(false),
});

export const PreferencesUpdateSchema = PreferencesSchema.partial();

export type PreferencesSchemaInput = z.infer<typeof PreferencesSchema>;
export type PreferencesUpdateInput = z.infer<typeof PreferencesUpdateSchema>;
