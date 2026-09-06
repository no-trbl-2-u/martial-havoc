# Phase 8c — The cave, verbatim

**Origin:** the operator, 2026-09-06, after seeing the beat's authored
lines: "I want the adventure to be line for line, event for event, test
for test, verbatim from the pdfs. There should also be an introduction
page if one exists in the book." Recorded as the standing rule in
`VISION.md`. Phase 8's brief already named this as the row its list
left open ("the cave's areas", Phase 10's prerequisite).

**Done when:** the beat plays the eight areas of The 5 Treasures over
the engine's adventure loop, every printed string on screen is the
book's (5T a1, a2) transcribed from `docs/campaigns/the-5-treasures/`,
the Event roll happens on every entry, the LOOT lines replace the
rulebook's treasure roll inside the adventure, and the reducer walks the
cave to the ending act on fixed dice.

## The operator's three calls

| Question | Call |
|---|---|
| Where does a new Master start? | The Flat-top mountain, the book's first area and the file's `startArea`. |
| The invented SKILL/LUCK checks on the old menu? | Dropped. The beat's rolls are the book's: the Event table, the creature table, LOOT. Checks stay in the engine for the Oracle and the sandbox. |
| The book's opening (title block, premise, Event table, its two notes) and credits? | Under ABOUT, not as an interruption after creation. |

## What shipped

- `apps/app/src/state/menu.ts` — the menu derived from the graph:
  exits (a locked door disabled, with its printed text), treasures lying
  here (I-38), the rescue and its attack (I-39), what the area teaches
  (I-38b, I-41), rest, and the foes the last Event brought. Row titles
  are the app's copy; every line under one is the book's or empty.
- `reduce.ts` — `cave.go` runs the engine's `step` on the Master's dice
  (a face tapped by hand reaches the Event roll first, a second the
  creature roll); `cave.take`, `cave.rescue`, `cave.attack`,
  `cave.learn`, `cave.fight`, `cave.rest`, `cave.leave`. A beaten named
  foe is `resolveEncounter`ed; rank and file (Devil servant, Ogre,
  Woodgatherer) are never recorded. `combat.loot` reads the LOOT line
  once.
- The record carries the engine's `AdventureState` whole; the campaign
  bridge maps nothing any more. The session key moved to v2.
- The area slip prints description, `Encounters:` and the Hint once
  earned; the About screen prints page a1's opening and page a2's
  credits verbatim.
- The roll card gained the Event plate and a one-die picker.

## Carry-overs (readings the engine holds, the UI does not yet)

- **Multiple combat (R35).** "Both" in the Attendants room and the
  Woodgatherer band are fought one foe after another, not at once.
- **"Use the Oracle" for the number of Devil servants (I-34).** One is
  fought.
- **Devil servant LOOT 6, the triangle with no text (I-08).** Recorded
  as nothing taken.
- **The flags** (night, the Junior King's nap, the Cord's spells) are
  carried and saved but nothing on the beat sets them yet: the gourd is
  not openable, wine is not carried. The absence rule (Ogres by night)
  therefore never fires.

Each is a row for `/iterate` or a later phase; none blocks Phase 10's
sitting.
