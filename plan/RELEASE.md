# Release checklist

> The web release's gate, in the repository, ticked (Phase 9). Every
> line below is a command an agent runs and a result it records — except
> the last, which only the operator can tick.
>
> Re-run this list before any release the operator announces. A line
> that goes red is a blocked release, not a footnote: the same rule the
> verify gate follows (`agents.md` standing rule 3).

**Live at:** https://martial-havoc.no-trbl-2-u.workers.dev

## The list

- [x] **The verify gate is green.** `npm run verify` —
      `typecheck -> test -> labels:check -> build:web -> e2e`,
      foreground, blocking. Never backgrounded, never `--no-verify`.
- [x] **The scripted cave run passes.** The 5 Treasures played to its
      ending on fixed dice, in the engine, with no UI in the way:
      `packages/engine/src/adventure/playthrough.test.ts`. It runs
      inside `npm run test`, so the verify line above already carries
      it; it is listed separately because it is the one test that
      proves the adventure is finishable rather than merely correct.
- [x] **The label leg passes.** `npm run labels:check` — every engine
      behaviour carries a `{label, cite}` and the labels are the three
      the estate allows (standing rule 6). Zero unlabelled.
- [x] **The content counts are printed.** `npm run counts`. The same
      numbers are on the About screen, read from the same modules, so
      the checklist and the app cannot disagree.

      ```
        content files        43
        content records      1421
        authored lines       162
        engine behaviours    109
          invention        24
          reading          28
          rule             57
      ```

- [x] **The document names itself.** Title, description, theme colour,
      manifest link and the iOS install tags are on the exported HTML,
      asserted by `e2e/release.spec.ts` against the real export.
- [x] **The app is installable.** `/manifest.webmanifest` is served as
      `application/manifest+json`, names the app, declares `standalone`
      and `portrait`, and points at an SVG icon that is also served.
- [x] **A reload works with no network.** `e2e/release.spec.ts` loads
      the app, waits for the service worker to take control, goes
      offline, reloads, and finds the frame, the Master and the menu.
      One online visit is required first — the worker fills its cache as
      the app is used, and this is that requirement written down rather
      than assumed.
- [x] **The deploy is green on the commit being released.**
      `npm run deploy:check` polls Cloudflare for the deploy matching
      HEAD and exits non-zero on `error`, `failed` or timeout.
- [ ] **The operator installs the web app to a phone.** The one line no
      agent can tick. Open the live URL on the phone, add it to the
      home screen, open it from there, and confirm it launches without
      browser chrome and plays with the network off.

## What is not on this list, and why

- **A custom domain.** `plan/bearings.md`: the operator's call. The
  workers.dev URL is the release address until they say otherwise.
- **Native builds.** Phase 13. Nothing in the web release depends on
  EAS, and nothing here should.
- **Screenshots.** `npm run screenshots` writes PNGs for the operator
  and is deliberately not a gate: fonts differ per machine and a pixel
  diff would be flaky (Phase 8 brief, decision 7).
- **The cave's eight areas on the beat.** Phase 8's last carry-over and
  Phase 10's prerequisite, named phase-sized in
  `plan/steps/01_build_plan.md`. It is a gameplay gap, not a release
  gap: what ships is correct about what it covers.
