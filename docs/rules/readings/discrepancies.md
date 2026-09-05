---
type: Reading
title: "Readings: Discrepancies"
description: "The fourteen places where the operator's Spark read the rules differently from what the two sources say, with the weight of each difference."
tags: [rules, readings, discrepancies]
cite: "MH p.7-11, 23-26, 29, 46, 51, 58-63, 66-79, 91-92; The 5 Treasures a1-a2; inventory 5"
sources:
  - id: rulebook
    resource: ../../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.7-11, 23-26, 29, 46, 51, 58-63, 66-79, 91-92"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 5"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Readings: Discrepancies

Inventory section 5, verbatim: "The operator's two rules sections in the
Spark were checked line by line. Most of it is exact; what follows is every
place the sources say something different, more, or less. Confirmed-exact
items are not listed." The Spark is the operator's original statement of
the game's rules, held in the estate record that commissioned the
inventory; it is not in this repository. The inventory's section
references (§3.n) point into its own tables; where a table is reproduced in
`rules/`, the concept is linked in the notes below.

| # | Spark says | Source says | Weight |
|---|---|---|---|
| D01 | "Opponents: forty-five stat blocks of SKILL, ENDURANCE, ATTACK and two Proficiencies." | **Fifty** stat blocks (§3.23); five have a single Proficiency ("Martial Arts (n)"); one (Brawler) has ATTACK "2-4"; one (Huang Feng Guai) has ATTACK blank. | count wrong |
| D02 | "Deities on a d66 table." | A banded table: first d6 1-3 / 4-6, second d6 1-6 - **12 rows**, three columns (§3.6). | shape wrong |
| D03 | "a d66 city-encounter table (connection and trait)" | Same banded shape, **12 rows** (§3.14). | shape wrong |
| D04 | "a name from the d66 Action, Attribute, Animal table" (Final Blow) | The Final blow table is banded 1-2 / 3-4 / 5-6 x 1-6, **18 rows**, and is offered "For inspiration" - the name is the player's, with "a brief description" (R31, §3.4). | shape wrong; name not mandatory |
| D05 | "Eighteen Martial Arts on a d66 table" | Eighteen entries on the same banded 1-2 / 3-4 / 5-6 x 1-6 layout - correct count, not a 36-cell d66 (§3.1). | shape nuance |
| D06 | "Proficiency points to spend equal SKILL" | Equal to the **rolled** SKILL: Training deductions "without affecting the total points to be spent" (R10, R15; the p. 11 example spends 9 with a final SKILL of 7). | omission |
| D07 | "Gambling House (bet resolved by 2d6 + LUCK against the Dealer's 2d6 + SKILL ...)" | Plus "any points from a Martial Proficiency that may help you" on the Master's side (R57). | omission |
| D08 | "Techniques are immediate and usable in combat; Rituals need preparation." | Also: Wudang Quan "can use Rituals in combat" (R13) - a per-style exception the engine must carry. | omission |
| D09 | "Opponents never spend ENDURANCE for Techniques or Rituals; their Proficiency value adds to their Attack Strength." | Two distinct rules: a Technique/Ritual value adds to Attack Strength; a "Martial Arts (n)" value is the points of **each** Proficiency of a rolled Martial Art (R75, R76). Practically equivalent for named Proficiencies. | nuance |
| D10 | "Combat round: both sides roll Attack Strength = 2d6 + Proficiency + SKILL." | "one relevant Martial Proficiency (if any)" - exactly one, chosen for relevance (R23). | nuance |
| D11 | "Appendix C eight pre-generated Masters 91 (images only, no extractable text)." | Heading on p. 91; the sheets are one image on p. 92. Rendered and transcribed in §3.25 - all eight are legible. | page nuance; resolved |
| D12 | "Senior King Gold Horn" | The premise says "Gold Horn", the stat block "GOLDEN HORN"; the source itself is inconsistent. | naming |
| D13 | "The Monk in the kitchen pool is a prisoner to be rescued, not an enemy by default." | The Hint says he is "captured to be eaten"; but the Monk also has a full stat block among "Encounters" with a loot table (rosary / baoding balls / elixir). "Not an enemy by default" is a reading the source permits but does not state. | interpretation |
| D14 | "Special Items: 2d6 table of eleven items." / "Sparks: six d66 word tables." / "Oracle: a 1d6 table with rows for ..." / adventure Event table / nine opponents' numbers / treasures | All exact. | confirmed (listed so the check is visible) |

Not a discrepancy but worth the operator's eye: the Spark's "Multiple
combat: SKILL reduced by the number of opponents" is exact, yet the
Woodgatherer (ATT 5) and Skillful Beast (ATT 5) in the adventure make R37's
meaning matter more than the rulebook's own roster does (A05).

Where each row lands in `rules/` and `world/`: D01, D09 -
[Encounters](../encounters.md) and [Opponents](../../world/opponents.md);
D02 - [Deities](../../world/deities.md); D03, D07 - [Cities](../cities.md);
D04, D10 - [Combat](../combat.md); D05, D06, D08 -
[Master Creation](../master-creation.md) and
[Martial Arts](../../world/martial-arts.md); D11 -
[Pre-generated Masters](../../world/pregenerated-masters.md); D12, D13 -
[The 5 Treasures](../../campaigns/the-5-treasures/index.md) and
[readings A50 / I-39](./the-5-treasures.md); D14 -
[Treasures and Special Items](../treasures-and-special-items.md),
[Oracle](../../world/oracle.md), [Sparks](../../world/sparks.md); the
closing note - [A05 / I-05](./combat.md).

# Defects in the inventory itself

Found while decomposing; reported back to the estate, not corrected in
the copy under `../../sources/`.

| Id | What | This bundle's handling |
|---|---|---|
| X01 | The inventory gives `I-56` to two readings: A29 (the Health Elixir and the Monk's "elixir" are the same item, section 6.3) and A60 (the Monk's plain "rosary" is not Special Item 2, section 6.5). | A29 keeps `I-56` ([techniques, rituals and items](./techniques-rituals-items.md)); A60 is `I-64`, the next free id ([the 5 treasures](./the-5-treasures.md)). `scripts/docs-check.test.ts` is red on any id defined twice, which is how this was found. |
