/**
 * The leaf: the page to the right of the binding, and the turn between
 * two of them.
 *
 * `Leaf` renders whatever it is given, keyed by `page`. When the key
 * changes, the last thing it rendered is kept as it was and lifted off
 * over the new page: it rotates about its left edge (the spine),
 * showing its front until it stands edge-on and its blank back after,
 * then lands and is gone. Nothing under it waits: the new page is
 * mounted and readable from the first frame, so a test that asks for
 * it finds it at once, and a tap on the new page's header mid-turn is
 * a tap on the new page (the lifting leaf takes no pointer).
 *
 * The decisions (which leaf is where, the angle, which face shows) are
 * `lib/turn.ts`, pure and unit-tested. This file only drives a number
 * from 0 to 1 through them with `Animated`, which React Native and
 * react-native-web both carry in core: no new dependency.
 *
 * A player who asked for less motion (`useReducedMotion`) gets no
 * lifting leaf at all; the page simply changes.
 *
 * Drawn geometry only: the back of the leaf is paper with the shadow
 * of the fold, two views and a colour, no image (spec.md, "No credited
 * art").
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { Animated, Easing, StyleSheet, View } from 'react-native'
import { color } from '../theme/tokens'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { TURN_MS, angle, land, opened, settle } from '../lib/turn'
import type { Leaf as Drawn, Turn } from '../lib/turn'

type Props = {
  /** The page's identity. A change here turns the leaf. */
  readonly page: string
  /** The page's content, redrawn freely; only `page` decides a turn. */
  readonly children: ReactElement
}

/** How far the eye is from the page, for the 3D swing. In pixels. */
const EYE = 1100

export const Leaf = ({ page, children }: Props) => {
  const still = useReducedMotion()
  // The leaf as last committed. An effect with no dependencies runs
  // after every commit, so during a render this ref still holds the
  // previous commit's drawing: exactly what should lift if the page
  // changes now.
  const last = useRef<Drawn<ReactElement> | null>(null)
  useEffect(() => {
    last.current = { key: page, el: children }
  })
  // What is on the table. Deriving it during render (React's "state
  // from the previous render" pattern) means the lifting leaf is on
  // screen in the same frame the new page is, never one frame late.
  const [turn, setTurn] = useState<Turn<ReactElement>>(() => opened(page))
  if (turn.key !== page) setTurn(settle(turn, last.current ?? { key: page, el: children }, page))
  const over = turn.key === page ? turn.over : null

  // Progress of the lifting leaf, 0 (flat on top) to 1 (landed away).
  const progress = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (over === null) return
    if (still) {
      setTurn(land)
      return
    }
    progress.setValue(0)
    const run = Animated.timing(progress, {
      toValue: 1,
      duration: TURN_MS,
      easing: Easing.inOut(Easing.cubic),
      // The web has no native driver; the same code runs everywhere.
      useNativeDriver: false,
    })
    run.start(({ finished }) => {
      if (finished) setTurn(land)
    })
    return () => run.stop()
  }, [over, still, progress])

  // The swing and the face swap, as `Animated` interpolations of the
  // one progress value. `angle` and `frontShown` (lib/turn.ts) fix the
  // shape; the breakpoints here transcribe them.
  const swing = useMemo(
    () => ({
      transform: [
        { perspective: EYE },
        {
          rotateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [`${angle(0)}deg`, `${angle(1)}deg`],
          }),
        },
      ],
    }),
    [progress],
  )
  const front = useMemo(
    () => ({ opacity: progress.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [1, 1, 0, 0] }) }),
    [progress],
  )
  const back = useMemo(
    () => ({ opacity: progress.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [0, 0, 1, 1] }) }),
    [progress],
  )
  const lifted = still ? null : over

  return (
    <View style={styles.table}>
      {/* The page the player reads, drawn fresh. Keyed so a screen keeps its own instance. */}
      <View key={page} style={styles.under}>
        {children}
      </View>
      {lifted === null ? null : (
        <Animated.View
          key={lifted.key}
          testID="leaf-turning"
          pointerEvents="none"
          style={[styles.over, swing]}
        >
          <Animated.View style={[styles.face, front]}>{lifted.el}</Animated.View>
          <Animated.View style={[styles.face, styles.verso, back]}>
            <View style={styles.fold} />
          </Animated.View>
        </Animated.View>
      )}
    </View>
  )
}

/** Cover the parent edge to edge. */
const fill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const

const styles = StyleSheet.create({
  table: { flex: 1 },
  under: { flex: 1 },
  over: {
    ...fill,
    // The hinge is the spine: rotate about the left edge, at mid-height.
    transformOrigin: 'left center',
    backgroundColor: color.ochre,
    overflow: 'hidden',
  },
  face: { ...fill },
  /** The blank back of the leaf: paper, and the fold's shadow at the spine. */
  verso: { backgroundColor: color.ochre },
  fold: { ...fill, width: 28, backgroundColor: color.binding, opacity: 0.35 },
})
