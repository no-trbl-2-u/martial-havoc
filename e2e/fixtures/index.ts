/**
 * `e2e/fixtures`: reach any point in the game without walking there.
 *
 * Three layers, lowest first:
 *
 * 1. `dice.ts` - deterministic `DiceSource`s for building a record.
 * 2. `record.ts` - a `Scene` (actions + faces) folded through the app's
 *    own reducer into a `RecordState`; named scenes for the stops the
 *    walking specs reach by hand.
 * 3. `seed.ts` - the record written into `localStorage` before the page
 *    loads, and `open` to seed, navigate and pass the title page.
 *
 * A spec that needs a screen imports `open` and a scene:
 *
 *     const state = await open(page, facingTheGhost, '?dice=6,1')
 *     await expect(page.getByTestId('combat')).toBeVisible()
 *
 * See `README.md` in this directory for the design and its limits.
 */
export { cycling, named } from './dice'
export {
  HOOK,
  atThePaperDoor,
  atTheEndingsDoor,
  atTheRecord,
  atTheRules,
  extend,
  facingTheGhost,
  facingThreeServants,
  fold,
  inTheStorageRoom,
  madeAMaster,
  onTheMountain,
  readingTheCall,
  struckDown,
  withAMotive,
} from './record'
export type { Scene } from './record'
export { SEEDED_AT, open, seed } from './seed'
