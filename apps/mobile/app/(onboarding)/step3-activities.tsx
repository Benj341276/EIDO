import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, ScreenContainer } from '@/components/ui';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { ChipGrid } from '@/components/onboarding/ChipGrid';
import { usePreferencesStore } from '@/stores/preferences.store';
import { ACTIVITY_OPTIONS } from '@eido-life/shared';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function Step3Activities() {
  const router = useRouter();
  const { draft, updateDraft } = usePreferencesStore();

  function toggle(value: string) {
    const next = draft.activities.includes(value)
      ? draft.activities.filter((v) => v !== value)
      : [...draft.activities, value];
    updateDraft({ activities: next });
  }

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.lg }}>
        <ProgressBar currentStep={3} totalSteps={5} />

        <View style={{ gap: spacing.xs }}>
          <Text variant="h2">How do you spend your time?</Text>
          <Text variant="body" color={colors.textSecondary}>
            Pick activities you enjoy
          </Text>
        </View>

        <ChipGrid options={ACTIVITY_OPTIONS} selected={draft.activities} onToggle={toggle} />
      </View>

      <View style={{ marginTop: 'auto', paddingTop: spacing.lg }}>
        <Button
          title="Next"
          onPress={() => router.push('/(onboarding)/step4-lifestyle')}
          size="lg"
        />
      </View>
    </ScreenContainer>
  );
}
