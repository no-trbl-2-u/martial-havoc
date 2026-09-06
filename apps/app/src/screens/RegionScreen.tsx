/**
 * The region: seven points on a plane linked to their nearest
 * neighbours, miles on the links, the route band beside them, and the
 * words "not to scale" (spec.md, Horizon; design prototype, "REGION").
 * All SVG. The points, links and miles are the engine's; the Location
 * names and the route bands are the content package's tables.
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg'
import { linksFrom, otherEnd } from '@martial-havoc/engine'
import type { RegionPoint } from '@martial-havoc/engine'
import { regionColumn, rollRouteType, t } from '@martial-havoc/content'
import { fill } from '../lib/fill'
import type { Action, RecordState } from '../state/types'
import { color, font } from '../theme/tokens'
import { Button } from '../components/Button'
import { MenuButton } from '../components/MenuButton'
import { Slip } from '../components/Slip'

type Props = { readonly state: RecordState; readonly dispatch: (a: Action) => void }

const W = 316
const H = 382
/** A d66 coordinate (11-66) onto the drawing, with a margin for the glyph and its label. */
const sx = (x: number): number => 30 + ((x - 11) / 55) * (W - 60)
const sy = (y: number): number => 40 + ((y - 11) / 55) * (H - 70)

const locations = regionColumn('Location')
const locationName = (face: number): string => locations.find((c) => c.face === face)?.text.toUpperCase() ?? ''

/** A glyph per point: the Location face picks the shape, so no two kinds look alike without colour. */
const Glyph = ({ p, here }: { p: RegionPoint; here: boolean }) => {
  const x = sx(p.x)
  const y = sy(p.y)
  const fillColor = here ? color.vermilion : color.ochre
  if (p.locationFace <= 2) return <Rect x={x - 12} y={y - 12} width={24} height={24} fill={fillColor} stroke={color.ink} strokeWidth={3} />
  if (p.locationFace <= 4) return <Circle cx={x} cy={y} r={13} fill={fillColor} stroke={color.ink} strokeWidth={3} />
  return <Path d={`M${x} ${y - 14} L${x + 16} ${y + 14} L${x - 16} ${y + 14} Z`} fill={fillColor} stroke={color.ink} strokeWidth={3} />
}

export const RegionScreen = ({ state, dispatch }: Props) => {
  const { region, here } = state
  const at = region.points.find((p) => p.id === here) ?? region.points[0]
  const reach = at === undefined ? [] : linksFrom(region, at.id)
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
              return <Path key={`${l.a}-${l.b}`} d={`M${sx(a.x)} ${sy(a.y)} L${sx(b.x)} ${sy(b.y)}`} strokeDasharray={l.joined ? '6 5' : undefined} />
            })}
          </G>
          <G fontFamily="-apple-system, Arial, sans-serif" fontSize={11} fontWeight="800" fill={color.ink}>
            {region.links.map((l) => {
              const a = region.points[l.a]
              const b = region.points[l.b]
              if (a === undefined || b === undefined) return null
              const mx = (sx(a.x) + sx(b.x)) / 2
              const my = (sy(a.y) + sy(b.y)) / 2
              const label = fill(t('ui.region.miles'), { n: l.miles })
              return (
                <G key={`m-${l.a}-${l.b}`}>
                  <Rect x={mx - 20} y={my - 9} width={40} height={15} fill={color.paper} stroke={color.ink} strokeWidth={2} />
                  <SvgText x={mx} y={my + 3} textAnchor="middle">{label}</SvgText>
                </G>
              )
            })}
          </G>
          <G>{region.points.map((p) => <Glyph key={p.id} p={p} here={p.id === at?.id} />)}</G>
          <G fontFamily="-apple-system, Arial, sans-serif" fontSize={12} fontWeight="800" fill={color.ink}>
            {region.points.map((p) => (
              <SvgText key={`t-${p.id}`} x={sx(p.x)} y={sy(p.y) - 20} textAnchor="middle">
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
        <Button primary small text={t('ui.nav.back')} onPress={() => dispatch({ type: 'nav', screen: 'beat' })} style={styles.back} />
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
})
