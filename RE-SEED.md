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

---

# Field report — 2026-09-07T20:14:29Z

origin: idea-0003 @ state/0013
built-through: Phase 10l (spirits immune to ordinary blows, e4c2b86,
merged as PR #60, ab1687e). The feel-of-play block 10a-10l is
complete; Phase 10, the operator's own sitting, is the next row.

## What drifted

The Horizon says "About 440 authored lines: every Oracle cell,
Unexpected Event, Inspiration, Spark and Technique or Ritual
effect", and the acceptance criteria say "437 is the full count".
On 2026-09-07 the operator, asked what happens to the 149 of those
lines that are held to no style guide (66 Oracle, 72 Technique and
Ritual effect, 11 Unexpected Event), answered: cut them to the
book's text only. That removes one of the Horizon's sentences and
one acceptance criterion, and it puts Phase 11, whose whole scope is
the remaining 288 lines (72 Inspirations, 216 Sparks), in question.

## What was built instead

The 149 lines exist as data. The 66 Oracle lines are in
`packages/content` and have never been rendered by the app. The 72
effect lines render in combat as the row text under a Technique, in
the second person ("you cross it without a boat and without getting
wet"). The 11 Unexpected Event lines render when a tie lands on the
p.28 table. All 149 are `label: invention`, cite a folio rather than
`plan/VOICE.md`, and are exempted by name from `voice.test.ts`.
Beside them the narrator's 24 lines (20 result lines, 4 prompts)
cite the guide and pass its test.

The mechanics under the effect lines are untouched by the cut:
`effects.json` also carries `class`, `cost`, `timing` and
`operation`, and the engine reads those.

## Why

The 2026-09-06 report re-issued the authored line as the narrator's.
The 149 predate him: they were written in Phase 4 to the spec's
count, before the app had a voice, and nobody rewrote them when it
got one. So the app now prints three registers: the book's, upright
and cited; Old Ping's, italic and bounded; and a third that is
neither, addresses the Master as "you" against the guide, and is
counted toward a number the spec set before the narrator existed.
The count was a proxy for "played, not recited". The narrator now
carries that; the proxy no longer measures anything the operator
wants.

The audit row scored the 149 at 4.5 and the critique carries the
second-person row; both are in `plan/CRITIQUE.md` Pending. The
candidate that would ship the cut is filed in
`plan/PHASE_CANDIDATES.md` (expand pass 1, score 6.0) and waits on
this report by rule 6.

## What the source should do

**Re-seed from the current state.** Two sentences of the Horizon
and one acceptance criterion need re-issuing:

1. "About 440 authored lines: every Oracle cell, Unexpected Event,
   Inspiration, Spark and Technique or Ritual effect" becomes: the
   narrator's lines, one per result kind and one per imagining
   moment, bounded by `plan/VOICE.md`; the book's cells print as
   printed.
2. "The shipped authored-line count is printed by the build; 437 is
   the full count" becomes a count of narrator lines, printed, with
   no target.
3. The source must say whether Phase 11 survives. The operator's
   answer covered the 149 lines that exist, not the 288 that do not.
   If the same reasoning holds, Phase 11 is withdrawn and the
   Inspiration and Spark tables print as printed; if the operator
   wants the word tables spoken, they are Old Ping's and the phase
   is re-briefed to his guide. Until the source answers, Phase 11
   stands as written and the candidate does not ship.

The refusal "No generated prose" is untouched. No sealed rule is
reopened. The narrator of the 2026-09-06 report stands unchanged.

---

# Field report — 2026-09-08T13:10:00Z

origin: idea-0003 @ state/0013
built-through: Phase 10l (spirits immune to ordinary blows, e4c2b86,
merged as PR #60, ab1687e); no phase has shipped since. The work of
this window is not phase work: the operator answered the third
report's open question via `/oversight` (e70ba8b, 826d2de), the first
`/critique` pass ran (d770a00), one engine fix landed (a6e2d77), and
the operator played the deployed build on an Android phone and filed
nine observations, six of which shipped as fixes (81008a8, merged as
PR #67, c2c10d1).

## What drifted

The third report (2026-09-07T20:14Z) asked the source one question it
could not answer itself: whether Phase 11 survives the cut of the 149
unguided lines. The operator answered it on 2026-09-07, twice and the
same way — the 72 Inspirations and 216 Sparks are the same category
of line, cut with the 149, and the word tables print as the book
prints them. Phase 11 is now `[skipped]` in
`plan/steps/01_build_plan.md`, with its scope section carrying the
reason and pointing at this report.

That closes the question and widens the drift. Where the third report
asked for two sentences to be re-issued about 149 existing lines, the
answer now voids the whole of the Horizon's "About 440 authored
lines: every Oracle cell, Unexpected Event, Inspiration, Spark and
Technique or Ritual effect" and the whole of the acceptance criterion
"The shipped authored-line count is printed by the build; 437 is the
full count, and a smaller number names the fallback". Not a smaller
number naming a fallback: a different measure. The plan has removed a
phase the spec's Horizon implies, on the operator's word, and
`spec.md` still says the phase's work is the target.

## What was built instead

Nothing, which is the point. The 149 lines still ship exactly as the
third report described them — 66 Oracle lines unrendered, 72 effect
lines under Techniques in the second person, 11 Unexpected Event
lines on the p.28 table, all `label: invention`, all exempt by name
from `voice.test.ts`. The candidate that would cut them
(`plan/PHASE_CANDIDATES.md`, expand pass 1, score 6.0) is still
blocked on this re-issue by rule 6 and has not shipped. The 288
Inspiration and Spark records exist as the book's printed cells
(`inspirations.json` 72, `sparks.json` 216) and never had authored
lines to lose. Old Ping's own count stands at 24 (20 result lines, 4
prompts), guide-cited and guide-tested.

So the build's content is unchanged since the third report; what
changed is the plan around it. Phase 11 skipped rather than deleted,
Phase 12 keeping its row order, Phase 10m and Phases 15 and 16
promoted into the rows before the milestone.

Beside that, the first evidence from a real phone. The operator ran
the deployed build on Android and the six defects fixed there were
all frame, not rule: the status bar sat over the attribute strip,
selection was a typed asterisk rather than an inverted row, a long
style note crushed a long name, the pool tally scrolled away, the
Adventures table printed all thirty-six rows under its ROLL button,
and Fen Pass and the mountain told two narratives on one screen. One
of those fixes carries a small call worth naming: the Master's motive
step now offers ROLL and a card with the one row the dice gave, and
no free-text field — the motive is a row of the book's table or it is
nothing, and the step may be left unrolled.

## Why

The cut has one reason and it is the same one three times over. The
spec's count was written before the app had a voice. It was a proxy
for "played, not recited", and Old Ping now carries that load
directly: a line that is neither the book's nor his is a third
register on the screen, and the operator does not want a third
register whether it exists already or would have to be written. The
149 and the 288 differ only in whether the writing has happened, and
that is not a difference the reader can see.

Phase 11 was skipped rather than deleted because deleting it would
have been the quiet edit this skill exists to prevent. The row and
its scope section both say the spec sentence is sealed, both say the
seal has not lifted, and both name the fourth report as the thing
that carries the answer back. The plan is honest about being ahead of
its spec; it is still ahead of it.

The motive step's missing free-text field is reported for
completeness rather than as drift. The Horizon's free-text field is
the one beside an encounter's resolution and it is untouched; the
creation hook was added by the operator's call of 2026-09-07 and
their call of 2026-09-08 is that it stays a row of the book's table.

## What the source should do

**Re-seed from the current state.** No refusal was crossed and no
sealed rule reopened; three things need re-issuing, and the third is
new:

1. "About 440 authored lines: every Oracle cell, Unexpected Event,
   Inspiration, Spark and Technique or Ritual effect" becomes: the
   narrator's lines, one per result kind and one per imagining
   moment, bounded by `plan/VOICE.md`; every table cell of the book —
   Oracle, Inspiration, Spark, Unexpected Event, Technique and Ritual
   effect — prints as printed. This is the third report's item 1,
   now covering the tables Phase 11 would have spoken.
2. "The shipped authored-line count is printed by the build; 437 is
   the full count, and a smaller number names the fallback" becomes a
   count of narrator lines, printed by the build, with no target and
   no fallback. 437 is not a reduced target; it measured a thing the
   product no longer contains.
3. The Horizon should say that the word tables are the book's, so
   that no later phase re-derives Phase 11 from the sentence in item
   1. The phase is `[skipped]`, not deleted, precisely because
   reopening it means reopening these two sentences; once they are
   re-issued the row can be retired by the plan.

Until the source acts, the state is stable and honest: the 149 lines
still ship, the cut candidate stays blocked, and the spec still says
437. The cost of the wait is three registers on the screen, which is
the audit's 4.5 row and the critique's second-person row, both still
Pending.
