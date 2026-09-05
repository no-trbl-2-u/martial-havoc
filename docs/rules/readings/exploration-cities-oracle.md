---
type: Reading
title: "Readings: Exploration, Cities and Oracle"
description: "The ten places where the exploration loop, the city procedures, the Oracle rows and the XP rules leave a decision to the player, with the inventory's inferred reading for each."
tags: [rules, readings, exploration, cities, oracle]
cite: "MH p.34, 43-48, 58, 67; inventory 6.4"
sources:
  - id: rulebook
    resource: ../../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.34, 43-48, 58, 67"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 6.4"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Readings: Exploration, Cities and Oracle

Inventory section 6.4, verbatim. Each row states what the text leaves open
(known) and the inventory's reading, marked `(inferred, I-nn)`, offered for
the operator to confirm or reject. Rows without an `I-nn` have no defensible
inference from the sources alone. The rules read are in
[Exploration](../exploration.md), [Cities](../cities.md),
[Oracle Procedure](../oracle-procedure.md), [Encounters](../encounters.md)
and [Experience and Advancement](../experience-and-advancement.md).

| Id | Question the text leaves open | The inventory's reading | Cite |
|---|---|---|---|
| A33 / I-15 | Region generation is a physical dice scatter (R52); distance is "arbitrary" (R53). | `(inferred, I-15)` Replace with N random points on a plane (N = "a handful", say 5-8), each rolling the five columns; distance in scenes = rounded Euclidean distance over a chosen unit. | R52 p.43; R53 p.44 |
| A34 / I-17 | Event outcomes "Rest", "Effect Expiration", "Weather/Conditions Change", "Hint", "Free Exploration" are never defined. | `(inferred, I-17)` Rest = a night's rest (R40) available; Effect Expiration = any timed Technique/Ritual/item effect ends; Weather Change = re-roll a weather descriptor (God of Rain, Han Xiangzi's flute interact); Hint = an Inspirations roll shown to the player; Free Exploration = no event, player chooses. | p.43; p.45; R40 p.31 |
| A35 / I-18 | Monastery "Openings" 1-4. | `(inferred, I-18)` Number of exits from the location, each leading to a newly rolled location. | R56 p.45 |
| A36 / I-19 | Encounter matrix italic *Supernatural* cells. | `(inferred, I-19)` Roll on the Supernatural column. | R74 p.67 |
| A37 (no I-nn) | Oracle rows are prose: "No, and", "Disaster", "Territorial", "One more" ... and the Spark's question 3 (narration model) sits here. | Not resolvable from the sources; the book delegates it explicitly. | R71 p.58; p.3 |
| A38 / I-47 | Oracle "No. of enemies" 1d6 for Minion; "Enemy Type" for named opponents (is a Shi Gong a Boss?). | `(inferred, I-47)` Enemy Type is only consulted when the encounter is not already named by a table. | p.58; R74 p.67 |
| A39 / I-54 | Central District entry ("will not be easy"), City Walls ("very difficult"), Market resale ("skilled negotiator") - no checks defined. | `(inferred, I-54)` SKILL checks with a relevant Proficiency (Charisma, Go unnoticed, Stealth, Negotiate-like), at a flat -2 for "very difficult" - numbers are invented. | R59 p.47; R60, R61 p.48 |
| A40 / I-58 | Temple "Abusing the patience of the gods": how many checks per visit before "the opposite effect"? | `(inferred, I-58)` One successful check per Temple per day; a second attempt the same day risks -1 LUCK on failure. | R58 p.47 |
| A41 / I-53 | Which SKILL selects the XP band (R44): current, or initial? Advancement "at the end of each adventure" - what is an adventure's end in a sandbox? | `(inferred, I-53)` Current SKILL at spend time (the example uses current); adventure end is a player-declared close (Cinematic Journey's Resolution). | R44 p.34; R43 p.34; R49 p.35 |
| A42 / I-52 | XP category scores are self-assessed (R43). | `(inferred, I-52)` The UI asks the player four 1-3 questions; no automated scoring. | R43 p.34 |

The inventory's rule rows refer to A33 by its I-number (R52 says "A15") and
to A41 by its I-number (the XP table note says "A53"). The ids above are the
inventory's own. Related: [I-07a](./combat.md) and [I-08a](./combat.md) on
the Oracle's "Special" and "Ambush", [I-13](./combat.md) and
[I-14](./combat.md) on the two city games.
