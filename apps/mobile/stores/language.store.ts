import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

export type Language = 'fr' | 'en' | 'es' | 'de';

const SUPPORTED: Language[] = ['fr', 'en', 'es', 'de'];

function detectDeviceLanguage(): Language {
  const locales = getLocales();
  const deviceLang = locales[0]?.languageCode ?? 'fr';
  return SUPPORTED.includes(deviceLang as Language) ? (deviceLang as Language) : 'fr';
}

interface LanguageState {
  language: Language;
  _hydrated: boolean;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: detectDeviceLanguage(),
      _hydrated: false,
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'eido-language',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useLanguageStore.setState({ _hydrated: true });
      },
    }
  )
);
