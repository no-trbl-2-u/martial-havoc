---
type: Table
title: "Adventure hooks"
description: "The rulebook's d66 table of 36 adventure hooks, verbatim, with the adventure rules rows."
tags: [campaigns, hooks]
cite: "MH p.36-39"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.36-39"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory, sections 2.8 and 3.10"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

The rulebook's "Adventures" section (p.36-39) is a single d66 table:
the first die gives the tens row, the second the unit.[^rulebook] There is
no procedure text beyond the table; Appendix B (p.85) says the Incident of
a three-act adventure "can be generated from the 'Adventures' table".[^inventory]

# Rules

Inventory section 2.8, as recorded.[^inventory]

| Rule | Statement | Page | Class |
|---|---|---|---|
| R50 | A d66 table of 36 adventure hooks (section 3.10); no procedure text beyond the table. Appendix B (p. 85) says the Incident "can be generated from the 'Adventures' table". | 36-39, 85 | mechanical roll, narrative-only content |

# Adventures (d66)

All 36 hooks, verbatim.[^rulebook]

| d66 | Adventure |
|---|---|
| 11 | An enemy school has killed your master and all your companions. You are the last survivor who can avenge them |
| 12 | Unknown killers have murdered your father. You must find your brothers and seek revenge |
| 13 | Strange animal attacks on a mountain pass threaten trade |
| 14 | A ghost haunts a palace, making life impossible for its inhabitants |
| 15 | Nomads from the north have attacked a village on the border; the governor is looking for talented men |
| 16 | An isolated village has stopped paying taxes. You are sent to gather information |
| 21 | One city, two martial arts schools at war for decades |
| 22 | You must escort a Mandarin to a newly conquered province |
| 23 | A corrupt official tries to expropriate your family's property |
| 24 | Thieves have stolen a sacred object from a monastery, and the abbot is looking for volunteers to find it |
| 25 | A martial arts tournament is held every year on a remote island; only one will survive |
| 26 | A monk is worshipped as a god. The local deities appear to you in a dream, asking to put an end to it |
| 31 | You wake up to find your family slaughtered, you see only a one-armed figure running away |
| 32 | Although the task is impossible, there is nothing else to do; you must kill the emperor |
| 33 | In a cave hidden by a waterfall, it is said that there are monkeys with magical powers |
| 34 | A nobleman pays you to teach his inept heir how to become strong and brave |
| 35 | You are wrongly accused of murder and there is a bounty on your head |
| 36 | To defeat a demon, you must find an ally and create a new dual technique |
| 41 | The new Manchu emperor is about to launch an attack on the last rebel monastery |
| 42 | Your master has taught his skills to five other people. You must find out if they have turned evil and, if so, kill them |
| 43 | A Japanese warship has just landed on the coast, spreading panic |
| 44 | A troop of European colonialists has occupied a port city and rules it with an iron fist |
| 45 | You are tormented by a spirit and must find a way to get rid of it |
| 46 | You have been struck on a pressure point and will die in 7 days, unless... |
| 51 | You must accompany a Buddhist monk to India to retrieve the sacred scriptures |
| 52 | A village is being preyed upon by bandits. You must teach everyone who is willing to fight in order to stop the next attack |
| 53 | You must infiltrate a criminal organization using an invitation to a tournament as a cover |
| 54 | Bandits have kidnapped the governor's son |
| 55 | On your wedding day, a demon kidnaps your partner |
| 56 | There is a mysterious killer who murders everyone with your surname |
| 61 | A prince seeks your help, an impostor has taken his place |
| 62 | For months, the village's harvests have been poor and the crops rot quickly |
| 63 | You find out that you have an evil twin brother |
| 64 | A pupil attacks you in your sleep. Thought dead, you wake up in your coffin |
| 65 | An enraged dragon causes continuous tsunamis on some coastal villages |
| 66 | You are under the magical influence of a criminal who uses you as a ruthless assassin for his own ends |

# Engine notes

- Phase 2 (tables as data) loads the 36 hooks as one data file with
  `cite: "MH p.36-39"` and `label: rule`; Phase 12 (sandbox procedures)
  presents them as a menu, and Appendix B's three-act structure draws its
  Incident from them.
- The hooks are narrative-only content: no rule attaches to a row. The
  adventure format of Phase 5 ([The 5 Treasures](the-5-treasures/index.md))
  is what a hook, once chosen, would be authored into.
- Hook 26 names "the local deities"; the rulebook's Table of Deities is
  recorded at [deities](../world/deities.md). Hooks 36, 55 and 65 name a
  demon or a dragon; the rulebook's stat blocks are at
  [opponents](../world/opponents.md).
- Readings about the first adventure: [the 5 treasures readings](../rules/readings/the-5-treasures.md).

[^rulebook]: Martial Havoc rulebook (pdf-parse extraction), p.36-39
[^inventory]: Estate inventory, sections 2.8 and 3.10
