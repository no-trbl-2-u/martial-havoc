---
type: Rule
title: "Master Creation"
description: "How a Master is built: schema, starting equipment, social status, the three attributes, Martial Art and Proficiency spending, Training and its Resource points, and the two worked examples."
tags: [rules, creation]
cite: "MH p.5-19"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.5-19"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, sections 2.1, 2.2, 2.3"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Master Creation

The procedure that produces a playable Master, as the rulebook states it on
folios 5-19 (chapter "ZHUN - Beginning"). Three parts: the Master's schema,
starting kit and attributes (p. 5-6); the Martial Art and its Proficiencies
(p. 7-10); Training, Techniques and Rituals (p. 11-19). The lists a creating
Master draws from live in `world/`: [Martial Arts](../world/martial-arts.md),
[Techniques](../world/techniques.md), [Rituals](../world/rituals.md), the
[Market](../world/market.md) for the starting item, and the eight
[pre-generated Masters](../world/pregenerated-masters.md) as finished
examples.

Order of operations, as the text runs: define the schema (R01), roll social
status and take the starting kit (R02, R03), roll SKILL, ENDURANCE and LUCK
(R04), choose or roll a Martial Art (R09), optionally convert SKILL into
Training 1:1 (R15), spend the rolled SKILL on Proficiencies to a cap of 4
each (R10, R11), spend 4 Resource points per Training point on Techniques and
Rituals (R16).

# Schema, equipment and attributes (p. 5-6)

| Rule | Statement | Page | Class |
|---|---|---|---|
| R01 | A Master is defined by: name and age; Martial Art; SKILL, ENDURANCE and LUCK points; Martial Proficiencies; Techniques and Rituals (if any); Equipment; Experience points. | 5 | mechanical (schema) |
| R02 | Initial equipment: common clothing; a weapon ("even if not listed in the weapon table pg. 53"); "A Health Elixir or an item from the Market costing less than 20 GP"; gold pieces by social status. | 5 | mechanical (the weapon is free text) |
| R03 | Social status, 1d6: 1 Vagabond, 1 GP; 2 Poor, 1d6-1 GP; 3-4 Middle Class, 3d6 GP; 5 Rich, 5d6+6 GP; 6 Noble, 10d6 GP. | 5 | mechanical |
| R04 | SKILL = 1d6+6. ENDURANCE = 2d6+12. LUCK = 1d6+6. | 6 | mechanical |
| R05 | "These initial stats are crucial. Although they may fluctuate, they usually only increase above their initial values in exceptional circumstances." | 6 | guidance (but the engine must **store initial values**: R64's Ritual and Special Item 7 refer to them) |
| R06 | ENDURANCE at zero: "the Master dies or becomes unconscious." | 6 | conditional (which of the two is not decided by the text) |
| R07 | SKILL = combat prowess, dexterity, agility; ENDURANCE = health and physical condition; LUCK = good fortune. | 6 | narrative-only |
| R08 | Worked example: "XinYue 27 - Long Weapon Master - SKILL=7 ENDURANCE=18 LUCK=9 Status: Poor (3GP) Equipment: common clothing, Spear, Health elixir Martial Proficiencies: Armed Combat (2) Defensive Barrier (4) Sweep (1)". | 5 | example (7 points spent = SKILL 7) |

Social status as the book prints it (p. 5):

| 1d6 | 1 | 2 | 3-4 | 5 | 6 |
|---|---|---|---|---|---|
| Status | Vagabond | Poor | Middle Class | Rich | Noble |
| GP | 1 | 1d6-1 | 3d6 | 5d6+6 | 10d6 |

Attribute ranges that follow from R04: SKILL 7-12, ENDURANCE 14-24, LUCK
7-12. "R64's Ritual" in R05 is the inventory's pointer to the Ritual *Body
and Mind balance* (swap SKILL and ENDURANCE, capped at initial values) in
[Rituals](../world/rituals.md); Special Item 7 is the lotus flower of He
Xiangu in [Treasures and Special Items](./treasures-and-special-items.md).

Which items in the Market cost "less than 20 GP" (R02) is derived, not
stated; the inventory's list (section 3.15) is carried in
[Market](../world/market.md).

# Martial Arts and Proficiencies (p. 7-10)

| Rule | Statement | Page | Class |
|---|---|---|---|
| R09 | Choose a Martial Art or roll on the table (first d6 banded 1-2 / 3-4 / 5-6, second d6 1-6: 18 entries). | 7 | mechanical |
| R10 | Each Martial Art has its own Proficiencies, "on which you can spend as many points as your SKILL value." | 7 | mechanical (the pool is the **rolled** SKILL, before any Training deduction - R15) |
| R11 | "Martial Proficiencies can't exceed the maximum value of 4 at creation." | 7 | mechanical |
| R12 | Fighting bare-handed or armed without the matching Proficiency is allowed: "they simply will not add points to SKILL checks. The same applies to any action that a martial expert wants to try, such as climbing, jumping, intimidating, etc." | 7 | mechanical |
| R13 | Style texts carry powers of their own (§3.1): Improvised weapons "You can always find a weapon"; Drunken style "As long as you have alcohol, you can surprise your enemy and ignore damage from the first hit"; Shaolin Quan "you cannot kill. Regarded as a religious person you can beg for food or lodging"; Cult of the Great Immortals "You can turn iron into gold, read minds, walk on fire, etc."; Praying Mantis "Your finishing blow is always lethal, and you can hit small targets with finger strikes"; Wudang Quan "You can use Rituals in combat"; 9-Section chain whip "a concealable weapon capable of entangling". | 7-10 | conditional (Drunken: needs an alcohol item and a per-fight "first hit" flag; Shaolin: opponent at 0 cannot die; Mantis: Final Blow kills; Wudang: Rituals allowed in combat - the others are narrative-only) |

The 18 styles, their verbatim style texts and their 56 named Proficiencies
(46 distinct names; 5 for Wu Xing Quan, 4 for the Cult of the Great
Immortals, 3 for the rest) are the table in
[Martial Arts](../world/martial-arts.md) (inventory section 3.1). One source
inconsistency to carry: the Training example on p. 11 calls Improvised
weapons' second Proficiency "Throwing weapons" where the table on p. 8 says
"Ranged weapons".

Armed Proficiencies depend on holding a weapon item: "if you do not have a
weapon, do not add the specialization points" (p. 53, inventory R68, held
in [Market](../world/market.md)).

# Training, Techniques and Rituals (p. 11-19)

| Rule | Statement | Page | Class |
|---|---|---|---|
| R14 | Training lets you learn Techniques and Rituals. "Techniques are immediate and can also be used in combat, while Rituals require preparation time, such as invoking a deity, meditation, or physical exercise." | 11 | mechanical (activation timing: Technique = any time incl. combat; Ritual = out of combat, except R13 Wudang) |
| R15 | At creation, subtract SKILL points 1:1 for Training points. "The total SKILL attribute will thus be permanently reduced, but without affecting the total points to be spent during character creation for your Martial Proficiencies." | 11 | mechanical |
| R16 | Each Training point gives 4 Resource points to spend on Techniques and Rituals; each costs the value in parentheses (1-4). | 11 | mechanical |
| R17 | "In the game, use Training skill as one of your Martial Proficiency" - i.e. Training is a Proficiency with a value, usable in checks. | 11 | mechanical (which checks it applies to is A22) |
| R18 | Performing a Technique or Ritual costs ENDURANCE equal to its value (1-4). Restated for combat on p. 24: "without making a roll check, but you must subtract as many ENDURANCE points as the value of the Technique." | 11, 24 | mechanical |
| R19 | Worked example: rolled SKILL 9, Improvised Weapons, 2 Training points -> 8 Resource points; 9 points to assign among the three Proficiencies; final SKILL 7. | 11 | example |

The full text of the p. 11 example: "You roll SKILL=9 at creation for a
Master in Improvised Weapons deciding to assign 2 points to the Training
skill. You have now 8 Resource points to spend in Technics and Rituals; 9
SKILL points to assign in Armed combat, Throwing weapons or Surprise attack
(Martial Art Proficiencies); but your final SKILL points will be 7."

The p. 11 text also gives the ENDURANCE cost in the same breath as R17:
"performing these movements or practices requires mental and physical
effort, so you lose as many ENDURANCE points as indicated (from 1 to 4)".

The 36 Techniques (p. 12-15) and 36 Rituals (p. 16-19), each with cost 1-4,
are the d66 tables in [Techniques](../world/techniques.md) and
[Rituals](../world/rituals.md). Cost distributions: Techniques 1 x17, 2 x17,
4 x2, none at 3; Rituals 1 x4, 2 x12, 3 x9, 4 x11. Cost is both
the Resource points to learn (R16) and the ENDURANCE to use (R18).

# Examples

Both examples are the book's own.

XinYue (p. 5): SKILL 7 (rolled 7, no Training), ENDURANCE 18, LUCK 9; status
Poor with 3 GP, within Poor's 1d6-1; Spear as the free-text weapon; Health
Elixir as the starting item; Proficiencies Armed Combat 2 + Defensive
Barrier 4 + Sweep 1 = 7 = the rolled SKILL, each at or below the cap of 4.

The Improvised Weapons Master (p. 11): rolled SKILL 9; 2 Training points
bought, so SKILL becomes 7 and Training is a Proficiency at 2; 9 points
(the rolled SKILL, R10 and R15) go to Armed combat, Throwing weapons and
Surprise attack; 2 x 4 = 8 Resource points buy Techniques and Rituals by
their printed costs.

The eight [pre-generated Masters](../world/pregenerated-masters.md) (p. 92)
are further creation examples; the inventory's arithmetic check finds one
of them, Yin, over the Resource-point budget by 4 and over the Proficiency
pool by 1.

# Engine notes

Mechanical: R01, R02, R03, R04, R09, R10, R11, R12, R14, R15, R16, R17,
R18. Conditional: R06 (death or unconsciousness), R13 (Drunken, Shaolin,
Praying Mantis and Wudang Quan carry enforceable parts; the other style
powers are narrative-only). Guidance: R05, which nevertheless obliges the
engine to store initial SKILL, ENDURANCE and LUCK. Narrative-only: R07.
Examples: R08, R19.

Readings that bear on this concept:

- [I-01](./readings/attributes-and-creation.md) - ENDURANCE zero: death or unconsciousness (R06, R13 Shaolin).
- [I-02](./readings/attributes-and-creation.md) - which weapons satisfy an armed Proficiency (R02, R68).
- [I-03](./readings/attributes-and-creation.md) - Drunken style's "first hit" and the alcohol item (R13).
- [I-04](./readings/attributes-and-creation.md) - whether every rolled-SKILL point must be spent; Proficiency at 0 (R10).
- [I-22](./readings/combat.md) - what Training's value adds to (R17).
- [I-23](./readings/combat.md) and [I-24](./readings/techniques-rituals-items.md) - when Techniques and Rituals may be used (R14).
- [I-25](./readings/combat.md) - Praying Mantis' always-lethal finishing blow (R13).
- [D05](./readings/discrepancies.md), [D06](./readings/discrepancies.md), [D08](./readings/discrepancies.md) - the Martial Arts table shape, the rolled-SKILL pool, and Wudang's combat Rituals.

Downstream: [Actions](./actions.md) for how Proficiencies enter checks;
[Combat](./combat.md) for Attack Strength and Technique use;
[Experience and Advancement](./experience-and-advancement.md) for raising
attributes, Proficiencies and Training after creation.
