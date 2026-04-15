import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';
import { getSupabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

interface Props {
  planItemId: string;
  initialLiked?: boolean | null;
}

export function FeedbackButtons({ planItemId, initialLiked }: Props) {
  const colors = useColors();
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

  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      <Pressable
        onPress={() => handleFeedback(true)}
        hitSlop={8}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: 999,
          backgroundColor: liked === true ? colors.success + '20' : 'transparent',
        }}
      >
        <Ionicons
          name={liked === true ? 'heart' : 'heart-outline'}
          size={18}
          color={liked === true ? colors.success : colors.textTertiary}
        />
      </Pressable>
      <Pressable
        onPress={() => handleFeedback(false)}
        hitSlop={8}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: 999,
          backgroundColor: liked === false ? colors.error + '20' : 'transparent',
        }}
      >
        <Ionicons
          name={liked === false ? 'close-circle' : 'close-circle-outline'}
          size={18}
          color={liked === false ? colors.error : colors.textTertiary}
        />
      </Pressable>
    </View>
  );
}
