# Site audit

> Latest findings from `/iterate audit`. Rewritten on each audit
> pass. Durable rows (`[needs-user-call]`, `[user-issue #N]`, a
> `> Bias:` line) survive the rewrite.

# Site audit — 2026-09-06 (second pass)

The pass ran against `plan/CRITIQUE.md`'s Pending block, which is the
only populated finding source: `/critique` proper has never run
(`Last pass: never`), so every row scored below is an
`external-critique` row carried in from `/jot` and earlier `/march`
ticks. One HIGH row stands alone at the top; the rest are MED.

## Top 5 findings (scored)

### [x] [5.3] packages/content — opponent roster carries no incorporeal tag (I-29)
- category: external-critique
- impact: 8 (R77 is a sealed rule with a live engine gate that no data could ever open)
- ease: 6 (schema field, two rosters, one new reading-labelled file, tests)
- source bump: +0.5 (user-filed via /jot)
- next: shipped this tick — see `plan/CRITIQUE.md` Done

### [x] [5.4] apps/app — the adventure's flags are saved but nothing on the beat sets them (I-45, I-40, I-41)
- category: external-critique
- impact: 7 (the gourd's night, the sleeping Junior King and the Cord's spells are all unreachable)
- ease: 7 (menu rows over machinery that already exists)
- source bump: +0.5 (user-filed via /jot)
- issue: #25
- next: shipped 2edf072 — the gourd's night and the Vixen's spells; the
  Junior King's nap waits on the sandbox's market

### [ ] [4.2] apps/app — the Oracle is not asked how many Devil servants there are (I-34)
- category: external-critique
- impact: 6 (four encounter rows fight one foe where the book asks for a number)
- ease: 7 (roll in `doTurn`, push n ids onto `pending`, third die on the card)
- next: `/iterate`, after the many-foes mode below (it needs the same queue)

### [ ] [4.0] apps/app — "Both" and the Woodgatherer band are fought one after another, not as multiple combat (R35)
- category: external-critique
- impact: 8 (a sealed rule the engine implements and the UI bypasses)
- ease: 5 (CombatScreen gains a mode; `packages/engine/src/multiple` is ready)
- next: `/iterate` — many-foes mode on CombatScreen

### [ ] [3.6] packages/content — effects.json operation strings are unverified
- category: external-critique
- impact: 6 (a rename in the engine leaves 72 records pointing at nothing, silently)
- ease: 6 (one engine-side test importing the effects table)
- next: `/iterate` — the test belongs in `packages/engine`, which may import content

## Durable rows

### [x] The open design questions live in `plan/NEEDS_HUMAN_ATTENTION.md` — all closed 2026-09-07

Five rows from the verdict of 2026-09-06. Every row is closed by the
operator, in writing, in that file (PR #35). No wall stands; the loop
runs. `/oversight` still reads that file first.

### [x] Bai Gu Jing and Jiangshi: incorporeal or not? (I-29) — CLOSED 2026-09-07

Operator's call: "refer to the PDF; if no answer is found, tag both."
The rulebook was read (pypdf, every page). R77 (p.66) names only
"spirits or ghosts"; the two entries (p.70, p.74) say "Demon" and
"undead"; the matrix (p.67) seats both in the Supernatural column
beside untagged Feng Huang and Niu Mowang; the adventure never names
them. No answer, so both are tagged: `incorporeal: true`,
`reading: "I-29"`, and `I29_NAMES` carries ten.

Original row, kept for the record:

Reading I-29 names eight opponents outright and two more with a
question mark of its own: Bai Gu Jing ("demon - doubtful") and
Jiangshi ("undead - doubtful"). This tick tagged the eight and left
the two `false`, because `false` is the status quo — an ordinary blow
lands — and tagging a creature incorporeal makes it harder to fight,
which is a rule change no loop tick should make on a doubt the
estate itself recorded.

The call is the operator's. If either should be tagged, it is a
one-line change in `packages/content/data/world/opponents.json`
(`incorporeal: true` plus `reading: "I-29"`), and the count in
`content.test.ts`'s `I29_NAMES` moves with it.

- raised: 2026-09-06, while shipping the HIGH row above
- resolve via: `/oversight`
