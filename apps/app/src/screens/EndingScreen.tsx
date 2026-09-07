/**
 * The ending: the freeze frame, the four scores, and what the XP buys
 * (MH p.34-35, p.87-88; R43-R47; Phase 10i).
 *
 * The book closes its loop with arithmetic the player does, not the app:
 * "assign a number from 1 (poor) to 3 (excellent)" for four things,
 * add them, subtract Dishonor, spend the rest. So the four pickers start
 * blank rather than at 2 - a default here would be the app scoring
 * somebody's own play for them, which `spec.md` refuses - and the sum is
 * shown as arithmetic rather than as a verdict, so a player can see the
 * number they made.
 *
 * The caps are flagged and never refused. A Master who buys SKILL 13 has
 * SKILL 13 and a line saying R45 says otherwise; the app does not
 * overrule a player at their own sheet.
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  CAPS,
  INCREASES,
  XP_CATEGORIES,
  purchase,
  skillBand,
} from '@martial-havoc/engine'
import type { Increase } from '@martial-havoc/engine'
import { rituals, t, techniques, xpCostFor } from '@martial-havoc/content'
import { fill } from '../lib/fill'
import { awardFor, fullyScored } from '../state/reduce'
import type { Action, RecordState } from '../state/types'
import { color, font } from '../theme/tokens'
import { Button } from '../components/Button'
import { MenuButton } from '../components/MenuButton'
import { Slip } from '../components/Slip'
import { Source } from '../components/Source'

type Props = { readonly state: RecordState; readonly dispatch: (a: Action) => void }

/** A titled slip with its citation folded behind SOURCE. */
const Block = ({
  title,
  cite,
  testID,
  children,
}: {
  readonly title: string
  readonly cite: string
  readonly testID?: string
  readonly children: React.ReactNode
}) => (
  <Slip style={styles.slip} testID={testID}>
    <View style={styles.head}>
      <Text style={styles.title}>{title}</Text>
      <Source cite={cite} />
    </View>
    <View style={styles.body}>{children}</View>
  </Slip>
)

export const EndingScreen = ({ state, dispatch }: Props) => {
  const s = state.sheet
  const award = awardFor(state)
  const scored = fullyScored(state)
  const band = skillBand(s.skill)
  const affordable = [...techniques, ...rituals]
    .filter((a) => !s.techniques.includes(a.id) && !s.rituals.includes(a.id))
    .filter((a) => a.cost <= s.resources)
  return (
    <View style={styles.screen} testID="ending">
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
        <Block title={t('ui.ending.freeze')} cite={t('ui.ending.freeze.cite')} testID="freeze-frame">
          <Text testID="freeze-name" style={styles.name}>
            {s.name.toUpperCase()}
          </Text>
          <Text style={styles.line}>
            {fill(t('ui.ending.freeze.treasures'), {
              held: state.cave.treasures.length,
              all: 5,
            })}
          </Text>
          <Text style={styles.line}>
            {fill(t('ui.ending.freeze.foes'), { n: state.cave.defeated.length })}
          </Text>
          <Text testID="freeze-dishonor" style={styles.line}>
            {fill(t('ui.ending.freeze.dishonor'), { n: s.dishonor })}
          </Text>
        </Block>

        <Block title={t('ui.ending.scores')} cite={t('ui.ending.scores.cite')} testID="scores">
          <Text style={styles.note}>{t('ui.ending.scores.note')}</Text>
          {XP_CATEGORIES.map((category) => (
            <View key={category} style={styles.scoreRow}>
              <Text style={styles.label}>{category.toUpperCase()}</Text>
              <View style={styles.picks}>
                {[1, 2, 3].map((value) => (
                  <Button
                    key={value}
                    small
                    testID={`score-${category.split(' ')[0] ?? ''}-${String(value)}`}
                    text={String(value)}
                    primary={state.scores[category] === value}
                    onPress={() => dispatch({ type: 'ending.score', category, value })}
                    style={styles.grow}
                  />
                ))}
              </View>
            </View>
          ))}
          <Text testID="xp-sum" style={styles.sum}>
            {fill(t('ui.ending.xp.sum'), {
              a: state.scores[XP_CATEGORIES[0]] ?? '-',
              b: state.scores[XP_CATEGORIES[1]] ?? '-',
              c: state.scores[XP_CATEGORIES[2]] ?? '-',
              d: state.scores[XP_CATEGORIES[3]] ?? '-',
              dishonor: award.dishonor,
              total: award.total,
            })}
          </Text>
          {scored ? null : <Text style={styles.note}>{t('ui.ending.xp.incomplete')}</Text>}
          {/*
            Banking is a separate press, and once: the ending is a
            screen a player may open twice, and R47 carries a remainder
            forward, so paying twice would be paying twice.
          */}
          {state.scoresBanked ? (
            <Text testID="xp-banked" style={styles.note}>
              {fill(t('ui.ending.xp.banked'), { n: award.total })}
            </Text>
          ) : (
            <Button
              primary
              testID="xp-bank"
              text={fill(t('ui.ending.xp.bank'), { n: award.total })}
              disabled={!scored}
              onPress={() => dispatch({ type: 'ending.bank' })}
            />
          )}
        </Block>

        <Block title={t('ui.ending.advance')} cite={t('ui.ending.advance.cite')} testID="advancement">
          <Text style={styles.line}>
            {fill(t('ui.ending.advance.band'), { skill: s.skill, band })}
          </Text>
          <Text testID="xp-unspent" style={styles.sum}>
            {fill(t('ui.ending.unspent'), { n: s.xp })}
          </Text>
          {INCREASES.map((increase: Increase) => {
            const cost = xpCostFor(increase)(band)?.cost ?? 0
            const priced = purchase({
              increase,
              cost,
              xp: s.xp,
              current: increase === 'SKILL' ? s.skill : increase === 'LUCK' ? s.luck : undefined,
            })
            const cap = CAPS[increase]
            return (
              <MenuButton
                key={increase}
                testID={`buy-${increase.split(' ')[0] ?? ''}`}
                title={increase.toUpperCase()}
                note={fill(t('ui.ending.advance.row'), { n: cost })}
                line={
                  priced.allowed
                    ? priced.affordable
                      ? ''
                      : fill(t('ui.ending.advance.poor'), { n: cost, have: s.xp })
                    : fill(t('ui.ending.advance.cap'), { name: increase, cap: cap ?? 0 })
                }
                enabled={priced.affordable}
                onPress={() => dispatch({ type: 'ending.buy', increase })}
              />
            )
          })}
        </Block>

        <Block title={t('ui.ending.learn')} cite={t('ui.ending.learn.cite')} testID="learn">
          <Text testID="resources" style={styles.line}>
            {fill(t('ui.ending.resources'), { n: s.resources })}
          </Text>
          {affordable.length === 0 ? (
            <Text style={styles.note}>{t('ui.ending.learn.none')}</Text>
          ) : (
            affordable.slice(0, 12).map((ability) => (
              <MenuButton
                key={ability.id}
                testID={`learn-${ability.id}`}
                title={ability.name.toUpperCase()}
                note={fill(t('ui.ending.learn.row'), { name: ability.name, n: ability.cost })}
                line={ability.effect}
                onPress={() => dispatch({ type: 'ending.learn', id: ability.id })}
              />
            ))
          )}
        </Block>

        <Slip dashed style={styles.slip} testID="ending-question">
          <View style={styles.body}>
            <Text style={styles.question}>{t('ui.ending.question')}</Text>
            <Source cite={t('ui.ending.question.cite')} />
          </View>
        </Slip>
      </ScrollView>

      <View style={styles.foot}>
        <Button
          primary
          testID="ending-leave"
          text={t('ui.cave.leave')}
          onPress={() => dispatch({ type: 'cave.leave' })}
          style={styles.grow}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { flex: 1 },
  pageContent: { paddingBottom: 14 },
  slip: { marginTop: 10, marginHorizontal: 14 },
  head: {
    paddingVertical: 6,
    paddingHorizontal: 9,
    backgroundColor: color.ink,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: { flexShrink: 1, fontFamily: font.sans, fontSize: 11, fontWeight: '800', letterSpacing: 0.9, color: color.paper },
  body: { padding: 9, gap: 6 },
  name: { fontFamily: font.sans, fontSize: 18, fontWeight: '800', letterSpacing: 0.4, color: color.ink },
  line: { fontFamily: font.mono, fontSize: 11, lineHeight: 16, color: color.ink },
  note: { fontFamily: font.mono, fontSize: 10, lineHeight: 14, color: color.dim },
  label: { fontFamily: font.sans, fontSize: 9, fontWeight: '800', letterSpacing: 0.8, color: color.ink },
  scoreRow: { gap: 4, marginTop: 4 },
  picks: { flexDirection: 'row', gap: 6 },
  grow: { flex: 1 },
  sum: { fontFamily: font.sans, fontSize: 16, fontWeight: '800', letterSpacing: 0.4, color: color.vermilion },
  question: { fontFamily: font.serif, fontSize: 15, lineHeight: 21, fontStyle: 'italic', color: color.ink },
  foot: { paddingTop: 9, paddingHorizontal: 14, paddingBottom: 14, flexDirection: 'row' },
})
