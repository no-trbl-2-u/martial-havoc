# Phase 10h — The cave map and the journal as a story

> Agent-facing brief, from the verdict of 2026-09-06. The player has
> no sense of where they have been or what has happened. The data for
> both exists: `cave.visited`, the adjacency graph in `areas.json`,
> the deeds ledger and the passages. None of it is drawn as a place or
> read as a story.

## Outcome

The MAP tab shows the cave while the Master is in it, room by room as
visited; the RECORD screen tells the adventure so far in order.

**Done when:** MAP in the cave draws the rooms visited and the
passages between them from `areas.json`, the current room marked,
locked doors drawn as locked, unvisited neighbours as blanks; MAP
outside the cave draws the region as now; RECORD's ledger is a
chronicle with one entry per turn (area, event, what was met, what
was done), passages interleaved where they were written, and the deeds
folded into it; export carries the chronicle.

**Waits on:** nothing; 10a's lines make the chronicle read better.
**Cost:** one to two weeks.

## What the book gives

- 5T a1: the cave map (watabou), eight rooms, drawn passages; the
  adventure ships with a map and expects the player to have it. The
  refusal "no credited art" stands: the map is redrawn as our own SVG
  from the adjacency graph (`packages/content/data/campaigns/the-5-
  treasures/map.svg` exists as a room diagram since Phase 5).
- MH p.43: "roll a handful of d6 on a sheet of paper. Mark where the
  dice land" — the region is the book's map; the cave's is the
  adventure's.
- MH p.85: "you can draw the outline as you play, marking the
  transition to a new act and the achievement of plot points."
- `spec.md`, Horizon: "One campaign record holds one Master, its deeds
  ledger ... the player's passages".

## Scope

- `RegionScreen` becomes `MapScreen` with two modes by
  `state.screen === 'region'` and whether the Master is in the cave:
  the cave map (new `CaveMap` component, SVG from the graph with fixed
  positions per area in `areas.json` as `pos: {x, y}`, ours) or the
  region diagram as now. Visited rooms filled, the current one ringed,
  passages drawn, a locked door drawn as a bar, unvisited neighbours
  as dashed outlines with no name.
- Tapping a visited room on the map shows its name and the last event
  there; it does not move the Master (moving is the beat's roll).
- The chronicle: the record gains `chronicle: readonly Entry[]` where
  an entry is `{turn, area, event, met, did, line}` written by every
  reducer step that already writes a deed; deeds remain as the terse
  ledger for the ending count. Passages are entries of kind
  `passage`. RECORD lists the chronicle newest last, with the area's
  name as a running head.
- Export carries the chronicle; migration defaults it from deeds
  where a record predates this phase.

## Decisions made upfront

- Positions are hand-set in data, not computed: eight rooms, once.
- The map never shows an unvisited room's name: the Hint gate's spirit
  (I-60).
- The chronicle is the campaign half of the record and migrates.

## Not in scope

- A region map that draws terrain (Phase 12).

## BDD

```gherkin
Feature: Where I have been and what has happened

  Scenario: the map fills as I go
    Given a fresh Master on the mountain
    When I open MAP
    Then the cave map shows one filled room, FLAT-TOP MOUNTAIN, ringed
    And one dashed outline beside it with no name
    When I walk to the Cave entrance and open MAP
    Then two rooms are filled and the entrance is ringed
    And three dashed outlines hang off the entrance

  Scenario: a locked door is drawn
    Given the Attendants room visited without the key
    When I open MAP
    Then the passage to the Chieftain quarter is drawn with a bar

  Scenario: outside the cave the map is the region
    Given the ending reached and LEAVE FOR THE REGION pressed
    When I open MAP
    Then the region diagram shows and reads NOT TO SCALE

  Scenario: the chronicle reads in order
    Given I walked to the Cave entrance on a Hint, then to the Dining hall on an Encounter, killed the Devil servant and wrote "The thrones are cold."
    When I open RECORD
    Then the chronicle reads, in order: CAVE ENTRANCE, Hint; DINING HALL, Encounter, Devil servant, killed it; then the passage "The thrones are cold."

  Scenario: an old save gets a chronicle
    Given an exported record from before this phase with deeds only
    When I import it
    Then RECORD shows a chronicle built from the deeds, each without an area
```

## Verify gate

`npm run verify`; `campaign.test.ts` migration; one e2e case per map
scenario; `record-screen.test.ts` for the chronicle order.
