import { useState, useEffect } from 'react';
import { View, FlatList, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text, ScreenContainer } from '@/components/ui';
import { PlanLoading } from '@/components/plan/PlanLoading';
import { PlanItemCard } from '@/components/plan/PlanItemCard';
import { CostBadge } from '@/components/plan/CostBadge';
import { usePlanStore, PlanItem } from '@/stores/plan.store';
import { getSupabase } from '@/lib/supabase';
import { useTranslation } from '@/i18n';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';

function CategorySection({ title, items, onItemPress }: { title: string; items: PlanItem[]; onItemPress: (item: PlanItem) => void }) {
  if (items.length === 0) return null;
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="h3" style={{ paddingHorizontal: spacing.lg }}>{title}</Text>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => item.id || item.name}
        renderItem={({ item }) => <PlanItemCard item={item} onPress={() => onItemPress(item)} />}
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

export default function PlanResultsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { planId: paramPlanId } = useLocalSearchParams<{ planId?: string }>();
  const storeState = usePlanStore();

  const [historyItems, setHistoryItems] = useState<PlanItem[]>([]);
  const [historyCost, setHistoryCost] = useState<{ min: number; max: number; currency: string } | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const isFromHistory = !!paramPlanId;

  useEffect(() => {
    if (!paramPlanId) return;
    setLoadingHistory(true);
    (async () => {
      const { data: plan } = await getSupabase()
        .from('plans')
        .select('*, plan_items(*)')
        .eq('id', paramPlanId)
        .single();

      if (plan) {
        const sorted = (plan.plan_items ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);
        setHistoryItems(sorted);

        // Sync plan store so the Explorer tab reflects this plan
        if (plan.latitude != null && plan.longitude != null) {
          storeState.setActivePlan(sorted, { lat: plan.latitude, lng: plan.longitude }, plan.radius_km);
        }

        if (plan.total_estimated_cost) {
          setHistoryCost({ min: Math.round(plan.total_estimated_cost * 0.6), max: plan.total_estimated_cost, currency: 'EUR' });
        }
      }
      setLoadingHistory(false);
    })();
  }, [paramPlanId]);

  const items = isFromHistory ? historyItems : storeState.items;
  const totalCost = isFromHistory ? historyCost : storeState.totalCost;
  const isLoading = isFromHistory ? loadingHistory : storeState.isGenerating;
  const error = isFromHistory ? null : storeState.error;

  if (isLoading) return <PlanLoading />;

  const restaurants = items.filter((i) => i.category === 'restaurant');
  const activities = items.filter((i) => i.category === 'activity');
  const events = items.filter((i) => i.category === 'event');

  function handleItemPress(item: PlanItem) {
    router.push({ pathname: '/plan/item/[itemId]', params: { itemId: item.id, itemData: JSON.stringify(item) } });
  }

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.lg }}>
        {/* Header */}
        <View style={{ gap: spacing.xs }}>
          <Pressable
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Text variant="body" color={colors.accent}>←</Text>
            <Text variant="body" color={colors.accent}>{t('common.back')}</Text>
          </Pressable>
          <Text variant="h2">{t('plan.yourPlan')}</Text>
          {!isFromHistory && (
            <Text variant="caption" color={colors.textSecondary}>
              {t('plan.savedInHistory')}
            </Text>
          )}
        </View>

        {totalCost && <CostBadge min={totalCost.min} max={totalCost.max} currency={totalCost.currency} />}

        {error && <Text variant="body" color={colors.error}>{error}</Text>}

        {items.length === 0 && !error && (
          <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: spacing['2xl'] }}>
            {t('plan.noResults')}
          </Text>
        )}

        <CategorySection title={t('editPrefs.cuisines')} items={restaurants} onItemPress={handleItemPress} />
        <CategorySection title={t('editPrefs.activities')} items={activities} onItemPress={handleItemPress} />
        <CategorySection title={t('plan.events')} items={events} onItemPress={handleItemPress} />
      </View>
    </ScreenContainer>
  );
}
