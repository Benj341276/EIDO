import { View, Image, Linking, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, Button, Card, ScreenContainer } from '@/components/ui';
import { FeedbackButtons } from '@/components/plan/FeedbackButtons';
import { useTranslation } from '@/i18n';
import { useColors } from '@/theme/useColors';
import { spacing, radii } from '@/theme/spacing';

export default function PlanItemDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { itemData } = useLocalSearchParams<{ itemId: string; itemData: string }>();

  const item = itemData ? JSON.parse(itemData) : null;
  if (!item) return null;

  function openInMaps() {
    if (item.external_url) {
      Linking.openURL(item.external_url);
    } else if (item.latitude && item.longitude) {
      Linking.openURL(`https://maps.google.com/?q=${item.latitude},${item.longitude}`);
    }
  }

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.lg }}>
        <Pressable onPress={() => router.back()}>
          <Text variant="body" color={colors.accent}>← {t('common.cancel') || 'Retour'}</Text>
        </Pressable>

        {item.image_url && (
          <Image
            source={{ uri: item.image_url }}
            style={{ width: '100%', height: 200, borderRadius: radii.lg }}
            resizeMode="cover"
          />
        )}

        <View style={{ gap: spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text variant="h2" style={{ flex: 1 }}>{item.name}</Text>
            {item.id && <FeedbackButtons planItemId={item.id} />}
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
            {item.rating && <Text variant="body" color={colors.accent}>★ {item.rating}</Text>}
            {item.estimated_cost && <Text variant="body" color={colors.textSecondary}>~{item.estimated_cost}€</Text>}
            {item.duration_minutes && <Text variant="body" color={colors.textSecondary}>{item.duration_minutes} min</Text>}
          </View>
        </View>

        {item.reason && (
          <Card>
            <Text variant="body">{item.reason}</Text>
          </Card>
        )}

        {item.address && (
          <View style={{ gap: spacing.xs }}>
            <Text variant="label" color={colors.textSecondary}>{t('plan.address') || 'Adresse'}</Text>
            <Text variant="body">{item.address}</Text>
          </View>
        )}

        <Button
          title={t('plan.openInMaps') || 'Ouvrir dans Maps'}
          onPress={openInMaps}
          variant="secondary"
        />
      </View>
    </ScreenContainer>
  );
}
