---
type: Table
title: "Inspirations"
description: "The two d66 Inspirations tables (pp. 59-60), Action and Theme, 36 words each, combined to answer an open question or to supply a stimulus."
tags: [world, inspirations]
cite: "MH p.59-60"
sources:
  - id: rulebook
    resource: ../sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction), p.59-60"
    author: human:gianluca-monaco
  - id: inventory
    resource: ../sources/estate-inventory.md
    title: "Estate inventory of the rulebook, sections 3.17 and 3.18"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Inspirations

"Inspiration can be invoked in the following cases: 1. You want to ask the Oracle an open question. 2. You are looking for a stimulus or suggestion. Inspirations are used to suggest a discovery, an event, a character goal, or a situation. Combine the rolls on both of the following tables to provide an action and a subject. Then, interpret the result based on the context of the question and your current situation." (p. 59).[^rulebook]

Roll d66 on each table: the first die selects the row, the second the column. Closed questions go to the [Oracle](oracle.md); single random words to the [Sparks](sparks.md).

# Action (p. 59), d66

| d66 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 1 | Attack | Investigate | Search | Close | Avoid | Save |
| 2 | Defend | Create | Climb | Treat | Influence | Betray |
| 3 | Explore | Heal | Throw | Jump | Examine | Overcome |
| 4 | Talk | Meet | Hide | Sleep | Give up | Enrich |
| 5 | Fight | Negotiate | Disguise | Protect | Create illusions | Communicate |
| 6 | Escape | Travel | Open | Pursue | Evoke | Challenge |

# Theme (p. 60), d66

| d66 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 1 | Adventure | Choice | Conflict | Betrayal | Honor | Blessing |
| 2 | Magic | Rebellion | Friendship | Rescue | Power | Curse |
| 3 | Mystery | Spirituality | Survival | Discovery | Faith | Redemption |
| 4 | Fight | Secret | Treasure | Death | Revelation | Courage |
| 5 | Exploration | Deception | Research | Revenge | Technique | Destiny |
| 6 | Encounter | Mission | Horoscope | Freedom | Darkness | Tradition |

# Notes

- The flattened extraction breaks "Communicate", "Redemption", "Revelation" and "Technique" across lines; the whole words were read from the render.[^inventory]
- "Fight", "Escape", "Encounter", "Exploration" and "Technique" are also game terms; the tables use them as ordinary words.

# Engine notes

Rules rows that consume these tables (see [oracle procedure](../rules/oracle-procedure.md), [exploration](../rules/exploration.md)):

- R72 Inspirations: roll Action and Theme, combine, interpret; a mechanical roll with narrative-only content.
- R51 step 7 ("when in doubt, Oracle") and R71, where the question is open rather than closed.

Readings that bear on them:

- I-17 (the undefined Event outcome "Hint" = an Inspirations roll shown to the player), A37 (the narration model is the operator's): [exploration, cities, oracle](../rules/readings/exploration-cities-oracle.md).
- A23 (oracle-like Rituals such as Book of Changes and Acting without acting resolve by Oracle or Sparks rolls; an Inspirations pair serves the "two random events" of Acting without acting): [techniques, rituals, items](../rules/readings/techniques-rituals-items.md).

[^rulebook]: Martial Havoc rulebook, pp. 59-60 (pdf-parse extraction; folio = PDF page - 1).
[^inventory]: Estate inventory, sections 3.17 and 3.18, row R72.
