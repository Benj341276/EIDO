import { useThemeStore } from '@/stores/theme.store';
import { darkColors, lightColors, ThemeColors } from './colors';

export function useColors(): ThemeColors {
  const mode = useThemeStore((s) => s.mode);
  return mode === 'dark' ? darkColors : lightColors;
}
