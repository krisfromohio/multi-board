# Release 1 Implementation Plan

## Purpose
This is the implementation-ready plan for Release 1. Product behavior is owned by GitHub issues #1-#6; this document records the technical work needed to prove those stories end-to-end without creating horizontal architecture projects.

## Sequencing principle
Implement in story order:

1. S1 — interaction/visual design
2. R1-1 — unified workload
3. R1-2 — refine/prioritize
4. R1-3 — sprint planning
5. R1-4 — active sprint board
6. R1-5 — release demonstration

Each story must leave a runnable, testable increment. Shared infrastructure is pulled only when the first story needs it.

## Environment prerequisite
Before locking `package.json` and SQLite access code, confirm:

```text
node --version
```

Reason: R1 prefers built-in `node:sqlite` when the installed Node runtime provides the required usable API without awkward flags or native-build prerequisites. If not, select the simplest zero-cost, no-admin fallback. This is an implementation choice, not a product-design decision.

## S1 — Validate interaction and visual design
Implementation subtasks:
- [ ] Create representative synthetic mixed-source fixture for design/prototype work.
- [ ] Establish visual language: typography, spacing, surfaces, source badges, card hierarchy, interaction feedback, empty/degraded states.
- [ ] Build high-fidelity interactive backlog design.
- [ ] Exercise inline/detail estimation and sprint/team assignment patterns.
- [ ] Build high-fidelity board design including drag states and assignee filter.
- [ ] Design source-vs-Multi-Board ownership cues.
- [ ] Design failed-refresh/last-known-good state.
- [ ] Design invalid/orphaned-reference state.
- [ ] Validate representative user journey without implementation coaching.
- [ ] Record design decisions/components that subsequent stories must follow.

## R1-1 — Understand complete workload
Implementation subtasks:
- [ ] Create TypeScript workspace/runtime shell after Node version is known.
- [ ] Add React/Vite/MUI application shell using S1 design language.
- [ ] Add Fastify local server bound to loopback.
- [ ] Add SQLite bootstrap/migrations and repository seam.
- [ ] Implement domain identity and source-owned work model.
- [ ] Implement `JsonSourceAdapter` per source system.
- [ ] Implement Zod validation/normalization for source input.
- [ ] Implement atomic per-source import and source refresh status.
- [ ] Implement last-known-good behavior.
- [ ] Implement archive-on-absence only after accepted refresh.
- [ ] Implement reactivation by same composite identity.
- [ ] Implement backlog read API and item detail API.
- [ ] Build unified backlog UI with source identity, source assignee, description access, and explicit source link.
- [ ] Add safe text rendering and source-link validation.
- [ ] Add deterministic synthetic Jira/ServiceNow/Nova fixtures.
- [ ] Add malformed, duplicate, failed-refresh, archival, and reactivation fixtures/tests.
- [ ] Add restart/reconstruction test.
- [ ] Perform UX acceptance against S1.

## R1-2 — Refine and prioritize
Implementation subtasks:
- [ ] Implement Scrum overlay persistence for story points and backlog rank.
- [ ] Implement story-point domain validation: null/unestimated, 0 valid, whole non-negative only.
- [ ] Implement estimate API and persisted-state response.
- [ ] Implement backlog ranking/reordering algorithm with deterministic persistence.
- [ ] Implement reorder API.
- [ ] Add dnd-kit backlog interaction following S1 affordances.
- [ ] Add estimate interaction following S1 design.
- [ ] Prove source refresh cannot overwrite estimate/rank.
- [ ] Add drag/drop, validation, source-integrity, persistence, and reload tests.
- [ ] Perform UX acceptance.

## R1-3 — Plan sprint
Implementation subtasks:
- [ ] Implement sprint and board-column configuration validation/loading.
- [ ] Implement last-known-good configuration acceptance.
- [ ] Enforce exactly one configured origin column.
- [ ] Implement sprint read API.
- [ ] Implement sprint assignment application service and API.
- [ ] On initial sprint assignment, atomically set origin board state and append `null -> origin` transition.
- [ ] On sprint removal, append `column -> null` and clear board state.
- [ ] On Sprint A -> B, append A departure and B origin-entry events in one transaction.
- [ ] Persist sprint context on all transition rows.
- [ ] Build sprint-planning UI following S1 design.
- [ ] Surface zero/multiple-origin config as unusable rather than guessing.
- [ ] Add alternate-origin-name test proving no hard-coded `TODO` behavior.
- [ ] Add change/removal/reassignment/restart tests.
- [ ] Perform UX acceptance.

## R1-4 — Coordinate active sprint
Implementation subtasks:
- [ ] Implement team-member configuration validation/loading with last-known-good behavior.
- [ ] Implement team-assignment use case/API.
- [ ] Implement sprint-board query joining source and overlay state.
- [ ] Exclude archived work from active board queries.
- [ ] Implement assignee filtering by `teamAssignee`, not source assignee.
- [ ] Implement board movement use case/API with target-column validation.
- [ ] Atomically update current column and append transition.
- [ ] Treat same-column move as no-op with no duplicate event.
- [ ] Store UTC transition timestamps and convert only for UI display.
- [ ] Build configured-column board using dnd-kit and S1 interactions.
- [ ] Build explicit source-assignee vs team-assignee presentation.
- [ ] Detect removed sprint/team/column references and expose orphaned state without remapping.
- [ ] Build clear correction-required orphaned-state UI.
- [ ] Ensure failed mutations reconcile/rollback visible state.
- [ ] Add history read capability needed for verification/detail.
- [ ] Add removed-config, archived-filter, move, history, persistence, and negative UI tests.
- [ ] Perform representative-load UX acceptance.

## R1-5 — Demonstrate concept
Implementation subtasks:
- [ ] Build one deterministic release-demo fixture set with representative Jira/ServiceNow/Nova work.
- [ ] Include at least one item suitable for archive/reactivation demonstration.
- [ ] Include configuration variants for origin and orphaned-reference demonstrations.
- [ ] Create scripted acceptance journey matching issue #6 and release exit criteria.
- [ ] Verify fresh startup, normal workflow, restart, and reconstruction.
- [ ] Verify failed source refresh then successful archival refresh then reactivation.
- [ ] Verify configured-origin and sprint-change history semantics.
- [ ] Verify configuration removal surfaces orphaned state without remapping.
- [ ] Verify normal production build uses no required remote services/assets/telemetry.
- [ ] Verify loopback binding and ignored sensitive runtime paths.
- [ ] Exercise representative workload size and resolve obvious interaction/query performance problems.
- [ ] Conduct final visual-quality review against S1.
- [ ] Run stakeholder-ready acceptance rehearsal and capture go/no-go readiness.

## Cross-story engineering rules
- Do not add production features not required by a current story.
- Do not build microservices, Redis, queues, event buses, WebSockets, Elasticsearch, or generalized plugin frameworks for R1.
- Keep source adapters and repositories as deliberate replacement seams; avoid speculative abstraction elsewhere.
- All sensitive runtime data remains local and uncommitted.
- State-changing operations that update current state plus history are transactional.
- Errors are surfaced clearly; prior valid state remains intact after rejected operations.
- No story is Done until mandatory visual/usability ACs and negative-path evidence pass.

## Known assumptions to validate during implementation
1. `(sourceSystem, sourceId)` is stable identity.
2. Each R1 per-source fixture represents the complete team-workload projection for that source, making absence safe to interpret as archival.
3. One local OS user/process is an acceptable trust/concurrency model for R1.
4. Representative backlog/sprint sizes fit comfortably in SQLite + local React without specialized caching.
5. Supplied configuration IDs are intended to be stable identities; display names may change without changing identity.

If an assumption fails materially, reopen refinement rather than hiding the change inside code.

## Definition of implementation-ready
R1 is implementation-ready when:
- product stories and ACs are stable
- architecture/data/domain/config/API/lifecycle contracts are documented
- story subtasks map to mandatory ACs
- test/evidence expectations are documented
- unresolved product decisions are zero
- only environment-specific dependency/runtime selection remains

At present, the remaining environment input is the installed Node.js version.
