/**
 * Does the player prefer less motion?
 *
 * Two sources, joined with OR:
 * - the platform's setting through React Native's `AccessibilityInfo`
 *   (iOS "Reduce Motion", Android "Remove animations"), read once and
 *   then followed;
 * - on the web, the `prefers-reduced-motion` media query, read
 *   synchronously so the very first render already knows. The
 *   Playwright gate sets it to `reduce`, which makes every turn
 *   instant and every assertion deterministic.
 *
 * A component that honours this skips the animation entirely rather
 * than shortening it: the page still changes, it just does not swing.
 */
import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

/** The web query, or `null` where there is no `matchMedia`. */
const mediaQuery = (): { matches: boolean } | null => {
  try {
    const g = globalThis as { matchMedia?: (q: string) => { matches: boolean } }
    return g.matchMedia ? g.matchMedia('(prefers-reduced-motion: reduce)') : null
  } catch {
    return null
  }
}

/** True when the player has asked for less motion. */
export const useReducedMotion = (): boolean => {
  const [platform, setPlatform] = useState(false)
  const [web] = useState(() => mediaQuery()?.matches ?? false)
  useEffect(() => {
    let live = true
    AccessibilityInfo.isReduceMotionEnabled()
      .then((on) => {
        if (live) setPlatform(on)
      })
      .catch(() => undefined)
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setPlatform)
    return () => {
      live = false
      sub.remove()
    }
  }, [])
  return platform || web
}
