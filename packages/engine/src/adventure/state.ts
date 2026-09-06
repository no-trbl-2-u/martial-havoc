/**
 * The adventure state: everything one Master has done inside one scene.
 *
 * Immutable, like everything else in this package. Every update below
 * returns a new state; nothing here mutates its argument, and nothing
 * here reaches for a table it was not handed. The state names ids only,
 * never records: it is meant to be serialised into the campaign record
 * (Phase 6) and read back beside the adventure's files.
 *
 * Nothing in this file knows the Lotus Flower cave exists. Everything it
 * knows comes from the {@link AdventureTables} it is handed
 * (`packages/content/schema/adventure-format.md`).
 */
import type { AdventureTables } from '@martial-havoc/content'

/** The format versions this engine knows how to read. */
export const SUPPORTED_FORMAT_VERSIONS: readonly string[] = Object.freeze(['1'])

/**
 * Thrown when an adventure is written in a format this engine does not
 * know.
 *
 * A caller mistake, not a rule outcome, so it throws (see `../errors.ts`):
 * guessing at an unknown shape is how a silently half-loaded adventure
 * ships.
 */
export class UnsupportedAdventure extends Error {
  constructor(
    readonly adventure: string,
    readonly version: string,
  ) {
    super(
      `unsupported adventure format version ${version} in ${adventure}; this engine reads ${SUPPORTED_FORMAT_VERSIONS.join(', ')}`,
    )
    this.name = 'UnsupportedAdventure'
  }
}

/**
 * Where the Master is and what they have done.
 *
 * `flags` is the adventure's own clock and states, keyed by the flag
 * names its `flags.json` declares. Everything else is a list of ids:
 * areas visited, foes defeated, keys and items and treasures held,
 * hints and treasure effects that have been revealed, rescues taken.
 */
export type AdventureState = {
  /** The `adventureMeta` id this state belongs to. */
  readonly adventure: string
  /** The area the Master is standing in. */
  readonly area: string
  /** Every area entered at least once, in the order first entered. */
  readonly visited: readonly string[]
  /** The adventure's flags, by name. */
  readonly flags: Readonly<Record<string, boolean>>
  /** Foes defeated; a named foe defeated once is gone everywhere (I-33b, I-33c). */
  readonly defeated: readonly string[]
  /** Key ids held; a gate opens for whoever carries its key. */
  readonly keys: readonly string[]
  /** Ordinary items taken from loot rows, in the order taken. */
  readonly items: readonly string[]
  /** Treasure ids held. */
  readonly treasures: readonly string[]
  /** Area ids whose Hint has been revealed (I-60). */
  readonly hints: readonly string[]
  /** Treasure ids whose effect has been revealed (I-60). */
  readonly effects: readonly string[]
  /** Rescue foe ids the Master has freed rather than fought (I-39). */
  readonly rescued: readonly string[]
  /** Dishonor Points earned inside this adventure (R39, I-39). */
  readonly dishonor: number
}

/** Add `value` to `list` unless it is already there. Order preserved. */
const including = (list: readonly string[], value: string): readonly string[] =>
  list.includes(value) ? list : [...list, value]

/**
 * The state an adventure begins in.
 *
 * The Master stands in the `startArea` and has visited it; every flag is
 * at the `initial` its record declares; nothing else has happened yet.
 * Throws {@link UnsupportedAdventure} on a format version this engine
 * does not read.
 */
export const beginAdventure = (tables: AdventureTables): AdventureState => {
  if (!SUPPORTED_FORMAT_VERSIONS.includes(tables.meta.version))
    throw new UnsupportedAdventure(tables.meta.id, tables.meta.version)
  return Object.freeze({
    adventure: tables.meta.id,
    area: tables.meta.startArea,
    visited: Object.freeze([tables.meta.startArea]),
    flags: Object.freeze(
      Object.fromEntries(tables.flags.map((flag) => [flag.flag, flag.initial])),
    ),
    defeated: Object.freeze([]),
    keys: Object.freeze([]),
    items: Object.freeze([]),
    treasures: Object.freeze([]),
    hints: Object.freeze([]),
    effects: Object.freeze([]),
    rescued: Object.freeze([]),
    dishonor: 0,
  })
}

/** Read one flag; a flag the adventure never declared reads false. */
export const flag = (state: AdventureState, name: string): boolean => state.flags[name] === true

/** Set one flag to `value`. */
export const withFlag = (
  state: AdventureState,
  name: string,
  value: boolean,
): AdventureState => ({ ...state, flags: { ...state.flags, [name]: value } })

/** Flip one flag; the gourd opened and closed again is two calls. */
export const toggleFlag = (state: AdventureState, name: string): AdventureState =>
  withFlag(state, name, !flag(state, name))

/** Record a foe as defeated. Idempotent: a foe is defeated once (I-33c). */
export const withDefeated = (state: AdventureState, foe: string): AdventureState => ({
  ...state,
  defeated: including(state.defeated, foe),
})

/** Record a rescue taken rather than a fight (I-39). */
export const withRescued = (state: AdventureState, foe: string): AdventureState => ({
  ...state,
  rescued: including(state.rescued, foe),
})

/** Add Dishonor Points; `n` is never negative in the book's direction. */
export const withDishonor = (state: AdventureState, n: number): AdventureState => ({
  ...state,
  dishonor: state.dishonor + n,
})

/** Take a key. Idempotent: two attendants carry the same key (I-07). */
export const withKey = (state: AdventureState, key: string): AdventureState => ({
  ...state,
  keys: including(state.keys, key),
})

/**
 * Take an ordinary item.
 *
 * Not idempotent: two spears are two spears. Treasures and keys are
 * separate lists precisely because those two are.
 */
export const withItem = (state: AdventureState, item: string): AdventureState => ({
  ...state,
  items: [...state.items, item],
})

/**
 * Take a treasure, which also reveals how it works (I-60).
 *
 * Idempotent in both lists: `once` loot exists in one copy, and holding
 * a treasure twice is not a thing the adventure can mean.
 */
export const withTreasure = (state: AdventureState, treasure: string): AdventureState => ({
  ...state,
  treasures: including(state.treasures, treasure),
  effects: including(state.effects, treasure),
})

/** Reveal an area's Hint (I-60). */
export const withHint = (state: AdventureState, area: string): AdventureState => ({
  ...state,
  hints: including(state.hints, area),
})

/** Reveal how a treasure works without holding it (I-38b, I-41). */
export const withEffect = (state: AdventureState, treasure: string): AdventureState => ({
  ...state,
  effects: including(state.effects, treasure),
})

/** Stand in an area, marking it visited. */
export const withArea = (state: AdventureState, area: string): AdventureState => ({
  ...state,
  area,
  visited: including(state.visited, area),
})
