# Release 1 Decisions

This log records product/architecture decisions made during refinement so implementation does not silently reinterpret them.

## D1 — Federated source ownership
Source systems remain authoritative for source work content. Multi Board stores a projection plus its own Scrum overlay; it does not become a fourth source-of-truth work system.

## D2 — Local Scrum assignment
`sourceAssignee` is source-owned/read-only. `teamAssignee` is Multi Board-owned and may be assigned inside the POC. Future synchronization/write-back semantics are deferred.

## D3 — Story points
Story points accept arbitrary non-negative whole numbers. Null/blank means unestimated; explicit `0` is valid and distinct. Negative and decimal values are invalid.

## D4 — Persistence
JSON is an R1 source/config input mechanism, not the working datastore. Durable state uses local SQLite behind repository seams.

## D5 — Architecture
R1 is a local-first TypeScript modular monolith: React/Vite/MUI/dnd-kit UI, Fastify local server, Zod validation, SQLite persistence, Vitest + Playwright. One local Node process in the normal runnable build.

## D6 — Security/data posture
The app binds to loopback, requires no remote services, telemetry, analytics, hosted auth, cloud database, or CDN. Sensitive real source data/runtime databases remain local and uncommitted. GitHub may contain non-confidential code/docs and synthetic fixtures.

## D7 — Cost/admin posture
R1 must require zero mandatory licensing/subscription/hosting/service fees and must not require local-administrator rights from the Product Owner.

## D8 — Visual quality
Professional, modern, cohesive UI is part of Done in every user-facing slice; it is not deferred to a later polish story. S1 validates the interaction/visual design before significant implementation.

## D9 — Source refresh failure
Source input is validated and accepted atomically per source. A failed/rejected refresh preserves that source's last-known-good projection and cannot archive items.

## D10 — Source refresh isolation
Jira, ServiceNow, and Nova are independently refreshable projections. Failure in one source does not block successful acceptance for another source.

## D11 — Archival
If an item is absent from a later successfully accepted projection for its source, mark it archived and omit it from active backlog/board views. Preserve its source record, Scrum overlay, and transition history.

## D12 — Reactivation
If an archived item reappears with the same `(sourceSystem, sourceId)`, unarchive the same logical item and retain its prior Scrum overlay/history. Refresh its source-owned fields from the new accepted projection.

## D13 — Board origin
Board-column configuration designates exactly one `origin` column. Newly sprint-assigned work enters that origin. No hard-coded column name or ID controls this behavior. Zero/multiple origins is invalid configuration.

## D14 — Backlog vs board
Backlog is not a board column. Backlog rank and sprint board workflow state are separate concerns.

## D15 — Sprint/board coupling
Current board column exists only while an item is sprint-assigned. Removing from a sprint clears current board column. Moving directly between sprints resets to the destination sprint's configured origin.

## D16 — Transition history
Board transition history is append-only and records work item, sprint context, from column, to column, and UTC timestamp. Null represents entering/leaving board context.

## D17 — Configuration changes
Sprint/team-member/board-column configuration is last-known-good. Invalid candidates are rejected. A valid new configuration may leave persisted Scrum references orphaned; preserve and surface those references rather than silently remapping.

## D18 — Time semantics
Operational/history timestamps are stored as UTC instants and converted only for display. Optional sprint dates are local calendar dates.

## D19 — Retry/idempotency
State-changing operations must be safe under retries: no duplicate transition events for no-op same-column moves; refresh/reload can be retried without spurious archive/reactivate behavior.

## D20 — Source identity assumption
R1 assumes `(sourceSystem, sourceId)` is an immutable, stable identity. If a real source violates this later, adapter identity semantics must be revisited.

## D21 — Complete-projection assumption
R1 source fixtures represent complete workload projections per source. Therefore absence from an accepted projection means archive. Future live adapters must prove completeness before applying the same absence semantics.

## D22 — Error UX
Failed mutations must be visible and leave persisted/visible state consistent. The app must not present a failed change as successfully saved.

## D23 — No speculative infrastructure
No microservices, event bus, Redis, queue, WebSockets, search service, generalized plugin framework, or production-scale infrastructure is added without evidence from a story.

## D24 — Node/SQLite implementation choice
Development/runtime environment is Node.js `v24.16.0`. R1 will use the built-in `node:sqlite` module with `DatabaseSync`; no native SQLite npm module or external database service is required. This keeps setup zero-cost, avoids local native-build tooling/admin requirements, and preserves the repository abstraction so persistence can be replaced later if needed.
