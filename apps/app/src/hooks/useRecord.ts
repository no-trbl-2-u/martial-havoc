/**
 * The record as React state: load once, reduce on every action, save on
 * every change. The dice source is fixed for the life of the app so the
 * reducer stays a pure function of `(state, action, dice)`.
 *
 * Two sources: `dice` is what play rolls with (and may carry a `?dice=`
 * queue for a test); `fresh` throws a new record's gold and region, so a
 * queued run of faces is spent on the rolls the player makes, never on
 * the record's creation.
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
    (s: RecordState, a: Action) => reduce(s, a, dice),
    fresh,
    (d) => load() ?? newRecord(d),
  )
  useEffect(() => {
    save(state)
  }, [state])
  return [state, dispatch] as const
}
