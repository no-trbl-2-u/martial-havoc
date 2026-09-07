/**
 * Who is met, and how many.
 *
 * Three readings do the work here, and all three are data-driven:
 *
 * - **I-34**: an area whose printed `Encounters:` line carries no dice
 *   is a fixed encounter, met on any Ambush or Encounter event. In the
 *   format that is a row with `faces: []`.
 * - **I-33b / I-33c**: a named foe defeated once is gone from that
 *   area's table, and the Kings are one entity across several tables, so
 *   defeating one anywhere removes him everywhere. In the format that is
 *   {@link AdventureState.defeated}, which the engine subtracts before
 *   it reads the row.
 * - **I-45**: a foe may be absent while a flag holds. In the format that
 *   is `absences.json`, so the engine filters by flag and never learns
 *   what night is.
 *
 * A row whose foes are all gone degrades the same way the Chieftain
 * quarter's printed `Empty` does (I-36): no encounter, and the event
 * becomes a safe exploration.
 */
import type {
  AdventureEncounter,
  AdventureTables,
  Opponent,
} from '@martial-havoc/content'
import type { Die, DiceSource } from '../dice/types'
import { d6 } from '../dice/rolls'
import { bandOf, enemyCount } from '../multiple/count'
import type { AdventureState } from './state'
import { flag } from './state'

/** Is `foe` absent from `area` under the state's flags (I-45)? */
export const isAbsent = (
  tables: AdventureTables,
  state: AdventureState,
  area: number,
  foe: string,
): boolean =>
  tables.absences.some(
    (rule) =>
      rule.foe === foe &&
      (rule.area === 0 || rule.area === area) &&
      flag(state, rule.flag) === rule.whenTrue,
  )

/**
 * Is `foe` still available to be met here?
 *
 * A defeated foe is gone (I-33b, I-33c); an absent one is elsewhere
 * (I-45). Unnamed rank and file - Devil servants, Ogres, Woodgatherers -
 * are unlimited, and the format expresses that by never putting them in
 * `defeated`: the caller records only the foes an adventure treats as
 * named. {@link available} therefore asks the state, not the roster.
 */
export const available = (
  tables: AdventureTables,
  state: AdventureState,
  area: number,
  foe: string,
): boolean => !state.defeated.includes(foe) && !isAbsent(tables, state, area, foe)

/** Every encounter row of one printed area number, in printed order. */
export const rowsForArea = (
  tables: AdventureTables,
  area: number,
): readonly AdventureEncounter[] => tables.encounters.filter((row) => row.area === area)

/** What an area's table produced. */
export type Encounter = {
  /** The row that was read, or undefined where the area has none. */
  readonly row: AdventureEncounter | undefined
  /** The face rolled, or undefined for a fixed encounter (I-34). */
  readonly face: Die | undefined
  /** The foes actually met, after removals and absences. */
  readonly foes: readonly Opponent[]
  /** How many of each, as the row prints it. */
  readonly count: AdventureEncounter['count']
  /**
   * The die the headcount was read from, or undefined where none was
   * drawn (I-34, MH p.58).
   *
   * Only the Oracle's Minion cell is a roll. A `one` row and a `band`
   * row are both counted without dice, so a scripted sequence stays
   * exactly as long as the printed procedure asks for.
   */
  readonly countFace: Die | undefined
  /** True where nothing is met and the event degrades to safe (I-36). */
  readonly empty: boolean
}

/** An encounter that met nothing. */
const nothing = (row: AdventureEncounter | undefined, face: Die | undefined): Encounter => ({
  row,
  face,
  foes: Object.freeze([]),
  count: 'none',
  countFace: undefined,
  empty: true,
})

/** Resolve the foe ids of a row against the roster and the state. */
const foesOf = (
  tables: AdventureTables,
  state: AdventureState,
  area: number,
  row: AdventureEncounter,
): readonly Opponent[] =>
  row.foes
    .filter((id) => available(tables, state, area, id))
    .map((id) => tables.foes.find((foe) => foe.id === id))
    .filter((foe): foe is Opponent => foe !== undefined)

/**
 * Read one face of an area's encounter table without rolling.
 *
 * A fixed area (every row `faces: []`) ignores the face entirely. An
 * area with no rows at all meets nothing rather than throwing: an
 * adventure may legitimately hold a room where nothing lives.
 */
export const encounterFor = (
  tables: AdventureTables,
  state: AdventureState,
  area: number,
  face: number,
): Encounter => {
  const rows = rowsForArea(tables, area)
  if (rows.length === 0) return nothing(undefined, undefined)
  const fixed = rows.every((row) => row.faces.length === 0)
  const row = fixed ? rows[0] : rows.find((r) => r.faces.includes(face))
  const rolled = fixed ? undefined : (face as Die)
  if (row === undefined) return nothing(undefined, rolled)
  if (row.empty) return nothing(row, rolled)
  const foes = foesOf(tables, state, area, row)
  if (foes.length === 0) return nothing(row, rolled)
  return { row, face: rolled, foes, count: row.count, countFace: undefined, empty: false }
}

/**
 * The Enemy Type an adventure's dice-less rows are counted as (I-34).
 *
 * The 5 Treasures is the only adventure that uses `count: 'oracle'`, and
 * the rows that do are its Devil servants, whom the book calls minions
 * ("Sneaky minion", 5T a2). The type is an argument rather than a lookup
 * because the engine never learns what a Devil servant is: an adventure
 * that counts Subordinates says so at the call site.
 */
const ORACLE_TYPE = 'Minion'

/**
 * Turn a row's printed `count` into the opponents actually present.
 *
 * `one` is the row as it stands: one of each name it lists, which is how
 * the Attendants room's "Both" fields a Beast and a Ghost. `band` repeats
 * each name to the size reading I-05b gives it. `oracle` draws the one
 * die the Oracle's Minion cell asks for and repeats each name that many
 * times.
 *
 * The expansion is deliberate: downstream, a crowd is a list of stat
 * blocks in the order they were met, so nothing after this point has to
 * carry a multiplier beside a name and remember to apply it.
 */
export const counted =
  (encounter: Encounter) =>
  (dice: DiceSource): Encounter => {
    if (encounter.empty || encounter.foes.length === 0) return encounter
    if (encounter.count === 'one') return encounter
    if (encounter.count === 'band')
      return {
        ...encounter,
        foes: encounter.foes.flatMap((foe) =>
          Array.from({ length: bandOf(foe.attack) }, () => foe),
        ),
      }
    if (encounter.count === 'oracle') {
      const head = enemyCount(ORACLE_TYPE)(dice)
      return {
        ...encounter,
        countFace: head.face ?? undefined,
        foes: encounter.foes.flatMap((foe) => Array.from({ length: head.count }, () => foe)),
      }
    }
    return encounter
  }

/**
 * Roll an area's encounter table (5T a1: "roll for the creature
 * encountered in the area").
 *
 * A fixed area draws no die at all, which matters for a scripted
 * sequence: the dice a playthrough scripts are exactly the dice the
 * printed procedure asks for.
 */
export const encounterIn =
  (tables: AdventureTables, state: AdventureState, area: number) =>
  (dice: DiceSource): Encounter => {
    const rows = rowsForArea(tables, area)
    const fixed = rows.length > 0 && rows.every((row) => row.faces.length === 0)
    return counted(encounterFor(tables, state, area, fixed ? 0 : d6(dice)))(dice)
  }
