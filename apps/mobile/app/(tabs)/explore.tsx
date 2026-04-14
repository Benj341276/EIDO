import { View } from 'react-native';
import { Text, ScreenContainer } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function ExploreScreen() {
  return (
    <ScreenContainer scroll={false} padding={false}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
        <Text variant="h2" align="center">Explore</Text>
        <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: spacing.sm }}>
          Map coming in Phase 5
        </Text>
      </View>
    </ScreenContainer>
  );
}
