---
type: Rule
title: "Encounters"
description: "Rolling a random opponent on the 2d6 encounter matrix by terrain column, how opponent Proficiencies and Martial Arts values enter combat, incorporeal opponents, and the opponent stat-block schema."
tags: [rules, encounters]
cite: "MH p.66-67, 70-79"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.66-67, 70-79"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 2.13 (R74-R77, R80), table 3.20"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Encounters

Folios 66-67 open the chapter "SONG - Conflict": four sentences of rules and
the encounter matrix. The 50 stat blocks the matrix names (p. 70-79) are in
[Opponents](../world/opponents.md); the treasure roll after a victory is
[Treasures and Special Items](./treasures-and-special-items.md). An
encounter is reached from the exploration loop's Event roll and the
Oracle's Encounter Outcome row ([Exploration](./exploration.md) R51 step
5, [Oracle Procedure](./oracle-procedure.md)) or from the narrative.

| Rule | Statement | Page | Class |
|---|---|---|---|
| R74 | Random encounter: 2d6 on the relevant column of the matrix (§3.16). | 66-67 | mechanical |
| R75 | "If you need to roll for a Martial Art, the value in parentheses represents how many points each Martial Proficiency has." (Opponents with "Martial Arts (n)".) | 66 | mechanical |
| R76 | "If you need to roll for s Technique or Ritual, add the value in parentheses to the opponent's Attack Strength. Your opponent does not spend ENDURANCE points to perform Techniques or Rituals." | 66 | mechanical |
| R77 | "Sometimes you will face spirits or ghosts, incorporeal beings immune to traditional weapons or blows; you will need to use a technique, ritual, or exceptional weapon to defeat them." | 66 | conditional (no opponent is tagged incorporeal - A29) |
| R80 | Opponent schema: name, one-line description, SKILL, ENDURANCE, ATTACK, Proficiencies with values (§3.19). | 70-79 | mechanical |

Three of the inventory's own cross-references in these rows are off: R74's
"(§3.16)" is the encounter matrix, inventory section 3.20, reproduced below;
R80's "(§3.19)" is the opponent roster, section 3.23; R77's "A29" is the
incorporeal-opponents ambiguity, row A18 (reading I-29). The rows are kept
as written.

# Procedure

1. Pick the column that matches where the Master is: Urban, Non-urban, Water, Supernatural or Monastery (R74). The book does not map Region Locations to columns beyond the names; City is Urban, a Monastery is Monastery, Water is Water.
2. Roll 2d6 and read the opponent. An italic *Supernatural* result in the Non-urban column is a redirect to the Supernatural column, not an opponent.
3. Before fighting, the exploration loop consults the Oracle's Encounter Outcome row: Attack or Ambush starts combat, otherwise the NPC or Creature Reaction row applies (R51 step 5). How many opponents, and whether their attack is Normal or Special, are further Oracle rows.
4. In combat ([Combat](./combat.md)), the opponent's Attack Strength is 2d6 + SKILL + one Proficiency value (R23). A named Technique or Ritual value adds to Attack Strength at no ENDURANCE cost (R76). "Martial Arts (n)" means: roll a Martial Art on the table in [Martial Arts](../world/martial-arts.md) and give each of its Proficiencies n points (R75).
5. Spirits and ghosts are "immune to traditional weapons or blows" and need "a technique, ritual, or exceptional weapon" (R77). No stat block is tagged as such.
6. After a victory, the treasure roll is offered against the opponent's ENDURANCE (R78).

The opponent's ATTACK field "indicates how many enemies can attack at the
same time" (p. 30, R37 in
[Multiple Combat, Escape and Healing](./multiple-combat-escape-healing.md)).

# Encounters matrix (p. 67), 2d6 by column

Italic *Supernatural* in the Non-urban column (verified on the render) is a
redirect, not an opponent: roll on the Supernatural column `(inferred,
I-19)`.

| 2d6 | Urban | Non-urban | Water | Supernatural | Monastery |
|---|---|---|---|---|---|
| 2 | Gui | *Supernatural* | Kun | Dapeng | Tutelary Spirit |
| 3 | Mandarin | Xiongu | Shen | Long Wang | Shi Gong |
| 4 | Shi Fu | Mercenary | Smuggler | Shan Xiao | Shi Fu |
| 5 | Guard with Sheng Biao | Monk | Pirate | Shi Shi | Devotee |
| 6 | Guard with Lian Ting | Beast | Giant Octopus | Huang Feng Guai | Shi Di |
| 7 | Brawler | Bandit | Tanka | Huli Jing | Tu Di |
| 8 | Shi Di | Green Hornet | Shark | Jiangshi | Thief |
| 9 | Guard with Tie Jian | Macaque | Giant Jellyfish | Gui | Cook |
| 10 | Thief | Gai Bang | Kobukson | Feng Huang | Yogi |
| 11 | Boxer | Yauxia | Pan Long | Bai Gu Jing | Attendant |
| 12 | Rebels | *Supernatural* | Ghost Pirate | Niu Mowang | First Abbot |

"Yauxia" (matrix) is "Youxia" in the stat blocks. 49 distinct opponents are
reachable from the matrix; the fiftieth, Dealer, is reached only from the
Gambling House.

# Opponent schema (p. 70-79)

Every stat block carries: name; a one-line description; SKILL; ENDURANCE;
ATTACK; two Proficiencies with values in parentheses, or a single "Martial
Arts (n)" (R80). Five blocks carry only "Martial Arts (n)" (First Abbot,
Mercenary, Shi Di, Shi Fu, Shi Gong); Youxia carries "Martial Arts (2)"
beside a named one. Two irregular fields: Brawler's ATTACK is printed
"2-4"; Huang Feng Guai's ATTACK is blank on the page. The roster and its
ENDURANCE bands for the treasure roll are in
[Opponents](../world/opponents.md). The adventure's nine opponents use the
same schema with "special skills" and a LOOT line
([The 5 Treasures](../campaigns/the-5-treasures/index.md)).

# Engine notes

Mechanical: R74, R75, R76, R80. Conditional: R77 (which opponents are
incorporeal and what an "exceptional weapon" is are untagged).

Readings that bear on this concept:

- [I-19](./readings/exploration-cities-oracle.md) - the italic *Supernatural* cells redirect to the Supernatural column (R74).
- [I-21](./readings/combat.md) - which of two Proficiencies an opponent adds each round (R76, R23).
- [I-07a](./readings/combat.md) - the Oracle's "Special" enemy attack as a Proficiency use (R76).
- [I-08a](./readings/combat.md) - "Ambush" as an unopposed first round (R51 step 5).
- [I-29](./readings/combat.md) - the incorporeal tag list and the exceptional weapons (R77).
- [I-09](./readings/combat.md) and [I-10](./readings/combat.md) - Huang Feng Guai's blank ATTACK; Brawler's "2-4" (R80).
- [I-05](./readings/combat.md) - ATTACK on a singular named monster (R80, R37).
- [I-47](./readings/exploration-cities-oracle.md) - the Oracle's Enemy Type row is consulted only when no table has named the opponent (R74).
- [D01](./readings/discrepancies.md) and [D09](./readings/discrepancies.md) - the count of stat blocks; R75 and R76 as two distinct rules.
