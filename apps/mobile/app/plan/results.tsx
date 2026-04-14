import { View, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, ScreenContainer } from '@/components/ui';
import { PlanLoading } from '@/components/plan/PlanLoading';
import { PlanItemCard } from '@/components/plan/PlanItemCard';
import { CostBadge } from '@/components/plan/CostBadge';
import { usePlanStore, PlanItem } from '@/stores/plan.store';
import { useTranslation } from '@/i18n';
import { useColors } from '@/theme/useColors';
import { spacing } from '@/theme/spacing';

function CategorySection({ title, items, onItemPress }: { title: string; items: PlanItem[]; onItemPress: (item: PlanItem) => void }) {
  if (items.length === 0) return null;
  const colors = useColors();
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
  const { items, totalCost, isGenerating, error } = usePlanStore();

  if (isGenerating) return <PlanLoading />;

  const restaurants = items.filter((i) => i.category === 'restaurant');
  const activities = items.filter((i) => i.category === 'activity');
  const events = items.filter((i) => i.category === 'event');

  function handleItemPress(item: PlanItem) {
    router.push({ pathname: '/plan/item/[itemId]', params: { itemId: item.id, itemData: JSON.stringify(item) } });
  }

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="h2">{t('plan.yourPlan') || 'Votre plan'}</Text>
          <Pressable onPress={() => router.back()}>
            <Text variant="body" color={colors.accent}>{t('common.cancel') || 'Retour'}</Text>
          </Pressable>
        </View>

        {totalCost && <CostBadge min={totalCost.min} max={totalCost.max} currency={totalCost.currency} />}

        {error && <Text variant="body" color={colors.error}>{error}</Text>}

        {items.length === 0 && !error && (
          <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: spacing['2xl'] }}>
            {t('plan.noResults') || 'Aucun résultat trouvé. Essayez un rayon plus grand.'}
          </Text>
        )}

        <CategorySection title={t('editPrefs.cuisines') || 'Restaurants'} items={restaurants} onItemPress={handleItemPress} />
        <CategorySection title={t('editPrefs.activities') || 'Activités'} items={activities} onItemPress={handleItemPress} />
        <CategorySection title="Événements" items={events} onItemPress={handleItemPress} />
      </View>
    </ScreenContainer>
  );
}
