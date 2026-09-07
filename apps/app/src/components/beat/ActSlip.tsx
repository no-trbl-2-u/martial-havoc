/**
 * The act ladder on screen: the change-of-act slip, and the mark that
 * remembers where the Master is on it.
 *
 * Phase 10c. `acts.json` has carried five rungs since Phase 5 and the
 * engine has computed the current one since then, but no screen ever
 * showed either — so a player could cross the point of no return into
 * the cave, or watch Golden Horn go down, and the app would not say
 * that anything had changed. The book asks for exactly this: "you can
 * draw the outline as you play, marking the transition to a new act and
 * the achievement of plot points" (MH p.85).
 *
 * Two pieces, because they answer two different questions.
 *
 * - {@link ActSlip} answers *what just changed*. It arrives once per
 *   rung, carries the act's name and its authored line, and goes away
 *   on a tap. It is dashed and labelled `invention`, because the acts
 *   are ours: the source is two pages of rooms and prints no arc.
 * - {@link ActMark} answers *where am I*. Five small squares, filled to
 *   the current act. It is drawn rather than written — the book calls
 *   it an outline you draw — and it is always there, so the slip does
 *   not have to be.
 *
 * Neither knows how the ladder is climbed. They are handed an act and a
 * count; `actFor` in the engine decides which rung, and the reducer
 * decides when a rung has been announced.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { t } from '@martial-havoc/content'
import type { AdventureAct } from '@martial-havoc/content'
import { fill } from '../../lib/fill'
import { color, font } from '../../theme/tokens'
import { Pill } from '../Pill'
import { Slip } from '../Slip'
import { Source } from '../Source'

/**
 * The slip that says the act has turned.
 *
 * `onSeen` fires on any tap anywhere on it, including the button: the
 * brief asks for "dismissed by any tap", and a slip a player has to aim
 * at is a slip in the way. The button is there to say that it *can* be
 * dismissed, not to be the only way.
 */
export const ActSlip = ({
  act,
  of,
  master,
  onSeen,
}: {
  readonly act: AdventureAct
  /** How many rungs the ladder has, for "ACT 2 OF 5". */
  readonly of: number
  /** The Master's name, filled into the act's authored line. */
  readonly master: string
  readonly onSeen: () => void
}) => (
  <Pressable onPress={onSeen} testID="act-slip">
    <Slip dashed style={styles.slip}>
      <View style={styles.head}>
        <Text style={styles.heading}>{fill(t('ui.act.heading'), { n: act.act, of })}</Text>
        <Pill label="invention" />
      </View>
      <Text testID="act-name" style={styles.name}>
        {act.name.toUpperCase()}
      </Text>
      <Text testID="act-line" style={styles.line}>
        {fill(act.line, { name: master })}
      </Text>
      <View style={styles.foot}>
        <Text style={styles.dismiss}>{t('ui.act.dismiss')}</Text>
        <Source cite={act.cite} />
      </View>
    </Slip>
  </Pressable>
)

/**
 * The outline, drawn: one square per act, filled to the current one.
 *
 * Text-and-SVG only, like everything else here, so "drawn" means a
 * bordered `View` and not an image. Each square carries the act's name
 * as its accessibility label, which is what serves the brief's long
 * press on a surface that has no long press: a screen reader reads
 * "ACT 3 OF 5 · Past the locked door" and a sighted player reads the
 * slip that announced it.
 */
export const ActMark = ({
  acts,
  current,
}: {
  /** Every rung, in order. */
  readonly acts: readonly AdventureAct[]
  /** The act number the Master is on, or 0 before the first. */
  readonly current: number
}) => (
  <View style={styles.mark} testID="act-mark">
    {acts.map((act) => (
      <View
        key={act.id}
        testID={`act-mark-${act.act}`}
        accessibilityLabel={fill(t('ui.act.mark'), { n: act.act, of: acts.length, name: act.name })}
        style={[styles.pip, act.act <= current && styles.pipFilled]}
      />
    ))}
  </View>
)

/**
 * The slip that says the dice were overruled (MH p.84, R82).
 *
 * It stands beside the result rather than replacing it: the face that
 * was rolled is printed here in words, because the roll card above has
 * already shown the die itself. A player who wants to know why the
 * quiet roll became an Encounter reads the book's own sentence.
 */
export const MomentumSlip = ({
  face,
  was,
}: {
  readonly face: number
  /** The printed text of the row that was rolled, before the override. */
  readonly was: string
}) => (
  <Slip dashed borderColor={color.vermilion} style={styles.slip} testID="momentum">
    <View style={styles.head}>
      <Text style={[styles.heading, styles.momentumHeading]}>{t('ui.momentum.title')}</Text>
      <Pill label="rule" />
    </View>
    <Text style={styles.line}>{t('ui.momentum.line')}</Text>
    <View style={styles.foot}>
      <Text testID="momentum-rolled" style={styles.dismiss}>
        {fill(t('ui.momentum.rolled'), { face, was })}
      </Text>
      <Source cite={t('ui.momentum.cite')} />
    </View>
  </Slip>
)

const styles = StyleSheet.create({
  slip: { marginTop: 10, marginHorizontal: 14, padding: 11 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  heading: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.9, color: color.dim },
  momentumHeading: { color: color.vermilion },
  name: {
    fontFamily: font.sans,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
    color: color.ink,
  },
  line: { marginTop: 6, fontFamily: font.serif, fontSize: 16, lineHeight: 23, color: color.ink },
  foot: {
    marginTop: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  dismiss: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.8, color: color.dim },
  /** The outline: five squares in a row, the filled ones solid ink. */
  mark: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  pip: { width: 7, height: 7, borderWidth: 2, borderColor: color.ink, backgroundColor: 'transparent' },
  pipFilled: { backgroundColor: color.ink },
})
