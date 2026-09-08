/**
 * One menu row: what the rules allow, the note beside it, and the
 * authored line under it (spec.md, Horizon). Disabled rows stay visible
 * and say why in their line: the menu shows what the rules allow *now*.
 *
 * Two things this row has to get right, both found by the operator's
 * first-impressions pass of 2026-09-08:
 *
 * 1. **A chosen row must look chosen.** Selection used to be a "* "
 *    typed into the caller's title string, which is a mark a reader has
 *    to be told about. It is now `selected`, and it inverts the row -
 *    ink ground, paper type, the same inversion the app already uses
 *    for a primary button - so "which one did I pick" is answered
 *    without reading a word. Callers pass the flag; nothing prefixes a
 *    character onto a name any more.
 * 2. **A long name must stay a name.** The head is a row of title and
 *    note, and the note is sometimes four Proficiencies long ("Body
 *    conditioning - Transmutation - Foresight - Alchemy"). With the
 *    title the only shrinkable box, that note squeezed CULT OF THE
 *    GREAT IMMORTALS down to one letter per line. The head now wraps:
 *    the title holds at least half the width and the note drops to its
 *    own line rather than crushing it.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { color, font } from '../theme/tokens'
import { Source } from './Source'

type Props = {
  readonly title: string
  readonly note: string
  readonly line: string
  /** The citation the row stands on, folded behind a tap. */
  readonly source?: string
  readonly onPress: () => void
  readonly enabled?: boolean
  /** This row is the player's current choice: the row inverts. */
  readonly selected?: boolean
  readonly testID?: string
}

export const MenuButton = ({
  title,
  note,
  line,
  source,
  onPress,
  enabled = true,
  selected = false,
  testID,
}: Props) => (
  <Pressable
    testID={testID}
    accessibilityRole="button"
    accessibilityState={{ disabled: !enabled, selected }}
    disabled={!enabled}
    onPress={onPress}
    style={[styles.row, selected && styles.selected, !enabled && styles.disabled]}
  >
    <View style={styles.head}>
      <Text style={[styles.title, selected && styles.onInk]}>{title.toUpperCase()}</Text>
      {note === '' ? null : <Text style={[styles.note, selected && styles.onInk]}>{note}</Text>}
      {source === undefined ? null : <Source cite={source} />}
    </View>
    {line === '' ? null : <Text style={[styles.line, selected && styles.onInk]}>{line}</Text>}
  </Pressable>
)

const styles = StyleSheet.create({
  row: { backgroundColor: color.paper, borderWidth: 3, borderColor: color.ink, paddingVertical: 7, paddingHorizontal: 9 },
  /** Chosen: the row inverts, the same ink ground a primary button has. */
  selected: { backgroundColor: color.ink },
  /** Type on that ground. One override, applied to all three texts. */
  onInk: { color: color.paper },
  disabled: { backgroundColor: color.disabled, opacity: 0.55 },
  /**
   * `flexWrap` plus a floor on the title is the whole fix: while the
   * two fit on one line they sit as they always did, and the moment
   * they do not the note wraps under instead of stealing the title's
   * width.
   */
  head: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  title: { flexShrink: 1, minWidth: '50%', fontFamily: font.sans, fontSize: 14, fontWeight: '800', letterSpacing: 0.3, color: color.ink },
  note: { flexShrink: 1, fontFamily: font.mono, fontSize: 10, color: color.ink },
  line: { fontFamily: font.serif, fontSize: 13, lineHeight: 18, marginTop: 3, color: color.ink },
})
