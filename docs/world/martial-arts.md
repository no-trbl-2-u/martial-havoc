---
type: Table
title: "Martial Arts"
description: "The 18 Martial Arts a Master may practise, each with its style text and its Martial Proficiencies, on the banded 1d6 x 1d6 table of pp. 7-10."
tags: [world, martial-arts]
cite: "MH p.7-10"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.7-11"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 3.1"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Martial Arts

"You are a Master of..." (p. 7). A Master chooses one Martial Art or rolls for it: the first d6 gives the band (1-2 / 3-4 / 5-6), the second d6 the row, 18 entries in all.[^rulebook] Each Martial Art carries its own Martial Proficiencies, "on which you can spend as many points as your SKILL value", and no Proficiency may exceed 4 at creation.[^rulebook] Fighting or acting without the matching Proficiency is always allowed: the points are simply not added to the check.[^rulebook]

Names of Proficiencies are verbatim, capitalisation as printed. Style texts are verbatim.[^inventory]

# Table

| d6 | d6 | Martial Art | Style text (verbatim) | Proficiencies |
|---|---|---|---|---|
| 1-2 | 1 | Wu Xing Quan | "You are a master of the 5 animals style and can imitate their movements." | Dragon - spirit; Tiger - courage; Crane - elegance; Snake - lethality; Leopard - speed |
| 1-2 | 2 | Long weapons | "You are a master in using the spear, trident, and halberd, distance keeping weapons." | Armed combat; Defensive Barrier; Sweep |
| 1-2 | 3 | Blunt weapons | "You are a master in using hammer, tonfa, and nunchaku, weapons that favor power over elegance." | Armed combat; Stunning blow; Smash |
| 1-2 | 4 | Edged weapons | "You are a master in Jian and Dao weapons, swords and sabers, symbols of martial virtue." | Armed combat; Charisma; Coordination |
| 1-2 | 5 | Improvised weapons | "You are a master in the use of fans, stools, umbrellas, throwing tiles, etc. You can always find a weapon." | Armed combat; Ranged weapons; Surprise attack |
| 1-2 | 6 | Drunken style | "As long as you have alcohol, you can surprise your enemy and ignore damage from the first hit. You are unpredictable." | Unarmed combat; Go unnoticed; Baffle |
| 3-4 | 1 | Iron fist style | "You have trained with metal rings, greatly increasing your arms' strength." | Unarmed combat; Brute strength; Hardened hands |
| 3-4 | 2 | Shaolin Quan | "You are a trained warrior in both armed and hand to hand combat but you cannot kill. Regarded as a religious person you can beg for food or lodging." | Non-lethal combat; Spirituality; Stamina |
| 3-4 | 3 | Cult of the Great Immortals | "Tricks or magic, people see you as a superior being. You can turn iron into gold, read minds, walk on fire, etc." | Body conditioning; Transmutation; Foresight; Alchemy |
| 3-4 | 4 | Qin Na | "You know the Xue Wei, pressure points that control the flow of Qi, and you can activate them with your fingers." | Unarmed combat; Pressure Points; Healing |
| 3-4 | 5 | Shuai Jiao | "A style practiced by the northern nomads. A grappling art with throws, takedowns and sweeps" | Wrestling; Archer; Intimidate |
| 3-4 | 6 | Red Boat Wing Chun | "A close-quarters system practiced within a shadow organization operating across territories." | Unarmed combat; Stealth; Brotherhood |
| 5-6 | 1 | Praying Mantis Style | "Your finishing blow is always lethal, and you can hit small targets with finger strikes." | Deadly combat; Precision; Cold-Blooded |
| 5-6 | 2 | Tiger Hooks | "You are a master of hooked swords, effective at all ranges for cutting, piercing, tearing, hooking." | Double strike; Disarming; Versatile Weapon |
| 5-6 | 3 | Double Knives | "You are a master of Lu Jiao Dao and Hudie Shuang Dao, effective against long weapons and at close range." | Double strike; Acrobatics; Disarm |
| 5-6 | 4 | 9-Section chain whip | "You are a master in Jiu Jie Bian, a concealable weapon capable of entangling your opponents." | Armed combat; Entangle; Quick draw |
| 5-6 | 5 | Wudang Quan | "An ancient style linked to ancestral rites. You can use Rituals in combat." | Unarmed combat; Occultism; Astrology |
| 5-6 | 6 | TaiJi Quan | "A style with fluid, circular movements, favoring the use of inner strength." | Unarmed combat; Manipulate force; Balance |

# Proficiency counts

- Wu Xing Quan has 5 Proficiencies, Cult of the Great Immortals 4, every other style 3: 56 named Proficiencies, 46 distinct names.[^inventory]
- Shared names: Armed combat (Long weapons, Blunt weapons, Edged weapons, Improvised weapons, 9-Section chain whip); Unarmed combat (Drunken style, Iron fist style, Qin Na, Red Boat Wing Chun, Wudang Quan, TaiJi Quan); Double strike (Tiger Hooks, Double Knives).[^inventory]
- Source inconsistency: the Training example on p. 11 calls Improvised weapons' second Proficiency "Throwing weapons" where this table says "Ranged weapons".[^rulebook]
- The pre-generated sheets (p. 92) write "Wing Chun" for Red Boat Wing Chun and "Scorpion style" for Praying Mantis Style, identified by their Proficiencies; see [pre-generated Masters](pregenerated-masters.md).[^inventory]

# Style powers (R13)

Seven style texts carry powers of their own beyond the Proficiency list. The inventory classes them as conditional, with the mechanical part noted:[^inventory]

| Martial Art | Power (verbatim) | Mechanical reading in the inventory |
|---|---|---|
| Improvised weapons | "You can always find a weapon" | narrative-only |
| Drunken style | "As long as you have alcohol, you can surprise your enemy and ignore damage from the first hit" | needs an alcohol item and a per-fight "first hit" flag |
| Shaolin Quan | "you cannot kill. Regarded as a religious person you can beg for food or lodging" | an opponent at ENDURANCE 0 cannot die |
| Cult of the Great Immortals | "You can turn iron into gold, read minds, walk on fire, etc." | narrative-only |
| Praying Mantis Style | "Your finishing blow is always lethal, and you can hit small targets with finger strikes" | a landed Final Blow kills |
| Wudang Quan | "You can use Rituals in combat" | Rituals allowed in combat, the one exception to R14 |
| 9-Section chain whip | "a concealable weapon capable of entangling" | narrative-only |

# Engine notes

Rules rows that consume this table (see [master creation](../rules/master-creation.md), [combat](../rules/combat.md) and [encounters](../rules/encounters.md)):

- R09 choose or roll a Martial Art (banded table above); R10 Proficiency pool equals the rolled SKILL; R11 cap of 4 per Proficiency at creation; R12 acting without the matching Proficiency adds no points.
- R13 style powers, tabulated above.
- R20 and R23: one relevant Proficiency is added to a SKILL check and to Attack Strength.
- R68 armed Proficiencies add nothing without a weapon item (see [market](market.md)).
- R75 opponents printed with "Martial Arts (n)" roll on this table and give each Proficiency n points (see [opponents](opponents.md)).
- R45 Proficiencies may exceed 4 after creation, bought with XP.

Readings that bear on it:

- I-01 (ENDURANCE zero is death by default, unconsciousness against a Shaolin Quan Master), I-02 (any `weapon` item satisfies Armed combat), I-03 (Drunken style's first hit is per fight; alcohol is an item obtained narratively), I-04 (Proficiency points may be left unspent, 0 is allowed): [attributes and creation](../rules/readings/attributes-and-creation.md).
- I-25 (Praying Mantis: a landed Final Blow kills, the doubles roll is unchanged): [combat](../rules/readings/combat.md).
- I-24 (Rituals not usable in combat rounds, Wudang Quan excepted): [techniques, rituals, items](../rules/readings/techniques-rituals-items.md).

[^rulebook]: Martial Havoc rulebook, pp. 7-11 (pdf-parse extraction; folio = PDF page - 1).
[^inventory]: Estate inventory, section 3.1 and rules row R13.
