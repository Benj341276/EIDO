import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { spacing, radii } from '@/theme/spacing';

interface Props {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Chip({ label, selected, onPress }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderRadius: radii.full,
          borderWidth: 1,
          borderColor: selected ? colors.accent : colors.border,
          backgroundColor: selected ? colors.accentMuted : 'transparent',
        },
        animatedStyle,
      ]}
    >
      <Text
        variant="caption"
        weight="medium"
        color={selected ? colors.accent : colors.textSecondary}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}
