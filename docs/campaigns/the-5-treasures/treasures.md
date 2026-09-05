---
type: Table
title: "The 5 Treasures: the treasures"
description: "The five magic treasures and how each works, verbatim from page a2, with where each is found in the cave."
tags: [campaigns, the-5-treasures, treasures]
cite: "5T a2"
sources:
  - id: adventure
    resource: ../../sources/The-5-treasures.extracted.txt
    title: "The 5 Treasures (pdf-parse extraction), page a2"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../../sources/estate-inventory.md
    title: "Estate inventory, section 4.6"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

The heading "The 5 Treasures" on page a2 is marked with the same
warning-triangle icon as the areas' Hints; the section is spoiler-gated
like them.[^inventory]

"Read this if you want to know the treasure's way of working:"[^adventure]

# The five treasures (verbatim)

| Treasure | Effect | Where it is (derived from the areas and loot) |
|---|---|---|
| Gold and red gourd | "if opened it will swallow the sky, changing day to night. Close it to have the daylight back." | Storage room (Hint: "looks like an ordinary gourd bottle") - not any opponent's loot |
| Dazzling Golden Cord | "with a spell it moves to tie a person. Another spell unties. It can't be cut with normal weapons." | Old Vixen's loot; she "knows the spells to control" it |
| Vase of muttonfat jade | "remove the label and call out a person's name, if they respond they'll be trapped inside." | Attendants room ("on a pedestal a jade vase is guarded") - not any opponent's loot |
| Plantain Fan | "it creates magic-fire's waves inextinguishable using conventional methods." | Senior King Golden Horn's loot; the Chieftain quarter's screen shows "a fan wrapped in flames" |
| Seven-star sword | "magical and indestructible weapon. It can block hits from stronger enemies without any effort from the holder." | Junior King Silver Horn's loot |

The Chieftain quarter's sheets explain "how two of the treasures work" -
which two is not stated.[^inventory]

# Engine notes

- Phase 5 (the adventure format and The 5 Treasures): treasures as a field
  of the adventure file, each with an effect and a source (an area or a
  foe's loot); the gourd toggling day and night with the Cave entrance's
  Ogres absent by night `(inferred, I-45)`; the vase as an Oracle Closed
  Question, a Yes-class answer removing the opponent `(inferred, I-38)`;
  the gourd and the vase picked up by exploration, not loot `(inferred,
  I-38)`; the Cord inert until its spells are known `(inferred, I-41)`;
  the sheets explaining the fan and the gourd - a guess `(inferred,
  I-38b)`; effects hidden until acquired or read from the sheets
  `(inferred, I-60)`.
- Phase 3 (engine core) supplies the Treasure roll and Special Items the
  rulebook uses for ordinary loot
  ([treasures and special items](../../rules/treasures-and-special-items.md));
  the five named treasures are adventure content, not rows of those
  tables. The foes that carry three of them are in [foes](foes.md); the
  areas that hold the other two in [areas](areas.md).
- All readings: [the 5 treasures readings](../../rules/readings/the-5-treasures.md).

[^adventure]: The 5 Treasures (pdf-parse extraction), page a2
[^inventory]: Estate inventory, section 4.6
