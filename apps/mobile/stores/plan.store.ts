import { create } from 'zustand';
import { streamSSE } from '@/lib/sse-client';

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
  status: string;
  error: string | null;

  generatePlan: (lat: number, lng: number, radiusKm: number, language: string, locationName?: string) => Promise<void>;
  clear: () => void;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  planId: null,
  items: [],
  totalCost: null,
  isGenerating: false,
  status: '',
  error: null,

  generatePlan: async (lat, lng, radiusKm, language, locationName) => {
    set({ isGenerating: true, items: [], planId: null, totalCost: null, error: null, status: 'searching_places' });

    try {
      const stream = streamSSE('/plans/generate', {
        latitude: lat,
        longitude: lng,
        radius_km: radiusKm,
        location_name: locationName,
        language,
      });

      for await (const event of stream) {
        switch (event.event) {
          case 'status':
            set({ status: event.data.message });
            break;
          case 'plan_item':
            set((state) => ({ items: [...state.items, event.data as PlanItem] }));
            break;
          case 'plan_complete':
            set({
              planId: event.data.plan_id,
              totalCost: event.data.total_cost,
              isGenerating: false,
              status: 'completed',
            });
            break;
          case 'error':
            set({ error: event.data.message, isGenerating: false, status: 'error' });
            break;
        }
      }
    } catch (err: any) {
      set({ error: err.message ?? 'Generation failed', isGenerating: false, status: 'error' });
    }
  },

  clear: () => {
    set({ planId: null, items: [], totalCost: null, isGenerating: false, status: '', error: null });
  },
}));
