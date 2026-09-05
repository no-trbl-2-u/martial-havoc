---
type: Rule
title: "Actions"
description: "The two resolution rolls outside combat: the SKILL check against SKILL plus a relevant Proficiency, and the LUCK check that costs one LUCK whatever the result."
tags: [rules, actions]
cite: "MH p.22"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.22"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 2.4"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Actions

Folio 22, the whole of the chapter "ZHEN - Actions" outside combat. Every
non-combat action resolves with one of two 2d6 roll-under checks. Combat
uses a different roll, the opposed Attack Strength of [Combat](./combat.md).

| Rule | Statement | Page | Class |
|---|---|---|---|
| R20 | SKILL check: threshold = SKILL + relevant Martial Proficiency (if relevant); roll 2d6; equal or lower succeeds. | 22 | mechanical |
| R21 | LUCK check: threshold = LUCK; roll 2d6; equal or lower succeeds. "After making a LUCK check, subtract one point from the total LUCK value, regardless of the outcome." | 22 | mechanical |
| R22 | Which check: SKILL when the outcome "depends directly on the Master's skills"; LUCK when it depends "on external factors". | 22 | conditional (the classification is the player's) |

The text in full (p. 22): "In both cases, roll 2d6 and compare the result
with the relevant attribute. If the result is equal to or lower, the check is
successful. Otherwise, it is a failure. After making a LUCK check, subtract
one point from the total LUCK value, regardless of the outcome. If you
succeed, the check is successful. Otherwise, you have been unlucky."

# Procedure

1. Decide whether the outcome depends on the Master's skills (SKILL check) or on external factors (LUCK check) - R22, the player's call.
2. SKILL check: threshold = current SKILL + the value of one relevant Martial Proficiency, if any (R20). A Master without the matching Proficiency still attempts the action; the Proficiency "simply will not add points to SKILL checks" (p. 7, [Master Creation](./master-creation.md) R12). Training counts as a Proficiency for this purpose (p. 11, R17).
3. LUCK check: threshold = current LUCK (R21).
4. Roll 2d6. Equal to or lower than the threshold succeeds.
5. After a LUCK check, LUCK -1 regardless of the outcome (R21). The Gambling House exempts its bet roll from this decrement (p. 46, [Cities](./cities.md) R57).

Named checks elsewhere in the book are SKILL checks with a named
Proficiency: the Spirituality check at a Temple (p. 47, R58) and the
Concentration check at a Chaguan (p. 49, R63), both in
[Cities](./cities.md); the Final Blow's roll "against your current LUCK"
(p. 25, R31) in [Combat](./combat.md).

LUCK recovers 1 point at a Temple and has no full-restore rule
([Multiple Combat, Escape and Healing](./multiple-combat-escape-healing.md)
R42); since every LUCK check spends a point, LUCK is a depleting resource.

# Engine notes

Mechanical: R20, R21. Conditional: R22 (the SKILL-versus-LUCK
classification is left to the player; the engine can only offer both).

Readings that bear on this concept:

- [I-22](./readings/combat.md) - Training's value adds to SKILL checks made to perform or resist Techniques and Rituals, not to Attack Strength (R17, R20).
- [I-12](./readings/combat.md) - whether the Final Blow's LUCK roll also pays R21's decrement (R21, R31).
- [I-54](./readings/exploration-cities-oracle.md) - the undefined checks of the Central District, City Walls and Market resale (R59-R61), read as SKILL checks.
- [I-14](./readings/combat.md) - the Chaguan's repeated Concentration checks, each a fresh SKILL check (R63 in [Cities](./cities.md)).
