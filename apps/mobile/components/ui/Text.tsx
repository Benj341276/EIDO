import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { fontSizes, fontWeights, lineHeights } from '@/theme/typography';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  weight?: keyof typeof fontWeights;
  align?: TextStyle['textAlign'];
}

const variantStyles: Record<Variant, TextStyle> = {
  display: { fontSize: fontSizes.display, lineHeight: lineHeights.display, fontWeight: fontWeights.bold },
  h1: { fontSize: fontSizes['3xl'], lineHeight: lineHeights['3xl'], fontWeight: fontWeights.bold },
  h2: { fontSize: fontSizes['2xl'], lineHeight: lineHeights['2xl'], fontWeight: fontWeights.semibold },
  h3: { fontSize: fontSizes.xl, lineHeight: lineHeights.xl, fontWeight: fontWeights.semibold },
  body: { fontSize: fontSizes.base, lineHeight: lineHeights.base, fontWeight: fontWeights.regular },
  caption: { fontSize: fontSizes.sm, lineHeight: lineHeights.sm, fontWeight: fontWeights.regular },
  label: { fontSize: fontSizes.xs, lineHeight: lineHeights.xs, fontWeight: fontWeights.medium },
};

export function Text({ variant = 'body', color, weight, align, style, ...props }: Props) {
  return (
    <RNText
      style={[
        { color: color ?? colors.textPrimary },
        variantStyles[variant],
        weight && { fontWeight: fontWeights[weight] },
        align && { textAlign: align },
        style,
      ]}
      {...props}
    />
  );
}
