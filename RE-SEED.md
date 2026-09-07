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

---

# Field report — 2026-09-07T01:32:00Z

origin: idea-0003 @ state/0013
built-through: Phase 9 (the web release, 6dd0729) plus 8c (the cave,
verbatim, 89bb9a4); no phase has shipped since the last report. The
change reported here is the operator answering the five open design
questions and one audit row on 2026-09-07 (634db31, fe563cc, 776c588,
merged as PR #35, 8a978de).

## What drifted

Three of the operator's five answers move the Horizon rather than
fill it in. The largest is the sandbox's place: the Horizon's picture
has the second Master "walk out of the Lotus Flower cave into a
region the engine threw", and falsifier 2 checks that sequence on
2027-03-05. The operator's call inverts it — the region is thrown
once at the campaign's start around Fen Pass, the mountain is one of
its points, and the cave is entered from the region the way the book
enters a monastery (MH p.42). Second, the Horizon enumerates what the
campaign record holds and what creation does, and neither list has a
place for a motive; the operator's call adds a hook rolled or chosen
from the Adventures table (MH p.36-39) at creation, a sheet field to
hold it and a migration to carry it. Third, the Horizon's "The rules
panel lists every behaviour with one of three labels ... and its
citation" is now the panel's second tap: the operator chose a
player's glossary as the panel's first read, against the
recommendation that the ledger keep the surface.

Below those, two smaller answers. The player's imagination gets four
prompted moments, which the Horizon's "a free-text field the player
may use and never must" already permits, and the prompts leave it
optional. And reading I-29, which the estate itself recorded as
doubtful for two opponents, now has an answer: Bai Gu Jing and
Jiangshi are tagged incorporeal.

## What was built instead

Nothing was built against the old frame, which is why this report
costs a paragraph. `plan/NEEDS_HUMAN_ATTENTION.md` closed all five
rows in writing with the date and the choice, and every phase they
gated (10b, 10h, 10j, and a small `/iterate` row) is still pending.
The one code change is the I-29 tag: two records in
`packages/content/data/world/opponents.json` gain `incorporeal: true`
and `reading: "I-29"`, `I29_NAMES` in `content.test.ts` carries ten
names instead of eight, and two `docs/` lines that called the pair
doubtful now record the call. `plan/VOICE.md` gained one rule, that
the narrator may never say a word of the table, and its seventh
sample lost the word "rolled".

## Why

The five questions were written on 2026-09-06 as the ones no loop
tick may answer, and they were answered by the operator on
2026-09-07, so nothing here is a build that outran its spec. The
drift is that answering them honestly changed the shape of the
Horizon's picture rather than staying inside it.

The sandbox inversion has a reason the spec did not know: the spec's
own Horizon says the sandbox is the real game and adventures are
scenes in it, and a cave that must be finished before a world exists
is the opposite arrangement. The operator's call makes the sentence
and the picture agree. It cost nothing today because the order of
work was kept as recommended — the cave alone on the map now, the
region hidden until Phase 12 — so the code still matches the old
picture while the plan now aims at the new one.

The Master's motive was added because the verdict of 2026-09-06 said
the app recites rather than plays, and a Master with no reason to be
on the mountain is the plainest instance of that. The book supplies
the tool; the spec's enumerations simply predate the question.

The rules panel went to the glossary against the recommendation. The
spec's sentence is still satisfied, since the label and citation live
one tap in, but it is now satisfied by a panel whose first purpose is
to teach a player a word rather than to show an estate its ledger.
That is a change of audience, and a spec that names the ledger should
say which of the two it meant.

I-29 was resolved by reading the rulebook end to end rather than by
inference: R77 (p.66) names only spirits and ghosts, the two entries
(p.70, p.74) say "Demon" and "undead", and the encounter matrix
(p.67) seats both in the Supernatural column beside two opponents
that stay untagged. The book gives no answer, and the operator's
standing instruction was to tag both if none was found. R77 is not
among the sealed rules, so this is a reading, correctly labelled and
cited; it is reported because the estate's own inventory recorded the
doubt and the build now carries an answer the book does not.

## What the source should do

**Re-seed from the current state.** Three sentences of the Horizon
need re-issuing and no refusal was crossed:

1. The region is thrown at the campaign's start, not on the cave's
   exit. Falsifier 2's evidence should read "a region already thrown,
   a location entered from it, an encounter resolved" rather than a
   walk out of the cave into a region thrown at that moment.
2. The campaign record holds the Master's hook from the Adventures
   table, and creation rolls or chooses it. Both enumerations gain
   one item.
3. The rules panel is a player's glossary whose second tap is the
   provenance ledger. The three labels and the citation stand; their
   place on the screen changes.

Reading I-29's two doubtful names are now answered in the build; the
estate should record the answer or overturn it, since the book
carries neither. No sealed rule is touched, no refusal is crossed,
and the narrator of the 2026-09-06 report is unchanged apart from one
tightened rule.
