import { View } from 'react-native';
import { Text, Button, ScreenContainer } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();

  return (
    <ScreenContainer>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <Text variant="h2">Profile</Text>
          <Text variant="body" color={colors.textSecondary}>
            {user?.email ?? 'Not signed in'}
          </Text>
        </View>
        <Button title="Sign Out" onPress={signOut} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
