import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, Card, ScreenContainer } from '@/components/ui';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { ChipGrid } from '@/components/onboarding/ChipGrid';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useTranslation } from '@/i18n';
import { LIFE_RHYTHM_OPTIONS, BUDGET_LEVEL_OPTIONS, DIETARY_RESTRICTION_OPTIONS } from '@eido-life/shared';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';

export default function Step4Lifestyle() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { draft, updateDraft } = usePreferencesStore();

  function toggleDietary(value: string) {
    const next = draft.dietary_restrictions.includes(value) ? draft.dietary_restrictions.filter((v) => v !== value) : [...draft.dietary_restrictions, value];
    updateDraft({ dietary_restrictions: next });
  }

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.lg }}>
        <ProgressBar currentStep={4} totalSteps={5} />
        <View style={{ gap: spacing.xs }}>
          <Text variant="h2">{t('onboarding.step4.title')}</Text>
          <Text variant="body" color={colors.textSecondary}>{t('onboarding.step4.subtitle')}</Text>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="label" color={colors.textSecondary}>{t('onboarding.step4.whenActive')}</Text>
          {LIFE_RHYTHM_OPTIONS.map((key) => (
            <Pressable key={key} onPress={() => updateDraft({ life_rhythm: key })}>
              <Card style={{ borderColor: draft.life_rhythm === key ? colors.accent : colors.border, backgroundColor: draft.life_rhythm === key ? colors.accentMuted : colors.surface }}>
                <Text weight="semibold" color={draft.life_rhythm === key ? colors.accent : colors.textPrimary}>{t(`rhythm.${key}`)}</Text>
              </Card>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="label" color={colors.textSecondary}>{t('onboarding.step4.budget')}</Text>
          {BUDGET_LEVEL_OPTIONS.map((key) => (
            <Pressable key={key} onPress={() => updateDraft({ budget_level: key })}>
              <Card style={{ borderColor: draft.budget_level === key ? colors.accent : colors.border, backgroundColor: draft.budget_level === key ? colors.accentMuted : colors.surface }}>
                <Text weight="semibold" color={draft.budget_level === key ? colors.accent : colors.textPrimary}>{t(`budget.${key}`)}</Text>
                <Text variant="caption" color={colors.textSecondary}>{t(`budget.${key}.desc`)}</Text>
              </Card>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="label" color={colors.textSecondary}>{t('onboarding.step4.dietary')}</Text>
          <ChipGrid options={DIETARY_RESTRICTION_OPTIONS} selected={draft.dietary_restrictions} onToggle={toggleDietary} labelFn={(k) => t(`dietary.${k}`)} />
        </View>
      </View>

      <View style={{ marginTop: 'auto', paddingTop: spacing.lg }}>
        <Button title={t('common.next')} onPress={() => router.push('/(onboarding)/step5-mobility')} size="lg" />
      </View>
    </ScreenContainer>
  );
}
