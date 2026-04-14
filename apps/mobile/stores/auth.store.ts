import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    if (!isSupabaseConfigured) {
      set({ isLoading: false });
      return;
    }

    const client = getSupabase();
    const { data } = await client.auth.getSession();
    set({
      session: data.session,
      user: data.session?.user ?? null,
      isAuthenticated: !!data.session,
      isLoading: false,
    });

    client.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
      });
    });
  },

  signInWithEmail: async (email, password) => {
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  },

  signUpWithEmail: async (email, password) => {
    const { error } = await getSupabase().auth.signUp({ email, password });
    if (error) return { error: error.message };
    return {};
  },

  signOut: async () => {
    await getSupabase().auth.signOut();
    set({ session: null, user: null, isAuthenticated: false });
  },
}));
