# Multi Board

Multi Board is a federated Scrum-management layer for teams whose work originates in multiple systems. The source systems remain authoritative for the underlying work; Multi Board adds the Scrum state needed to manage that work as one backlog and sprint.

## Release 1

Release 1 is a local-only proof of concept. A Scrum team should be able to run a representative two-week sprint containing mixed Jira, ServiceNow, and Epic Nova work without recreating those source items in another work-management system.

The Release 1 backlog is tracked in the **Multi Board Release 1** milestone. The planned sequence is:

1. #1 — S1: Validate the interaction and visual design
2. #2 — R1-1: Understand the team's complete workload
3. #3 — R1-2: Refine and prioritize upcoming work
4. #4 — R1-3: Plan a sprint from the unified backlog
5. #5 — R1-4: Coordinate the team's active sprint work
6. #6 — R1-5: Demonstrate the federated Scrum concept

Issue #7 is the release-level reference.

## Architecture direction

Release 1 is a local-first TypeScript modular monolith:

- React + Material UI for the browser UI
- Node.js + Fastify for the local application server
- SQLite for local persistence
- Zod at external-data boundaries
- dnd-kit for backlog and board drag/drop
- Vitest and Playwright for automated evidence
- JSON as the Release 1 source-adapter input, not as the application's working database

The application is intended to bind only to `127.0.0.1` in Release 1 and require no cloud services.

See [docs/architecture.md](docs/architecture.md) for the architecture and security constraints and [docs/release-1.md](docs/release-1.md) for the release definition.

## Data ownership

Source-owned and read-only in Release 1:

- source system
- source URL
- source ID
- name
- source assignee
- description

Multi Board-owned Scrum overlay:

- story-point estimate
- sprint assignment
- backlog order
- team assignee
- board column
- board-column transition history

`sourceAssignee` and `teamAssignee` are intentionally different concepts.

## Security and cost constraints

Release 1 must be buildable, testable, run, and demonstrated with zero required software licensing, subscription, hosting, or service fees. Sensitive source data, PII, trade secrets, local databases, and real source exports must never be committed to this repository.

The repository should contain only code, documentation, and synthetic test/demo fixtures.

## Local setup

Detailed one-time setup instructions will be finalized after confirming the installed Node.js version. No local-administrator rights should be required by the Multi Board development workflow.
