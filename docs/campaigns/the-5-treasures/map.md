---
type: Reference
title: "The 5 Treasures: cave map"
description: "What the cave map on page a1 shows, the inferred adjacency of its chambers (inferred, I-42), and a plain-text adjacency table."
tags: [campaigns, the-5-treasures, map]
cite: "5T a1"
sources:
  - id: adventure
    resource: ../../sources/The-5-treasures.extracted.txt
    title: "The 5 Treasures (pdf-parse extraction), page a1"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../../sources/estate-inventory.md
    title: "Estate inventory, section 4.4"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

The map is an image on page a1; the text extraction carries nothing of
it.[^adventure] Everything below is the inventory's reading of a 4x
render, split into what is known and what is inferred.[^inventory] No
diagram is drawn here; Phase 5 owns the original room diagram.

# What the map shows (known)

A black-and-white cave plan (watabou's cave generator, see
[credits](credits.md)) with **six icon-marked chambers**, one unmarked
chamber, an arrow entering from the lower right, and a grey-shaded pool at
the very top. The icons match the area headings on the same
page:[^inventory]

| Icon | Area | Position on the plan |
|---|---|---|
| cauldron | Kitchen | topmost chamber, the grey pool behind it |
| jugs | Storage room | upper right |
| candelabra | Dining Hall | the large central-left chamber |
| flask | Attendants room | bottom centre |
| horned helmet | Chieftain quarter | lower left, upper |
| fanged face | Women quarter | lower left, lowest |

The Flat-top mountain and the Cave entrance have no icon; the arrow marks
the way in. The map carries no scale, no doors, no labels.[^inventory]

# Adjacency `(inferred, I-42)`

Read from the passages drawn, exactly as the inventory records it:[^inventory]

| From | To |
|---|---|
| Cave entrance (arrow) | unmarked chamber at lower right |
| unmarked chamber | Storage room (north) and Dining Hall (west, via the passage south of the Storage chamber) |
| Storage room | Kitchen (north, past a rock pillar) |
| Dining Hall | Kitchen (north-east), Attendants room (south) |
| Attendants room | Chieftain quarter (west) |
| Chieftain quarter | Women quarter (south) |

The unmarked chamber is the Cave entrance's inside `(inferred, I-42)`.
The reading that the Private Quarters are the Chieftain quarter and the
Women quarter, both reached only through the Attendants room, follows from
the description ("The room serves as entrance to the locked Private
Quarters") and from this layout; it is inferred (I-07).[^inventory]

# Adjacency table (plain text)

The same passages, listed once per area in both directions. The Flat-top
mountain has no chamber on the plan; it is the approach to the Cave
entrance by the text of the areas, not by the map. Every edge below is
`(inferred, I-42)`.

| Area | Adjacent areas |
|---|---|
| Flat-top mountain | Cave entrance (by the text, not the map) |
| Cave entrance (arrow, unmarked chamber) | Flat-top mountain; Storage room; Dining Hall |
| Storage room | Cave entrance; Kitchen |
| Kitchen | Storage room; Dining Hall |
| Dining Hall | Cave entrance; Kitchen; Attendants room |
| Attendants room | Dining Hall; Chieftain quarter (locked, key) |
| Chieftain quarter | Attendants room; Women quarter |
| Women quarter | Chieftain quarter |

Locked passages `(inferred, I-07)`: Attendants room to Chieftain quarter,
and through it the Women quarter, behind "private quarter's key" (held by
the Dexterous Ghost and the Skillful Beast, [foes](foes.md)).

# Engine notes

- Phase 5 (the adventure format and The 5 Treasures): the format's area
  graph, its locks and keys, and "an original SVG room diagram" - drawn
  there from this adjacency, not copied from the source image.
- The adjacency and the identity of the unmarked chamber are readings
  (I-42, A56) and the Private Quarters gate is I-07 (A45); both in the
  [readings](../../rules/readings/the-5-treasures.md). Area text:
  [areas](areas.md).

[^adventure]: The 5 Treasures (pdf-parse extraction), page a1
[^inventory]: Estate inventory, section 4.4
