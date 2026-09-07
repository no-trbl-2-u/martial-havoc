/**
 * The region: seven points on a plane linked to their nearest
 * neighbours, miles on the links, the route band beside them, and the
 * words "not to scale" (spec.md, Horizon; design prototype, "REGION").
 * All SVG. The points, links and miles are the engine's; the Location
 * names and the route bands are the content package's tables.
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg'
import { flag, linksFrom, otherEnd } from '@martial-havoc/engine'
import type { RegionPoint } from '@martial-havoc/engine'
import {
  regionColumn,
  rollRouteType,
  t,
  theFiveTreasures,
  theFiveTreasuresAreaById,
} from '@martial-havoc/content'
import { fill } from '../lib/fill'
import { spread } from '../lib/spread'
import type { Action, RecordState } from '../state/types'
import { color, font } from '../theme/tokens'
import { Button } from '../components/Button'
import { MenuButton } from '../components/MenuButton'
import { Slip } from '../components/Slip'
import { CaveMap } from '../components/CaveMap'
import { hasBegun, home } from '../lib/opening'
import { LEFT } from '../state/menu'

type Props = { readonly state: RecordState; readonly dispatch: (a: Action) => void }

const W = 316
const H = 382
/** A d66 coordinate (11-66) onto the drawing, with a margin for the glyph and its label. */
const sx = (x: number): number => 30 + ((x - 11) / 55) * (W - 60)
const sy = (y: number): number => 40 + ((y - 11) / 55) * (H - 70)
/** Glyph plus label need this much room; positions are decorative, so crowded points are spread. */
const MIN_APART = 58
const BOX = { minX: 30, maxX: W - 30, minY: 40, maxY: H - 30 }

const locations = regionColumn('Location')
const locationName = (face: number): string => locations.find((c) => c.face === face)?.text.toUpperCase() ?? ''

/** A glyph per point: the Location face picks the shape, so no two kinds look alike without colour. */
const Glyph = ({ p, here, x, y }: { p: RegionPoint; here: boolean; x: number; y: number }) => {
  const fillColor = here ? color.vermilion : color.ochre
  if (p.locationFace <= 2) return <Rect x={x - 12} y={y - 12} width={24} height={24} fill={fillColor} stroke={color.ink} strokeWidth={3} />
  if (p.locationFace <= 4) return <Circle cx={x} cy={y} r={13} fill={fillColor} stroke={color.ink} strokeWidth={3} />
  return <Path d={`M${x} ${y - 14} L${x + 16} ${y + 14} L${x - 16} ${y + 14} Z`} fill={fillColor} stroke={color.ink} strokeWidth={3} />
}

/**
 * MAP, in the cave (Phase 10h).
 *
 * The same button, two maps, and which one is drawn is a fact about
 * where the Master is standing rather than a mode the player picks: in
 * the cave it is the cave, off the mountain it is the region. Nothing
 * new is persisted for the second half of that - `left-the-mountain` is
 * an adventure flag, set when LEAVE FOR THE REGION is taken.
 */
const InTheCave = ({ state, dispatch }: Props) => {
  const areas = theFiveTreasures.areas
  const seen = state.cave.visited
  const open = areas.find((a) => a.id === state.openId)
  // What last happened in the tapped room, taken from the chronicle
  // rather than recomputed: the chronicle is where "what happened" is
  // written down, and two answers to one question would drift.
  const lastThere = [...state.chronicle]
    .reverse()
    .find((e) => e.area === open?.name && e.kind === 'turn')
  return (
    <View style={styles.screen}>
      <Slip style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.small}>{t('ui.map.cave.title')}</Text>
          <Text testID="here" style={styles.hereName}>
            {(theFiveTreasuresAreaById(state.cave.area)?.name ?? '').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.count}>
          {fill(t('ui.map.cave.rooms'), { seen: seen.length, all: areas.length })}
          {'\n'}
          {t('ui.map.cave.here')}
        </Text>
      </Slip>
      <Slip style={styles.map}>
        <CaveMap
          visited={seen}
          here={state.cave.area}
          keys={state.cave.keys}
          openId={state.openId}
          onTap={(id) => dispatch({ type: 'rules.open', id: state.openId === id ? null : id })}
        />
      </Slip>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {open === undefined ? null : (
          <Slip dashed style={styles.tapped} testID="room-card">
            <Text style={styles.hereName}>
              {lastThere === undefined
                ? fill(t('ui.map.cave.tapped.none'), { name: open.name.toUpperCase() })
                : fill(t('ui.map.cave.tapped'), {
                    name: open.name.toUpperCase(),
                    event: lastThere.text,
                  })}
            </Text>
          </Slip>
        )}
        <Text style={styles.footer}>{t('ui.map.cave.note')}</Text>
        <Text style={styles.footer}>{t('ui.map.cave.locked')}</Text>
      </ScrollView>
      <View style={styles.foot}>
        <Text style={styles.footer}>{t('ui.region.footer')}</Text>
        <Button primary small text={t('ui.nav.back')} onPress={() => dispatch({ type: 'nav', screen: 'beat' })} style={styles.back} />
      </View>
    </View>
  )
}

/**
 * MAP: the cave while the Master is in it, the region once they are
 * off the mountain (Phase 10h).
 */
export const RegionScreen = ({ state, dispatch }: Props) =>
  hasBegun(state) && !flag(state.cave, LEFT) ? (
    <InTheCave state={state} dispatch={dispatch} />
  ) : (
    <TheRegion state={state} dispatch={dispatch} />
  )

const TheRegion = ({ state, dispatch }: Props) => {
  const { region, here } = state
  const at = region.points.find((p) => p.id === here) ?? region.points[0]
  const reach = at === undefined ? [] : linksFrom(region, at.id)
  /** Where each point is drawn: the dice's position, spread for legibility. */
  const drawn = spread(region.points.map((p) => ({ x: sx(p.x), y: sy(p.y) })), MIN_APART, BOX)
  const at2 = (id: number) => drawn[id] ?? { x: 0, y: 0 }
  return (
    <View style={styles.screen}>
      <Slip style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.small}>{t('ui.region.here')}</Text>
          <Text testID="here" style={styles.hereName}>{at === undefined ? '' : locationName(at.locationFace)}</Text>
        </View>
        <Text style={styles.count}>
          {fill(t('ui.region.count'), { p: region.points.length, l: region.links.length })}
          {'\n'}
          {t('ui.region.not-to-scale')}
        </Text>
      </Slip>
      <Slip style={styles.map}>
        <Svg width="100%" height={H * 0.9} viewBox={`0 0 ${W} ${H}`}>
          <G stroke={color.ink} strokeWidth={3}>
            {region.links.map((l) => {
              const a = region.points[l.a]
              const b = region.points[l.b]
              if (a === undefined || b === undefined) return null
              return <Path key={`${l.a}-${l.b}`} d={`M${at2(a.id).x} ${at2(a.id).y} L${at2(b.id).x} ${at2(b.id).y}`} strokeDasharray={l.joined ? '6 5' : undefined} />
            })}
          </G>
          <G fontFamily="-apple-system, Arial, sans-serif" fontSize={11} fontWeight="800" fill={color.ink}>
            {region.links.map((l) => {
              const a = region.points[l.a]
              const b = region.points[l.b]
              if (a === undefined || b === undefined) return null
              const mx = (at2(a.id).x + at2(b.id).x) / 2
              const my = (at2(a.id).y + at2(b.id).y) / 2
              const label = fill(t('ui.region.miles'), { n: l.miles })
              return (
                <G key={`m-${l.a}-${l.b}`}>
                  <Rect x={mx - 20} y={my - 9} width={40} height={15} fill={color.paper} stroke={color.ink} strokeWidth={2} />
                  <SvgText x={mx} y={my + 3} textAnchor="middle">{label}</SvgText>
                </G>
              )
            })}
          </G>
          <G>{region.points.map((p) => <Glyph key={p.id} p={p} here={p.id === at?.id} x={at2(p.id).x} y={at2(p.id).y} />)}</G>
          <G fontFamily="-apple-system, Arial, sans-serif" fontSize={12} fontWeight="800" fill={color.ink}>
            {region.points.map((p) => (
              <SvgText key={`t-${p.id}`} x={at2(p.id).x} y={at2(p.id).y - 20} textAnchor="middle">
                {p.id === at?.id ? t('ui.region.you') : locationName(p.locationFace)}
              </SvgText>
            ))}
          </G>
        </Svg>
      </Slip>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {at === undefined
          ? null
          : reach.map((l) => {
              const to = region.points[otherEnd(l, at.id)]
              if (to === undefined) return null
              const band = rollRouteType(l.roll.total)?.text ?? ''
              return (
                <MenuButton
                  key={`${l.a}-${l.b}`}
                  testID={`travel-${to.id}`}
                  title={fill(t('ui.region.travel'), { name: locationName(to.locationFace) })}
                  note={`${fill(t('ui.region.miles'), { n: l.miles })} · ${band.toUpperCase()}${l.joined ? ` · ${t('ui.region.joined')}` : ''}`}
                  line={locations.find((c) => c.face === to.locationFace)?.note ?? ''}
                  onPress={() => dispatch({ type: 'region.travel', to: to.id })}
                />
              )
            })}
      </ScrollView>
      <View style={styles.foot}>
        <Text style={styles.footer}>{t('ui.region.footer')}</Text>
        <Button primary small text={t('ui.nav.back')} onPress={() => dispatch({ type: 'nav', screen: home(state) })} style={styles.back} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  head: { marginTop: 10, marginHorizontal: 14, padding: 9, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  headText: { flexShrink: 1 },
  small: { fontFamily: font.sans, fontSize: 9, fontWeight: '800', letterSpacing: 0.9, color: color.ink },
  hereName: { fontFamily: font.sans, fontSize: 16, fontWeight: '800', letterSpacing: 0.3, color: color.ink },
  count: { fontFamily: font.mono, fontSize: 10, textAlign: 'right', color: color.ink },
  map: { marginTop: 8, marginHorizontal: 14, padding: 6 },
  list: { flex: 1, marginTop: 8 },
  listContent: { paddingHorizontal: 14, gap: 6 },
  foot: { paddingTop: 9, paddingHorizontal: 14, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  footer: { fontFamily: font.mono, fontSize: 10, color: color.dim },
  back: { paddingVertical: 9, paddingHorizontal: 13 },
  /** The tapped room's card, under the drawing. */
  tapped: { padding: 9 },
})
