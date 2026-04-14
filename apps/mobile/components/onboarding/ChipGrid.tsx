import { View } from 'react-native';
import { Chip } from '@/components/ui';
import { spacing } from '@/theme/spacing';

interface Props {
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  labelFn?: (key: string) => string;
}

export function ChipGrid({ options, selected, onToggle, labelFn }: Props) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {options.map((option) => (
        <Chip
          key={option}
          label={labelFn ? labelFn(option) : option}
          selected={selected.includes(option)}
          onPress={() => onToggle(option)}
        />
      ))}
    </View>
  );
}
