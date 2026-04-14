import { View } from 'react-native';
import { Text, ScreenContainer } from '@/components/ui';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';

export default function HomeScreen() {
  const colors = useColors();
  return (
    <ScreenContainer scroll={false} padding={false}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
        <Text variant="h2" align="center">EIDO Life</Text>
        <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: spacing.sm }}>
          Génération de plans bientôt disponible
        </Text>
      </View>
    </ScreenContainer>
  );
}
