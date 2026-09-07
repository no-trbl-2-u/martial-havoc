/**
 * The narrator's mark: how Old Ping appears, and the only way he does.
 *
 * Phase 10a gave the app a voice and, with it, the problem the voice
 * creates — a reader must never mistake a line we wrote for a line the
 * book prints. `plan/VOICE.md`, "How he appears", settles it in one
 * sentence: *italic type, under a dashed rule, with his name in small
 * capitals at the rule.* This component is that sentence, and nothing
 * else in the app is allowed to print him.
 *
 * Three things follow from the guide and are enforced here rather than
 * at each call site:
 *
 * 1. **The dashed rule is the tell.** Everywhere else in this app a
 *    dashed edge means "ours, or optional" (see `Slip`'s `dashed`). The
 *    narrator borrows the same vocabulary rather than inventing a
 *    second one, so a player who has learned what a dashed edge means
 *    already knows what this is.
 * 2. **His name is a content record, not a string here.** `ui.narrator.name`
 *    is the one place "OLD PING" is written (agents.md rule 7), which is
 *    what makes VOICE.md's "Renaming him" paragraph true: change the
 *    record and nothing else knows his name.
 * 3. **Silence renders nothing.** A `line` of null is not an empty slip
 *    or a blank rule — it is the absence of the narrator, which is the
 *    resting state on every surface VOICE.md keeps him off.
 *
 * He carries no citation. A citation would make him look like a source;
 * he is the app admitting it is speaking, and the dashed rule says so
 * more honestly than a folio would.
 */
import { StyleSheet, Text, View } from 'react-native'
import { t } from '@martial-havoc/content'
import { color, font } from '../theme/tokens'

type Props = {
  /** The line, already filled. Null is silence: nothing renders at all. */
  readonly line: string | null
  readonly testID?: string
  readonly style?: object
}

export const Narrator = ({ line, testID = 'narrator', style }: Props) =>
  line === null || line.length === 0 ? null : (
    <View testID={testID} style={[styles.rule, style]}>
      <Text testID={`${testID}-name`} style={styles.name}>
        {t('ui.narrator.name')}
      </Text>
      <Text testID={`${testID}-line`} style={styles.line}>
        {line}
      </Text>
    </View>
  )

const styles = StyleSheet.create({
  /**
   * The dashed rule. Only the top edge is drawn: this sits under the
   * book's text inside a slip that already has its own border, so a
   * full dashed box would read as a second, competing container.
   */
  rule: {
    marginTop: 9,
    paddingTop: 7,
    borderTopWidth: 2,
    borderTopColor: color.dim,
    borderStyle: 'dashed',
  },
  /** His name at the rule, in small capitals: tracked, dim, never loud. */
  name: {
    fontFamily: font.sans,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: color.dim,
  },
  /** The line itself: the serif the app gives every authored line, italic. */
  line: {
    marginTop: 3,
    fontFamily: font.serif,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    color: color.ink,
  },
})
