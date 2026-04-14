import { ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  padding?: boolean;
  style?: ViewStyle;
}

export function ScreenContainer({ children, scroll = true, padding = true, style }: Props) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        padding && { padding: spacing.lg },
        { flexGrow: 1 },
        style,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : children;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {content}
    </SafeAreaView>
  );
}
