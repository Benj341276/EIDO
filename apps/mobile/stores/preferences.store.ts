import { create } from 'zustand';
import { getSupabase } from '@/lib/supabase';
import { useAuthStore } from './auth.store';
import type { UserPreferences } from '@eido-life/shared';

interface OnboardingDraft {
  cuisines: string[];
  music_genres: string[];
  activities: string[];
  life_rhythm: string | null;
  budget_level: string | null;
  mobility_mode: string | null;
  default_radius_km: number;
  dietary_restrictions: string[];
}

const emptyDraft: OnboardingDraft = {
  cuisines: [],
  music_genres: [],
  activities: [],
  life_rhythm: null,
  budget_level: null,
  mobility_mode: null,
  default_radius_km: 5,
  dietary_restrictions: [],
};

interface PreferencesState {
  preferences: UserPreferences | null;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  draft: OnboardingDraft;

  loadPreferences: () => Promise<void>;
  updateDraft: (partial: Partial<OnboardingDraft>) => void;
  resetDraft: () => void;
  submitPreferences: () => Promise<{ error?: string }>;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  preferences: null,
  hasCompletedOnboarding: false,
  isLoading: true,
  draft: { ...emptyDraft },

  loadPreferences: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      set({ isLoading: false });
      return;
    }

    const { data, error } = await getSupabase()
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data && !error) {
      set({
        preferences: data as UserPreferences,
        hasCompletedOnboarding: data.onboarding_completed,
        isLoading: false,
      });
    } else {
      set({ preferences: null, hasCompletedOnboarding: false, isLoading: false });
    }
  },

  updateDraft: (partial) => {
    set((state) => ({ draft: { ...state.draft, ...partial } }));
  },

  resetDraft: () => {
    set({ draft: { ...emptyDraft } });
  },

  submitPreferences: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return { error: 'Not authenticated' };

    const { draft } = get();

    const { error } = await getSupabase()
      .from('user_preferences')
      .insert({
        user_id: userId,
        ...draft,
        onboarding_completed: true,
      });

    if (error) return { error: error.message };

    await get().loadPreferences();
    return {};
  },
}));
