import { View } from 'react-native';
import { Text, ScreenContainer } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';

export default function HomeScreen() {
  const colors = useColors();
  const { t } = useTranslation();

  return (
    <ScreenContainer scroll={false} padding={false}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
        <Text variant="h2" align="center">EIDO Life</Text>
        <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: spacing.sm }}>{t('home.comingSoon')}</Text>
      </View>
    </ScreenContainer>
  );
}
