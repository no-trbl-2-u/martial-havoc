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
  mountain: 'area.the-5-treasures.flat-top-mountain',
  entrance: 'area.the-5-treasures.cave-entrance',
  diningHall: 'area.the-5-treasures.dining-hall',
  attendants: 'area.the-5-treasures.attendants-room',
  storage: 'area.the-5-treasures.storage-room',
  kitchen: 'area.the-5-treasures.kitchen',
  chieftain: 'area.the-5-treasures.chieftain-quarter',
  women: 'area.the-5-treasures.women-quarter',
} as const

/** The Dexterous Ghost, the Attendants room's Encounter creature 3. */
const GHOST = 'foe.dexterous-ghost'

/**
 * The Skillful Beast, the other half of the Attendants room's creature
 * 6 ("Both"), and the corporeal body of this adventure.
 *
 * R77 (MH p.66) makes the Ghost immune to ordinary blows, so a scene
 * that means to demonstrate a strike, an Opening or a Final Blow needs
 * a body an ordinary blow can reach. The Beast is that body, and it
 * drops the same private quarter's key (5T a2), so a fixture that used
 * the Ghost only to open the paper door loses nothing by using it.
 */
const BEAST = 'foe.skillful-beast'
/** The foes the whole cave is played against (5T a2). */
const FOE = {
  juniorKing: 'foe.junior-king-silver-horn',
  seniorKing: 'foe.senior-king-golden-horn',
  beast: 'foe.skillful-beast',
  vixen: 'foe.old-vixen',
  servant: 'foe.devil-servant',
} as const

/** The two treasures that are taken from a room rather than a body. */
const TREASURE = {
  gourd: 'treasure.the-5-treasures.gold-and-red-gourd',
  vase: 'treasure.the-5-treasures.vase-of-muttonfat-jade',
} as const

/**
 * One hook of the thirty-six (MH p.36-39), the first row: the motive a
 * scene gives its Master when a spec needs one. Any row would do; the
 * first is the one a reader can find fastest.
 */
export const HOOK = 'hook.11'

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

/**
 * The Skillful Beast faced in the Attendants room, the combat screen
 * open. Event 4 into the entrance, 4 into the Dining Hall, then Event 2
 * (Encounter) and creature 6 ("Both", 5T a1) into the Attendants room,
 * where the Beast is faced alone and the Ghost is left pending.
 * Spends `4,4,2,6`.
 */
export const facingTheBeast: Scene = extend(
  onTheMountain,
  [
    ...go(AREA.entrance),
    ...go(AREA.diningHall),
    ...go(AREA.attendants),
    { type: 'cave.fight', foe: BEAST },
  ],
  [4, 4, 2, 6],
)

/** The rules panel open from the mountain. Rolls nothing named. */
export const atTheRules: Scene = extend(onTheMountain, [{ type: 'nav', screen: 'rules' }])

/** The record screen open from the mountain. Rolls nothing named. */
export const atTheRecord: Scene = extend(onTheMountain, [{ type: 'nav', screen: 'record' }])

/**
 * A made Master still in Fen Pass, the Call in front of them. The same
 * record as `madeAMaster`, named for where it stands rather than for
 * what was done: the opening's own stop (Phase 10b). Rolls nothing
 * named.
 */
export const readingTheCall: Scene = madeAMaster

/**
 * San Te with a reason to be on the road: the first hook of the
 * Adventures table taken at creation (MH p.36-39; Phase 10j), then
 * creation finished. Still in the village. Rolls nothing named: the
 * motive is chosen, not rolled.
 */
export const withAMotive: Scene = {
  actions: [
    { type: 'creation.preset', id: 'preset.san-te' },
    { type: 'creation.motive', id: HOOK },
    { type: 'creation.begin' },
  ],
  faces: [],
}

/**
 * Into the cave and into the Storage room on two safe Events, the
 * gourd still on its shelf. Spends `4,4`.
 */
export const inTheStorageRoom: Scene = extend(
  onTheMountain,
  [...go(AREA.entrance), ...go(AREA.storage)],
  [4, 4],
)

/**
 * Three Devil servants in the Storage room, faced together.
 *
 * The Storage room's Encounters line names Devil servants and leaves
 * the count to the Oracle's No. of enemies row (I-34), so the Event 2
 * is followed by a 3 - the row's "3" on a 2-3 - and FACE THEM ALL puts
 * all three in one fight (R35). The scene a spec needs when the
 * question is about a crowd: MINIONS AT 1 (MH p.28 footnote) is offered
 * only where there is one. Spends `4` reaching the entrance and `2,3`
 * on the Storage room's Event and count.
 */
export const facingThreeServants: Scene = extend(
  onTheMountain,
  [...go(AREA.entrance), { type: 'cave.go', to: AREA.storage }, { type: 'roll.close' }, { type: 'cave.fight-all' }],
  [4, 2, 3],
)

/**
 * A fight won on one round: the Master ahead on `6,5` against `1,1`,
 * the difference struck off, the one body looted, the fight left. The
 * loot lines of every foe in this file print a named thing and roll no
 * die, so the round's four faces are all it spends.
 */
const struckDownAndLooted: readonly Action[] = [
  { type: 'combat.round' },
  { type: 'combat.strike' },
  { type: 'combat.loot', index: 0 },
  { type: 'combat.leave' },
]

/**
 * The Ghost beaten and the private quarter's key in hand, back on the
 * beat in the Attendants room with the paper door open. Mirrors the
 * 10c walk in `prototype.spec.ts` ("the paper door") up to the door
 * itself. Spends `4,4,2,3` reaching the Ghost and `6,5,1,1` on the round.
 */
export const atThePaperDoor: Scene = extend(
  facingTheBeast,
  [
    // The Beast prints ENDURANCE 13 and a won round on `6,5` against
    // `1,1` is worth 11 (San Te 23, the Beast 7 + somersault leap 3 +
    // 2), so it takes two rounds where the Ghost took one. Its LOOT is
    // the same key (5T a2).
    { type: 'combat.round' },
    { type: 'combat.strike' },
    ...struckDownAndLooted,
  ],
  [6, 5, 1, 1, 6, 5, 1, 1],
)

/**
 * The Master on the floor.
 *
 * Reached across two fights rather than one, which is how it had to be
 * built before Phase 10k: until then the reducer refused a second round
 * after a lost one, so no duel from full ENDURANCE could end with the
 * Master down. It stays as it is because the walk it describes is still
 * a true one and the specs that read it are about the fall, not about
 * how many rooms it took. The fall is reached this way: into the Dining
 * Hall on an Encounter (2) and
 * the Senior King (6); one round lost to him by eleven (San Te's `1,1`
 * on SKILL 8 with NON LETHAL COMBAT 4 makes 14, the King's `6,6` on
 * SKILL 9 with Magic flames 4 makes 25; ENDURANCE 20 to 9); the flight,
 * which costs the last blow of 2 (ENDURANCE 7) and a Dishonor Point;
 * then the Attendants room on an Encounter (2) and the Dexterous Ghost
 * (3), and one round lost to him by nine (`1,1` against `6,6` on SKILL
 * 7 with immaterial charge 4 makes 23), which is more than is left.
 * Spends `4,2,6`, `1,1,6,6`, `2,3`, `1,1,6,6`.
 */
export const struckDown: Scene = extend(
  onTheMountain,
  [
    ...go(AREA.entrance),
    ...go(AREA.diningHall),
    { type: 'cave.fight', foe: FOE.seniorKing },
    { type: 'combat.round' },
    { type: 'combat.leave' },
    ...go(AREA.attendants),
    { type: 'cave.fight', foe: GHOST },
    { type: 'combat.round' },
  ],
  [4, 2, 6, 1, 1, 6, 6, 2, 3, 1, 1, 6, 6],
)

/**
 * A foe beaten with a Final Blow, the way the reducer's whole-cave
 * test beats each of the four: a won round (`6,5` against `1,1`), an
 * Opening, doubles on the blow (`3,3`), the Technique offer let go (the
 * tap the screen asks for that the reducer does not, Phase 10f), the
 * body looted, the fight left. Six faces.
 */
const finished = (foe: string): readonly Action[] => [
  { type: 'cave.fight', foe },
  { type: 'combat.round' },
  { type: 'combat.opening' },
  { type: 'combat.blow' },
  { type: 'combat.let-go' },
  { type: 'combat.loot', index: 0 },
  { type: 'combat.leave' },
]
const FINISH: readonly Die[] = [6, 5, 1, 1, 3, 3]

/**
 * The whole cave played, five treasures held, the Monk rescued, back
 * on the beat with THE ENDING offered. A transcription, action for
 * action, of `reduce.test.ts` "the cave, played to its ending on the
 * reducer", with that test's per-action faces flattened into one list:
 *
 * 1. Cave entrance on `2,5`: the Junior King, beaten; the sword.
 * 2. Storage room on `4`: the gourd off the shelf.
 * 3. Kitchen on `4`: the Monk cut free, his LOOT on a `5` (the elixir).
 * 4. Dining Hall on `2,6`: the Senior King, beaten; the fan.
 * 5. Attendants room on `2,1`: the Skillful Beast, beaten; the key.
 *    The vase from its pedestal.
 * 6. Chieftain quarter on `6,1`: the paper door reads the quiet 6 as
 *    an Encounter (MH p.84, R82) and finds nobody, both Kings being
 *    down (I-36); the sheets read.
 * 7. Women quarter on `2`: the Old Vixen and her she-Devil servant,
 *    both fixed by the room's Encounters line (5T a1). The Vixen
 *    beaten; the cord. Then the servant, still standing (a room does
 *    not empty because one of two fell, Phase 10e): a won round
 *    (`6,5` against `1,1`) struck off is more than his seven, and
 *    the body is left where it lies, unlooted.
 */
export const atTheEndingsDoor: Scene = extend(
  onTheMountain,
  [
    ...go(AREA.entrance),
    ...finished(FOE.juniorKing),
    ...go(AREA.storage),
    { type: 'cave.take', treasure: TREASURE.gourd },
    ...go(AREA.kitchen),
    { type: 'cave.rescue' },
    ...go(AREA.diningHall),
    ...finished(FOE.seniorKing),
    ...go(AREA.attendants),
    ...finished(FOE.beast),
    { type: 'cave.take', treasure: TREASURE.vase },
    ...go(AREA.chieftain),
    { type: 'cave.learn' },
    ...go(AREA.women),
    ...finished(FOE.vixen),
    { type: 'cave.fight', foe: FOE.servant },
    { type: 'combat.round' },
    { type: 'combat.strike' },
    { type: 'combat.leave' },
  ],
  [2, 5, ...FINISH, 4, 4, 5, 2, 6, ...FINISH, 2, 1, ...FINISH, 6, 1, 2, ...FINISH, 6, 5, 1, 1],
)
