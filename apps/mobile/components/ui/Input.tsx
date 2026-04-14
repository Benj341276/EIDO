import { useState } from 'react';
import { View, TextInput, TextInputProps, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { useColors } from '@/theme/useColors';
import { spacing, radii } from '@/theme/spacing';
import { fontSizes } from '@/theme/typography';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, secureTextEntry, style, ...props }: Props) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={{ gap: spacing.xs }}>
      {label && <Text variant="label" color={colors.textSecondary}>{label}</Text>}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: error ? colors.error : focused ? colors.accent : colors.border,
          paddingHorizontal: spacing.md,
        }}
      >
        <TextInput
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={hidden}
          style={[
            { flex: 1, color: colors.textPrimary, fontSize: fontSizes.base, paddingVertical: spacing.md - 2 },
            style,
          ]}
          {...props}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={8}>
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
      {error && <Text variant="caption" color={colors.error}>{error}</Text>}
    </View>
  );
}
