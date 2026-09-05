---
type: Table
title: "Rituals"
description: "The 36 Rituals of the d66 Rituals Table (pp. 16-19), each with its printed pinyin, its value (Resource points to learn, ENDURANCE to use) and its verbatim effect."
tags: [world, rituals]
cite: "MH p.16-19"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.11, 16-19"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 3.3"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Rituals

"Rituals require preparation time, such as invoking a deity, meditation, or physical exercise" (p. 11); unlike Techniques they are not used in combat, with one exception: a Wudang Quan Master "can use Rituals in combat" (p. 10).[^rulebook] A Ritual is learned with Resource points from the Training skill (4 per Training point) at the cost in parentheses, and performing it costs the same number of ENDURANCE points.[^rulebook]

d66: first die = row group, second die = entry. Printed format is `Name - Pinyin (cost): effect`. Pinyin is reproduced as printed ("Chiayi", "Ui Jiu Ba Xian" are non-standard and left uncorrected).[^inventory]

# Table

| d66 | Ritual | Pinyin (as printed) | Cost | Effect (verbatim) |
|---|---|---|---|---|
| 11 | Acting without acting | Wei Wu Wei | 3 | Meditate and generate two random events: one positive and one negative. |
| 12 | Acupuncture | Zhen Jiu | 1 | Treat an injury or spiritual dysfunction |
| 13 | Body and Mind balance | Zheng Qi | 2 | Swap your current SKILL and ENDURANCE points, without exceeding the initial value. |
| 14 | Book of Changes | Yi Jing | 2 | By studying the texts, you predict future events |
| 15 | Door gods | Men Shen | 2 | An invocation that keeps evil spirits away |
| 16 | Geomancy | Fengshui | 1 | Find the right direction to your destination |
| 21 | God of Money | Cai Shen | 3 | An invocation for good luck in business |
| 22 | God of Plagues | Wen Shen | 4 | An invocation to curse a place |
| 23 | God of Rain | Yu Shen | 2 | An invocation to change the weather |
| 24 | King of the Underworld | Yan Wang | 4 | Summon the spirit of a dead person and ask them a question |
| 25 | Light and shadow | Yin Yang | 2 | By channeling Qi into your hands, you can create a burning pole and a frozen pole |
| 26 | Lord of the Bow | Hou Yi | 2 | Your next shot automatically hits its target |
| 31 | Lord of the Sea | Hai Shen | 2 | An invocation to influence currents and winds. |
| 32 | Mother of Lightning | Dianmu | 4 | During a thunderstorm, you can summon lightning to a visible location |
| 33 | Mystical Fire | Sanmei Zhenhuo | 4 | Summon a fire that can only be extinguished with magic |
| 34 | Older Brother | Shi Xiong | 4 | Recruit a disciple who follows you everywhere to learn your techniques |
| 35 | Open the mouth, close the mouth | Kai Kou Bi Kou | 2 | you understand what is right and wrong to say during a conversation |
| 36 | Outer Gate | Wai Men | 1 | You know how to find the way that leads out |
| 41 | Protective Demon | Ye Cha | 4 | Summon a minor deity for a short time to assist in combat |
| 42 | Pulling Silk Threads | Yi Xian Chuan | 3 | Move a person's limb at will |
| 43 | Punishing the sky | Xingtian | 4 | You come back to life with reduced ENDURANCE points |
| 44 | Real Person | Zhenren | 2 | You can tell if someone is lying with just a few words |
| 45 | Silence gate | Jingzi Menzhong | 2 | A meditation that allows you to ignore hunger and thirst |
| 46 | Somersault clouds | Jindou Yun | 3 | You can fall from great heights as if walking on clouds |
| 51 | Tea ceremony | Chiayi | 3 | Host someone for a tea to convince them of your proposal |
| 52 | Tempering Steel | Bintie | 4 | You are skilled in improving blades' quality |
| 53 | The 5 phases | Wuxing | 3 | Transform small amounts of matter in the direction: ->water->wood->fire->earth->metal-> |
| 54 | The 72 transformations | Qishi Er Bianhua | 4 | You turn into any creature for a short time |
| 55 | The Eight Celestial Drunkards | Ui Jiu Ba Xian | 4 | Summon unknown deities who wreak havoc on the scene |
| 56 | The Golden Bell | Jin Zhong Zhao | 4 | A long conditioning makes your body indestructible for a short period of time |
| 61 | The Way of Tao | Dao De Jing | 3 | Every event brings with it its opposite; you just need to pay attention to details |
| 62 | Tightening spell | Jingu | 2 | A spell that causes a tremendous headache |
| 63 | Violin | Xiqin | 3 | Playing a particular melody can induce hypnosis |
| 64 | Vital Breath | Qi Gong | 1 | Exercises for spiritual regeneration |
| 65 | Wheel of Existence | Youlun | 3 | By observing a person, you learn about their past life and a hidden secret |
| 66 | White Guanyin | Baiyi Guanyin | 2 | Recite a mantra that helps you in benevolent actions |

# Notes

- Cost distribution: 1 x4, 2 x12, 3 x9, 4 x11.[^inventory]
- Three Rituals carry numbers an engine can act on: Body and Mind balance (swap current SKILL and ENDURANCE, capped at the initial values, which is why R05 requires the initial values to be stored), Punishing the sky (revive, "reduced ENDURANCE", amount unstated), Vital Breath (the "spiritual regeneration" that R40 and R41 heal by: +1 SKILL, +4 ENDURANCE).[^inventory]
- The "5 phases" arrow chain is printed with arrow glyphs ("->water->wood->fire->earth->metal->").[^rulebook]
- The Old Vixen in The 5 Treasures carries "Tightening spell (4)", the same name as Ritual 62 (cost 2); for an opponent the value is an Attack Strength bonus (R76), not a cost.[^inventory]
- The pre-generated sheets (p. 92) write "Guardians of the gate" for Door gods and "Open the mount close the mouth" for Open the mouth, close the mouth; see [pre-generated Masters](pregenerated-masters.md).[^inventory]
- Rituals that invoke a deity may draw a name from the [Table of Deities](deities.md); the book does not require it.

# Engine notes

Rules rows that consume this table (see [master creation](../rules/master-creation.md), [combat](../rules/combat.md), [multiple combat, escape, healing](../rules/multiple-combat-escape-healing.md), [experience and advancement](../rules/experience-and-advancement.md)):

- R13 Wudang Quan may use Rituals in combat (see [Martial Arts](martial-arts.md)); R14 Rituals need preparation time; R16 4 Resource points per Training point; R17 Training used as a Proficiency; R18 ENDURANCE cost equal to the value.
- R05 initial SKILL and ENDURANCE must be stored (Body and Mind balance caps at them).
- R40, R41 Vital Breath as spiritual regeneration: +1 SKILL, +4 ENDURANCE.
- R46 new Rituals after creation require raising Training with XP.
- R63 Chaguan: "any Proficiency or Technique/Ritual that may help you" adds to the Concentration check (see [cities](../rules/cities.md)).
- R76 opponents printed with "Ritual (n)" add n to Attack Strength and spend no ENDURANCE (see [opponents](opponents.md)).

Readings that bear on it:

- I-24 (Rituals not usable during combat rounds, Wudang excepted; usable in any scene, costing a scene or a Rest event), I-28 (Punishing the sky revives at half initial ENDURANCE, rounded down), A23 (the effect classification: oracle-like Rituals such as Book of Changes, Acting without acting, Wheel of Existence, The Way of Tao resolve by Oracle or Sparks rolls; summoning Rituals such as Protective Demon, Older Brother, The Eight Celestial Drunkards need a companion or an Unexpected-Event-like table): [techniques, rituals, items](../rules/readings/techniques-rituals-items.md).
- I-17 (Weather Change re-rolls a weather descriptor; God of Rain interacts): [exploration, cities, oracle](../rules/readings/exploration-cities-oracle.md).
- I-22 (Training adds to SKILL checks to perform or resist Rituals, not to Attack Strength), I-32 (Somersault clouds counts among escape stratagems): [combat](../rules/readings/combat.md).

[^rulebook]: Martial Havoc rulebook, pp. 10-11 and 16-19 (pdf-parse extraction; folio = PDF page - 1).
[^inventory]: Estate inventory, section 3.3 and rows R05, R13-R18, R40-R41, R46, R63, R76.
