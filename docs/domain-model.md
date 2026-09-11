# Domain and Object Model

## Purpose
This document defines the Release 1 domain model for Multi Board. It separates source-owned work from Multi Board-owned Scrum coordination state and records the lifecycle decisions made during refinement.

## Identity
A federated work item is identified by the immutable composite key:

```text
WorkItemKey = sourceSystem + ":" + sourceId
```

Examples: `JIRA:ABC-123`, `SERVICENOW:INC0012345`, `NOVA:NOVA-77`.

Release 1 assumes `(sourceSystem, sourceId)` is immutable and uniquely identifies the same source item across refreshes.

## Core domain objects

### ExternalWorkItem
Source-owned projection. Read-only in Multi Board.

```ts
interface ExternalWorkItem {
  key: WorkItemKey
  sourceSystem: SourceSystem
  sourceId: string
  sourceUrl: string
  name: string
  sourceAssignee: string | null
  description: string | null
  archived: boolean
  sourceVersion?: string | null
  lastSeenAt: Instant
}
```

`archived` is Multi Board's local lifecycle marker derived from source presence/absence; it does not modify the source item.

### ScrumOverlay
Multi Board-owned coordination state.

```ts
interface ScrumOverlay {
  workItemKey: WorkItemKey
  storyPoints: number | null
  sprintId: string | null
  backlogRank: string | null
  teamAssigneeId: string | null
  boardColumnId: string | null
}
```

Rules:
- `storyPoints` is null for unestimated, otherwise a non-negative whole number. `0` is valid and distinct from null.
- `boardColumnId` is meaningful only while `sprintId` is non-null.
- Removing an item from a sprint clears its current board column.
- Assigning an unsprinted item to a sprint sets its board column to the configured origin column.
- Moving directly from one sprint to another resets the board column to the destination sprint's configured origin column.

### Sprint
Supplied configuration.

```ts
interface Sprint {
  id: string
  name: string
  startsOn?: LocalDate | null
  endsOn?: LocalDate | null
}
```

Release 1 does not provide sprint administration UI.

### TeamMember
Supplied configuration.

```ts
interface TeamMember {
  id: string
  displayName: string
}
```

`teamAssigneeId` is intentionally distinct from `sourceAssignee`.

### BoardColumn
Supplied configuration.

```ts
interface BoardColumn {
  id: string
  name: string
  order: number
  origin: boolean
}
```

Exactly one usable board column must have `origin=true`.

### BoardTransition
Append-only history of board-context changes.

```ts
interface BoardTransition {
  id: string
  workItemKey: WorkItemKey
  sprintId: string
  fromColumnId: string | null
  toColumnId: string | null
  changedAt: Instant
}
```

Null semantics:
- `null -> origin`: item enters a sprint.
- `column -> null`: item leaves a sprint.
- `columnA -> columnB`: movement within a sprint.
- direct Sprint A -> Sprint B is represented as `A: column -> null` followed by `B: null -> origin`, preserving sprint context.

## Lifecycle

### Source refresh
Each source system is refreshed independently.

For source S:
1. parse input
2. validate all records and uniqueness
3. normalize all records
4. if validation fails, reject the refresh and retain S's last-known-good projection
5. if validation succeeds, accept atomically
6. items previously active for S but absent from the accepted projection are marked archived
7. items present again with the same key are automatically unarchived
8. Scrum overlay and transition history are never deleted because of source archival/reactivation

A failed refresh for one source does not prevent a valid refresh for another source.

### Configuration changes
Sprint, team-member, and board-column configuration is last-known-good.

If a candidate configuration is malformed or violates invariants, reject it and retain the previous accepted configuration.

If a valid new configuration removes a value still referenced by persisted Scrum state, preserve the reference and surface it as invalid/orphaned. Do not silently remap it.

### Active vs archived
Archived items are omitted from active backlog and sprint-board views. Their source projection, Scrum overlay, and history remain persisted so reappearance restores continuity.

## Authority summary
Source-owned:
- source system
- source ID
- source URL
- name
- source assignee
- description
- source presence/absence

Multi Board-owned:
- story points
- sprint assignment
- backlog rank
- team assignee
- board column
- board history
- derived archived marker

## Invariants
1. Work item identity is unique by `(sourceSystem, sourceId)`.
2. Source refresh never overwrites Scrum-owned state.
3. A failed source refresh never archives items.
4. Archived work is not shown as active work.
5. Reappearing work restores prior Scrum/history state.
6. Exactly one board column is the origin.
7. Unsprinted work has no current board column.
8. Sprint assignment and board-state/history updates are transactional.
9. Board transition timestamps are stored as UTC instants.
10. Orphaned references are preserved and surfaced, not rewritten silently.
