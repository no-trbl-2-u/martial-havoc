# The roll modal, three readings (2026-09-06)

The operator's idea: tapping ROLL (or entering the dice by hand) opens a
modal that shows what the roll is for, the dice tumbling and landing,
and a plate under them keyed to the roll's reason. The manual-dice slip
leaves the beat, which frees the sheet.

Three interpretations, built on the app's own tokens
(`apps/app/src/theme/tokens.ts`) and component anatomy, one artboard
each plus its my-dice state, laid out on a design canvas. `gen.py`
generates every `.dc.html` from shared pieces; the PNGs are the
artboards at 390x844, 2x.

| | Reading | The bet | The cost |
|---|---|---|---|
| A | The Card - a centred card over a dimmed beat | The roll is an interruption worth a spotlight | Primary button leaves the thumb zone; small plate; dimmed line unreadable |
| B | The Sheet - the roll takes the bottom sheet's place; the line stays lit | Keeps layout B's reason for being: everything pressable in the bottom third | The plate is a short band; the sheet grows taller than the menu |
| C | The Leaf - a full page under the header, the plate leads | A roll is a moment; the plate carries the mood | Hides line and menu; most work per plate; ceremony may wear |

Every reading keeps the two dice, the label pill and the citation on
screen after it closes (`design/INDEX.md`, the layout constraint).

The plate is a dashed SVG placeholder. `spec.md` refuses credited art
(text and SVG only), so the image slot is drawn geometry of ours, keyed
by reason. Raster or credited plates would need `/re-seed`.

## Decided 2026-09-06

The operator picked **A, the Card**, with SVG plates of ours, and
added two notes that the shipped card follows:

1. One button. The card has a single CONTINUE. ROLL 2d6 (or a check on
   the menu) rolls at once and the card opens on the result; CONTINUE
   closes it and the result slip takes over on the sheet. MY DICE opens
   the same card unrolled, with the picker for the faces on the table;
   CONTINUE resolves the check on them and counts an override. The
   mockups' three-button ready state and KEEP IT are superseded.
2. The attribute strip shows a dash in every cell while a Master is
   being made.

Shipped in `apps/app/src/components/beat/RollCard.tsx`,
`apps/app/src/components/Plate.tsx` and `apps/app/src/hooks/useTumble.ts`;
the reducer's `roll.open`, `roll.manual`, `roll` and `roll.close`.
The beat's manual-dice slip is gone; the fight keeps its own.

## The card after Phase 8c

The beat lost its invented checks the same day (`VISION.md`), so the
card's one roll is the adventure's Event table: tapping an exit rolls
it, the card shows the die (and the creature die where one was drawn),
the printed Event row, what it brought and `5T a1`. MY DICE is a toggle
on the roll bar; on, the exit opens the card unrolled with a one-face
picker. The skill and luck plates stay for the Oracle and the sandbox.
