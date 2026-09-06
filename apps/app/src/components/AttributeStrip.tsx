/**
 * The Master's numbers in reach: SKILL, ENDURANCE, LUCK, gold (R01).
 *
 * While a Master is being made the record carries a placeholder sheet,
 * and showing that would claim a Master that does not exist yet (the
 * operator's note, 2026-09-06); so creation passes `values` instead,
 * each null until its dice have been rolled, and a null cell draws a
 * dash. The strip fills in as the Master does.
 */
import { StyleSheet, Text, View } from 'react-native'
import { t } from '@martial-havoc/content'
import { color, font } from '../theme/tokens'

/** The four numbers, each null while it is still unrolled. */
export type StripValues = {
  readonly skill: number | null
  readonly endurance: number | null
  readonly luck: number | null
  readonly gold: number | null
}

type Cell = { readonly id: string; readonly value: number | null; readonly inverted?: boolean; readonly wide?: boolean }

export const AttributeStrip = ({ values }: { readonly values: StripValues }) => {
  const cells: readonly Cell[] = [
    { id: 'skill', value: values.skill },
    { id: 'endurance', value: values.endurance, inverted: true, wide: true },
    { id: 'luck', value: values.luck },
    { id: 'gold', value: values.gold },
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
            {c.value === null ? t('ui.attr.blank') : c.value}
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
