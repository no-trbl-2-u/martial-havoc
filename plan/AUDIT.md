# Site audit

> Latest findings from `/iterate audit`. Rewritten on each audit
> pass. Durable rows (`[needs-user-call]`, `[user-issue #N]`, a
> `> Bias:` line) survive the rewrite.

# Site audit — 2026-09-06

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

### [ ] [4.9] apps/app — the adventure's flags are saved but nothing on the beat sets them (I-45, I-40, I-41)
- category: external-critique
- impact: 7 (the gourd's night, the sleeping Junior King and the Cord's spells are all unreachable)
- ease: 7 (menu rows over machinery that already exists)
- next: `/iterate` — add the menu rows the book allows, wire `learnFrom`

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

### [needs-user-call] Bai Gu Jing and Jiangshi: incorporeal or not? (I-29)

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
