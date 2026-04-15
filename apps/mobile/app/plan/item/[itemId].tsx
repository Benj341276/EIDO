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

  const eventDate = item.metadata?.event_date || (item.description?.startsWith('📅') ? item.description.slice(2).trim() : null);
  const ticketUrl = item.metadata?.ticket_url || (item.category === 'event' ? item.external_url : null);
  const venue = item.metadata?.venue;
  const priceRange = item.metadata?.price_min != null && item.metadata?.price_max != null
    ? `${item.metadata.price_min}–${item.metadata.price_max}€`
    : null;

  function openInMaps() {
    if (item.latitude && item.longitude) {
      Linking.openURL(`https://maps.google.com/?q=${item.latitude},${item.longitude}`);
    } else if (item.external_url && item.category !== 'event') {
      Linking.openURL(item.external_url);
    }
  }

  function openTickets() {
    if (ticketUrl) Linking.openURL(ticketUrl);
  }

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.lg }}>
        <Pressable onPress={() => router.back()}>
          <Text variant="body" color={colors.accent}>← Retour</Text>
        </Pressable>

        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={{ width: '100%', height: 200, borderRadius: radii.lg }} resizeMode="cover" />
        )}

        <View style={{ gap: spacing.sm }}>
          <Text variant="h2">{item.name}</Text>

          {/* Event specific info */}
          {eventDate && (
            <View style={{ backgroundColor: colors.accentMuted, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.md, alignSelf: 'flex-start' }}>
              <Text variant="body" weight="semibold" color={colors.accent}>📅 {eventDate}</Text>
            </View>
          )}

          {venue && (
            <Text variant="body" color={colors.textSecondary}>📍 {venue}</Text>
          )}

          {priceRange && (
            <Text variant="body" color={colors.textSecondary}>💰 {priceRange}</Text>
          )}

          {/* Rating, cost, duration */}
          <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
            {item.rating && <Text variant="body" color={colors.accent}>★ {item.rating}</Text>}
            {item.estimated_cost != null && !priceRange && <Text variant="body" color={colors.textSecondary}>~{item.estimated_cost}€</Text>}
            {item.duration_minutes && <Text variant="body" color={colors.textSecondary}>{item.duration_minutes} min</Text>}
          </View>
        </View>

        {/* Feedback */}
        {item.id && <FeedbackButtons planItemId={item.id} />}

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

        {/* Booking button for events */}
        {ticketUrl && (
          <Button
            title={t('plan.bookTickets') || 'Réserver'}
            onPress={openTickets}
          />
        )}

        {/* Maps button */}
        {(item.latitude || item.external_url) && (
          <Button
            title={t('plan.openInMaps') || 'Ouvrir dans Maps'}
            onPress={openInMaps}
            variant="secondary"
          />
        )}
      </View>
    </ScreenContainer>
  );
}
