import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, Card, ScreenContainer } from '@/components/ui';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { ChipGrid } from '@/components/onboarding/ChipGrid';
import { usePreferencesStore } from '@/stores/preferences.store';
import {
  LIFE_RHYTHM_OPTIONS,
  BUDGET_LEVEL_OPTIONS,
  DIETARY_RESTRICTION_OPTIONS,
} from '@eido-life/shared';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

function SelectCard({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card
        style={{
          borderColor: selected ? colors.accent : colors.border,
          backgroundColor: selected ? colors.accentMuted : colors.surface,
        }}
      >
        <Text weight="semibold" color={selected ? colors.accent : colors.textPrimary}>
          {label}
        </Text>
        {description && (
          <Text variant="caption" color={colors.textSecondary}>{description}</Text>
        )}
      </Card>
    </Pressable>
  );
}

export default function Step4Lifestyle() {
  const router = useRouter();
  const { draft, updateDraft } = usePreferencesStore();

  function toggleDietary(value: string) {
    const next = draft.dietary_restrictions.includes(value)
      ? draft.dietary_restrictions.filter((v) => v !== value)
      : [...draft.dietary_restrictions, value];
    updateDraft({ dietary_restrictions: next });
  }

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.lg }}>
        <ProgressBar currentStep={4} totalSteps={5} />

        <View style={{ gap: spacing.xs }}>
          <Text variant="h2">Votre rythme</Text>
          <Text variant="body" color={colors.textSecondary}>
            Aidez-nous à comprendre votre style de vie
          </Text>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="label" color={colors.textSecondary}>Quand êtes-vous le plus actif ?</Text>
          {LIFE_RHYTHM_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.value}
              label={opt.label}
              selected={draft.life_rhythm === opt.value}
              onPress={() => updateDraft({ life_rhythm: opt.value })}
            />
          ))}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="label" color={colors.textSecondary}>Budget par sortie</Text>
          {BUDGET_LEVEL_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.value}
              label={opt.label}
              description={opt.description}
              selected={draft.budget_level === opt.value}
              onPress={() => updateDraft({ budget_level: opt.value })}
            />
          ))}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="label" color={colors.textSecondary}>Restrictions alimentaires</Text>
          <ChipGrid
            options={DIETARY_RESTRICTION_OPTIONS}
            selected={draft.dietary_restrictions}
            onToggle={toggleDietary}
          />
        </View>
      </View>

      <View style={{ marginTop: 'auto', paddingTop: spacing.lg }}>
        <Button
          title="Suivant"
          onPress={() => router.push('/(onboarding)/step5-mobility')}
          size="lg"
        />
      </View>
    </ScreenContainer>
  );
}
