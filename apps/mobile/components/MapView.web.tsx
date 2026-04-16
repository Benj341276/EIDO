// Web stub — react-native-maps is not supported on web.
// Expo resolves this file on web and MapView.native.tsx on mobile.
import { View } from 'react-native';

export default function MapView(_props: any) {
  return <View style={{ flex: 1 }} />;
}

export function Marker(_props: any) { return null; }
export function Circle(_props: any) { return null; }

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};
