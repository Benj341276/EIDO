export const darkColors = {
  background: '#0A0A0A',
  surface: '#141414',
  surfaceElevated: '#1A1A1A',
  white: '#FFFFFF',
  black: '#000000',
  textPrimary: '#FFFFFF',
  textSecondary: '#888888',
  textTertiary: '#555555',
  accent: '#2D7FF9',
  accentLight: '#5C9DFF',
  accentMuted: 'rgba(45, 127, 249, 0.15)',
  success: '#00C48C',
  error: '#FF4757',
  border: '#222222',
  borderLight: '#333333',
} as const;

export const lightColors = {
  background: '#FFFFFF',
  surface: '#F2F2F7',
  surfaceElevated: '#E5E5EA',
  white: '#FFFFFF',
  black: '#000000',
  textPrimary: '#0A0A0A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  accent: '#2D7FF9',
  accentLight: '#5C9DFF',
  accentMuted: 'rgba(45, 127, 249, 0.08)',
  success: '#00C48C',
  error: '#FF4757',
  border: '#D1D1D6',
  borderLight: '#C7C7CC',
} as const;

export type ThemeColors = { [K in keyof typeof darkColors]: string };

// Default for backward compat
export const colors = darkColors;
