---
type: Rule
title: "Experience and Advancement"
description: "End-of-adventure XP from four self-scored categories minus Dishonor, the XP cost table by SKILL band, the caps on SKILL and LUCK, and buying Training for new Techniques and Rituals."
tags: [rules, advancement]
cite: "MH p.34-35"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.34-35"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 2.7, tables 3.8 and 3.9"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Experience and Advancement

Folios 34-35, the chapter "SHENG - Ascending". XP is awarded once per
adventure from four 1-3 scores minus Dishonor, then spent by a cost table
whose columns are the Master's SKILL band. Dishonor comes from
[Escape](./multiple-combat-escape-healing.md) (R39); Training and Resource
points are defined in [Master Creation](./master-creation.md) (R15, R16);
the adventure hooks that frame "an adventure" are in
[Adventure Hooks](../campaigns/adventure-hooks.md).

| Rule | Statement | Page | Class |
|---|---|---|---|
| R43 | At the end of each adventure assign 1 (poor) to 3 (excellent) for each of: Mission Success; Use of equipment and environment; Combat spectacularity; Lateral thinking. Sum, subtract Dishonor Points = XP. | 34 | conditional (self-assessed scores; the arithmetic is mechanical; XP range 4-12 before Dishonor) |
| R44 | XP cost table by current SKILL band (§3.9). | 34 | mechanical |
| R45 | "SKILL and LUCK attributes cannot exceed 12 points, while Martial Proficiency can exceed the initial maximum value of 4." | 35 | mechanical |
| R46 | New Techniques or Rituals require raising Training with XP; the example gives 4 Resource Points per Training point bought. | 35 | mechanical |
| R47 | "Any remaining XP will remain available to spend on the next advancement." | 35 | mechanical |
| R48 | "A Master with low SKILL points will have more opportunities to improve their martial Proficiencies; a Master with a high SKILL level ... will be able to expand their knowledge in other areas." | 34 | narrative-only (explains the table's shape) |
| R49 | Worked example: Master Lee SKILL 11, LUCK 9, ENDURANCE 24; scores 2+3+1+3, Dishonor 1, total 8; options listed at the 10-12 band. | 35 | example |

# Earning XP (p. 34)

## Experience score categories (p. 34)

| Category | Range |
|---|---|
| Mission Success | 1-3 |
| Use of equipment and environment | 1-3 |
| Combat spectacularity | 1-3 |
| Lateral thinking | 1-3 |
| minus Dishonor Points | 0-n |

XP = sum of the four scores minus Dishonor Points (R43). The four scores
are the player's own assessment; the book gives no rubric beyond "1 (poor)
to 3 (excellent)". Unspent XP carries over (R47).

# Spending XP (p. 34-35)

## XP cost table (p. 34), per +1

| Increase | SKILL 6 or less | SKILL 7-9 | SKILL 10-12 |
|---|---|---|---|
| Martial Proficiency | 6 XP | 8 XP | 10 XP |
| SKILL | 8 XP | 10 XP | 12 XP |
| ENDURANCE | 4 XP | 4 XP | 4 XP |
| LUCK | 10 XP | 8 XP | 6 XP |
| Training skill | 10 XP | 8 XP | 6 XP |

Caps: SKILL <= 12, LUCK <= 12; Proficiency uncapped after creation (R45).
No ENDURANCE cap is stated. Which SKILL value selects the band (current or
initial) is not stated; the example uses the current SKILL 11 (A53).

The table's header row reads "Master's SKILL points" (p. 34). The "6 or
less" column is reachable only by a Master who converted SKILL into
Training at creation, since rolled SKILL is at least 7 (R04). Buying a
Training point yields 4 Resource Points for new Techniques or Rituals
(R46), at the costs printed in [Techniques](../world/techniques.md) and
[Rituals](../world/rituals.md). A landed Final Blow is the other way to gain
a Technique, at a LUCK roll instead of XP ([Combat](./combat.md) R31).

The inventory's "(A53)" above refers to its ambiguity row A41 (reading
I-53); the note is kept as written.

# Examples

Master Lee (p. 35): "SKILL=11 LUCK=9 ENDURANCE=24. In saving the governor's
son from the bandits, Master Lee obtained the following: Mission success:
2, Use of equipment and environment: 3, Combat spectacularity: 1, Lateral
thinking: 3, Dishonor points: 1, Total= 8. With 8 XP, I can choose to
increase ENDURANCE by 1 or 2 points (4 XP) or my LUCK by 1 point (6 XP); or
I can increase my Training skill by 1 point (6 XP), obtaining 4 Resource
Points to spend on learning new Techniques or Rituals. Any remaining XP
will remain available to spend on the next advancement." The options are
read from the 10-12 column; SKILL (12 XP) and a Proficiency (10 XP) are
out of reach with 8, and SKILL 12 would in any case be the cap.

# Engine notes

Mechanical: R44, R45, R46, R47, and the arithmetic of R43. Conditional:
R43 (the four scores are self-assessed; the end of "an adventure" is not
defined for sandbox play). Narrative-only: R48. Example: R49.

Readings that bear on this concept:

- [I-52](./readings/exploration-cities-oracle.md) - the four scores are asked of the player, not computed (R43).
- [I-53](./readings/exploration-cities-oracle.md) - the band is chosen by current SKILL at spend time; an adventure ends when the player declares it (R44).
- [I-32](./readings/combat.md) - when an escape scores Dishonor (R39, feeding R43).
- [I-46](./readings/techniques-rituals-items.md) - Special Item 7 raising LUCK against the cap of 12 (R45).
