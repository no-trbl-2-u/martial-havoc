---
type: Rule
title: "Treasures and Special Items"
description: "The 1d6 treasure roll after a victory, banded by the defeated opponent's ENDURANCE, and the 2d6 Special Items table it can call, with each item's verbatim effect."
tags: [rules, treasure]
cite: "MH p.68-69"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.68-69"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 2.13 (R78, R79), tables 3.21 and 3.22"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Treasures and Special Items

Folios 68-69. After a victory in [Combat](./combat.md) the Master may roll
for what the defeated opponents carried or guarded; the band is the
opponent's ENDURANCE from its stat block ([Opponents](../world/opponents.md)).
A "Common Item" result is an entry of the Market's Common Items list
([Market](../world/market.md)); a "Special Item" result calls the 2d6 table
below. The adventure's opponents have fixed LOOT lines instead
([The 5 Treasures](../campaigns/the-5-treasures/index.md)).

| Rule | Statement | Page | Class |
|---|---|---|---|
| R78 | Treasures: "If you believe that your defeated opponents may be in possession of, or guarding, something of valor, roll 1d6 and compare it with their ENDURANCE" (§3.17). | 68 | conditional trigger; mechanical table |
| R79 | Special Items: 2d6 when the Treasure table says "Special Item" (§3.18). | 69 | mechanical roll; effects mostly narrative |

The inventory's own cross-references in these rows are off by four: R78's
"(§3.17)" is the Treasures table, inventory section 3.21, and R79's
"(§3.18)" the Special Items table, section 3.22; both are reproduced below.
The rows are kept as written.

# Procedure

1. After defeating one or more opponents, decide whether they "may be in possession of, or guarding, something of valor" (R78) - the player's judgment.
2. Roll 1d6 and read the column for the defeated opponent's ENDURANCE: up to 16, 17-19, 20 or more.
3. GP results are rolled as written. "Common Item": one item from the Market's Common Items list; which one is not specified. "Special Item": roll 2d6 on the Special Items table (R79).
4. ENDURANCE is the stat block's printed value, not what remains. The inventory derives the bands for the roster: 20 or more - Boxer, Dapeng, Kobukson, Kun, Long Wang, Rebels, Shi Shi, Youxia; 17-19 - Bai Gu Jing, Beast, Feng Huang, Green Hornet, Huang Feng Guai, Mercenary, Niu Mowang, Pan Long, Pirate, Shan Xiao, Shen, Shi Fu, Shi Gong, Xiongu; up to 16 - the remaining 28. Of the adventure's nine, only Senior King Golden Horn (18) leaves the lowest band.

# Treasures (p. 68), 1d6 against the defeated opponent's ENDURANCE

| 1d6 | Up to 16 | 17-19 | 20 or more |
|---|---|---|---|
| 1 | Nothing | 1d6 GP | 2d6 GP |
| 2 | 1d6 GP | 2d6 GP | 3d6 GP |
| 3 | 2d6 GP | 3d6 GP | 4d6 GP |
| 4 | 3d6 GP | 4d6 GP | 5d6 GP |
| 5 | 1d6 GP + Common Item | 2d6 + Common Item | Special Item |
| 6 | 2d6 GP + Common Item | Special Item | Special Item |

"2d6 + Common Item" (row 5, 17-19) omits "GP" in the source; read as 2d6 GP
`(inferred, I-20)`. Which Common Item is not specified.

# Special Items (p. 69), 2d6

"When required by the Treasure table, roll 2d6 on the following table to
determine the special item found."

| 2d6 | Item | Effect (verbatim) |
|---|---|---|
| 2 | The rosary of Amitabha Buddha | If recited, it grants a miracle, single use |
| 3 | The hat of the Immortal Cao Guojiu | You are automatically recognized as a mandarin/noble |
| 4 | The Bottle of the Immortal Li Tenguai | One sip can cure any illness |
| 5 | The castanets of the Immortal Lan Caihe | Their sound attracts the attention of everyone present, stopping whatever they are doing |
| 6 | The sword of the Immortal Lu Dongbin | effective against spirits |
| 7 | The lotus flower of the immortal He Xiangu | restores LUCK and increases it by 1, single use |
| 8 | The flute of the Immortal Han Xiangzi | It ends an atmospheric/environmental effect |
| 9 | The phoenix feather of the immortal Zhang Guolao | you are destined to die a natural death, ignore the next fatal blow |
| 10 | The Immortal Han Zhongli's Fan | Creates gold or silver (50/50) from stone, equivalent in weight, single use |
| 11 | Sanzang's Passport | You can travel freely throughout the territory and enter all urban centers |
| 12 | Sun WuKong's Staff | A weapon that extends and retracts on command |

Items with a stated mechanical hook: 7 (LUCK: the only full restore of LUCK
in the book, against the cap of 12 - R45 in
[Experience and Advancement](./experience-and-advancement.md), initial
values per R05 in [Master Creation](./master-creation.md)); 9 (the next
fatal blow); 6 (an "exceptional weapon" against incorporeal opponents, R77
in [Encounters](./encounters.md)); 11 (guard posts and City Walls check
passports, [Exploration](./exploration.md) R55, [Cities](./cities.md)
R61); 3 (the Central District, R59); 8 (the Event outcome Weather Change).
Sun Wukong the pre-generated Master carries a "Magical staff"
([Pre-generated Masters](../world/pregenerated-masters.md)).

# Engine notes

Mechanical: the Treasures table and the Special Items roll (R78's table,
R79). Conditional: R78's trigger ("If you believe"), the choice of Common
Item, and every Special Item effect except 7 and 9, which are mostly
narrative.

Readings that bear on this concept:

- [I-20](./readings/techniques-rituals-items.md) - "2d6 + Common Item" read as 2d6 GP.
- [I-30b](./readings/techniques-rituals-items.md) - the roll always offered after a victory, declinable; how to pick the Common Item (R78).
- [I-46](./readings/techniques-rituals-items.md) - Special Item 7: LUCK = min(12, initial + 1), initial raised too.
- [I-44](./readings/techniques-rituals-items.md) - Special Item 9 keeps ENDURANCE at 1 once; the seven-star sword negates lost rounds.
- [I-56](./readings/techniques-rituals-items.md) - the adventure's "rosary" and "elixir" are plain items, not Special Item 2 or a new item.
- [I-43](./readings/techniques-rituals-items.md) - the adventure's loot words "junk", "simple weapon", "rosary", "scripture".
- [I-29](./readings/combat.md) - Lu Dongbin's sword among the exceptional weapons (R77).
- [D14](./readings/discrepancies.md) - the Special Items table confirmed exact against the Spark.
