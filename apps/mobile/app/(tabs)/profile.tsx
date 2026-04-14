import { View } from 'react-native';
import { Text, Button, Card, ScreenContainer } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

function PreferenceSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <View style={{ gap: spacing.xs }}>
      <Text variant="label" color={colors.textSecondary}>{title}</Text>
      <Text variant="body">{items.join(', ')}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { preferences } = usePreferencesStore();

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.lg }}>
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <Text variant="h2">Profil</Text>
          <Text variant="body" color={colors.textSecondary}>
            {user?.email ?? 'Non connecté'}
          </Text>
        </View>

        {preferences && (
          <Card style={{ gap: spacing.md }}>
            <Text variant="h3">Mes préférences</Text>

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
