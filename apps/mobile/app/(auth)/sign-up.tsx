import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, Input, ScreenContainer } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function SignUpScreen() {
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUpWithEmail);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setError('');
    setLoading(true);
    const result = await signUp(email, password);
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
          <Text variant="h2">Créer un compte</Text>
          <Text variant="body" color={colors.textSecondary}>
            Commencez à optimiser votre vie
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
            placeholder="Au moins 6 caractères"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Input
            label="Confirmer le mot de passe"
            placeholder="Répétez votre mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {error ? <Text variant="caption" color={colors.error}>{error}</Text> : null}

        <Button title="Créer mon compte" onPress={handleSignUp} loading={loading} size="lg" />

        <Pressable onPress={() => router.replace('/(auth)/sign-in')}>
          <Text variant="body" color={colors.textSecondary} align="center">
            Déjà un compte ?{' '}
            <Text color={colors.accent} weight="semibold">Se connecter</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
