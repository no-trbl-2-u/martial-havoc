/**
 * The Adventures table, rolled on a card (MH p.36-39, R50).
 *
 * Why a card and not a list. The table has thirty-six rows, and the
 * step used to print all of them under the ROLL button. That made the
 * first screen of creation a wall of other people's stories to scroll
 * past before reaching the second step, and it made the roll look
 * optional - a shortcut through a menu rather than the thing the book
 * asks for. The operator's first-impressions pass of 2026-09-08 called
 * it: roll, read the one row the dice gave, keep it or roll again.
 *
 * So this card shows exactly one row - its d66 address and its printed
 * text - over a dimmed page, with two ways out:
 *
 * - **CONTINUE** takes the row. It is already on the record: the
 *   reducer wrote `motiveId` when the roll was dispatched, so this
 *   button only closes the card. Nothing is confirmed twice.
 * - **ROLL AGAIN** re-rolls in place. The card stays up and the row
 *   under it changes, which is what re-rolling looks like at a table.
 *
 * There is no free-text field. The motive is a row of the book's table
 * or it is nothing (`ui.creation.motive.none` reads for the nothing),
 * and a Master may leave the step without rolling at all: creation
 * "reports the numbers and never refuses" (spec.md), and this step
 * changes no table either way.
 *
 * This component holds no rule and no copy: the row it prints comes
 * from `@martial-havoc/content` and the two labels are strings.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { t } from '@martial-havoc/content'
import type { D66Text } from '@martial-havoc/content'
import { color, font } from '../../theme/tokens'
import { Button } from '../Button'
import { Source } from '../Source'

type Props = {
  /** The row the dice gave, or null when the roll found none. */
  readonly hook: D66Text | null
  /** Roll the table again; the card stays up. */
  readonly onRoll: () => void
  /** Keep this row and close. */
  readonly onContinue: () => void
}

export const MotiveCard = ({ hook, onRoll, onContinue }: Props) => (
  <View style={styles.overlay} testID="motive-card">
    {/* Tapping the dim is the same as CONTINUE: the row is already kept. */}
    <Pressable
      style={styles.dim}
      accessibilityRole="none"
      testID="motive-card-outside"
      onPress={onContinue}
    />
    <View style={styles.shadow}>
      <View style={styles.card}>
        <View style={styles.head}>
          <Text style={styles.headText} numberOfLines={1}>
            {t('ui.creation.motive.title')}
          </Text>
          {hook === null ? null : (
            <Text testID="motive-card-d66" style={styles.d66}>
              {hook.d66}
            </Text>
          )}
        </View>

        <Text testID="motive-card-text" style={styles.text}>
          {hook?.text ?? t('ui.creation.motive.none')}
        </Text>

        <View style={styles.cite}>
          <Source testID="motive-card-source" cite={t('ui.creation.motive.source')} />
        </View>

        <View style={styles.foot}>
          <Button
            testID="motive-card-again"
            text={t('ui.creation.motive.again')}
            onPress={onRoll}
            style={styles.grow}
          />
          <Button
            testID="motive-card-continue"
            primary
            text={t('ui.card.continue')}
            onPress={onContinue}
            style={styles.grow}
          />
        </View>
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  /** Over the whole creation page, below the header and the strip. */
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-start',
    paddingTop: 40,
    paddingHorizontal: 14,
  },
  dim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(22, 17, 12, 0.55)' },
  /** The woodblock's drop: an offset ink slab, no blur (see RollCard). */
  shadow: { backgroundColor: color.ink, paddingRight: 6, paddingBottom: 6 },
  card: { backgroundColor: color.paper, borderWidth: 3, borderColor: color.ink },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 9,
    backgroundColor: color.ink,
  },
  headText: { flexShrink: 1, fontFamily: font.sans, fontSize: 11, fontWeight: '800', letterSpacing: 0.9, color: color.paper },
  /** The table's own address for the row, printed as the book prints it. */
  d66: { fontFamily: font.mono, fontSize: 15, fontWeight: '800', color: color.paper },
  text: { fontFamily: font.serif, fontSize: 16, lineHeight: 23, padding: 12, color: color.ink },
  cite: { paddingHorizontal: 9, paddingBottom: 6 },
  foot: { flexDirection: 'row', gap: 7, borderTopWidth: 3, borderTopColor: color.ink, padding: 9 },
  grow: { flex: 1 },
})
