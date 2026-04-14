import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { useLanguageStore, Language } from '@/stores/language.store';
import { useColors } from '@/theme/useColors';
import { spacing, radii } from '@/theme/spacing';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export default function LanguageSelectorScreen() {
  const colors = useColors();
  const router = useRouter();
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  function handleSelect(code: Language) {
    setLanguage(code);
    router.replace('/(auth)/welcome');
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
      }}
    >
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={{ marginBottom: spacing['3xl'] }}>
        <Text variant="h1" align="center">EIDO Life</Text>
      </Animated.View>

      <View style={{ width: '100%', gap: spacing.md }}>
        {LANGUAGES.map((lang, index) => (
          <Animated.View
            key={lang.code}
            entering={FadeInDown.delay(400 + index * 150).duration(500).springify()}
          >
            <Pressable
              onPress={() => handleSelect(lang.code)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                backgroundColor: colors.surface,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing.lg,
              }}
            >
              <Text style={{ fontSize: 28 }}>{lang.flag}</Text>
              <Text variant="h3">{lang.label}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
