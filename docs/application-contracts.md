# Application, Adapter, Repository, and API Contracts

## Purpose
These contracts define the seams Release 1 should implement so JSON can later be replaced by live Jira, ServiceNow, and Epic Nova adapters without rewriting Scrum behavior.

## Source adapter contract

```ts
interface SourceAdapter {
  readonly sourceSystem: SourceSystem
  loadProjection(): Promise<ExternalWorkItemInput[]>
}
```

The adapter reads external data only. It does not own persistence, archival, Scrum state, or UI behavior.

Application service responsibility:

```ts
refreshSource(sourceSystem): Promise<RefreshResult>
```

Behavior:
- invoke that source's adapter
- validate/normalize complete candidate projection
- reject duplicate identity or malformed records
- persist atomically
- archive absent items for that source only after successful acceptance
- unarchive reappearing items
- never overwrite Scrum overlay/history
- return a user-safe status summary

## Repository contracts
Keep interfaces narrow and behavior-oriented. Do not build a generic ORM abstraction.

Conceptual interfaces:

```ts
interface WorkItemRepository {
  listActiveBacklog(): Promise<WorkItemView[]>
  listSprint(sprintId: string): Promise<WorkItemView[]>
  get(workItemKey: WorkItemKey): Promise<WorkItemView | null>
  replaceAcceptedSourceProjection(source: SourceSystem, items: ExternalWorkItem[]): Promise<void>
}

interface ScrumRepository {
  setStoryPoints(key: WorkItemKey, points: number | null): Promise<void>
  reorderBacklog(key: WorkItemKey, beforeKey?: WorkItemKey, afterKey?: WorkItemKey): Promise<void>
  assignSprint(key: WorkItemKey, sprintId: string | null): Promise<void>
  assignTeamMember(key: WorkItemKey, teamMemberId: string | null): Promise<void>
  moveBoardItem(key: WorkItemKey, targetColumnId: string): Promise<void>
  listTransitions(key: WorkItemKey): Promise<BoardTransition[]>
}

interface ConfigurationRepository {
  getSprints(): Promise<Sprint[]>
  getTeamMembers(): Promise<TeamMember[]>
  getBoardColumns(): Promise<BoardColumn[]>
  replaceAcceptedSprints(items: Sprint[]): Promise<void>
  replaceAcceptedTeamMembers(items: TeamMember[]): Promise<void>
  replaceAcceptedBoardColumns(items: BoardColumn[]): Promise<void>
}
```

Transactional rules belong in application/persistence coordination, not the React layer.

## Application services
Recommended R1 use cases:
- `GetBacklog`
- `GetSprintBoard`
- `GetWorkItemDetail`
- `SetStoryPoints`
- `ReorderBacklog`
- `AssignSprint`
- `AssignTeamMember`
- `MoveBoardItem`
- `RefreshSource`
- `ReloadConfiguration`
- `GetSystemStatus`

Each state-changing use case validates current accepted configuration and domain invariants before commit.

## HTTP API
The exact route names may evolve during coding, but the product should expose a small JSON API with these capabilities.

### Read
```text
GET /api/backlog
GET /api/sprints
GET /api/sprints/:sprintId/board
GET /api/team-members
GET /api/board-columns
GET /api/work-items/:workItemKey
GET /api/work-items/:workItemKey/transitions
GET /api/status
```

### Change Scrum overlay
```text
PUT  /api/work-items/:workItemKey/story-points
PUT  /api/work-items/:workItemKey/sprint
PUT  /api/work-items/:workItemKey/team-assignee
PUT  /api/work-items/:workItemKey/board-column
POST /api/backlog/reorder
```

### R1 fixture/config refresh
```text
POST /api/admin/refresh/:sourceSystem
POST /api/admin/reload-config/:configType
```

These admin-like endpoints are local R1 fixture controls, not a production admin feature. They need not be exposed prominently in the user UI; implementation/test tooling may invoke them.

## Response semantics
Recommended success responses return the persisted effective state, not merely `204`, so the UI can reconcile with server truth.

Recommended error shape:

```json
{
  "error": {
    "code": "INVALID_BOARD_COLUMN",
    "message": "This work item could not be moved because the configured column is unavailable.",
    "details": null
  }
}
```

Rules:
- messages shown to users are actionable and do not leak stack traces or source payloads
- stable `code` supports UI/test behavior
- validation failures use 4xx responses
- unexpected persistence/runtime failures use 5xx and leave prior durable state intact

## Idempotency / duplicate-operation rules
R1 is local and single-user, but retries must not corrupt state.

- setting an estimate/assignee to its current value is safe and does not create unrelated history
- moving to the current board column is a no-op and must not append a duplicate transition
- re-running the same accepted source projection does not archive/reactivate items spuriously
- refresh/reload endpoints may be retried safely
- sprint changes append history only when board context actually changes

## UI consistency rule
The UI must treat successful API responses as authoritative. For state changes, either wait for persistence success or use optimistic UI with rollback; the implementation must never leave a failed action visually represented as successfully persisted.

## Security/runtime contract
- server binds to `127.0.0.1`
- no CORS exposure beyond what local development requires
- source descriptions rendered as text, not unsanitized HTML
- source URLs restricted to validated HTTP(S) links and opened only by explicit user action
- no remote telemetry, analytics, logging, CDN, or hosted auth dependencies
- security headers applied on normal local build
