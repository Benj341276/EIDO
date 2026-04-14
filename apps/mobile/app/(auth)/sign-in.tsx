import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, Input, ScreenContainer } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { useTranslation } from '@/i18n';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const signIn = useAuthStore((s) => s.signInWithEmail);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) { setError(t('signIn.fillAll')); return; }
    setError(''); setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
        <View style={{ gap: spacing.xs }}>
          <Text variant="h2">{t('signIn.title')}</Text>
          <Text variant="body" color={colors.textSecondary}>{t('signIn.subtitle')}</Text>
        </View>
        <View style={{ gap: spacing.md }}>
          <Input label={t('signIn.email')} placeholder={t('signIn.emailPlaceholder')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <Input label={t('signIn.password')} placeholder={t('signIn.passwordPlaceholder')} value={password} onChangeText={setPassword} secureTextEntry />
        </View>
        {error ? <Text variant="caption" color={colors.error}>{error}</Text> : null}
        <Button title={t('signIn.submit')} onPress={handleSignIn} loading={loading} size="lg" />
        <Pressable onPress={() => router.replace('/(auth)/sign-up')}>
          <Text variant="body" color={colors.textSecondary} align="center">
            {t('signIn.noAccount')} <Text color={colors.accent} weight="semibold">{t('signIn.signUp')}</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
