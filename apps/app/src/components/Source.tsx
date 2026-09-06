/**
 * A citation, folded. The play surface shows the word SOURCE; a tap
 * unfolds the folio, the rule id or the reading it stands on, and a
 * second tap folds it away again.
 *
 * Every result, every menu row and every step of creation still
 * carries its citation (spec.md, Refusals: every behaviour labelled
 * and cited). What changed on 2026-09-06 is where it sits: behind a
 * tap, not beside the sentence a player is reading. A citation on the
 * play surface reads as noise to anyone who did not write it; behind a
 * tap it is a promise kept for anyone who asks.
 *
 * Local state only: whether a citation is unfolded is nobody's record.
 */
import { useState } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { t } from '@martial-havoc/content'
import { color, font } from '../theme/tokens'

type Props = {
  readonly cite: string
  /** Fill the row rather than sit inline at the right. */
  readonly wide?: boolean
  readonly testID?: string
}

export const Source = ({ cite, wide = false, testID }: Props) => {
  const [open, setOpen] = useState(false)
  return (
    <Pressable
      accessibilityRole="button"
      testID={testID}
      onPress={() => setOpen((o) => !o)}
      hitSlop={6}
      style={[styles.row, open && styles.rowOpen, wide && styles.wide]}
    >
      <Text style={[styles.text, open && styles.open]}>{open ? cite : t('ui.source')}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  /** Folded, the word never wraps; unfolded, the citation may. */
  row: { alignSelf: 'flex-end', flexShrink: 0 },
  rowOpen: { flexShrink: 1 },
  wide: { alignSelf: 'stretch' },
  text: { fontFamily: font.mono, fontSize: 9, letterSpacing: 0.8, color: color.dim, textAlign: 'right' },
  open: { letterSpacing: 0, lineHeight: 14 },
})
