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

## Done

(empty)
