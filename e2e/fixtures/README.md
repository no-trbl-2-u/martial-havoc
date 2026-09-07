# e2e/fixtures

Reach any point in the game in a browser test without walking there.

## The problem

The app has no router. Which screen is open is a field of one
immutable `RecordState` (`apps/app/src/state/types.ts`), and the only
thing that makes a new record is the pure reducer
`reduce(state, action, dice)` (`apps/app/src/state/reduce.ts`). Every
spec in `e2e/` therefore began by tapping through the title page,
creation and the village, then into the cave, before it could assert
anything about the screen it was written for.

## The design

The app saves its record to `localStorage` on every change and reads
it back on start (`apps/app/src/state/persist.ts`). So a record built
outside the browser and written into storage before the page loads is
opened by the app exactly as a returning player's would be. Three
layers, lowest first:

| Layer | File | What it is |
|---|---|---|
| Dice | `dice.ts` | `named(faces)`: a strict queue that throws when spent. `cycling(faces)`: repeats forever. Both are closures over one index. |
| Record | `record.ts` | A `Scene` is `{actions, faces}`. `fold(scene)` reduces the actions over `newRecord`, with the same two-source split as `useRecord`: creation actions and the record's own throws roll on the cycling source, play rolls on the named queue. Named scenes mirror the walking helpers in `prototype.spec.ts`. `extend(scene, actions, faces)` composes. |
| Seed | `seed.ts` | `seed(page, state)` writes the session snapshot and the campaign envelope, the same bytes `save` writes, through `page.addInitScript`. `open(page, scene, query)` seeds, navigates and taps START. |

Use, from a spec:

```ts
import { facingTheGhost, open } from './fixtures'

const state = await open(page, facingTheGhost, '?dice=6,5,1,1')
await expect(page.getByTestId('combat')).toBeVisible()
```

## The named scenes

| Scene | Stands | Spends |
|---|---|---|
| `madeAMaster` | Fen Pass, the Call read, San Te's sheet taken | nothing |
| `readingTheCall` | the same record, named for the opening's stop | nothing |
| `withAMotive` | Fen Pass, the first Adventures-table hook taken at creation | nothing |
| `onTheMountain` | the Flat-top mountain, the beat open | nothing |
| `atTheRules`, `atTheRecord` | the panel open from the mountain | nothing |
| `inTheStorageRoom` | the Storage room, the gourd still on its shelf | `4,4` |
| `facingTheGhost` | the Attendants room, the Dexterous Ghost faced | `4,4,2,3` |
| `atThePaperDoor` | the Attendants room, the Ghost beaten, the key held | `4,4,2,3,6,5,1,1` |
| `struckDown` | the Attendants room, the Master at ENDURANCE 0: a round lost to the Senior King, the flight, a round lost to the Ghost | `4,2,6,1,1,6,6,2,3,1,1,6,6` |
| `atTheEndingsDoor` | the beat with five treasures held and THE ENDING offered | the reducer's whole-cave script, see `record.ts` |

`fixtures.spec.ts` proves the last two reach what they say, and
`played.spec.ts` is what they were built for.

## Why storage, not a hook

Nothing in the app knows a test is running: no query flag, no window
hook, no build-time switch. The seeded storage is indistinguishable
from a player's, so the seeded path is the restore path, and every
seeded spec also proves that `load` accepts what `save` wrote. The
one cost is one tap: every launch opens on the title page and START
is component state, not the record's (`apps/app/src/App.tsx`), so
`open` taps it.

## Why the fold, not JSON files

The session snapshot is deliberately unversioned: a UI field change
costs a session and nothing else (`persist.ts`). A checked-in JSON
fixture would go stale on every such change and fail silently as
"no session". The fold imports the app's own `newRecord` and
`reduce`, so a new field is in every fixture on the next build and a
renamed action is a type error. `fixtures.spec.ts` closes the loop:
the record the fold builds for `madeAMaster` is compared with the
record the app saved after the same taps.

## Limits

- Seeding spends no `?dice=` face; the query names only the rolls the
  spec makes after START.
- The region and a preset's gold are thrown on the record's own dice:
  random in the browser, a fixed `1..6` sweep in the fold. A spec
  that asserts on either must build them on purpose.
- A scene must name every face its play actions roll, in order. Too
  few is an error from `named`; too many is ignored, so keep `faces`
  exact.
- The walking specs stay. They prove the path exists; a fixture only
  proves the screen.
