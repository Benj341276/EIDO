import { z } from 'zod';

export const GeneratePlanSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius_km: z.number().min(1).max(50),
  location_name: z.string().optional(),
});

export const FeedbackSchema = z.object({
  liked: z.boolean().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  visited: z.boolean().optional(),
});

export type GeneratePlanInput = z.infer<typeof GeneratePlanSchema>;
export type FeedbackSchemaInput = z.infer<typeof FeedbackSchema>;
