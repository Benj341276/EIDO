import { useEffect } from 'react';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useAuthStore } from '@/stores/auth.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useThemeStore } from '@/stores/theme.store';
import { useColors } from '@/theme/useColors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colors = useColors();
  const themeMode = useThemeStore((s) => s.mode);
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

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (isAuthenticated && inAuthGroup) {
      if (!hasCompletedOnboarding) {
        router.replace('/(onboarding)/step1-cuisines');
      } else {
        router.replace('/(tabs)');
      }
    } else if (isAuthenticated && !hasCompletedOnboarding && !inOnboardingGroup) {
      router.replace('/(onboarding)/step1-cuisines');
    } else if (isAuthenticated && hasCompletedOnboarding && inOnboardingGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, hasCompletedOnboarding, segments]);

  if (isLoading) return null;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile/edit-preferences" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
