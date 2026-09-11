# State, Lifecycle, and Failure Semantics

## State ownership
Multi Board maintains two conceptually separate classes of state:

1. **Source projection** — the last successfully accepted representation of source-owned work.
2. **Scrum overlay** — Multi Board-owned coordination state layered on top of that work.

They must never be conflated.

## Work-item lifecycle states
A source work item is either:
- **active** — present in the latest successfully accepted projection for its source system
- **archived** — absent from a later successfully accepted projection for its source system

Archived work is retained but hidden from active backlog/board views.

### Reactivation
If an archived item later reappears with the same `(sourceSystem, sourceId)`, it becomes active again. Its existing Scrum overlay and board history remain attached. Source-owned fields refresh to the newly accepted values.

## Sprint/board lifecycle
A work item may be:
- unsprinted: `sprintId=null`, `boardColumnId=null`
- sprinted: `sprintId!=null`, `boardColumnId!=null` and should refer to a valid configured column unless configuration has subsequently changed

### Enter sprint
Unsprinted -> Sprint S:
- set sprint to S
- set current board column to configured origin
- append transition for S: `null -> origin`

### Leave sprint
Sprint S -> unsprinted:
- append transition for S: `column -> null`
- clear sprint
- clear current board column

### Change sprint
Sprint A -> Sprint B:
- append A transition: `currentColumn -> null`
- append B transition: `null -> origin`
- persist current sprint B/current column origin atomically

Carrying an in-progress board column from one sprint to another is not allowed because column meaning is sprint workflow context, not permanent source-item state.

### Move within sprint
Column X -> Y:
- validate Y against current accepted board configuration
- update current column
- append `X -> Y` transition for current sprint
- perform both in one transaction

Moving to the current column is a no-op and appends no duplicate history.

## Backlog lifecycle
Backlog rank is independent of board column. Backlog is not itself a board workflow column.

An archived item retains rank but is omitted from active backlog. On reactivation, its prior rank may be restored. If rank collisions or ordering ambiguity are discovered during implementation, use deterministic tie-breaking and normalize ranks without changing relative user intent; do not expose rank-token mechanics to users.

## Story-point lifecycle
- null = unestimated
- 0 = explicit zero estimate
- positive whole integer = explicit estimate
- decimals and negatives invalid

Archival, sprint changes, and source refreshes do not reset story points.

## Team assignment lifecycle
`teamAssigneeId` is local Scrum coordination state. It is not derived from and does not write to `sourceAssignee`.

Archival and source refreshes do not reset team assignment. A removed configured team member leaves an orphaned reference that is preserved and surfaced until corrected.

## Source-refresh semantics
Each source is independent.

A refresh attempt may be:
- **accepted** — complete candidate validates and commits atomically
- **rejected** — parse/validation/persistence failure; previous accepted source projection remains effective

Only an accepted refresh may cause archival/reactivation for that source.

### Partial external data
R1 assumes a source fixture represents a complete projection for that source for the team's workload. Therefore absence from an accepted projection means archive. If future live adapters can only return partial pages/results, adapter completeness must be proven before the same archival semantics are applied.

## Configuration lifecycle
Configuration types are independent last-known-good sets:
- sprints
- team members
- board columns

A candidate set is parsed/validated in full before acceptance.

Rejected candidate:
- previous set remains active
- error is visible/diagnosable
- no persisted Scrum state is rewritten

Accepted candidate that removes referenced IDs:
- configuration becomes active
- persisted references remain unchanged
- affected state is marked/surfaced as invalid-orphaned
- user must correct it before the state is treated as normal

## Orphaned-state semantics
Examples:
- sprint reference points to removed sprint
- team assignee reference points to removed member
- board-column reference points to removed column

Multi Board must not guess replacements based on display name, ordering, or similarity.

Where practical, UI should show the stale identifier or a clear 'Unavailable' label so the user understands why correction is needed.

## Time semantics
All transitions, refresh attempts, acceptance timestamps, archive/reactivation events, and update timestamps are UTC instants.

Display may use the local browser timezone. Persisted meaning must not depend on daylight-saving or machine timezone changes.

## Failure behavior
For every state-changing action:
- validate before change
- execute required persistence atomically
- on failure, rollback
- return an actionable error
- UI must not leave the failed state visually committed

For source/config loads:
- never replace known-good data with a malformed/incomplete candidate
- never infer success from file existence alone
- never archive because of a rejected refresh

## Fresh-context reconstruction
After application restart, the database plus current accepted fixture/config inputs are sufficient to reconstruct:
- active/archived source work
- all Scrum overlay state
- backlog ordering
- sprint/board state
- team assignment
- transition history
- last-known-good source/config status
- invalid/orphaned references

No browser local storage, session state, conversation state, or external cloud service is required for durable product state.
