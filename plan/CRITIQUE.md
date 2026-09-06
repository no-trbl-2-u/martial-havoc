# Critique log

> Last pass: never
> Pass count: 0

> External-observer feedback for Martial Havoc. Populated by
> `/critique`, drained by `/iterate`. See `skills/critique.md`
> for the contract.

## Pending

The `/critique` pass proper still waits for Phase 8 (The UI) to ship and
the deploy to be green (set via oversight 2026-09-05). The rows below are
not from that pass: they are the carry-overs the `/march` loop of
2026-09-05/06 left behind after shipping Phases 3 and 4, filed here so
`/iterate` drains them rather than losing them.

### [HIGH] packages/content — opponent roster carries no incorporeal tag (I-29)
- pass: user-jot (commit 884f341)
- viewport: unspecified
- auth_state: anonymous
- category: correctness
- observation: R77 makes spirits and ghosts immune to ordinary blows, and the engine's progression.ordinaryBlowsPass gates on it, but no opponent record carries the tag - so the gate can never fire from data. Reading I-29 names the roster to tag: Gui, Ghost Pirate, First Abbot, Tutelary Spirit, Huli Jing, Yogi, Bai Gu Jing (doubtful), Jiangshi (doubtful), plus the adventure's Dexterous Ghost and Old Vixen. Exceptional weapons: Lu Dongbin's sword (Special Item 6), the seven-star sword, Yin's Magical sword.
- evidence: carried over from the /march loop of 2026-09-05/06 (Phases 3 and 4), user-spotted at 2026-09-06T01:20:04Z
- suggested fix: Add an `incorporeal` boolean and an `exceptionalWeapon` flag to the opponent and market record kinds, tag the named records with cite I-29, and assert in a content test that every tagged name resolves.
- source: user

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

### [MED] plan/steps/01_build_plan.md — the plan does not know the prototype landed
- pass: user-jot (commit 40b3dd5)
- viewport: unspecified
- auth_state: anonymous
- category: process
- observation: PR #10 replaced the garden page with Phase 8 screens while Phases 5 to 7 are still pending. The status block says nothing, so /march will plan Phase 5 against a build plan that still describes a placeholder page, and Phase 8 brief generation will not know its layout call is answered (design/INDEX.md).
- evidence: user-spotted at 2026-09-06T03:16:00Z (PR #10, the design prototype landing); the predicted harm did not land - Phases 5 and 6 shipped on 2026-09-06 (53981c2, 66db541) against apps/app/src as it now stands, because the ticks read the shipped code rather than the plan's description of it. What the row still asks for is undone: the Phase 8 row carries no note that its layout call is answered, and that is /oversight's to write, not a loop tick's
- suggested fix: An /oversight note on the Phase 8 row: layout chosen 2026-09-06 via the Claude Design prototype, prototype slice shipped in PR #10; Phases 5 to 7 to build on apps/app/src as it now stands.
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

### [MED] general — CronCreate loop schedules do not survive the cloud container
- pass: loop (commit 2338c05)
- viewport: unspecified
- auth_state: anonymous
- category: reliability
- observation: `/loop 30m /march` schedules through CronCreate, which is in-memory and session-only. In a Claude Code cloud session the container is reclaimed between turns, and the job goes with it: this session lost its 30-minute /march schedule twice without any notice, the first time going roughly 45 minutes with the loop silently dead while it looked alive. Nothing in the loop reports the schedule's own health, so the failure is invisible until somebody runs CronList. The durable alternative on this surface is a Routine, whose minimum interval is one hour - so a sub-hour autonomous loop cannot be made to survive here at all.
- evidence: CronList returned "No scheduled jobs" at 2026-09-06T05:13Z after job 9a2a35ec was created at 03:41Z; the same happened again to job 85df0690 within twenty minutes, observed at 2026-09-06T05:30:00Z
- suggested fix: Have the loop check its own schedule each tick (CronList, or list_triggers for the Routine) and say so loudly when it is gone, per standing rule 8. Note in skills/march.md that on the cloud surface an hourly Routine is the only durable cadence.
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

## Done

### [MED] general — Workers Builds fails off main with no log, config verified
- resolved: 526b63a (2026-09-06). deploy.mjs now runs `npm run build:web` itself when apps/app/dist is missing; build b1ea4755 on 526b63a was the first green non-production Workers Build. The cause was reproduced locally (exit 3 at the empty-export guard on a fresh checkout) but never confirmed against a build log, and it sits awkwardly beside the recorded dashboard config - see the open row "the branch-build fix and the dashboard config disagree".

### [LOW] general — non-production Workers Builds fail in zero seconds
- resolved: not reproduced (2026-09-06). The stated signature - started_at equal to completed_at, before any command runs - did not hold for any build observed this session: 4d4b7cc8, ac74f2db and b1ea4755 all ran between roughly forty and sixty seconds, and the Cloudflare bot showed one In progress before it failed. The row's own successor (the MED row above) already recorded that the two zero-second failures predate the dashboard config being saved. Superseded rather than fixed.
