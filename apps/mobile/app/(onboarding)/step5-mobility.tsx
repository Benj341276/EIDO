import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, Card, ScreenContainer } from '@/components/ui';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { usePreferencesStore } from '@/stores/preferences.store';
import { MOBILITY_MODE_OPTIONS } from '@eido-life/shared';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const RADIUS_OPTIONS = [1, 3, 5, 10, 25, 50] as const;

export default function Step5Mobility() {
  const router = useRouter();
  const { draft, updateDraft, submitPreferences } = usePreferencesStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleComplete() {
    setLoading(true);
    setError('');
    const result = await submitPreferences();
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.replace('/(tabs)');
    }
  }

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.lg }}>
        <ProgressBar currentStep={5} totalSteps={5} />

        <View style={{ gap: spacing.xs }}>
          <Text variant="h2">Comment vous déplacez-vous ?</Text>
          <Text variant="body" color={colors.textSecondary}>
            Cela nous aide à trouver des lieux accessibles
          </Text>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="label" color={colors.textSecondary}>Mode de transport</Text>
          {MOBILITY_MODE_OPTIONS.map((opt) => (
            <Pressable key={opt.value} onPress={() => updateDraft({ mobility_mode: opt.value })}>
              <Card
                style={{
                  borderColor: draft.mobility_mode === opt.value ? colors.accent : colors.border,
                  backgroundColor: draft.mobility_mode === opt.value ? colors.accentMuted : colors.surface,
                }}
              >
                <Text
                  weight="semibold"
                  color={draft.mobility_mode === opt.value ? colors.accent : colors.textPrimary}
                >
                  {opt.label}
                </Text>
              </Card>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="label" color={colors.textSecondary}>
            Rayon de recherche : {draft.default_radius_km} km
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {RADIUS_OPTIONS.map((r) => (
              <Pressable
                key={r}
                onPress={() => updateDraft({ default_radius_km: r })}
                style={{
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: draft.default_radius_km === r ? colors.accent : colors.border,
                  backgroundColor: draft.default_radius_km === r ? colors.accentMuted : 'transparent',
                }}
              >
                <Text
                  variant="caption"
                  weight="medium"
                  color={draft.default_radius_km === r ? colors.accent : colors.textSecondary}
                >
                  {r} km
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {error ? <Text variant="caption" color={colors.error}>{error}</Text> : null}
      </View>

      <View style={{ marginTop: 'auto', paddingTop: spacing.lg }}>
        <Button
          title="Terminer la configuration"
          onPress={handleComplete}
          loading={loading}
          size="lg"
        />
      </View>
    </ScreenContainer>
  );
}
