---
type: Reading
title: "Readings: Techniques, Rituals and Items"
description: "The ten places where Technique and Ritual effects, healing items, treasure and equipment gating leave a decision to the player, with the inventory's inferred reading for each."
tags: [rules, readings, techniques, items]
cite: "MH p.11-19, 31, 52-54, 68-69; inventory 6.3"
sources:
  - id: rulebook
    resource: ../../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.11-19, 31, 52-54, 68-69"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 6.3"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Readings: Techniques, Rituals and Items

Inventory section 6.3, verbatim. Each row states what the text leaves open
(known) and the inventory's reading, marked `(inferred, I-nn)`, offered for
the operator to confirm or reject. Rows without an `I-nn` have no defensible
inference from the sources alone. The rules read are in
[Master Creation](../master-creation.md) (R14-R18),
[Multiple Combat, Escape and Healing](../multiple-combat-escape-healing.md)
(R40-R42) and
[Treasures and Special Items](../treasures-and-special-items.md) (R78-R79);
the effect texts are in [Techniques](../../world/techniques.md),
[Rituals](../../world/rituals.md) and [Market](../../world/market.md);
adventure loot is cited `a2`.

| Id | Question the text leaves open | The inventory's reading | Cite |
|---|---|---|---|
| A23 (no I-nn) | All 72 Technique/Ritual effects are prose without numbers (§3.2, §3.3) - the central design question. | No single inference. A classification the operator could adopt: **mechanical** (Body and Mind balance, Punishing the sky, Vital Breath, Chain Fists, Butterfly Palms, Light Body, Lord of the Bow, Iron Shirt), **combat-narrative** (knock-downs, intimidation, immobility, indestructibility - resolved as an Opening or an escape per R28), **exploration** (climb, swim, run on water, find the way, weather - resolved as gating like R69), **oracle-like** (Book of Changes, Acting without acting, Wheel of Existence, The Way of Tao - resolved by Oracle/Sparks rolls), **summoning** (Protective Demon, Older Brother, Eight Celestial Drunkards - a companion or an Unexpected-Event-like table). Each Technique needs a hand-authored effect record. | p.12-19 |
| A24 / I-24 | Rituals "require preparation time" - unquantified; Wudang excepted. | `(inferred, I-24)` Not usable during combat rounds; usable in any scene, costing a scene (or a Rest event). | R14 p.11; R13 p.10 |
| A25 / I-28 | "Spirit to flesh" / "Spirit-Summoning Fist" refer to spirits and fatal strikes; "Punishing the sky" revives with "reduced ENDURANCE" - how much? | `(inferred, I-28)` Revive at half initial ENDURANCE, rounded down. | p.14; p.16-19 |
| A26 / I-46 | Special Item 7 "restores LUCK and increases it by 1": restores to the initial value (R05) then +1, capped at 12 (R45)? | `(inferred, I-46)` Yes: LUCK = min(12, initial + 1); initial is raised too. | p.69; R05 p.6; R45 p.35 |
| A27 / I-44 | Special Item 9 "ignore the next fatal blow"; seven-star sword "block hits from stronger enemies without any effort". | `(inferred, I-44)` Feather: the first time ENDURANCE would reach 0, it stays at 1, item consumed. Sword: when the opponent's Attack Strength is higher, the Master takes no damage; the sword does nothing on the Master's wins. | p.69; a2 |
| A28 / I-48 | Healing "eating a meal" (+4): how often? Rations cost 5 GP per day. | `(inferred, I-48)` Once per day, consuming a Rations unit. | R41 p.31; p.52 |
| A29 / I-56 | Health Elixir is +4 ENDURANCE (R41) and the adventure's Monk drops an "elixir". | `(inferred, I-56)` Same item. | R41 p.31; a2 |
| A30 / I-43 | Loot "junk", "simple weapon", "rosary", "baoding balls", "Great Bear scripture [recited keeps beasts away]" - none are Market or Special items. | `(inferred, I-43)` junk = 0 GP flavour; simple weapon = any weapon of 5 GP or less (Dagger, Long staff, Dart, Rope Dart); rosary = a Common Item (Protection Amulet analogue) not the Special Item 2; scripture = while carried, "Beast"-type encounters (Beast, Ogre?) are avoided - which creatures are "beasts" is open. | a2; p.52-53; p.69 |
| A31 / I-30b | Treasure roll trigger "If you believe" (R78). | `(inferred, I-30b)` Always offered after a victory; the player may decline. Which "Common Item" drops: roll 1d6+1d6 over the 14-item list or let the player pick under a price cap. | R78 p.68 |
| A32 (no I-nn) | Expedition gating (R69) is only exemplified (rope/climb, flint/fire). | Needs an authored action->item map; the Spark already lists this as a requirement. | R69 p.54 |

Reading I-20 ("2d6 + Common Item" read as 2d6 GP) is stated in the
inventory's table note (section 3.21), not in section 6; it is carried in
[Treasures and Special Items](../treasures-and-special-items.md). Related:
[I-23](./combat.md) on Technique timing in combat, [I-25](./combat.md) on
the Praying Mantis finishing blow, [I-29](./combat.md) on exceptional
weapons.
