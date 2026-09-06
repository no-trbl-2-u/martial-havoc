/**
 * The plate under the dice on the roll card: drawn geometry keyed by
 * what the roll is for. Placeholders, on purpose.
 *
 * spec.md refuses credited art (text and SVG only), so a plate is ours
 * and drawn, never a picture; the dashed border says so the way every
 * invention's does (design/V1-DESIGN-PROMPT.md). Two plates for now,
 * one per kind of check (R20, R21). A plate per Proficiency or per
 * area is a later pass; the key is the seam it would grow along.
 */
import type { ReactElement } from 'react'
import { StyleSheet, View } from 'react-native'
import Svg, { G, Path, Rect } from 'react-native-svg'
import { color } from '../theme/tokens'
import { Slip } from './Slip'

export type PlateKey = 'skill' | 'luck' | 'event'

/** The shut gate under its willow, for a SKILL check. */
const Gate = () => (
  <Svg width="100%" height="100%" viewBox="0 0 320 140" preserveAspectRatio="xMidYMid meet">
    <G fill="none" stroke={color.ink} strokeWidth={6} strokeLinecap="square">
      <Path d="M60 130 V40 M260 130 V40 M40 40 H280 M52 28 H268" />
      <Path d="M120 130 V60 M200 130 V60 M120 60 H200" />
      <Path d="M150 95 h20" />
    </G>
    <G fill="none" stroke={color.ink} strokeWidth={4} strokeLinecap="round">
      <Path d="M285 20 q-30 30 -10 70 M300 30 q-40 40 -20 90 M20 26 q30 30 12 66" />
    </G>
    <G fill={color.vermilion}>
      <Rect x={228} y={70} width={10} height={10} />
      <Rect x={228} y={86} width={10} height={10} />
      <Rect x={228} y={102} width={10} height={10} />
    </G>
  </Svg>
)

/** A moon over moving water, for a LUCK check: what is not in the Master's hands. */
const Moon = () => (
  <Svg width="100%" height="100%" viewBox="0 0 320 140" preserveAspectRatio="xMidYMid meet">
    <G fill="none" stroke={color.ink} strokeWidth={6} strokeLinecap="round">
      <Path d="M200 22 a34 34 0 1 0 30 52 a26 26 0 1 1 -30 -52 z" />
    </G>
    <G fill="none" stroke={color.ink} strokeWidth={5} strokeLinecap="round">
      <Path d="M20 100 q20 -14 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" />
      <Path d="M40 122 q20 -14 40 0 t40 0 t40 0 t40 0 t40 0 t40 0" />
    </G>
    <G fill={color.vermilion}>
      <Rect x={60} y={30} width={10} height={10} />
    </G>
  </Svg>
)

/** A threshold: the way into an area, for the Event roll (5T a1). */
const Threshold = () => (
  <Svg width="100%" height="100%" viewBox="0 0 320 140" preserveAspectRatio="xMidYMid meet">
    <G fill="none" stroke={color.ink} strokeWidth={6} strokeLinecap="square">
      <Path d="M90 130 V30 H230 V130 M76 30 H244" />
      <Path d="M110 130 V60 H210 V130" />
    </G>
    <G fill="none" stroke={color.ink} strokeWidth={4} strokeLinecap="round">
      <Path d="M30 120 q40 -10 80 0 M210 120 q40 -10 80 0" />
    </G>
    <G fill={color.vermilion}>
      <Rect x={155} y={80} width={10} height={10} />
    </G>
  </Svg>
)

const PLATES: Readonly<Record<PlateKey, () => ReactElement>> = { skill: Gate, luck: Moon, event: Threshold }

type Props = { readonly plate: PlateKey; readonly height?: number }

export const Plate = ({ plate, height = 120 }: Props) => {
  const Drawn = PLATES[plate]
  return (
  <Slip dashed style={styles.slip} testID={`plate-${plate}`}>
    <View style={{ height }}>
      <Drawn />
    </View>
  </Slip>
  )
}

const styles = StyleSheet.create({
  slip: { padding: 8 },
})
