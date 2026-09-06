# design/

The design layer Phase 8 (The UI) integrates. `skills/ship-a-phase.md`
Step 3 reads this file first.

| File | What it is | Provenance |
|---|---|---|
| `V1-DESIGN-PROMPT.md` | The prompt handed to claude.ai/design: five design-system options, three screens each | Written 2026-09-05 from `spec.md` and `plan/bearings.md` |
| `screenshots/*.png` | The playthrough: sixteen 390 x 844 frames at 2x, one per screen and state, on named dice. The visual baseline Phase 8 starts from. Regenerate with `npm run build:web && npm run screenshots` (`e2e/screenshots/playthrough.spec.ts`; not a verify leg, since fonts differ per machine) | Generated 2026-09-06 from commit d17d46e and after |
| `prototype/martial-havoc-prototype.dc.html` | The operator's chosen prototype: the woodblock direction (option 4 of the prompt) as one working phone frame with four screens - the beat, combat, the rules panel, the region | Exported 2026-09-06 from Claude Design project `20b14fd3-4e84-4d7b-a540-40f5ff6b2b43`, file `Martial Havoc Prototype.dc.html`. The `support.js` it loads is Claude Design's generated runtime and is not kept here. |

## What the prototype decided

- **Layout** (the Phase 8 `[needs-user-call]`): one frame, a binding
  strip on the left, the attribute strip under the header, the menu as a
  column of bordered slips, the roll bar at the bottom. The operator
  chose it by handing it over; the commit that implements it records the
  choice.
- **Palette**: paper `#FBF3E1`, ink `#16110C`, ochre `#C1873A`, binding
  `#A87030`, vermilion `#8E2417`, dim `#3A2A12`, disabled `#E4D6B4`,
  frame `#8E6428`. Ink borders of 3px; dashed borders for what is
  optional or ours.
- **Type**: system sans for labels (heavy, tracked, uppercase), a serif
  for authored lines, a monospace for citations and numbers.
- **Labels**: rule is ink on paper, reading is vermilion, invention is a
  dashed border; the app adds a glyph to each (R, I, +) so the three
  read without colour.

## Where the prototype and `docs/` disagree

Standing rule 9: `docs/` wins. Recorded so a later design pass can
correct the file.

- The prototype shows a fifth attribute, Spirituality (`SPR`). The
  Master has three (R01, R04); Spirituality is a kind of check (R58),
  and San Te carries it as a Proficiency. The app shows four cells.
- The prototype's Morale is 2d6 with "7 or under holds". The sealed
  rule (`spec.md`) is a d6: 1-3 flee, 4-5 cautious retreat, 6 rally.
  The app rolls the sealed table.
- The prototype's areas (a stone bowl, a low gallery, a spill) are not
  the cave's. The app uses the printed area names (5T a1) with authored
  lines of ours.
- The prototype's Ghost is SKILL 5, END 6, INCORPOREAL 2. The Dexterous
  Ghost is SKILL 7, END 8, evanescence (2), immaterial charge (4) (5T a2).
