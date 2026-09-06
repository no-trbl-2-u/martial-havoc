/** The Master's numbers in reach: SKILL, ENDURANCE, LUCK, gold (R01). */
import { StyleSheet, Text, View } from 'react-native'
import { t } from '@martial-havoc/content'
import { color, font } from '../theme/tokens'
import type { Sheet } from '../state/types'

type Cell = { readonly id: string; readonly value: number; readonly inverted?: boolean; readonly wide?: boolean }

export const AttributeStrip = ({ sheet }: { readonly sheet: Sheet }) => {
  const cells: readonly Cell[] = [
    { id: 'skill', value: sheet.skill },
    { id: 'endurance', value: sheet.endurance, inverted: true, wide: true },
    { id: 'luck', value: sheet.luck },
    { id: 'gold', value: sheet.gold },
  ]
  return (
    <View style={styles.strip}>
      {cells.map((c, i) => (
        <View
          key={c.id}
          style={[
            styles.cell,
            c.wide && styles.wide,
            i < cells.length - 1 && styles.divider,
            c.inverted && styles.inverted,
          ]}
        >
          <Text style={[styles.name, c.inverted && styles.onInk]}>{t(`ui.attr.${c.id}`)}</Text>
          <Text testID={`attr-${c.id}`} style={[styles.value, c.inverted && styles.onInk]}>
            {c.value}
          </Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  strip: { flexDirection: 'row', backgroundColor: color.paper, borderWidth: 3, borderColor: color.ink },
  cell: { flex: 1, paddingVertical: 5, alignItems: 'center' },
  wide: { flex: 1.3 },
  divider: { borderRightWidth: 2, borderRightColor: color.ink },
  inverted: { backgroundColor: color.ink },
  name: { fontFamily: font.sans, fontSize: 9, fontWeight: '800', color: color.ink },
  value: { fontFamily: font.sans, fontSize: 17, fontWeight: '800', color: color.ink },
  onInk: { color: color.paper },
})
