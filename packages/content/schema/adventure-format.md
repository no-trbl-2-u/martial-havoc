# The Martial Havoc adventure format, v1

> The public shape an adventure is written in. `spec.md` refuses an
> authoring tool but keeps the format public: this document is that
> promise kept. Anyone can write a second adventure by writing these
> files; nothing in `packages/engine` names an adventure, an area or a
> foe of The 5 Treasures.
>
> **Version 1.** The version is a field (`adventureMeta.version`), not a
> filename. The engine refuses a version it does not know rather than
> guessing. Bump it only when a record shape changes incompatibly.

## 1. An adventure is a directory

```
packages/content/data/campaigns/<adventure-id>/
├── adventure.json     one adventureMeta   the header
├── events.json        band                the event table rolled on entering an area
├── areas.json         adventureArea       the places
├── encounters.json    adventureEncounter  who is met where
├── loot.json          adventureLoot       what the dead carry
├── treasures.json     adventureTreasure   the named prizes
├── flags.json         adventureFlag       the adventure's own clock and states
├── absences.json      adventureAbsence    "while this flag holds, this foe is not met here"
├── acts.json          adventureAct        act markers, the last of them the ending
└── map.svg            (not a record file) an original room diagram
```

Every `.json` file is the **same envelope every other content file
uses** — `$schema`, `id`, `kind`, `title`, `cite`, `label`, `docs`,
`records` — validated by the one schema in `content.schema.json`
(`agents.md` rule 7, and the schema's own promise that "Phase 5's
adventure files reuse these same kinds"). There is no second schema and
no adventure-specific validator.

Foes are **not** a file of the directory. They are opponents, and they
live in the opponent shape the rulebook's 50 already use — for The 5
Treasures, `data/campaigns/the-5-treasures-foes.json`. Every `foe` field
below is an opponent record id, and a content test asserts each one
resolves.

## 2. The records

Field-by-field definitions live in `content.schema.json`, which is the
authority; this section says what each record is *for*.

### `adventureMeta` — the header

One record per adventure. Carries the format `version`, the printed
`title`, the `premise` paragraph verbatim, the `startArea`, and the
printed `credits` line. Every other record in the directory names this
record's id in its `adventure` field: that is what makes a directory one
document rather than nine loose files.

### `adventureArea` — the places

The printed area `number` and `name`, the printed `description`, the
spoiler-gated `hint`, and one authored `line` of ours for the beat
screen. Then the machinery:

- **`exits`** — the ids of the areas reachable from here. Undirected in
  the source, so an edge is listed on both areas.
- **`gate`** — `null`, or `{ key, text }`. A `key` id an `adventureLoot`
  row can drop; `text` is what the door is, as the source describes it.
- **`treasures`** — treasure ids found here by exploration rather than
  as loot.
- **`rescue`** — `null`, or a stat-blocked NPC who is a rescue rather
  than an enemy: fightable if the Master attacks, otherwise freed for
  the reward of their loot roll.

`description` and `hint` are transcriptions and are never edited
(`agents.md` rule 9.1). `line` is the only authored field.

### `adventureEncounter` — who is met where

One record per printed band of an area's `Encounters:` line.

- **`faces`** — the 1d6 faces that land on this row, listed explicitly.
  `[]` means a **fixed encounter**: an area whose printed line carries
  no dice, met on any Ambush or Encounter event.
- **`foes`** — the opponent ids met. **Two ids is a multiple combat**
  (R35), the way an area printing "Both" means it.
- **`count`** — `one` a single opponent; `band` a group that attacks
  together; `oracle` a number read from the Oracle's "No. of enemies"
  row; `none` where the row meets nothing.
- **`empty`** — true where the row meets nothing and the event degrades
  to Safe exploration.

### `adventureLoot` — what the dead carry

One record per printed band of a foe's `LOOT:` line; a line naming a
single drop carries `faces: []`. `item` is the drop verbatim.
`treasure` and `key` lift a drop out of plain text into something the
engine can hold. `hint` marks a drop that is a Hint rather than an
object. `once` marks a drop that exists in a single copy because the
foe is one entity across several tables.

### `adventureTreasure` — the named prizes

`name` and `effect` verbatim. `source` is `area` or `loot` and
`sourceRef` names the area or the foe. **`knownFrom`** is what reveals
the effect short of holding the treasure — an area whose papers explain
it, a foe who knows its spells. Empty means the effect is revealed on
acquiring. Treasure effects are spoiler-gated exactly as hints are.

### `adventureFlag` — the adventure's own clock and states

A named boolean the engine carries in the adventure state. The rulebook
has no clock; an adventure that wants one says so here, with `initial`
and a line of `text` saying what it means.

### `adventureAbsence` — conditional absence

"While this flag holds, this foe is not met in this area." `area: 0`
means every area of the adventure. This is the shape that keeps a
day/night rule out of the engine: the engine filters encounter rows
through the absences, and knows nothing about night.

### `adventureAct` — act markers and the ending

The source of an adventure may print no arc at all; act markers are
therefore usually `label: invention` and cite the build that authored
them. Acts are tested in **ascending order and the highest satisfied one
is current**. `condition` is one of:

| condition | `threshold` | satisfied when |
|---|---|---|
| `start` | `null` | always |
| `enter` | an area id | that area has been entered |
| `defeated` | a foe id | that foe has been defeated |
| `treasures` | a count | at least that many treasures are held |

Exactly one row per adventure carries `ending: true`. That row is the
**ending screen**, and reaching it is what "the adventure can be
finished" means — the phase's own done-condition is a scripted Master
reaching it on fixed dice.

## 3. What the engine does with all this

`packages/engine/src/adventure/` reads the records as **arguments**, the
way every other engine module reads its tables: pure functions, dice
injected, no `fs`, no React, no adventure named in code.

```
beginAdventure(tables)      -> AdventureState
rollEvent(events)(dice)     -> EventKind          the 1d6 table
exitsFrom / canEnter        -> the area graph and its locks
enterArea                   -> a state that has been somewhere new
encounterIn(...)            -> the area's row, after removals and absences
revealHint / revealTreasure -> the spoiler gates opening
lootFrom                    -> the rows of a defeated foe's LOOT line
actFor / ending             -> the current act marker, and whether it ends
step                        -> one Master turn, as a list of what happened
```

`step` never rolls a fight: combat is the rulebook's, resolved by the
combat module, and `step` hands the encounter back to its caller.

## 4. Writing a second adventure

1. Make a directory under `data/campaigns/`.
2. Write `adventure.json` with `version: "1"`.
3. Write the areas, their exits and their gates.
4. Write the encounter rows; reference opponent ids that exist.
5. Write the loot rows for every foe you reference.
6. Write the treasures, the flags, the absences and the acts — with one
   `ending: true`.
7. Draw an original `map.svg`.
8. Add a row per file to `EXPECTED_RECORD_COUNTS` in
   `packages/content/src/content.test.ts` and to the registry in
   `packages/content/src/counts.ts`.

No engine change is required at any step. If one is, the format has a
gap and the gap is the bug.
