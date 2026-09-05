---
type: Rule
title: "Cities"
description: "The seven city locations and their procedures: the Gambling House bet, the Temple's LUCK recovery, the Chaguan game, the narrative-only districts, the City Services price list and the City encounters table."
tags: [rules, cities]
cite: "MH p.46-51"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.46-51"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 2.10, tables 3.13 and 3.14"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Cities

Folios 46-51, "Explore the cities": "The city you are staying in is not just
a shelter, but a living place where your adventures can begin and develop.
Explore some of the city's locations to interact with people who may help,
or hinder, your plans." Seven locations follow (Gambling House, Temple,
Central District, Market, City Walls, Hutong, Chaguan), then City Services
and City encounters. A City is Location 1 of the Region table in
[Exploration](./exploration.md); random opponents met in one come from the
Urban column in [Encounters](./encounters.md); the Market's goods are in
[Market](../world/market.md).

| Rule | Statement | Page | Class |
|---|---|---|---|
| R57 | Gambling House (Fantan or Sic Bo): "decide on the amount, then you and the Dealer (see Opponents pg. 71) roll 2d6: use your current LUCK points, adding any points from a Martial Proficiency that may help you, and the Dealer uses their SKILL points. Whoever gets the highest score wins the bet. If you don't have the money to pay, a fight begins. You do not have to decrease your LUCK points when rolling for a bet." Also: "if you are too lucky, they will make it clear that it is time to go home." | 46 | mechanical (tie: A13; Dealer SKILL 7) |
| R58 | Temple: "If you have incense, you can attempt a Spirituality check (SKILL check plus any Martial Proficiency or Technique that may help you) at the three stars of good fortune - Sanxing. If successful, you recover 1 LUCK point. Abusing the patience of the gods could cause the opposite effect, or worse, bring a curse upon yourself." | 47 | mechanical (+1 LUCK); guidance (abuse) |
| R59 | Central District: walled, guards at four cardinal entrances, lantern patrols at night. "Entering here armed or dressed in common clothes will not be easy." | 47 | narrative-only |
| R60 | Market district: "don't expect to resell your goods at full price unless you're a skilled negotiator." | 48 | narrative-only |
| R61 | City Walls: large city three entrances per side, medium one per side, small one on the south; iron gates closed at night; "Guards stamp passports on entry and exit; passing quickly or unseen is very difficult." | 48 | narrative-only |
| R62 | Hutong: "It is easy to get lost, but also to cover your tracks. If the streets seem quiet, look up and keep an eye on the rooftops." | 49 | narrative-only |
| R63 | Chaguan (Chinese chess or Go): "Make a Concentration check (SKILL check plus any Proficiency or Technique/Ritual that may help you). If you pass the check, roll 2d6. With a double result, you have demonstrated your superiority and won the game. If you fail the Concentration check, reduce your ENDURANCE by 1; it's an exhausting game. Continue until you win or abandon the game." | 49 | mechanical |
| R64 | City Services price list (§3.13); "Every city is equipped with all basic services". | 50 | mechanical (prices) |
| R65 | City encounters: someone you already know; roll Connection and Trait (§3.14). | 51 | mechanical roll; narrative-only |

# Gambling House (p. 46)

1. Decide the stake.
2. Master rolls 2d6 + current LUCK + any helpful Martial Proficiency; the Dealer rolls 2d6 + SKILL. The Dealer's stat block ([Opponents](../world/opponents.md)) is SKILL 7, ENDURANCE 6, ATTACK 1, Cheating (3), Rage-quit (4); the Dealer is the one opponent not reachable from the encounter matrix.
3. Highest score wins the stake. No tie rule is stated.
4. This roll does not cost LUCK (an exception to R21 in [Actions](./actions.md)).
5. A Master who cannot pay starts a fight; a Master who is "too lucky" is shown the door.

# Temple (p. 47)

Requires incense (a Common Item, 5 SP). Spirituality check = SKILL check
plus any helpful Proficiency or Technique (Spirituality is a Proficiency of
Shaolin Quan). Success recovers 1 LUCK - the only partial LUCK recovery in
the book ([Healing](./multiple-combat-escape-healing.md) R42). Repeated
attempts risk "the opposite effect, or worse, ... a curse"; no count is
given.

# Chaguan (p. 49)

Concentration check = SKILL check plus any helpful Proficiency, Technique or
Ritual. Pass: roll 2d6, doubles win the game. Fail: ENDURANCE -1. "Continue
until you win or abandon the game." A win has no stated stake or reward
beyond showing off ("If you want to show off").

# Central District, Market, City Walls, Hutong (p. 47-49)

No checks are defined. Entering the Central District armed or in common
clothes "will not be easy"; resale at the Market below full price "unless
you're a skilled negotiator"; passing the City Walls "quickly or unseen is
very difficult", gates closed at night, passports stamped; the Hutong is
"easy to get lost, but also to cover your tracks". Sanzang's Passport
(Special Item 11, [Treasures and Special Items](./treasures-and-special-items.md))
lets the Master "enter all urban centers"; the hat of Cao Guojiu (Special
Item 3) makes the Master "automatically recognized as a mandarin/noble".

# City Services (p. 50)

"Every city is equipped with all basic services such as a blacksmith, inn,
magistrate, shops, administrative offices, etc; if you are looking for a
particular service, you can consult this table to get an idea of how much
it might cost." 1 GP = 10 SP (p. 52).

| Service | Price |
|---|---|
| Fortune teller | 3 GP (per question) |
| Astral chart | 18 GP |
| Herbalist | 8 GP (per dose) |
| Acupuncture | 12 GP (per session) |
| Geomancer | 25 GP |
| Bodyguard | 80 GP (per day) |
| Messenger | 2 SP (per km or hour) |
| Scribe | 5 SP (per letter) |
| Funeral | 50-200 GP |
| Litter bearer | 8 SP (per km or hour) |
| Confucian library | free offering |

# City encounters (p. 51)

"As you walk around your city, you may run into someone you already know.
They could be key figures or stall merchants. Roll on the table to randomly
determine the nature of your connection and their traits."

First d6 banded 1-3 / 4-6, second d6 1-6 - 12 rows; roll Connection and
Trait separately or together (the text says "Roll on the table to randomly
determine the nature of your connection and their traits").

| d6 | d6 | Connection | Trait |
|---|---|---|---|
| 1-3 | 1 | owes you money | Loyalist |
| 1-3 | 2 | outfought you | Broken |
| 1-3 | 3 | hates you | Cruel |
| 1-3 | 4 | loves you | Stingy |
| 1-3 | 5 | knows your secret | Naive |
| 1-3 | 6 | owed money by you | Hot-headed |
| 4-6 | 1 | is a distant relative | Honest |
| 4-6 | 2 | is an enemy's enemy | Chatter |
| 4-6 | 3 | is a childhood friend | Rebel |
| 4-6 | 4 | betrayed you | Liar |
| 4-6 | 5 | wronged you | Vain |
| 4-6 | 6 | is a rival | Undercover |

This table is a known person, not a random opponent; the latter is the
Urban column of the matrix in [Encounters](./encounters.md).

# Engine notes

Mechanical: R57 (bet), R58 (+1 LUCK), R63, R64 (prices), R65 (the roll).
Guidance: R58's abuse clause. Narrative-only: R59, R60, R61, R62, R65's
content.

Readings that bear on this concept:

- [I-13](./readings/combat.md) - a Gambling House tie is a push (R57).
- [I-14](./readings/combat.md) - each Chaguan attempt is a fresh Concentration check costing 1 ENDURANCE on failure (R63).
- [I-54](./readings/exploration-cities-oracle.md) - SKILL checks for the Central District, City Walls and Market resale, at -2 for "very difficult" (R59-R61; numbers invented).
- [I-58](./readings/exploration-cities-oracle.md) - one Temple check per day; a second risks -1 LUCK (R58).
- [D07](./readings/discrepancies.md) - the Proficiency bonus on the Master's side of the bet (R57).
