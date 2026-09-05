---
type: Table
title: "Oracle"
description: "The Oracle table of p. 58: eleven 1d6 rows (Closed Question, Outcome, NPC reaction, Creature Reaction, Encounter Outcome, Enemy Type, No. of enemies, Enemy attack, Door, Object amount, Value), every cell, with the inferred column spans marked."
tags: [world, oracle]
cite: "MH p.58"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.42, 58"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 3.16"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Oracle

"Consult the Oracles when dealing with uncertainty about information or abilities beyond the Master's knowledge (typically questions you would ask the Game Master). There are several categories of Oracles available, one for each row of the following table" (p. 58).[^rulebook] Roll 1d6 on the row that matches the question. The procedure that calls it (exploration step 5 and step 7, "when in doubt, Oracle") lives in [oracle procedure](../rules/oracle-procedure.md) and [exploration](../rules/exploration.md).

Several cells span more than one die value. The printed table has no vertical rules, so spans were read from column alignment on a 3x render and are marked `(span inferred)` below.[^inventory]

# Table

| Row | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Closed Question | No, and | No | No, but | Yes, but | Yes | Yes, and |
| Outcome | Disaster | Negative | Negative | Positive | Positive | Excellent |
| NPC reaction | Hostile | Wary | Unaware | Kind | Helpful | Flee |
| Creature Reaction | Hostile | Territorial | Unaware | Curious | Docile | Flee |
| Encounter Outcome | Ambush | Attack | Attack | Attack | NPC/Creature Reaction | NPC/Creature Reaction |
| Enemy Type | Minion | Subordinate | Subordinate | Warrior | Warrior | Boss |
| No. of enemies | 1d6 | 3 | 3 | 2 | 2 | 1 |
| Enemy attack | Normal | Normal | Normal | Special | Special | Special |
| Door | Open | Open | Open | Trapped | Locked | Closed |
| Object amount | Finished | One more | One more | Many remaining | Many remaining | Many remaining |
| Value | 5 GP | 10 GP | 25 GP | 50 GP | 100 GP | 250 GP |

# Spans

- Outcome: Negative 2-3, Positive 4-5 (span inferred).
- Encounter Outcome: Attack 2-4, NPC/Creature Reaction 5-6 (span inferred; "Attack" is centred under 3, "NPC/Creature Reaction" under 5-6).
- Enemy Type: Subordinate 2-3, Warrior 4-5 (span inferred).
- No. of enemies: 3 on 2-3, 2 on 4-5 (span inferred, aligned with Enemy Type so that Subordinate = 3, Warrior = 2, Boss = 1, Minion = 1d6).
- Enemy attack: Normal 1-3, Special 4-6 (span inferred).
- Door: Open 1-3 (span inferred).
- Object amount: One more 2-3, Many remaining 4-6 (span inferred).
- Closed Question, NPC reaction, Creature Reaction and Value have one cell per die value; no span is inferred.[^inventory]

# Notes

- "Encounter Outcome" is the row the exploration procedure sends every Event = Encounter to: "Attack or Ambush -> combat, otherwise NPC or Creature Reaction row" (p. 42, R51).[^rulebook]
- "No. of enemies" is also the count the adventure's Devil servant asks for: "use the Oracle for the number of devils" (see [the 5 Treasures readings](../rules/readings/the-5-treasures.md)).[^inventory]
- "Special" enemy attack, "Ambush" as distinct from "Attack", and "Enemy Type" for a named opponent are never defined in the book (inventory section 7, "looked for and not found").[^inventory]
- For an open question the book points to [Inspirations](inspirations.md) instead; for a random word, to [Sparks](sparks.md).

# Engine notes

Rules rows that consume this table (see [oracle procedure](../rules/oracle-procedure.md), [exploration](../rules/exploration.md), [encounters](../rules/encounters.md), [combat](../rules/combat.md)):

- R71 the Oracle itself: a mechanical roll, narrative interpretation.
- R51 steps 5 and 7 of the exploration procedure: Encounter events go to the Encounter Outcome row, then to NPC or Creature Reaction; "when in doubt, Oracle".
- R74 random encounters name the opponent; this table supplies count (No. of enemies) and attack mode (Enemy attack).
- R37 and R35 multiple combat: the count from No. of enemies drives the SKILL penalty.
- R78 Treasures and the Value row for unpriced loot.

Readings that bear on it:

- I-07a (Special = the opponent uses one listed Proficiency this round, adding its value; Normal = SKILL + 2d6 only), I-08a (Ambush = the opponent's first round is unopposed), I-30 (environmental change and divine intervention resolve as narrative plus an Oracle roll): [combat](../rules/readings/combat.md).
- A37 (the rows are prose; the narration model is the operator's), I-47 (Enemy Type is consulted only when the encounter is not already named by a table), I-17 (Hint = an Inspirations roll; Free Exploration = no event): [exploration, cities, oracle](../rules/readings/exploration-cities-oracle.md).
- I-06b (an Oracle "Yes"-class answer counts as information about an area), I-34 (fixed encounters take their count from No. of enemies, Minion = 1d6), I-38 (the jade vase's "if they respond" is a Closed Question), I-32 (a player-declared escape stratagem the Oracle approves): [the 5 Treasures](../rules/readings/the-5-treasures.md) and [combat](../rules/readings/combat.md).

[^rulebook]: Martial Havoc rulebook, pp. 42 and 58 (pdf-parse extraction; folio = PDF page - 1).
[^inventory]: Estate inventory, section 3.16, rows R51, R71, R74, section 7.
