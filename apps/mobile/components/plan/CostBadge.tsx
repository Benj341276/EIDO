import { View } from 'react-native';
import { Text } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { useColors } from '@/theme/useColors';
import { spacing, radii } from '@/theme/spacing';

interface Props {
  min: number;
  max: number;
  currency: string;
}

export function CostBadge({ min, max, currency }: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const symbol = currency === 'EUR' ? '€' : currency;

  return (
    <View style={{
      backgroundColor: colors.accentMuted,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radii.md,
      alignSelf: 'flex-start',
      gap: 2,
    }}>
      <Text variant="body" weight="semibold" color={colors.accent}>
        {min}–{max} {symbol}
      </Text>
      <Text variant="label" color={colors.textSecondary}>
        {t('plan.costEstimate') || 'Budget estimé par personne (1 repas, 1 à 2 activités, 1 événement)'}
      </Text>
    </View>
  );
}
