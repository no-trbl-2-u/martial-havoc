# Skill: march

> **Outer dispatcher.** Reads project state and delegates to one
> of the shipping skills. Designed for `/loop`. The
> autonomous-beast entry point.

## 1. Purpose

`/loop /march` is the autonomous-beast mode. It picks the
right-thing-to-do every tick:

```
unlabeled issues exist          →  /triage
ELSE critique due (rate-lim)    →  /critique
ELSE pending phase              →  /ship-a-phase
ELSE pending data               →  /ship-data
ELSE expand due + bold posture  →  /expand
ELSE                            →  /iterate
```

Deliveries first: pending phases / data ship before `/expand`
ever fires. `/expand` only runs when there's no immediate
delivery, OR when its rate-limit window opens (every ~20
commits or ~48h) AND the bearings posture is **bold** or
**autonomous**.

This means: an overnight run can take Martial Havoc from
"scaffolded" to "shipped, populated, iteratively polished,
critiqued, addressed, inbox-zero on issues, and growing its
own plan when reality outpaces the original spec" without a
mode switch from the user.

The triage check is **cheap when idle** (one API call to count
unlabeled issues). The critique check is **rate-limited**
(≥12 commits + ≥24h spacing, green-deploy required). The
expand check is **rate-limited + posture-gated** (≥20 commits
+ ≥48h, posture ≠ strict).

## 2. Invocation

```
/march                       # one tick: dispatch + execute
/loop 30m /march             # autonomous loop, every 30 min
/loop /march                 # self-paced autonomous loop
```

## 3. Procedure

### Step 0 — Sync

```bash
git pull --ff-only
```

If divergence, stop per §5.

### Step 0.5 — Is the loop still scheduled?

**The loop must check its own heartbeat, because nothing else
does.** `/loop 30m /march` schedules through `CronCreate`, which is
in-memory and session-only. On the cloud surface the container is
reclaimed between turns and the job goes with it: the loop looks
alive, ticks stop, and nobody finds out until somebody runs
`CronList` by hand. That has happened twice, once for roughly
forty-five minutes.

So every tick, before any work:

```
CronList
```

- **A job is listed** → say nothing, carry on to Step 1.
- **"No scheduled jobs"** *and this tick was fired by a schedule
  rather than by a person* → impossible by definition; the tick
  would not have fired. Carry on.
- **"No scheduled jobs"** and the tick was started by hand → the
  schedule died. This is a standing-rule-8 condition: say so
  **loudly and first**, before reporting any other work.

  ```bash
  node scripts/notify.mjs --title "march: loop schedule died" \
    --body "CronList empty; re-armed. Ticks between <last known> and now did not fire." \
    --priority high
  ```

  Then re-arm it (`CronCreate`, same cadence) and name in the tick's
  report: the dead job's id, when it was created, and that the
  interval since is unaccounted for. Never re-arm silently — a
  silently re-armed loop is indistinguishable from one that never
  died, which is what made this invisible in the first place.

**On the cloud surface, an hourly Routine is the only durable
cadence.** `CronCreate` is per-session; a Routine
(`claude.ai/code/routines`, or `/schedule` in the CLI) is stored on
the account and survives the container. Its minimum interval is one
hour and its runs draw against a daily per-account cap, so a
sub-hourly autonomous loop cannot be made durable here at all — the
30-minute cadence is a convenience of an open session, not a
guarantee. Treat a long unattended window as needing a Routine, and
a `/loop` cadence as best-effort.

`scripts/notify.mjs` is itself best-effort: with neither
`NOTIFY_NTFY_TOPIC` nor `NOTIFY_WEBHOOK_URL` set it prints
`notify (no channel configured)` and exits clean. That is not a
failure of this step — but it does mean the loud report in the
tick's own output is the only channel that always works, which is
why it comes first rather than instead.

### Step 1 — Triage gate (cheapest check)

Load `GH_TOKEN` from `.env` and count unlabeled open issues:

```bash
export GH_TOKEN=$(awk -F= '/^GH_TOKEN=/ {sub(/^GH_TOKEN=/, ""); print; exit}' .env)
export GH_REPO=$(awk -F= '/^GH_REPO=/ {sub(/^GH_REPO=/, ""); print; exit}' .env)
GH_REPO=${GH_REPO:-no-trbl-2-u/martial-havoc}

unlabeled=$(gh issue list --repo "$GH_REPO" --state open \
  --search "-label:triage:loop-queued -label:triage:needs-user -label:triage:closed -label:triage:reviewed -label:loop:opened" \
  --json number --jq 'length' 2>/dev/null || echo 0)

# Concierge lane — loop:do outranks everything, even labeled
# issues; the user said "this one, now".
urgent=$(gh issue list --repo "$GH_REPO" --state open \
  --label loop:do --json number --jq 'length' 2>/dev/null || echo 0)
```

If `urgent > 0` or `unlabeled > 0`:

- Read `skills/triage.md`.
- Execute its procedure end-to-end.
- Return.

If `unlabeled == 0`, fall through to Step 2.

If `gh` isn't installed or `GH_TOKEN` missing, **don't fail
the march** — log warning and fall through.

### Step 2 — Critique gate (rate-limited)

Read metadata header at top of `plan/CRITIQUE.md`:

```
> Last pass: <ISO-date> at commit <sha>
> Pass count: <N>
```

Dispatch to `/critique` if **all three** hold:

1. Current commit is at least **12 commits after** `Last pass`,
   OR `Last pass` > **24 hours ago**, OR `Last pass` is "never"
   and at least one substantive phase (e.g., the canonical
   sibling) has shipped.
2. `npm run deploy:check` shows a green deploy.
3. No pending HIGH critique already queued for iterate.

If all three hold:

- Read `skills/critique.md`.
- Execute its procedure end-to-end.
- Return.

Otherwise fall through to Step 3.

### Step 3 — Dispatch (first match wins)

#### 3a. Pending phase?

Open `plan/steps/01_build_plan.md`. If any `[ ]` row in the
"Status (at-a-glance)" block — skipping rows marked
`[skipped]` or `[blocked: …]` (a blocked phase is a
conversation waiting for `/oversight`, not work for this
tick):

- Read `skills/ship-a-phase.md`.
- Execute its procedure end-to-end.
- Return.

#### 3b. Pending data?

Open `data/BACKLOG.md`. If any `[ ]` row exists (and project
has a data layer):

- Read `skills/ship-data.md`.
- Execute its procedure end-to-end.
- Return.

#### 3c. Expand due (rate-limited, posture-gated)?

Read `plan/bearings.md` "Plan expansion posture" section. If
posture is **strict**, skip to 3d.

Read metadata header at top of `plan/PHASE_CANDIDATES.md`:

```
> Last pass: <ISO-date> at commit <sha>
> Pass count: <N>
```

Dispatch to `/expand` if **all four** hold:

1. Posture is **bold** or **autonomous** (not strict).
2. Current commit is at least **20 commits after** `Last pass`,
   OR `Last pass` is more than **48 hours ago**, OR `Last pass`
   is "never" and at least **3 phases have shipped**.
3. There's at least one signal worth examining: `plan/AUDIT.md`
   has Pending rows, OR `plan/CRITIQUE.md` has Pending rows,
   OR `git log -p --since="<last pass>" -- spec.md design/`
   shows changes, OR `data/` has substantial growth since the
   plan was authored.
4. No phase or data work is pending (Steps 3a/3b would have
   matched first if there were).

If all four hold:

- Read `skills/expand.md`.
- Execute its procedure end-to-end.
- Return.

If any condition fails, fall through to 3d.

#### 3d. Else — iterate.

- Read `skills/iterate.md`.
- Execute its procedure end-to-end.
- Return.

(Note: when `/iterate`'s audit finds no actionable findings
scoring ≥ 3.0 AND posture is bold, iterate dispatches to
`/expand` itself rather than stopping. See `skills/iterate.md`
§6 failure mode 6.)

### Step 4 — Done

Return cleanly. Loop's next tick re-dispatches.

## 4. Hand-off honesty

When you dispatch into a child skill, **fully adopt its
contract**. Hard rules, failure modes, commit conventions,
verify gate. `/march` itself doesn't add rules; it inherits.

A march tick succeeds iff the child tick succeeds.

## 5. Failure modes

`/march` itself only fails on:

1. **`git pull` divergence.**
2. **State files corrupted or missing** (build plan, AUDIT,
   BACKLOG, CRITIQUE). Stop and report — don't reconstruct
   silently.

Otherwise inherited from the dispatched skill.

## 6. Quick reference

```bash
# The loop's own heartbeat (Step 0.5)
CronList                             # empty on a hand-started tick = the schedule died

# State files
plan/steps/01_build_plan.md          # pending phases
data/BACKLOG.md                      # pending data work
plan/CRITIQUE.md                     # critique queue + last-pass metadata

# External signals
gh issue list ...                    # unlabeled count
npm run deploy:check                    # green-deploy condition

# Skills it dispatches into
skills/triage.md                     # Step 1 (cheapest)
skills/critique.md                   # Step 2 (rate-limited)
skills/ship-a-phase.md               # Step 3a
skills/ship-data.md                  # Step 3b
skills/expand.md                     # Step 3c (posture-gated)
skills/iterate.md                    # Step 3d
```
