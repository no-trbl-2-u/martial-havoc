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
- evidence: carried over from the /march loop of 2026-09-05/06 (Phases 3 and 4), user-spotted at 2026-09-06T01:20:04Z
- suggested fix: Fall back to the GitHub REST API (GH_TOKEN is already required) when `gh` is not on PATH, and default GH_REPO to no-trbl-2-u/martial-havoc instead of erroring.
- source: user

### [MED] general — CLOUDFLARE_API_TOKEN cannot read Workers Builds
- pass: user-jot (commit 884f341)
- viewport: unspecified
- auth_state: anonymous
- category: reliability
- observation: The token reads /accounts/{id}/workers/scripts and uploads versions, but every /accounts/{id}/builds/** path returns code 12006 Invalid token. When a Workers Build fails, the loop can see that it failed and nothing about why, which is what turned one CI failure this session into an undiagnosable blocker. Documented scope in agents.md is 'Workers Scripts: Edit' only.
- evidence: carried over from the /march loop of 2026-09-05/06 (Phases 3 and 4), user-spotted at 2026-09-06T01:20:04Z
- suggested fix: Widen the token with Workers Builds read and say so in .env.example next to the existing CLOUDFLARE_API_TOKEN line.
- source: user

### [LOW] general — non-production Workers Builds fail in zero seconds
- pass: user-jot (commit 884f341)
- viewport: unspecified
- auth_state: anonymous
- category: reliability
- observation: Every push to a non-main branch produces a Workers Builds check that fails with started_at equal to completed_at, i.e. before any command runs, while `npm run deploy:version` for the same commit succeeds locally and deploy:check goes green. Seventeen builds on main have all passed. The cause is a Cloudflare project setting for non-production branches, not repo code, and it is invisible from the repo.
- evidence: carried over from the /march loop of 2026-09-05/06 (Phases 3 and 4), user-spotted at 2026-09-06T01:20:04Z
- suggested fix: Set the Worker's non-production Version command to `npm run deploy:version` in the Cloudflare dashboard, or disable non-production branch builds. Note the outcome in agents.md rule 4.
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

### [MED] general — Workers Builds fails off main with no log, config verified
- pass: user-jot (commit 40b3dd5)
- viewport: unspecified
- auth_state: anonymous
- category: reliability
- observation: The non-production build for 40b3dd5 (PR #10) ran about sixty seconds and failed; the check run carries no output text. The dashboard configuration was read from a screenshot and is correct: build `npm run build:web`, deploy `npm run deploy`, version `npm run deploy:version`, production branch main, non-production builds on. So the earlier reading (a missing Version command) does not hold. The two zero-second failures before it (PR #8, and PR #10 at d17d46e) predate the configuration being saved. What fails inside the minute is unknown: `npm run build:web` and `npm run deploy:version` are both green locally.
- evidence: user-spotted at 2026-09-06T03:16:00Z (PR #10, the design prototype landing)
- suggested fix: Read the build log behind View logs in the dashboard, or widen CLOUDFLARE_API_TOKEN with Workers Builds read and set it in the cloud environment so the loop can read it. Then fix whichever of the two commands fails in the builder (Node 22 is pinned by .node-version; the likely suspects are the Playwright browser download during npm install, or wrangler needing the alias flag).
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
- evidence: user-spotted at 2026-09-06T03:16:00Z (PR #10, the design prototype landing)
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

## Done

(empty)
