import { View } from 'react-native';
import { Text } from '@/components/ui';
import { useColors } from '@/theme/useColors';
import { spacing, radii } from '@/theme/spacing';

interface Props {
  min: number;
  max: number;
  currency: string;
}

export function CostBadge({ min, max, currency }: Props) {
  const colors = useColors();

  return (
    <View style={{
      backgroundColor: colors.accentMuted,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radii.full,
      alignSelf: 'flex-start',
    }}>
      <Text variant="caption" weight="semibold" color={colors.accent}>
        {min}–{max} {currency === 'EUR' ? '€' : currency}
      </Text>
    </View>
  );
}
