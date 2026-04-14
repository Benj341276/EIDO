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
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
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
          <Text variant="h2">Create account</Text>
          <Text variant="body" color={colors.textSecondary}>
            Start optimizing your life
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Input
            label="Confirm password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {error ? <Text variant="caption" color={colors.error}>{error}</Text> : null}

        <Button title="Create Account" onPress={handleSignUp} loading={loading} size="lg" />

        <Pressable onPress={() => router.replace('/(auth)/sign-in')}>
          <Text variant="body" color={colors.textSecondary} align="center">
            Already have an account?{' '}
            <Text color={colors.accent} weight="semibold">Sign in</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
