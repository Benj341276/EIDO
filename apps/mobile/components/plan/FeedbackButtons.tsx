import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useColors } from '@/theme/useColors';
import { useTranslation } from '@/i18n';
import { spacing, radii } from '@/theme/spacing';
import { getSupabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

interface Props {
  planItemId: string;
  initialLiked?: boolean | null;
  compact?: boolean;
}

export function FeedbackButtons({ planItemId, initialLiked, compact }: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const [liked, setLiked] = useState<boolean | null>(initialLiked ?? null);
  const userId = useAuthStore((s) => s.user?.id);

  async function handleFeedback(value: boolean) {
    if (!userId || !planItemId) return;
    const newValue = liked === value ? null : value;
    setLiked(newValue);

    await getSupabase()
      .from('feedback')
      .upsert(
        { user_id: userId, plan_item_id: planItemId, liked: newValue },
        { onConflict: 'user_id,plan_item_id' }
      );
  }

  if (compact) {
    return (
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Pressable onPress={() => handleFeedback(true)} hitSlop={8}
          style={{ padding: 6, borderRadius: radii.full, backgroundColor: liked === true ? colors.success + '30' : colors.surface }}>
          <Ionicons name={liked === true ? 'heart' : 'heart-outline'} size={20} color={liked === true ? colors.success : colors.textTertiary} />
        </Pressable>
        <Pressable onPress={() => handleFeedback(false)} hitSlop={8}
          style={{ padding: 6, borderRadius: radii.full, backgroundColor: liked === false ? colors.error + '30' : colors.surface }}>
          <Ionicons name={liked === false ? 'close-circle' : 'close-circle-outline'} size={20} color={liked === false ? colors.error : colors.textTertiary} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      <Pressable
        onPress={() => handleFeedback(true)}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          paddingVertical: spacing.sm + 2,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: liked === true ? colors.success : colors.border,
          backgroundColor: liked === true ? colors.success + '20' : 'transparent',
        }}
      >
        <Ionicons name={liked === true ? 'heart' : 'heart-outline'} size={22} color={liked === true ? colors.success : colors.textSecondary} />
        <Text variant="caption" weight="semibold" color={liked === true ? colors.success : colors.textSecondary}>
          {t('plan.interested') || 'Intéressé'}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => handleFeedback(false)}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          paddingVertical: spacing.sm + 2,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: liked === false ? colors.error : colors.border,
          backgroundColor: liked === false ? colors.error + '20' : 'transparent',
        }}
      >
        <Ionicons name={liked === false ? 'close-circle' : 'close-circle-outline'} size={22} color={liked === false ? colors.error : colors.textSecondary} />
        <Text variant="caption" weight="semibold" color={liked === false ? colors.error : colors.textSecondary}>
          {t('plan.notInterested') || 'Pas intéressé'}
        </Text>
      </Pressable>
    </View>
  );
}
