# Phase 10a — The voice

> Agent-facing brief, written by the operator's session of 2026-09-06
> after the verdict "played, not recited" (see `MEMORY`,
> `played-not-recited`). This is the root phase of the feel-of-play
> block: nothing in 10b–10j lands properly until it is settled.
> `[needs-user-call]` on one question, below; everything else is
> decided here.

## Outcome

The app is allowed a voice, and the voice has a style guide, a home in
the content package, a label, and a gate. Every result on the play
surface carries one authored sentence beside the book's text, plainly
the app's own, never mistaken for the book.

**Done when:** `spec.md`'s "an authored line beside every result" and
`VISION.md`'s "no line the book does not print" no longer disagree;
the surviving statement is written into both; a style guide exists at
`plan/VOICE.md`; every result kind on the beat and in combat prints its
authored line under a visible "ours" mark; the fidelity leg counts the
lines and the count is printed by the build.

**Waits on:** the operator's call (below), then `/re-seed`, because
`spec.md` is sealed and one of its sentences is at stake.
**Cost:** one week of wiring after the call; the writing is 10b–10j's.

## What the book gives

- MH p.3, Introduction: "Some terms or mechanics are intentionally
  ambiguous to encourage player interpretation. The rulebook gives you
  the tools, the story comes from your imagination." The book expects
  a narrator. At the table the narrator is the player, aloud.
- MH p.27–28, Unexpected event: "Imagine the two opponents still in
  the attack position, crossing their weapons and staring into each
  other's eyes for seconds... then something happens. If it is not
  clear from the ongoing narrative, roll on the following table." The
  book narrates in the second person and asks the player to continue.
- MH p.81–89, Appendix B, Cinematic Journey: the book's own model of a
  session is a 90-minute film in three acts. It names plot points,
  obstacles, a crisis, a climax and a freeze frame. It says "If the
  result of the dice roll conflicts with the linear development of
  the story, ignore the dice."
- 5T a1–a2: two pages of referee notes. Room descriptions, encounter
  bands, gated hints, stat blocks, loot lines. No narration between
  them. The connective tissue is the reader's.

## The call the operator must make

Two operator-level statements disagree and the build has been obeying
the one that kills play:

| Statement | Says | Effect if it wins |
|---|---|---|
| `spec.md`, Horizon | "an authored line beside every result"; "About 440 authored lines" | The app narrates, sparsely, in its own marked voice. |
| `VISION.md` | "A line the book does not print is an invention ... confined to the app's own controls (button titles, headings, citations)." | The app shows the referee's notes and nothing else. This is the shipped v1. |

The verdict of 2026-09-06 recommends the spec: the ban in `VISION.md`
was written after seeing bad authored lines, so the real question is
not whether the app may speak but how it sounds and who keeps it good.

**`[needs-user-call]`** Which sounds right, with a sample set to
approve before any line ships:

1. **Sparse, marked, second person.** One sentence per result, never
   more, italic, under a dashed "ours" rule. Book text upright, ours
   italic, always. (Recommended.)
2. **A named narrator.** A storyteller persona with a consistent
   register; lines may run to two sentences.
3. **Book only, plus the player's words.** Keep the ban; instead
   prompt the passage field at every result (see 10j). This is the
   current build with better prompts. Cheapest, and the verdict says
   it does not play.

## Scope (once called)

- `plan/VOICE.md`: the style guide. Register (second person, present
  tense, plain, no adjectives the book would not use), length (one
  sentence, twenty words), what a line may do (say what just happened
  and what it means to the Master) and may not do (invent a fact the
  tables did not roll, name a foe the room did not bring, foreclose a
  choice the menu still offers). Ten approved samples, one per result
  kind.
- The mark: every authored line prints under a dashed rule with the
  "+" glyph the Pill already uses for inventions, so a reader can tell
  the book from the app at a glance without a citation.
- Wiring: the `line` field of `areas.json` (eight lines, written in
  phase 8 and never rendered) prints under the description; the act
  lines print on act change (10c); Unexpected Event lines already
  print; loot, take, rest, rescue, flee, kill each get a line record
  in a new `packages/content/data/app/result-lines.json`
  (`label: invention`, cited to `plan/VOICE.md`).
- The gate: the fidelity leg already counts authored fields; the About
  screen prints the count; a line longer than the guide's cap fails
  the content test.
- `VISION.md` and `spec.md` amended to agree, through `/re-seed`.

## Not in scope

- Writing the 288 word-table lines (Phase 11).
- Any generated prose: `spec.md`'s refusal stands, no model writes a
  line.
- The rules panel's audience (kept as is; the titles shipped
  2026-09-06 make it readable).

## BDD

```gherkin
Feature: The app's voice is marked and bounded

  Scenario: a result prints the book's text and one line of ours, told apart
    Given a fresh Master on the Flat-top mountain
    When I walk to the Cave entrance on a die of 4
    Then the result slip shows "Safe exploration" as the book prints it
    And under a dashed rule with the "+" glyph it shows exactly one sentence of ours
    And that sentence is in italic and the book's text is not

  Scenario: no authored line exceeds the guide
    Given every record in result-lines.json and every area line
    When the content tests run
    Then every line is at most 140 characters and one sentence
    And every record carries label "invention" and cite "plan/VOICE.md"

  Scenario: the count is printed
    Given the web export
    When I open ABOUT
    Then "carry a line authored for this build" shows the number the fidelity leg counted

  Scenario: the book's text is never paraphrased by a line
    Given the Storage room's line
    Then it does not restate the description it sits under
    And the fidelity leg still round-trips the description to docs unchanged
```

## Verify gate

`npm run verify`; the fidelity leg's authored count moves and the
About screen's number moves with it; `e2e/prototype.spec.ts` gains the
first scenario above.

## Follow-ups

10b–10j write their own lines against `plan/VOICE.md`.
