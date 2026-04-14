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

    // Validate session is still valid server-side
    if (data.session) {
      const { data: userData, error } = await client.auth.getUser(data.session.access_token);
      if (error || !userData.user) {
        // Session invalid (user deleted, token expired) — clear it
        await client.auth.signOut();
        set({ session: null, user: null, isAuthenticated: false, isLoading: false });
        return;
      }
    }

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
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.session) {
      set({ session: data.session, user: data.session.user, isAuthenticated: true });
    }
    return {};
  },

  signUpWithEmail: async (email, password) => {
    const { data, error } = await getSupabase().auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.session) {
      set({ session: data.session, user: data.session.user, isAuthenticated: true });
    }
    return {};
  },

  signOut: async () => {
    await getSupabase().auth.signOut();
    set({ session: null, user: null, isAuthenticated: false });
  },
}));
