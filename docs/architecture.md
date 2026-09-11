# Multi Board Architecture

## Status

Converged architecture for Release 1 unless implementation reveals a material constraint.

## Architectural objective

Build the smallest secure architecture that proves the federated Scrum concept in Release 1 without creating throwaway foundations for the likely final product.

The architecture is optimized for five goals:

1. good interactive performance
2. low operational and conceptual complexity
3. resilience and recoverability
4. straightforward automated testing
5. compatibility with both the Release 1 POC and future live source-system integrations

## System shape

Multi Board is a **local-first TypeScript modular monolith**.

```text
Browser
  |
  | localhost HTTP
  v
Multi Board Node process
  |- serves compiled React UI
  |- HTTP/API layer
  |- application services
  |- domain logic
  |- source adapters
  `- persistence repositories
          |
          v
       SQLite
```

During development, Vite may serve the UI separately for hot reload, while the application API remains local. A normal runnable build should require one Node process.

## Technology choices

| Concern | Choice |
| --- | --- |
| Language | TypeScript |
| UI | React |
| Build tooling | Vite |
| Component library | Material UI Core only |
| Drag/drop | dnd-kit |
| Local HTTP server | Fastify |
| Validation | Zod |
| Persistence | SQLite |
| SQLite access | Prefer Node `node:sqlite` when the installed Node version supports the required stable API |
| ORM | None for R1 |
| Unit/application tests | Vitest |
| Browser/E2E tests | Playwright |
| R1 external source | JSON source adapter |
| Deployment | One local Node process |
| Network exposure | `127.0.0.1` only in R1 |
| Required external services | None |

All required R1 technology must be free to use. Do not introduce MUI X Pro/Premium or other commercial dependencies.

## Core boundaries

### 1. Source systems own source work

Source-owned fields are external projections, not locally authored issues:

- source system
- source ID
- source URL
- name
- source assignee
- description

Multi Board must not imply that changing Scrum metadata modifies the source record.

### 2. Multi Board owns the Scrum overlay

Multi Board-owned state includes:

- story points
- sprint assignment
- backlog ordering
- team assignee
- board column while sprint-assigned
- board-column transition history
- archived marker for source items absent from the latest accepted projection for their source

`sourceAssignee` and `teamAssignee` are intentionally separate.

### 3. Source adapters normalize external work

The application consumes a normalized `ExternalWorkItem` model through source adapters.

Release 1 implements JSON-backed source adapters. Future adapters may include Jira, ServiceNow, and Epic Nova without changing the domain model used by the UI and application services.

JSON is therefore an **integration mechanism**, not the working database.

Each source is refreshed independently. Jira, ServiceNow, and Epic Nova have separate last-known-good projections. Failure of one source refresh must not block acceptance of a valid refresh from another source. Archival is scoped only to the source whose refresh was successfully accepted.

### 4. Persistence is behind a narrow repository seam

Application/domain code should not depend directly on SQLite APIs everywhere. Small repository interfaces isolate the local persistence implementation where doing so protects a known future change boundary.

Do not build a generic persistence framework or introduce an ORM in R1.

## Persistence model

SQLite is the Release 1 local persistence implementation.

Conceptual tables:

- `source_work_item`
- `scrum_overlay`
- `sprint`
- `team_member`
- `board_column`
- `board_transition`

The exact physical schema may evolve while stories are implemented.

### Source projection refresh

Each source refresh follows this model independently:

```text
external input
  -> parse
  -> validate
  -> normalize
  -> transactional import for that source
  -> last-known-good source projection
```

A malformed import must not silently replace valid source data with an incomplete or misleading projection.

If a previously known source item is absent from a later successfully accepted projection for that same source, it is marked archived and omitted from active views while its Scrum overlay and board-transition history remain persisted. A failed import must not archive items.

If an archived item later reappears with the same immutable `(sourceSystem, sourceId)` identity, Multi Board reactivates that existing item and preserves its previously stored Scrum overlay and transition history. It must not create a duplicate or silently reset the item's Scrum state.

### Sprint and board-state lifecycle

Board column is meaningful only while an item is sprint-assigned.

- assigning an unsprinted item to a sprint sets its current board column to that sprint board's configured `origin`
- removing an item from a sprint clears its current board column
- moving an item directly from one sprint to another resets its current board column to the destination sprint's configured `origin`; it does not carry workflow state across sprint boundaries

These changes are recorded in board transition history. A transition may therefore have a null `from` or `to` column when entering or leaving sprint context.

### Board origin and configuration integrity

Board-column configuration designates exactly one `origin` column. Newly sprint-assigned work enters that configured origin column; no hard-coded column name defines initial state. Zero or multiple origin designations are invalid configuration.

If persisted Scrum state refers to a sprint, team member, or board column removed from supplied configuration, preserve the stored reference and surface it as invalid/orphaned. Do not silently remap it.

### Board transitions

Board movement updates current board state and appends transition history in one database transaction. A successful move must not leave current state and history inconsistent.

Each transition records at least:

- work-item identity
- sprint context
- previous column, nullable
- resulting column, nullable
- timestamp

Including sprint context preserves historical meaning when an item participates in more than one sprint over time.

## Resilience principles

- Validate all external/configuration input before accepting it.
- Prefer last-known-good state over destructive replacement after an invalid import.
- Scope source-refresh failure and archival to the affected source only.
- Apply state-changing operations transactionally where multiple records must remain consistent.
- Surface invalid configured states rather than silently coercing them.
- Ensure persisted Scrum state can reconstruct the working board after refresh or restart.
- Do not depend on browser/session/conversation state for durable product state.

## Security and privacy constraints

Release 1 has a strict local-data posture for sensitive runtime data.

- Bind the application to `127.0.0.1`, not `0.0.0.0`.
- Do not require cloud hosting, a cloud database, remote analytics, telemetry, remote logging, a hosted auth provider, or a CDN.
- Bundle application JavaScript, CSS, fonts, and other assets locally.
- Do not commit PII, trade secrets, real source exports, local SQLite databases, or local overrides to Git.
- The GitHub repository may contain non-confidential source code, product documentation, architecture material, and synthetic fixtures.
- Treat descriptions, names, assignees, and arbitrary source payloads as potentially sensitive.
- Logs should use identifiers and operational summaries rather than copying source-record contents.
- Render untrusted source text safely; do not render source HTML unsanitized.
- Use parameterized SQL statements.
- Apply suitable local HTTP security headers, including Content Security Policy where compatible with the application build.
- A source URL may be presented as a link; the POC should not automatically fetch arbitrary source URLs.

The local operating-system account is the trust boundary for R1. Authentication/authorization is not a Release 1 requirement because the service is local-only, but this must be revisited before any network-accessible deployment.

## Testing strategy

### Fast domain/application tests

Use Vitest for business rules such as:

- arbitrary non-negative whole-number story-point semantics
- unestimated versus explicit zero
- invalid board-column rejection
- source refresh not overwriting Scrum-owned state
- per-source last-known-good isolation
- archival and reactivation semantics
- sprint assignment/removal/reset-to-origin lifecycle
- board movement and history invariants

### Persistence integration tests

Use disposable SQLite databases so persistence behavior can be exercised without provisioning a database server.

### End-to-end acceptance tests

Use Playwright for representative user journeys that map directly to story acceptance criteria and the Release 1 demonstration.

## Performance approach

No distributed cache, Redis, queue, search engine, WebSocket layer, event bus, or microservice architecture is justified for Release 1.

SQLite indexes should follow observed access paths such as source identity, sprint, team assignee, board column, archived status, and work-item history.

Optimize only after representative workload demonstrates a problem.

## Evolution path

A successful later deployment may change:

```text
SQLite repository -> enterprise-approved relational database repository
JSON adapter       -> Jira / ServiceNow / Epic Nova adapters
localhost trust    -> enterprise authentication and authorization
local process      -> internally hosted application
```

The following should remain substantially stable:

- React interaction model
- core domain concepts
- Scrum-overlay ownership semantics
- source-adapter contract
- application services
- board transition model
- most API contracts and business rules

## Architectural guardrails

1. Source systems own source work; Multi Board owns Scrum coordination state.
2. JSON is an R1 adapter, not the persistence architecture.
3. Sensitive runtime data does not leave the machine in R1.
4. The system remains a modular monolith until evidence justifies distribution.
5. Add abstraction only at known change boundaries.
6. Architecture is implemented incrementally through vertical stories, not through horizontal architecture projects.
7. R1 must require zero mandatory license, subscription, hosting, or service fees.
8. R1 development and operation must not require local-administrator rights from the Product Owner.
9. GitHub may hold non-confidential code/docs and synthetic fixtures; real source-system data and other sensitive runtime artifacts stay local and uncommitted.
10. Source refreshes are isolated by source system and preserve each source's last-known-good projection independently.
11. Work-item identity is stable across archive/reactivation and is based on `(sourceSystem, sourceId)`.
12. Board state is sprint-contextual and transition history records sprint context.

## Open environment check

The installed Node.js version still needs to be confirmed before locking the exact SQLite access API and dependency versions. This does not change the architecture; it determines the cleanest implementation of the local SQLite adapter.
