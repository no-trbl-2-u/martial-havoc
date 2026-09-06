/**
 * The label pill: rule, reading or invention, legible by glyph and
 * border as well as by colour (design/V1-DESIGN-PROMPT.md).
 */
import { StyleSheet, Text, View } from 'react-native'
import type { Label } from '@martial-havoc/engine'
import { t } from '@martial-havoc/content'
import { color, font } from '../theme/tokens'

type Props = {
  readonly label: Label
  /** Override the pill's text (the result slip prints a citation instead). */
  readonly text?: string
}

const look: Readonly<Record<Label, { bg: string; fg: string; dashed: boolean }>> = {
  rule: { bg: color.ink, fg: color.paper, dashed: false },
  reading: { bg: color.vermilion, fg: color.paper, dashed: false },
  invention: { bg: color.paper, fg: color.ink, dashed: true },
}

export const Pill = ({ label, text }: Props) => {
  const l = look[label]
  return (
    <View
      testID={`pill-${label}`}
      style={[styles.pill, { backgroundColor: l.bg }, l.dashed && styles.dashed]}
    >
      <Text style={[styles.text, { color: l.fg }]}>
        {t(`ui.label.glyph.${label}`)} {text ?? t(`ui.label.${label}`)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 6, paddingVertical: 2, borderWidth: 2, borderColor: color.ink },
  dashed: { borderStyle: 'dashed' },
  text: { fontFamily: font.sans, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
})
