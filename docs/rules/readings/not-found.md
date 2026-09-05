---
type: Reading
title: "Readings: Not Found"
description: "What the inventory looked for in the two sources and did not find, and what it could verify only visually or not at all."
tags: [rules, readings, gaps]
cite: "MH p.1-93; The 5 Treasures a1-a2; inventory 7"
sources:
  - id: rulebook
    resource: ../../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.1-93"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, section 7"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Readings: Not Found

Inventory section 7, verbatim. These are absences, not readings: each item
was searched for in the rulebook and the adventure and is not there, or is
there only as an image or an alignment that had to be read visually. An
engine that needs any of them must invent it, labelled as such.

# Looked for and not found (in either source)

| Id | Question the text leaves open | The inventory's reading | Cite |
|---|---|---|---|
| NF-01 | A blank Master's sheet or record sheet; none in the extraction, and the chapter-divider pages (PDF 5, 21, 33, 41, 57, 65) were not rendered, so a sheet printed as an image there would have been missed. | Not found; the schema is R01 in [Master Creation](../master-creation.md). | MH p.4, 20-21, 32-33, 40-41, 56-57, 64-65 |
| NF-02 | A definition of "Special" enemy attack, of "Ambush" as distinct from "Attack", of the Event outcomes Rest / Effect Expiration / Weather Change / Conditions Change / Hint / Free Exploration, or of "Openings". | Not found; readings [I-07a](./combat.md), [I-08a](./combat.md), [I-17](./exploration-cities-oracle.md), [I-18](./exploration-cities-oracle.md). | MH p.43, 45, 58 |
| NF-03 | Any numeric effect for 69 of the 72 Techniques and Rituals (§3.2, §3.3). | Not found; [A23](./techniques-rituals-items.md) has no single inference. | MH p.12-19 |
| NF-04 | A tie rule for the Gambling House; a cap on ENDURANCE; a rule for which SKILL value picks the XP band; a duration for Rituals' "preparation". | Not found; readings [I-13](./combat.md), [I-53](./exploration-cities-oracle.md), [I-24](./techniques-rituals-items.md); no ENDURANCE cap anywhere. | MH p.11, 34-35, 46 |
| NF-05 | Any rule text on how many opponents attack in a round beyond R37; any worked example of multiple combat with ATTACK > 1. | Not found; readings [I-05](./combat.md), [I-06](./combat.md). | MH p.30 |
| NF-06 | Alcohol or wine in the Market (Drunken style needs it). | Not found; reading [I-03](./attributes-and-creation.md). | MH p.7, 52-55 |
| NF-07 | A definition of "beasts" for the Great Bear scripture, of "junk" or "simple weapon", or the Devil servant's loot on a 6 (an icon only). | Not found; readings [I-43](./techniques-rituals-items.md), [I-43b](./the-5-treasures.md), [I-08](./the-5-treasures.md). | a2 |
| NF-08 | Which two treasures the Chieftain's sheets explain. | Not found; reading [I-38b](./the-5-treasures.md) is a guess. | a2 |
| NF-09 | A date of publication or version in either PDF (metadata carries only the Google Docs producer string and titles "MH_Full_Itchio.docx" and "NEW The 5 treasures"). | Not found; `last_modified` is omitted rather than guessed. | PDF metadata |
| NF-10 | Heroic Havoc, the parent game, whose rules might settle several ambiguities; it is outside the record and was not consulted. | Not consulted. | MH p.3, 93 |

# Could not be verified, or verified only visually

| Id | Item | What was established | Cite |
|---|---|---|---|
| NV-01 | Huang Feng Guai's ATTACK: blank in the extraction **and** on the 1.5x render of p. 74 - the bullet reads "ATTACK" with no number. | Known blank, not an extraction artefact. Reading [I-09](./combat.md). | MH p.74 |
| NV-02 | The Devil servant's loot on a 6: the warning-triangle Hint icon, verified at 5x; no text. | Known icon; reading [I-08](./the-5-treasures.md). | a2 |
| NV-03 | The eight pre-generated Masters: an image on p. 92, unreadable at 1.5x, read at 4x in four strips; every field in §3.25 was legible, but "CHamber" and "mount" are as printed, not transcription slips, and the sheets do not say which Techniques cost what - the resource arithmetic in §3.25 is the Factor's. | Transcribed in [Pre-generated Masters](../../world/pregenerated-masters.md). | MH p.92 |
| NV-04 | The cave map's room adjacency (§4.4): inferred from drawn passages on a hand-styled render with no doors or labels; the Dining Hall-Kitchen and unmarked-chamber-Dining Hall links are the least certain. | Reading [I-42](./the-5-treasures.md). | a1 |
| NV-05 | Column spans in the Oracle table (§3.16) and the Treasures table: read from alignment, marked `(span inferred)` where so. | [Oracle](../../world/oracle.md); [Treasures and Special Items](../treasures-and-special-items.md). | MH p.58, 68 |
| NV-06 | Pinyin spellings are reproduced as printed ("Hou Zung", "Shui Lang Qui", "Ti Cheng Chui", "San Sing Quan", "Chiayi", "Ui Jiu Ba Xian", "Fa jing"); several are non-standard and were not corrected or checked against any romanisation table. | As printed in [Techniques](../../world/techniques.md) and [Rituals](../../world/rituals.md). | MH p.12-19 |
| NV-07 | The rulebook's page references to itself are all one folio off from a PDF viewer's numbering (p. 53 weapon table is PDF 54); nothing in the text contradicts its own index. | Citations throughout `rules/` use the printed folio; PDF page = folio + 1. | MH p.1 |

The NF and NV ids are this file's, for reference; the inventory numbers
neither list.
