import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, Input, ScreenContainer } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { useTranslation } from '@/i18n';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';

export default function SignUpScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const signUp = useAuthStore((s) => s.signUpWithEmail);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!email || !password || !confirmPassword) { setError(t('signUp.fillAll')); return; }
    if (password !== confirmPassword) { setError(t('signUp.mismatch')); return; }
    if (password.length < 6) { setError(t('signUp.tooShort')); return; }
    setError(''); setLoading(true);
    const result = await signUp(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
        <View style={{ gap: spacing.xs }}>
          <Text variant="h2">{t('signUp.title')}</Text>
          <Text variant="body" color={colors.textSecondary}>{t('signUp.subtitle')}</Text>
        </View>
        <View style={{ gap: spacing.md }}>
          <Input label={t('signUp.email')} placeholder={t('signUp.emailPlaceholder')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <Input label={t('signUp.password')} placeholder={t('signUp.passwordPlaceholder')} value={password} onChangeText={setPassword} secureTextEntry />
          <Input label={t('signUp.confirm')} placeholder={t('signUp.confirmPlaceholder')} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        </View>
        {error ? <Text variant="caption" color={colors.error}>{error}</Text> : null}
        <Button title={t('signUp.submit')} onPress={handleSignUp} loading={loading} size="lg" />
        <Pressable onPress={() => router.replace('/(auth)/sign-in')}>
          <Text variant="body" color={colors.textSecondary} align="center">
            {t('signUp.haveAccount')} <Text color={colors.accent} weight="semibold">{t('signUp.signIn')}</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
