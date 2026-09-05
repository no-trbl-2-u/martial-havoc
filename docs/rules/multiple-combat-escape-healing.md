---
type: Rule
title: "Multiple Combat, Escape and Healing"
description: "Fighting several opponents at once (SKILL minus their number, area damage, the ATTACK attribute), fleeing a fight and its Dishonor cost, and how SKILL, ENDURANCE and LUCK recover."
tags: [rules, combat, healing]
cite: "MH p.30-31"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.30-31"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 2.6, table 3.7"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Multiple Combat, Escape and Healing

Folios 30-31, the tail of the combat chapter. Three short rules blocks: what
changes when the Master faces more than one opponent; how a fight is left
before it ends; how the three attributes come back. The round itself is
[Combat](./combat.md); the ATTACK attribute R37 refers to is a field of every
stat block in [Opponents](../world/opponents.md).

| Rule | Statement | Page | Class |
|---|---|---|---|
| R35 | Multiple combat: "Reduce your SKILL points by an amount equal to the number of opponents you face." | 30 | mechanical |
| R36 | Area Techniques/Proficiencies: "in case of a successful attack, distribute the same amount of damage to the enemies. E.g. you have the Martial Proficiency Double Strike, your attack against 3 opponents causes 4 damage; two of them will suffer 4 damage." | 30 | conditional (how many enemies each area ability reaches is read from its prose) |
| R37 | "The opponent's ATTACK attribute (see Opponents pg. 70) indicates how many enemies can attack at the same time." | 30 | mechanical (meaning for named singular monsters: A05) |
| R38 | Escape: "if you think the enemy is too tough, you can flee. If you have not used a Technique or some other stratagem for a daring escape, suffer a last blow and subtract 2 points from your ENDURANCE." | 30 | conditional ("stratagem" is the player's) |
| R39 | "Score 1 Dishonor Point for each time you fail to escape without suffering damage." Dishonor reduces end-of-adventure XP. | 30 | mechanical |
| R40 | SKILL healing: "you can restore part of it (1 point) with spiritual regeneration Techniques. It recovers completely after a full night's rest." | 31 | mechanical |
| R41 | ENDURANCE healing: "partially recovers (4 points) with healing techniques, spiritual regeneration, eating a meal, or with a Health Elixir. It recovers completely with a week's rest." | 31 | mechanical (meal frequency: A48) |
| R42 | LUCK healing: "partially recovered (1 point) with a Spirituality roll check in a Temple" (p. 47: requires incense). | 31, 47 | mechanical |

The inventory's "A48" in R41 is its meal-frequency ambiguity, row A28
(reading I-48). The row is kept as written.

# Multiple combat (p. 30)

Procedure: count the opponents faced; the Master's SKILL for the fight is
reduced by that number (R35), then rounds run as in [Combat](./combat.md).
"Remember that some Techniques or Martial Proficiencies can help you in
multiple combat: in case of a successful attack, distribute the same amount
of damage to the enemies" (R36) - the example has Double Strike carry 4
damage to two of three opponents. The book gives no worked example with
ATTACK greater than 1; how many opponents roll against the Master each round
is left to R37 and the readings below.

Area abilities the inventory names (their prose is in
[Techniques](../world/techniques.md) and
[Martial Arts](../world/martial-arts.md)): Butterfly Palms ("hit two
opponents"), Light Body ("all opponents surrounding you"), Exploding Qi
("repels those around you"), Double Strike (two, from the example).

# Escape (p. 30)

The Master may flee at any point of a fight. Without "a Technique or some
other stratagem for a daring escape", the Master takes a last blow of 2
ENDURANCE (R38). Each escape that costs damage scores 1 Dishonor Point
(R39); Dishonor is subtracted from the adventure's XP total
([Experience and Advancement](./experience-and-advancement.md) R43). The
Technique route is also the book's own advice for Technique use: knocking
an opponent down gives "the chance to escape without consequences" (p. 24,
R28).

# Healing (p. 31)

## Healing summary (p. 31)

| Attribute | Partial | Amount | Full |
|---|---|---|---|
| SKILL | spiritual regeneration Techniques | 1 | a full night's rest |
| ENDURANCE | healing techniques, spiritual regeneration, eating a meal, a Health Elixir | 4 | a week's rest |
| LUCK | Spirituality check in a Temple, with incense (p. 47) | 1 | - (no full-restore rule; Special Item 7 restores it) |

"SKILL: this attribute isn't usually affected" (p. 31); it is reduced by
multiple combat for the fight (R35) and permanently by Training at creation
(R15). "Spiritual regeneration" is the effect text of the Ritual *Vital
Breath* (cost 1, [Rituals](../world/rituals.md)); "healing techniques" is
not tied to a named entry. The Health Elixir is a Common Item at 25 GP
([Market](../world/market.md)); Rations are 5 GP per day. The Temple check
is R58 in [Cities](./cities.md); Special Item 7 is in
[Treasures and Special Items](./treasures-and-special-items.md). Nothing
in the book caps ENDURANCE.

# Engine notes

Mechanical: R35, R37 (its meaning for a lone monster is open), R39, R40,
R41, R42. Conditional: R36 (reach of each area ability), R38 (what counts as
a stratagem).

Readings that bear on this concept:

- [I-05](./readings/combat.md) and [I-05b](./readings/combat.md) - ATTACK for a singular named monster; the Woodgatherers as a band of five (R37).
- [I-06](./readings/combat.md) - resolution of a round against several opponents (R35).
- [I-11](./readings/combat.md) - how many enemies each area ability reaches (R36).
- [I-32](./readings/combat.md) - what a "stratagem" is, and whether the -2 last blow is damage for Dishonor (R38, R39).
- [I-33](./readings/combat.md) - reinforcements of "1-4 Minions" (Unexpected Event 7) feed multiple combat.
- [I-48](./readings/techniques-rituals-items.md) - how often a meal heals (R41).
- [I-56](./readings/techniques-rituals-items.md) - the adventure's "elixir" is the Health Elixir (R41).
- [I-28](./readings/techniques-rituals-items.md) - reviving at "reduced ENDURANCE" (Ritual *Punishing the sky*).
- [I-58](./readings/exploration-cities-oracle.md) - how often the Temple's LUCK recovery may be attempted (R42, R58).
- [I-17](./readings/exploration-cities-oracle.md) - the exploration Event "Rest" as a night's rest (R40).
