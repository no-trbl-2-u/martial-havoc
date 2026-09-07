# Skill: expert

> **The reading.** Before any other work on the rules, the
> invoking agent reads the two PDFs at the repository root,
> `MH_Full_Itchio.pdf` and `The 5 treasures.pdf`, end to end, as
> text and as images, and derives the designer's intent by
> procedure. Standing rule 9 in `agents.md` says the PDFs are
> the game and nothing outranks them; `/expert` is how an agent
> earns the right to say it has read them.
>
> **Procedure only.** This file prescribes steps. It states no
> rule, number, table, name, or interpretation from the books.
> The agent discovers all content by running the procedure. If
> a later edit to this file adds book content, that edit is
> wrong; revert it.
>
> **Read-only on the repo.** The skill writes only to the
> session scratchpad. It never edits the PDFs, `spec.md`,
> `docs/`, or anything else under version control. It commits
> nothing. No `AskUserQuestion`: hard rule #6 (`AskUserQuestion`
> confined to `/oversight` and `/bootstrap`) stands.

## 1. Purpose

An agent that has read `docs/` has read an index. An agent that
has read a phase brief has read a summary. Neither is the book.
Rule 9 exists because summaries drift and the book does not.

`/expert` closes the gap. It walks the agent through both PDFs
page by page, forces the pages that text extraction flattens
(tables, maps, diagrams, sheets, art) to be read as images,
ledgers every dice procedure and every resource, computes the
odds the printed procedures produce, and only then asks what
the author wanted the player to feel. The output is the agent's
own familiarity plus a scratchpad trail that a reviewer can
audit.

Run it at the start of any session that will touch
`packages/engine`, `packages/content`, `docs/`, or a rules
question, and whenever a reading in `docs/rules/readings/` is
in doubt.

## 2. Invocation

```
/expert
```

No arguments. Anything passed in `$ARGUMENTS` is ignored.

## 3. Autonomy contract

- **Never ask questions.** The procedure is fixed; run it.
- **Never write to the repository.** Scratchpad only. If no
  scratchpad directory is named in the session, create a
  temporary directory outside the repository and use that.
- **Never run any step in the background.** Every step,
  including library installs, renders, simulations and
  sub-agent waits, is a foreground blocking call.
  `run_in_background: true` is forbidden on every call this
  skill makes.
- **Never skip a step because a tool is absent.** Find another
  tool. Only stop if no tool can be found, and say so.
- **Never substitute a derived file for the source.** The
  extractions in `docs/sources/` are not read in place of the
  PDFs. They may be consulted in Step 5 for the citation
  convention only.
- **Never claim expertise on a page not read.** Every page is
  read in Step 3, and every page selected in Step 4 is read
  again as an image.
- **No verify gate, no deploy gate.** Nothing is committed.

## 4. The procedure

Ten steps, in order. Each step's output goes to the scratchpad
under a file named for the step, so the trail is auditable.

### Step 1: Tooling

Check, in this order, for a PDF library that can extract text
per page and render a page to PNG:

1. `pymupdf` (preferred; one library for both jobs)
2. `pypdf` for text, plus `pdftoppm` or Playwright's bundled
   Chromium for rendering
3. `pdftotext` for text, plus either renderer above
4. The repository's `pdf-parse` dependency for text, plus
   either renderer above

Install into the session if nothing is present (`pip install
pymupdf` into the scratchpad environment is the default). Record
in `01-tooling.md` which library and version was used for text
and which for rendering.

If no combination can be found, stop here and report it as the
reason. Do not proceed on text alone.

### Step 2: Inventory

For every page of both PDFs, record a row: PDF page index (from
1), word count of the extracted text, embedded-image count.
Compute the mean word count per PDF. Write the two tables and
the two means to `02-inventory.md`.

A sub-agent may produce this table. The invoking agent reads
the table.

### Step 3: Text pass

Extract every page's text, in page order, to one file per PDF
in the scratchpad. Put a page marker before each page, in the
form `===== <pdf-tag> PDF page <index> =====`, so any later
citation can be traced to a page.

Read both files end to end, in order, without skipping. The
invoking agent does this itself; a sub-agent may not read on
its behalf. Do not grep, sample, or summarise in place of
reading. Do not read `docs/sources/*.extracted.txt` in place of
this pass.

While reading, keep a running list in `03-text-pass.md` of
every page that contains a table, a map, a diagram, a character
sheet, an epigraph, a divider, or a credits block, as best the
text reveals it. This list feeds Step 4.

### Step 4: Visual pass

Render to PNG, and read, every page that meets any of:

- word count below the PDF's mean from Step 2
- embedded-image count above zero
- listed in Step 3 as carrying a table, map, diagram, or
  character sheet

Read each PNG with the image-capable read tool. Where a page is
illegible at the first DPI, re-render at a higher DPI, or crop
it into halves or quarters, and re-read. Do not accept an
unreadable render.

For each image, record in `04-visual-pass.md` what structure
it carried that the text pass lost or scrambled: column order
in a table, cell alignment, a legend, a map key, a diagram's
labels, a sheet's field layout, a symbol or glyph the extractor
dropped. Where the rendered page and the extracted text
disagree, the rendered page wins; note the disagreement.

A sub-agent may render. The invoking agent reads every PNG.

### Step 5: Folio mapping

Determine, for each PDF, the relationship between the PDF page
index and the printed page number (folio), by comparing the
number printed on several rendered pages against their index.
Record the rule.

Then read `docs/sources/index.md` and one or two concept files
under `docs/` to determine the citation convention `docs/` uses
for each PDF. Record it in `05-folio-mapping.md`, with an
example citation for each PDF in that convention. Every folio
cited in later steps uses this convention.

### Step 6: Mechanics ledger

From the text pass only, with the visual pass to settle table
structure, write `06-ledger.md` with three lists. Do not
interpret in this step.

**Dice procedures.** One entry per procedure that involves
dice: what is rolled, what the result is compared against or
added to, what happens on each outcome, and the folio.

**Resources.** One entry per quantity the player tracks that
can go up or down: every printed way it increases, every
printed way it decreases, any printed cap or floor, and the
folio for each.

**Tables.** One entry per table: its dimensions (rows by
columns, and what die or dice index it), what it produces, and
the folio.

### Step 7: Math pass

For each dice procedure in the ledger, compute the exact
outcome probabilities across the full range of values the
books print for the quantities involved.

For any opposed or repeated procedure, write a simulation and
run representative cases using only values printed in the
books, at least 10,000 runs each. Record win, tie, and duration
figures for each case.

Save the script as `07-math.py` (or the language of the chosen
tooling) and its output as `07-math.md`. A sub-agent may write
and run the script. The invoking agent reads the output and
spot-checks at least one exact probability by hand.

### Step 8: Intent pass

Write `08-intent.md` answering each question below. Every
answer carries a folio and a confidence score from 0 to 100,
where 0 is a guess and 100 is a fact printed in the book.
Quotations are verbatim, including printed spelling.

a. What does the author say the game is for, in the author's
   own words? Quote; do not paraphrase.

b. For each dice procedure, what does the math from Step 7
   make likely to happen in play, and what does the
   surrounding prose say the author wants to happen? Where
   they agree, record the intent. Where they disagree, record
   the discrepancy.

c. For each resource, what does its rate of gain and loss push
   the player to do?

d. What do the book's structure, ordering, section art,
   epigraphs, appendices, examples, and pregenerated material
   reveal about the intended play experience?

e. What does the adventure PDF show about how the author
   expects the rulebook's procedures to be used in play?

f. What is the author's stated or evident attitude toward the
   rules being changed?

g. Where is the book deliberately silent or ambiguous, by the
   author's own admission, and where by omission?

### Step 9: Synthesis

Write `09-synthesis.md` in three parts.

1. One thesis sentence stating what the author built the game
   to make the player feel, with a confidence score and the
   three strongest pieces of evidence, each cited.
2. One line per major system stating what it exists to do,
   cited.
3. Implications for an engine or app that reproduces the game,
   each traced to a finding in Step 8 by its letter.

### Step 10: Report

Reply in chat with the synthesis from Step 9 and the inventory
from Step 2. Name the scratchpad directory so the trail can be
audited. Write nothing to the repository unless the user asks.
Do not claim expertise on any page that was not read in Step 3
or Step 4.

## 5. How `/expert` flows into the loop

```
/expert                   → agent familiarity + scratchpad trail
                                       │
/ship-a-phase, /iterate,  ←────────────┘
/plan-a-phase, /re-seed      cite the book with confidence;
                             docs/ is the index, the PDFs are the text
```

`/expert` ships nothing. It is the reading that every shipping
skill assumes happened. A `/march` tick that will touch the
rules can call it first; a session that will only touch the
app shell or infrastructure does not need it.

## 6. Hard rules

1. **No content from the PDFs appears in this file.** Not a
   rule, not a number, not a name, not a theme.
2. **Every step is foreground and blocking.**
   `run_in_background` is forbidden.
3. **Sub-agents may be used for Steps 2, 4, and 7 only.** The
   invoking agent reads all text in Step 3 itself and reads
   every PNG in Step 4 itself.
4. **Confidence scores are mandatory** on every interpretive
   claim in Steps 8 and 9.
5. **Quoting is verbatim,** including printed spelling.
6. **The skill ends without asking questions.** If a step
   cannot be completed, say which and why, and stop.
7. **Nothing is written to the repository.** Scratchpad only.
8. **No emojis. No `Co-Authored-By:`.** Nothing is committed,
   so this cannot arise; it is restated so nobody adds a
   commit step later.

## 7. Failure modes

- **No PDF tooling can be installed** (no network, no pip, no
  node). Stop at Step 1. Report the tools tried.
- **A PDF fails to open** (corrupt, wrong path, permissions).
  Stop at Step 2. Report the path and the error. Never modify
  or re-download the PDFs.
- **A render is illegible at every DPI tried.** Report the
  page and continue, marking every later claim about that
  page's structure as confidence 0.
- **The simulation cannot run** (no interpreter). Compute the
  exact probabilities by hand in Step 7 and mark the simulated
  figures as not produced.
- **The scratchpad is unwritable.** Create a temporary
  directory outside the repository and use it. Never fall back
  to the repository.

Before stopping on any of these, run
`node scripts/notify.mjs --title "expert: stopped" --body
"<reason>" --priority high` (standing rule 8; best effort).

## 8. What `/expert` is NOT

- **Not `/re-seed`.** Doesn't write a field report or touch
  `spec.md`.
- **Not `/plan-a-phase`.** Doesn't refine a brief.
- **Not a docs pass.** Doesn't correct `docs/`; a
  disagreement between `docs/` and the PDFs found along the
  way is reported in chat, and correcting it is its own
  change under rule 9.
- **Not a summary.** The scratchpad trail is the agent's
  working record, not a document for the repository.
- **Not optional for rules work.** A session that ships a
  rules behaviour without having read the folio it cites has
  skipped this.

## 9. Quick reference

```bash
# What it touches
<scratchpad>/01-tooling.md ... 09-synthesis.md   # the trail
<scratchpad>/<tag>.txt                            # per-PDF text dumps
<scratchpad>/png/                                 # rendered pages
<scratchpad>/07-math.py                           # simulation

# What it reads
MH_Full_Itchio.pdf                                # every page
The 5 treasures.pdf                               # every page
docs/sources/index.md                             # Step 5 only

# What it does NOT run
git commit / git push                             # nothing to commit
npm run verify                                    # nothing to verify
npm run deploy:check                              # nothing to deploy
AskUserQuestion                                   # no questions back
run_in_background                                 # never
```
