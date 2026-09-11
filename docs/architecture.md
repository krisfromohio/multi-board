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
- board column
- board-column transition history

`sourceAssignee` and `teamAssignee` are intentionally separate.

### 3. Source adapters normalize external work

The application consumes a normalized `ExternalWorkItem` model through source adapters.

Release 1 implements a JSON adapter. Future adapters may include Jira, ServiceNow, and Epic Nova without changing the domain model used by the UI and application services.

JSON is therefore an **integration mechanism**, not the working database.

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

Source imports should follow this model:

```text
external input
  -> parse
  -> validate
  -> normalize
  -> transactional import
  -> last-known-good source projection
```

A malformed import must not silently replace valid source data with an incomplete or misleading projection.

### Board transitions

Board movement updates current board state and appends transition history in one database transaction. A successful move must not leave current state and history inconsistent.

## Resilience principles

- Validate all external/configuration input before accepting it.
- Prefer last-known-good state over destructive replacement after an invalid import.
- Apply state-changing operations transactionally where multiple records must remain consistent.
- Surface invalid configured states rather than silently coercing them.
- Ensure persisted Scrum state can reconstruct the working board after refresh or restart.
- Do not depend on browser/session/conversation state for durable product state.

## Security and privacy constraints

Release 1 has a strict local-data posture.

- Bind the application to `127.0.0.1`, not `0.0.0.0`.
- Do not require cloud hosting, a cloud database, remote analytics, telemetry, remote logging, a hosted auth provider, or a CDN.
- Bundle application JavaScript, CSS, fonts, and other assets locally.
- Do not commit PII, trade secrets, real source exports, local SQLite databases, or local overrides to Git.
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
- board movement and history invariants

### Persistence integration tests

Use disposable SQLite databases so persistence behavior can be exercised without provisioning a database server.

### End-to-end acceptance tests

Use Playwright for representative user journeys that map directly to story acceptance criteria and the Release 1 demonstration.

## Performance approach

No distributed cache, Redis, queue, search engine, WebSocket layer, event bus, or microservice architecture is justified for Release 1.

SQLite indexes should follow observed access paths such as source identity, sprint, team assignee, board column, and work-item history.

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
3. Sensitive data does not leave the machine in R1.
4. The system remains a modular monolith until evidence justifies distribution.
5. Add abstraction only at known change boundaries.
6. Architecture is implemented incrementally through vertical stories, not through horizontal architecture projects.
7. R1 must require zero mandatory license, subscription, hosting, or service fees.
8. R1 development and operation must not require local-administrator rights from the Product Owner.

## Open environment check

The installed Node.js version still needs to be confirmed before locking the exact SQLite access API and dependency versions. This does not change the architecture; it determines the cleanest implementation of the local SQLite adapter.
