import { View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Text } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { useColors } from '@/theme/useColors';
import { usePlanStore } from '@/stores/plan.store';
import { spacing } from '@/theme/spacing';

export function PlanLoading() {
  const colors = useColors();
  const { t } = useTranslation();
  const { status, items } = usePlanStore();

  const ring1 = useSharedValue(0.6);
  const ring2 = useSharedValue(0.4);

  useEffect(() => {
    ring1.value = withRepeat(withSequence(withTiming(1, { duration: 1200 }), withTiming(0.6, { duration: 1200 })), -1);
    ring2.value = withRepeat(withSequence(withTiming(0.8, { duration: 1500 }), withTiming(0.4, { duration: 1500 })), -1);
  }, []);

  const ring1Style = useAnimatedStyle(() => ({ opacity: ring1.value, transform: [{ scale: ring1.value + 0.5 }] }));
  const ring2Style = useAnimatedStyle(() => ({ opacity: ring2.value, transform: [{ scale: ring2.value + 0.8 }] }));

  const statusText = status === 'searching_places'
    ? (t('home.searching') || 'Recherche en cours...')
    : (t('home.curating') || 'Création de votre plan...');

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
      <View style={{ width: 120, height: 120, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View style={[{ position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: colors.accent }, ring1Style]} />
        <Animated.View style={[{ position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.accentLight }, ring2Style]} />
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent }} />
      </View>

      <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: spacing.xl }}>
        {statusText}
      </Text>

      {items.length > 0 && (
        <Text variant="caption" color={colors.textTertiary} style={{ marginTop: spacing.sm }}>
          {items.length} {t('home.itemsFound') || 'résultats trouvés'}
        </Text>
      )}
    </View>
  );
}
