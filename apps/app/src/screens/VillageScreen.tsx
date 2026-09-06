/**
 * Fen Pass, the trail-head village (spec.md, Horizon: "a trail-head
 * village is a City on fixed data").
 *
 * Three locations and the way out, read from
 * `packages/content/data/world/village.json` — the same fixed four on
 * every run, which is what makes this a doorstep the player learns
 * rather than a table they re-roll. Each location's procedure is the
 * book's: the stall row is the Market at printed prices (MH p.52-55),
 * the shrine is the Spirituality check for +1 LUCK (R58, gated on
 * incense and once a day by reading I-58), the inn is a meal and a
 * night's rest (R40, plus spec.md's sealed +4 ENDURANCE).
 *
 * Every blurb and every price on this screen is data. The village is
 * `invention`, its procedures are `rule`, and the rules panel says so
 * for each — this file only arranges them.
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { INCENSE_ID, market, t, villageLocations, villageTrail } from '@martial-havoc/content'
import { fromSilver } from '@martial-havoc/engine'
import { fill } from '../lib/fill'
import type { Action, RecordState } from '../state/types'
import { color, font } from '../theme/tokens'
import { Button } from '../components/Button'
import { Die } from '../components/Die'
import { MenuButton } from '../components/MenuButton'
import { Slip } from '../components/Slip'

type Props = { readonly state: RecordState; readonly dispatch: (a: Action) => void }

/** What the stall row offers: the common list, cheapest first. */
const stalls = () =>
  market
    .filter((item) => item.list === 'common')
    .slice()
    .sort((a, b) => (a.priceGp ?? 0) * 10 + (a.priceSp ?? 0) - ((b.priceGp ?? 0) * 10 + (b.priceSp ?? 0)))
    .slice(0, 10)

const priceOf = (gp: number | null, sp: number | null): string =>
  gp === null ? `${sp ?? 0} SP` : `${gp} GP`

export const VillageScreen = ({ state, dispatch }: Props) => {
  const purse = fromSilver(state.silver)
  return (
    <View style={styles.screen} testID="village">
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
        <Slip style={styles.purse}>
          <Text testID="village-purse" style={styles.purseText}>
            {fill(t('ui.village.purse'), { gp: purse.gp, sp: purse.sp })}
          </Text>
        </Slip>

        {state.villageNote === null ? null : (
          <Slip style={styles.note} testID="village-note">
            <View style={styles.noteBody}>
              {state.villageNote.roll === null ? null : (
                <>
                  <Die face={state.villageNote.roll.a} testID="village-die-a" />
                  <Die face={state.villageNote.roll.b} testID="village-die-b" />
                </>
              )}
              <Text style={styles.noteText}>{state.villageNote.text}</Text>
            </View>
            <Text style={styles.cite}>{state.villageNote.cite}</Text>
          </Slip>
        )}

        {villageLocations.map((place) => (
          <Slip key={place.id} style={styles.place} testID={place.id}>
            <View style={styles.head}>
              <Text style={styles.name}>{place.name.toUpperCase()}</Text>
            </View>
            <Text style={styles.blurb}>{place.blurb}</Text>

            {place.procedure === 'buy' ? (
              <View style={styles.body}>
                <Text style={styles.note2}>{t('ui.village.market.note')}</Text>
                {stalls().map((item) => (
                  <MenuButton
                    key={item.id}
                    testID={`buy-${item.id}`}
                    title={`${item.id === INCENSE_ID && state.incense ? '* ' : ''}${item.item}`}
                    note={priceOf(item.priceGp, item.priceSp)}
                    line=""
                    onPress={() => dispatch({ type: 'village.buy', id: item.id })}
                  />
                ))}
              </View>
            ) : null}

            {place.procedure === 'temple' ? (
              <View style={styles.body}>
                <Text style={styles.note2}>{t('ui.village.temple.note')}</Text>
                <Button
                  testID="village-temple"
                  primary
                  text={t('ui.village.temple.roll')}
                  onPress={() => dispatch({ type: 'village.temple' })}
                />
              </View>
            ) : null}

            {place.procedure === 'inn' ? (
              <View style={styles.body}>
                <Text style={styles.note2}>{t('ui.village.inn.note')}</Text>
                <Button
                  testID="village-inn"
                  primary
                  text={fill(t('ui.village.inn.stay'), { sp: place.roomPriceSp ?? 0 })}
                  onPress={() => dispatch({ type: 'village.inn' })}
                />
              </View>
            ) : null}
          </Slip>
        ))}

        {villageTrail === undefined ? null : (
          <Slip style={styles.place} testID="village-trail">
            <View style={styles.head}>
              <Text style={styles.name}>{villageTrail.name.toUpperCase()}</Text>
            </View>
            <Text style={styles.blurb}>{villageTrail.blurb}</Text>
            <View style={styles.body}>
              <Button
                testID="village-go"
                primary
                text={t('ui.village.trail.go')}
                onPress={() => dispatch({ type: 'village.trail' })}
              />
            </View>
          </Slip>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { flex: 1 },
  pageContent: { paddingBottom: 14 },
  purse: { marginTop: 10, marginHorizontal: 14, paddingVertical: 6, paddingHorizontal: 9 },
  purseText: { fontFamily: font.sans, fontSize: 15, fontWeight: '800', letterSpacing: 0.6, color: color.ink },
  note: { marginTop: 10, marginHorizontal: 14 },
  noteBody: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 9 },
  noteText: { flex: 1, fontFamily: font.serif, fontSize: 14, lineHeight: 19, color: color.ink },
  cite: {
    borderTopWidth: 2,
    borderTopColor: color.ink,
    paddingVertical: 5,
    paddingHorizontal: 9,
    fontFamily: font.mono,
    fontSize: 10,
    color: color.ink,
  },
  place: { marginTop: 10, marginHorizontal: 14 },
  head: { paddingVertical: 6, paddingHorizontal: 9, backgroundColor: color.ink },
  name: { fontFamily: font.sans, fontSize: 11, fontWeight: '800', letterSpacing: 0.9, color: color.paper },
  blurb: { fontFamily: font.serif, fontSize: 14, lineHeight: 20, padding: 9 },
  body: { paddingHorizontal: 9, paddingBottom: 9, gap: 7 },
  note2: { fontFamily: font.mono, fontSize: 10, lineHeight: 14, color: color.dim },
})
