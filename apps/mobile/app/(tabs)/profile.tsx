import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Card, ScreenContainer } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useThemeStore } from '@/stores/theme.store';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';

function PreferenceSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <View style={{ gap: spacing.xs }}>
      <Text variant="label" color={useColors().textSecondary}>{title}</Text>
      <Text variant="body">{items.join(', ')}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { preferences } = usePreferencesStore();
  const { mode, toggleMode } = useThemeStore();

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.lg }}>
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <Text variant="h2">Profil</Text>
          <Text variant="body" color={colors.textSecondary}>
            {user?.email ?? 'Non connecté'}
          </Text>
        </View>

        <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons
              name={mode === 'dark' ? 'moon' : 'sunny'}
              size={20}
              color={colors.accent}
            />
            <Text weight="medium">{mode === 'dark' ? 'Mode sombre' : 'Mode clair'}</Text>
          </View>
          <Pressable
            onPress={toggleMode}
            style={{
              width: 50,
              height: 28,
              borderRadius: 14,
              backgroundColor: mode === 'dark' ? colors.accent : colors.border,
              justifyContent: 'center',
              paddingHorizontal: 2,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: colors.white,
                alignSelf: mode === 'dark' ? 'flex-end' : 'flex-start',
              }}
            />
          </Pressable>
        </Card>

        {preferences && (
          <Card style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="h3">Mes préférences</Text>
              <Pressable onPress={() => router.push('/profile/edit-preferences')}>
                <Text variant="caption" color={colors.accent} weight="semibold">Modifier</Text>
              </Pressable>
            </View>

            <PreferenceSection title="Cuisines" items={preferences.cuisines} />
            <PreferenceSection title="Musique" items={preferences.music_genres} />
            <PreferenceSection title="Activités" items={preferences.activities} />

            {preferences.life_rhythm && (
              <View style={{ gap: spacing.xs }}>
                <Text variant="label" color={colors.textSecondary}>Rythme</Text>
                <Text variant="body">{preferences.life_rhythm}</Text>
              </View>
            )}

            {preferences.budget_level && (
              <View style={{ gap: spacing.xs }}>
                <Text variant="label" color={colors.textSecondary}>Budget</Text>
                <Text variant="body">{preferences.budget_level}</Text>
              </View>
            )}

            {preferences.mobility_mode && (
              <View style={{ gap: spacing.xs }}>
                <Text variant="label" color={colors.textSecondary}>Mobilité</Text>
                <Text variant="body">{preferences.mobility_mode}</Text>
              </View>
            )}

            <View style={{ gap: spacing.xs }}>
              <Text variant="label" color={colors.textSecondary}>Rayon</Text>
              <Text variant="body">{preferences.default_radius_km} km</Text>
            </View>

            <PreferenceSection title="Restrictions alimentaires" items={preferences.dietary_restrictions} />
          </Card>
        )}

        <Button title="Se déconnecter" onPress={signOut} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
