# VOICE — the narrator

> The style guide for every line the app speaks in its own voice.
> Set by the operator's call of 2026-09-06 (phase 10a, option 2: a
> named narrator). Every authored record in `packages/content` that
> is the narrator's cites this file. A line that breaks a rule here
> is a red content test, not a matter of taste.

## Who he is

**Old Ping, the shuoshu of Fen Pass.** A teahouse storyteller
(MH p.49, Chaguan: "a small stage attracts artists for theater
performances, storytellers, and acrobats") who sits in the last inn
at the trail-head village and tells the Master's story to whoever is
in the room. He has told a thousand of these. He is fond of the
Master and does not flatter them. He has seen the films the book
lists (MH p.80) and talks like their voice-over: plain, a little dry,
never florid.

He is not a character in the story. He never acts, never appears in
a room, never speaks to the Master. He speaks to the listener.

## How he speaks

- **Person and tense.** Third person, present tense, the Master by
  name: "Lin Shu walks in." He may address the listener directly:
  "Listen." "Mark this." Never the second person for the Master.
- **Length.** One or two sentences. Forty words at most. A line that
  needs a third sentence is two lines' work and one of them is not
  needed.
- **Register.** Plain words. A verb in every sentence. No adjective
  the book would not use. No exclamation marks. No dialogue for
  anyone but himself. He may name a smell, a sound, a weight; he
  does not name a feeling. Humour is dry and rare.
- **What he may say.** What just happened and what it cost. What a
  room is like to stand in. What a foe looks like when it moves. What
  the Master carries now. What the listener should watch for. The
  book's own image, extended by one beat.
- **What he may not say.** A fact the dice did not roll (a foe the
  room did not bring, a door that is not on the map, a hint the
  Master has not earned). A rule, a number, or a citation. A choice
  the menu still offers, foreclosed or recommended. Anything about
  the player. Anything a line of the book already says, restated.
  Any word of the table: "roll", "rolled", "dice", "check",
  "result". The listener is in the story, not at the table
  (operator, 2026-09-07: "maximize immersion"; sample 7 was
  corrected for this).
- **The Master's words.** He never puts words in the Master's mouth.
  If the player wrote a passage, he does not comment on it.
- **Names.** He uses the book's printed names, as printed: "Senior
  King Golden Horn", "the Old Vixen", "a Devil servant".

## How he appears

Italic type, under a dashed rule, with his name in small capitals at
the rule: OLD PING. Never inside the book's text. Never on a control.
He has no icon, no portrait: text and SVG only, and he is text.

## Where he speaks

One line per result kind, in `packages/content/data/app/result-lines.json`
and the `line` fields of the adventure files; one prompt per
imagining moment in `prompts.json` (phase 10j). Every record:
`label: invention`, `cite: plan/VOICE.md`, and the id of the result
or moment it belongs to. The content test holds every line to forty
words and two sentences, and fails on an exclamation mark or a digit.

He does not speak on the title page, on ABOUT, on RULES, on RECORD,
or in creation. He speaks on the beat, in a fight, in the village,
and at the ending.

## The ten samples

The operator approved the narrator by these. A new line should sound
like one of them.

1. *The first beat, on the mountain.* "Pines, and a long way down on
   either side. Somewhere out of sight an axe keeps time, and Lin Shu
   walks toward it."
2. *Entering the cave (act 2).* "The gate is behind Lin Shu now, and
   the stream that went in ahead of her has stopped talking."
3. *An Encounter: a Devil servant.* "Something small comes out of the
   smoke with a knife it is too pleased about. Listen to how many
   feet there are."
4. *An Ambush.* "The first blow is theirs. Lin Shu learns this the
   way everyone does."
5. *A kill.* "The servant goes down and stays down. The kitchen does
   not stop cooking."
6. *A flight.* "Lin Shu leaves with two of the Ogre's marks on her
   and one on her name. The cave will remember both."
7. *A tie, an Unexpected Event.* "Two blades stop a finger apart and
   hold there. Something neither of them brought is about to decide
   this."
8. *A treasure taken: the vase.* "It is lighter than it should be.
   Lin Shu does not say a name near it."
9. *The rescue of the Monk.* "The man in the pool stops praying long
   enough to look at who has cut the rope. Then he starts again,
   faster."
10. *The ending, the freeze frame.* "Five treasures, one mountain,
    and the travellers come and go again. Old Ping puts down his fan.
    That is where the story stops, this time."

## Renaming him

The name is the operator's. If it changes, it changes here and in
one string record (`ui.narrator.name`); nothing else knows it.
