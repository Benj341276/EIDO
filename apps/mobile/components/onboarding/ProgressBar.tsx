import { View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/spacing';

interface Props {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: Props) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${(currentStep / totalSteps) * 100}%`, { duration: 300 }),
  }));

  return (
    <View
      style={{
        height: 3,
        backgroundColor: colors.border,
        borderRadius: radii.full,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: colors.accent,
            borderRadius: radii.full,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}
