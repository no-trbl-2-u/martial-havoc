# Phase 10j — Who the Master is, and the player's own words

> Agent-facing brief, from the verdict of 2026-09-06. The player is
> never told who they are, and the field the book gives them for their
> own story (the passage field, "the story comes from your
> imagination") is never invited to be used. `[needs-user-call]` on
> the shape of a motive; the prompting ships regardless.

## Outcome

A Master has a reason to be on the road, taken from the book's own
tables and read in the second person; and at the moments the book
asks the player to imagine, the app asks too.

**Done when:** creation ends with a motive the player rolled or chose
from the Adventures table, printed on the sheet and on RECORD; the
passage field is opened with a prompt of ours at four moments (an
Unexpected Event, a kill, a rescue, a treasure taken), each prompt one
question, none required; passages are shown where they were written
in the chronicle (10h); a scripted Master on fixed dice rolls a motive
and the record carries it.

**Waits on:** 10a (the prompts are lines of ours), 10h (the
chronicle).
**Cost:** one week after the call.

## What the book gives

- MH p.3: "the hero (the Master) seeking revenge, fortune or fame."
  "The rulebook gives you the tools, the story comes from your
  imagination."
- MH p.36–39, Adventures: the 1d6 × 1d6 table of thirty-six hooks. "An
  enemy school has killed your master and all your companions. You
  are the last survivor who can avenge them." "You are wrongly accused
  of murder and there is a bounty on your head." "You have been struck
  on a pressure point and will die in 7 days, unless..." Each is a
  motive in one sentence.
- MH p.85–86, Act I: "The Motivation, if not obvious, can emerge by
  playing the first act: the protagonist lives in a world altered by
  the Incident and their life is irrevocably disrupted, until they
  accept the Call."
- MH p.92, the printed sheets: each names the film it comes from;
  Beggar So is from Drunken Master (1978). The book's Masters have
  pasts.
- MH p.51, City encounters: "Roll on the table to randomly determine
  the nature of your connection and their traits" (owes you money,
  outfought you, hates you, loves you, knows your secret...). The
  book makes relationships by dice.
- MH p.27–28: "Imagine the two opponents still in the attack position
  ... then something happens." The book asks the player to imagine at
  the tie.

## The call the operator must make

`[needs-user-call]` What a motive is in this app:

1. **A hook from the Adventures table** (MH p.36–39), rolled or
   chosen at creation, printed as the Master's own story, unrelated to
   the cave. The 5 Treasures is then an episode on the way to it.
   (Recommended: it is the book's own tool and it costs one table
   that is already in the content package.)
2. **The premise alone.** No personal motive; the Call is enough.
   Nothing to build.
3. **A written one.** The player types a sentence at creation.
   Cheapest to build; the verdict's experience says blank fields go
   unfilled.

## Scope (once called; option 1 assumed)

- Creation step `who` gains WHY ARE YOU ON THE ROAD: ROLL on the
  Adventures table (d66) or CHOOSE from the thirty-six; the chosen
  hook is `sheet.motive: {id, text}`; migration defaults null.
- The sheet slip at READY and RECORD's THE MASTER print the motive
  under the name in the second person as the book prints it.
- Prompts: `packages/content/data/app/prompts.json` (`label:
  invention`, cited `plan/VOICE.md`), one per moment, one question
  each: after an Unexpected Event ("What happened while the weapons
  were crossed?"), after a kill ("What did it cost?"), after a rescue
  ("What did they say?"), after a treasure taken ("What does it feel
  like in your hand?"). The passage field opens with the prompt as its
  placeholder and focuses; KEEP IT stores the passage with the
  prompt's id; nothing is required.
- The presets' `from` prints on the sheet slip ("from Drunken Master
  (1978)").

## Decisions made upfront

- The motive never changes the tables: it is text on the sheet and a
  thread for Phase 12's sandbox to pick up ("pick up one of the
  narrative threads left unresolved", MH p.88).
- Prompts are four; more is a later pass against `plan/VOICE.md`.

## Not in scope

- City encounters and connections (Phase 12).

## BDD

```gherkin
Feature: The Master has a reason, and the player is asked to imagine

  Scenario: a motive is rolled at creation
    Given creation step 1 and dice 3,5
    When I press ROLL under WHY ARE YOU ON THE ROAD
    Then the slip reads "You are wrongly accused of murder and there is a bounty on your head"
    And READY prints it under the name
    And RECORD prints it under THE MASTER

  Scenario: a motive is chosen
    When I press CHOOSE and pick the hook about the one-armed figure
    Then the sheet carries that hook

  Scenario: the tie asks
    Given a tie and an Unexpected Event
    When I leave the combat phase
    Then the passage field is open and its placeholder reads "What happened while the weapons were crossed?"
    And I can walk on without writing

  Scenario: a written passage keeps its prompt
    When I type "He looked at the door, not at me." and press KEEP IT
    Then the chronicle shows the passage after the Unexpected Event entry
    And export carries the prompt id with it

  Scenario: a printed sheet says where it is from
    When I take Beggar So
    Then READY prints "from Drunken master (1978)"
```

## Verify gate

`npm run verify`; `creation.test.ts` for the motive; `reduce.test.ts`
for the prompts; one e2e case for the tie's prompt.
