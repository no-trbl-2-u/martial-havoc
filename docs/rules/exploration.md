---
type: Rule
title: "Exploration"
description: "The seven-step exploration loop, generating a region by scattering dice, distances and routes, road features, and generating a monastery location by location."
tags: [rules, exploration]
cite: "MH p.42-45"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.42-45"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 2.9, tables 3.11 and 3.12"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Exploration

Folios 42-45, the opening of the chapter "LU - Traveller": the master
procedure for sandbox play, the Region generator, routes and road features,
and the Monastery generator. Cities, once generated as a Location, are
explored by [Cities](./cities.md); Events that produce an encounter go
through the [Oracle](./oracle-procedure.md) and then
[Encounters](./encounters.md).

| Rule | Statement | Page | Class |
|---|---|---|---|
| R51 | Seven-step procedure: (1) starting city, roll its Resources on the Region table; (2) Region procedure for surrounding locations, city at centre; (3) roll characteristics of locations you visit; (4) "When you move to a location or start a new scene, roll for an Event"; (5) Event = encounter -> Oracle "Encounter Outcome" row; Attack or Ambush -> combat, otherwise NPC or Creature Reaction row; (6) Monastery -> may enter, Monastery procedure; (7) when in doubt, Oracle. | 42 | mechanical (procedure) |
| R52 | Region: "roll a handful of d6 on a sheet of paper. Mark where the dice land. The value on the visible face corresponds to the Location. Roll additional d6 to determine other characteristics, if necessary." Starting city in the centre. | 43 | conditional (a physical scatter the engine must replace - A15) |
| R53 | Distance = distance between the dice, "an arbitrary scale (hours of travel, kilometers, number of scenes, etc.)". | 44 | conditional |
| R54 | Route type, 2d6: 2-3 Nothing; 4-5 Mule track; 6-8 Trail; 9-10 Beaten path; 11-12 Paved road. | 44 | mechanical |
| R55 | Road features, 1d6: 1-2 Nothing; 3-4 Inn; 5 Rope bridge; 6 Guard post. Inn: "The perfect place for ambushes; in the event of fighting, the stairs will tend to collapse." Guard post: "guards check travelers' passports". Rope bridge: "You can only cross one at a time, and fighting on it without good balance could be fatal." | 44 | mechanical roll; narrative-only effects |
| R56 | Monastery: roll a handful of d6 (or one Location at a time as explored); table of Location, Location Function, Openings, Atmosphere, Event (§3.12). | 45 | mechanical |

The inventory's "A15" in R52 is its region-scatter ambiguity, row A33
(reading I-15). The row is kept as written.

# The seven steps (p. 42)

Verbatim from p. 42, "Follow these steps to explore the world":

1. "Establish a starting city and determine its Resources by rolling on the Region Exploration table."
2. "Follow the Region Exploration procedure and determine the surrounding locations (consider the starting city in the center)."
3. "If you decide to travel and explore, roll to determine the characteristics of the locations you want to visit."
4. "When you move to a location or start a new scene, roll for an Event to determine what happens."
5. "If the Event involves an encounter, roll on the Oracle's Encounter Outcome row pg. 58. If the result is Attack or Ambush, start a combat; otherwise, roll on the NPC or Creature Reaction row."
6. "If you find a Monastery, you may decide to enter and explore it. Follow the Monastery generation procedure."
7. "When in doubt, use the Oracle tools to determine the answers you would normally ask the Game Master."

Step 5's rows are in [Oracle Procedure](./oracle-procedure.md); which
opponent is met is the matrix in [Encounters](./encounters.md), by the
column the Location implies (Urban, Non-urban, Water, Supernatural,
Monastery).

# Exploring the Region (p. 43-44)

Roll a handful of d6 onto paper; each die's position is a Location and its
face is the Location column; roll further d6 per column as needed (R52).
The starting city goes at the centre.

## Region Exploration table (p. 43), d6 per column

| d6 | Location | Landmark | Resources | Risk | Event |
|---|---|---|---|---|---|
| 1 | City | Monastery | Medicinal herbs | Low | Encounter |
| 2 | Mountain | Hermit's Refuge | Elixir | Low | Rest |
| 3 | Plain | Martial arts school | Sacred relics | Medium | Effect Expiration |
| 4 | Forest | Frontier (footnote: "marks the border of imperial law: a barbarian territory, a magical kingdom or a rebel enclave") | Magic Weapons | Medium | Weather Change |
| 5 | Rice fields | Empty | Jade | High | Hint |
| 6 | Water | Empty | Ancient Texts | High | Free Exploration |

Distance between Locations is the distance between the dice on "an
arbitrary scale (hours of travel, kilometers, number of scenes, etc.)"
(R53). The route between two Locations is 2d6 (R54); what stands on the
busiest roads is 1d6 (R55):

| 2d6 | 2-3 | 4-5 | 6-8 | 9-10 | 11-12 |
|---|---|---|---|---|---|
| Route type | Nothing | Mule track | Trail | Beaten path | Paved road |

| 1d6 | 1-2 | 3-4 | 5 | 6 |
|---|---|---|---|---|
| Road feature | Nothing | Inn | Rope bridge | Guard post |

The three features as printed (p. 44): Inn, "A multi-story building offering
food and lodging to travelers. The perfect place for ambushes; in the event
of fighting, the stairs will tend to collapse." Guard post, "marks the
passage to a different county, guards check travelers' passports to verify
if they are in order." Rope bridge, "the road is interrupted by a chasm or a
watercourse, and a suspension bridge has been set up for passage. You can
only cross one at a time, and fighting on it without good balance could be
fatal." Sanzang's Passport (Special Item 11) answers the guard post's
passport check ([Treasures and Special Items](./treasures-and-special-items.md)).

# Explore the Monasteries (p. 45)

"To create a monastery, roll a handful of d6. The value on the visible side
corresponds to the Location. Roll additional d6 to determine other
characteristics, if necessary. If you want to create the monastery as you
explore it, roll only for the first Location and then the next one when you
explore a new area. In a monastery, you can find outdoor and indoor
locations, buildings, or natural environments such as ponds or bamboo
groves." (R56.)

## Monastery table (p. 45), d6 per column

| d6 | Location | Location Function | Openings | Atmosphere | Event |
|---|---|---|---|---|---|
| 1 | Corridor | Treasure | 1 | Mysterious | Encounter |
| 2 | Courtyard | Trap | 2 | Tense | Rest |
| 3 | Room | Altar | 2 | Spectral | Effect Expiration |
| 4 | Pagoda | Meditation | 3 | Desolate | Conditions Change |
| 5 | Hall | Cemetery | 3 | Mystic | Hint |
| 6 | Staircase | Dormitory | 4 | Eerie | Free exploration |

The Event column differs from the Region table's in one cell: "Conditions
Change" here, "Weather Change" there.

Encounters inside a monastery use the Monastery column of the matrix
([Encounters](./encounters.md)). The Event outcomes Rest, Effect
Expiration, Weather Change, Conditions Change, Hint and Free Exploration,
and "Openings", are named only in these two tables and defined nowhere in
the book (inventory section 7).

# Engine notes

Mechanical: R51 (the loop), R54, R55 (the rolls), R56. Conditional: R52
(a physical dice scatter), R53 (arbitrary distance scale). Narrative-only:
the effects of R55's Inn, Guard post and Rope bridge.

Readings that bear on this concept:

- [I-15](./readings/exploration-cities-oracle.md) - replacing the dice scatter with random points on a plane and a distance in scenes (R52, R53).
- [I-17](./readings/exploration-cities-oracle.md) - the undefined Event outcomes Rest, Effect Expiration, Weather/Conditions Change, Hint, Free Exploration.
- [I-18](./readings/exploration-cities-oracle.md) - Monastery "Openings" as exits to newly rolled locations (R56).
- [I-19](./readings/exploration-cities-oracle.md) - the italic *Supernatural* redirect in the Non-urban column (R51 step 5, R74).
- [I-47](./readings/exploration-cities-oracle.md) - when the Oracle's Enemy Type row is consulted (R51 step 5).
- [I-08a](./readings/combat.md) - Ambush versus Attack in step 5.
