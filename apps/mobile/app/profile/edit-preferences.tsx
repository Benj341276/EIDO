import { useState, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, Card, ScreenContainer } from '@/components/ui';
import { ChipGrid } from '@/components/onboarding/ChipGrid';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useTranslation } from '@/i18n';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';
import {
  CUISINE_OPTIONS, MUSIC_GENRE_OPTIONS, ACTIVITY_OPTIONS,
  LIFE_RHYTHM_OPTIONS, BUDGET_LEVEL_OPTIONS, MOBILITY_MODE_OPTIONS,
  DIETARY_RESTRICTION_OPTIONS,
} from '@eido-life/shared';

const RADIUS_OPTIONS = [1, 3, 5, 10, 25, 50] as const;

export default function EditPreferencesScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { draft, updateDraft, loadDraftFromPreferences, updatePreferences } = usePreferencesStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadDraftFromPreferences(); }, []);

  function toggleArray(field: 'cuisines' | 'music_genres' | 'activities' | 'dietary_restrictions', value: string) {
    const current = draft[field];
    updateDraft({ [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] });
  }

  async function handleSave() {
    setLoading(true); setError('');
    const result = await updatePreferences();
    setLoading(false);
    if (result.error) { setError(result.error); } else { router.back(); }
  }

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="h2">{t('editPrefs.title')}</Text>
          <Pressable onPress={() => router.back()}>
            <Text variant="body" color={colors.accent}>{t('common.cancel')}</Text>
          </Pressable>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="h3">{t('editPrefs.cuisines')}</Text>
          <ChipGrid options={CUISINE_OPTIONS} selected={draft.cuisines} onToggle={(v) => toggleArray('cuisines', v)} labelFn={(k) => t(`cuisine.${k}`)} />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="h3">{t('editPrefs.music')}</Text>
          <ChipGrid options={MUSIC_GENRE_OPTIONS} selected={draft.music_genres} onToggle={(v) => toggleArray('music_genres', v)} labelFn={(k) => t(`music.${k}`)} />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="h3">{t('editPrefs.activities')}</Text>
          <ChipGrid options={ACTIVITY_OPTIONS} selected={draft.activities} onToggle={(v) => toggleArray('activities', v)} labelFn={(k) => t(`activity.${k}`)} />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="h3">{t('editPrefs.rhythm')}</Text>
          {LIFE_RHYTHM_OPTIONS.map((key) => (
            <Pressable key={key} onPress={() => updateDraft({ life_rhythm: key })}>
              <Card style={{ borderColor: draft.life_rhythm === key ? colors.accent : colors.border, backgroundColor: draft.life_rhythm === key ? colors.accentMuted : colors.surface }}>
                <Text weight="semibold" color={draft.life_rhythm === key ? colors.accent : colors.textPrimary}>{t(`rhythm.${key}`)}</Text>
              </Card>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="h3">{t('editPrefs.budget')}</Text>
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
          <Text variant="h3">{t('editPrefs.transport')}</Text>
          {MOBILITY_MODE_OPTIONS.map((key) => (
            <Pressable key={key} onPress={() => updateDraft({ mobility_mode: key })}>
              <Card style={{ borderColor: draft.mobility_mode === key ? colors.accent : colors.border, backgroundColor: draft.mobility_mode === key ? colors.accentMuted : colors.surface }}>
                <Text weight="semibold" color={draft.mobility_mode === key ? colors.accent : colors.textPrimary}>{t(`mobility.${key}`)}</Text>
              </Card>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="h3">{t('editPrefs.radius')} : {draft.default_radius_km} km</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {RADIUS_OPTIONS.map((r) => (
              <Pressable key={r} onPress={() => updateDraft({ default_radius_km: r })} style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 999, borderWidth: 1, borderColor: draft.default_radius_km === r ? colors.accent : colors.border, backgroundColor: draft.default_radius_km === r ? colors.accentMuted : 'transparent' }}>
                <Text variant="caption" weight="medium" color={draft.default_radius_km === r ? colors.accent : colors.textSecondary}>{r} km</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="h3">{t('editPrefs.dietary')}</Text>
          <ChipGrid options={DIETARY_RESTRICTION_OPTIONS} selected={draft.dietary_restrictions} onToggle={(v) => toggleArray('dietary_restrictions', v)} labelFn={(k) => t(`dietary.${k}`)} />
        </View>

        {error ? <Text variant="caption" color={colors.error}>{error}</Text> : null}
        <Button title={t('common.save')} onPress={handleSave} loading={loading} size="lg" />
      </View>
    </ScreenContainer>
  );
}
