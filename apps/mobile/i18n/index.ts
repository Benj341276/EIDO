import { useLanguageStore, Language } from '@/stores/language.store';
import { fr } from './fr';
import { en } from './en';
import { es } from './es';
import { de } from './de';

const translations: Record<Language, Record<string, string>> = { fr, en, es, de };

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  const strings = translations[language];

  function t(key: string): string {
    return strings[key] ?? translations.fr[key] ?? key;
  }

  return { t, language };
}

export type { Language };
