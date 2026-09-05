---
type: Table
title: "The 5 Treasures: event table"
description: "The 1d6 Event roll made every time an area is entered - Ambush, Encounter, Safe exploration, Hint - and the two notes that govern it."
tags: [campaigns, the-5-treasures, events]
cite: "5T a1"
sources:
  - id: adventure
    resource: ../../sources/The-5-treasures.extracted.txt
    title: "The 5 Treasures (pdf-parse extraction), page a1"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../../sources/estate-inventory.md
    title: "Estate inventory, section 4.2"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

The adventure's one procedure. Dice are printed as pip glyphs and written
here as numbers.[^inventory]

# Event table

"Event table, roll every time you enter an area:"[^adventure]

| 1d6 | Event |
|---|---|
| 1 | Ambush! |
| 2-3 | Encounter |
| 4-5 | Safe exploration |
| 6 | Hint |

# Notes printed with the table

Two lines follow the table on page a1, under the heading "Encounters":[^adventure]

- "for Event=1,2,3 roll for the creature encountered in the area" - the
  area's own Encounters line (1d6 where dice are printed, a fixed
  encounter where they are not; see [areas](areas.md)).
- "read this part only if your PG gets information about the area or with
  Event roll=Hint" - the grey Hint paragraph of each area, marked with a
  warning-triangle icon.

The same triangle icon marks the "The 5 Treasures" heading on page a2 and
the Devil servant's loot on a 6, which has no text (I-08).[^inventory]

# Engine notes

- Phase 5 (the adventure format and The 5 Treasures): the format's event
  table, and the per-area encounter tables it dispatches to; hints are
  gated content revealed by a 6 or by "information about the area".
- Phase 3 (engine core) supplies the Ambush and Encounter resolution the
  event dispatches to (the Oracle's Encounter Outcome, multiple combat).
- Readings that settle what the table leaves open, in the
  [readings](../../rules/readings/the-5-treasures.md): I-06b (what a Hint
  reveals and what "information" is), I-08 (the servant's silent 6), I-34
  (areas whose Encounters line has no dice), I-36 (the Chieftain quarter's
  "Empty"), I-33b (re-entry and respawn), I-59 ("PG" is the player
  character), I-60 (hints hidden until earned).

[^adventure]: The 5 Treasures (pdf-parse extraction), page a1
[^inventory]: Estate inventory, section 4.2
