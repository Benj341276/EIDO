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
      setError('Please fill in all fields');
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
          <Text variant="h2">Welcome back</Text>
          <Text variant="body" color={colors.textSecondary}>
            Sign in to your account
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
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {error ? <Text variant="caption" color={colors.error}>{error}</Text> : null}

        <Button title="Sign In" onPress={handleSignIn} loading={loading} size="lg" />

        <Pressable onPress={() => router.replace('/(auth)/sign-up')}>
          <Text variant="body" color={colors.textSecondary} align="center">
            Don't have an account?{' '}
            <Text color={colors.accent} weight="semibold">Sign up</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
