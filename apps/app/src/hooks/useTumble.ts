/**
 * The tumble: how long the dice on the roll card cycle before they
 * settle on the faces the engine rolled.
 *
 * Decoration, not a roll. The engine has already resolved the check
 * when this starts; the faces shown while tumbling are a fixed cycle
 * (1 to 6, over and over) so nothing here is random and a browser test
 * sees the same frames every run. `settled` flips once, after
 * `TUMBLE_MS`, and the card then shows the real faces.
 *
 * A pure function of time; no dice source is read (agents.md rule 7).
 */
import { useEffect, useState } from 'react'
import type { Die } from '@martial-havoc/engine'

/** How long the dice cycle before landing. Short enough not to slow a sitting. */
export const TUMBLE_MS = 700
/** One face per step of the cycle. */
export const TUMBLE_STEP_MS = 70

const CYCLE: readonly Die[] = [1, 2, 3, 4, 5, 6]

/** The face shown at step `n` of the cycle, offset so two dice differ. */
export const cycleFace = (n: number, offset: number): Die => CYCLE[(n + offset) % CYCLE.length] ?? 1

/**
 * Drive the tumble while `active`. Returns the current step and whether
 * the dice have settled. Inactive means settled at step 0: a card that
 * has not rolled shows empty squares, not a cycle.
 */
export const useTumble = (active: boolean): { readonly step: number; readonly settled: boolean } => {
  const [step, setStep] = useState(0)
  const [settled, setSettled] = useState(!active)
  useEffect(() => {
    if (!active) return undefined
    setSettled(false)
    setStep(0)
    const tick = setInterval(() => setStep((n) => n + 1), TUMBLE_STEP_MS)
    const land = setTimeout(() => {
      clearInterval(tick)
      setSettled(true)
    }, TUMBLE_MS)
    return () => {
      clearInterval(tick)
      clearTimeout(land)
    }
  }, [active])
  return { step, settled }
}
