import { Pressable, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { spacing, radii } from '@/theme/spacing';
import { fontSizes, fontWeights } from '@/theme/typography';

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

const variantStyles: Record<Variant, { container: ViewStyle; textColor: string }> = {
  primary: { container: { backgroundColor: colors.accent }, textColor: colors.white },
  secondary: { container: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, textColor: colors.white },
  ghost: { container: { backgroundColor: 'transparent' }, textColor: colors.accent },
};

export function Button({ title, onPress, variant = 'primary', size = 'md', loading, disabled }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

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
        },
        variantStyles[variant].container,
        sizeStyles[size].container,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles[variant].textColor} />
      ) : (
        <Text
          weight="semibold"
          color={variantStyles[variant].textColor}
          style={sizeStyles[size].text}
        >
          {title}
        </Text>
      )}
    </AnimatedPressable>
  );
}
