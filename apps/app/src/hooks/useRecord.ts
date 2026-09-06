/**
 * The record as React state: load once, reduce on every action, save on
 * every change. The dice source is fixed for the life of the app so the
 * reducer stays a pure function of `(state, action, dice)`.
 *
 * Two sources: `dice` is what play rolls with (and may carry a `?dice=`
 * queue for a test); `fresh` throws a new record's gold and region, so a
 * queued run of faces is spent on the rolls the player makes, never on
 * the record's creation.
 *
 * Creation's own rolls go to `fresh` for the same reason. A `?dice=`
 * queue names the rolls the *player* makes at the table; the dice that
 * decide a Master's standing before play begins are the record's, like
 * the region throw, and spending a named face on them would silently
 * shift every roll a test asked for.
 */
import { useEffect, useReducer } from 'react'
import type { DiceSource } from '@martial-havoc/engine'
import { load, save } from '../state/persist'
import { newRecord } from '../state/record'
import { reduce } from '../state/reduce'
import type { Action, RecordState } from '../state/types'

/** `[record, dispatch]`, persisted. */
export const useRecord = (
  dice: DiceSource,
  fresh: DiceSource,
): readonly [RecordState, (action: Action) => void] => {
  const [state, dispatch] = useReducer(
    (s: RecordState, a: Action) =>
      reduce(s, a, a.type.startsWith('creation.') ? fresh : dice),
    fresh,
    // A freshly rolled record is what `load` falls back to and lays the
    // saved campaign over, so the dice are spent exactly once either way.
    (d) => load(newRecord(d)),
  )
  useEffect(() => {
    save(state)
  }, [state])
  return [state, dispatch] as const
}
