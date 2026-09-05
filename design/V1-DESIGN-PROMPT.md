# Martial Havoc — V1 design-system prompt

*Written 2026-09-05 from the sealed Seed (`spec.md`, `origin: idea-0003 @
state/0013`) and `plan/bearings.md`. This file is the prompt to hand to
claude.ai/design — copy everything below the rule. The design exploration
runs beside the engine build (Phases 2–7); Phase 8 (the UI) integrates
whatever lands in this `design/` directory.*

*Phase 8 also carries one operator decision the plan tags
`[needs-user-call]`: the layout. Option 5 of this prompt's deliverable is
where that decision starts.*

---

Design **five distinct design-system options** for **Martial Havoc**, a
phone-first app that runs a rule-light d6 solo wuxia tabletop RPG. One
player, offline, no account, the printed rulebook closed. The app is a
rules engine with a thin skin: it rolls, resolves, and shows its work.
Text and SVG only — **no images, no illustration, no credited art**.

## The domain, in one paragraph

Martial Havoc is Gianluca Monaco's solo RPG: a Master (the player's
character) with four attributes (SKILL, ENDURANCE, LUCK, Spirituality),
one Martial Art, Proficiencies, Techniques and Rituals with effects, gold,
XP. Play is a loop of **beats**: the app shows an authored one-line
prompt, a **menu of what the rules allow right now**, and a free-text
field the player may write in and never must. Checks roll two d6 against
an attribute; combat shows **both sides' rolls, the Proficiency each side
added, and the difference**; a tie is an Unexpected Event; a retreat
rolls Morale. The first adventure is a cave of eight areas, nine foes and
five treasures; later, a sandbox throws a **region** — seven points on a
plane linked to their nearest neighbours, distances in miles, drawn as a
diagram that says it is not to scale. Every behaviour the engine performs
carries one of three labels — **rule** (printed in the book), **reading**
(the book was silent; we took a position), **invention** (ours) — with a
citation, and a rules panel lists them all. One campaign record holds the
Master, a deeds ledger, flags, the player's own passages, and an override
count (how many times the player typed a number instead of rolling).

## Constraints the design must respect

- **Platform:** Expo + React Native, one codebase for iOS, Android and
  the web export. Styling is React Native `StyleSheet`; vector work is
  `react-native-svg`. No CSS-only tricks, no web fonts that cannot be
  bundled, no blur or backdrop effects.
- **Phone width leads:** 390 × 844 is the reference frame; the web build
  is the same layout in a browser, not a desktop redesign.
- **Text and SVG only.** No raster, no stock, no generated illustration,
  no art from the rulebook. Ornament, if any, is drawn geometry.
- **Three labels, always legible:** rule / reading / invention must be
  distinguishable by **shape or glyph as well as colour** (colour-blind
  safe), at 12 px, in light and dark.
- **Both rolls visible in combat.** The dice, the Proficiency added, the
  totals and the difference — one glance, no tap.
- **Manual entry beside every roll.** The player can type the dice they
  rolled on the table instead; the UI must make that a first-class,
  unembarrassed choice.
- **Free text is optional.** The field is always present and never
  required; the design must make "skip it" feel as legitimate as "write".
- **Authored lines are short.** One or two sentences beside every menu
  result; typography has to carry voice with no imagery.
- **Light and dark**, system-driven. **Dynamic type** up to 130% must not
  break the beat screen.
- **No accounts, no social, no monetisation surfaces** — no sign-in,
  share, rate, or upsell patterns anywhere.
- **Offline.** No loading spinners for network; the only slow thing is
  the player.

## The screens (design three of them per option)

1. **The beat** — the heart. Authored line on top; the menu of allowed
   actions; the free-text field; the current Master's numbers in reach
   (SKILL, ENDURANCE, LUCK, Spirituality, gold). Show one state with a
   check result open: both dice, the attribute compared, pass or fail,
   and the label pill with its citation.
2. **Combat** — the same frame with the opponent present: both rolls,
   both Proficiencies, the difference, the winner's four options as a
   menu, a tie as an Unexpected Event, the retreat row that rolls Morale.
3. **The rules panel** — a list of every behaviour with its label and
   citation, filterable by label; a single behaviour opened to show its
   text and where it comes from. This screen is the app's honesty; make
   it handsome, not a settings page.

Optional fourth if it earns its place: **the region diagram** — seven
points, nearest-neighbour links, miles on the links, "not to scale"
stated, all SVG.

## The deliverable — five options

Each option is a **complete, distinct design system**, not a recolour.
Vary the thesis, not just the palette. For each:

- **Name and thesis** (two sentences: what it believes about how a solo
  RPG should feel on a phone).
- **Tokens:** colour (light and dark, with the three label colours and
  their glyphs), type scale (family choice justified for RN bundling —
  system stack or one bundled family), spacing scale, radius, elevation
  or border rules.
- **Component set:** primary and menu buttons; a menu row with an
  authored line; the dice widget (rolled state, manual-entry state); the
  three label pills; the attribute strip; a panel or sheet; the free-text
  field in its empty and written states; an empty state that says
  "Nothing here yet. Roll, or write."
- **The three screens** at 390 × 844, light **and** dark for at least the
  beat.
- **One sentence on what this option would be bad at.**

Then a **comparison table** (legibility at 12 px, dynamic-type
resilience, SVG cost, how loud the voice is, how it ages over 400+
authored lines) and **a recommendation** with the reason.

## Five directions to start from (replace any that do not earn a place)

1. **The ledger** — monospace-adjacent, ruled lines, ink on paper; the
   app as a play journal that happens to roll dice.
2. **The scroll** — vertical calligraphic rhythm, generous margins,
   vermilion seals as the label glyphs; restraint over ornament.
3. **The instrument** — dense, precise, dark-first; dice and numbers
   large, prose small; the rules panel is the hero.
4. **The woodblock** — heavy geometric strokes in SVG, two inks and a
   paper, high contrast; brutal and warm at once.
5. **The quiet UI** — near-default platform components, one accent, the
   authored line the only voice; proof that the engine can carry itself.

## Hard rules

- **Never fake anything.** No invented achievements, streaks, timers, or
  activity indicators. No placeholder art. Use the real vocabulary above
  (SKILL, ENDURANCE, LUCK, Spirituality; Techniques, Rituals; Unexpected
  Event; Morale; the cave; the Ghost, the Beast, the Junior King).
- **No credited art, no imitation of it.** Do not draw the rulebook's
  cover or icons; do not "reference" them.
- **No dark patterns, no gamification chrome.** The book is quiet; the
  app is quieter.
- **Every screen shows its labels.** If a design hides the rule / reading
  / invention pill to look cleaner, it has failed the brief.
