import { Pressable, View, Image } from 'react-native';
import { Text } from '@/components/ui';
import { FeedbackButtons } from './FeedbackButtons';
import { useColors } from '@/theme/useColors';
import { spacing, radii } from '@/theme/spacing';
import type { PlanItem } from '@/stores/plan.store';

interface Props {
  item: PlanItem;
  onPress: () => void;
}

export function PlanItemCard({ item, onPress }: Props) {
  const colors = useColors();
  const eventDate = item.metadata?.event_date || (item.description?.startsWith('📅') ? item.description.slice(2).trim() : null);
  const eventTime = item.metadata?.event_time;

  return (
    <Pressable onPress={onPress} style={{ width: 220, marginRight: spacing.md }}>
      <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={{ width: '100%', height: 120 }} resizeMode="cover" />
        ) : (
          <View style={{ width: '100%', height: 120, backgroundColor: colors.surfaceElevated, justifyContent: 'center', alignItems: 'center' }}>
            <Text variant="h3" color={colors.textTertiary}>
              {item.category === 'restaurant' ? '🍽' : item.category === 'event' ? '🎉' : '🎯'}
            </Text>
          </View>
        )}

        <View style={{ padding: spacing.md, gap: spacing.xs }}>
          <Text variant="body" weight="semibold" numberOfLines={1}>{item.name}</Text>

          {/* Event date */}
          {eventDate && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text variant="caption" color={colors.accent} weight="semibold">📅 {eventDate}{eventTime ? ` à ${eventTime}` : ''}</Text>
            </View>
          )}

          {/* Venue for events */}
          {item.category === 'event' && item.address && (
            <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>📍 {item.address}</Text>
          )}

          {item.reason && (
            <Text variant="caption" color={colors.textSecondary} numberOfLines={2}>{item.reason}</Text>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
              {item.rating && <Text variant="caption" color={colors.accent}>★ {item.rating}</Text>}
              {item.estimated_cost != null && <Text variant="caption" color={colors.textSecondary}>~{item.estimated_cost}€</Text>}
            </View>
            {item.id && <FeedbackButtons planItemId={item.id} compact />}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
