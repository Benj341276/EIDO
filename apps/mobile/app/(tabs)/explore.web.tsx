// Web-only version of the Explorer tab — uses Leaflet instead of react-native-maps.
// Metro resolves this file on web and explore.tsx on native automatically.
import { useEffect, useState } from 'react';
import { View, Pressable, Linking, ScrollView } from 'react-native';
import { MapContainer, TileLayer, Circle, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Text, Button } from '@/components/ui';
import { FeedbackButtons } from '@/components/plan/FeedbackButtons';
import { usePlanStore, PlanItem } from '@/stores/plan.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useTranslation } from '@/i18n';
import { useColors } from '@/theme/useColors';
import { spacing, radii } from '@/theme/spacing';

const CATEGORY_COLORS: Record<string, string> = {
  restaurant: '#FF6B6B',
  activity: '#4ECDC4',
  event: '#FFD93D',
};

function createPinIcon(category: string) {
  const color = CATEGORY_COLORS[category] ?? '#2D7FF9';
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.6)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

// Syncs the Leaflet map view when the plan location changes
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center[0], center[1]]);
  return null;
}

export default function ExploreScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const { items, planLocation, planRadiusKm, revealedCategories } = usePlanStore();
  const preferences = usePreferencesStore((s) => s.preferences);
  const radiusKm = planRadiusKm ?? preferences?.default_radius_km ?? 5;
  const [selectedItem, setSelectedItem] = useState<PlanItem | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  // Inject Leaflet CSS (web only)
  useEffect(() => {
    if (document.querySelector('link[data-leaflet]')) {
      setLeafletReady(true);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.setAttribute('data-leaflet', '1');
    link.onload = () => setLeafletReady(true);
    document.head.appendChild(link);
  }, []);

  const mapCenter = planLocation ?? { lat: 48.8566, lng: 2.3522 };
  const center: [number, number] = [mapCenter.lat, mapCenter.lng];
  // Zoom inversely proportional to radius
  const zoom = Math.round(Math.max(11, 15 - Math.log2(radiusKm + 1)));

  const visibleItems = items.filter(
    (i) => i.latitude && i.longitude &&
      (i.is_visible !== false || revealedCategories.includes(i.category))
  );

  if (!leafletReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="body" color={colors.textSecondary}>Chargement de la carte…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Map */}
      <View style={{ flex: 1 }}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ width: '100%', height: '100%' }}
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={center} />

          {/* Radius circle */}
          <Circle
            center={center}
            radius={radiusKm * 1000}
            pathOptions={{
              color: 'rgba(45,127,249,0.5)',
              fillColor: 'rgba(45,127,249,0.08)',
              fillOpacity: 1,
              weight: 1,
            }}
          />

          {/* Plan item pins */}
          {visibleItems.map((item) => (
            <Marker
              key={item.id || item.name}
              position={[item.latitude!, item.longitude!]}
              icon={createPinIcon(item.category)}
              eventHandlers={{ click: () => setSelectedItem(item) }}
            />
          ))}
        </MapContainer>
      </View>

      {/* Category legend */}
      <View style={{
        position: 'absolute', top: 60, left: spacing.md,
        backgroundColor: colors.surface + 'E0',
        borderRadius: radii.md, padding: spacing.sm, gap: 4,
      }}>
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <View key={cat} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
            <Text variant="label">
              {cat === 'restaurant' ? t('editPrefs.cuisines') : cat === 'activity' ? t('editPrefs.activities') : t('plan.events')}
            </Text>
          </View>
        ))}
      </View>

      {/* No plan message */}
      {items.length === 0 && (
        <View style={{
          position: 'absolute', bottom: 100, left: spacing.lg, right: spacing.lg,
          backgroundColor: colors.surface, borderRadius: radii.lg,
          padding: spacing.md, alignItems: 'center',
        }}>
          <Text variant="body" color={colors.textSecondary} align="center">
            {t('explore.noPlan')}
          </Text>
        </View>
      )}

      {/* Selected item panel */}
      {selectedItem && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: colors.surface,
          borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl,
          padding: spacing.lg, gap: spacing.md,
          shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.2, shadowRadius: 8,
        }}>
          <Pressable onPress={() => setSelectedItem(null)} style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />

          <View style={{ gap: spacing.xs }}>
            <Text variant="h3">{selectedItem.name}</Text>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              {selectedItem.rating && <Text variant="body" color={colors.accent}>★ {selectedItem.rating}</Text>}
              {selectedItem.estimated_cost != null && <Text variant="body" color={colors.textSecondary}>~{selectedItem.estimated_cost}€</Text>}
            </View>
            {selectedItem.address && (
              <Text variant="caption" color={colors.textSecondary}>{selectedItem.address}</Text>
            )}
          </View>

          {selectedItem.id && <FeedbackButtons planItemId={selectedItem.id} compact />}

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button
                title={t('plan.openInMaps')}
                onPress={() => {
                  const url = selectedItem.metadata?.google_maps_url ?? selectedItem.external_url;
                  if (url) Linking.openURL(url as string);
                }}
                variant="secondary"
                size="sm"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Itinéraire"
                onPress={() => {
                  if (!selectedItem.latitude || !selectedItem.longitude) return;
                  Linking.openURL(`https://maps.google.com/?daddr=${selectedItem.latitude},${selectedItem.longitude}`);
                }}
                size="sm"
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
