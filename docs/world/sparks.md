---
type: Table
title: "Sparks"
description: "The six d66 Spark tables (pp. 60-63), 216 random words of objects, places and themes; roll 1d6 for the table, then d66 for the word."
tags: [world, sparks]
cite: "MH p.60-63"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.60-63"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 3.19"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Sparks

"The following tables contain random words related to the theme of the game and include names of generic objects and places. First roll a d6 to determine which table to consult, then roll d66 to find the word. The spark thus rolled should be interpreted intuitively in relation to the context of the game. It will help make your adventure more vivid and surprising." (p. 60).[^rulebook]

In each table the first die selects the row, the second the column.

# Table 1

| d66 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 1 | Mace | Coin | Cloak | Brooch | Lotus | Whip |
| 2 | Sword | Pearl | Bed | Pendant | Drum | Lantern |
| 3 | Ring | Sutra | Brush | Energy | Flute | Pipe |
| 4 | Elixir | Lens | Bridge | Staff | Mouse | Buffalo |
| 5 | Relic | Gem | Amulet | Poison | Lute | Crystal |
| 6 | Key | Statuette | Chain | Tiger | Emptiness | Mirror |

# Table 2

| d66 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 1 | Brazier | Pagoda | Cup | Incense | Mask | Candle |
| 2 | Meridians | Altar | Bottle | Shadow | Broom | Tomb |
| 3 | Helmet | Dagger | Pendant | Shard | Vase | Die |
| 4 | Stele | Rod | Bell | Teapot | Noble | Gate |
| 5 | Chess | Curtain | Seal | Knife | Ideogram | Fan |
| 6 | Rosary | Claw | Eagle | Rock | Hourglass | Mortar |

# Table 3

"Giada" is printed so (Italian for jade, untranslated); "set square" is lower-case as printed.[^inventory]

| d66 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 1 | set square | Giada | Bow | Arrows | Fur | Bamboo |
| 2 | Blade | Sled | Manual | Scar | Nail | Talisman |
| 3 | Star | Black | Wave | Halberd | Oil | Bag |
| 4 | Grapevine | Falcon | Tree | Walls | Cliff | Wood |
| 5 | Sack | Tower | Dark | Belt | Dust | Puppet |
| 6 | Blanket | Staircase | Chrysanthemum | Bones | Tunic | Ink |

# Table 4

| d66 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 1 | Hat | Unicorn | Ginseng | Horse | Desert | Rooster |
| 2 | Rope | Grass | Silk | Moon | Fire | Pyre |
| 3 | Bed | Bench | Bottle | Feather | Stone | Storm |
| 4 | Globe | Statue | Inkwell | Courtyard | Bowl | Dragon |
| 5 | Book | Necklace | Lock | Student | Trap | Bandit |
| 6 | Wheel | Inn | Sphere | Bear | Dart | Dog |

# Table 5

| d66 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 1 | Sea | Compass | Rain | Metal | Leather | Emperor |
| 2 | Wind | Needle | Forest | Saw | Rice | Gloves |
| 3 | Sun | Passport | Spear | Cards | Plow | Pen |
| 4 | Rope | Table | Net | Bandage | Webs | Column |
| 5 | Lightning | Frontier | Snake | Pole | Flame | Kite |
| 6 | Horn | Door | Pig | Fish | Deer | Torch |

# Table 6

"Sign" is printed twice on row 4, verified on the render.[^inventory]

| d66 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 1 | Leaf | Sickle | Spice | Twilight | Mine | Volcano |
| 2 | Pumpkin | Monkey | Gong | Portal | Meadow | Water |
| 3 | River | Spark | Spirit | Valley | Dawn | Lake |
| 4 | Butterfly | Sign | Sign | Swamp | Treasure | Island |
| 5 | White | Map | Sunset | Light | Ruins | Cloud |
| 6 | Saddle | Wax | Tao | Mountain | Field | Demon |

# Notes

- Duplicates across the six tables, for an engine that de-duplicates: Bed (Tables 1 and 4), Bottle (2 and 4), Pendant (1 and 2), Rope (4 and 5), Sign twice in Table 6.[^inventory]
- The flattened extraction breaks "Meridians" and "Chrysanthemum" across lines; the whole words were read from the render.[^inventory]
- 216 cells; 210 distinct words after the duplicates above.

# Engine notes

Rules rows that consume these tables (see [oracle procedure](../rules/oracle-procedure.md), [exploration](../rules/exploration.md)):

- R73 Sparks: 1d6 for the table, d66 for the word, "interpreted intuitively"; a mechanical roll with narrative-only content.
- R51 step 7 and R71, as a stimulus alongside the [Oracle](oracle.md) and [Inspirations](inspirations.md).

Readings that bear on them:

- I-17 (undefined Event outcomes such as Hint may be fed by a random word), A37 (the narration model is the operator's): [exploration, cities, oracle](../rules/readings/exploration-cities-oracle.md).
- A23 (oracle-like Rituals resolve by Oracle or Sparks rolls): [techniques, rituals, items](../rules/readings/techniques-rituals-items.md).

[^rulebook]: Martial Havoc rulebook, pp. 60-63 (pdf-parse extraction; folio = PDF page - 1).
[^inventory]: Estate inventory, section 3.19, row R73.
