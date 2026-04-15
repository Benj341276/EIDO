import { useState, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Card, ScreenContainer } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import { getSupabase } from '@/lib/supabase';
import { useThemeStore } from '@/stores/theme.store';
import { useLanguageStore, Language } from '@/stores/language.store';
import { useTranslation } from '@/i18n';
import { useColors } from '@/theme/useColors';
import { spacing, radii } from '@/theme/spacing';

const LANG_LABELS: Record<Language, string> = { fr: 'Français', en: 'English', es: 'Español', de: 'Deutsch' };
const LANG_ORDER: Language[] = ['fr', 'en', 'es', 'de'];

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { user, signOut } = useAuthStore();
  const { preferences } = usePreferencesStore();
  const { mode, toggleMode } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();

  const [planHistory, setPlanHistory] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await getSupabase()
        .from('plans')
        .select('id, location_name, radius_km, status, total_estimated_cost, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setPlanHistory(data);
    })();
  }, []);

  function tCategory(prefix: string, key: string) { return t(`${prefix}.${key}`); }

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.lg }}>
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <Text variant="h2">{t('profile.title')}</Text>
          <Text variant="body" color={colors.textSecondary}>{user?.email ?? t('profile.notSignedIn')}</Text>
        </View>

        {/* Theme toggle */}
        <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name={mode === 'dark' ? 'moon' : 'sunny'} size={20} color={colors.accent} />
            <Text weight="medium">{mode === 'dark' ? t('profile.darkMode') : t('profile.lightMode')}</Text>
          </View>
          <Pressable onPress={toggleMode} style={{ width: 50, height: 28, borderRadius: 14, backgroundColor: mode === 'dark' ? colors.accent : colors.border, justifyContent: 'center', paddingHorizontal: 2 }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white, alignSelf: mode === 'dark' ? 'flex-end' : 'flex-start' }} />
          </Pressable>
        </Card>

        {/* Language selector */}
        <Card style={{ gap: spacing.sm }}>
          <Text weight="medium">{t('profile.language')}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {LANG_ORDER.map((l) => (
              <Pressable
                key={l}
                onPress={() => setLanguage(l)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: language === l ? colors.accent : colors.border,
                  backgroundColor: language === l ? colors.accentMuted : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text variant="caption" weight="medium" color={language === l ? colors.accent : colors.textSecondary}>
                  {LANG_LABELS[l]}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Preferences */}
        {preferences && (
          <Card style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="h3">{t('profile.myPreferences')}</Text>
              <Pressable onPress={() => router.push('/profile/edit-preferences')}>
                <Text variant="caption" color={colors.accent} weight="semibold">{t('common.modify')}</Text>
              </Pressable>
            </View>

            {preferences.cuisines.length > 0 && (
              <View style={{ gap: spacing.xs }}>
                <Text variant="label" color={colors.textSecondary}>{t('editPrefs.cuisines')}</Text>
                <Text variant="body">{preferences.cuisines.map((k) => tCategory('cuisine', k)).join(', ')}</Text>
              </View>
            )}
            {preferences.music_genres.length > 0 && (
              <View style={{ gap: spacing.xs }}>
                <Text variant="label" color={colors.textSecondary}>{t('editPrefs.music')}</Text>
                <Text variant="body">{preferences.music_genres.map((k) => tCategory('music', k)).join(', ')}</Text>
              </View>
            )}
            {preferences.activities.length > 0 && (
              <View style={{ gap: spacing.xs }}>
                <Text variant="label" color={colors.textSecondary}>{t('editPrefs.activities')}</Text>
                <Text variant="body">{preferences.activities.map((k) => tCategory('activity', k)).join(', ')}</Text>
              </View>
            )}
            {preferences.life_rhythm && (
              <View style={{ gap: spacing.xs }}>
                <Text variant="label" color={colors.textSecondary}>{t('editPrefs.rhythm')}</Text>
                <Text variant="body">{t(`rhythm.${preferences.life_rhythm}`)}</Text>
              </View>
            )}
            {preferences.budget_level && (
              <View style={{ gap: spacing.xs }}>
                <Text variant="label" color={colors.textSecondary}>{t('editPrefs.budget')}</Text>
                <Text variant="body">{t(`budget.${preferences.budget_level}`)}</Text>
              </View>
            )}
            {preferences.mobility_mode && (
              <View style={{ gap: spacing.xs }}>
                <Text variant="label" color={colors.textSecondary}>{t('editPrefs.transport')}</Text>
                <Text variant="body">{t(`mobility.${preferences.mobility_mode}`)}</Text>
              </View>
            )}
            <View style={{ gap: spacing.xs }}>
              <Text variant="label" color={colors.textSecondary}>{t('editPrefs.radius')}</Text>
              <Text variant="body">{preferences.default_radius_km} km</Text>
            </View>
          </Card>
        )}

        {/* Plan history */}
        {planHistory.length > 0 && (
          <Card style={{ gap: spacing.md }}>
            <Text variant="h3">{t('profile.planHistory') || 'Historique des plans'}</Text>
            {planHistory.map((plan, index) => (
              <Pressable
                key={plan.id}
                onPress={() => router.push({ pathname: '/plan/results', params: { planId: plan.id } })}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: spacing.sm,
                  borderTopWidth: index > 0 ? 1 : 0,
                  borderTopColor: colors.border,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="medium">
                    {plan.location_name || `Plan ${plan.radius_km} km`}
                  </Text>
                  <Text variant="caption" color={colors.textSecondary}>
                    {new Date(plan.created_at).toLocaleDateString()} à {new Date(plan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {plan.status === 'completed' ? ' ✓' : plan.status === 'failed' ? ' ✗' : ' ...'}
                  </Text>
                </View>
                {plan.total_estimated_cost && (
                  <Text variant="body" color={colors.accent} weight="semibold">~{plan.total_estimated_cost}€</Text>
                )}
              </Pressable>
            ))}
          </Card>
        )}

        <Button title={t('common.signOut')} onPress={signOut} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
