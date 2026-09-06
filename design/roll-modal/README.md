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

Not chosen yet. The operator picks; nothing here ships.
