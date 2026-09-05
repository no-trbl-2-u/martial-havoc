---
type: Index
title: "Rules"
description: "Index of the rules of play of Martial Havoc: how a Master is made, how actions and combat resolve, how the world is explored, and the readings where the text leaves a decision open."
tags: [rules, index]
cite: "MH p.1"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.1"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, sections 0, 2, 5, 6, 7"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Rules

`rules/` holds HOW PLAY WORKS: the procedures of Gianluca Monaco's Martial
Havoc, one concept per chapter of the rulebook, each rule kept as an
inventory row `R-nn` with its printed folio. `world/` holds what exists
(Martial Arts, Techniques, Rituals, Deities, Opponents, the Market, the
Oracle and word tables, the pre-generated Masters); `campaigns/` holds
adventures (the 36 hooks and The 5 Treasures). Citations are printed
folios; PDF page = folio + 1. The material is CC BY-SA 4.0 by Gianluca
Monaco.

Every rule row carries an enforceability class from the inventory:
**mechanical** (state plus a check; the engine can enforce it fully),
**conditional** (a mechanical part triggered or parameterised by a judgment
the text leaves to the player), **narrative-only** (the engine can at most
surface it), **guidance** (the author's advice; ignoring it breaks no
rule). The book says of itself (p. 3): "Some terms or mechanics are
intentionally ambiguous to encourage player interpretation." Where a rule
is conditional, the `readings/` concepts record the question and the
inventory's inferred answer, id `I-nn`, for the operator to confirm or
reject.

# Procedures

* [Master Creation](master-creation.md) - How a Master is built: schema, starting equipment, social status, the three attributes, Martial Art and Proficiency spending, Training and its Resource points, and the two worked examples. (R01-R19, p. 5-19)
* [Actions](actions.md) - The two resolution rolls outside combat: the SKILL check against SKILL plus a relevant Proficiency, and the LUCK check that costs one LUCK whatever the result. (R20-R22, p. 22)
* [Combat](combat.md) - The combat round: opposed Attack Strength, the winner's four options, Techniques in combat, Openings, the Final Blow and its naming table, the Unexpected Event on a tie and its 2d6 table. (R23-R34, p. 23-29)
* [Multiple Combat, Escape and Healing](multiple-combat-escape-healing.md) - Fighting several opponents at once (SKILL minus their number, area damage, the ATTACK attribute), fleeing a fight and its Dishonor cost, and how SKILL, ENDURANCE and LUCK recover. (R35-R42, p. 30-31)
* [Experience and Advancement](experience-and-advancement.md) - End-of-adventure XP from four self-scored categories minus Dishonor, the XP cost table by SKILL band, the caps on SKILL and LUCK, and buying Training for new Techniques and Rituals. (R43-R49, p. 34-35)
* [Exploration](exploration.md) - The seven-step exploration loop, generating a region by scattering dice, distances and routes, road features, and generating a monastery location by location. (R51-R56, p. 42-45)
* [Cities](cities.md) - The seven city locations and their procedures: the Gambling House bet, the Temple's LUCK recovery, the Chaguan game, the narrative-only districts, the City Services price list and the City encounters table. (R57-R65, p. 46-51)
* [Oracle Procedure](oracle-procedure.md) - When and how the Oracle's 1d6 rows, the two d66 Inspirations tables and the six Sparks tables are consulted, and which rules elsewhere call each row. (R71-R73, p. 58-63)
* [Encounters](encounters.md) - Rolling a random opponent on the 2d6 encounter matrix by terrain column, how opponent Proficiencies and Martial Arts values enter combat, incorporeal opponents, and the opponent stat-block schema. (R74-R77, R80, p. 66-67, 70-79)
* [Treasures and Special Items](treasures-and-special-items.md) - The 1d6 treasure roll after a victory, banded by the defeated opponent's ENDURANCE, and the 2d6 Special Items table it can call, with each item's verbatim effect. (R78-R79, p. 68-69)

# Readings

* [Readings](readings/) - Every place the text leaves a decision to the player (inventory sections 5, 6 and 7): the ambiguities with the inventory's inferred readings `I-nn`, the discrepancies between the operator's Spark and the sources `D-nn`, and what was looked for and not found.

# Rules held outside rules/

Rows of the inventory's section 2 whose home is a `world/` or `campaigns/`
concept, listed so the R-nn sequence stays traceable from here:

* R50 (Adventures, p. 36-39): the d66 table of 36 hooks - [Adventure Hooks](../campaigns/adventure-hooks.md).
* R66-R70 (Market, p. 52-55): 1 GP = 10 SP; pricing unlisted items by analogy; armed Proficiencies add nothing without a weapon; expedition equipment gates actions; armor has no dice effect - [Market](../world/market.md). R68 is consumed by [Combat](combat.md) and [Master Creation](master-creation.md).
* R81-R84 (Appendices, p. 81-93): the open-system invitation, the Cinematic Journey three-act frame ([Cinematic Journey](../world/cinematic-journey.md), guidance), the eight pre-generated sheets ([Pre-generated Masters](../world/pregenerated-masters.md)), and the CC BY-SA 4.0 licence ([Licence and Credits](../licence-and-credits.md)). R81, R82 and R84 are guidance and obligation, not rules of play.
