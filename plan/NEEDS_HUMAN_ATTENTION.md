# Needs human attention

> The questions no loop tick may answer. Each is a design choice with
> more than one defensible answer, and each shapes work that would be
> wasted if guessed. `/oversight` reads this file first; `/march`,
> `/ship-a-phase` and `/iterate` treat an open row as a wall: they
> build up to it and stop. A row is closed by the operator, in writing,
> here, with the date and the choice; the phase it unblocks then runs.
>
> Written 2026-09-06 from the verdict "played, not recited". Rows are
> in the order they should be decided.

## 1. What voice is the app allowed to have — CLOSED 2026-09-06

This is the root. The spec says authored lines beside every result.
VISION said book text only. The ban was written after seeing bad
authored lines, so the real question was never whether the app may
speak but what its voice sounds like and who keeps it good. That
needed a style guide and a sample set the operator approves, and it
went through `/re-seed` because the spec is sealed.

- **Decided:** option 2, a named narrator. Old Ping, the shuoshu of
  Fen Pass (MH p.49). Third person, present tense, the Master by name,
  two sentences and forty words at most, never a rule, a number, a
  citation or a fact the dice did not roll.
- **Where:** `plan/VOICE.md` (the guide and ten samples), `VISION.md`
  (the two voices), `RE-SEED.md` (the field report). PR #33.
- **Unblocks:** Phase 10a's wiring, and every line 10b–10j writes.
- **Read back 2026-09-07:** the operator read the ten. Sample 7 was
  wrong because "rolled" puts the listener at the table, not in the
  story ("maximize immersion"). The sample is rewritten and the guide
  gains a line: no word of the table (roll, dice, check, result). The
  other nine stand. Row fully closed.

## 2. Who the Master is — CLOSED 2026-09-07

The book gives tools for this: status (MH p.5), the style's prose
(MH p.7–10), the pre-generated sheets' film origins (MH p.92), and the
Adventures table as a source of motive (MH p.36–39). Whether the app
rolls a reason for being on the mountain, asks for one, or lets the
premise stand alone is a design choice with three defensible answers.

- **Options:** (a) a hook from the Adventures table, rolled or chosen
  at creation, printed as the Master's own story, with the cave an
  episode on the way to it; (b) the premise alone, no personal motive;
  (c) a sentence the player types.
- **Recommendation:** (a). It is the book's own tool, the table is
  already in the content package, and it hands Phase 12's sandbox a
  thread to pick up ("pick up one of the narrative threads left
  unresolved", MH p.88).
- **Cost of guessing:** (a) adds a creation step and a sheet field
  with a migration; (c) adds a field nobody fills; (b) is free and is
  what the verdict said does not play. A wrong pick is a migration to
  undo.
- **Decided:** option (a). A hook from the Adventures table (MH
  p.36–39), rolled or chosen at creation, printed as the Master's own
  story; the cave is an episode on the way to it. Creation step, sheet
  field and migration are in scope. Phase 12 picks the thread up.
- **Brief:** `plan/phases/phase_10j_who_the_master_is.md`.
- **Unblocks:** 10j's creation step and sheet field. 10j's prompts
  (row 3) do not wait on this.

## 3. Where the player's imagination goes — CLOSED 2026-09-07

The book says the story comes from you (MH p.3). The passage field is
that, and nobody uses it because nothing invites it. Prompting at the
right moments, after a tie or a kill, is the interesting question, and
it is exactly the kind of thing that fails if guessed.

- **Proposed:** four moments, one question each, none required: after
  an Unexpected Event ("What happened while the weapons were
  crossed?", the book's own instruction at MH p.27–28), after a kill,
  after a rescue, after a treasure taken. The narrator asks; the
  field opens with the question as its placeholder; KEEP IT stores
  the passage with the moment's id; the chronicle (10h) shows it
  where it was written.
- **What the operator decides:** whether four is right and which
  four; whether the narrator asks or the app does; whether a passage
  ever changes anything (recommendation: never; it is the player's
  and the tables do not read it).
- **Cost of guessing:** small in code, large in feel. A prompt at the
  wrong moment reads as homework.
- **Decided:** the proposal as written. Four moments (after an
  Unexpected Event, a kill, a rescue, a treasure taken), one question
  each, none required. The narrator asks; the field opens with the
  question as placeholder; KEEP IT stores the passage with the
  moment's id; the chronicle shows it in place. A passage never
  changes anything: the tables do not read it.
- **Brief:** `plan/phases/phase_10j_who_the_master_is.md`, second
  half.
- **Unblocks:** 10j's prompts.

## 4. Whether the rules panel is for players at all — CLOSED 2026-09-07

It is a provenance ledger. The 2026-09-06 fixes gave every row a
plain-sentence title and moved the engine id behind the tap, and the
operator likes the panel once opened. The remaining question is its
audience.

- **Options:** (a) a player's glossary: keep it in the header, keep
  the sentences, drop the four estate questions (says / silent on /
  source / if reversed) to a second tap, and let a result slip's
  SOURCE deep-link to its row; (b) a developer corner: move it under
  ABOUT, keep every field, and give the play surface no link to it;
  (c) both: the glossary in the header, the ledger under ABOUT, one
  data source.
- **Recommendation:** (c). The spec's "the rules panel lists every
  behaviour with one of three labels and its citation" is the ledger
  and stays; the glossary is the same list read the other way.
- **Cost of guessing:** one screen's layout. Low. This row is here
  because the operator asked for it, not because a wrong pick is
  expensive.
- **Decided:** option (a), against the recommendation. A player's
  glossary: stays in the header, keeps the plain sentences, moves the
  four estate questions (says / silent on / source / if reversed) to
  a second tap, and a result slip's SOURCE deep-links to its row. No
  separate ledger under ABOUT. The spec's "lists every behaviour with
  one of three labels and its citation" is still met: the label and
  citation are on the second tap, one data source.
- **Unblocks:** a small `/iterate` row; no phase waits on it.

## 5. The sandbox's place — CLOSED 2026-09-07

The MAP tab shows a region that has nothing to do with the cave. The
spec's Horizon says the sandbox is the real game and adventures are
scenes in it. How the cave sits inside that world shapes the opening
re-cut (10b) and the map (10h).

- **Options:** (a) the region is thrown once at the campaign's start
  around Fen Pass, the mountain is one of its points, and the cave is
  entered from the region the way the book enters a monastery (MH
  p.42, steps 2–6); (b) the region is thrown only when the cave's
  ending is reached, as now, and the cave is a prologue the sandbox
  follows; (c) no region until Phase 12, and MAP shows the cave alone
  until then.
- **Recommendation:** (a) for the shape, (c) for the order of work:
  10h draws the cave on MAP now and hides the region until Phase 12
  places the mountain on it. Throwing the region around the village
  at campaign start is Phase 12's first scene, and 10b's village
  should be written so that it is a point on that region later
  without change.
- **Cost of guessing:** 10b and 10h would be built against the wrong
  frame. Medium.
- **Decided:** (a) for the shape, (c) for the order of work. The
  region is thrown once at campaign start around Fen Pass, the
  mountain is one of its points, and the cave is entered from the
  region the way the book enters a monastery (MH p.42, steps 2–6).
  Order: 10h draws the cave alone on MAP now and hides the region
  until Phase 12 places the mountain on it; throwing the region is
  Phase 12's first scene; 10b's village is written so it becomes a
  region point later without change.
- **Briefs:** `phase_10b_the_opening.md`, `phase_10h_map_and_journal.md`,
  and Phase 12 in `steps/01_build_plan.md`.
- **Unblocks:** 10h's MAP mode rule and 10b's exit from the village.

## Closed rows

Rows are never deleted. When closed they keep their number, gain the
date and the choice, and their "Unblocks" line becomes the phase row
that ran.
