import { useState, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, Card, ScreenContainer } from '@/components/ui';
import { ChipGrid } from '@/components/onboarding/ChipGrid';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';
import {
  CUISINE_OPTIONS,
  MUSIC_GENRE_OPTIONS,
  ACTIVITY_OPTIONS,
  LIFE_RHYTHM_OPTIONS,
  BUDGET_LEVEL_OPTIONS,
  MOBILITY_MODE_OPTIONS,
  DIETARY_RESTRICTION_OPTIONS,
} from '@eido-life/shared';

const RADIUS_OPTIONS = [1, 3, 5, 10, 25, 50] as const;

export default function EditPreferencesScreen() {
  const colors = useColors();
  const router = useRouter();
  const { draft, updateDraft, loadDraftFromPreferences, updatePreferences } = usePreferencesStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDraftFromPreferences();
  }, []);

  function toggleArray(field: 'cuisines' | 'music_genres' | 'activities' | 'dietary_restrictions', value: string) {
    const current = draft[field];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    updateDraft({ [field]: next });
  }

  async function handleSave() {
    setLoading(true);
    setError('');
    const result = await updatePreferences();
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.back();
    }
  }

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="h2">Modifier mes préférences</Text>
          <Pressable onPress={() => router.back()}>
            <Text variant="body" color={colors.accent}>Annuler</Text>
          </Pressable>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="h3">Cuisines</Text>
          <ChipGrid options={CUISINE_OPTIONS} selected={draft.cuisines} onToggle={(v) => toggleArray('cuisines', v)} />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="h3">Musique</Text>
          <ChipGrid options={MUSIC_GENRE_OPTIONS} selected={draft.music_genres} onToggle={(v) => toggleArray('music_genres', v)} />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="h3">Activités</Text>
          <ChipGrid options={ACTIVITY_OPTIONS} selected={draft.activities} onToggle={(v) => toggleArray('activities', v)} />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="h3">Rythme de vie</Text>
          {LIFE_RHYTHM_OPTIONS.map((opt) => (
            <Pressable key={opt.value} onPress={() => updateDraft({ life_rhythm: opt.value })}>
              <Card style={{
                borderColor: draft.life_rhythm === opt.value ? colors.accent : colors.border,
                backgroundColor: draft.life_rhythm === opt.value ? colors.accentMuted : colors.surface,
              }}>
                <Text weight="semibold" color={draft.life_rhythm === opt.value ? colors.accent : colors.textPrimary}>
                  {opt.label}
                </Text>
              </Card>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="h3">Budget par sortie</Text>
          {BUDGET_LEVEL_OPTIONS.map((opt) => (
            <Pressable key={opt.value} onPress={() => updateDraft({ budget_level: opt.value })}>
              <Card style={{
                borderColor: draft.budget_level === opt.value ? colors.accent : colors.border,
                backgroundColor: draft.budget_level === opt.value ? colors.accentMuted : colors.surface,
              }}>
                <Text weight="semibold" color={draft.budget_level === opt.value ? colors.accent : colors.textPrimary}>
                  {opt.label}
                </Text>
                <Text variant="caption" color={colors.textSecondary}>{opt.description}</Text>
              </Card>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="h3">Mode de transport</Text>
          {MOBILITY_MODE_OPTIONS.map((opt) => (
            <Pressable key={opt.value} onPress={() => updateDraft({ mobility_mode: opt.value })}>
              <Card style={{
                borderColor: draft.mobility_mode === opt.value ? colors.accent : colors.border,
                backgroundColor: draft.mobility_mode === opt.value ? colors.accentMuted : colors.surface,
              }}>
                <Text weight="semibold" color={draft.mobility_mode === opt.value ? colors.accent : colors.textPrimary}>
                  {opt.label}
                </Text>
              </Card>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="h3">Rayon de recherche : {draft.default_radius_km} km</Text>
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
                <Text variant="caption" weight="medium" color={draft.default_radius_km === r ? colors.accent : colors.textSecondary}>
                  {r} km
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="h3">Restrictions alimentaires</Text>
          <ChipGrid options={DIETARY_RESTRICTION_OPTIONS} selected={draft.dietary_restrictions} onToggle={(v) => toggleArray('dietary_restrictions', v)} />
        </View>

        {error ? <Text variant="caption" color={colors.error}>{error}</Text> : null}

        <Button title="Enregistrer" onPress={handleSave} loading={loading} size="lg" />
      </View>
    </ScreenContainer>
  );
}
