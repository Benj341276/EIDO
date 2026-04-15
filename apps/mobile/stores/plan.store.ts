import { create } from 'zustand';
import { getSupabase } from '@/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export interface PlanItem {
  id: string;
  category: string;
  name: string;
  reason: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  price_level: number | null;
  estimated_cost: number | null;
  duration_minutes: number | null;
  image_url: string | null;
  external_url: string | null;
  sort_order: number;
}

interface PlanState {
  planId: string | null;
  items: PlanItem[];
  totalCost: { min: number; max: number; currency: string } | null;
  isGenerating: boolean;
  error: string | null;

  generatePlan: (lat: number, lng: number, radiusKm: number, language: string, locationName?: string) => Promise<void>;
  clear: () => void;
}

export const usePlanStore = create<PlanState>((set) => ({
  planId: null,
  items: [],
  totalCost: null,
  isGenerating: false,
  error: null,

  generatePlan: async (lat, lng, radiusKm, language, locationName) => {
    set({ isGenerating: true, items: [], planId: null, totalCost: null, error: null });

    try {
      const { data: sessionData } = await getSupabase().auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(`${API_URL}/plans/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          radius_km: radiusKm,
          location_name: locationName,
          language,
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(`API ${res.status}: ${text.slice(0, 300)}`);
      }

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Réponse invalide: ${text.slice(0, 300)}`);
      }

      set({
        planId: data.plan_id,
        items: data.items ?? [],
        totalCost: data.total_cost,
        isGenerating: false,
      });
    } catch (err: any) {
      set({ error: err.message ?? 'Generation failed', isGenerating: false });
    }
  },

  clear: () => {
    set({ planId: null, items: [], totalCost: null, isGenerating: false, error: null });
  },
}));
