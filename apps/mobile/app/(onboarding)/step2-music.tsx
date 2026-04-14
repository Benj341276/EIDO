import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, ScreenContainer } from '@/components/ui';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { ChipGrid } from '@/components/onboarding/ChipGrid';
import { usePreferencesStore } from '@/stores/preferences.store';
import { MUSIC_GENRE_OPTIONS } from '@eido-life/shared';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';

export default function Step2Music() {
  const colors = useColors();
  const router = useRouter();
  const { draft, updateDraft } = usePreferencesStore();

  function toggle(value: string) {
    const next = draft.music_genres.includes(value)
      ? draft.music_genres.filter((v) => v !== value)
      : [...draft.music_genres, value];
    updateDraft({ music_genres: next });
  }

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.lg }}>
        <ProgressBar currentStep={2} totalSteps={5} />

        <View style={{ gap: spacing.xs }}>
          <Text variant="h2">Votre bande-son</Text>
          <Text variant="body" color={colors.textSecondary}>
            Quels genres musicaux aimez-vous ? (optionnel)
          </Text>
        </View>

        <ChipGrid options={MUSIC_GENRE_OPTIONS} selected={draft.music_genres} onToggle={toggle} />
      </View>

      <View style={{ marginTop: 'auto', paddingTop: spacing.lg }}>
        <Button
          title="Suivant"
          onPress={() => router.push('/(onboarding)/step3-activities')}
          size="lg"
        />
      </View>
    </ScreenContainer>
  );
}
