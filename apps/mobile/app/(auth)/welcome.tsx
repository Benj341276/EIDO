import { View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button } from '@/components/ui';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';

export default function WelcomeScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
      }}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md }}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={{ width: 80, height: 80, borderRadius: 20 }}
        />
        <Text variant="h1" align="center">EIDO Life</Text>
        <Text variant="body" color={colors.textSecondary} align="center">
          Optimisateur de vie
        </Text>
      </View>

      <View style={{ width: '100%', gap: spacing.md, paddingBottom: spacing['2xl'] }}>
        <Button
          title="Commencer"
          onPress={() => router.push('/(auth)/sign-up')}
          size="lg"
        />
        <Button
          title="J'ai déjà un compte"
          onPress={() => router.push('/(auth)/sign-in')}
          variant="ghost"
        />
      </View>
    </View>
  );
}
