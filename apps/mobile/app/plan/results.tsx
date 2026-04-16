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

function CategorySection({
  title,
  items,
  hiddenCount,
  onReveal,
  onItemPress,
}: {
  title: string;
  items: PlanItem[];
  hiddenCount: number;
  onReveal: () => void;
  onItemPress: (item: PlanItem) => void;
}) {
  const colors = useColors();
  const { t } = useTranslation();
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
      {hiddenCount > 0 && (
        <Pressable onPress={onReveal} style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.xs }}>
          <Text variant="body" color={colors.accent}>
            {t('plan.showMore').replace('{count}', String(hiddenCount))}
          </Text>
        </Pressable>
      )}
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
  const { revealedCategories, revealCategory } = storeState;

  if (isLoading) return <PlanLoading />;

  function splitCategory(category: string) {
    const all = items.filter((i) => i.category === category);
    const revealed = revealedCategories.includes(category);
    const visible = revealed ? all : all.filter((i) => i.is_visible !== false);
    const hiddenCount = revealed ? 0 : all.filter((i) => i.is_visible === false).length;
    return { visible, hiddenCount };
  }

  const { visible: restaurants, hiddenCount: hiddenRestaurants } = splitCategory('restaurant');
  const { visible: activities, hiddenCount: hiddenActivities } = splitCategory('activity');
  const { visible: events, hiddenCount: hiddenEvents } = splitCategory('event');

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

        <CategorySection
          title={t('editPrefs.cuisines')}
          items={restaurants}
          hiddenCount={hiddenRestaurants}
          onReveal={() => revealCategory('restaurant')}
          onItemPress={handleItemPress}
        />
        <CategorySection
          title={t('editPrefs.activities')}
          items={activities}
          hiddenCount={hiddenActivities}
          onReveal={() => revealCategory('activity')}
          onItemPress={handleItemPress}
        />
        <CategorySection
          title={t('plan.events')}
          items={events}
          hiddenCount={hiddenEvents}
          onReveal={() => revealCategory('event')}
          onItemPress={handleItemPress}
        />
      </View>
    </ScreenContainer>
  );
}
