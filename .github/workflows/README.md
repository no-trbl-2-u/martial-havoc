# `.github/workflows/`

GitHub Actions for Martial Havoc. One workflow lives here today.

---

## `march.yml` — the cloud march tick

### At the highest level

This is `/march` — the project's outer dispatcher skill
(`skills/march.md`) — running unattended on GitHub's runners
instead of on a laptop under `/loop 30m /march`.

A tick does whatever the project most needs next, in the skill's
own priority order:

```
triage → critique → ship-a-phase → expand → iterate
```

It ends the way every shipping skill ends (agents.md rule 1):
`npm run verify` green, `git commit`, `git push origin main`,
then `npm run deploy:check` against Cloudflare.

### Triggers

| Trigger | When | Notes |
|---|---|---|
| `workflow_dispatch` | On demand | Actions tab → **march** → *Run workflow*, or `gh workflow run march.yml`. Takes an optional `args` string, passed to the skill as `$ARGUMENTS`. |
| `schedule` | `0 */6 * * *` (UTC) | Four ticks a day. GitHub's cron is best-effort; a skipped tick is harmless because `/march` re-derives its work from `plan/` every run. |

Change the cadence by editing the `cron` line. Note that GitHub
disables scheduled workflows in repositories with no activity for
60 days.

### Concurrency

`concurrency.group: march`, `cancel-in-progress: false`.

Two ticks running at once would race on `origin/main` and on the
Cloudflare deploy. A queued tick waits; a running tick is never
cancelled, because killing a march between its commit and its
push produces exactly the unpushed-commit state agents.md rule 1
forbids.

### The steps, lowest level first

| # | Step | Why it exists |
|---|---|---|
| 1 | `actions/checkout@v5` — `ref: main`, `fetch-depth: 0` | Full history: the skills read `git log` to see what shipped last, and a shallow clone cannot push a merge. Default `persist-credentials` leaves the `GITHUB_TOKEN` remote in place so the in-run push works. |
| 2 | `actions/setup-node@v4` — Node 22, npm cache | `package.json` declares `engines.node >= 22`. The cache is keyed on `package-lock.json`. |
| 3 | `npm ci` | Lockfile-authoritative install, so a tick is reproducible. |
| 4 | `npx playwright install --with-deps chromium` | `npm run e2e` is the last leg of the verify gate and is a hard gate (agents.md rule 3). Chromium only — the Playwright config drives the exported web build, so the rest of the matrix buys nothing. |
| 5 | `anthropics/claude-code-action@v1` | The tick. Everything else is setup. |

### Step 5 in detail

| Input | Value | Rationale |
|---|---|---|
| `prompt` | `/march ${{ inputs.args }}` | Supplying `prompt` puts the action in **automation mode**: it runs headless immediately rather than waiting for an `@claude` mention. On a scheduled run `inputs.args` is empty. |
| `anthropic_api_key` | `secrets.ANTHROPIC_API_KEY` | The Claude credential. |
| `github_token` | `secrets.GITHUB_TOKEN` | The runner's own token; no PAT needed. |
| `claude_args` | `--permission-mode bypassPermissions --max-turns 400` | See below. |
| `display_report` | `true` | Puts the run's report in the Actions step summary, so a failed tick is readable without downloading raw logs. |

**`--permission-mode bypassPermissions`.** There is no human on a
scheduled run to answer a permission prompt, and a denied call
would strand the tick mid-phase. This is safe because the rules
that actually matter are enforced *mechanically*, not by the
permission layer: `.claude/hooks/guard.mjs` still runs under this
mode and still blocks `--no-verify`, force-push, destructive
resets, attribution trailers and emoji in commit messages, and
off-vocabulary commit verbs (agents.md rules 2, 3 and 5).

**`--max-turns 400`.** A full phase — read `docs/`, write code,
run the gate, commit, push, poll the deploy — is long. The cap
bounds a pathological loop rather than a normal tick.

### Permissions

| Scope | Used by |
|---|---|
| `contents: write` | The skill's push to `main`. |
| `issues: write` | `/triage` labelling and commenting. |
| `pull-requests: write` | `/triage` and `/iterate` when they touch PRs. |
| `id-token: write` | The action's OIDC exchange. |

### Secrets

| Secret | Required | Consumed by |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | The action. Without it the run fails immediately. |
| `CLOUDFLARE_API_TOKEN` | For the deploy gate | `npm run deploy:check` (agents.md rule 4). Account-scoped, "Workers Scripts: Edit". |
| `CLOUDFLARE_ACCOUNT_ID` | For the deploy gate | Same. |
| `GITHUB_TOKEN` | Automatic | Exported into the run as `GH_TOKEN` so the `gh` CLI that `/triage` drives authenticates with no extra setup. |

If the Cloudflare pair is absent, `npm run deploy:check` exits 3
with a clear error and the tick reports blocked — it does not
silently skip the gate.

Optional, not wired here: `NOTIFY_NTFY_TOPIC` /
`NOTIFY_WEBHOOK_URL` for `scripts/notify.mjs` (agents.md rule 8,
"blocked is loud"). Add them to the step's `env:` block to get a
page when a tick stops.

### What this workflow does *not* do

- **It does not run `npm run verify`.** The gate belongs to the
  skill, which runs it as a blocking foreground call before its
  own commit (agents.md rule 3). A second run here would double
  the cost and gate nothing, since the commit happens inside
  step 5.
- **It does not deploy.** Cloudflare Workers Builds is wired to
  `main` and fires on the push; the skill polls the result with
  `npm run deploy:check`.

### Timeout

`timeout-minutes: 90`. Covers the gate (typecheck → test →
labels:check → build:web → e2e), the Expo web export and the
deploy poll, with headroom. A tick that hits the ceiling is a
signal the gate has outgrown the per-commit path — the fix is to
shrink the gate, never to background it (agents.md rule 3).

### Reading a failed tick

1. Actions → **march** → the red run → the step summary
   (`display_report: true` puts Claude's own report there).
2. A red verify gate or a red deploy is treated the same way a
   local one is: read the log, patch, push again.
3. Repeated failures escalate per the skill's failure modes —
   `/oversight` is the user-in-the-loop entry point.
