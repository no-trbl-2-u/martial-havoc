---
id: idea-0003/artifacts/0002-rules-tables-opponents-adventure-inventory.md
type: Findings
shape: prose
lenses: []
produced-by: research
inputs:
  - ideas/0003-martial-havoc-mobile-edition/artifacts/0001-martial-havoc-mobile-edition-spark.md
date: 2026-09-05
classifiers:
  challenged: false
potential-next-steps: [frame]
summary: "Machine-readable inventory of Martial Havoc from the two PDFs in the record: 84 rules with enforceability class, all 18 Martial Arts and Proficiencies, 36 Techniques, 36 Rituals, every table cell (Oracle, Encounters, Sparks, Market, XP), 50 opponent stat blocks, the eight pre-generated Masters read from the image, The 5 Treasures in full with its map adjacency inferred, 14 discrepancies against the Spark, 63 ambiguities the engine must decide, and what was looked for and not found."
sources:
  - id: rulebook
    resource: ideas/0003-martial-havoc-mobile-edition/sources/MH_Full_Itchio.pdf
    title: "Martial Havoc (rulebook, 94 PDF pages; Google Docs export, no date metadata)"
    author: human:gianluca-monaco
  - id: adventure
    resource: ideas/0003-martial-havoc-mobile-edition/sources/The-5-treasures.pdf
    title: "The 5 Treasures - An adventure for Martial Havoc (2 landscape pages; Google Docs export, no date metadata)"
    author: human:gianluca-monaco
  - id: rulebook-txt
    resource: ideas/0003-martial-havoc-mobile-edition/sources/MH_Full_Itchio.extracted.txt
    title: "pdf-parse 1.1.1 extraction of the rulebook (derived; the PDF wins where they differ)"
  - id: adventure-txt
    resource: ideas/0003-martial-havoc-mobile-edition/sources/The-5-treasures.extracted.txt
    title: "pdf-parse 1.1.1 extraction of the adventure (derived; the PDF wins where they differ)"
generated: { by: factor/2026-09-05, at: 2026-09-05T13:57:56Z }
---

# Findings: rules, tables, opponents and The 5 Treasures, inventoried

The Factor, back from the record's `sources/` with two PDFs and their two
text extractions, and nothing else. The commission: inventory every rule of
play, every table cell, every Technique, Ritual and opponent, and the whole
of The 5 Treasures, in a form a rules engine can be built from; check the
operator's reading in the Spark against the sources; list every place the
text leaves a decision to the player.

Throughout, **known** means read directly from a source and cited;
**inferred** is marked `(inferred)` with an id (`I-nn`) and is the Factor's
reading, offered for the operator to confirm or reject. `author` on both
PDFs is taken from their credits ("Writing and translation from Heroic
Havoc ... by Gianluca Monaco"[^rulebook]; "Writing by Gianluca
Monaco"[^adventure]). Neither PDF carries a CreationDate or ModDate (both
are Google Docs "Skia/PDF m146" exports with those fields undefined), so
`last_modified` is omitted rather than guessed.

## 0. Method and limits

- **Extraction.** The pdf-parse text supplied with the commission was used
  for all prose and read against the PDF wherever a table's column
  structure mattered. pypdf is broken in this environment and no system PDF
  renderer exists; the `mupdf` WASM package (npm, installed in the
  scratchpad) rendered pages to PNG at 1.5x to 4x, and those renders were
  read visually.
- **Rendered visually** (rulebook, PDF pages): 6, 8, 12, 13, 26, 27, 28, 29,
  30, 44, 46, 59 (3x), 60, 61, 62, 63, 64, 68, 69, 74, 75, 92, 93 (at 4x in
  four horizontal strips), 94. Adventure: both pages at 2x, the cave map at
  4x, the Devil servant loot line at 5x. Every table below whose cells span
  several dice values (Oracle, Encounter Outcome, Treasures) was
  reconstructed from the render, not the flattened text; where a cell span
  was read off column alignment rather than a ruled border, it is marked
  `(span inferred)`.
- **Not rendered:** the cover (PDF 1, rendered but it is art only), the
  chapter-divider art pages (PDF 5, 21, 33, 41, 57, 65) and the remaining
  prose pages, whose extraction was clean. Nothing outside the two files
  was consulted; Heroic Havoc, the parent game, was not read.
- **Page numbering.** Citations use the **printed folio** (the number on the
  page, the one the book's own index and the Spark use). PDF page = folio +
  1; printed "Master creation" 5 is PDF 6. The adventure has no folios; its
  two pages are cited as `a1` and `a2`.
- **Enforceability classes** used in the rules inventory: `mechanical`
  (state plus a check; the engine can enforce it fully), `conditional` (a
  mechanical part triggered or parameterised by a judgment the text leaves
  to the player), `narrative-only` (the engine can at most surface it),
  `guidance` (the author's advice; ignoring it breaks no rule).
- The book says of itself: "Some terms or mechanics are intentionally
  ambiguous to encourage player interpretation. The rulebook gives you the
  tools, the story comes from your imagination."[^rulebook] (p. 3). §6 is
  long for that reason, not because the reading was careless.

## 1. Document map (known)

| Folio | PDF | Content |
|---|---|---|
| cover | 1 | Cover art (Cristian Cammarata), title |
| 0 | 2 | Epigraph from Lie Zi: "...yet the greatest power is to refrain from using them." |
| 1 | 3 | Index |
| 3 | 4 | Introduction; "This game is a hack of Heroic Havoc" |
| 4 | 5 | Chapter art "ZHUN - Beginning" |
| 5-6 | 6-7 | Master creation; Attributes |
| 7-10 | 8-11 | "You are a Master of..." - the 18 Martial Arts |
| 11 | 12 | Training |
| 12-15 | 13-16 | Techniques Table |
| 16-19 | 17-20 | Rituals Table |
| 20-21 | 21-22 | Chapter art "ZHEN - Actions" |
| 22 | 23 | Actions (SKILL and LUCK checks) |
| 23-26 | 24-27 | Combat; Use a technique; Creating an Opening; Final Blow; Final blow table |
| 27-29 | 28-30 | Unexpected event; its table; Table of Deities |
| 30 | 31 | Multiple Combat; Escape |
| 31 | 32 | Healing |
| 32-33 | 33-34 | Chapter art "SHENG - Ascending" |
| 34-35 | 35-36 | Experience and Advancement |
| 36-39 | 37-40 | Adventures (36 hooks) |
| 40-41 | 41-42 | Chapter art "LU - Traveller" |
| 42-45 | 43-46 | Exploration; Exploring the Region; routes and roads; Explore the Monasteries |
| 46-49 | 47-50 | Explore the cities (seven locations) |
| 50-51 | 51-52 | City Services; City encounters |
| 52-55 | 53-56 | Market: Common Items, Weapons, Expedition Equipment, Armor |
| 56-57 | 57-58 | Chapter art "XUN - Proceeding" |
| 58 | 59 | Oracle table |
| 59-63 | 60-64 | Inspirations (Action, Theme); Sparks (Tables 1-6) |
| 64-65 | 65-66 | Chapter art "SONG - Conflict" |
| 66-67 | 67-68 | Encounters rules; Encounters matrix |
| 68-69 | 69-70 | Treasures; Special Items |
| 70-79 | 71-80 | Opponents (50 stat blocks, alphabetical) |
| 80 | 81 | Partial filmography (43 films) |
| 81-91 | 82-92 | Appendix A: Philosophy of the open system; Appendix B: Cinematic Journey |
| 91-92 | 92-93 | Appendix C: Pre-generated characters (heading on 91; the eight sheets are an image on 92) |
| 93 | 94 | License |

The adventure: page `a1` carries the title, the cave map, the premise, the
Event table, and the areas Flat-top mountain through Women quarter; `a2`
carries Kitchen, Chieftain quarter, the nine "Encounters" stat blocks, "The
5 Treasures" and the licence line.[^adventure]

## 2. Rules inventory

One row per rule the rulebook states. All rows are known and cite the
rulebook[^rulebook] unless marked otherwise.

### 2.1 Master creation (p. 5-6)

| Rule | Statement | Page | Class |
|---|---|---|---|
| R01 | A Master is defined by: name and age; Martial Art; SKILL, ENDURANCE and LUCK points; Martial Proficiencies; Techniques and Rituals (if any); Equipment; Experience points. | 5 | mechanical (schema) |
| R02 | Initial equipment: common clothing; a weapon ("even if not listed in the weapon table pg. 53"); "A Health Elixir or an item from the Market costing less than 20 GP"; gold pieces by social status. | 5 | mechanical (the weapon is free text) |
| R03 | Social status, 1d6: 1 Vagabond, 1 GP; 2 Poor, 1d6-1 GP; 3-4 Middle Class, 3d6 GP; 5 Rich, 5d6+6 GP; 6 Noble, 10d6 GP. | 5 | mechanical |
| R04 | SKILL = 1d6+6. ENDURANCE = 2d6+12. LUCK = 1d6+6. | 6 | mechanical |
| R05 | "These initial stats are crucial. Although they may fluctuate, they usually only increase above their initial values in exceptional circumstances." | 6 | guidance (but the engine must **store initial values**: R64's Ritual and Special Item 7 refer to them) |
| R06 | ENDURANCE at zero: "the Master dies or becomes unconscious." | 6 | conditional (which of the two is not decided by the text) |
| R07 | SKILL = combat prowess, dexterity, agility; ENDURANCE = health and physical condition; LUCK = good fortune. | 6 | narrative-only |
| R08 | Worked example: "XinYue 27 - Long Weapon Master - SKILL=7 ENDURANCE=18 LUCK=9 Status: Poor (3GP) Equipment: common clothing, Spear, Health elixir Martial Proficiencies: Armed Combat (2) Defensive Barrier (4) Sweep (1)". | 5 | example (7 points spent = SKILL 7) |

### 2.2 Martial Arts and Proficiencies (p. 7-10)

| Rule | Statement | Page | Class |
|---|---|---|---|
| R09 | Choose a Martial Art or roll on the table (first d6 banded 1-2 / 3-4 / 5-6, second d6 1-6: 18 entries). | 7 | mechanical |
| R10 | Each Martial Art has its own Proficiencies, "on which you can spend as many points as your SKILL value." | 7 | mechanical (the pool is the **rolled** SKILL, before any Training deduction - R15) |
| R11 | "Martial Proficiencies can't exceed the maximum value of 4 at creation." | 7 | mechanical |
| R12 | Fighting bare-handed or armed without the matching Proficiency is allowed: "they simply will not add points to SKILL checks. The same applies to any action that a martial expert wants to try, such as climbing, jumping, intimidating, etc." | 7 | mechanical |
| R13 | Style texts carry powers of their own (§3.1): Improvised weapons "You can always find a weapon"; Drunken style "As long as you have alcohol, you can surprise your enemy and ignore damage from the first hit"; Shaolin Quan "you cannot kill. Regarded as a religious person you can beg for food or lodging"; Cult of the Great Immortals "You can turn iron into gold, read minds, walk on fire, etc."; Praying Mantis "Your finishing blow is always lethal, and you can hit small targets with finger strikes"; Wudang Quan "You can use Rituals in combat"; 9-Section chain whip "a concealable weapon capable of entangling". | 7-10 | conditional (Drunken: needs an alcohol item and a per-fight "first hit" flag; Shaolin: opponent at 0 cannot die; Mantis: Final Blow kills; Wudang: Rituals allowed in combat - the others are narrative-only) |

### 2.3 Training, Techniques and Rituals (p. 11-19)

| Rule | Statement | Page | Class |
|---|---|---|---|
| R14 | Training lets you learn Techniques and Rituals. "Techniques are immediate and can also be used in combat, while Rituals require preparation time, such as invoking a deity, meditation, or physical exercise." | 11 | mechanical (activation timing: Technique = any time incl. combat; Ritual = out of combat, except R13 Wudang) |
| R15 | At creation, subtract SKILL points 1:1 for Training points. "The total SKILL attribute will thus be permanently reduced, but without affecting the total points to be spent during character creation for your Martial Proficiencies." | 11 | mechanical |
| R16 | Each Training point gives 4 Resource points to spend on Techniques and Rituals; each costs the value in parentheses (1-4). | 11 | mechanical |
| R17 | "In the game, use Training skill as one of your Martial Proficiency" - i.e. Training is a Proficiency with a value, usable in checks. | 11 | mechanical (which checks it applies to is A22) |
| R18 | Performing a Technique or Ritual costs ENDURANCE equal to its value (1-4). Restated for combat on p. 24: "without making a roll check, but you must subtract as many ENDURANCE points as the value of the Technique." | 11, 24 | mechanical |
| R19 | Worked example: rolled SKILL 9, Improvised Weapons, 2 Training points -> 8 Resource points; 9 points to assign among the three Proficiencies; final SKILL 7. | 11 | example |

### 2.4 Actions (p. 22)

| Rule | Statement | Page | Class |
|---|---|---|---|
| R20 | SKILL check: threshold = SKILL + relevant Martial Proficiency (if relevant); roll 2d6; equal or lower succeeds. | 22 | mechanical |
| R21 | LUCK check: threshold = LUCK; roll 2d6; equal or lower succeeds. "After making a LUCK check, subtract one point from the total LUCK value, regardless of the outcome." | 22 | mechanical |
| R22 | Which check: SKILL when the outcome "depends directly on the Master's skills"; LUCK when it depends "on external factors". | 22 | conditional (the classification is the player's) |

### 2.5 Combat (p. 23-29)

| Rule | Statement | Page | Class |
|---|---|---|---|
| R23 | Attack Strength for each side = 2d6 + one relevant Martial Proficiency (if any) + SKILL. | 23 | mechanical |
| R24 | Opponent higher: Master loses the difference from ENDURANCE. | 23 | mechanical |
| R25 | Master higher, choose one: (a) subtract the difference from the opponent's ENDURANCE; (b) use one of the Techniques you know; (c) change or recover a weapon; (d) create an Opening. | 23 | mechanical (a choice the UI must present) |
| R26 | Combat continues until: a Final Blow lands; either side's ENDURANCE reaches zero; an Unexpected Event occurs. | 23 | mechanical |
| R27 | Using a Technique in combat needs no roll and costs its value in ENDURANCE. "In times of need, the Master can concentrate internal energy and perform a spectacular action without failing." | 24 | mechanical / narrative-only |
| R28 | "To make the fights more challenging, do not use the Technique to end a fight; even if you can knock down an opponent, it does not mean that they are defeated, but that you have gained a great advantage, or the chance to escape without consequences." | 24 | guidance |
| R29 | Creating an Opening: no damage; "your last attack has exposed a weakness in your opponent or made them harmless. You can take advantage to deliver a Final Blow." | 24 | mechanical (a state flag) |
| R30 | Final Blow: "After creating an opening, roll 2d6. If both dice show the same number, your blow lands, giving you the chance to deliver a devastating strike." | 25 | mechanical (doubles = 6/36) |
| R31 | A landed Final Blow may become a new Technique: "roll against your current LUCK. On a failure, lose 1 LUCK; on success assign it a value (1-4) with a brief description. For inspiration, roll 2d6 on the following table, the attributes suit both the action and the animal." | 25 | mechanical (the name is inspiration only - A12 for the LUCK decrement) |
| R32 | Unexpected Event: when both Attack Strengths are equal. "After an Unexpected Event, you are no longer in the combat phase." If the narrative does not make the event clear, roll 2d6 on the table (§3.6). | 27-28 | mechanical trigger; conditional resolution |
| R33 | Optional Minions rule (footnote to Unexpected Event 7): "you can consider Minions with ENDURANCE=1; if you hit you can remove one minion". | 28 | guidance (optional mechanical) |
| R34 | Table of Deities "For divine intervention or to generate random deities". | 28-29 | narrative-only |

### 2.6 Multiple combat, Escape, Healing (p. 30-31)

| Rule | Statement | Page | Class |
|---|---|---|---|
| R35 | Multiple combat: "Reduce your SKILL points by an amount equal to the number of opponents you face." | 30 | mechanical |
| R36 | Area Techniques/Proficiencies: "in case of a successful attack, distribute the same amount of damage to the enemies. E.g. you have the Martial Proficiency Double Strike, your attack against 3 opponents causes 4 damage; two of them will suffer 4 damage." | 30 | conditional (how many enemies each area ability reaches is read from its prose) |
| R37 | "The opponent's ATTACK attribute (see Opponents pg. 70) indicates how many enemies can attack at the same time." | 30 | mechanical (meaning for named singular monsters: A05) |
| R38 | Escape: "if you think the enemy is too tough, you can flee. If you have not used a Technique or some other stratagem for a daring escape, suffer a last blow and subtract 2 points from your ENDURANCE." | 30 | conditional ("stratagem" is the player's) |
| R39 | "Score 1 Dishonor Point for each time you fail to escape without suffering damage." Dishonor reduces end-of-adventure XP. | 30 | mechanical |
| R40 | SKILL healing: "you can restore part of it (1 point) with spiritual regeneration Techniques. It recovers completely after a full night's rest." | 31 | mechanical |
| R41 | ENDURANCE healing: "partially recovers (4 points) with healing techniques, spiritual regeneration, eating a meal, or with a Health Elixir. It recovers completely with a week's rest." | 31 | mechanical (meal frequency: A48) |
| R42 | LUCK healing: "partially recovered (1 point) with a Spirituality roll check in a Temple" (p. 47: requires incense). | 31, 47 | mechanical |

### 2.7 Experience and Advancement (p. 34-35)

| Rule | Statement | Page | Class |
|---|---|---|---|
| R43 | At the end of each adventure assign 1 (poor) to 3 (excellent) for each of: Mission Success; Use of equipment and environment; Combat spectacularity; Lateral thinking. Sum, subtract Dishonor Points = XP. | 34 | conditional (self-assessed scores; the arithmetic is mechanical; XP range 4-12 before Dishonor) |
| R44 | XP cost table by current SKILL band (§3.9). | 34 | mechanical |
| R45 | "SKILL and LUCK attributes cannot exceed 12 points, while Martial Proficiency can exceed the initial maximum value of 4." | 35 | mechanical |
| R46 | New Techniques or Rituals require raising Training with XP; the example gives 4 Resource Points per Training point bought. | 35 | mechanical |
| R47 | "Any remaining XP will remain available to spend on the next advancement." | 35 | mechanical |
| R48 | "A Master with low SKILL points will have more opportunities to improve their martial Proficiencies; a Master with a high SKILL level ... will be able to expand their knowledge in other areas." | 34 | narrative-only (explains the table's shape) |
| R49 | Worked example: Master Lee SKILL 11, LUCK 9, ENDURANCE 24; scores 2+3+1+3, Dishonor 1, total 8; options listed at the 10-12 band. | 35 | example |

### 2.8 Adventures (p. 36-39)

| Rule | Statement | Page | Class |
|---|---|---|---|
| R50 | A d66 table of 36 adventure hooks (§3.10); no procedure text beyond the table. Appendix B (p. 85) says the Incident "can be generated from the 'Adventures' table". | 36-39, 85 | mechanical roll, narrative-only content |

### 2.9 Exploration (p. 42-45)

| Rule | Statement | Page | Class |
|---|---|---|---|
| R51 | Seven-step procedure: (1) starting city, roll its Resources on the Region table; (2) Region procedure for surrounding locations, city at centre; (3) roll characteristics of locations you visit; (4) "When you move to a location or start a new scene, roll for an Event"; (5) Event = encounter -> Oracle "Encounter Outcome" row; Attack or Ambush -> combat, otherwise NPC or Creature Reaction row; (6) Monastery -> may enter, Monastery procedure; (7) when in doubt, Oracle. | 42 | mechanical (procedure) |
| R52 | Region: "roll a handful of d6 on a sheet of paper. Mark where the dice land. The value on the visible face corresponds to the Location. Roll additional d6 to determine other characteristics, if necessary." Starting city in the centre. | 43 | conditional (a physical scatter the engine must replace - A15) |
| R53 | Distance = distance between the dice, "an arbitrary scale (hours of travel, kilometers, number of scenes, etc.)". | 44 | conditional |
| R54 | Route type, 2d6: 2-3 Nothing; 4-5 Mule track; 6-8 Trail; 9-10 Beaten path; 11-12 Paved road. | 44 | mechanical |
| R55 | Road features, 1d6: 1-2 Nothing; 3-4 Inn; 5 Rope bridge; 6 Guard post. Inn: "The perfect place for ambushes; in the event of fighting, the stairs will tend to collapse." Guard post: "guards check travelers' passports". Rope bridge: "You can only cross one at a time, and fighting on it without good balance could be fatal." | 44 | mechanical roll; narrative-only effects |
| R56 | Monastery: roll a handful of d6 (or one Location at a time as explored); table of Location, Location Function, Openings, Atmosphere, Event (§3.12). | 45 | mechanical |

### 2.10 Cities (p. 46-51)

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

### 2.11 Market (p. 52-55)

| Rule | Statement | Page | Class |
|---|---|---|---|
| R66 | "1 gold piece (GP) is worth 10 silver pieces (SP)." | 52 | mechanical |
| R67 | "If it is not listed, find a similar item to get an idea of the price". | 52 | conditional |
| R68 | "Although weapons do not directly affect the dice roll, some martial arts specialize in certain types of weapons; if you do not have a weapon, do not add the specialization points." | 53 | mechanical (armed Proficiencies require a weapon item) |
| R69 | Expedition equipment: "Whether or not you possess these items affects your ability to interact with the world. For example, you cannot climb without a rope or light a fire without a flint." | 54 | conditional (which actions need which item is only exemplified) |
| R70 | Armor: "Protections have no effect on the dice roll; ... in some cases they can influence the narrative development of a scene." | 55 | narrative-only |

### 2.12 Oracle, Inspirations, Sparks (p. 58-63)

| Rule | Statement | Page | Class |
|---|---|---|---|
| R71 | Oracle: "Consult the Oracles when dealing with uncertainty about information or abilities beyond the Master's knowledge (typically questions you would ask the Game Master)." One 1d6 row per category (§3.15). | 58 | mechanical roll; narrative-only interpretation |
| R72 | Inspirations: for an open question or a stimulus; roll Action (d66) and Theme (d66), combine, interpret. | 59-60 | mechanical roll; narrative-only |
| R73 | Sparks: roll 1d6 for the table, then d66 for the word; "interpreted intuitively". | 60-63 | mechanical roll; narrative-only |

### 2.13 Encounters, Treasures, Opponents (p. 66-79)

| Rule | Statement | Page | Class |
|---|---|---|---|
| R74 | Random encounter: 2d6 on the relevant column of the matrix (§3.16). | 66-67 | mechanical |
| R75 | "If you need to roll for a Martial Art, the value in parentheses represents how many points each Martial Proficiency has." (Opponents with "Martial Arts (n)".) | 66 | mechanical |
| R76 | "If you need to roll for s Technique or Ritual, add the value in parentheses to the opponent's Attack Strength. Your opponent does not spend ENDURANCE points to perform Techniques or Rituals." | 66 | mechanical |
| R77 | "Sometimes you will face spirits or ghosts, incorporeal beings immune to traditional weapons or blows; you will need to use a technique, ritual, or exceptional weapon to defeat them." | 66 | conditional (no opponent is tagged incorporeal - A29) |
| R78 | Treasures: "If you believe that your defeated opponents may be in possession of, or guarding, something of valor, roll 1d6 and compare it with their ENDURANCE" (§3.17). | 68 | conditional trigger; mechanical table |
| R79 | Special Items: 2d6 when the Treasure table says "Special Item" (§3.18). | 69 | mechanical roll; effects mostly narrative |
| R80 | Opponent schema: name, one-line description, SKILL, ENDURANCE, ATTACK, Proficiencies with values (§3.19). | 70-79 | mechanical |

### 2.14 Appendices (p. 81-93)

| Rule | Statement | Page | Class |
|---|---|---|---|
| R81 | Appendix A: open system - "Anyone can contribute to changing the rules, expanding parts of the world, or adding details." | 81 | guidance |
| R82 | Appendix B, Cinematic Journey: an alternative three-act frame for "90 minutes of imaginary television time" (§3.21). "If the result of the dice roll conflicts with the linear development of the story, ignore the dice. Reach the plot point without lowering the tension." | 81-91 | guidance |
| R83 | Appendix C: eight ready-to-play sheets (§3.22). | 91-92 | data |
| R84 | Licence CC BY-SA 4.0 with credits (§3.23). | 93 | obligation, not a rule of play |

## 3. Tables, in full

All cells are known and transcribed from the rulebook[^rulebook] unless
marked. Where the flattened text broke a word across lines ("Meridia ns",
"Chrysan themum", "Redemptio n", "Reveal tion", "Techniqu e", "Communi
cate") the render was read and the whole word is given.

### 3.1 Martial Arts (p. 7-10)

Roll: first d6 gives the band, second d6 the row. Names of Proficiencies are
verbatim (capitalisation as printed).

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

Proficiency counts: 5 (Wu Xing Quan), 4 (Cult of the Great Immortals), 3
(all others) - 56 named Proficiencies, 46 distinct names (Armed combat is shared by five styles, Unarmed combat by six, Double strike by two). The Training
example on p. 11 calls Improvised weapons' second Proficiency "Throwing
weapons" where the table says "Ranged weapons" - a source inconsistency.

### 3.2 Techniques Table (p. 12-15)

d66: first die = row group, second = entry. Format as printed: `Name -
Pinyin (cost): effect`. Cost is Resource points to learn and ENDURANCE to
use (R16, R18).

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

Cost distribution: 1 x17, 2 x17, 4 x2, none at 3. Alphabetical order by
English name, which is why d66 order is also alphabetical.

### 3.3 Rituals Table (p. 16-19)

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

Cost distribution: 1 x4, 2 x12, 3 x9, 4 x11. Three Rituals carry numbers an
engine can act on: Body and Mind balance (swap, capped at initial values),
Punishing the sky (revive, reduced ENDURANCE - amount unstated), Vital
Breath (the "spiritual regeneration" that R40/R41 heal by: +1 SKILL, +4
ENDURANCE). The Old Vixen's "Tightening spell (4)" in the adventure shares
its name with Ritual 62 (cost 2).

### 3.4 Final blow table (p. 26)

Rolled "2d6" per p. 25; laid out as first d6 banded 1-2 / 3-4 / 5-6, second
d6 1-6 - 18 rows, one word from each column, for inspiration only (R31).

| d6 | d6 | Action | Attribute | Animal |
|---|---|---|---|---|
| 1-2 | 1 | Strike | Furious | Dragon |
| 1-2 | 2 | Kick | Spinning | Tiger |
| 1-2 | 3 | Punch | Celestial | Crane |
| 1-2 | 4 | Headbutt | Infernal | Serpent |
| 1-2 | 5 | Palm | Fiery | Scorpion |
| 1-2 | 6 | Fingers | Explosive | Leopard |
| 3-4 | 1 | Cut | Impetuous | Monkey |
| 3-4 | 2 | Flight | Rocky | Phoenix |
| 3-4 | 3 | Leap | Stellar | Taurus |
| 3-4 | 4 | Charge | Flying | Turtle |
| 3-4 | 5 | Slap | Legendary | Leopard |
| 3-4 | 6 | Knee Strike | Deadly | Lion |
| 5-6 | 1 | Parry | Spiritual | Eagle |
| 5-6 | 2 | Block | Demonic | Falcon |
| 5-6 | 3 | Attack | Poisonous | Fox |
| 5-6 | 4 | Defense | Lightning | Mantis |
| 5-6 | 5 | Sprint | Destructive | Horse |
| 5-6 | 6 | Sweep | Sharp | Unicorn |

Examples printed on p. 25: "Destroying Palm of the Turtle / Palm of the
Destroyer Turtle / Deadly Palm of the Destroyer Turtle"; "Impetuous Slap of
the Phoenix (2). I jump and strike my opponent's cheek, leaving a red scar
on their face."; "Spiritual Headbutt of the Unicorn (4). I project an energy
wave towards my opponent, who loses memory of the fight."; "Fox's Spinning
Jump (1): a sudden kick and I find myself in the crowd, escaping the fight".
"Leopard" appears twice in the Animal column (1-2/6 and 3-4/5).

### 3.5 Unexpected Event table (p. 28), 2d6

| 2d6 | Unexpected Event |
|---|---|
| 2 | Adverse divine intervention |
| 3 | Injury or loss of weapon for the Master |
| 4 | Enemy retreat (called back, secret plan, etc) |
| 5 | Environmental change (floor/ceiling collapses, light, climate) |
| 6 | The fight resumes |
| 7 | Reinforcements: 1-4 Minions (footnote: optional ENDURANCE=1 rule, R33) of the same type |
| 8 | The fight resumes |
| 9 | Environmental change (floor/ceiling collapses, light, climate) |
| 10 | Enemy retreat (called back, flees, etc) |
| 11 | Injury or loss of weapon for the opponent |
| 12 | Favorable divine intervention |

### 3.6 Table of Deities (p. 29)

First d6 banded 1-3 / 4-6, second d6 1-6 - 12 rows, three columns to
combine.

| d6 | d6 | Name | Action | Object |
|---|---|---|---|---|
| 1-3 | 1 | Rakshasa | Protector | Purity |
| 1-3 | 2 | Immortal | Guardian | Benevolence |
| 1-3 | 3 | Bodhisattva | Lord | Underworld |
| 1-3 | 4 | Great Sage | Destroyer | Prosperity |
| 1-3 | 5 | Divinity | Guardian | 5 elements |
| 1-3 | 6 | Emperor | Enemy | Moon |
| 4-6 | 1 | Venerable | Dispenser | Sun |
| 4-6 | 2 | Star | Occulter | Night |
| 4-6 | 3 | General | Sovereign | Earth |
| 4-6 | 4 | Spirit | Creator | 4 seas |
| 4-6 | 5 | Buddha | Destroyer | Confusion |
| 4-6 | 6 | Dragon | Defender | Dreams |

### 3.7 Healing summary (p. 31)

| Attribute | Partial | Amount | Full |
|---|---|---|---|
| SKILL | spiritual regeneration Techniques | 1 | a full night's rest |
| ENDURANCE | healing techniques, spiritual regeneration, eating a meal, a Health Elixir | 4 | a week's rest |
| LUCK | Spirituality check in a Temple, with incense (p. 47) | 1 | - (no full-restore rule; Special Item 7 restores it) |

### 3.8 Experience score categories (p. 34)

| Category | Range |
|---|---|
| Mission Success | 1-3 |
| Use of equipment and environment | 1-3 |
| Combat spectacularity | 1-3 |
| Lateral thinking | 1-3 |
| minus Dishonor Points | 0-n |

### 3.9 XP cost table (p. 34), per +1

| Increase | SKILL 6 or less | SKILL 7-9 | SKILL 10-12 |
|---|---|---|---|
| Martial Proficiency | 6 XP | 8 XP | 10 XP |
| SKILL | 8 XP | 10 XP | 12 XP |
| ENDURANCE | 4 XP | 4 XP | 4 XP |
| LUCK | 10 XP | 8 XP | 6 XP |
| Training skill | 10 XP | 8 XP | 6 XP |

Caps: SKILL <= 12, LUCK <= 12; Proficiency uncapped after creation (R45).
No ENDURANCE cap is stated. Which SKILL value selects the band (current or
initial) is not stated; the example uses the current SKILL 11 (A53).

### 3.10 Adventures (p. 36-39), d66, verbatim

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

### 3.11 Region Exploration table (p. 43), d6 per column

| d6 | Location | Landmark | Resources | Risk | Event |
|---|---|---|---|---|---|
| 1 | City | Monastery | Medicinal herbs | Low | Encounter |
| 2 | Mountain | Hermit's Refuge | Elixir | Low | Rest |
| 3 | Plain | Martial arts school | Sacred relics | Medium | Effect Expiration |
| 4 | Forest | Frontier (footnote: "marks the border of imperial law: a barbarian territory, a magical kingdom or a rebel enclave") | Magic Weapons | Medium | Weather Change |
| 5 | Rice fields | Empty | Jade | High | Hint |
| 6 | Water | Empty | Ancient Texts | High | Free Exploration |

Route type (2d6) and road features (1d6): see R54, R55.

### 3.12 Monastery table (p. 45), d6 per column

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

### 3.13 City Services (p. 50)

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

### 3.14 City encounters (p. 51)

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

### 3.15 Market (p. 52-55)

Common Items:

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

Weapons:

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

Expedition Equipment:

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

Armor:

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

Starting-kit items "costing less than 20 GP" (R02): every Common Item except
Health Elixir, Smoke Bomb, Protection Amulet, Map of Body Meridians,
Training Manual, Gunpowder; every weapon; every Expedition item except Cart,
Trained monkey, Horse, Mule; every Armor item except Complete War Armor,
War Mask, Steel Helmet with Neck Guard (derived, not stated).

### 3.16 Oracle table (p. 58), 1d6 per row

Cell spans read from the 3x render; spans marked `(span inferred)` were
read from column alignment (the table has no vertical rules).

| Row | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Closed Question | No, and | No | No, but | Yes, but | Yes | Yes, and |
| Outcome | Disaster | Negative | Negative | Positive | Positive | Excellent |
| NPC reaction | Hostile | Wary | Unaware | Kind | Helpful | Flee |
| Creature Reaction | Hostile | Territorial | Unaware | Curious | Docile | Flee |
| Encounter Outcome | Ambush | Attack | Attack | Attack | NPC/Creature Reaction | NPC/Creature Reaction |
| Enemy Type | Minion | Subordinate | Subordinate | Warrior | Warrior | Boss |
| No. of enemies | 1d6 | 3 | 3 | 2 | 2 | 1 |
| Enemy attack | Normal | Normal | Normal | Special | Special | Special |
| Door | Open | Open | Open | Trapped | Locked | Closed |
| Object amount | Finished | One more | One more | Many remaining | Many remaining | Many remaining |
| Value | 5 GP | 10 GP | 25 GP | 50 GP | 100 GP | 250 GP |

Spans: Outcome 2-3 / 4-5 (span inferred); Encounter Outcome 2-4 / 5-6 (span
inferred; "Attack" is centred under 3, "NPC/Creature Reaction" under
5-6); Enemy Type 2-3 / 4-5 (span inferred); No. of enemies 2-3 / 4-5 (span
inferred, aligned with Enemy Type so that Subordinate = 3, Warrior = 2, Boss
= 1, Minion = 1d6); Enemy attack 1-3 / 4-6 (span inferred); Door 1-3 (span
inferred); Object amount 2-3 / 4-6 (span inferred).

### 3.17 Inspirations: Action (p. 59), d66

| d66 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 1 | Attack | Investigate | Search | Close | Avoid | Save |
| 2 | Defend | Create | Climb | Treat | Influence | Betray |
| 3 | Explore | Heal | Throw | Jump | Examine | Overcome |
| 4 | Talk | Meet | Hide | Sleep | Give up | Enrich |
| 5 | Fight | Negotiate | Disguise | Protect | Create illusions | Communicate |
| 6 | Escape | Travel | Open | Pursue | Evoke | Challenge |

### 3.18 Inspirations: Theme (p. 60), d66

| d66 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 1 | Adventure | Choice | Conflict | Betrayal | Honor | Blessing |
| 2 | Magic | Rebellion | Friendship | Rescue | Power | Curse |
| 3 | Mystery | Spirituality | Survival | Discovery | Faith | Redemption |
| 4 | Fight | Secret | Treasure | Death | Revelation | Courage |
| 5 | Exploration | Deception | Research | Revenge | Technique | Destiny |
| 6 | Encounter | Mission | Horoscope | Freedom | Darkness | Tradition |

### 3.19 Sparks (p. 60-63): 1d6 for the table, d66 for the word

Table 1:

| d66 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 1 | Mace | Coin | Cloak | Brooch | Lotus | Whip |
| 2 | Sword | Pearl | Bed | Pendant | Drum | Lantern |
| 3 | Ring | Sutra | Brush | Energy | Flute | Pipe |
| 4 | Elixir | Lens | Bridge | Staff | Mouse | Buffalo |
| 5 | Relic | Gem | Amulet | Poison | Lute | Crystal |
| 6 | Key | Statuette | Chain | Tiger | Emptiness | Mirror |

Table 2:

| d66 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 1 | Brazier | Pagoda | Cup | Incense | Mask | Candle |
| 2 | Meridians | Altar | Bottle | Shadow | Broom | Tomb |
| 3 | Helmet | Dagger | Pendant | Shard | Vase | Die |
| 4 | Stele | Rod | Bell | Teapot | Noble | Gate |
| 5 | Chess | Curtain | Seal | Knife | Ideogram | Fan |
| 6 | Rosary | Claw | Eagle | Rock | Hourglass | Mortar |

Table 3 ("Giada" is printed so - Italian for jade, untranslated; "set
square" is lower-case as printed):

| d66 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 1 | set square | Giada | Bow | Arrows | Fur | Bamboo |
| 2 | Blade | Sled | Manual | Scar | Nail | Talisman |
| 3 | Star | Black | Wave | Halberd | Oil | Bag |
| 4 | Grapevine | Falcon | Tree | Walls | Cliff | Wood |
| 5 | Sack | Tower | Dark | Belt | Dust | Puppet |
| 6 | Blanket | Staircase | Chrysanthemum | Bones | Tunic | Ink |

Table 4:

| d66 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 1 | Hat | Unicorn | Ginseng | Horse | Desert | Rooster |
| 2 | Rope | Grass | Silk | Moon | Fire | Pyre |
| 3 | Bed | Bench | Bottle | Feather | Stone | Storm |
| 4 | Globe | Statue | Inkwell | Courtyard | Bowl | Dragon |
| 5 | Book | Necklace | Lock | Student | Trap | Bandit |
| 6 | Wheel | Inn | Sphere | Bear | Dart | Dog |

Table 5:

| d66 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 1 | Sea | Compass | Rain | Metal | Leather | Emperor |
| 2 | Wind | Needle | Forest | Saw | Rice | Gloves |
| 3 | Sun | Passport | Spear | Cards | Plow | Pen |
| 4 | Rope | Table | Net | Bandage | Webs | Column |
| 5 | Lightning | Frontier | Snake | Pole | Flame | Kite |
| 6 | Horn | Door | Pig | Fish | Deer | Torch |

Table 6 ("Sign" is printed twice on row 4, verified on the render):

| d66 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 1 | Leaf | Sickle | Spice | Twilight | Mine | Volcano |
| 2 | Pumpkin | Monkey | Gong | Portal | Meadow | Water |
| 3 | River | Spark | Spirit | Valley | Dawn | Lake |
| 4 | Butterfly | Sign | Sign | Swamp | Treasure | Island |
| 5 | White | Map | Sunset | Light | Ruins | Cloud |
| 6 | Saddle | Wax | Tao | Mountain | Field | Demon |

Duplicates across the six tables (an engine that de-duplicates should know):
Bed (1, 4), Bottle (2, 4), Pendant (1, 2), Rope (4, 5), Sign x2 (6).

### 3.20 Encounters matrix (p. 67), 2d6 by column

Italic *Supernatural* in the Non-urban column (verified on the render) is a
redirect, not an opponent: roll on the Supernatural column `(inferred,
I-19)`.

| 2d6 | Urban | Non-urban | Water | Supernatural | Monastery |
|---|---|---|---|---|---|
| 2 | Gui | *Supernatural* | Kun | Dapeng | Tutelary Spirit |
| 3 | Mandarin | Xiongu | Shen | Long Wang | Shi Gong |
| 4 | Shi Fu | Mercenary | Smuggler | Shan Xiao | Shi Fu |
| 5 | Guard with Sheng Biao | Monk | Pirate | Shi Shi | Devotee |
| 6 | Guard with Lian Ting | Beast | Giant Octopus | Huang Feng Guai | Shi Di |
| 7 | Brawler | Bandit | Tanka | Huli Jing | Tu Di |
| 8 | Shi Di | Green Hornet | Shark | Jiangshi | Thief |
| 9 | Guard with Tie Jian | Macaque | Giant Jellyfish | Gui | Cook |
| 10 | Thief | Gai Bang | Kobukson | Feng Huang | Yogi |
| 11 | Boxer | Yauxia | Pan Long | Bai Gu Jing | Attendant |
| 12 | Rebels | *Supernatural* | Ghost Pirate | Niu Mowang | First Abbot |

"Yauxia" (matrix) is "Youxia" in the stat blocks. 49 distinct opponents are
reachable from the matrix; the fiftieth, Dealer, is reached only from the
Gambling House.

### 3.21 Treasures (p. 68), 1d6 against the defeated opponent's ENDURANCE

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

### 3.22 Special Items (p. 69), 2d6

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

### 3.23 Opponents (p. 70-79), all 50 stat blocks

Descriptions verbatim. ATTACK is "how many enemies can attack at the same
time" (R37). Proficiency values add to Attack Strength; "Martial Arts (n)"
means roll a Martial Art and give each of its Proficiencies n points (R75).

| # | Name | Description | SKILL | END | ATTACK | Proficiencies | Page |
|---|---|---|---|---|---|---|---|
| 1 | Attendant | A mysterious figure often missing a limb. | 5 | 8 | 1 | Technique (4), Double Identity (3) | 70 |
| 2 | Bai Gu Jing | White Bone Demon who deceives humans. | 8 | 17 | 1 | Charm (3), Doppelganger (3) | 70 |
| 3 | Bandit | A ruthless thief and assassin. | 6 | 9 | 1 | Trap (3), Ambush (3) | 70 |
| 4 | Beast | A tiger, leopard, or jaguar. | 8 | 18 | 2 | Bite (2), Agility (3) | 70 |
| 5 | Boxer | A tall and sturdy European. | 7 | 20 | 1 | Uppercut (2), Firearms (4) | 70 |
| 6 | Brawler | A thug looking for trouble. | 4 | 4 | 2-4 | Call for Reinforcements (2), Dirty Trick (3) | 71 |
| 7 | Cook | The least religious member of the monastery. | 5 | 10 | 2 | Cleaver (4), Knife Throwing (3) | 71 |
| 8 | Dapeng | A mastodontic bird that transforms into the Kun fish. | 12 | 24 | 10 | Tornado (4), Storm (4) | 71 |
| 9 | Dealer | They play as long as it suits them. | 7 | 6 | 1 | Cheating (3), Rage-quit (4) | 71 |
| 10 | Devotee | A religious person marked with Jieba. | 4 | 8 | 1 | Charm (3), Invocation (2) | 71 |
| 11 | Feng Huang | A bird resembling a phoenix. | 11 | 17 | 2 | Fire Breath (3), Ice Breath (3) | 72 |
| 12 | First Abbot | The spirit of the founder. | 11 | 6 | 1 | Martial Arts (3) | 72 |
| 13 | Gai Bang | A member of the martial sect of vagabonds | 11 | 10 | 1 | Knotty Staff (2), Mark a Victim (3) | 72 |
| 14 | Ghost Pirate | It sails on a spectral ship. | 9 | 12 | 6 | Diving (4), Mirage (3) | 72 |
| 15 | Giant Jellyfish | A gelatinous monster with spikes. | 7 | 10 | 4 | Camouflage (3), Venom (2) | 72 |
| 16 | Giant Octopus | A tentacled creature. | 7 | 14 | 3 | Trapping (3), Ink (2) | 73 |
| 17 | Green Hornet | An insect with a deadly sting. | 7 | 18 | 6 | Multi-Directional Attack (2), Protect the Nest (3) | 73 |
| 18 | Guard with Lian Ting | Two-section long staff. | 8 | 15 | 1 | Stun (2), Throwing Weapon (2) | 73 |
| 19 | Guard with Sheng Biao | Rope with a weight at the end. | 8 | 15 | 1 | Trapping (2), Throwing Weapon (2) | 73 |
| 20 | Guard with Tie Jian | Quad-edged straight mace. | 8 | 15 | 1 | Disarm (3), Throwing Weapon (2) | 73 |
| 21 | Gui | A human ghost. | 5 | 8 | 1 | Curse (3), Haunt (2) | 74 |
| 22 | Huang Feng Guai | Yellow Wind Demon, a human eater creature. | 8 | 17 | **blank** | Blinding Wind (3), Cannibalism (2) | 74 |
| 23 | Huli Jing | A mischievous fox spirit. | 9 (printed "SKILLS 9") | 8 | 1 | Shapeshifter (4), Soulmate (3) | 74 |
| 24 | Jiangshi | One-legged undead that absorbs Qi. | 8 | 12 | 1 | Vampiric Attack (3), Jump (2) | 74 |
| 25 | Kobukson | A sailor on a Korean turtle ship. | 8 | 20 | 6 | Cannon Shot (3), Armor (4) | 74 |
| 26 | Kun | Mastodontic fish that transforms into the Dapeng bird. | 12 | 24 | 10 | Swallow (4), Tsunami (4) | 75 |
| 27 | Long Wang | King of dragons, guardian of the gods. | 11 | 20 | 4 | Climate Change (3), Summon Snakes (3) | 75 |
| 28 | Macaque | A mischievous primate. | 4 | 5 | 1 | Stealing (3), Throwing Feces (2) | 75 |
| 29 | Mandarin | A high-ranking imperial official. | 6 | 4 | 1 | Call Guards (4), Put a Bounty (3) | 75 |
| 30 | Mercenary | A bodyguard for nobles and traveling merchants. | 10 | 17 | 1 | Martial Arts (2) | 75 |
| 31 | Monk | A person dressed in religious clothing. | 8 | 15 | 1 | Ritual (2), Technique (2) | 76 |
| 32 | Niu Mowang | A demon in the form of a bull. | 10 | 18 | 2 | Charge (3), Lightning Bolt (3) | 76 |
| 33 | Pan Long | Water dragon. | 9 | 18 | 4 | Wave (3), Vortex (3) | 76 |
| 34 | Pirate | A sea and river bandit. | 8 | 17 | 1 | Boarding (3), Rain of Arrows (3) | 76 |
| 35 | Rebels | A group of poorly armed peasants. | 4 | 22 | 6 | Surround (2), Human Wave (4) | 76 |
| 36 | Shan Xiao | A furry creature with long fangs. | 8 | 18 | 3 | Rock Throwing (2), Confusion (4) | 76-77 |
| 37 | Shark | Ruthless killer of the sea. | 8 | 15 | 1 | Jaws (3), Blood Trail (2) | 77 |
| 38 | Shen | A dragon with the appearance of a mollusk. | 9 | 18 | 2 | Illusion (4), Shapeshifter (2) | 77 |
| 39 | Shi Di | A martial art practitioner. | 7 | 14 | 1 | Martial Arts (1) | 77 |
| 40 | Shi Fu | A martial art's master. | 9 | 17 | 1 | Martial Arts (2) | 77 |
| 41 | Shi Gong | A grand Master. | 10 | 18 | 1 | Martial Arts (4) | 77 |
| 42 | Shi Shi | Lion-dog holding a bronze ball. | 8 | 20 | 1 | Stone Skin (2), Projectile (3) | 78 |
| 43 | Smuggler | A skilled sailor seeking profit. | 9 | 10 | 1 | Escape Route (3), Negotiate (3) | 78 |
| 44 | Tanka | Belonging to the "boat people, dredger of waterways. | 6 | 9 | 1 | Fishing Net (2), Special Item (3) | 78 |
| 45 | Thief | A skilled and elusive professional. | 8 | 8 | 1 | Steal (3), Vanish (4) | 78 |
| 46 | Tu Di | An inexperienced young student. | 5 | 10 | 1 | Beginner's Luck (2), Escape (4) | 78 |
| 47 | Tutelary Spirit | Emanation of the local deity. | 11 | 9 | 1 | Miracle (4), Curse (2) | 79 |
| 48 | Xiongu | A nomadic warrior. | 7 | 18 | 1 | Fighting (3), Archery (3) | 79 |
| 49 | Youxia | A wandering knight who defends those in need. | 11 | 20 | 1 | Code of Chivalry (4), Martial Arts (2) | 79 |
| 50 | Yogi | A religious person in meditation. | 6 | 16 | 1 | Incorporeal (4), Technique (2) | 79 |

Five blocks carry a single Proficiency (First Abbot, Mercenary, Shi Di, Shi
Fu, Shi Gong); Youxia carries "Martial Arts (2)" beside a named one.
ENDURANCE bands for the Treasure table (derived, not stated): 20 or more -
8 (Boxer, Dapeng, Kobukson, Kun, Long Wang, Rebels, Shi Shi, Youxia); 17-19
- 14 (Bai Gu Jing, Beast, Feng Huang, Green Hornet, Huang Feng Guai,
Mercenary, Niu Mowang, Pan Long, Pirate, Shan Xiao, Shen, Shi Fu, Shi Gong,
Xiongu); up to 16 - the remaining 28.

### 3.24 Appendix B: three-act structure, as guidance (p. 81-91)

Summarised; this is advice for pacing, not a rule of play (R82).

- Purpose: "an alternative tool for creating stories and bringing them to
  fruition in 90 minutes of imaginary television time; the three-act theory
  is used to harness the narrative into a predefined structure".
- Vocabulary: **plot point** (an event that pushes the story in a new
  direction), **climax** (each act ends with one; a point of no return),
  **Obstacle** (a circular movement from presentation to resolution;
  sub-Obstacles may open but "It is important not to open too many"; "In
  MH-CJ, consider most sub-obstacles as fights").
- Dice: "we can interpret the results of the dice rolls to understand if we
  have reached a plot point. If the result of the dice roll conflicts with
  the linear development of the story, ignore the dice." Example: an Event
  roll of Rest at the boss's door should be played as an Encounter.
- **Act I - Presentation**: define the world (realism, supernatural,
  historical time) and characters; Call/Incident (from the Adventures
  table); Motivation/Point of No Return; Climax = leaving the Ordinary
  World. "Set concrete goals, avoid politics and complicated romantic
  entanglements." Decide whether magic is present. Recommends the Faser
  "Adventure Generator" (Ruolatori Solitari) as an extra tool.
- **Act 2 - Confrontation**: the Other World; first part (Obstacles
  introduce the world and characters); central turning point
  (twist/revelation/progress; the antagonist may be revealed; the Goal may
  change); second part (more dangerous); Crisis/failure/death; Climax
  (realisation or "rebirth"). "The second act represents almost the
  entirety of the narrative." Two sustaining structures: **climbing the
  pyramid** (waves of minions, then fewer stronger enemies, then the boss)
  and **trial and error** (the main challenge is met at once and is
  impossible; a sequence of improvements follows).
- **Act 3 - Resolution**: Rising Action; Climax (usually the boss fight;
  success or failure); Resolution ("a joyful jump and a freeze frame with
  the closing credits will suffice"). Or continue: "which figure in the
  shadows was pulling the strings of the boss you just defeated?"
- Worked examples with spoilers: Clan of the White Lotus (1980) and Zu:
  Warriors from the Magic Mountain (1983), each mapped to the three acts;
  a hand-drawn tension curve for Zu on p. 91 (Civil war -> The escape ->
  entrance to a new world -> To survive -> To be accepted -> Boss fight ->
  Find a cure -> New goal -> Masters' loss -> The disciples unite -> The
  quest for the sword -> Mini boss fight -> Boss fight -> Victory).

### 3.25 Appendix C: the eight pre-generated Masters (p. 92, image), transcribed from the 4x render

| Name | Age | Status | Equipment | SKILL | END | LUCK | Martial art | Proficiencies | Training | Techniques | Rituals | From |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Beggar So | 63 | Vagabond | Wine bottle | 10 | 16 | 11 | Drunken style | Unarmed combat 4, Go unnoticed 1, Baffle 3 | 2 | Monkey jump, Snake form | Older brother | Drunken master (1978) |
| Chen Zhen | 28 | Middle class | Nunchaku | 9 | 18 | 8 | Wing Chun | Unarmed combat 4, Stealth 2, Brotherhood 2 | 2 | Sky punching fist, Tiger roar, Chain fists, Light body | - | Fist of fury (1972) |
| Yin | 43 | Poor | Magical sword, protection sutra, bow and arrows | 7 | 22 | 9 | Wudang quan | Unarmed combat 2, Occultism 4, Astrology 4 | 2 | - | Lord of the bow, Mystical fire, King of the underworld, Guardians of the gate | A chinese ghost story (1987) |
| Golden Swallow | 34 | Rich | double knives, man clothes, throwing darts | 7 | 15 | 10 | Double knives | Double strike 3, Acrobatic 2, Disarm 3 | 1 | Shooting star kick | Open the mount close the mouth | Come drink with me (1966) |
| San Te | 27 | Poor | Three-section staff | 8 | 20 | 9 | Shaolin Quan | Non lethal combat 4, Spirituality 1, Stamina 2 | 2 | Iron head, Pluck the phoenix's Eye, Rising Wave Strike, Eagle Claw | - | The 36th CHamber of Shaolin (1978) |
| Sun Wukong | 1100 | Vagabond | Magical staff | 10 | 24 | 7 | Cult of the great immortals | Body conditioning 4, Transmutation 4, Foresight 2, Alchemy 1 | 4 | Unicorn step, Pushing the horse | Somersault clouds, The 72 transformation, White Guanyin | Journey to the west (16th century) |
| Sonny Wong | 30 | Rich | Revolver | 8 | 17 | 11 | Scorpion style | Deadly combat 3, Cold blooded 3, Precision 2 | 1 | Spinning kick, Lizard climbs the wall | - | The scorpion king (1992) |
| Jen Yu | 17 | Noble | Legendary weapon | 8 | 16 | 9 | Edged Weapons | Armed Combat 3, Charisma 2, Coordination 3 | 1 | Sticky hands, Blue dragon, Crane's flight | - | Crouching Tiger, Hidden Dragon (2000) |

Notes on the sheets (derived): "Wing Chun" = Red Boat Wing Chun and
"Scorpion style" = Praying Mantis Style by their Proficiencies; "Guardians
of the gate" = Door gods, "Open the mount close the mouth" = Open the
mouth, close the mouth, "Pluck the phoenix's Eye" = Tear out a phoenix's
eye, "Acrobatic" = Acrobatics. Resource-point check (4 per Training point
against the table costs): Beggar So 7/8, Chen Zhen 7/8, **Yin 12/8 (over by
4)**, Golden Swallow 3/4, San Te 6/8, Sun Wukong 11/16, Sonny Wong 2/4, Jen
Yu 3/4. Proficiency-pool check (points spent against the rolled SKILL
implied by final SKILL + Training): every sheet fits except **Yin again (10
spent against a pool of 9)**. Beggar So's implied rolled SKILL is 12, the
1d6+6 maximum; Sun Wukong's ENDURANCE 24 is the 2d6+12 maximum.

### 3.26 Licence and credits (p. 93), verbatim

> Writing and translation from Heroic Havoc: ruolatorisolitari.itch.io/heroic-havoc by Gianluca Monaco
>
> Graphic by Gianluca Monaco
>
> Cover artwork (except title) and pages 21,33, 41,57, 65 by: Cristian Cammarata (Naitsirc) Instagram: _naitsirc93 www.instagram.com/_naitsirc93
>
> Creative Commons Attribution-ShareAlike 4.0 International
> This license requires that reusers give credit to the creator. It allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, even for commercial purposes. If others remix, adapt, or build upon the material, they must license the modified material under identical terms.
> https://creativecommons.org/licenses/by-sa/4.0/

The Introduction adds: "This game is a hack of Heroic Havoc -
ruolatorisolitari.itch.io/heroic-havoc" (p. 3); Appendix A: "This project
came to life thanks to Ruolatori Solitari group:
https://www.ruolatorisolitari.it/" (p. 81). The adventure's licence
line[^adventure]: "License https://creativecommons.org/licenses/by-sa/4.0/
Writing by Gianluca Monaco Icons: https://limofeus.itch.io/handdrawniconpack
Cave map: https://watabou.itch.io/cave-generator" with the CC BY-SA badge.
The partial filmography (p. 80) lists 43 films; "Warriors Two (1978" lacks
its closing parenthesis in the source.

## 4. The 5 Treasures, in full

Everything in this section is from the adventure PDF[^adventure] (two
landscape pages, three columns each) read against its extraction. Dice are
printed as pip glyphs; they are written here as numbers. Each area is laid
out as: a hand-drawn icon, title, description, an "Encounters:" line, and a
paragraph in grey preceded by a warning-triangle icon - the **Hint**. The
same triangle icon marks the note "read this part only if your PG gets
information about the area or with Event roll=Hint", the "The 5 Treasures"
heading on `a2`, and the Devil servant's loot on a 6 (§6, I-08).

### 4.1 Premise (verbatim)

> On the Flat-top mountain two fiends threaten the travellers: Senior King
> Gold Horn and Junior King Silver Horn, human eater demons. In the Lotus
> Flower cave, where they live protected by devil servants, are kept 5 magic
> treasures.

### 4.2 Event table

"Event table, roll every time you enter an area:"

| 1d6 | Event |
|---|---|
| 1 | Ambush! |
| 2-3 | Encounter |
| 4-5 | Safe exploration |
| 6 | Hint |

"Encounters - for Event=1,2,3 roll for the creature encountered in the
area". "read this part only if your PG gets information about the area or
with Event roll=Hint" (the grey Hint paragraphs).

### 4.3 The eight areas

| # | Area | Icon (render) | Description (verbatim) | Encounters (1d6) | Hint (verbatim) |
|---|---|---|---|---|---|
| 1 | Flat-top mountain | none | "A wild and vast territory covered with pines and willow trees, deep valleys and steep rocks, difficult paths for horses. In the distance an axe at work and the animals running on craggy ridges." | 1-3 Woodgatherer; 4-5 Ogre; 6 Junior King | "Old poem 'Towering peaks, Tapered pinnacles. Down in the deep, winding stream, Beside the lonely cliff'" |
| 2 | Cave entrance | none | "A shut wooden gate hidden by a willow tree; painted in red : 蓮花洞 A stream falls slowly silent, swallowed by the mountain. Shrill voices come from the inside." | 1 Devil servant; 2-4 Ogre; 5-6 Junior King | "Ogres go out hunting for travellers once a day" |
| 3 | Attendants room | flask/vase | "The room serves as entrance to the locked Private Quarters, a kitsch display case contains the finest tea set, right next to it, on a pedestal a jade vase is guarded by at least one of the personal Senior King's attendants." | 1-2 Skillful Beast; 3-4 Dexterous Ghost; 5-6 Both | "The attendants have already tested Senior King's patience. Next mistake they will get punished" |
| 4 | Dining Hall | candelabra | "The cave vault is high and the torches barely illuminate the entire area, a long stone table with two stone thrones . The room is busy with devil servants running to and from the kitchen." | 1-4 Devil servant; 5 Junior King; 6 Senior King | "Junior King would take a nap here if he overdrank wine." |
| 5 | Storage room | jugs and jars | "A dark room, a faint light from nearby areas illuminates the floor: a mess of boxes, crates, trunks filled with tools, servants' clothes, herbs and dried food. A source of light could show the shelves: utensils, plates, cups and recipients; gourds, jugs and vases of all dimensions." | "Devil servants" (no dice) | "One of the treasures looks like an ordinary gourd bottle." |
| 6 | Women quarter | fanged she-devil face | "The door is decorated with ivory bas-reliefs: a rich sedan chair followed by a troop of marching she-devils. A protruding hand with a golden decoration. Inside: an old woman is sitting on a chair, a white silk scarf wrapped around her head and jewels studded her golden earrings. A she-devil servant is combing her hair." | "Old Vixen and she-Devil servant" (no dice) | "The old lady is the demons' adoptive mother. She knows the spells to control the Dazzling Golden Cord" |
| 7 | Kitchen | cauldron | "A steady fire fuels a boiling pot, little devils bustle about amidst chopped ingredients and sauces, knives wielded by steady hands. The smoke rises toward an opening in the ceiling that goes up inside the mountain. Soaked in the pool at the back, hidden from the entrance, there's a man tied up, he is trembling and murmuring a prayer." | "Devil servants" (no dice) | "The man is a MONK, captured to be eaten by the Senior King and prolong his life" |
| 8 | Chieftain quarter | horned helmeted head | "The Senior King's private area is entered through a paper sliding door. Inside: a golden screen decorated with a fan wrapped in flames hides the bed; on the other side of the room there's a lectern with several scattered sheets." | 1-4 Senior King; 5-6 Empty | "By interpreting what is written on the sheets, you come to how two of the treasures work." |

"Junior King" and "Senior King" in the encounter lines are the two stat
blocks Junior King Silver Horn and Senior King Golden Horn. The premise
spells the elder "Gold Horn"; his stat block "GOLDEN HORN" - both are in the
source.

### 4.4 The cave map (image, `a1`), what it shows and what is inferred

Known (from the 4x render): a black-and-white cave plan (watabou's cave
generator) with **six icon-marked chambers**, one unmarked chamber, an
arrow entering from the lower right, and a grey-shaded pool at the very
top. The icons match the area headings on the same page: cauldron =
Kitchen (topmost chamber, the grey pool behind it), jugs = Storage room
(upper right), candelabra = Dining Hall (the large central-left chamber),
flask = Attendants room (bottom centre), horned helmet = Chieftain quarter
(lower left, upper), fanged face = Women quarter (lower left, lowest). The
Flat-top mountain and the Cave entrance have no icon; the arrow marks the
way in. The map carries no scale, no doors, no labels.

Adjacency `(inferred, I-42)`, read from the passages drawn:

| From | To |
|---|---|
| Cave entrance (arrow) | unmarked chamber at lower right |
| unmarked chamber | Storage room (north) and Dining Hall (west, via the passage south of the Storage chamber) |
| Storage room | Kitchen (north, past a rock pillar) |
| Dining Hall | Kitchen (north-east), Attendants room (south) |
| Attendants room | Chieftain quarter (west) |
| Chieftain quarter | Women quarter (south) |

The reading that the Private Quarters are the Chieftain quarter and the
Women quarter, both reached only through the Attendants room, follows from
the description ("The room serves as entrance to the locked Private
Quarters") and from this layout; it is inferred (I-07).

### 4.5 Opponents ("Encounters", `a2`), all nine

Fields as printed: name, SKILL/END/ATT, one-line description, special
skills with values, LOOT. Two blocks (Monk, Ogre) omit the words "Special
skill:" and simply list them. Values are read as Proficiencies in the
rulebook's sense (R76: added to Attack Strength, no ENDURANCE cost).

| # | Name | Description (verbatim) | SKILL | END | ATT | Special skills | LOOT |
|---|---|---|---|---|---|---|---|
| 1 | Devil servant | "Sneaky minion, easily frightened if alone (use the Oracle for the number of devils)" | 5 | 7 | 1 | Surround (3), Sneak attack (2) | 1-3 junk; 4-5 simple weapon; 6 [warning-triangle icon, no text] |
| 2 | Dexterous Ghost | "A spirit servant, quick yet clumsy." | 7 | 8 | 1 | evanescence (2), immaterial charge (4) | private quarter's key |
| 3 | Junior King Silver Horn | "Cunny demon, master swordsman. He takes orders only from his elder brother." | 9 | 15 | 1 | Shapeshifting (4), levitation (3) | seven-star sword |
| 4 | Monk | "Unlucky traveller with a vegetarian diet." | 4 | 5 | 1 | Curse (3), Exorcism (1) | 1-2 rosary; 3-4 baoding balls; 5-6 elixir |
| 5 | Ogre | "Half human brute with long fangs." | 6 | 13 | 3 | Bite (2), Sweep (1) | Spear |
| 6 | Old Vixen | "Animal spirit in the appearance of an old lady." | 8 | 5 | 1 | Tightening spell (4), charm (2) | Dazzling Golden Cord |
| 7 | Senior King Golden Horn | "Lord of the cave; sturdy demon with helmet, breast plate and a cloak of red silk." | 9 | 18 | 4 | Magic flames (4), Call to arms! (4) | Plantain fan |
| 8 | Skillful Beast | "A monsterlike devil with fighting quality, but not a sharp mind" | 7 | 13 | 5 | somersault leap (3), whirlwind attack (2) | private quarter's key |
| 9 | Woodgatherer | "They know the mountain, but living in a dangerous place made them irritable." | 5 | 8 | 5 | axe throwing (3), chopping strike (2) | Great Bear scripture [recited keeps beasts away] |

Treasure-table bands (R78) for these: Senior King 18 (17-19); all others 16
or less. The rulebook's Monk (SKILL 8, END 15) and the adventure's Monk
(4/5) are different stat blocks.

### 4.6 The five treasures (verbatim), `a2`

"Read this if you want to know the treasure's way of working:"

| Treasure | Effect | Where it is (derived from the areas and loot) |
|---|---|---|
| Gold and red gourd | "if opened it will swallow the sky, changing day to night. Close it to have the daylight back." | Storage room (Hint: "looks like an ordinary gourd bottle") - not any opponent's loot |
| Dazzling Golden Cord | "with a spell it moves to tie a person. Another spell unties. It can't be cut with normal weapons." | Old Vixen's loot; she "knows the spells to control" it |
| Vase of muttonfat jade | "remove the label and call out a person's name, if they respond they'll be trapped inside." | Attendants room ("on a pedestal a jade vase is guarded") - not any opponent's loot |
| Plantain Fan | "it creates magic-fire's waves inextinguishable using conventional methods." | Senior King Golden Horn's loot; the Chieftain quarter's screen shows "a fan wrapped in flames" |
| Seven-star sword | "magical and indestructible weapon. It can block hits from stronger enemies without any effort from the holder." | Junior King Silver Horn's loot |

The Chieftain quarter's sheets explain "how two of the treasures work" -
which two is not stated.

### 4.7 Credits (verbatim), `a2`

> License https://creativecommons.org/licenses/by-sa/4.0/
> Writing by Gianluca Monaco
> Icons: https://limofeus.itch.io/handdrawniconpack
> Cave map: https://watabou.itch.io/cave-generator

No artist is named for the icons or the map beyond those two itch.io pages;
the rulebook's Cristian Cammarata is not credited on the adventure.

## 5. Discrepancies: the Spark's reading against the sources

The operator's two rules sections in the Spark[^spark] were checked line by
line. Most of it is exact; what follows is every place the sources say
something different, more, or less. Confirmed-exact items are not listed.

| # | Spark says | Source says | Weight |
|---|---|---|---|
| D01 | "Opponents: forty-five stat blocks of SKILL, ENDURANCE, ATTACK and two Proficiencies." | **Fifty** stat blocks (§3.23); five have a single Proficiency ("Martial Arts (n)"); one (Brawler) has ATTACK "2-4"; one (Huang Feng Guai) has ATTACK blank.[^rulebook] | count wrong |
| D02 | "Deities on a d66 table." | A banded table: first d6 1-3 / 4-6, second d6 1-6 - **12 rows**, three columns (§3.6).[^rulebook] | shape wrong |
| D03 | "a d66 city-encounter table (connection and trait)" | Same banded shape, **12 rows** (§3.14).[^rulebook] | shape wrong |
| D04 | "a name from the d66 Action, Attribute, Animal table" (Final Blow) | The Final blow table is banded 1-2 / 3-4 / 5-6 x 1-6, **18 rows**, and is offered "For inspiration" - the name is the player's, with "a brief description" (R31, §3.4).[^rulebook] | shape wrong; name not mandatory |
| D05 | "Eighteen Martial Arts on a d66 table" | Eighteen entries on the same banded 1-2 / 3-4 / 5-6 x 1-6 layout - correct count, not a 36-cell d66 (§3.1).[^rulebook] | shape nuance |
| D06 | "Proficiency points to spend equal SKILL" | Equal to the **rolled** SKILL: Training deductions "without affecting the total points to be spent" (R10, R15; the p. 11 example spends 9 with a final SKILL of 7).[^rulebook] | omission |
| D07 | "Gambling House (bet resolved by 2d6 + LUCK against the Dealer's 2d6 + SKILL ...)" | Plus "any points from a Martial Proficiency that may help you" on the Master's side (R57).[^rulebook] | omission |
| D08 | "Techniques are immediate and usable in combat; Rituals need preparation." | Also: Wudang Quan "can use Rituals in combat" (R13) - a per-style exception the engine must carry.[^rulebook] | omission |
| D09 | "Opponents never spend ENDURANCE for Techniques or Rituals; their Proficiency value adds to their Attack Strength." | Two distinct rules: a Technique/Ritual value adds to Attack Strength; a "Martial Arts (n)" value is the points of **each** Proficiency of a rolled Martial Art (R75, R76). Practically equivalent for named Proficiencies.[^rulebook] | nuance |
| D10 | "Combat round: both sides roll Attack Strength = 2d6 + Proficiency + SKILL." | "one relevant Martial Proficiency (if any)" - exactly one, chosen for relevance (R23).[^rulebook] | nuance |
| D11 | "Appendix C eight pre-generated Masters 91 (images only, no extractable text)." | Heading on p. 91; the sheets are one image on p. 92. Rendered and transcribed in §3.25 - all eight are legible.[^rulebook] | page nuance; resolved |
| D12 | "Senior King Gold Horn" | The premise says "Gold Horn", the stat block "GOLDEN HORN"; the source itself is inconsistent.[^adventure] | naming |
| D13 | "The Monk in the kitchen pool is a prisoner to be rescued, not an enemy by default." | The Hint says he is "captured to be eaten"; but the Monk also has a full stat block among "Encounters" with a loot table (rosary / baoding balls / elixir). "Not an enemy by default" is a reading the source permits but does not state.[^adventure] | interpretation |
| D14 | "Special Items: 2d6 table of eleven items." / "Sparks: six d66 word tables." / "Oracle: a 1d6 table with rows for ..." / adventure Event table / nine opponents' numbers / treasures | All exact.[^rulebook][^adventure] | confirmed (listed so the check is visible) |

Not a discrepancy but worth the operator's eye: the Spark's "Multiple
combat: SKILL reduced by the number of opponents" is exact, yet the
Woodgatherer (ATT 5) and Skillful Beast (ATT 5) in the adventure make R37's
meaning matter more than the rulebook's own roster does (A05).

## 6. Ambiguities the engine must decide

Every place the text leaves the resolution to the player. Each row gives
the text's silence (known) and, where the Factor has a reading, an
inferred one with an `I-nn` id for the operator to confirm or reject.
Rows with no `I-nn` have no defensible inference from the sources alone.

### 6.1 Attributes and creation

| # | Ambiguity | Inferred reading |
|---|---|---|
| A01 | ENDURANCE zero: death or unconsciousness (R06). | `(inferred, I-01)` Opponent-dependent flag, default death; Shaolin Quan Masters (R13) make it unconsciousness for their opponents. |
| A02 | The starting weapon is free text ("even if not listed") and armed Proficiencies need "a weapon" (R68) - which weapons count for which style? | `(inferred, I-02)` Any item flagged `weapon` satisfies "Armed combat"; style-specific pairing (spear for Long weapons) is narrative-only. |
| A03 | "ignore damage from the first hit" (Drunken style) - first hit of the fight, or of the day? Requires alcohol - an item the Market does not list (no wine; Beggar So's sheet has "Wine bottle"). | `(inferred, I-03)` Per fight; alcohol is an inventory item obtained narratively or as a Common Item priced by R67. |
| A04 | Proficiency spending: must all rolled-SKILL points be spent? Can a Proficiency be left at 0? | `(inferred, I-04)` Points may be left unspent (Beggar So spends 8 of 12); 0 is allowed. |

### 6.2 Combat

| # | Ambiguity | Inferred reading |
|---|---|---|
| A05 | ATT/ATTACK for a **singular** named monster (Woodgatherer 5, Skillful Beast 5, Ogre 3, Senior King 4; rulebook Dapeng 10): "how many enemies can attack at the same time". | `(inferred, I-05)` The number of simultaneous attackers the encounter fields when the Oracle's "No. of enemies" or the narrative gives more than one; for a lone monster it is the multiple-combat SKILL penalty it imposes (an ATT-5 monster fights like five). Two readings; the operator must pick. |
| A06 | Multiple combat resolution: one Attack Strength roll per opponent against the Master's one roll, or one roll for the group? R35 only reduces SKILL. | `(inferred, I-06)` One Master roll; each attacking opponent (up to ATTACK) rolls; each comparison resolves as R24/R25 independently. |
| A07 | "Special" enemy attack (Oracle row) is undefined. | `(inferred, I-07a)` The opponent uses one of its listed Proficiencies this round, adding its value (R76). "Normal" = SKILL + 2d6 only. |
| A08 | "Ambush" versus "Attack" (Oracle Encounter Outcome): no mechanic distinguishes them. | `(inferred, I-08a)` Ambush = the opponent's first round is unopposed (Master takes the difference if the opponent's roll beats SKILL + 2d6 with no Proficiency), then normal rounds. |
| A09 | Final Blow's LUCK roll (R31): is it a LUCK check under R21 (LUCK -1 regardless) **plus** the stated -1 on failure, or does the failure penalty replace R21's decrement? | `(inferred, I-12)` R31 is self-contained: -1 only on failure, no decrement on success. |
| A10 | Which "one relevant Martial Proficiency" an **opponent** adds each round, when it has two. | `(inferred, I-21)` The higher, unless the narrative or a Special result selects the other. |
| A11 | Area Techniques: how many enemies "Butterfly Palms" (two), "Light Body" (all surrounding), "Exploding Qi" (repels), Double Strike (two, from the example) reach. | `(inferred, I-11)` Read the number from the prose: two / all / all / two. |
| A12 | Techniques as the winner's option (R25b) versus "immediate" use at any time (R14): can a Technique be used on a lost round, or outside the win? | `(inferred, I-23)` In combat only as the winner's option; outside combat at any time, always at ENDURANCE cost. |
| A13 | Gambling tie: "Whoever gets the highest score wins" - no tie rule. | `(inferred, I-13)` Push - stake returned. |
| A14 | Chaguan: "Continue until you win or abandon" - a fresh Concentration check each attempt? | `(inferred, I-14)` Yes; each failed check costs 1 ENDURANCE. |
| A15 | Unexpected Event rows 2-5, 9-12 have no mechanical effect stated (injury, weapon loss, environmental change, retreat, divine intervention). | `(inferred, I-30)` Minimum mechanical readings: weapon loss = remove the armed Proficiency bonus until "recover a weapon" (R25c); injury = -1d6 ENDURANCE; retreat = combat over, opponent gone; environmental change and divine intervention = narrative plus an Oracle roll. Every one is the operator's to set. |
| A16 | Minions rule (R33) is optional - on or off, and does "1-4 Minions" mean 1d4 (there is no d4 in a d6-only game)? | `(inferred, I-33)` Roll 1d6: 1-2 -> 1, 3 -> 2, 4 -> 3, 5-6 -> 4, or halve a d6 rounded up. |
| A17 | Escape: what counts as a "stratagem" (R38); is the -2 "last blow" itself "suffering damage" for Dishonor (R39)? | `(inferred, I-32)` Any Technique flagged `escape` (Monkey Jump, Void Boxing, Unicorn Step, Crane's flight, Somersault clouds ...) or a player-declared stratagem the Oracle approves; the -2 is damage, so an escape without one always scores 1 Dishonor. |
| A18 | Spirits/ghosts immune to ordinary blows (R77): no opponent is tagged. | `(inferred, I-29)` Tag: Gui, Ghost Pirate, First Abbot ("spirit"), Tutelary Spirit, Huli Jing ("fox spirit"), Yogi ("Incorporeal (4)"), Bai Gu Jing (demon - doubtful), Jiangshi (undead - doubtful); adventure: Dexterous Ghost, Old Vixen ("Animal spirit"). "Exceptional weapon": Lu Dongbin's sword (Special Item 6), the seven-star sword, Yin's "Magical sword". |
| A19 | Brawler ATTACK "2-4". | `(inferred, I-10)` 1d6: 1-2 -> 2, 3-4 -> 3, 5-6 -> 4. |
| A20 | Huang Feng Guai ATTACK blank (verified on the render). | `(inferred, I-09)` 1, the roster's mode (32 of the other 49 are 1); or 2, matching the other human-eater demons of its size. Operator's call. |
| A21 | Praying Mantis "finishing blow is always lethal" - does it change the Final Blow doubles roll, or only the outcome? | `(inferred, I-25)` Outcome only: a landed Final Blow by a Mantis Master kills (ENDURANCE to 0, death). |
| A22 | Training as "one of your Martial Proficiency" (R17): does its value add to Attack Strength? | `(inferred, I-22)` It adds to SKILL checks made to perform or resist Techniques/Rituals, not to Attack Strength; in Attack Strength a Technique is used, not rolled. |

### 6.3 Techniques, Rituals, items

| # | Ambiguity | Inferred reading |
|---|---|---|
| A23 | All 72 Technique/Ritual effects are prose without numbers (§3.2, §3.3) - the central design question. | No single inference. A classification the operator could adopt: **mechanical** (Body and Mind balance, Punishing the sky, Vital Breath, Chain Fists, Butterfly Palms, Light Body, Lord of the Bow, Iron Shirt), **combat-narrative** (knock-downs, intimidation, immobility, indestructibility - resolved as an Opening or an escape per R28), **exploration** (climb, swim, run on water, find the way, weather - resolved as gating like R69), **oracle-like** (Book of Changes, Acting without acting, Wheel of Existence, The Way of Tao - resolved by Oracle/Sparks rolls), **summoning** (Protective Demon, Older Brother, Eight Celestial Drunkards - a companion or an Unexpected-Event-like table). Each Technique needs a hand-authored effect record. |
| A24 | Rituals "require preparation time" - unquantified; Wudang excepted. | `(inferred, I-24)` Not usable during combat rounds; usable in any scene, costing a scene (or a Rest event). |
| A25 | "Spirit to flesh" / "Spirit-Summoning Fist" refer to spirits and fatal strikes; "Punishing the sky" revives with "reduced ENDURANCE" - how much? | `(inferred, I-28)` Revive at half initial ENDURANCE, rounded down. |
| A26 | Special Item 7 "restores LUCK and increases it by 1": restores to the initial value (R05) then +1, capped at 12 (R45)? | `(inferred, I-46)` Yes: LUCK = min(12, initial + 1); initial is raised too. |
| A27 | Special Item 9 "ignore the next fatal blow"; seven-star sword "block hits from stronger enemies without any effort". | `(inferred, I-44)` Feather: the first time ENDURANCE would reach 0, it stays at 1, item consumed. Sword: when the opponent's Attack Strength is higher, the Master takes no damage; the sword does nothing on the Master's wins. |
| A28 | Healing "eating a meal" (+4): how often? Rations cost 5 GP per day. | `(inferred, I-48)` Once per day, consuming a Rations unit. |
| A29 | Health Elixir is +4 ENDURANCE (R41) and the adventure's Monk drops an "elixir". | `(inferred, I-56)` Same item. |
| A30 | Loot "junk", "simple weapon", "rosary", "baoding balls", "Great Bear scripture [recited keeps beasts away]" - none are Market or Special items. | `(inferred, I-43)` junk = 0 GP flavour; simple weapon = any weapon of 5 GP or less (Dagger, Long staff, Dart, Rope Dart); rosary = a Common Item (Protection Amulet analogue) not the Special Item 2; scripture = while carried, "Beast"-type encounters (Beast, Ogre?) are avoided - which creatures are "beasts" is open. |
| A31 | Treasure roll trigger "If you believe" (R78). | `(inferred, I-30b)` Always offered after a victory; the player may decline. Which "Common Item" drops: roll 1d6+1d6 over the 14-item list or let the player pick under a price cap. |
| A32 | Expedition gating (R69) is only exemplified (rope/climb, flint/fire). | Needs an authored action->item map; the Spark already lists this as a requirement. |

### 6.4 Exploration, cities, oracle

| # | Ambiguity | Inferred reading |
|---|---|---|
| A33 | Region generation is a physical dice scatter (R52); distance is "arbitrary" (R53). | `(inferred, I-15)` Replace with N random points on a plane (N = "a handful", say 5-8), each rolling the five columns; distance in scenes = rounded Euclidean distance over a chosen unit. |
| A34 | Event outcomes "Rest", "Effect Expiration", "Weather/Conditions Change", "Hint", "Free Exploration" are never defined. | `(inferred, I-17)` Rest = a night's rest (R40) available; Effect Expiration = any timed Technique/Ritual/item effect ends; Weather Change = re-roll a weather descriptor (God of Rain, Han Xiangzi's flute interact); Hint = an Inspirations roll shown to the player; Free Exploration = no event, player chooses. |
| A35 | Monastery "Openings" 1-4. | `(inferred, I-18)` Number of exits from the location, each leading to a newly rolled location. |
| A36 | Encounter matrix italic *Supernatural* cells. | `(inferred, I-19)` Roll on the Supernatural column. |
| A37 | Oracle rows are prose: "No, and", "Disaster", "Territorial", "One more" ... and the Spark's question 3 (narration model) sits here. | Not resolvable from the sources; the book delegates it explicitly. |
| A38 | Oracle "No. of enemies" 1d6 for Minion; "Enemy Type" for named opponents (is a Shi Gong a Boss?). | `(inferred, I-47)` Enemy Type is only consulted when the encounter is not already named by a table. |
| A39 | Central District entry ("will not be easy"), City Walls ("very difficult"), Market resale ("skilled negotiator") - no checks defined. | `(inferred, I-54)` SKILL checks with a relevant Proficiency (Charisma, Go unnoticed, Stealth, Negotiate-like), at a flat -2 for "very difficult" - numbers are invented. |
| A40 | Temple "Abusing the patience of the gods": how many checks per visit before "the opposite effect"? | `(inferred, I-58)` One successful check per Temple per day; a second attempt the same day risks -1 LUCK on failure. |
| A41 | Which SKILL selects the XP band (R44): current, or initial? Advancement "at the end of each adventure" - what is an adventure's end in a sandbox? | `(inferred, I-53)` Current SKILL at spend time (the example uses current); adventure end is a player-declared close (Cinematic Journey's Resolution). |
| A42 | XP category scores are self-assessed (R43). | `(inferred, I-52)` The UI asks the player four 1-3 questions; no automated scoring. |

### 6.5 The 5 Treasures

| # | Ambiguity | Inferred reading |
|---|---|---|
| A43 | What "Hint" reveals on a 6 - the current area's grey paragraph, presumably; and the note says the Hint may also be read when "your PG gets information about the area" (from whom?). | `(inferred, I-06b)` The area's Hint paragraph; "information" = any Oracle "Yes"-class answer to a question about the area, or an NPC (the Monk, the Old Vixen) reaction of Kind/Helpful. |
| A44 | Devil servant loot on a 6 is the warning-triangle icon with no text (verified at 5x). | `(inferred, I-08)` A Hint: the servant reveals the Hint of the area it was met in (or of an adjacent area). The same icon marks every Hint on both pages. |
| A45 | The locked Private Quarters: which areas, and does the key gate both? Both the Dexterous Ghost and the Skillful Beast carry "private quarter's key". | `(inferred, I-07)` Chieftain quarter and Women quarter, both behind the Attendants room (map, §4.4); one key opens both; two copies exist because either attendant may be met alone. |
| A46 | Areas whose Encounters line has no dice (Storage, Kitchen: "Devil servants"; Women quarter: "Old Vixen and she-Devil servant"): fixed encounter on any Ambush/Encounter result. Number of devils "use the Oracle". | `(inferred, I-34)` Fixed; count from the Oracle "No. of enemies" row (Minion -> 1d6). The she-Devil servant uses the Devil servant block. |
| A47 | "Both" (Attendants room 5-6) = Skillful Beast and Dexterous Ghost together. | Known; multiple combat with two opponents (R35). |
| A48 | Chieftain quarter "Empty" (5-6) on an Ambush/Encounter event. | `(inferred, I-36)` No encounter; the event degrades to Safe exploration. |
| A49 | The adventure's Event roll "every time you enter an area" - re-entry included; opponents defeated earlier - do they respawn? | `(inferred, I-33b)` Re-entry rolls again; a named opponent (the Kings, the Vixen, the Ghost, the Beast) once defeated is removed from that area's table (re-roll or treat as Empty); Devil servants, Ogres and Woodgatherers are unlimited. |
| A50 | Is the Monk an enemy? He has SKILL/END/ATT, special skills and loot. | `(inferred, I-39)` An NPC with a stat block: fightable if the player attacks; otherwise a rescue whose reward is the loot roll. Killing him should score Dishonor or a Mission Success 1 - the source is silent. |
| A51 | "Call to arms! (4)" (Senior King), "Surround (3)", "Sneak attack (2)", "Shapeshifting (4)", "evanescence (2)", "immaterial charge (4)", "Magic flames (4)", "Tightening spell (4)", "charm (2)" - effects are names only. | `(inferred, I-37)` All are R76 Attack-Strength bonuses; "Call to arms!" additionally reads as Unexpected Event 7 (reinforcements: 1-4 Devil servants). Names only. |
| A52 | Junior King "would take a nap here if he overdrank wine"; Ogres "go out hunting once a day": the adventure has a clock and states, the rulebook has none. | `(inferred, I-40)` A day/night flag (the gourd toggles it) and per-area state flags; "overdrank" is a player-caused state (bring wine). |
| A53 | The gourd "changing day to night" - what does night do mechanically? | `(inferred, I-45)` Sets the day/night flag; the Cave entrance's Ogres are absent by night (they hunt "once a day"); otherwise narrative. |
| A54 | The vase: "call out a person's name, if they respond" - an Oracle Closed Question. | `(inferred, I-38)` Yes-class answer = trapped (opponent removed); the jade vase and the gourd are picked up by exploration, not loot. |
| A55 | Which two treasures the Chieftain's sheets explain. | `(inferred, I-38b)` The fan (depicted on his screen) and the gourd (the one that "looks ordinary") - a guess. |
| A56 | The cave map's adjacency and the unmarked chamber. | `(inferred, I-42)` §4.4; the unmarked chamber is the Cave entrance's inside. |
| A57 | Woodgatherers (plural, "They") with ATT 5: a group of five? | `(inferred, I-05b)` Yes - a band of woodgatherers, each 5/8/-, five attacking at once; consistent with I-05. |
| A58 | The Old Vixen's "spells to control the Dazzling Golden Cord": can the Master learn them (a Ritual?) without her? | `(inferred, I-41)` The Cord is inert loot until the spells are known: from her (Kind/Helpful reaction), or from the Chieftain's sheets (A55). |
| A59 | "Great Bear scripture [recited keeps beasts away]" - which encounters are beasts in the cave? | `(inferred, I-43b)` Ogre and Skillful Beast ("monsterlike devil") - or none; the operator decides. |
| A60 | Monk loot "elixir" and "rosary" versus Special Item 2 "rosary of Amitabha Buddha". | `(inferred, I-56)` Plain items, not the Special Item. |
| A61 | Encounter with "Junior King" at the Flat-top mountain (6) or Cave entrance (5-6) before the cave: the same Junior King as in the Dining Hall - one entity in several tables. | `(inferred, I-33c)` One entity; defeating him anywhere removes him everywhere; his sword drops once. |
| A62 | The "PG" in "if your PG gets information" is the Italian *personaggio giocante* (player character). | `(inferred, I-59)` = the Master. |
| A63 | Hints are "read this part only if" - in an app, the Hint text is hidden until earned; the Treasures section is likewise "Read this if you want to know" - spoiler-gated. | `(inferred, I-60)` Hidden by default; revealed per area by Event 6 / I-06b; the treasure effects revealed on acquiring or on the Chieftain's sheets. |

## 7. What was looked for and not found; what could not be verified

**Looked for and not found (in either source):**

- A blank Master's sheet or record sheet; none in the extraction, and the
  chapter-divider pages (PDF 5, 21, 33, 41, 57, 65) were not rendered, so a
  sheet printed as an image there would have been missed.
- A definition of "Special" enemy attack, of "Ambush" as distinct from
  "Attack", of the Event outcomes Rest / Effect Expiration / Weather Change
  / Conditions Change / Hint / Free Exploration, or of "Openings".
- Any numeric effect for 69 of the 72 Techniques and Rituals (§3.2, §3.3).
- A tie rule for the Gambling House; a cap on ENDURANCE; a rule for which
  SKILL value picks the XP band; a duration for Rituals' "preparation".
- Any rule text on how many opponents attack in a round beyond R37; any
  worked example of multiple combat with ATTACK > 1.
- Alcohol or wine in the Market (Drunken style needs it).
- A definition of "beasts" for the Great Bear scripture, of "junk" or
  "simple weapon", or the Devil servant's loot on a 6 (an icon only).
- Which two treasures the Chieftain's sheets explain.
- A date of publication or version in either PDF (metadata carries only
  the Google Docs producer string and titles "MH_Full_Itchio.docx" and "NEW
  The 5 treasures").
- Heroic Havoc, the parent game, whose rules might settle several
  ambiguities; it is outside the record and was not consulted.

**Could not be verified, or verified only visually:**

- Huang Feng Guai's ATTACK: blank in the extraction **and** on the 1.5x
  render of p. 74 - the bullet reads "ATTACK" with no number. Known blank,
  not an extraction artefact.
- The Devil servant's loot on a 6: the warning-triangle Hint icon, verified
  at 5x; no text.
- The eight pre-generated Masters: an image on p. 92, unreadable at 1.5x,
  read at 4x in four strips; every field in §3.25 was legible, but "CHamber"
  and "mount" are as printed, not transcription slips, and the sheets do
  not say which Techniques cost what - the resource arithmetic in §3.25 is
  the Factor's.
- The cave map's room adjacency (§4.4): inferred from drawn passages on a
  hand-styled render with no doors or labels; the Dining Hall-Kitchen and
  unmarked-chamber-Dining Hall links are the least certain.
- Column spans in the Oracle table (§3.16) and the Treasures table: read
  from alignment, marked `(span inferred)` where so.
- Pinyin spellings are reproduced as printed ("Hou Zung", "Shui Lang Qui",
  "Ti Cheng Chui", "San Sing Quan", "Chiayi", "Ui Jiu Ba Xian", "Fa jing");
  several are non-standard and were not corrected or checked against any
  romanisation table.
- The rulebook's page references to itself are all one folio off from a
  PDF viewer's numbering (p. 53 weapon table is PDF 54); nothing in the text
  contradicts its own index.

[^rulebook]: `sources[].id = rulebook` - Martial Havoc, MH_Full_Itchio.pdf, cited by printed folio (PDF page = folio + 1).
[^adventure]: `sources[].id = adventure` - The 5 Treasures, The-5-treasures.pdf, pages `a1` and `a2`.
[^rulebook-txt]: `sources[].id = rulebook-txt` - the pdf-parse extraction, used for prose; superseded by the render wherever layout mattered.
[^adventure-txt]: `sources[].id = adventure-txt` - the pdf-parse extraction of the adventure.
[^spark]: The operator's Spark, `ideas/0003-martial-havoc-mobile-edition/artifacts/0001-martial-havoc-mobile-edition-spark.md` (this artifact's `inputs[0]`).
