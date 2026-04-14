import { useEffect } from 'react';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useAuthStore } from '@/stores/auth.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useThemeStore } from '@/stores/theme.store';
import { useLanguageStore } from '@/stores/language.store';
import { useColors } from '@/theme/useColors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colors = useColors();
  const themeMode = useThemeStore((s) => s.mode);
  const language = useLanguageStore((s) => s.language);
  const { isAuthenticated, isLoading: authLoading, initialize: initAuth } = useAuthStore();
  const { hasCompletedOnboarding, isLoading: prefsLoading, loadPreferences } = usePreferencesStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadPreferences();
    }
  }, [isAuthenticated]);

  const isLoading = authLoading || (isAuthenticated && prefsLoading);

  useEffect(() => {
    if (isLoading) return;
    SplashScreen.hideAsync();

    const currentRoute = segments[0];
    const inLangSelector = currentRoute === 'language-selector';
    const inAuthGroup = currentRoute === '(auth)';
    const inOnboardingGroup = currentRoute === '(onboarding)';

    // Step 1: Language not chosen yet
    if (!language && !inLangSelector) {
      router.replace('/language-selector');
      return;
    }

    // Step 2: Not authenticated
    if (language && !isAuthenticated && !inAuthGroup && !inLangSelector) {
      router.replace('/(auth)/welcome');
      return;
    }

    // Step 3: Authenticated, coming from auth
    if (isAuthenticated && inAuthGroup) {
      if (!hasCompletedOnboarding) {
        router.replace('/(onboarding)/step1-cuisines');
      } else {
        router.replace('/(tabs)');
      }
      return;
    }

    // Step 4: Authenticated, no onboarding done
    if (isAuthenticated && !hasCompletedOnboarding && !inOnboardingGroup) {
      router.replace('/(onboarding)/step1-cuisines');
      return;
    }

    // Step 5: Authenticated, onboarding done, still in onboarding
    if (isAuthenticated && hasCompletedOnboarding && inOnboardingGroup) {
      router.replace('/(tabs)');
      return;
    }
  }, [isAuthenticated, isLoading, hasCompletedOnboarding, language, segments]);

  if (isLoading) return null;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="language-selector" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile/edit-preferences" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
