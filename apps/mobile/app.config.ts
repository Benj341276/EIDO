import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'EIDO Life',
  slug: 'eido-life',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'eidolife',
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  icon: './assets/images/icon.png',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.eidolife.app',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'EIDO Life uses your location to find nearby places and events.',
    },
  },
  android: {
    package: 'com.eidolife.app',
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    adaptiveIcon: {
      backgroundColor: '#0A0A0A',
      foregroundImage: './assets/images/android-icon-foreground.png',
    },
    edgeToEdgeEnabled: true,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#0A0A0A',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'EIDO Life uses your location to find nearby places and events.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
