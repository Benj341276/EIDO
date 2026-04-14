import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'fr' | 'en' | 'es' | 'de';

interface LanguageState {
  language: Language | null;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: null,
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'eido-language',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
