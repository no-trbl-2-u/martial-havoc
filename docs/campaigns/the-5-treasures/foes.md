---
type: Table
title: "The 5 Treasures: foes"
description: "The nine stat blocks printed under 'Encounters' on page a2 - name, SKILL, END, ATT, description, special skills and LOOT - as one table."
tags: [campaigns, the-5-treasures, opponents]
cite: "5T a2"
sources:
  - id: adventure
    resource: ../../sources/The-5-treasures.extracted.txt
    title: "The 5 Treasures (pdf-parse extraction), page a2"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../../sources/estate-inventory.md
    title: "Estate inventory, section 4.5"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

Fields as printed: name, SKILL/END/ATT, one-line description, special
skills with values, LOOT. Two blocks (Monk, Ogre) omit the words "Special
skill:" and simply list them. Values are read as Proficiencies in the
rulebook's sense (R76: added to Attack Strength, no ENDURANCE
cost).[^inventory] Dice in LOOT lines are printed as pip glyphs and
written here as numbers. Descriptions are verbatim.[^adventure]

# The nine stat blocks

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

# Where each is met

From the areas' Encounters lines ([areas](areas.md)):

| Foe | Areas |
|---|---|
| Devil servant | Cave entrance (1); Dining Hall (1-4); Storage room and Kitchen (fixed, "Devil servants"); Women quarter (the she-Devil servant) |
| Dexterous Ghost | Attendants room (3-4, and 5-6 "Both") |
| Junior King Silver Horn | Flat-top mountain (6); Cave entrance (5-6); Dining Hall (5) |
| Monk | Kitchen (the tied-up man, by the Hint) |
| Ogre | Flat-top mountain (4-5); Cave entrance (2-4) |
| Old Vixen | Women quarter (fixed) |
| Senior King Golden Horn | Dining Hall (6); Chieftain quarter (1-4) |
| Skillful Beast | Attendants room (1-2, and 5-6 "Both") |
| Woodgatherer | Flat-top mountain (1-3) |

# Notes

- Treasure-table bands (R78) for these: Senior King 18 (17-19); all others
  16 or less.[^inventory]
- The rulebook's Monk (SKILL 8, END 15) and the adventure's Monk (4/5) are
  different stat blocks.[^inventory]
- The premise spells the elder "Gold Horn"; his stat block "GOLDEN HORN" -
  both are in the source.[^inventory]
- Both the Dexterous Ghost and the Skillful Beast carry "private quarter's
  key": one key opens both Private Quarters; two copies exist because
  either attendant may be met alone `(inferred, I-07)`.[^inventory]
- The Devil servant's LOOT on a 6 is the warning-triangle icon with no
  text (verified at 5x); read as a Hint `(inferred, I-08)`.[^inventory]

# Engine notes

- Phase 3 (engine core): the nine blocks are opponents in the same shape
  as the rulebook's 50 ([opponents](../../world/opponents.md)), with SKILL,
  ENDURANCE, ATTACK and named Proficiencies; special skills are R76
  Attack-Strength bonuses, names only `(inferred, I-37)`, with "Call to
  arms!" additionally read as Unexpected Event 7 (reinforcements).
  Multiple combat (R35) for "Both", for the woodgatherer band `(inferred,
  I-05b)` and for Devil servants counted by the Oracle `(inferred, I-34)`.
  Loot resolves through the Treasure roll by ENDURANCE band (R78,
  [treasures and special items](../../rules/treasures-and-special-items.md))
  where the block gives dice or junk, and as the named item where it names
  one.
- Phase 5 (the adventure format and The 5 Treasures): foes as a field of
  the adventure file; the Junior King as one entity across tables, his
  sword dropping once `(inferred, I-33c)`; named foes removed once defeated
  `(inferred, I-33b)`; the Monk as a rescue with Dishonor on attack
  `(inferred, I-39)`; the Monk's rosary and elixir as plain items, not the
  Special Item `(inferred, I-56)`; the Great Bear scripture's "beasts"
  `(inferred, I-43b)`.
- All readings: [the 5 treasures readings](../../rules/readings/the-5-treasures.md).

[^adventure]: The 5 Treasures (pdf-parse extraction), page a2
[^inventory]: Estate inventory, section 4.5
