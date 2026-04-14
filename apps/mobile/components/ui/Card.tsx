import { View, ViewProps } from 'react-native';
import { useColors } from '@/theme/useColors';
import { spacing, radii } from '@/theme/spacing';

interface Props extends ViewProps {
  elevated?: boolean;
}

export function Card({ elevated, style, children, ...props }: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        {
          backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
