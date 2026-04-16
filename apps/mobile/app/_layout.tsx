import { useEffect, useRef } from 'react';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';
import { useAuthStore } from '@/stores/auth.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useThemeStore } from '@/stores/theme.store';
import { useLanguageStore } from '@/stores/language.store';
import { useColors } from '@/theme/useColors';

// Display notifications when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const colors = useColors();
  const themeMode = useThemeStore((s) => s.mode);
  const langHydrated = useLanguageStore((s) => s._hydrated);
  const { isAuthenticated, isLoading: authLoading, initialize: initAuth } = useAuthStore();
  const { hasCompletedOnboarding, isLoading: prefsLoading, loadPreferences } = usePreferencesStore();
  const segments = useSegments();
  const router = useRouter();
  const lastRedirect = useRef('');

  useEffect(() => {
    lastRedirect.current = '';
  }, [segments]);

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadPreferences();
      Notifications.requestPermissionsAsync();
    }
  }, [isAuthenticated]);

  // Navigate to RateVisit when user taps a notification
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      const planId = response.notification.request.content.data?.planId as string | undefined;
      if (planId) {
        router.push({ pathname: '/plan/rate-visit', params: { planId } });
      }
    });
    return () => subscription.remove();
  }, []);

  const isLoading = !langHydrated || authLoading || (isAuthenticated && prefsLoading);

  useEffect(() => {
    if (isLoading) return;

    const currentRoute = segments[0] ?? '';
    let target = '';

    if (!isAuthenticated) {
      if (currentRoute !== '(auth)') target = '/(auth)/welcome';
    } else if (!hasCompletedOnboarding) {
      if (currentRoute !== '(onboarding)') target = '/(onboarding)/step1-cuisines';
    } else {
      if (currentRoute === '(auth)' || currentRoute === '(onboarding)') {
        target = '/(tabs)';
      }
    }

    if (target && target !== lastRedirect.current) {
      lastRedirect.current = target;
      router.replace(target as any);
    }
  }, [isAuthenticated, isLoading, hasCompletedOnboarding, segments]);

  if (isLoading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="plan/results" options={{ presentation: 'modal' }} />
        <Stack.Screen name="plan/rate-visit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="plan/item/[itemId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="profile/edit-preferences" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}
