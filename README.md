# Multi Board

Multi Board is a federated Scrum-management proof of concept. It presents work from multiple external systems in one Scrum backlog and sprint board while preserving those source systems as authoritative for the underlying work records.

Release 1 is intentionally local-first: source work is supplied through JSON fixtures, Scrum overlay state is persisted locally, and no live Jira, ServiceNow, or Epic Nova integration is required.

## Release 1

The Release 1 goal, boundaries, lifecycle semantics, acceptance journey, and issue sequence are documented in [docs/release-1.md](docs/release-1.md).

## Architecture and implementation specification

The implementation packet is deliberately split by concern so product behavior, data ownership, persistence, contracts, lifecycle, and evidence remain traceable:

- [Architecture](docs/architecture.md) — system shape, technology choices, security/privacy posture, resilience, testing, and evolution path.
- [Domain and object model](docs/domain-model.md) — source work, Scrum overlay, sprint, team member, board column, transitions, authority, and invariants.
- [Data model](docs/data-model.md) — logical SQLite schema, relationships, indexes, transactions, archival/reactivation, and time semantics.
- [Input and configuration contracts](docs/configuration-contracts.md) — source fixtures, sprints, team members, board columns, validation, and last-known-good behavior.
- [Application and API contracts](docs/application-contracts.md) — source adapters, repositories, application services, HTTP API, error semantics, idempotency, and runtime contract.
- [State and lifecycle model](docs/state-lifecycle.md) — archival, reactivation, sprint entry/exit/change, board transitions, config orphaning, failures, and reconstruction.
- [Implementation plan](docs/implementation-plan.md) — story-by-story execution subtasks and sequencing.
- [AC-to-evidence traceability](docs/testing-traceability.md) — minimum automated/integration/E2E/UX evidence for every story.
- [Decision log](docs/decisions.md) — material Release 1 product and architecture decisions made during refinement.
- [Refinement protocol](docs/refinement-protocol.md) — the release/milestone refinement and readiness process.

## Key Release 1 constraints

- zero mandatory software licensing, subscription, hosting, or service fees
- no local-administrator rights required for the Product Owner to build or run the POC
- no PII or trade-secret source data stored off the local machine by Multi Board
- local-only network exposure for R1
- source systems own source work; Multi Board owns only the Scrum coordination overlay
- source refreshes are independent by source and last-known-good
- missing source items are archived only after a successfully accepted source refresh, hidden from active views, and retained for history
- reappearing source items reactivate under the same identity with prior Scrum/history state preserved
- newly sprint-assigned work enters the board column designated as the origin in configuration
- backlog rank is separate from board workflow state
- removing work from a sprint clears current board state; changing sprints resets board state to the destination origin
- board history includes sprint context and UTC timestamps
- persisted state made invalid by configuration changes is surfaced rather than silently remapped

## GitHub backlog

Release 1 work is tracked in the **Multi Board Release 1** milestone. Issue #7 is the release-level reference, with the design spike and vertical product stories linked from there. Each story contains an implementation-subtask checklist that maps to the documented implementation plan and evidence model.

## Sensitive data

Only synthetic/demo fixture data belongs in this repository. Real source exports, local databases, PII, trade secrets, and local runtime data must stay out of Git and are ignored by repository configuration.

## Remaining environment input

Before the runnable Node/React/SQLite scaffold is locked, confirm the installed Node version:

```powershell
node --version
```

That determines the cleanest SQLite access implementation. It does not change the product, domain, data, or lifecycle design documented above.
