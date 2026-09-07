# Critique log

> Last pass: never
> Pass count: 0

> External-observer feedback for Martial Havoc. Populated by
> `/critique`, drained by `/iterate`. See `skills/critique.md`
> for the contract.

## Pending

### [HIGH] skills/ship-a-phase.md — the dispatcher picks by list order, not by dependency
- pass: user-jot (commit 14d178e)
- viewport: unspecified
- auth_state: anonymous
- category: reliability
- observation: ship-a-phase §Step 1 takes "the first `[ ]` row" and skips only `[skipped]` and `[blocked: ...]`. It never reads the `Waits on` line that every phase brief and every per-phase scope section carries. The feel-of-play block is a DAG, not a chain - 10c, 10d, 10f and 10h are all unblocked right now, while 10e waits on 10d, 10g waits on 10d, and 10i waits on 10c and 10f - so the plan's own row order is the only thing keeping the loop from picking a phase whose dependency has not shipped. It happens to be correct today; nothing enforces that it stays correct, and a reordering or an /expand insertion would break it silently.
- evidence: skills/ship-a-phase.md Step 1 and §10; plan/steps/01_build_plan.md "Waits on" at lines 390, 412, 433, 444; observed while answering a direct question about phase dependencies, 2026-09-07T04:34:50Z
- suggested fix: Have Step 1 read the candidate row's brief for `Waits on` and skip any phase whose named dependencies are not `[x]`, reporting which one it skipped and why. Cheap version: assert in a test that the row order in 01_build_plan.md is a topological order of the Waits on graph, so a bad reordering is red rather than silent.
- source: user

### [MED] packages/content — the fight prints a second-person line beside the narrator's third-person one
- pass: user-jot (commit 14d178e)
- viewport: unspecified
- auth_state: anonymous
- category: voice
- observation: Phase 10a gave the app a narrator who speaks in the third person and names the Master, and put him on the combat screen at the end of a fight. The Unexpected Event lines on the same screen still address the Master directly - "Something above takes an interest in you, and the interest is not friendly" (line.unexpected-event.2) - so a tie followed by a kill prints "you" and then "San Te" in the same column, inches apart. This is the one place the 10a exclusion is visible to a player rather than merely recorded in a commit body.
- evidence: packages/content/data/rules/unexpected-event-lines.json line.unexpected-event.2; apps/app/src/screens/CombatScreen.tsx renders c.event.line above the fight-end Narrator; plan/VOICE.md "Never the second person for the Master"
- suggested fix: Decide who speaks the Unexpected Event line. Either it is the table reading itself aloud and stays as printed - in which case say so in VOICE.md so the mixed register is a choice - or it is the narrator, and the eleven rows are rewritten to his guide and brought under voice.test.ts.
- source: user

### [MED] packages/content — 149 authored lines are held to no style guide at all
- pass: user-jot (commit 14d178e)
- viewport: unspecified
- auth_state: anonymous
- category: voice
- observation: Phase 10a deliberately scoped voice.test.ts to the narrator's three homes (result-lines, area lines, act lines) and left the 72 effect lines, 66 Oracle lines and 11 Unexpected Event lines outside it, on the reading that those are a table speaking rather than a storyteller. That reading may well be right, but the consequence is that 149 of the build's 182 authored lines - the large majority - are governed by nothing: no length cap, no register, no test. The number is printed on ABOUT as one figure, which reads as one voice.
- evidence: packages/content/src/voice.test.ts preamble; contentCounts().authoredLines = 182, of which 33 are held to plan/VOICE.md; commit 139d503 body, third Decision
- suggested fix: Either write the second guide the exclusion implies (a table-voice section in VOICE.md, with its own test), or fold the three files into the narrator's guide and rewrite them. Until one or the other, the ABOUT count is describing a consistency the content does not have.
- source: user

### [MED] general — the container has no .env, so the documented triage and mirror paths both fail
- pass: user-jot (commit 14d178e)
- viewport: unspecified
- auth_state: anonymous
- category: reliability
- observation: skills/march.md Step 1 loads GH_TOKEN and GH_REPO from .env and shells out to `gh`; scripts/loop-issue.mjs does the same. In this cloud container there is no .env and no `gh` binary, so the triage gate falls through on every tick (the skill says not to fail the march, and it does not) and `loop-issue.mjs phase-open` exits on "GH_REPO missing", then on "gh label create exited null". Both phase mirrors this session were opened through the GitHub MCP by hand instead. The loop therefore runs with its cheapest gate permanently blind, and the blindness is indistinguishable from an empty issue list.
- evidence: `test -f .env` false and `command -v gh` empty at 2026-09-07T03:05Z; loop-issue.mjs phase-open failed twice; issues #36 and #37 opened via mcp__github__issue_write
- suggested fix: Give the two scripts a fallback that does not need the gh binary, or make the march's triage step say out loud that it could not check rather than falling through silently. A gate that cannot run should not look like a gate that passed.
- source: user

### [LOW] e2e — deed assertions are pinned to a running total, so one new deed edits four specs
- pass: user-jot (commit 14d178e)
- viewport: unspecified
- auth_state: anonymous
- category: maintainability
- observation: Four e2e assertions check the deeds ledger by its count ("DEEDS 2", "2 DEEDS") rather than by what is in it. Phase 10b added one deed - taking the trail - and every one of them had to be bumped by hand, in three files, none of which is about the trail. The count assertions also pass for the wrong reasons: three deeds of any kind satisfies them.
- evidence: e2e/creation.spec.ts:154 and :243, e2e/prototype.spec.ts:183 and :216, all edited in commit 3053fc2
- suggested fix: Assert the deed text the spec is actually about (record-deeds already contains it, and one assertion in creation.spec.ts already does this) and keep at most one count assertion, in the record spec where the count is the subject.
- source: user


### [MED] packages/content + docs — five rule-file fields carry the docs' gloss, not the book's text
- pass: user-jot (PR #21 session, verbatim report 2026-09-06)
- viewport: unspecified
- auth_state: anonymous
- category: correctness
- observation: Checking every transcribed JSON field (1043) directly against the pdf-parse extractions finds 14 not verbatim; 9 are extraction artefacts the docs already note (split words, the appendix image). The other 5 are docs gloss cells transcribed into label: rule files as if printed: healing.endurance.partial and healing.luck.partial (summaries of the p.31 list; the LUCK cell carries "(p. 47)"), xp-category.minus-dishonor-points.category ("minus Dishonor Points" is the doc's row, not a printed category), unexpected-event.7.text (carries "(footnote: optional ENDURANCE=1 rule, R33)" inside the printed row "Reinforcements: 1-4 Minions of the same type"), loot.the-5-treasures.devil-servant.3.item ("[warning-triangle icon, no text]" stands in for an icon; the schema requires item minLength 1).
- evidence: scratch probe json-vs-pdf, 2026-09-06; docs/rules/multiple-combat-escape-healing.md rows 74-78, docs/rules/experience-and-advancement.md row 50, docs/rules/combat.md row 127, docs/campaigns/the-5-treasures/foes.md row 31
- suggested fix: Correct each at its docs source and change the dependent record in the same commit (fidelity.test.ts holds JSON to docs, so they cannot move separately): healing partial cells quoted verbatim from p.31 with the incense note moved to prose; the Dishonor row moved out of the categories table into the R43 arithmetic; the footnote marker taken out of row 7's text and left in the R33 row; the loot item given the printed value the icon stands for once I-08 says what it is, or the schema allowed an empty item when hint is true.
- source: user

### [MED] docs — table cells do not say which are transcription and which are the bundle's gloss
- pass: user-jot (PR #21 session, verbatim report 2026-09-06)
- viewport: unspecified
- auth_state: anonymous
- category: fidelity
- observation: Of 879 table cells of 12+ characters under docs/rules, docs/world and docs/campaigns, 605 are verbatim in the extraction and 274 are not; the 274 are dominated by the bundle's own words (summary tables, "mechanical (schema)", "Position on the plan", encounter bands rewritten with semicolons). Only foes.md marks a column "(verbatim)". Blockquotes are 11 of 11 verbatim. Without a marker a docs-to-PDF gate cannot be built, so VISION.md's "verbatim and cited" is checked only from JSON back to docs (PR #21) and from JSON to the PDF by hand.
- evidence: scratch probes proofread and proofread-quotes, 2026-09-06; docs/index.md Conventions has no verbatim rule and no pip rule
- suggested fix: Add two conventions to docs/index.md: a cell or quote that transcribes the book is verbatim and a column that does so carries "(verbatim)" in its header, everything else is gloss; dice pips are written as digits. Retrofit the headers table by table, then add a docs-to-PDF leg beside fidelity.test.ts that checks only marked columns and blockquotes. Log the pass in docs/log.md.
- source: user

### [LOW] docs — about half the rulebook's prose is not in the bundle
- pass: user-jot (PR #21 session, verbatim report 2026-09-06)
- viewport: unspecified
- auth_state: anonymous
- category: completeness
- observation: 49 percent of the rulebook's 8-word windows are found in docs/ (lower bound; pdf-parse splits words). The tables are complete. Absent or partial: the introduction, the Lie Zi epigraph, the WuXia paragraph, most of "Cinematic journey" (p.81-91), the worked examples, the pre-generated sheets as prose. VISION.md says "the rulebook and the adventure are decomposed, verbatim and cited, under docs/"; the adventure is, the rulebook's prose is not.
- evidence: scratch probe sentences and shingles, 2026-09-06; docs/world/cinematic-journey.md quotes one paragraph of eleven pages
- suggested fix: A transcription pass from the PDF pages (not the extraction) into the existing concepts' prose sections, one folio per commit, each verified against the render; no engine or app change follows from it until a phase asks for the introduction on screen.
- source: user


The `/critique` pass proper still waits for Phase 8 (The UI) to ship and
the deploy to be green (set via oversight 2026-09-05). The rows below are
not from that pass: they are the carry-overs the `/march` loop of
2026-09-05/06 left behind after shipping Phases 3 and 4, filed here so
`/iterate` drains them rather than losing them.

### [MED] packages/content — effects.json operation strings are unverified
- pass: user-jot (commit 884f341)
- viewport: unspecified
- auth_state: anonymous
- category: correctness
- observation: The 72 effect records name engine calls (combat.opening, healing.heal, multiple.areaDamage, progression.ordinaryBlowsPass, oracle.consult). effects.test.ts only checks the shape `namespace.name`, not that the export exists, so a rename in packages/engine leaves a dangling operation silently. The content package deliberately imports no engine, so the check cannot live there.
- evidence: carried over from the /march loop of 2026-09-05/06 (Phases 3 and 4), user-spotted at 2026-09-06T01:20:04Z
- suggested fix: Add an engine-side test that imports the effects table and asserts every non-null operation resolves against the engine's public surface. Natural home is the Phase 8 wiring commit.
- source: user

### [MED] scripts/loop-issue.mjs — phase mirror dies when the gh CLI is absent
- pass: user-jot (commit 884f341)
- viewport: unspecified
- auth_state: anonymous
- category: reliability
- observation: loop-issue.mjs shells out to `gh` for both label creation and issue open. On a cloud runner without the gh CLI it exits at `gh label create` with `exited null`, so ship-a-phase step 2.5 always fails there. Hard rule 10 keeps that non-gating, but the public phase timeline is silently lost; two mirrors this session had to be opened by hand through the API and labelled by hand.
- evidence: carried over from the /march loop of 2026-09-05/06 (Phases 3 and 4), user-spotted at 2026-09-06T01:20:04Z; recurred twice on 2026-09-06 (phase mirrors #11 and #13 were opened through the GitHub MCP by hand, and #11 had to be labelled loop:opened by hand afterwards - without those labels the next /march tick counted its own mirror as an untriaged issue and would have dispatched to /triage)
- suggested fix: Fall back to the GitHub REST API (GH_TOKEN is already required) when `gh` is not on PATH, and default GH_REPO to no-trbl-2-u/martial-havoc instead of erroring.
- source: user

### [MED] general — CLOUDFLARE_API_TOKEN cannot read Workers Builds
- pass: user-jot (commit 884f341)
- viewport: unspecified
- auth_state: anonymous
- category: reliability
- observation: The token reads /accounts/{id}/workers/scripts and uploads versions, but every /accounts/{id}/builds/** path returns code 12006 Invalid token. When a Workers Build fails, the loop can see that it failed and nothing about why, which is what turned one CI failure this session into an undiagnosable blocker. Documented scope in agents.md is 'Workers Scripts: Edit' only.
- evidence: carried over from the /march loop of 2026-09-05/06 (Phases 3 and 4), user-spotted at 2026-09-06T01:20:04Z; confirmed live on 2026-09-06 - GET /accounts/{id}/builds/builds/4d4b7cc8 returned code 12006 Invalid token while the same token uploaded versions fine. It is why the branch-build failure had to be diagnosed by reproduction rather than by reading the log, and why that diagnosis is still unconfirmed
- suggested fix: Widen the token with Workers Builds read and say so in .env.example next to the existing CLOUDFLARE_API_TOKEN line.
- source: user

### [LOW] docs/rules/readings — A23's five-class effect model was adopted without review
- pass: user-jot (commit 884f341)
- viewport: unspecified
- auth_state: anonymous
- category: observation
- observation: Reading A23 is the estate's one ambiguity row with no defensible inference - the central design question, all 72 Technique and Ritual effects being prose without numbers. Phase 4 adopted A23's own suggested classification wholesale and authored all 72 records under it, labelled invention and cited to A23. It is the largest interpretive call in Phases 3 and 4 and no operator has confirmed it.
- evidence: carried over from the /march loop of 2026-09-05/06 (Phases 3 and 4), user-spotted at 2026-09-06T01:20:04Z
- suggested fix: Review world/effects.json class and operation columns under /oversight; reserve any record the operator would rather author, and record the confirmation (or a revision) against A23 in docs.
- source: user

### [MED] apps/app — light palette only; dark and dynamic type deferred
- pass: user-jot (commit 40b3dd5)
- viewport: unspecified
- auth_state: anonymous
- category: accessibility
- observation: The prototype ships one palette. design/V1-DESIGN-PROMPT.md requires light and dark, system-driven, and dynamic type to 130 percent without breaking the beat screen. Neither is built; tokens are in apps/app/src/theme/tokens.ts and every colour goes through them.
- evidence: user-spotted at 2026-09-06T03:16:00Z (PR #10, the design prototype landing)
- suggested fix: Phase 8: a dark token set behind useColorScheme, and a Playwright pass at 130 percent font scale on the beat and combat screens.
- source: user

### [MED] apps/app — combat offers only the first usable Technique
- pass: user-jot (commit 40b3dd5)
- viewport: unspecified
- auth_state: anonymous
- category: correctness
- observation: CombatScreen picks the first Technique whose effect timing is combat-winner-option (San Te: Iron head). A Master who knows several gets no chooser, and the Technique does nothing mechanical beyond its ENDURANCE cost and its authored line.
- evidence: user-spotted at 2026-09-06T03:16:00Z (PR #10, the design prototype landing)
- suggested fix: A sub-menu of usable Techniques when more than one qualifies, and the effect operation (effects.json) wired to the engine call it names.
- source: user

### [MED] design/prototype — the Claude Design file disagrees with docs in four places
- pass: user-jot (commit 40b3dd5)
- viewport: unspecified
- auth_state: anonymous
- category: content
- observation: Recorded in design/INDEX.md: a Spirituality attribute (the Master has three, R01), Morale on 2d6 with 7 or under holding (the sealed rule is a d6 table), invented cave areas (a stone bowl, a low gallery), and a Ghost at SKILL 5 END 6 (the Dexterous Ghost is 7 and 8, 5T a2). The app follows docs; the design file still shows the old values.
- evidence: user-spotted at 2026-09-06T03:16:00Z (PR #10, the design prototype landing)
- suggested fix: A design pass in Claude Design correcting the four, so the reference and the app agree; then re-export to design/prototype.
- source: user

### [LOW] apps/app — region labels can still collide after the spread pass
- pass: user-jot (commit 40b3dd5)
- viewport: unspecified
- auth_state: anonymous
- category: visual
- observation: apps/app/src/lib/spread.ts keeps glyphs 58 units apart, but the mile boxes at link midpoints and the YOU ARE HERE label can still sit on a neighbour when three points line up (design/screenshots/16-region.png).
- evidence: user-spotted at 2026-09-06T03:16:00Z (PR #10, the design prototype landing)
- suggested fix: Place mile labels off the midpoint along the link normal, and skip a label whose box would overlap a glyph.
- source: user

### [LOW] apps/app — manual dice not offered for the treasure d6
- pass: user-jot (commit 40b3dd5)
- viewport: unspecified
- auth_state: anonymous
- category: correctness
- observation: The dice on the table cover the Master 2d6 rolls (checks, Attack Strength, the Final Blow). The R78 treasure roll is one d6 and always reads the table source, so a player who rolled it at the table cannot enter it.
- evidence: user-spotted at 2026-09-06T03:16:00Z (PR #10, the design prototype landing)
- suggested fix: Let the manual panel accept one face when the pending roll is 1d6.
- source: user

### [LOW] general — commit attribution policy conflicts with the cloud harness
- pass: user-jot (commit 40b3dd5)
- viewport: unspecified
- auth_state: anonymous
- category: process
- observation: The cloud harness asks for a co-author trailer and a session-link trailer on every commit; agents.md rule 2 forbids trailers and .claude/hooks/guard.mjs blocks them. PR #10 followed the repository. The PR body carried the harness footer since rule 2 does not name PR bodies.
- evidence: user-spotted at 2026-09-06T03:16:00Z (PR #10, the design prototype landing)
- suggested fix: Decide once in agents.md whether a session-link trailer is sanctioned (guard.mjs names Cloud-Run as the only allowed trailer) and align the two.
- source: user

### [MED] scripts/deploy.mjs — the branch-build fix and the dashboard config disagree
- pass: loop (commit 2338c05)
- viewport: unspecified
- auth_state: anonymous
- category: reliability
- observation: 526b63a made deploy.mjs run `npm run build:web` itself when apps/app/dist is missing, and the next branch build (b1ea4755, 526b63a) was the first non-production Workers Build ever to go green. That is a clean before/after on one repo variable, and it is consistent with the local reproduction: on a fresh checkout `node scripts/deploy.mjs --upload-only` exited 3 at its `apps/app/dist is empty` guard. But it contradicts the retired row that recorded the dashboard build command as `npm run build:web` - if that command really runs before the Version command, the export would already exist and the fix would have been a no-op. One of the two is wrong: either the builder is not running the build command for non-production branches, or it is not preserving its output into the Version step. Nobody has read the build log.
- evidence: red on f894bdf (4d4b7cc8) and 4a1778a (ac74f2db), both ~40s; green on 526b63a (b1ea4755) with only deploy.mjs changed, at 2026-09-06T05:30:00Z
- suggested fix: Read one non-production build log in the dashboard and settle it. If the build command is not running off main, say so next to agents.md rule 4 and keep deploy.mjs self-sufficient; if it is running, the guard was a symptom and the real cause is still unfound.
- source: agent

### [LOW] docs/campaigns/the-5-treasures — I-41 and I-38b disagree on the Cord's spells
- pass: loop (commit 2338c05)
- viewport: unspecified
- auth_state: anonymous
- category: content
- observation: Reading I-41 says the Dazzling Golden Cord is inert until its spells are known, "from her (Kind/Helpful reaction), or from the Chieftain's sheets (A55)". Reading I-38b says the two treasures the Chieftain's sheets explain are the fan and the gourd - a guess. Both cannot hold: the sheets cannot explain the fan, the gourd and the Cord when the adventure says they explain two. Phase 5 shipped `knownFrom: ["foe.old-vixen"]` on the Cord, taking I-38b's list as the narrower and better-evidenced claim, and recorded the disagreement in the commit body only.
- evidence: found while transcribing treasures.json for Phase 5, at 2026-09-06T05:30:00Z
- suggested fix: Settle it in docs/rules/readings/discrepancies.md - either widen I-38b to name three, or note that I-41's second route is superseded - then bring treasures.json's knownFrom into line. Rule 6 keeps the correction its own change, never a side effect of a phase.
- source: agent

### [MED] apps/app — "Both" and the Woodgatherer band are fought one after another, not as multiple combat (R35)
- pass: user-jot (phase 8c residue, 2026-09-06)
- viewport: unspecified
- auth_state: anonymous
- category: correctness
- observation: The Attendants room's 5-6 row brings the Skillful Beast and the Dexterous Ghost together, and the mountain's 1-3 row brings a band of Woodgatherers (I-05b). The engine has multiple combat (roundAgainstMany, skillForFight, attackersThisRound) but the CombatScreen fights one foe at a time; the reducer queues the second foe as pending and the Master fights them in sequence at full SKILL.
- evidence: carried over from Phase 8c (the cave, verbatim; PR #20) and the Playwright walkthrough of 2026-09-06, user-filed
- suggested fix: Give CombatScreen a many-foes mode over packages/engine/src/multiple: SKILL reduced by headcount, one Master roll against each attacker up to ATTACK, and start it from cave.fight when pending holds more than one foe.
- source: user

### [MED] apps/app — the Oracle is not asked how many Devil servants there are (I-34)
- pass: user-jot (phase 8c residue, 2026-09-06)
- viewport: unspecified
- auth_state: anonymous
- category: correctness
- observation: Rows with count 'oracle' (Cave entrance 1, Dining Hall 1-4, Storage room, Kitchen) leave the number to the caller; the reducer fights exactly one Devil servant. The book says use the Oracle's No. of enemies row.
- evidence: carried over from Phase 8c (the cave, verbatim; PR #20) and the Playwright walkthrough of 2026-09-06, user-filed
- suggested fix: Roll the Oracle's No. of enemies row in doTurn when the encounter's count is 'oracle', push that many servant ids onto pending, and show the roll on the card as a third die.
- source: user

### [LOW] apps/app — the Devil servant’s LOOT on a 6 is recorded as nothing (I-08)
- pass: user-jot (phase 8c residue, 2026-09-06)
- viewport: unspecified
- auth_state: anonymous
- category: correctness
- observation: The printed row is a warning-triangle icon with no text; the loot record carries hint: true and the reducer takes nothing and writes no deed. The reading says the 6 reveals a Hint, but which area's is unstated.
- evidence: carried over from Phase 8c (the cave, verbatim; PR #20) and the Playwright walkthrough of 2026-09-06, user-filed
- suggested fix: Reveal the Hint of the area the servant was met in (revealHint on cave.area) and say so on the result slip with cite I-08.
- source: user

### [LOW] apps/app — the region diagram’s labels overlap
- pass: user-jot (phase 8c residue, 2026-09-06)
- viewport: unspecified
- auth_state: anonymous
- category: visual
- observation: At 390px two MOUNTAIN labels sit on top of each other and one covers a 12 MI badge; the FOREST label overlaps its own circle (design/screenshots/16-region.png).
- evidence: carried over from Phase 8c (the cave, verbatim; PR #20) and the Playwright walkthrough of 2026-09-06, user-filed
- suggested fix: Offset a label to the opposite side of its point when its box would intersect a neighbour's, and keep mile badges above their link's midpoint.
- source: user

### [LOW] apps/app — the header title wraps to two lines now that ABOUT is a fifth nav button
- pass: user-jot (phase 8c residue, 2026-09-06)
- viewport: unspecified
- auth_state: anonymous
- category: visual
- observation: THE 5 TREASURES breaks after THE 5 at 390px, and the place line wraps under it, so the header is three lines tall on every screen.
- evidence: carried over from Phase 8c (the cave, verbatim; PR #20) and the Playwright walkthrough of 2026-09-06, user-filed
- suggested fix: Let the nav wrap to a second row before the title does (flexBasis on the title slip), or drop the tracking on the title by a point.
- source: user

### [LOW] apps/app — the rules panel lists raw behaviour ids
- pass: user-jot (phase 8c residue, 2026-09-06)
- viewport: unspecified
- auth_state: anonymous
- category: content
- observation: Rows read dice.d6, creation.initial-values, combat.opponent-proficiency-is-the-higher. Deliberate as the registry's key, but a player sees developer text.
- evidence: carried over from Phase 8c (the cave, verbatim; PR #20) and the Playwright walkthrough of 2026-09-06, user-filed
- suggested fix: Give each behaviour note a printed title in app.behaviour-notes and show the id under it in mono.
- source: user

### [LOW] apps/app — the roll card covers the beat’s rolls, not the fight’s
- pass: user-jot (phase 8c residue, 2026-09-06)
- viewport: unspecified
- auth_state: anonymous
- category: ux
- observation: ROLL THE ROUND still rolls inline with the fight's own MY DICE slip; the operator's card (design/roll-modal) only serves the Event roll on the beat. A two-sided card (the Master's dice and the foe's) was named as follow-up work.
- evidence: carried over from Phase 8c (the cave, verbatim; PR #20) and the Playwright walkthrough of 2026-09-06, user-filed
- suggested fix: Design the two-sided card on the canvas first (both sides' dice tumble, the difference lands), then route combat.round through it.
- source: user

### [MED] docs/campaigns/the-5-treasures — no full proofread of the docs against the PDF has been done (VISION.md)
- pass: user-jot (phase 8c residue, 2026-09-06)
- viewport: unspecified
- auth_state: anonymous
- category: correctness
- observation: VISION.md requires the adventure verbatim. The docs are pdf-parse transcriptions with folio citations; page a1's opening and the eight descriptions were spot-checked against docs/sources/The-5-treasures.extracted.txt and match, but the Hints, the stat blocks, the treasures' effects and the rulebook's tables have not been read side by side with the PDFs.
- evidence: carried over from Phase 8c (the cave, verbatim; PR #20) and the Playwright walkthrough of 2026-09-06, user-filed
- suggested fix: A read-only pass: diff every quoted block in docs/campaigns and docs/rules against the extracted text, file each mismatch as its own docs correction (rule 9: correcting docs is never a side effect of shipping a phase).
- source: user

## Done

### [MED] general — CronCreate loop schedules do not survive the cloud container
- pass: loop (commit 2338c05)
- viewport: unspecified
- auth_state: anonymous
- category: reliability
- observation: `/loop 30m /march` schedules through CronCreate, which is in-memory and session-only. In a Claude Code cloud session the container is reclaimed between turns, and the job goes with it: this session lost its 30-minute /march schedule twice without any notice, the first time going roughly 45 minutes with the loop silently dead while it looked alive. Nothing in the loop reports the schedule's own health, so the failure is invisible until somebody runs CronList. The durable alternative on this surface is a Routine, whose minimum interval is one hour - so a sub-hour autonomous loop cannot be made to survive here at all.
- evidence: CronList returned "No scheduled jobs" at 2026-09-06T05:13Z after job 9a2a35ec was created at 03:41Z; the same happened again to job 85df0690 within twenty minutes, observed at 2026-09-06T05:30:00Z
- suggested fix: Have the loop check its own schedule each tick (CronList, or list_triggers for the Routine) and say so loudly when it is gone, per standing rule 8. Note in skills/march.md that on the cloud surface an hourly Routine is the only durable cadence.
- source: agent
- resolved: skills/march.md Step 0.5 (2026-09-06). The loop now checks
  its own heartbeat before any work: `CronList` each tick, and on an
  empty list from a hand-started tick it reports the death loudly and
  first, fires `scripts/notify.mjs` per standing rule 8, re-arms, and
  names the unaccounted-for interval in the tick's report. Re-arming
  silently is called out as forbidden, since a silent re-arm is
  indistinguishable from a loop that never died - which is exactly what
  hid this. The step also records the durability finding the row asked
  for: on the cloud surface an hourly Routine is the only durable
  cadence, its minimum interval is one hour and its runs draw against a
  daily per-account cap, so a sub-hourly autonomous loop cannot be made
  durable here at all; a `/loop` cadence is best-effort and a long
  unattended window needs a Routine.
  Confirmed a third time while writing this: job e6460733 (created
  16:35Z) was gone by 17:59Z, and `notify.mjs` reported
  `no channel configured`, so the pager leg is inert until
  NOTIFY_NTFY_TOPIC or NOTIFY_WEBHOOK_URL is set - noted in the step
  itself, and the reason the loud line in the tick's own report comes
  first rather than instead.

### [MED] plan/steps/01_build_plan.md — the plan does not know the prototype landed
- pass: user-jot (commit 40b3dd5)
- viewport: unspecified
- auth_state: anonymous
- category: process
- observation: PR #10 replaced the garden page with Phase 8 screens while Phases 5 to 7 are still pending. The status block says nothing, so /march will plan Phase 5 against a build plan that still describes a placeholder page, and Phase 8 brief generation will not know its layout call is answered (design/INDEX.md).
- evidence: user-spotted at 2026-09-06T03:16:00Z (PR #10, the design prototype landing); the predicted harm did not land - Phases 5 and 6 shipped on 2026-09-06 (53981c2, 66db541) against apps/app/src as it now stands, because the ticks read the shipped code rather than the plan's description of it. What the row still asks for is undone: the Phase 8 row carries no note that its layout call is answered, and that is /oversight's to write, not a loop tick's
- suggested fix: An /oversight note on the Phase 8 row: layout chosen 2026-09-06 via the Claude Design prototype, prototype slice shipped in PR #10; Phases 5 to 7 to build on apps/app/src as it now stands.
- source: user
- resolved: on the operator's call 2026-09-06. The Phase 8 row now says
  the layout call is answered (B, the Sheet, recorded in
  `design/INDEX.md`, the losers deleted), names the commits that met
  each half of the done-condition, and points at Phase 8c for the
  carry-over. The row moves `[-]` -> `[x]` and the mirror issue #16 is
  closed with it. The predicted harm never landed - Phases 5 to 7
  shipped against `apps/app/src` as it stood, because the ticks read
  the shipped code rather than the plan's description of it.

### [MED] apps/app — the adventure’s flags are saved but nothing on the beat sets them (I-45, I-40, I-41)
- pass: user-jot (phase 8c residue, 2026-09-06)
- viewport: unspecified
- auth_state: anonymous
- category: correctness
- observation: night (the gourd opened), junior-king-asleep (wine), cord-spells-known (the Old Vixen met kindly, or the sheets) are declared in flags.json and carried in the record, but no menu row toggles them, so the absence rule (Ogres absent by night) never fires and the Cord is never usable.
- evidence: carried over from Phase 8c (the cave, verbatim; PR #20) and the Playwright walkthrough of 2026-09-06, user-filed
- suggested fix: Add menu rows where the book allows the act: OPEN THE GOURD once held (toggles night; label reading I-45), and set cord-spells-known from learnFrom's sources; wine and the nap wait for the sandbox's market.
- source: user
- resolved: 2edf072 (2026-09-06). Two of the four flags now have a
  source. A menu row appears once the gourd is held and toggles `night`
  (I-45), its line the treasure's own printed effect; a test walks into
  the Cave entrance on the same two dice by day and by night and meets
  an Ogre, then nothing, so `absences.json` is live. `learnFrom` is now
  passed a beaten named foe and a freed rescue as well as the area, so
  the Old Vixen yields the Cord's spells (I-41), and
  `cord-spells-known` is derived from `cave.effects` rather than set
  beside it. Still open, deliberately: `junior-king-asleep` waits on
  wine, which waits on the sandbox's market. Nine new strings under
  `ui.cave.gourd.*` and `ui.deed.gourd.*`, each cited.

### [HIGH] packages/content — opponent roster carries no incorporeal tag (I-29)
- pass: user-jot (commit 884f341)
- viewport: unspecified
- auth_state: anonymous
- category: correctness
- observation: R77 makes spirits and ghosts immune to ordinary blows, and the engine's progression.ordinaryBlowsPass gates on it, but no opponent record carries the tag - so the gate can never fire from data. Reading I-29 names the roster to tag: Gui, Ghost Pirate, First Abbot, Tutelary Spirit, Huli Jing, Yogi, Bai Gu Jing (doubtful), Jiangshi (doubtful), plus the adventure's Dexterous Ghost and Old Vixen. Exceptional weapons: Lu Dongbin's sword (Special Item 6), the seven-star sword, Yin's Magical sword.
- evidence: carried over from the /march loop of 2026-09-05/06 (Phases 3 and 4), user-spotted at 2026-09-06T01:20:04Z
- suggested fix: Add an `incorporeal` boolean and an `exceptionalWeapon` flag to the opponent and market record kinds, tag the named records with cite I-29, and assert in a content test that every tagged name resolves.
- source: user
- resolved: d15a7f2 (2026-09-06). `opponent` gained a required
  `incorporeal` boolean, answered for all 59 stat blocks and true for
  the eight I-29 names outright, each carrying `reading: "I-29"`. The
  other half of R77 ships as `data/rules/exceptional-weapons.json`, a
  reading-labelled table pointing at Special Item 6, the seven-star
  sword and Yin's sheet by id. `isIncorporeal` and
  `isExceptionalWeapon` are the lookups; five content tests hold the
  tagged set, the resolution of every I-29 name, the reading citation,
  the completeness of the tag and the resolution of every weapon ref.
  Not done here: the market flag the row suggested (no Market weapon is
  exceptional, so the enum value would have been dead), and the two
  doubtful names - Bai Gu Jing and Jiangshi - which are left false and
  filed as a `[needs-user-call]` row in `plan/AUDIT.md`. Wiring the
  gate into CombatScreen is a separate row's work.

### [MED] general — Workers Builds fails off main with no log, config verified
- resolved: 526b63a (2026-09-06). deploy.mjs now runs `npm run build:web` itself when apps/app/dist is missing; build b1ea4755 on 526b63a was the first green non-production Workers Build. The cause was reproduced locally (exit 3 at the empty-export guard on a fresh checkout) but never confirmed against a build log, and it sits awkwardly beside the recorded dashboard config - see the open row "the branch-build fix and the dashboard config disagree".

### [LOW] general — non-production Workers Builds fail in zero seconds
- resolved: not reproduced (2026-09-06). The stated signature - started_at equal to completed_at, before any command runs - did not hold for any build observed this session: 4d4b7cc8, ac74f2db and b1ea4755 all ran between roughly forty and sixty seconds, and the Cloudflare bot showed one In progress before it failed. The row's own successor (the MED row above) already recorded that the two zero-second failures predate the dashboard config being saved. Superseded rather than fixed.

### [HIGH] packages/engine — the campaign record drops LUCK's initial value (R05)
- pass: phase-8-residue (commit 4da85ac)
- viewport: unspecified
- auth_state: anonymous
- category: correctness
- observation: RecordedMaster carries skillInitial and enduranceInitial but no luckInitial, so an imported campaign loses the ceiling the shrine restores toward. Phase 8 added Sheet.luckInitial because R58's Temple check needs a maximum; fromCampaign cannot restore it, so an imported Master falls back to whatever the session record held (San Te's 9) and LUCK can be healed past where that Master actually started. R05 asks that every attribute's initial be kept, and two of the three are.
- evidence: apps/app/src/state/campaign.ts masterFrom(); packages/engine/src/campaign/record.ts RecordedMaster; found while shipping the village screen at 2026-09-06T12:59Z
- suggested fix: Add luckInitial to RecordedMaster, bump the record version and write the migration that fills it from luck for older files (packages/engine/src/campaign/migrate.ts already has the chain). Then carry it through masterFrom and fromCampaign.
- source: agent

### [HIGH] apps/app — the village's purse and its state survive only a reload, not an export
- pass: phase-8-residue (commit 4da85ac)
- viewport: unspecified
- auth_state: anonymous
- category: correctness
- observation: silver, incense and templeVisitedToday live on RecordState but not in toCampaign, so they persist through the session snapshot and are lost on export/import or whenever the snapshot is dropped for a shape change. Worse, the purse round-trips through sheet.gold, which is whole gold pieces: a Master carrying 47 SP reloads holding 40. The player silently loses up to 9 SP every time the session half is discarded, which is exactly what a UI change does.
- evidence: apps/app/src/state/campaign.ts toCampaign(); apps/app/src/state/reduce.ts doBuy/doInn keep sheet.gold in sync by hand; found at 2026-09-06T12:59Z
- suggested fix: Put the purse in the campaign record in silver and derive the strip's gold from it, so there is one representation of money rather than two kept in step by hand. Incense and the shrine's day belong in the adventure half of the record alongside the treasures held.
- source: agent

### [MED] apps/app — the overspend mark is hardcoded false, so spec.md's flag never ships
- pass: phase-8-residue (commit 4da85ac)
- viewport: unspecified
- auth_state: anonymous
- category: correctness
- observation: masterFrom sets overspent: false unconditionally. spec.md refuses to block an overspent creation pool and asks the record to carry the mark instead ("flag, never refuse"), and the engine's creationClean exists to produce it — but nothing computes it. Phase 8's creation screen now knows the answer (flagsOf reports every pool it is outside) and throws it away at the moment the sheet is made. Yin's own printed sheet is the case this was written for, and it exports as clean.
- evidence: apps/app/src/state/campaign.ts masterFrom(); apps/app/src/state/creation.ts flagsOf(); packages/engine/src/creation/master.ts creationClean; found at 2026-09-06T12:59Z
- suggested fix: Carry the creation flags onto the Sheet when finishCreation runs and read them in masterFrom, so an overspent Master exports marked. The rules panel can then say which pool it was.
- source: agent

### [MED] apps/app — creation asks for a starting item (R02) and drops it
- pass: phase-8-residue (commit 4da85ac)
- viewport: unspecified
- auth_state: anonymous
- category: correctness
- observation: The creation screen's kit step collects one item under 20 GP, as R02 asks, into CreationState.kitItemId — and finishCreation never reads it, because Sheet has no equipment field. The player makes a choice the book requires and the record forgets it before play starts. The engine's startingKit already validates the choice; only the sheet is missing.
- evidence: apps/app/src/state/creation.ts finishCreation(); apps/app/src/state/types.ts Sheet; found at 2026-09-06T12:59Z
- suggested fix: Add equipment to Sheet and RecordedMaster (the presets already carry an equipment list that is likewise dropped), fill it from startingKit at finishCreation, and show it on the record screen.
- source: agent

### [MED] apps/app — the Techniques offered at creation ignore the Master's style
- pass: phase-8-residue (commit 4da85ac)
- viewport: unspecified
- auth_state: anonymous
- category: correctness
- observation: CreationScreen's learnable() takes the martial art, checks it is defined, then sorts the whole 36-Technique table by cost and returns the first 12 regardless of style. A Shaolin Quan Master is offered the same list as any other, and the twelve cheapest are not necessarily the ones the style teaches. The cut to 12 is also arbitrary and undocumented.
- evidence: apps/app/src/screens/CreationScreen.tsx learnable(); found at 2026-09-06T12:59Z
- suggested fix: Filter by what the style can teach and show all of them; if the list needs a cap on a phone, scroll it rather than truncate it, and say what the cut is.
- source: agent

### [LOW] apps/app — finishCreation runs twice on the same creation
- pass: phase-8-residue (commit 4da85ac)
- viewport: unspecified
- auth_state: anonymous
- category: simplification
- observation: The creation.begin branch calls finishCreation(state.creation) once for the sheet and again for the purse's starting gold. It is pure, so the second call is only wasted work rather than a bug — but it reads as though two different sheets might be made, which is the sort of thing that becomes a bug later.
- evidence: apps/app/src/state/reduce.ts, case 'creation.begin'; found at 2026-09-06T12:59Z
- suggested fix: Bind the sheet once and read gold off it.
- source: agent
