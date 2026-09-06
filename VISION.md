# VISION

This game must be faithful to the experience of playing Martial Havoc.
The goal of this application is not to expose the rulebook to the
player, but to BE the mobile game port: the book as it is played at a
table, not as it is read.

## The two voices

At a table the book is read by one person and played by the same
person, aloud, and the connective tissue between one roll and the next
is theirs. On a phone there is no one aloud. So the app has two voices,
and a reader can always tell them apart.

1. **The book.** Everything the rulebook or the adventure prints is
   printed verbatim and cited: a table's cells, a Technique's effect, a
   room's description, a stat block, a hint. Never paraphrased, never
   corrected, printed spelling kept. Upright type.

2. **The narrator.** A named storyteller who tells the Master's story
   between the book's lines: what a roll meant, what a room feels like
   to walk into, what a kill cost. He is ours, he is labelled ours, and
   he never says a thing the tables did not roll. Italic type, under
   his name. His register, his limits and his name are in
   `plan/VOICE.md`, and every line he speaks is a data record in
   `packages/content`, cited to that guide.

The player is the third voice: the passage field is always there, and
the narrator invites it at the moments the book asks the player to
imagine.

## What that means in this repository

- The two PDFs at the repository root are the sources and are never
  edited. Where a doc and the PDF disagree, the PDF wins and the doc is
  corrected in its own change (`agents.md`, standing rule 9).
- The book's text is decomposed and cited under `docs/`, and the
  fidelity leg holds every transcribed field to it.
- The narrator's lines are authored fields (`line`, and the records of
  `result-lines.json`, `prompts.json` and the like), labelled
  `invention`, counted by the build, bounded by `plan/VOICE.md`, and
  never generated: no model, external or on-device, writes one
  (`spec.md`, Refusals).
- Citations exist for everything and sit behind a tap, never on the
  play surface beside a sentence a player is reading.
- The app's own controls (button titles, headings, notes) are the
  app's copy, in `packages/content`, and are neither voice.

Set by the operator, 2026-09-06; the narrator decided the same day
after the verdict "played, not recited". This replaces the earlier
statement that confined every invented line to controls.
