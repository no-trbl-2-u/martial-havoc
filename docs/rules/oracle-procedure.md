---
type: Rule
title: "Oracle Procedure"
description: "When and how the Oracle's 1d6 rows, the two d66 Inspirations tables and the six Sparks tables are consulted, and which rules elsewhere call each row."
tags: [rules, oracle]
cite: "MH p.58-63"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.58-63"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 2.12"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Oracle Procedure

Folios 58-63, the chapter "XUN - Proceeding": the Oracle table, the two
Inspirations tables and the six Sparks tables. This concept holds the
procedure - when each tool is consulted and what is rolled. The word tables
themselves are in `world/`: [Oracle](../world/oracle.md) (the 1d6 rows with
their inferred spans), [Inspirations](../world/inspirations.md) (Action and
Theme, d66 each) and [Sparks](../world/sparks.md) (Tables 1-6, d66 each).

| Rule | Statement | Page | Class |
|---|---|---|---|
| R71 | Oracle: "Consult the Oracles when dealing with uncertainty about information or abilities beyond the Master's knowledge (typically questions you would ask the Game Master)." One 1d6 row per category (§3.15). | 58 | mechanical roll; narrative-only interpretation |
| R72 | Inspirations: for an open question or a stimulus; roll Action (d66) and Theme (d66), combine, interpret. | 59-60 | mechanical roll; narrative-only |
| R73 | Sparks: roll 1d6 for the table, then d66 for the word; "interpreted intuitively". | 60-63 | mechanical roll; narrative-only |

The inventory's "(§3.15)" in R71 is the Oracle table, inventory section
3.16, held in [Oracle](../world/oracle.md). The row is kept as written.

# The Oracle (p. 58)

"There are several categories of Oracles available, one for each row of the
following table" (p. 58). Procedure: choose the row that matches the
question; roll 1d6; read the cell; interpret. Several cells span more than
one die value; the spans were read from column alignment on the render and
are marked "(span inferred)" in [Oracle](../world/oracle.md).

The eleven rows and who calls them:

| Row | Consulted when | Called by |
|---|---|---|
| Closed Question | a yes/no question to the absent Game Master | R71; R51 step 7 ([Exploration](./exploration.md)); the jade vase's "if they respond" in the adventure |
| Outcome | the result of an action or situation is uncertain | R71 |
| NPC reaction | an encounter that is not a fight, with a person | R51 step 5, after an Encounter Outcome that is not Attack or Ambush |
| Creature Reaction | as above, with a creature | R51 step 5 |
| Encounter Outcome | an Event roll gives Encounter | R51 step 5: Ambush or Attack starts [Combat](./combat.md); the two right-hand values send to NPC/Creature Reaction |
| Enemy Type | the encounter is not already named | R71; the matrix in [Encounters](./encounters.md) normally names the opponent |
| No. of enemies | how many opponents are met | R71; the adventure's "use the Oracle for the number of devils"; feeds R35 |
| Enemy attack | Normal or Special | R71; undefined in the text |
| Door | a door is met (Monastery exploration) | R71 |
| Object amount | how much of a consumable remains | R71 |
| Value | what something is worth, 5 GP to 250 GP | R71; R60's resale, R67's unlisted-item pricing in [Market](../world/market.md) |

The book defines none of the cell words ("No, and", "Disaster",
"Territorial", "One more", "Special", "Ambush"); interpretation is the
player's (inventory row A37, no defensible inference).

# Inspirations (p. 59-60)

"Inspiration can be invoked in the following cases: 1. You want to ask the
Oracle an open question. 2. You are looking for a stimulus or suggestion.
Inspirations are used to suggest a discovery, an event, a character goal,
or a situation. Combine the rolls on both of the following tables to
provide an action and a subject. Then, interpret the result based on the
context of the question and your current situation." Procedure: roll d66
on Action and d66 on Theme, combine the two words, interpret (R72). The
exploration Event "Hint" has no definition; reading I-17 shows an
Inspirations roll for it.

# Sparks (p. 60-63)

"The following tables contain random words related to the theme of the
game and include names of generic objects and places. First roll a d6 to
determine which table to consult, then roll d66 to find the word. The
spark thus rolled should be interpreted intuitively in relation to the
context of the game. It will help make your adventure more vivid and
surprising." Procedure: 1d6 selects Table 1-6; d66 selects the word (R73).
Five words repeat across tables (Bed, Bottle, Pendant, Rope; "Sign" twice in
Table 6), noted in [Sparks](../world/sparks.md).

# Where the Oracle sits in play

- Exploration: every new location or scene rolls an Event; Encounter goes to Encounter Outcome, then to combat or a Reaction row (R51 steps 4-5). "When in doubt, use the Oracle tools" (step 7).
- Combat: an Unexpected Event whose nature "is not clear from the ongoing narrative" has its own 2d6 table, not the Oracle ([Combat](./combat.md) R32); divine intervention rolls on [Deities](../world/deities.md).
- Cities: none of the city procedures call the Oracle; the undefined difficulties of the Central District and City Walls are the kind of question it answers ([Cities](./cities.md)).
- The 5 Treasures: the Devil servant's count, the jade vase's name-call, and "information about the area" that unlocks a Hint are all Oracle questions ([The 5 Treasures](../campaigns/the-5-treasures/index.md)).
- Appendix B's advice, "If the result of the dice roll conflicts with the linear development of the story, ignore the dice" (p. 81-91, R82), applies to Oracle rolls as much as Event rolls; it is guidance.

# Engine notes

Mechanical: the rolls of R71, R72, R73 (a 1d6 row lookup; two d66 lookups;
a 1d6 then d66 lookup). Narrative-only: every interpretation. The Encounter
Outcome, Enemy Type, No. of enemies and Enemy attack rows are the ones
other rules consume mechanically.

Readings that bear on this concept:

- [I-07a](./readings/combat.md) - "Special" enemy attack = the opponent uses a listed Proficiency this round; "Normal" = SKILL + 2d6 only.
- [I-08a](./readings/combat.md) - "Ambush" = an unopposed first round for the opponent.
- [I-47](./readings/exploration-cities-oracle.md) - Enemy Type consulted only when no table has named the encounter.
- [I-17](./readings/exploration-cities-oracle.md) - the Event "Hint" shown as an Inspirations roll.
- [I-19](./readings/exploration-cities-oracle.md) - the matrix's italic *Supernatural* cells.
- [I-34](./readings/the-5-treasures.md) - the Devil servants' count from the No. of enemies row (Minion, 1d6).
- [I-38](./readings/the-5-treasures.md) and [I-06b](./readings/the-5-treasures.md) - the vase as a Closed Question; "information about the area" as a Yes-class answer or a Kind/Helpful reaction.
- Inventory row A37 (Oracle cell words as prose) has no reading; see [Exploration, Cities and Oracle readings](./readings/exploration-cities-oracle.md).
- [D14](./readings/discrepancies.md) - Oracle, Inspirations and Sparks confirmed exact against the Spark.
