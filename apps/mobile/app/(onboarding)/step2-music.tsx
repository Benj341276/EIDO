import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, ScreenContainer } from '@/components/ui';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { ChipGrid } from '@/components/onboarding/ChipGrid';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useTranslation } from '@/i18n';
import { MUSIC_GENRE_OPTIONS } from '@eido-life/shared';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';

export default function Step2Music() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { draft, updateDraft } = usePreferencesStore();

  function toggle(value: string) {
    const next = draft.music_genres.includes(value) ? draft.music_genres.filter((v) => v !== value) : [...draft.music_genres, value];
    updateDraft({ music_genres: next });
  }

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.lg }}>
        <ProgressBar currentStep={2} totalSteps={5} />
        <View style={{ gap: spacing.xs }}>
          <Text variant="h2">{t('onboarding.step2.title')}</Text>
          <Text variant="body" color={colors.textSecondary}>{t('onboarding.step2.subtitle')}</Text>
        </View>
        <ChipGrid options={MUSIC_GENRE_OPTIONS} selected={draft.music_genres} onToggle={toggle} labelFn={(k) => t(`music.${k}`)} />
      </View>
      <View style={{ marginTop: 'auto', paddingTop: spacing.lg }}>
        <Button title={t('common.next')} onPress={() => router.push('/(onboarding)/step3-activities')} size="lg" />
      </View>
    </ScreenContainer>
  );
}
