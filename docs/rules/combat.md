---
type: Rule
title: "Combat"
description: "The combat round: opposed Attack Strength, the winner's four options, Techniques in combat, Openings, the Final Blow and its naming table, the Unexpected Event on a tie and its 2d6 table."
tags: [rules, combat]
cite: "MH p.23-29"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.23-29"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 2.5, tables 3.4 and 3.5"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Combat

Folios 23-29: Combat, Use a technique, Creating an Opening, Final Blow and
its table, Unexpected event and its table, Table of Deities. A fight is a
sequence of rounds; each round both sides roll an Attack Strength and the
difference is applied. Fighting several opponents, fleeing and recovering
are on the next two folios,
[Multiple Combat, Escape and Healing](./multiple-combat-escape-healing.md).
Opponent stat blocks are in [Opponents](../world/opponents.md); how their
Proficiencies enter Attack Strength is in [Encounters](./encounters.md)
(R75, R76). The Table of Deities that R34 points to lives in
[Deities](../world/deities.md).

| Rule | Statement | Page | Class |
|---|---|---|---|
| R23 | Attack Strength for each side = 2d6 + one relevant Martial Proficiency (if any) + SKILL. | 23 | mechanical |
| R24 | Opponent higher: Master loses the difference from ENDURANCE. | 23 | mechanical |
| R25 | Master higher, choose one: (a) subtract the difference from the opponent's ENDURANCE; (b) use one of the Techniques you know; (c) change or recover a weapon; (d) create an Opening. | 23 | mechanical (a choice the UI must present) |
| R26 | Combat continues until: a Final Blow lands; either side's ENDURANCE reaches zero; an Unexpected Event occurs. | 23 | mechanical |
| R27 | Using a Technique in combat needs no roll and costs its value in ENDURANCE. "In times of need, the Master can concentrate internal energy and perform a spectacular action without failing." | 24 | mechanical / narrative-only |
| R28 | "To make the fights more challenging, do not use the Technique to end a fight; even if you can knock down an opponent, it does not mean that they are defeated, but that you have gained a great advantage, or the chance to escape without consequences." | 24 | guidance |
| R29 | Creating an Opening: no damage; "your last attack has exposed a weakness in your opponent or made them harmless. You can take advantage to deliver a Final Blow." | 24 | mechanical (a state flag) |
| R30 | Final Blow: "After creating an opening, roll 2d6. If both dice show the same number, your blow lands, giving you the chance to deliver a devastating strike." | 25 | mechanical (doubles = 6/36) |
| R31 | A landed Final Blow may become a new Technique: "roll against your current LUCK. On a failure, lose 1 LUCK; on success assign it a value (1-4) with a brief description. For inspiration, roll 2d6 on the following table, the attributes suit both the action and the animal." | 25 | mechanical (the name is inspiration only - A12 for the LUCK decrement) |
| R32 | Unexpected Event: when both Attack Strengths are equal. "After an Unexpected Event, you are no longer in the combat phase." If the narrative does not make the event clear, roll 2d6 on the table (§3.6). | 27-28 | mechanical trigger; conditional resolution |
| R33 | Optional Minions rule (footnote to Unexpected Event 7): "you can consider Minions with ENDURANCE=1; if you hit you can remove one minion". | 28 | guidance (optional mechanical) |
| R34 | Table of Deities "For divine intervention or to generate random deities". | 28-29 | narrative-only |

Two of the inventory's own cross-references in these rows are off: R32's
"(§3.6)" is the Unexpected Event table, inventory section 3.5, reproduced
below; R31's "A12" is the LUCK-decrement ambiguity, inventory row A09
(reading I-12). The rows are kept as written.

# The round

1. Both sides roll 2d6 and add SKILL plus one relevant Martial Proficiency, if any (R23). The opponent's Proficiency value comes from its stat block; an opponent "does not spend ENDURANCE points to perform Techniques or Rituals" (p. 66, R76). In multiple combat the Master's SKILL is first reduced by the number of opponents (p. 30, R35).
2. Compare.
   - Opponent higher: Master's ENDURANCE minus the difference (R24).
   - Master higher: choose one of (a) damage = the difference to the opponent's ENDURANCE; (b) use a known Technique, paying its value in ENDURANCE, no roll (R25, R27); (c) change or recover a weapon (R25) - relevant because armed Proficiencies add nothing without a weapon (p. 53, R68 in [Market](../world/market.md)); (d) create an Opening, no damage (R29).
   - Equal: an Unexpected Event; the combat phase ends (R32).
3. The fight ends when a Final Blow lands, either ENDURANCE reaches zero, or an Unexpected Event occurs (R26). What ENDURANCE zero means for the Master is R06 in [Master Creation](./master-creation.md); a Shaolin Quan Master "cannot kill" and a Praying Mantis Master's "finishing blow is always lethal" (R13).

The Master may also flee during a fight (p. 30, R38-R39).

# Final Blow

After an Opening, roll 2d6; doubles land the blow, "giving you the chance to
deliver a devastating strike" (R30; probability 6/36). A landed blow may be
added to the Master's knowledge as a new Technique: roll against current
LUCK; on a failure lose 1 LUCK; on success assign it a value 1-4 and a brief
description (R31). The table below is "For inspiration" only.

## Final blow table (p. 26)

Rolled "2d6" per p. 25; laid out as first d6 banded 1-2 / 3-4 / 5-6, second
d6 1-6 - 18 rows, one word from each column, for inspiration only (R31).

| d6 | d6 | Action | Attribute | Animal |
|---|---|---|---|---|
| 1-2 | 1 | Strike | Furious | Dragon |
| 1-2 | 2 | Kick | Spinning | Tiger |
| 1-2 | 3 | Punch | Celestial | Crane |
| 1-2 | 4 | Headbutt | Infernal | Serpent |
| 1-2 | 5 | Palm | Fiery | Scorpion |
| 1-2 | 6 | Fingers | Explosive | Leopard |
| 3-4 | 1 | Cut | Impetuous | Monkey |
| 3-4 | 2 | Flight | Rocky | Phoenix |
| 3-4 | 3 | Leap | Stellar | Taurus |
| 3-4 | 4 | Charge | Flying | Turtle |
| 3-4 | 5 | Slap | Legendary | Leopard |
| 3-4 | 6 | Knee Strike | Deadly | Lion |
| 5-6 | 1 | Parry | Spiritual | Eagle |
| 5-6 | 2 | Block | Demonic | Falcon |
| 5-6 | 3 | Attack | Poisonous | Fox |
| 5-6 | 4 | Defense | Lightning | Mantis |
| 5-6 | 5 | Sprint | Destructive | Horse |
| 5-6 | 6 | Sweep | Sharp | Unicorn |

"Leopard" appears twice in the Animal column (1-2/6 and 3-4/5).

# Examples

Printed on p. 25, all for R31:

- "Destroying Palm of the Turtle / Palm of the Destroyer Turtle / Deadly Palm of the Destroyer Turtle" (three orderings of one roll).
- "New technique: Impetuous Slap of the Phoenix (2). I jump and strike my opponent's cheek, leaving a red scar on their face."
- "New technique: Spiritual Headbutt of the Unicorn (4). I project an energy wave towards my opponent, who loses memory of the fight."
- "New technique: Fox's Spinning Jump (1): a sudden kick and I find myself in the crowd, escaping the fight".

# Unexpected Event

"When the final result of an attack roll ends in a draw (you and your
opponent have the same Attack Strength), an Unexpected Event occurs. It
does not necessarily have to be an extreme incident, but can also be a
simple diversion. After an Unexpected Event, you are no longer in the
combat phase." (p. 27.) If the ongoing narrative does not make the event
clear, roll 2d6 on the table.

## Unexpected Event table (p. 28), 2d6

| 2d6 | Unexpected Event |
|---|---|
| 2 | Adverse divine intervention |
| 3 | Injury or loss of weapon for the Master |
| 4 | Enemy retreat (called back, secret plan, etc) |
| 5 | Environmental change (floor/ceiling collapses, light, climate) |
| 6 | The fight resumes |
| 7 | Reinforcements: 1-4 Minions (footnote: optional ENDURANCE=1 rule, R33) of the same type |
| 8 | The fight resumes |
| 9 | Environmental change (floor/ceiling collapses, light, climate) |
| 10 | Enemy retreat (called back, flees, etc) |
| 11 | Injury or loss of weapon for the opponent |
| 12 | Favorable divine intervention |

The footnote on p. 28 in full: "To streamline combat while maintaining the
idea of a chaotic scene, you can consider Minions with ENDURANCE=1; if you
hit you can remove one minion" (R33). Divine intervention (rows 2 and 12)
points to the Table of Deities, p. 29: "For divine intervention or to
generate random deities, you can roll on the following table" (R34), in
[Deities](../world/deities.md).

# Engine notes

Mechanical: R23, R24, R25, R26, R27 (the ENDURANCE cost; its second
sentence is narrative-only), R29, R30, R31, R32 (the trigger). Conditional:
R32's resolution (nine of the eleven Unexpected Event rows have no stated
mechanical effect). Guidance: R28, R33 (optional). Narrative-only: R34.

Readings that bear on this concept:

- [I-05](./readings/combat.md) - what ATTACK means for a singular named monster (R37, and the opponents' ATTACK field).
- [I-06](./readings/combat.md) - one roll per attacking opponent against the Master's one roll.
- [I-07a](./readings/combat.md) and [I-08a](./readings/combat.md) - the Oracle's "Special" enemy attack and "Ambush" versus "Attack" (R23, R51 step 5).
- [I-12](./readings/combat.md) - the Final Blow's LUCK roll and R21's decrement (R31).
- [I-21](./readings/combat.md) - which of two Proficiencies an opponent adds (R23, R76).
- [I-23](./readings/combat.md) - Techniques only as the winner's option in combat (R25, R14).
- [I-25](./readings/combat.md) - Praying Mantis: a landed Final Blow kills (R13, R30).
- [I-30](./readings/combat.md) - minimum mechanical readings for Unexpected Event rows 2-5 and 9-12 (R32).
- [I-33](./readings/combat.md) - "1-4 Minions" without a d4 (R33, row 7).
- [I-09](./readings/combat.md), [I-10](./readings/combat.md) - Huang Feng Guai's blank ATTACK and the Brawler's "2-4".
- [I-22](./readings/combat.md) - Training's value does not add to Attack Strength (R17, R23).
- [I-01](./readings/attributes-and-creation.md) - ENDURANCE zero for the loser (R26, R06).
- [D04](./readings/discrepancies.md), [D10](./readings/discrepancies.md) - the Final blow table's shape and "exactly one" Proficiency in Attack Strength.
