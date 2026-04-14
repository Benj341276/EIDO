import { Pressable, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Text } from './Text';
import { useColors } from '@/theme/useColors';
import { spacing, radii } from '@/theme/spacing';
import { fontSizes } from '@/theme/typography';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const sizeStyles: Record<Size, { container: ViewStyle; text: TextStyle }> = {
  sm: { container: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md }, text: { fontSize: fontSizes.sm } },
  md: { container: { paddingVertical: spacing.md - 4, paddingHorizontal: spacing.lg }, text: { fontSize: fontSizes.base } },
  lg: { container: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl }, text: { fontSize: fontSizes.lg } },
};

export function Button({ title, onPress, variant = 'primary', size = 'md', loading, disabled }: Props) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const variants: Record<Variant, { bg: string; border?: string; textColor: string }> = {
    primary: { bg: colors.accent, textColor: colors.white },
    secondary: { bg: colors.surface, border: colors.border, textColor: colors.textPrimary },
    ghost: { bg: 'transparent', textColor: colors.accent },
  };
  const v = variants[variant];

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      disabled={disabled || loading}
      style={[
        {
          borderRadius: radii.md,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
          backgroundColor: v.bg,
          ...(v.border ? { borderWidth: 1, borderColor: v.border } : {}),
        },
        sizeStyles[size].container,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.textColor} />
      ) : (
        <Text weight="semibold" color={v.textColor} style={sizeStyles[size].text}>
          {title}
        </Text>
      )}
    </AnimatedPressable>
  );
}
