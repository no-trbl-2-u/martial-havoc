---
type: Table
title: "Techniques"
description: "The 36 Techniques of the d66 Techniques Table (pp. 12-15), each with its printed pinyin, its value (Resource points to learn, ENDURANCE to use) and its verbatim effect."
tags: [world, techniques]
cite: "MH p.12-15"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.11-15"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 3.2"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Techniques

"Techniques are immediate and can also be used in combat, while Rituals require preparation time" (p. 11).[^rulebook] A Technique is learned with Resource points from the Training skill (4 per Training point) at the cost in parentheses, and performing it costs the same number of ENDURANCE points, "from 1 to 4".[^rulebook] In combat a Technique is one of the winner's four options and needs no roll: "without making a roll check, but you must subtract as many ENDURANCE points as the value of the Technique" (p. 24).[^rulebook]

d66: first die = row group, second die = entry. Printed format is `Name - Pinyin (cost): effect`. Pinyin is reproduced as printed, non-standard spellings included ("Hou Zung", "Shui Lang Qui", "Ti Cheng Chui", "San Sing Quan", "Fa jing").[^inventory]

# Table

| d66 | Technique | Pinyin (as printed) | Cost | Effect (verbatim) |
|---|---|---|---|---|
| 11 | Blue Dragon | Qing Long | 1 | You can run on water |
| 12 | Butterfly Palms | Die Zhang | 1 | You can hit two opponents |
| 13 | Chain Fists | Lian Huan Quan | 2 | Attack 3 times, then suffer 3 attacks |
| 14 | Crane's flight | Fei He | 1 | You jump tens of meters |
| 15 | Crushing Blow | Ding Quan | 2 | Knock down an opponent shorter than you. |
| 16 | Downwind Ears | Shun Feng Er | 2 | You can hear sounds even from miles away |
| 21 | Eagle Claw | Ying Zhao | 1 | Lift up to 1000 Jin (500 kg) |
| 22 | Exploding Qi | Fa jing | 2 | Create a circle of energy that repels those around you |
| 23 | Hand of 1000 characters | Qian Zi Zhou | 1 | Your blow leaves a scar shaped like an ideogram |
| 24 | Iron Bridge | Tie Qiao | 1 | You become immovable |
| 25 | Iron Broom | Tie Sao | 2 | A blow that incapacitates your opponent's lower limbs |
| 26 | Iron Head | Tie Tou Gong | 2 | By channeling Qi to your head, you can achieve an indestructible skull |
| 31 | Iron Palm | Tie Zhang | 1 | Your hands become harder than steel |
| 32 | Iron Shirt | Tie Shan | 2 | If an unarmed blow hits you, you damage your opponent |
| 33 | Light Body | Jin Shen Gong | 2 | Jump to kick all opponents surrounding you |
| 34 | Lizard climbs the Wall | Bihu Yu Qiang Shu | 1 | Climb any surface |
| 35 | Monkey Jump | Hou Zung | 1 | You jump behind your opponent unseen |
| 36 | Piercing through stones | Dian Shi Gong | 2 | By focusing Qi on your fingertips, you can penetrate objects |
| 41 | Poisonous Bird | Zhen Niao | 2 | Your blow disturbs the flow of Qi, causing sickness in your opponent |
| 42 | Pushing the Horse | Tui Ma | 1 | Give an order to a sentient animal |
| 43 | Rising Wave Strike | Shui Lang Qui | 1 | Unleash a disruptive air wave in front of you |
| 44 | Rock-Splitting Tiger | Kai Shan Hu | 2 | By focusing Qi in the cut of your hand, you can break any object |
| 45 | Shooting Star Kick | Ti Cheng Chui | 1 | Kick an incoming projectile back |
| 46 | Sky punching fist | Tong Tian Quan | 2 | Knock down an opponent taller than you |
| 51 | Snake Form | She Xing | 2 | You become extremely flexible |
| 52 | Spinning kick | Hou Bai Tui | 1 | Knock out your pursuer to the ground |
| 53 | Spirit to flesh | Huan Hun Yun Qing | 4 | Give a spirit or ghost physical form |
| 54 | Spirit-Summoning Fist | Huan Hun Quan | 4 | If your next strike is fatal, the opponent's spirit remains bound to you |
| 55 | Sticky Hands | Chi Shou | 1 | Steal an object unnoticed |
| 56 | Taming the Tiger | Gong Zi Fu Hu | 1 | Your fighting spirit keeps sentient animals away |
| 61 | Tear out a phoenix's eye | Feng Yan Zhao Chou | 2 | Press a pressure point to enhance your vision |
| 62 | Three Stars Fist | San Sing Quan | 2 | Strike one of three points to cause temporary loss of sight, smell, or voice |
| 63 | Tiger Roar | Hu Xiao | 1 | You emit a sound that intimidates those around you |
| 64 | Unicorn Step | Qilin Bu | 1 | By channeling Qi into legs, you can run very fast |
| 65 | Void Boxing | Wuji Quan | 2 | Disappear from the plane of existence for a few seconds |
| 66 | Water Splitting Move | Fen Shui Gong | 2 | You can swim underwater beyond human limits |

# Notes

- Cost distribution: 1 x17, 2 x17, 4 x2, none at 3. The table is alphabetical by English name, which is why the d66 order is alphabetical too.[^inventory]
- Techniques with a number an engine can act on: Chain Fists (3 attacks, 3 attacks suffered), Butterfly Palms (two opponents), Light Body (all surrounding opponents), Iron Shirt (damage returned on an unarmed hit). Every other effect is prose.[^inventory]
- Area Techniques in multiple combat (R36): "in case of a successful attack, distribute the same amount of damage to the enemies."[^rulebook]
- A landed Final Blow may be recorded as a new Technique with a value of 1-4 and a brief description, named for inspiration from the Final blow table (R31; the table lives in [combat](../rules/combat.md)).[^rulebook]
- The pre-generated sheets (p. 92) write "Pluck the phoenix's Eye" for Tear out a phoenix's eye; their other Technique names differ only in capitalisation. See [pre-generated Masters](pregenerated-masters.md).[^inventory]

# Engine notes

Rules rows that consume this table (see [master creation](../rules/master-creation.md), [combat](../rules/combat.md), [multiple combat, escape, healing](../rules/multiple-combat-escape-healing.md), [experience and advancement](../rules/experience-and-advancement.md)):

- R14 activation timing (Techniques at any time, combat included); R16 4 Resource points per Training point, cost in parentheses; R17 Training used as a Proficiency; R18 ENDURANCE cost equal to the value.
- R25 (b) the winner's option to use a Technique; R27 no roll in combat; R28 guidance not to end fights with a Technique.
- R31 a landed Final Blow becomes a new Technique.
- R36 area Techniques distribute damage in multiple combat; R38 a Technique used for a "daring escape" avoids the last blow.
- R40, R41 "spiritual regeneration Techniques" restore 1 SKILL and healing techniques restore 4 ENDURANCE.
- R46 new Techniques after creation require raising Training with XP.
- R76 opponents printed with "Technique (n)" add n to Attack Strength and spend no ENDURANCE (see [opponents](opponents.md)).

Readings that bear on it:

- I-11 (area reach read from the prose: Butterfly Palms two, Light Body all, Exploding Qi all, Double strike two), I-23 (in combat only as the winner's option; outside combat at any time, always at ENDURANCE cost), I-32 (escape Techniques: Monkey Jump, Void Boxing, Unicorn Step, Crane's flight and the like), I-22 (Training adds to SKILL checks to perform or resist Techniques, not to Attack Strength): [combat](../rules/readings/combat.md).
- A23 (all 72 effects are prose; a classification into mechanical, combat-narrative, exploration, oracle-like and summoning is offered), A25 (Spirit to flesh and Spirit-Summoning Fist refer to spirits and fatal strikes; the same row reads Punishing the sky's revival as I-28): [techniques, rituals, items](../rules/readings/techniques-rituals-items.md).
- I-29 (spirits immune to ordinary blows are defeated by a Technique, Ritual or exceptional weapon, R77): [combat](../rules/readings/combat.md).

[^rulebook]: Martial Havoc rulebook, pp. 11-15 and 24-25 (pdf-parse extraction; folio = PDF page - 1).
[^inventory]: Estate inventory, section 3.2 and rows R14-R18, R25-R31, R36, R46, R76.
