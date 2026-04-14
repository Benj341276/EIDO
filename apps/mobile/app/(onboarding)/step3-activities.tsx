import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, ScreenContainer } from '@/components/ui';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { ChipGrid } from '@/components/onboarding/ChipGrid';
import { usePreferencesStore } from '@/stores/preferences.store';
import { ACTIVITY_OPTIONS } from '@eido-life/shared';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';

export default function Step3Activities() {
  const colors = useColors();
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
          <Text variant="h2">Comment occupez-vous votre temps ?</Text>
          <Text variant="body" color={colors.textSecondary}>
            Choisissez vos activités préférées
          </Text>
        </View>

        <ChipGrid options={ACTIVITY_OPTIONS} selected={draft.activities} onToggle={toggle} />
      </View>

      <View style={{ marginTop: 'auto', paddingTop: spacing.lg }}>
        <Button
          title="Suivant"
          onPress={() => router.push('/(onboarding)/step4-lifestyle')}
          size="lg"
        />
      </View>
    </ScreenContainer>
  );
}
