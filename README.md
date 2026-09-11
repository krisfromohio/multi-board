# Multi Board

Multi Board is a federated Scrum-management proof of concept. It presents work from multiple external systems in one Scrum backlog and sprint board while preserving those source systems as authoritative for the underlying work records.

Release 1 is intentionally local-first: source work is supplied through JSON fixtures, Scrum overlay state is persisted locally, and no live Jira, ServiceNow, or Epic Nova integration is required.

## Release 1

The Release 1 goal, boundaries, lifecycle semantics, acceptance journey, and issue sequence are documented in [docs/release-1.md](docs/release-1.md).

## Architecture

The converged Release 1 architecture is documented in [docs/architecture.md](docs/architecture.md).

Key constraints include:

- zero mandatory software licensing, subscription, hosting, or service fees
- no local-administrator rights required for the Product Owner to build or run the POC
- no PII or trade-secret source data stored off the local machine by Multi Board
- local-only network exposure for R1
- source systems own source work; Multi Board owns only the Scrum coordination overlay
- missing source items are archived only after a successfully accepted source refresh, hidden from active views, and retained for history
- newly sprint-assigned work enters the board column designated as the origin in configuration
- persisted state made invalid by configuration changes is surfaced rather than silently remapped

## Planning and refinement

The release/milestone refinement protocol is documented in [docs/refinement-protocol.md](docs/refinement-protocol.md).

## GitHub backlog

Release 1 work is tracked in the **Multi Board Release 1** milestone. Issue #7 is the release-level reference, with the design spike and vertical product stories linked from there.

## Sensitive data

Only synthetic/demo fixture data belongs in this repository. Real source exports, local databases, PII, trade secrets, and local runtime data must stay out of Git and are ignored by repository configuration.
