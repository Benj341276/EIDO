import { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, ScreenContainer, Button } from '@/components/ui';
import { getSupabase } from '@/lib/supabase';
import { useTranslation } from '@/i18n';
import { useColors } from '@/theme/useColors';
import { spacing, radii } from '@/theme/spacing';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

interface PlanItemRaw {
  id: string;
  category: string;
  name: string;
  address: string | null;
  sort_order: number;
}

function StarRow({ rating, onChange }: { rating: number; onChange: (r: number) => void }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.xs }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => onChange(rating === star ? 0 : star)}
          hitSlop={8}
        >
          <Text
            variant="body"
            style={{ fontSize: 24, color: star <= rating ? '#FFD700' : colors.border }}
          >
            {star <= rating ? '★' : '☆'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function RateVisitScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { planId } = useLocalSearchParams<{ planId: string }>();

  const [items, setItems] = useState<PlanItemRaw[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!planId) { setLoading(false); return; }
    (async () => {
      const { data } = await getSupabase()
        .from('plan_items')
        .select('id, category, name, address, sort_order')
        .eq('plan_id', planId)
        .order('sort_order', { ascending: true });
      setItems(data ?? []);
      setLoading(false);
    })();
  }, [planId]);

  async function handleSubmit() {
    const toRate = Object.entries(ratings).filter(([, r]) => r > 0);
    if (toRate.length === 0) { router.back(); return; }

    setSubmitting(true);
    const { data: session } = await getSupabase().auth.getSession();
    const token = session.session?.access_token;

    await Promise.all(
      toRate.map(async ([itemId, user_rating]) => {
        const res = await fetch(`${API_URL}/plans/${planId}/items/${itemId}/user-rating`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ user_rating }),
        });
      })
    );

    setSubmitting(false);
    router.back();
  }

  const categories = [
    { key: 'restaurant', label: t('editPrefs.cuisines') },
    { key: 'activity', label: t('editPrefs.activities') },
    { key: 'event', label: t('plan.events') },
  ] as const;

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing['2xl'] }} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: spacing.lg, paddingBottom: spacing['2xl'] }}>
          {/* Header */}
          <View style={{ gap: spacing.xs }}>
            <Pressable onPress={() => router.back()}>
              <Text variant="body" color={colors.accent}>← {t('common.back')}</Text>
            </Pressable>
            <Text variant="h2">{t('rateVisit.title')}</Text>
            <Text variant="body" color={colors.textSecondary}>{t('rateVisit.subtitle')}</Text>
          </View>

          {/* Items by category */}
          {categories.map(({ key, label }) => {
            const catItems = items.filter((i) => i.category === key);
            if (catItems.length === 0) return null;
            return (
              <View key={key} style={{ gap: spacing.md }}>
                <Text variant="h3">{label}</Text>
                {catItems.map((item) => (
                  <View
                    key={item.id}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: radii.md,
                      padding: spacing.md,
                      gap: spacing.sm,
                    }}
                  >
                    <Text variant="body" weight="semibold">{item.name}</Text>
                    {item.address && (
                      <Text variant="caption" color={colors.textSecondary}>{item.address}</Text>
                    )}
                    <StarRow
                      rating={ratings[item.id] ?? 0}
                      onChange={(r) => setRatings((prev) => ({ ...prev, [item.id]: r }))}
                    />
                  </View>
                ))}
              </View>
            );
          })}

          {items.length === 0 && (
            <Text variant="body" color={colors.textSecondary} align="center">
              {t('rateVisit.noItems')}
            </Text>
          )}

          {/* Actions */}
          <Button
            title={submitting ? '...' : t('rateVisit.submit')}
            onPress={handleSubmit}
            disabled={submitting}
          />
          <Pressable onPress={() => router.back()} style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
            <Text variant="body" color={colors.textSecondary}>{t('rateVisit.skip')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
