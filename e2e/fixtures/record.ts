/**
 * A record at any point in play, built without a browser.
 *
 * The middle layer of `e2e/fixtures`. The app keeps its whole state in
 * one immutable `RecordState` and moves it only through the pure
 * `reduce(state, action, dice)` (`apps/app/src/state/reduce.ts`). That
 * makes any moment in play a *fold*: start from `newRecord`, apply a
 * list of actions, and the result is exactly the record the app would
 * hold after a player did those things. No screen is rendered and no
 * button is tapped; the reducer is the game.
 *
 * A {@link Scene} is that list plus the faces its actions roll. Named
 * scenes below are the stops the walking specs in `e2e/prototype.spec.ts`
 * reach by hand (`madeAMaster`, `begin`, `toGhost`); a fixture reaches
 * the same stop in one call, and `e2e/fixtures.spec.ts` proves the two
 * agree. Scenes compose: {@link extend} adds actions to one.
 *
 * Why this cannot drift from the app: the fixture imports the app's own
 * `newRecord` and `reduce`. A field added to `RecordState` is added to
 * every fixture on the next build; an action renamed is a type error
 * here. A hand-written JSON fixture would have neither property.
 */
import type { Die } from '@martial-havoc/engine'
import { newRecord } from '../../apps/app/src/state/record'
import { reduce } from '../../apps/app/src/state/reduce'
import type { Action, RecordState } from '../../apps/app/src/state/types'
import { cycling, named } from './dice'

/** A list of actions and the faces the player's rolls among them use, in order. */
export type Scene = {
  /** Applied in order to a fresh record. */
  readonly actions: readonly Action[]
  /**
   * The faces served to every non-creation action, in the order the
   * reducer asks for them. Creation's own rolls and the record's
   * throws come from the cycling source and are not listed here.
   */
  readonly faces: readonly Die[]
}

/** Build the record a `Scene` ends on. */
export const fold = (scene: Scene): RecordState => {
  // The same split as `useRecord`: creation rolls on the table's own
  // source, play rolls on the named queue, and the record is thrown on
  // the table's source too, so a named face is never spent on it.
  const table = cycling()
  const queue = named(scene.faces)
  return scene.actions.reduce(
    (state, action) => reduce(state, action, action.type.startsWith('creation.') ? table : queue),
    newRecord(table),
  )
}

/**
 * A scene with more actions (and the faces they roll) after `base`.
 *
 * @param base The scene to continue from.
 * @param actions Further actions, applied after `base.actions`.
 * @param faces Faces those further actions roll, appended to `base.faces`.
 */
export const extend = (base: Scene, actions: readonly Action[], faces: readonly Die[] = []): Scene => ({
  actions: [...base.actions, ...actions],
  faces: [...base.faces, ...faces],
})

/** One move in the cave: take the exit, then close the card it lands on. */
const go = (to: string): readonly Action[] => [
  { type: 'cave.go', to },
  { type: 'roll.close' },
]

/** The adventure's area ids, as `packages/content` names them. */
const AREA = {
  entrance: 'area.the-5-treasures.cave-entrance',
  diningHall: 'area.the-5-treasures.dining-hall',
  attendants: 'area.the-5-treasures.attendants-room',
} as const

/** The Dexterous Ghost, the Attendants room's Encounter creature 3. */
const GHOST = 'foe.dexterous-ghost'

/**
 * San Te's printed sheet taken and creation finished (R83). The record
 * opens in Fen Pass reading the Call (Phase 10b). Mirrors
 * `madeAMaster` in `e2e/prototype.spec.ts`. Rolls nothing named.
 */
export const madeAMaster: Scene = {
  actions: [{ type: 'creation.preset', id: 'preset.san-te' }, { type: 'creation.begin' }],
  faces: [],
}

/**
 * The trail taken out of the village onto the Flat-top mountain, the
 * beat open. Mirrors `begin`. Rolls nothing named.
 */
export const onTheMountain: Scene = extend(madeAMaster, [{ type: 'village.trail' }])

/**
 * Into the cave to the Attendants room and the Dexterous Ghost faced,
 * the combat screen open. Mirrors `toGhost`: Event 4 (safe) into the
 * entrance, 4 into the Dining Hall, then Event 2 (Encounter) and
 * creature 3 (the Ghost) into the Attendants room. Spends `4,4,2,3`.
 */
export const facingTheGhost: Scene = extend(
  onTheMountain,
  [...go(AREA.entrance), ...go(AREA.diningHall), ...go(AREA.attendants), { type: 'cave.fight', foe: GHOST }],
  [4, 4, 2, 3],
)

/** The rules panel open from the mountain. Rolls nothing named. */
export const atTheRules: Scene = extend(onTheMountain, [{ type: 'nav', screen: 'rules' }])

/** The record screen open from the mountain. Rolls nothing named. */
export const atTheRecord: Scene = extend(onTheMountain, [{ type: 'nav', screen: 'record' }])
