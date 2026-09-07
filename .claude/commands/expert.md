---
description: Read both PDFs at the repo root end to end, as text and as images, and derive the designer's intent by procedure. Read-only; writes only to the scratchpad; no questions back.
---

You are invoked under the `expert` skill — full autonomy, no
review checkpoint. Read `skills/expert.md` end to end before
touching anything else; that file is the single source of
truth for this command.

The two PDFs at the repository root are the game (agents.md
standing rule 9). Your job: read every page of both, as text
and, where the text pass flattens structure, as images; ledger
every dice procedure and resource; compute the odds the printed
procedures produce; then answer the intent questions and write
the synthesis. Report in chat. Commit nothing.

Argument handling:
- None. `$ARGUMENTS` is ignored.

Hard rules:
- **Never ask questions back.** Hard rule #6 (`AskUserQuestion`
  confined to `/oversight` and `/bootstrap`) stands.
- **Never write to the repository.** Scratchpad only.
- **Every step is foreground and blocking.**
  `run_in_background` is forbidden.
- **Read all text yourself.** Sub-agents may inventory, render,
  and simulate (Steps 2, 4, 7); they may not read for you.
- **Never substitute `docs/sources/` extractions for the PDFs.**
- **Confidence scores on every interpretive claim.** Quotes
  verbatim, printed spelling kept.
- **No verify gate, no deploy gate.** Nothing is committed.

Procedure: §4 of `skills/expert.md`, Steps 1 to 10 in order.
Failure modes: §7. Hard rules: §6.

After Step 10, print the synthesis and the inventory in chat,
name the scratchpad directory, and exit. If a step cannot be
completed, say which and why, and stop.

Argument: $ARGUMENTS
