# Field report — 2026-09-06T22:40:00Z

origin: idea-0003 @ state/0013
built-through: Phase 9 (the web release, 6dd0729) plus 8c (the cave,
verbatim, 89bb9a4) and the first bucket of the feel-of-play verdict
(2299932, merged as PR #32, f742a6e)

## What drifted

The Horizon's sentence "an encounter resolves through a menu of what
the rules allow, with an authored line beside every result" and its
"About 440 authored lines" were built, then switched off. On
2026-09-06 the operator, having seen the early authored lines, wrote
`VISION.md` confining every invented line to controls, and phase 8c
shipped the cave as the book's text alone. The two statements
disagreed and the build obeyed the narrower one. Played through on
2026-09-06, the cave read as a referee's notes: no premise on the play
surface, no name for the room, no one to say what a roll meant. The
verdict is in `plan/phases/phase_10a_the_voice.md`.

## What was built instead

Verbatim transcription with labelled provenance everywhere: 1,490
records, 109 labelled behaviours, every table and room of the book
on screen word for word, citations printed beside every result and
every menu row. The authored lines the spec asked for exist in the
data (areas, acts, Unexpected Events, Techniques) and, until PR #32,
were mostly not rendered. The engine is correct and proven by test;
the story was left to the reader.

## Why

"Verbatim" was read as "nothing but". The spec's authored line and
the operator's ban were both reactions to the same fact, that the
book's connective tissue is supplied by the player at the table, and
they answered it in opposite directions. The ban was the reaction to
bad lines, not to lines.

## What the source should do

**Re-seed from the current state.** The operator decided on
2026-09-06: the app has a named narrator. The Horizon's "an authored
line beside every result" stands and should be re-issued as "a line
of the narrator's beside every result"; "About 440 authored lines" is
now a floor, not a count; the refusal "No generated prose" stands
unchanged (every line is hand-written data). `VISION.md` is rewritten
to say so; `plan/VOICE.md` names the narrator and bounds him. No
sealed rule is touched.
