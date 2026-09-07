/**
 * The cave, drawn from the passages the Master has actually walked
 * (Phase 10h).
 *
 * The adventure ships with a printed map and `spec.md` refuses credited
 * art, so this is not that map: it is the adjacency graph in
 * `areas.json` drawn as ours, with each room's place hand-set once in
 * the data (`pos`) rather than computed, so the shape a player learns
 * stays the shape they learn.
 *
 * What it will not do is tell a player something they have not earned.
 * A room they have not entered is a dashed outline with no name -
 * reading I-60's spirit, which hides the Hints and the treasure
 * workings until they are found - and a passage they cannot open is
 * drawn with a bar across it, because the door being locked is
 * something they *have* learned by standing at it.
 *
 * Every string is the content package's (`t`); every number is the
 * adventure's or this component's own geometry.
 */
import { StyleSheet, View } from 'react-native'
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg'
import { theFiveTreasures } from '@martial-havoc/content'
import type { AdventureArea } from '@martial-havoc/content'
import { color } from '../theme/tokens'

/** The drawing's box. Room positions are a 0-100 square scaled onto it. */
const W = 300
const H = 340
const PAD = 26
const R = 17

const px = (x: number): number => PAD + (x / 100) * (W - PAD * 2)
const py = (y: number): number => PAD + (y / 100) * (H - PAD * 2)

type Props = {
  /** Area ids the Master has entered, in the order they were entered. */
  readonly visited: readonly string[]
  /** Where the Master stands now. */
  readonly here: string
  /** Keys held, so a locked door can be drawn as locked or as open. */
  readonly keys: readonly string[]
  /** Which room's card is open, or null. */
  readonly openId: string | null
  readonly onTap: (id: string) => void
}

/** Every unordered pair of areas the graph joins, each once. */
const passages = (
  areas: readonly AdventureArea[],
): readonly (readonly [AdventureArea, AdventureArea])[] =>
  areas.flatMap((a) =>
    a.exits
      .map((id) => areas.find((b) => b.id === id))
      .filter((b): b is AdventureArea => b !== undefined && b.area > a.area)
      .map((b) => [a, b] as const),
  )

export const CaveMap = ({ visited, here, keys, openId, onTap }: Props) => {
  const areas = theFiveTreasures.areas
  const seen = (id: string): boolean => visited.includes(id)
  // A passage is drawn once either end has been entered: a Master who
  // has stood in a room has seen the doorways out of it, whatever is
  // through them.
  const known = passages(areas).filter(([a, b]) => seen(a.id) || seen(b.id))
  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={H * 0.92} viewBox={`0 0 ${W} ${H}`} testID="cave-map">
        <G stroke={color.ink} strokeWidth={3} fill="none">
          {known.map(([a, b]) => {
            const ax = px(a.pos.x)
            const ay = py(a.pos.y)
            const bx = px(b.pos.x)
            const by = py(b.pos.y)
            // A door whose key is not held gets a bar across the middle
            // of its passage: the map says what the beat says.
            const gate = b.gate ?? a.gate
            const barred = gate !== null && !keys.includes(gate.key)
            const mx = (ax + bx) / 2
            const my = (ay + by) / 2
            const dx = bx - ax
            const dy = by - ay
            const len = Math.max(1, Math.hypot(dx, dy))
            return (
              <G key={`${a.id}-${b.id}`}>
                <Path d={`M${ax} ${ay} L${bx} ${by}`} />
                {!barred ? null : (
                  <Line
                    testID={`bar-${b.gate === null ? a.area : b.area}`}
                    x1={mx - (dy / len) * 9}
                    y1={my + (dx / len) * 9}
                    x2={mx + (dy / len) * 9}
                    y2={my - (dx / len) * 9}
                    stroke={color.vermilion}
                    strokeWidth={5}
                  />
                )}
              </G>
            )
          })}
        </G>
        {areas.map((a) => {
          const walked = seen(a.id)
          const standing = a.id === here
          return (
            <G key={a.id}>
              <Circle
                testID={`room-${a.area}`}
                onPress={walked ? () => onTap(a.id) : undefined}
                cx={px(a.pos.x)}
                cy={py(a.pos.y)}
                r={R}
                fill={walked ? color.ochre : color.paper}
                stroke={standing ? color.vermilion : color.ink}
                strokeWidth={standing ? 5 : 3}
                strokeDasharray={walked ? undefined : '5 4'}
              />
              {!standing ? null : (
                <Circle
                  cx={px(a.pos.x)}
                  cy={py(a.pos.y)}
                  r={R + 6}
                  fill="none"
                  stroke={color.vermilion}
                  strokeWidth={2}
                />
              )}
              {/*
                The labels are drawn over the circle, so they are made
                deaf: the room is the tap target, not the number on it.
              */}
              <SvgText
                pointerEvents="none"
                testID={`room-label-${a.area}`}
                x={px(a.pos.x)}
                y={py(a.pos.y) + 4}
                textAnchor="middle"
                fontFamily="-apple-system, Arial, sans-serif"
                fontSize={12}
                fontWeight="800"
                fill={color.ink}
              >
                {walked ? String(a.area) : ''}
              </SvgText>
              {!walked ? null : (
                <SvgText
                  pointerEvents="none"
                  x={px(a.pos.x)}
                  y={py(a.pos.y) - R - 6}
                  textAnchor="middle"
                  fontFamily="-apple-system, Arial, sans-serif"
                  fontSize={9}
                  fontWeight="800"
                  fill={openId === a.id ? color.vermilion : color.ink}
                >
                  {a.name.toUpperCase()}
                </SvgText>
              )}
            </G>
          )
        })}
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({ wrap: { alignItems: 'stretch' } })
