---
type: Table
title: "Market"
description: "The four Market price lists (pp. 52-55): Common Items, Weapons, Expedition Equipment and Armor, with the rules the book attaches to each list."
tags: [world, market]
cite: "MH p.52-55"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.5, 52-55"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, sections 2.11 and 3.15"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Market

"You can visit the Market to find everything you need. If it is not listed, find a similar item to get an idea of the price" and "1 gold piece (GP) is worth 10 silver pieces (SP)." (p. 52).[^rulebook] Prices are as printed; no item carries a mechanical effect of its own except where another rule names it (Health Elixir, incense, rope, flint, Rations).

# Rules attached to the Market (inventory 2.11)

Rows as classed in the inventory.[^inventory]

| Rule | Statement | Page | Class |
|---|---|---|---|
| R66 | "1 gold piece (GP) is worth 10 silver pieces (SP)." | 52 | mechanical |
| R67 | "If it is not listed, find a similar item to get an idea of the price". | 52 | conditional |
| R68 | "Although weapons do not directly affect the dice roll, some martial arts specialize in certain types of weapons; if you do not have a weapon, do not add the specialization points." | 53 | mechanical (armed Proficiencies require a weapon item) |
| R69 | Expedition equipment: "Whether or not you possess these items affects your ability to interact with the world. For example, you cannot climb without a rope or light a fire without a flint." | 54 | conditional (which actions need which item is only exemplified) |
| R70 | Armor: "Protections have no effect on the dice roll; martial artists rarely use them if they limit their movements, but in some cases they can influence the narrative development of a scene." | 55 | narrative-only |

# Common Items (p. 52)

| Item | Price |
|---|---|
| Incense | 5 SP |
| Lantern | 1 GP |
| Torch | 1 SP |
| Musical Instrument | 12 GP |
| Wicker Backpack | 2 GP |
| High-quality tea | 5 SP |
| Rations (per day) | 5 GP |
| Health Elixir | 25 GP |
| Smoke Bomb | 25 GP |
| Protection Amulet | 40 GP |
| Map of Body Meridians | 70 GP |
| Training Manual | 100 GP |
| Gunpowder | 85 GP |
| Acupuncture Needles | 4 GP |

# Weapons (p. 53)

"Although weapons do not directly affect the dice roll, some martial arts specialize in certain types of weapons; if you do not have a weapon, do not add the specialization points."[^rulebook]

| Weapon | Price |
|---|---|
| Sword | 13 GP |
| Saber | 10 GP |
| Tonfa | 8 GP |
| Halberd | 18 GP |
| Bow | 15 GP |
| Dagger | 5 GP |
| Trident | 16 GP |
| Mace | 9 GP |
| Long staff | 5 GP |
| Butterfly knives | 10 GP |
| Spear | 12 GP |
| Dart | 1 GP |
| Rope Dart | 6 GP |
| 3-section staff | 10 GP |

# Expedition Equipment (p. 54)

"Whether or not you possess these items affects your ability to interact with the world. For example, you cannot climb without a rope or light a fire without a flint."[^rulebook]

| Item | Price |
|---|---|
| Tent | 10 GP |
| Bamboo mat | 2 GP |
| Kite | 1 GP |
| Travel tea set | 4 GP |
| Rope | 2 GP |
| Flint | 1 GP |
| Field knife | 4 GP |
| Compass | 10 GP |
| Topographic Map | 10 GP |
| Douli hat | 2 GP |
| Hook and Line | 3 GP |
| Cart | 20 GP |
| Trained monkey | 75 GP |
| Horse | 50 GP |
| Mule | 25 GP |
| Paper and Ink | 8 GP |
| Candle Clock | 15 GP |
| Grapple | 7 GP |

# Armor (p. 55)

"Protections have no effect on the dice roll; martial artists rarely use them if they limit their movements, but in some cases they can influence the narrative development of a scene."[^rulebook]

| Item | Price |
|---|---|
| Large Wicker Shield | 6 GP |
| Small Bronze Shield | 10 GP |
| Iron Fan | 15 GP |
| Complete War Armor | 150 GP |
| Reinforced Douli Hat | 10 GP |
| Iron Helmet | 18 GP |
| War Mask | 25 GP |
| Steel Helmet with Neck Guard | 50 GP |
| Leg Bandages | 3 GP |
| Arm Bandages | 3 GP |
| Iron Rings | 15 GP |

# Notes

- Items named by other rules: Health Elixir restores 4 ENDURANCE (R41) and is one of the two starting-kit choices (R02); incense is required for the Temple's Spirituality check that restores 1 LUCK (R42, R58); Rations are the "meal" of R41 at 5 GP per day; rope and flint are the book's examples of R69 gating; a weapon is required before an armed Proficiency adds its points (R68).[^inventory]
- Starting kit "costing less than 20 GP" (R02), derived and not stated: every Common Item except Health Elixir, Smoke Bomb, Protection Amulet, Map of Body Meridians, Training Manual, Gunpowder; every weapon; every Expedition item except Cart, Trained monkey, Horse, Mule; every Armor item except Complete War Armor, War Mask, Steel Helmet with Neck Guard.[^inventory]
- Not in the Market: alcohol or wine (Drunken style needs it; Beggar So's sheet carries a "Wine bottle"); nunchaku, hammer, fans, hooked swords, Lu Jiao Dao, chain whip (named in style texts); the adventure's "junk", "simple weapon", "rosary", "baoding balls" (see [the 5 Treasures readings](../rules/readings/the-5-treasures.md)).[^inventory]
- Resale: "don't expect to resell your goods at full price unless you're a skilled negotiator" (Market district, p. 48, R60; see [cities](../rules/cities.md)).[^rulebook]
- City Services (p. 50) are priced separately and live in [cities](../rules/cities.md).
- Treasure rolls may award a "Common Item" from this page (p. 68, R78; see [treasures and special items](../rules/treasures-and-special-items.md)); which one is not specified.[^inventory]

# Engine notes

Rules rows that consume these lists (see [master creation](../rules/master-creation.md), [combat](../rules/combat.md), [multiple combat, escape, healing](../rules/multiple-combat-escape-healing.md), [cities](../rules/cities.md), [exploration](../rules/exploration.md), [treasures and special items](../rules/treasures-and-special-items.md)):

- R02 initial equipment (a weapon "even if not listed", plus a Health Elixir or an item under 20 GP); R03 starting gold by social status.
- R41 Health Elixir and meals heal 4 ENDURANCE; R42 and R58 incense for the Temple check.
- R60 resale below full price; R64 City Services are a separate price list.
- R66 currency; R67 pricing by analogy; R68 weapon required for armed Proficiencies; R69 expedition gating; R70 armor is narrative-only.
- R78 Treasure results that award a Common Item.

Readings that bear on it:

- I-02 (any item flagged `weapon` satisfies Armed combat; style-specific pairing is narrative-only), I-03 (alcohol is an inventory item obtained narratively or priced by R67): [attributes and creation](../rules/readings/attributes-and-creation.md).
- I-48 (one meal per day, consuming a Rations unit), I-56 (the adventure's "elixir" is the Health Elixir), I-43 (junk = 0 GP; simple weapon = any weapon of 5 GP or less: Dagger, Long staff, Dart, Rope Dart; rosary = a Common Item, not the Special Item), I-30b (which Common Item drops from a Treasure roll: a roll over the 14-item list or a player pick under a price cap), A32 (R69 needs an authored action-to-item map): [techniques, rituals, items](../rules/readings/techniques-rituals-items.md).
- I-54 (Market resale and city entry as SKILL checks with a relevant Proficiency): [exploration, cities, oracle](../rules/readings/exploration-cities-oracle.md).

[^rulebook]: Martial Havoc rulebook, pp. 5, 48, 52-55 (pdf-parse extraction; folio = PDF page - 1).
[^inventory]: Estate inventory, sections 2.11 and 3.15, rows R02, R41, R42, R58, R60, R78.
