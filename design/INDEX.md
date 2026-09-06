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

## The beat's layout — decided 2026-09-06 (v1)

The build plan's Phase 8 row carried `[needs-user-call]`: *"the agent
renders three layouts at phone width with a working beat and files
them; the operator picks; the agent builds it."* That happened.

Three candidates were built on the real engine and the real content,
identical in data and in tokens, differing only in arrangement, and
photographed at 390x844 in `design/screenshots/layouts/`:

| | Layout | The bet | The cost |
|---|---|---|---|
| A | **Scroll** — line, result, scrolling menu, roll bar at the foot (the Phase 5 prototype's arrangement) | The authored line is the point; the player reads before they act | On a long line the menu falls below the fold; the primary action is a thumb-stretch from the top |
| **B** | **Sheet** — the line scrolls alone in the upper page; the menu is a fixed bottom sheet above the roll bar; a result overlays the sheet's top rather than pushing it | Everything pressable lives in the bottom third, where the thumb is, and never scrolls away | The line gets less room; a landed result covers the menu's first row or two until it is read |
| C | **Ledger** — line, result slip, then the deeds already done here as a transcript, over a compact two-column menu | The screen *is* the campaign record, growing | Densest of the three; the transcript competes with the result slip; two-column cells truncate longer titles |

**The operator picked B, the Sheet.** It is now the only layout:
`apps/app/src/components/beat/SheetBeat.tsx`. The two losers and the
`?layout=` flag that served them were deleted in the same commit — a
shipped product does not carry an unchosen design behind a query
string. The screenshots stay as the record of what was compared.

One constraint bound all three and binds anything that replaces this
one: **the result's two dice, its label pill and its citation stay on
screen.** `spec.md` requires a labelled, cited behaviour to be visible,
so an arrangement that hides the result slip is a refusal, not a
candidate. Candidate C's first draft dropped it and was corrected
before it shipped.

**This is v1.** The pick was made on a prototype beat, before the cave
had been played to its ending — the best evidence available at the
time, and thin. Phase 10's sitting is the first real test of it, and
the table above exists so the question can be re-opened with the
reasoning intact rather than re-argued from scratch. The build plan's
"The UI is v1" note carries the rule: `/iterate` polishes it, a v2
needs its own phase.

The bargain B makes is now asserted, not just described: an e2e holds
the menu row's position steady across a landing result and keeps it in
the phone's bottom half. If a later change breaks that, it breaks the
reason this layout was chosen, and the gate says so.

## The roll card — decided 2026-09-06

The operator asked for a modal on the roll: what the roll is for, the
dice tumbling and landing, and a plate under them keyed to the reason,
so the beat could lose its dice section. Three readings were built on
the app's tokens and photographed (`design/roll-modal/`, canvas
`Roll Modal`): A the Card, B the Sheet, C the Leaf. **The operator
picked A** and gave two notes (one CONTINUE; a blank strip during
creation); `design/roll-modal/README.md` records both.

The layout constraint still binds: the two dice, the label pill and
the citation are on the card until CONTINUE and on the result slip
after, never off screen. The e2e that holds the menu row steady
across a landing result now rolls through the card and still holds.

Plates are drawn SVG of ours, dashed as every invention is, because
`spec.md` refuses credited art. A plate per Proficiency or per area is
a later pass along the same seam (`Plate.tsx`, `PlateKey`).
