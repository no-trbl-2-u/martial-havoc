# Determined intent

A reading of what Gianluca Monaco built Martial Havoc to make a
player feel, derived from the two PDFs at the repository root and
nothing else. Every claim carries a confidence score (0 = guess,
100 = fact printed in the book) and a folio. Folios are the
printed page numbers (PDF page minus one for the rulebook); the
adventure's two pages are `a1` and `a2`.

This file is interpretation. Where it disagrees with the PDFs, the
PDFs win (agents.md standing rule 9).

## 1. Method

| Step | What was done |
|---|---|
| Text | Every page of both PDFs extracted with pymupdf and read in order, 94 rulebook pages and 2 adventure pages. |
| Images | Pages under 70 words or carrying images rendered to PNG and read visually: cover, six chapter dividers, three-act diagrams (p.82, p.83, p.89), the eight pregenerated sheets (p.92), the cave map (a1). |
| Math | Exact 2d6 probabilities and a 20,000-run simulation of representative fights under the printed combat rule (p.23). |

## 2. Thesis

Martial Havoc is a machine for producing a Hong Kong martial-arts
film one scene at a time, for one player with no referee. The
numbers are tuned so that dice interrupt a scene and hand it back
to the player, rather than conclude it. Confidence 85.

Evidence, all from the printed rules:

| Signal | Value | Folio |
|---|---|---|
| Tie per combat exchange, equal modifiers | 11.3% | p.27 |
| Equal-peer fight ended by a draw before either side drops | 65% | p.23, sim |
| Equal-peer fight won outright by attrition | 19% | p.23, sim |
| Final Blow lands (doubles on 2d6) | 16.7% | p.25 |
| Draw table result "the fight resumes" | 27.8% | p.28 |
| Draw table result "reinforcements" | 16.7% | p.28 |
| Roll-under success at SKILL 7 | 58% | p.22 |
| Roll-under success at SKILL 12 | 100% | p.22 |

A fight against a peer almost never resolves by trading damage. It
resolves by an Unexpected Event, a Technique, an Opening, or an
escape. The text states the frame directly: after a draw "you are
no longer in the combat phase", the two opponents stand with
weapons crossed "staring into each other's eyes for seconds...
then something happens" (p.27). Combat is a beat, not a grind.

The introduction (p.3) declares the rest: "Some terms or mechanics
are intentionally ambiguous to encourage player interpretation.
The rulebook gives you the tools, the story comes from your
imagination." Confidence 100 that this is the stated design goal.

## 3. What each system is for

### 3.1 Techniques are ENDURANCE converted into authorship

Confidence 90. A Technique needs no roll and always works; the
cost is ENDURANCE equal to its value (p.24). The same page then
says not to use a Technique to end a fight: a knockdown "does not
mean that they are defeated, but that you have gained a great
advantage, or the chance to escape without consequences." The
player pays health to buy a guaranteed cinematic moment or an
exit, never a kill. This is the "flying kicks, close-ups of
furrowed brows" promise of p.3 made mechanical.

### 3.2 The Final Blow is a naming ceremony

Confidence 90. Winning an exchange offers four choices (p.23):
damage, a Technique, a weapon swap, or an Opening. An Opening does
no damage. It buys one roll of 2d6 for doubles (p.25). On doubles
the blow lands and the Master may keep the move as a new named
Technique, gated by a LUCK check, named from a d66 table of Action,
Attribute and Animal (p.26). The reward for gambling a won exchange
is a permanent addition to the Master's style. Growth is earned
through spectacle, not kills.

### 3.3 LUCK is a burning fuse

Confidence 80. LUCK starts at 7 to 12 (p.6). Every LUCK check
costs one point regardless of outcome (p.22). Recovery is one
point per successful Spirituality check in a temple, and only with
incense (p.31, p.47). The gambling house uses LUCK as a score
without spending it (p.46). The player is meant to feel LUCK drain
and to ration it toward the climax. The lotus flower of He Xiangu
restores it and raises it by one, single use (p.69), which marks
LUCK recovery as treasure-tier.

### 3.4 Experience is a film review

Confidence 75. XP is four scores of 1 to 3: mission success, use of
equipment and environment, combat spectacularity, lateral thinking
(p.34). Dishonor points from failed escapes subtract (p.30). The
advancement table inverts costs by SKILL band: a low-SKILL Master
buys Martial Proficiency cheaply and LUCK dearly; a high-SKILL
Master buys LUCK and Training cheaply and Proficiency dearly
(p.34). SKILL and LUCK cap at 12 (p.35). A Master who has perfected
one style is pushed toward breadth and fortune. This matches the
epigraph on p.1, Lie Zi: "Such powers belong to the Master, yet the
greatest power is to refrain from using them."

### 3.5 Weapons and armor do nothing to dice

Confidence 95. Stated for weapons (p.53) and for protections
(p.55). Equipment exists for narrative permission ("you cannot
climb without a rope", p.54), for the Martial Art's weapon
requirement, and to feed the "use of equipment" XP score. Money is
a status marker from creation onward (p.5).

### 3.6 The Oracle is the missing Game Master, and it is small on purpose

Confidence 85. One page of rows (p.58), two d66 tables for Action
and Theme (p.59, p.60), six d66 Spark word tables (p.61 to p.63).
The rulebook tells the player to consult them "when in doubt" for
"the answers you would normally ask the Game Master" (p.42). The
Spark tables are a mood board of the genre, to be "interpreted
intuitively" (p.60). The Oracle's job is to provoke, not to rule.

### 3.7 Opponents are cheap to run

Confidence 90. Opponents never spend ENDURANCE on Techniques or
Rituals; their value is simply added to Attack Strength (p.66).
ATTACK on an opponent means how many can strike at once (p.30).
Minions can be run at ENDURANCE 1 and removed on any hit (p.28).
Spirits are immune to ordinary blows and require a Technique,
Ritual or special weapon (p.66). The design keeps the solo
player's bookkeeping on one side of the table.

### 3.8 The Master is a whole style, not a stat block

Confidence 85. Every one of the eight pregenerated Masters (p.92)
carries Training points and at least one Technique or Ritual, and
each is drawn from a named film. Martial Arts are described by
what they let you do in the world (beg for lodging, always find a
weapon, use Rituals in combat) as much as by their Proficiencies
(p.7 to p.10). The creation procedure is meant to produce a
character with a filmography, not a build.

## 4. The book is shaped as a journey

Confidence 80 on the reading, 100 on the labels. The six chapter
dividers are I Ching hexagrams placed as an arc:

| Divider | Hexagram | Section it opens | Folio |
|---|---|---|---|
| ZHUN, Beginning | 3, difficulty at the beginning | Master creation | p.4 |
| ZHEN, Actions | 51, thunder, the arousing | Actions, combat, healing | p.20 |
| SHENG, Ascending | 46, pushing upward | Experience, adventure seeds | p.32 |
| LU, Traveller | 56, the wanderer | Exploration, cities, market | p.40 |
| XUN, Proceeding | 57, the gentle wind | Oracle, inspirations, sparks | p.56 |
| SONG, Conflict | 6, conflict | Encounters, treasures, opponents | p.64 |

The player is walked from birth to open road to conflict. Appendix
B then offers the three-act structure as the alternative to sandbox
play and says the quiet part aloud: "If the result of the dice roll
conflicts with the linear development of the story, ignore the
dice. Reach the plot point without lowering the tension" (p.84).
Confidence 100 that this sentence is printed. Two film breakdowns
(Clan of the White Lotus, Zu: Warriors from the Magic Mountain,
p.88 to p.91) show the intended shape of a session: training,
failed attacks, escape, a new style, near death, rebirth, final
blow.

Appendix A (p.81) frames the whole book as an open system that
readers are invited to edit. The rules are a starting draft by
design.

## 5. The 5 Treasures is the model scene

Confidence 90 on the source, 70 on the layout reading. The
adventure is Journey to the West, the Gold Horn and Silver Horn
kings of Lotus Flower Cave on Flat-top Mountain, compressed to two
landscape pages. It shows how the author expects an adventure to
be played with the sandbox rules:

- **One Event roll per area** with four outcomes: Ambush, Encounter,
  Safe exploration, Hint (a1). Hint text is marked "read this part
  only if" the Master learns it. Information is a reward gated by
  dice.
- **Five treasures, five different acquisitions** (a1, a2). Gourd by
  searching a dark storeroom. Seven-star sword by dueling Junior
  King. Plantain fan by beating Senior King. Dazzling Golden Cord
  from the Old Vixen, the demons' adoptive mother, who knows its
  spells. Jade vase from a guarded pedestal in the attendants'
  room. The Chieftain's papers teach how two treasures work.
  Knowledge and lateral thinking are loot, matching the XP review.
- **The key drops twice**, from the Skillful Beast and the Dexterous
  Ghost (a2), so the locked private quarters are reachable by
  either route. Devil-servant counts are sent to the Oracle. The
  adventure trusts the sandbox procedures instead of restating
  them.
- **The map** (a1) places the kitchen and its pool, where the
  captured monk is tied, at the far end from the entrance. The
  moral hook is the deepest room; rescue is the last thing found.
- **Every treasure is an interruption tool**, not a damage bonus:
  day to night, binding, capture by name, inextinguishable fire,
  effortless blocking. They extend the same philosophy as
  Techniques: control the scene, not the hit-point total.

## 6. What this means for the game

These follow from sections 2 to 5. They are recommendations for
the engine and app, not rules; the rules are in the PDFs.

1. **Model the tie and the Opening as first-class combat outcomes.**
   They end more fights than zero ENDURANCE does. An engine that
   treats a draw as a re-roll, or the Opening as a damage variant,
   has removed the game's main scene-change mechanism.
2. **Keep the four-choice win.** Damage, Technique, weapon, Opening.
   The choice on a won exchange is where the player authors the
   fight. Auto-applying damage removes the decision the whole
   combat chapter is built around.
3. **Make ENDURANCE spending on Techniques visible and cheap to
   choose.** The design wants the player to trade health for
   spectacle often. Friction here pushes play back toward attrition.
4. **Treat the Final Blow naming step as core, not flavour.** The
   d66 name table, the 1 to 4 value, the one-line description and
   the LUCK gate are the advancement system as much as the XP
   table is.
5. **Show LUCK draining.** Every LUCK check must visibly cost a
   point. Temple recovery must require incense and a check.
6. **Score adventures as a film review.** The four 1 to 3 scores
   and Dishonor are the end-of-adventure screen. Present them as
   judgements the player makes, since the book asks the player to
   assign them.
7. **In Cinematic Journey mode, "ignore the dice" is a rule.** The
   engine should allow the player to override an Event result to
   reach a plot point, and record that it happened.
8. **Weapons and armor are permissions, not modifiers.** Never add
   equipment to a roll. Do let equipment unlock actions and feed
   the XP review.
9. **The Oracle should provoke, not decide.** Present rows, Actions,
   Themes and Sparks as prompts with room for the player's
   interpretation, never as resolved outcomes.
10. **Adventures are keyed lightly.** Per-area Event roll, encounter
    columns, gated Hints, loot on foes. The 5 Treasures is the
    template for any adventure the app ships.

## 7. Numbers behind the thesis

Exact 2d6 figures and simulation outputs used above.

| Modifier advantage (Master minus opponent) | P(win exchange) | P(tie) | E[damage dealt] | E[damage taken] |
|---|---|---|---|---|
| -3 | 16% | 8% | 0.35 | 3.35 |
| -1 | 34% | 11% | 0.93 | 1.93 |
| 0 | 44% | 11% | 1.37 | 1.37 |
| +1 | 56% | 11% | 1.93 | 0.93 |
| +3 | 76% | 8% | 3.35 | 0.35 |
| +5 | 90% | 4% | 5.10 | 0.10 |

Simulated fights, damage-only play, no Techniques, no Openings,
fight ends on a tie (20,000 runs each):

| Matchup | Master wins outright | Ended by draw | Mean exchanges |
|---|---|---|---|
| Master 11 / END 18 vs Shi Fu 11 / END 17 | 19% | 65% | 5.8 |
| Master 11 / END 18 vs Bandit 9 / END 9 | 69% | 31% | 3.3 |
| Master 11 / END 18 vs Senior King 13 / END 18 | 1% | 49% | 5.1 |
| Master 11 / END 18 vs Dapeng 16 / END 24 | 0% | 16% | 3.7 |

Reading: against anything at or above the Master's level, attrition
loses. The book's tools (Techniques, Openings, escape, the draw
table, treasures) are not optional flourishes. They are the only
way through.
