import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getLocales } from 'expo-localization';

const storage = createJSONStorage(() =>
  Platform.OS === 'web' ? localStorage : AsyncStorage
);

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
      // On web, localStorage is synchronous — consider hydrated immediately
      _hydrated: Platform.OS === 'web',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'eido-language',
      storage,
      onRehydrateStorage: () => (state) => {
        // If persisted value is null (legacy) or missing, use device language
        if (!state?.language) {
          useLanguageStore.setState({ language: detectDeviceLanguage(), _hydrated: true });
        } else {
          useLanguageStore.setState({ _hydrated: true });
        }
      },
    }
  )
);
