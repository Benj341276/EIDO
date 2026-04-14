import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, ScreenContainer } from '@/components/ui';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { ChipGrid } from '@/components/onboarding/ChipGrid';
import { usePreferencesStore } from '@/stores/preferences.store';
import { CUISINE_OPTIONS } from '@eido-life/shared';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function Step1Cuisines() {
  const router = useRouter();
  const { draft, updateDraft } = usePreferencesStore();

  function toggle(value: string) {
    const next = draft.cuisines.includes(value)
      ? draft.cuisines.filter((v) => v !== value)
      : [...draft.cuisines, value];
    updateDraft({ cuisines: next });
  }

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.lg }}>
        <ProgressBar currentStep={1} totalSteps={5} />

        <View style={{ gap: spacing.xs }}>
          <Text variant="h2">Quelles saveurs aimez-vous ?</Text>
          <Text variant="body" color={colors.textSecondary}>
            Choisissez au moins une cuisine
          </Text>
        </View>

        <ChipGrid options={CUISINE_OPTIONS} selected={draft.cuisines} onToggle={toggle} />
      </View>

      <View style={{ marginTop: 'auto', paddingTop: spacing.lg }}>
        <Button
          title="Suivant"
          onPress={() => router.push('/(onboarding)/step2-music')}
          disabled={draft.cuisines.length === 0}
          size="lg"
        />
      </View>
    </ScreenContainer>
  );
}
