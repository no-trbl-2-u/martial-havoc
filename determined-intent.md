# Determined intent

A reading of what Gianluca Monaco built Martial Havoc to make a
player feel, derived from the two PDFs at the repository root and
nothing else. It merges two independent `/expert` readings made on
2026-09-06 and 2026-09-07; where they differed, the difference is
recorded in section 9. Every claim carries a confidence score (0 =
guess, 100 = fact printed in the book) and a folio. Folios are the
printed page numbers (PDF page minus one for the rulebook); the
adventure's two pages are `a1` and `a2`.

This file is interpretation. Where it disagrees with the PDFs, the
PDFs win (agents.md standing rule 9).

## 1. Method

| Step | What was done |
|---|---|
| Text | Every page of both PDFs extracted with pymupdf and read in order, 94 rulebook pages and 2 adventure pages, on both passes. |
| Images | First pass: pages under 70 words or carrying images. Second pass: every one of the 96 pages rendered and read, the eight sheets (p.92) at 4x in bands, the cave map (a1) cropped at 3x. The second pass recovered merged table cells, italics, underlines and printed defects the text loses. |
| Math | Exact 2d6 probabilities; 20,000-run and 10,000-run simulations of representative fights under the printed combat rule (p.23), one-on-one and multiple, damage-only and finisher policies. |

## 2. Thesis

Martial Havoc is a machine for producing a Hong Kong martial-arts
film one scene at a time, for one player with no referee. The
numbers are tuned so that dice interrupt a scene and hand it back
to the player, rather than conclude it. The Master is competent by
default, in real danger only against the named enemy, and never
more than one tied roll away from the scene cutting to "then
something happens". Confidence 82.

Evidence, all from the printed rules:

| Signal | Value | Folio |
|---|---|---|
| Tie per combat exchange, equal modifiers | 11.3% | p.27 |
| Equal-peer fight ended by a draw before either side drops (Master mod 11 vs Shi Fu 11) | 65% | p.23, sim |
| Median Master (SKILL 9, Proficiency 4) vs Shi Fu: ended by draw / won by attrition | 47% / 52% | p.23, sim |
| Final Blow lands (doubles on 2d6) | 16.7% | p.25 |
| Draw table result "the fight resumes" | 27.8% | p.28 |
| Draw table result "reinforcements" | 16.7% | p.28 |
| Roll-under success at SKILL 7 | 58% | p.22 |
| Roll-under success at threshold 12 or more | 100% | p.22 |

A fight against a peer rarely resolves by trading damage. It
resolves by an Unexpected Event, a Technique, an Opening, or an
escape. The text states the frame directly: after a draw "you are
no longer in the combat phase" (underlined in print), the two
opponents stand with weapons crossed "staring into each other's
eyes for seconds... then something happens" (p.27). Combat is a
beat, not a grind.

The introduction (p.3) declares the rest: "Some terms or mechanics
are intentionally ambiguous to encourage player interpretation. The
rulebook gives you the tools, the story comes from your
imagination." Confidence 100 that this is the stated design goal.
The same page promises "endless fights, flying kicks, close-ups of
furrowed brows, sharp blades grabbed with bare hands, demons with
magical powers, and the hero (the Master) seeking revenge, fortune
or fame." Appendix B adds the sandbox framing: "endless adventures,
between tables and dice rolls, until the demiurge decides to change
the game" (p.81).

## 3. What each system is for

### 3.1 Techniques are ENDURANCE converted into authorship

Confidence 90. A Technique needs no roll and always works ("without
making a roll check" is underlined, p.24); the cost is ENDURANCE
equal to its value. The same page then says not to use a Technique
to end a fight: a knockdown "does not mean that they are defeated,
but that you have gained a great advantage, or the chance to escape
without consequences." The player pays health to buy a guaranteed
cinematic moment or an exit, never a kill. Only Wudang Quan "can use
Rituals in combat" (p.10).

### 3.2 The Final Blow is a naming ceremony

Confidence 88. Winning an exchange offers four choices (p.23):
damage, a Technique, a weapon swap, or an Opening. An Opening does
no damage. It buys one roll of 2d6 for doubles (p.25). On doubles
the blow lands and the Master may keep the move as a new named
Technique, gated by a LUCK roll, named from a d66 table of Action,
Attribute and Animal (p.26). Under a finisher policy a median Master
beats a Shi Fu 52% of the time with essentially every win a Final
Blow, at the cost of longer fights. Growth is earned through
spectacle, not kills.

The LUCK roll on p.25 says "On a failure, lose 1 LUCK"; the general
rule on p.22 subtracts one "regardless of the outcome". The two
sentences conflict; the reading I-12 picks p.25 and is sealed.

### 3.3 LUCK is a burning fuse

Confidence 82. LUCK starts at 7 to 12 (p.6). Every LUCK check costs
one point regardless of outcome (p.22); after four checks a LUCK-9
Master succeeds 42% of the time. Recovery is one point per
successful Spirituality check in a temple, only with incense (p.31,
p.47), under a threat: "Abusing the patience of the gods could cause
the opposite effect, or worse, bring a curse upon yourself." The
gambling house uses LUCK as a score without spending it (p.46). The
lotus flower of He Xiangu restores it and raises it by one, single
use (p.69), which marks LUCK recovery as treasure-tier.

### 3.4 Experience is a film review

Confidence 78. XP is four scores of 1 to 3: mission success, use of
equipment and environment, combat spectacularity, lateral thinking
(p.34). Dishonor points from failed escapes subtract (p.30). The
advancement table inverts costs by SKILL band: a low-SKILL Master
buys Martial Proficiency cheaply and LUCK dearly; a high-SKILL
Master buys LUCK and Training cheaply and Proficiency dearly (p.34).
SKILL and LUCK cap at 12 (p.35). One attribute point per adventure
is the pace. A Master who has perfected one style is pushed toward
breadth and fortune, which matches the epigraph on p.1, Lie Zi:
"Such powers belong to the Master, yet the greatest power is to
refrain from using them."

### 3.5 Weapons and armor do nothing to dice

Confidence 95. Stated for weapons (p.53) and for protections (p.55).
Equipment exists for narrative permission ("you cannot climb without
a rope", p.54), for the Martial Art's weapon requirement ("if you do
not have a weapon, do not add the specialization points", p.53), and
to feed the "use of equipment" XP score. Money is a status marker
from creation onward (p.5); mean starting gold is under 14 GP and a
Health Elixir costs 25.

### 3.6 The Oracle is the missing Game Master, and it is small on purpose

Confidence 85. One page of rows (p.58), two d66 tables for Action
and Theme (p.59, p.60), six d66 Spark word tables (p.61 to p.63).
The rulebook tells the player to consult them "when in doubt" for
"the answers you would normally ask the Game Master" (p.42). The
Spark tables are a mood board of the genre, to be "interpreted
intuitively" (p.60). The Oracle's job is to provoke, not to rule.

The p.58 table has merged cells that the text extraction flattens.
The printed spans, read from the rendered page, are:

| Row | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Closed Question | No, and | No | No, but | Yes, but | Yes | Yes, and |
| Outcome | Disaster | Negative | Negative | Positive | Positive | Excellent |
| NPC reaction | Hostile | Wary | Unaware | Kind | Helpful | Flee |
| Creature Reaction | Hostile | Territorial | Unaware | Curious | Docile | Flee |
| Encounter Outcome | Ambush | Attack | Attack | Attack | NPC/Creature Reaction | NPC/Creature Reaction |
| Enemy Type | Minion | Subordinate | Subordinate | Warrior | Warrior | Boss |
| No. of enemies | 1d6 | 3 | 3 | 2 | 2 | 1 |
| Enemy attack | Normal | Normal | Normal | Normal | Special | Special |
| Door | Open | Open | Open | Trapped | Locked | Closed |
| Object amount | Finished | One more | One more | Many remaining | Many remaining | Many remaining |
| Value | 5 GP | 10 GP | 25 GP | 50 GP | 100 GP | 250 GP |

Confidence 100 that these are the printed spans.

### 3.7 Opponents are cheap to run, and bosses are meant to be lost to

Confidence 85. Opponents never spend ENDURANCE on Techniques or
Rituals; their value is simply added to Attack Strength (p.66), with
no printed frequency. ATTACK on an opponent means how many can
strike at once (p.30). Minions can be run at ENDURANCE 1 and removed
on any hit (p.28, footnote). Spirits are immune to ordinary blows and
require a Technique, Ritual or special weapon (p.66). The design
keeps the solo player's bookkeeping on one side of the table.

Every printed opponent above SKILL 8 with a 3 or 4 Proficiency
out-modifies a fresh Master (mean SKILL 9.5 plus 4 against Shi Gong
14, Youxia 15, Dapeng 16). A median Master kills the Senior King
outright 19% of the time and breaks off by Unexpected Event 66%; a
weak Master (SKILL 7, Proficiency 2) never does. The book's answer
is on the same page as the combat rule: "if you think the enemy is
too tough, you can flee" (p.30), at a cost of 2 ENDURANCE and one
Dishonor Point. Appendix B names the arc, "Trial and error: ... the
protagonist is immediately confronted with the main challenge, which
is impossible to overcome. A sequence of improvements and trials will
begin" (p.86-87), and the Clan of the White Lotus diagram spells it
out: Training, Fight, Flee, Training, Fight, A new fighting style,
Near death, Rebirth, Final blow (p.89). The unwinnable first fight
is the intended shape of a session, not a balance error.
Confidence 75 on that last sentence.

### 3.8 Crowds are lethal unless treated as a scene

Confidence 72. Multiple Combat reduces the Master's SKILL by the
number of opponents faced (p.30). Simulated, a median Master against
three Devil servants wins 38% and breaks off 61%; against two
Bandits, 46% and 53%; a weak Master against any pair wins under 5%.
The book's own reliefs are the Techniques that reach several
opponents (Butterfly Palms, Light Body, p.12-13), the Double Strike
example (p.30), and the Minions footnote: "To streamline combat
while maintaining the idea of a chaotic scene, you can consider
Minions with ENDURANCE=1; if you hit you can remove one minion"
(p.28).

### 3.9 The Master is a whole style, not a stat block

Confidence 85. Every one of the eight pregenerated Masters (p.92)
carries Training points and at least one Technique or Ritual, and
each is drawn from a named film. Martial Arts are described by what
they let you do in the world (beg for lodging, always find a weapon,
use Rituals in combat) as much as by their Proficiencies (p.7 to
p.10). The creation procedure is meant to produce a character with a
filmography, not a build.

The sheets are portraits, not derived sheets: Beggar So has SKILL 10
with Proficiencies 4+1+3 and Training 2, which the p.11 rule would
have reduced; Sun Wukong's Training 4 buys 16 points against five
powers costing 11. The author values the film reference over the
arithmetic. Confidence 85 on the mismatch, 70 on the reading.

## 4. The book is shaped as a journey

Confidence 80 on the reading, 100 on the labels. The six chapter
dividers are I Ching hexagram names placed as an arc:

| Divider | Section it opens | Folio |
|---|---|---|
| ZHUN, Beginning | Master creation | p.4 |
| ZHEN, Actions | Actions, combat, healing | p.20 |
| SHENG, Ascending | Experience, adventure seeds | p.32 |
| LU, Traveller | Exploration, cities, market | p.40 |
| XUN, Proceeding | Oracle, inspirations, sparks | p.56 |
| SONG, Conflict | Encounters, treasures, opponents | p.64 |

The player is walked from birth to open road to conflict; the
opponents come last, after the Oracle. Eleven pages of Adventures,
exploration, city, oracle and sparks stand against nine of combat.
Appendix B then offers the three-act structure as the alternative to
sandbox play and says the quiet part aloud: "If the result of the
dice roll conflicts with the linear development of the story, ignore
the dice. Reach the plot point without lowering the tension" (p.84,
"ignore the dice" underlined). Confidence 100 that this sentence is
printed. Two film breakdowns (Clan of the White Lotus, Zu: Warriors
from the Magic Mountain, p.88 to p.91) show the intended shape of a
session.

Appendix A (p.81) frames the whole book as an open system that
readers are invited to edit: "Anyone can contribute to changing the
rules, expanding parts of the world, or adding details." The rules
are a starting draft by design; every table roll is a fallback ("If
it is not clear from the ongoing narrative, roll", p.27).

## 5. The 5 Treasures is the model scene

Confidence 90 on the source, 70 on the layout reading. The adventure
is two landscape pages, a cave map and nine keyed areas. It shows
how the author expects an adventure to be played with the sandbox
rules:

- **One Event roll per area** with four outcomes: Ambush!,
  Encounter, Safe exploration, Hint (a1). Hint text is marked "read
  this part only if" the Master learns it. Information is a reward
  gated by dice.
- **Five treasures, five different acquisitions** (a1, a2). Gourd by
  searching a dark storeroom. Seven-star sword by dueling Junior
  King. Plantain fan by beating Senior King. Dazzling Golden Cord
  from the Old Vixen, the demons' adoptive mother, who knows its
  spells. Jade vase from a guarded pedestal in the attendants' room.
  The Chieftain's papers teach how two treasures work. Knowledge and
  lateral thinking are loot, matching the XP review.
- **The key drops twice**, from the Skillful Beast and the Dexterous
  Ghost (a2), so the locked private quarters are reachable by either
  route. Devil-servant counts are sent to the Oracle ("use the Oracle
  for the number of devils"). The adventure trusts the sandbox
  procedures instead of restating them.
- **The map** (a1) places the kitchen and its pool, where the
  captured monk is tied, at the far end from the entrance. The moral
  hook is the deepest room; rescue is the last thing found.
- **Every treasure is an interruption tool**, not a damage bonus:
  day to night, binding, capture by name, inextinguishable fire,
  effortless blocking. The sword "can block hits from stronger
  enemies without any effort from the holder". The bosses out-modify
  a fresh Master by the numbers; the treasures are the intended
  equalisers.
- **Special skills are named, not defined** (Surround, Sneak attack,
  evanescence, immaterial charge, Shapeshifting, levitation, Magic
  flames, Call to arms!, somersault leap, whirlwind attack, axe
  throwing). The rulebook's rule for opponent Techniques (add the
  value to Attack Strength, p.66) is the only mechanical hook. The
  player is expected to invent what they do.
- **The Devil servant's LOOT on a 6** is the warning glyph, not a
  word (a2): a secret, not nothing.

## 6. Where the book is silent

By the author's own admission (p.3): what any Martial Proficiency,
Technique, Ritual or opponent skill does beyond its one line and its
number. Confidence 90.

By omission, with confidence that the text is silent: a tie in
gambling (95); the Final Blow LUCK deduction conflict above (90);
ATTACK "2-4" on the Brawler and the blank ATTACK on Huang Feng Guai
(95); whether Multiple Combat's SKILL reduction applies against one
opponent's ATTACK n (85); whether a Technique chosen as the winner's
option also deals the difference (85); how often an opponent's
Technique adds to their Attack Strength (85); any ENDURANCE cap
outside the Zheng Qi ritual's "without exceeding the initial value"
(85); whether zero ENDURANCE is death or unconsciousness, left to
the player (95); the currency of the Oracle's Value row (90).

Printed as such, to be carried verbatim (confidence 100): "Yauxia"
(p.67) against "Youxia" (p.79); "SKILLS 9" (p.74); "Giada" (p.62);
"CHamber" (p.92); "Open the mount close the mouth" (p.92) against
"Open the mouth, close the mouth" (p.17); Treasures row 5, column
17-19, "2d6 + Common Item" with no "GP" (p.68); the italic
"Supernatural" at Non-urban 2 and 12 (p.67), a redirect to the
Supernatural column.

## 7. What this means for the game

These follow from sections 2 to 6. They are recommendations for the
engine and app, not rules; the rules are in the PDFs.

1. **Model the tie and the Opening as first-class combat outcomes.**
   They end more fights than zero ENDURANCE does. A draw exits the
   combat phase and resumes only on rows 6 and 8 of p.28. An engine
   that treats a draw as a re-roll, or the Opening as a damage
   variant, has removed the game's main scene-change mechanism.
2. **Keep the four-choice win, every round, for as long as the fight
   lasts.** Damage, Technique, weapon, Opening. The choice on a won
   exchange is where the player authors the fight; a lost exchange
   is followed by another exchange ("The combat continues until",
   p.23), never by a forced exit.
3. **Make ENDURANCE spending on Techniques visible and cheap to
   choose,** with every known Technique offered and the p.24 warning
   against ending a fight with one printed beside them.
4. **Treat the Final Blow naming step as core, not flavour.** The
   d66 name table, the 1 to 4 value, the one-line description and
   the LUCK gate are the advancement system as much as the XP table
   is. Label the p.22 versus p.25 reading.
5. **Show LUCK draining.** Every LUCK check must visibly cost a
   point, except at the gambling table. Temple recovery must require
   incense and a check.
6. **Do not rebalance opponents.** The printed numbers make bosses
   unwinnable for a fresh Master; that is the trial-and-error arc.
   Surface Escape prominently and price it as printed.
7. **Crowds: SKILL minus the headcount, ATTACK n attacks, and the
   Minions footnote offered as the optional rule it is.**
8. **Say when a check cannot fail.** A threshold of 12 or more on a
   2d6-under check is automatic in the book; where a sealed house
   rule changes that, say so where the roll is shown.
9. **Score adventures as a film review.** The four 1 to 3 scores
   and Dishonor are the end-of-adventure screen, as judgements the
   player makes.
10. **Every table roll is overridable.** "If it is not clear from
    the ongoing narrative" (p.27) and "ignore the dice" (p.84) are
    rules. Allow a manual result on every table, and record that it
    happened.
11. **Weapons and armor are permissions, not modifiers.** Never add
    equipment to a roll. Do let equipment unlock actions and feed
    the XP review.
12. **The Oracle should provoke, not decide,** and its spans should
    be exactly the printed ones in section 3.6.
13. **Carry printed defects and misspellings verbatim, flagged,**
    never normalised in text (section 6). Undefined skills and item
    effects stay as text with the one printed hook.
14. **Adventures are keyed lightly.** Per-area Event roll, encounter
    columns, gated Hints, loot on foes. The 5 Treasures is the
    template for any adventure the app ships.

## 8. Numbers behind the thesis

Exact 2d6 figures and simulation outputs used above.

| Modifier advantage (Master minus opponent) | P(win exchange) | P(tie) | E[damage dealt per round] | E[damage taken per round] |
|---|---|---|---|---|
| -3 | 16% | 8% | 0.35 | 3.35 |
| -1 | 34% | 11% | 0.93 | 1.93 |
| 0 | 44% | 11% | 1.37 | 1.37 |
| +1 | 56% | 11% | 1.93 | 0.93 |
| +3 | 76% | 8% | 3.35 | 0.35 |
| +5 | 90% | 4% | 5.10 | 0.10 |

Simulated one-on-one fights, damage-only play, no Techniques, no
Openings, fight ends on a tie (10,000 to 20,000 runs each):

| Matchup | Master wins outright | Master falls | Ended by draw | Mean exchanges |
|---|---|---|---|---|
| Master mod 11 / END 18 vs Shi Fu 11 / END 17 | 19% | 16% | 65% | 5.8 |
| Median (SKILL 9, Prof 4, END 19) vs Shi Fu (9+2, END 17) | 52% | 0% | 47% | 4.9 |
| Median vs Senior King (9+4, END 18) | 19% | 15% | 66% | 6.0 |
| Median vs Shi Gong (10+4, END 18) | 5% | 32% | 62% | 5.8 |
| Weak (SKILL 7, Prof 2, END 14) vs Guard (8+3, END 15) | 1% | 57% | 42% | 4.4 |
| Strong (SKILL 12, Prof 4, END 24) vs Dapeng (12+4, END 24) | 12% | 11% | 77% | 6.9 |

Simulated multiple combat, SKILL reduced by the headcount, each
opponent attacking, no reach Technique:

| Matchup | Master wins | Master falls | Ended by draw |
|---|---|---|---|
| Median vs 2 Devil servants (5+3, END 7) | 66% | 0% | 34% |
| Median vs 3 Devil servants | 38% | 1% | 61% |
| Median vs 4 Minions at END 1 | 57% | 0% | 43% |
| Weak vs 2 Devil servants | 5% | 42% | 53% |

Reading: against anything at or above the Master's level, attrition
loses. The book's tools (Techniques, Openings, escape, the draw
table, treasures) are not optional flourishes. They are the only way
through.

## 9. Where the two readings differed

- The first reading rated the thesis 85; the second 80, weighing the
  sandbox sentence on p.81. Merged at 82.
- The first reading gave the dividers' hexagram numbers and named
  the adventure's Journey to the West source. Neither is printed in
  the books; both are dropped here as book facts.
- The second reading added the Oracle spans, the p.22/p.25 conflict,
  the multiple-combat figures, the trial-and-error reading of boss
  numbers, the printed defects and the pregen arithmetic, all from
  the full visual pass. Adopted.
- The first reading's adventure inferences (the key drops twice,
  rescue is the deepest room) were transcribed but not drawn by the
  second. Adopted at 70.
- No disagreement on any printed rule was found.
