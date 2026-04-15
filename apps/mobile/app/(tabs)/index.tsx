import { useState, useEffect } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Text, ScreenContainer } from '@/components/ui';
import { usePlanStore } from '@/stores/plan.store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useTranslation } from '@/i18n';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';

const RADIUS_OPTIONS = [1, 3, 5, 10, 25, 50] as const;

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t, language } = useTranslation();
  const { isGenerating, generatePlan, items } = usePlanStore();
  const preferences = usePreferencesStore((s) => s.preferences);
  const [radius, setRadius] = useState(preferences?.default_radius_km ?? 5);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState('');

  // Pulse animation for CTA
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 1500 }), withTiming(1, { duration: 1500 })),
      -1,
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  // Get location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError(t('home.locationDenied') || 'Location access denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
  }, []);

  const [debugMsg, setDebugMsg] = useState('');

  async function handleGenerate() {
    if (!location) return;
    setDebugMsg('Appel API...');

    // Test connectivity first
    try {
      const healthRes = await fetch(`${API_URL.replace('/api/v1', '')}/health`);
      const healthText = await healthRes.text();
      setDebugMsg(`Health: ${healthText}`);
    } catch (err: any) {
      setDebugMsg(`Connexion échouée: ${err.message}`);
      return;
    }

    await generatePlan(location.lat, location.lng, radius, language);
    if (usePlanStore.getState().error) {
      setDebugMsg(`Erreur: ${usePlanStore.getState().error}`);
    } else {
      router.push('/plan/results');
    }
  }

  return (
    <ScreenContainer scroll={false} padding={false}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
        {/* CTA Button */}
        <Animated.View style={pulseStyle}>
          <Pressable
            onPress={handleGenerate}
            disabled={isGenerating || !location}
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: isGenerating ? colors.surface : colors.accent,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: !location ? 0.5 : 1,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 30,
              elevation: 10,
            }}
          >
            <Text variant="h3" color={colors.white} align="center">
              {isGenerating ? '...' : t('home.generatePlan') || 'Go'}
            </Text>
          </Pressable>
        </Animated.View>

        {locationError ? (
          <Text variant="caption" color={colors.error} style={{ marginTop: spacing.md }}>{locationError}</Text>
        ) : null}

        {debugMsg ? (
          <Text variant="caption" color={colors.accent} style={{ marginTop: spacing.md, paddingHorizontal: spacing.md }} align="center">{debugMsg}</Text>
        ) : null}

        {/* Radius selector */}
        <View style={{ marginTop: spacing['2xl'], gap: spacing.sm, alignItems: 'center' }}>
          <Text variant="label" color={colors.textSecondary}>
            {t('home.radius') || 'Rayon'} : {radius} km
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.sm }}>
            {RADIUS_OPTIONS.map((r) => (
              <Pressable
                key={r}
                onPress={() => setRadius(r)}
                style={{
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: radius === r ? colors.accent : colors.border,
                  backgroundColor: radius === r ? colors.accentMuted : 'transparent',
                }}
              >
                <Text variant="caption" weight="medium" color={radius === r ? colors.accent : colors.textSecondary}>
                  {r} km
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </ScreenContainer>
  );
}
