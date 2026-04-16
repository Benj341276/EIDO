import { create } from 'zustand';
import { getSupabase } from '@/lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export interface PlanItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
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
  metadata: Record<string, any> | null;
  sort_order: number;
  is_visible: boolean;
}

interface PlanState {
  planId: string | null;
  items: PlanItem[];
  totalCost: { min: number; max: number; currency: string } | null;
  planLocation: { lat: number; lng: number } | null;
  planRadiusKm: number | null;
  isGenerating: boolean;
  error: string | null;
  revealedCategories: string[];

  generatePlan: (lat: number, lng: number, radiusKm: number, language: string, locationName?: string) => Promise<void>;
  setActivePlan: (items: PlanItem[], location: { lat: number; lng: number }, radiusKm: number) => void;
  revealCategory: (category: string) => void;
  clear: () => void;
}

export const usePlanStore = create<PlanState>((set) => ({
  planId: null,
  items: [],
  totalCost: null,
  planLocation: null,
  planRadiusKm: null,
  isGenerating: false,
  error: null,
  revealedCategories: [],

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
        planLocation: { lat, lng },
        planRadiusKm: radiusKm,
        isGenerating: false,
        revealedCategories: [],
      });
    } catch (err: any) {
      set({ error: err.message ?? 'Generation failed', isGenerating: false });
    }
  },

  setActivePlan: (items, location, radiusKm) => {
    set({ items, planLocation: location, planRadiusKm: radiusKm, revealedCategories: [] });
  },

  revealCategory: (category) => {
    set((state) => ({
      revealedCategories: state.revealedCategories.includes(category)
        ? state.revealedCategories
        : [...state.revealedCategories, category],
    }));
  },

  clear: () => {
    set({ planId: null, items: [], totalCost: null, planLocation: null, planRadiusKm: null, isGenerating: false, error: null, revealedCategories: [] });
  },
}));
