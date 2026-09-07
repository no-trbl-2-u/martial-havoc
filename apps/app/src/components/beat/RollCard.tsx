/**
 * The roll card: what the roll is for, the dice tumbling and landing,
 * and a plate keyed to the reason (design/roll-modal, reading A; the
 * operator's pick and notes of 2026-09-06).
 *
 * Two states, both the reducer's (`state.roll.landed`), one button:
 *
 * - **landed** - the move rolled at once. The dice tumble, then the
 *   result: title, label pill, the faces, the Event's printed text, what
 *   it brought and its citation. CONTINUE closes the card and the
 *   result slip takes over on the sheet, so the labelled, cited result
 *   never leaves the screen (design/INDEX.md).
 * - **picker** - MY DICE was on, so the card opened unrolled: the six
 *   faces to tap. CONTINUE resolves the move on the tapped face (a
 *   second face, if tapped, is the creature roll), counts an override
 *   (spec.md, Horizon) and the card lands. A tap outside the card
 *   before that is a change of mind and closes it.
 *
 * The card dispatches three actions and nothing else; every number it
 * prints comes from the reason the screen resolved or the mapped result.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { t } from '@martial-havoc/content'
import type { Die as DieFace } from '@martial-havoc/engine'
import { color, font } from '../../theme/tokens'
import { Button } from '../Button'
import { Die } from '../Die'
import { ManualDice } from '../ManualDice'
import { Pill } from '../Pill'
import { Narrator } from '../Narrator'
import { Plate } from '../Plate'
import { Source } from '../Source'
import type { PlateKey } from '../Plate'
import { cycleFace, useTumble } from '../../hooks/useTumble'
import type { ShownResult } from './shown'
import type { Action, RecordState, RollCard as RollCardState } from '../../state/types'

/** What the card is for, resolved by the screen that opens it. */
export type RollCardReason = {
  readonly title: string
  readonly note: string
  readonly plate: PlateKey
  /** How many faces the picker needs before CONTINUE is live. */
  readonly need: 1 | 2
}

type Props = {
  readonly state: RecordState
  readonly card: RollCardState
  readonly reason: RollCardReason
  /** The landed result, mapped for display; null until the roll. */
  readonly result: ShownResult | null
  readonly dispatch: (a: Action) => void
}

/** A die on the card: cycling while it tumbles, the real face once settled. */
const CardDie = ({
  face,
  step,
  settled,
  offset,
  testID,
}: {
  readonly face: DieFace
  readonly step: number
  readonly settled: boolean
  readonly offset: number
  readonly testID: string
}) => <Die size={72} face={settled ? face : cycleFace(step, offset)} testID={testID} />

export const RollCard = ({ state, card, reason, result, dispatch }: Props) => {
  const landed = card.landed && result !== null
  const { step, settled } = useTumble(landed)
  const shown = landed && settled
  const manualReady = state.manual.length >= reason.need

  const headText = shown ? result.title : landed ? t('ui.card.rolling') : t('ui.card.ready')

  return (
    <View style={styles.overlay} testID="roll-card">
      <Pressable
        style={styles.dim}
        accessibilityRole="none"
        testID="roll-card-outside"
        onPress={() => (landed ? undefined : dispatch({ type: 'roll.close' }))}
      />
      <View style={styles.shadow}>
        <View style={styles.card}>
          <View style={styles.head}>
            <Text style={styles.headText} numberOfLines={1}>
              {headText}
            </Text>
            {shown ? <Pill label={result.label} /> : null}
          </View>

          <View style={styles.reason}>
            <Text style={styles.title} testID="roll-card-title">
              {reason.title}
            </Text>
            <Text style={styles.note}>{reason.note}</Text>
          </View>

          <View style={styles.body}>
            {landed ? (
              <View style={styles.diceRow}>
                {result.a === null ? null : (
                  <CardDie face={result.a} step={step} settled={settled} offset={0} testID="die-card-a" />
                )}
                {result.b === null ? null : (
                  <CardDie face={result.b} step={step} settled={settled} offset={3} testID="die-card-b" />
                )}
                {shown ? (
                  <View style={styles.numbers}>
                    <Text
                      testID="roll-card-total"
                      style={[styles.total, result.total.length > 4 && styles.totalText]}
                    >
                      {result.total}
                    </Text>
                    <Text style={styles.against}>{result.against}</Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <ManualDice
                manual={state.manual}
                need={reason.need}
                onFace={(face) => dispatch({ type: 'manual.face', face })}
              />
            )}
          </View>

          {shown && result.passage !== null ? (
            <Text testID="roll-card-passage" style={styles.passage}>
              {result.passage}
            </Text>
          ) : (
            <View style={styles.plate}>
              <Plate plate={reason.plate} />
            </View>
          )}

          {shown && result.narrator !== null ? (
            <Narrator testID="roll-card-narrator" line={result.narrator} style={styles.narrator} />
          ) : null}

          {shown ? (
            <View style={styles.cite}>
              <Source testID="roll-card-source" cite={result.cite} />
            </View>
          ) : null}

          <View style={styles.foot}>
            <Button
              testID="roll-card-continue"
              primary
              text={t('ui.card.continue')}
              onPress={() => dispatch({ type: landed ? 'roll.close' : 'roll' })}
              disabled={landed ? !settled : !manualReady}
              style={styles.grow}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  /** Over the whole beat, below the header and the strip. */
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, justifyContent: 'flex-start', paddingTop: 24, paddingHorizontal: 14 },
  dim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(22, 17, 12, 0.55)' },
  /** The woodblock's drop: an offset ink slab, no blur. */
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
  reason: { paddingTop: 9, paddingHorizontal: 9 },
  title: { fontFamily: font.sans, fontSize: 14, fontWeight: '800', letterSpacing: 0.3, color: color.ink },
  note: { fontFamily: font.mono, fontSize: 10, marginTop: 2, color: color.ink },
  body: { paddingVertical: 12, paddingHorizontal: 9 },
  diceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  numbers: { marginLeft: 'auto', alignItems: 'flex-end', flexShrink: 1 },
  total: { fontFamily: font.sans, fontSize: 44, fontWeight: '800', lineHeight: 46, color: color.ink },
  totalText: { fontSize: 20, lineHeight: 24, textAlign: 'right' },
  against: { fontFamily: font.mono, fontSize: 10, color: color.ink, textAlign: 'right' },
  plate: { paddingHorizontal: 9, paddingBottom: 9 },
  passage: {
    paddingHorizontal: 9,
    paddingBottom: 12,
    fontFamily: font.serif,
    fontSize: 15,
    lineHeight: 21,
    fontStyle: 'italic',
    color: color.ink,
  },
  /** His rule inset to the card's text column, clear of the plate above. */
  narrator: { marginHorizontal: 12, marginBottom: 4 },
  cite: { borderTopWidth: 2, borderTopColor: color.ink, paddingVertical: 5, paddingHorizontal: 9 },
  foot: { flexDirection: 'row', gap: 8, padding: 9 },
  grow: { flex: 1 },
})
