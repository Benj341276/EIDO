import { useState, useEffect } from 'react';
import { View, Pressable, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Text, ScreenContainer } from '@/components/ui';
import { usePlanStore } from '@/stores/plan.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useTranslation } from '@/i18n';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';

const RADIUS_OPTIONS = [1, 3, 5, 10, 25, 50] as const;

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t, language } = useTranslation();
  const { isGenerating, generatePlan } = usePlanStore();
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

  // On mount: check existing permission without prompting
  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
      // If not determined or denied, stay silent — error shown only after CTA tap
    })();
  }, []);

  async function handleGenerate() {
    // Request permission if not yet granted
    if (!location) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError(t('home.locationDenied'));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      await generatePlan(loc.coords.latitude, loc.coords.longitude, radius, language);
    } else {
      await generatePlan(location.lat, location.lng, radius, language);
    }
    if (!usePlanStore.getState().error) {
      router.push('/plan/results');
    }
  }

  return (
    <ScreenContainer scroll={false} padding={false}>
      <View style={{ flex: 1, alignItems: 'center', padding: spacing.lg }}>
        {/* Logo — haut de l'écran */}
        <Image source={require('@/assets/images/eido-logo.png')} style={{ width: 280, height: 140, marginTop: spacing.xl }} resizeMode="contain" />

        {/* CTA Button — centré dans l'espace restant */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <Animated.View style={pulseStyle}>
          <Pressable
            onPress={handleGenerate}
            disabled={isGenerating}
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: isGenerating ? colors.surface : colors.accent,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: 1,
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
          <View style={{ marginTop: spacing.md, alignItems: 'center', gap: 4 }}>
            <Text variant="caption" color={colors.error}>{locationError}</Text>
            {typeof window !== 'undefined' ? (
              <Text variant="caption" color={colors.textSecondary} align="center">
                Autorisez la localisation dans les réglages de votre navigateur
              </Text>
            ) : (
              <Pressable onPress={() => Linking.openSettings()}>
                <Text variant="caption" color={colors.accent}>Ouvrir les Réglages →</Text>
              </Pressable>
            )}
          </View>
        ) : null}

        {usePlanStore.getState().error ? (
          <Text variant="caption" color={colors.error} style={{ marginTop: spacing.md }} align="center">{usePlanStore.getState().error}</Text>
        ) : null}

        </View>
        {/* Radius selector */}
        <View style={{ marginTop: spacing['2xl'], gap: spacing.sm, width: '100%', alignItems: 'center' }}>
          <Text variant="label" color={colors.textSecondary}>
            {t('home.radius') || 'Rayon'} : {radius} km
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm }}>
            {RADIUS_OPTIONS.map((r) => (
              <Pressable
                key={r}
                onPress={() => setRadius(r)}
                style={{
                  minWidth: 52,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: radius === r ? colors.accent : colors.border,
                  backgroundColor: radius === r ? colors.accentMuted : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text variant="caption" weight="medium" color={radius === r ? colors.accent : colors.textSecondary}>
                  {r} km
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
