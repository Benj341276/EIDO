import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Pressable, Linking, Platform } from 'react-native';
import MapView, { Marker, Circle, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
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

export default function ExploreScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const { items, planLocation, planRadiusKm, revealedCategories } = usePlanStore();
  const preferences = usePreferencesStore((s) => s.preferences);
  const prefsRadiusKm = preferences?.default_radius_km ?? 5;
  const radiusKm = planRadiusKm ?? prefsRadiusKm;

  const [deviceLocation, setDeviceLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedItem, setSelectedItem] = useState<PlanItem | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setDeviceLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
  }, []);

  // Animate map when plan location changes (e.g. plan loaded from history)
  useEffect(() => {
    if (!planLocation) return;
    mapRef.current?.animateToRegion(
      {
        latitude: planLocation.lat,
        longitude: planLocation.lng,
        latitudeDelta: radiusKm * 0.018,
        longitudeDelta: radiusKm * 0.018,
      },
      500,
    );
  }, [planLocation, radiusKm]);

  const handleMarkerPress = useCallback((item: PlanItem) => {
    setSelectedItem(item);
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  function openDirections() {
    if (!selectedItem?.latitude || !selectedItem?.longitude) return;
    const lat = selectedItem.latitude;
    const lng = selectedItem.longitude;
    const url = Platform.select({
      ios: `maps:?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
    }) ?? `https://maps.google.com/?daddr=${lat},${lng}`;
    Linking.openURL(url);
  }

  // Use plan location if available (history plan), otherwise fall back to device GPS
  const mapCenter = planLocation ?? deviceLocation;

  if (!mapCenter) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="body" color={colors.textSecondary}>{t('home.searching')}</Text>
      </View>
    );
  }

  const initialRegion: Region = {
    latitude: mapCenter.lat,
    longitude: mapCenter.lng,
    latitudeDelta: radiusKm * 0.018,
    longitudeDelta: radiusKm * 0.018,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Radius circle */}
        <Circle
          center={{ latitude: mapCenter.lat, longitude: mapCenter.lng }}
          radius={radiusKm * 1000}
          strokeColor="rgba(45, 127, 249, 0.3)"
          fillColor="rgba(45, 127, 249, 0.08)"
          strokeWidth={1}
        />

        {/* Plan item pins — only visible items (or revealed via "Voir plus") */}
        {items
          .filter((i) => i.latitude && i.longitude && (i.is_visible !== false || revealedCategories.includes(i.category)))
          .map((item) => (
            <Marker
              key={item.id || item.name}
              coordinate={{ latitude: item.latitude!, longitude: item.longitude! }}
              pinColor={CATEGORY_COLORS[item.category] ?? colors.accent}
              title={item.name}
              onPress={() => handleMarkerPress(item)}
            />
          ))}
      </MapView>

      {/* Legend */}
      <View style={{ position: 'absolute', top: 60, left: spacing.md, backgroundColor: colors.surface + 'E0', borderRadius: radii.md, padding: spacing.sm, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF6B6B' }} />
          <Text variant="label">{t('editPrefs.cuisines')}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#4ECDC4' }} />
          <Text variant="label">{t('editPrefs.activities')}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFD93D' }} />
          <Text variant="label">{t('plan.events')}</Text>
        </View>
      </View>

      {/* No plan message */}
      {items.length === 0 && (
        <View style={{ position: 'absolute', bottom: 100, left: spacing.lg, right: spacing.lg, backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, alignItems: 'center' }}>
          <Text variant="body" color={colors.textSecondary} align="center">
            {t('explore.noPlan')}
          </Text>
        </View>
      )}

      {/* Bottom sheet for selected item */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={[280]}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
      >
        <BottomSheetView style={{ padding: spacing.lg, gap: spacing.md }}>
          {selectedItem && (
            <>
              <View>
                <Text variant="h3">{selectedItem.name}</Text>
                <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs }}>
                  {selectedItem.rating && <Text variant="body" color={colors.accent}>★ {selectedItem.rating}</Text>}
                  {selectedItem.estimated_cost != null && <Text variant="body" color={colors.textSecondary}>~{selectedItem.estimated_cost}€</Text>}
                </View>
                {selectedItem.address && (
                  <Text variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>{selectedItem.address}</Text>
                )}
              </View>

              {selectedItem.id && <FeedbackButtons planItemId={selectedItem.id} compact />}

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Button
                    title={t('plan.openInMaps')}
                    onPress={() => {
                      const url = selectedItem.metadata?.google_maps_url ?? selectedItem.external_url;
                      if (url) Linking.openURL(url);
                    }}
                    variant="secondary"
                    size="sm"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Itinéraire"
                    onPress={openDirections}
                    size="sm"
                  />
                </View>
              </View>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
