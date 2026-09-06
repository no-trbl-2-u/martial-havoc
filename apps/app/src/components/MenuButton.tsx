/**
 * One menu row: what the rules allow, the note beside it, and the
 * authored line under it (spec.md, Horizon). Disabled rows stay visible
 * and say why in their line: the menu shows what the rules allow *now*.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { color, font } from '../theme/tokens'

type Props = {
  readonly title: string
  readonly note: string
  readonly line: string
  readonly onPress: () => void
  readonly enabled?: boolean
  readonly testID?: string
}

export const MenuButton = ({ title, note, line, onPress, enabled = true, testID }: Props) => (
  <Pressable
    testID={testID}
    accessibilityRole="button"
    accessibilityState={{ disabled: !enabled }}
    disabled={!enabled}
    onPress={onPress}
    style={[styles.row, !enabled && styles.disabled]}
  >
    <View style={styles.head}>
      <Text style={styles.title}>{title.toUpperCase()}</Text>
      <Text style={styles.note}>{note}</Text>
    </View>
    <Text style={styles.line}>{line}</Text>
  </Pressable>
)

const styles = StyleSheet.create({
  row: { backgroundColor: color.paper, borderWidth: 3, borderColor: color.ink, paddingVertical: 7, paddingHorizontal: 9 },
  disabled: { backgroundColor: color.disabled, opacity: 0.55 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  title: { flexShrink: 1, fontFamily: font.sans, fontSize: 14, fontWeight: '800', letterSpacing: 0.3, color: color.ink },
  note: { fontFamily: font.mono, fontSize: 10, color: color.ink },
  line: { fontFamily: font.serif, fontSize: 13, lineHeight: 18, marginTop: 3, color: color.ink },
})
