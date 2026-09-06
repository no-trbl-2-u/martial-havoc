/**
 * One d6 as drawn geometry: a square and its pips (design prompt: text
 * and SVG only). `face` null draws an empty square - a roll not yet made.
 * The face is also the accessible label, so a test reads the die.
 */
import { View } from 'react-native'
import Svg, { Circle, Rect } from 'react-native-svg'
import type { Die as Face } from '@martial-havoc/engine'
import { color } from '../theme/tokens'

/** Pip centres in a 52-unit square, per face. Geometry, not content. */
const PIPS: Readonly<Record<Face, readonly (readonly [number, number])[]>> = {
  1: [[26, 26]],
  2: [[16, 16], [36, 36]],
  3: [[14, 14], [26, 26], [38, 38]],
  4: [[16, 16], [36, 16], [16, 36], [36, 36]],
  5: [[16, 16], [36, 16], [26, 26], [16, 36], [36, 36]],
  6: [[16, 13], [36, 13], [16, 26], [36, 26], [16, 39], [36, 39]],
}

type Props = {
  readonly face: Face | null
  readonly size?: number
  readonly testID?: string
}

export const Die = ({ face, size = 40, testID }: Props) => (
  <View
    testID={testID}
    accessible
    accessibilityLabel={face === null ? 'unrolled' : String(face)}
    style={{ width: size, height: size }}
  >
    <Svg width={size} height={size} viewBox="0 0 52 52">
      <Rect x={2.5} y={2.5} width={47} height={47} fill="none" stroke={color.ink} strokeWidth={3.5} />
      {face === null
        ? null
        : PIPS[face].map(([x, y]) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={4.6} fill={color.ink} />)}
    </Svg>
  </View>
)
