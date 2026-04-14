import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, Input, ScreenContainer } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function SignInScreen() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signInWithEmail);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setError('');
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}
      >
        <View style={{ gap: spacing.xs }}>
          <Text variant="h2">Content de vous revoir</Text>
          <Text variant="body" color={colors.textSecondary}>
            Connectez-vous à votre compte
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <Input
            label="E-mail"
            placeholder="vous@exemple.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label="Mot de passe"
            placeholder="Votre mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {error ? <Text variant="caption" color={colors.error}>{error}</Text> : null}

        <Button title="Se connecter" onPress={handleSignIn} loading={loading} size="lg" />

        <Pressable onPress={() => router.replace('/(auth)/sign-up')}>
          <Text variant="body" color={colors.textSecondary} align="center">
            Pas encore de compte ?{' '}
            <Text color={colors.accent} weight="semibold">S'inscrire</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
