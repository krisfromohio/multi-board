# Release 1 — Federated Scrum Board POC

## Release goal

A Scrum team can use the POC as its working board to manage a two-week sprint containing work originating from multiple external systems, without recreating those source work items in another work-management system.

The POC demonstrates that a thin Scrum-management layer over federated work is viable.

## Why

Teams have work distributed across Jira, ServiceNow, and Epic Nova. Release 1 tests whether one coherent Scrum-management layer can let a team manage all of its sprint work while preserving source systems as authoritative for the underlying records.

## Primary personas

- Scrum team member
- Product Owner / backlog owner
- Scrum Master / team facilitator
- Head of Agile / investment decision-maker

Release 1 does not require persona-specific permissions or interfaces.

## Authority model

### Source-owned, read-only in Release 1

- source system
- source URL
- source ID
- name
- source assignee
- description
- whether the source item remains present in the latest accepted projection for its source

### Multi Board-owned Scrum overlay

- story-point estimate
- sprint assignment
- backlog priority/order
- team assignee
- board column while sprint-assigned
- board-column change history
- archived marker for source items no longer present in the latest accepted projection for their source

`sourceAssignee` and `teamAssignee` are intentionally distinct. Release 1 team assignment does not imply any source-system change.

## Work-item identity and lifecycle

The stable work-item identity is `(sourceSystem, sourceId)`.

When an item that existed in the previously accepted projection for a source is absent from a later successfully accepted projection for that same source, Multi Board marks that item as archived and no longer displays it in the active backlog or sprint board. Archiving must not silently delete its persisted Scrum overlay or transition history.

A failed or invalid source import does not cause archival, because the new projection was never accepted.

If an archived item later reappears with the same `(sourceSystem, sourceId)`, Multi Board reactivates the existing item and preserves its Scrum overlay and history rather than creating a duplicate or resetting local Scrum state.

## Source refresh isolation

Jira, ServiceNow, and Epic Nova are independent source projections. Each source refresh is validated and accepted independently. A failed refresh for one source preserves that source's last-known-good projection and does not block acceptance of a valid refresh from another source. Archival is scoped only to the source whose refresh succeeds.

## Story-point semantics

Story points are arbitrary non-negative whole numbers. An item may be unestimated. Unestimated is distinct from an explicit estimate of `0`; decimal and negative values are invalid.

## Sprint and board-state lifecycle

Board-column state exists only while work is sprint-assigned.

- Assigning an unsprinted item to a sprint places it in the configured `origin` board column.
- Removing an item from a sprint clears its current board column.
- Moving an item directly from one sprint to another places it in the destination sprint's configured `origin` column instead of carrying workflow state across sprint boundaries.

Board transition history records sprint context as well as work item, previous column, resulting column, and timestamp. Previous or resulting column may be null when entering or leaving sprint context.

## Board origin semantics

Board-column configuration designates exactly one column as the **origin** column. Newly sprint-assigned work enters the configured origin column rather than relying on a hard-coded column name. R1 configuration is invalid if it cannot identify exactly one usable origin column.

## Configuration-change integrity

Sprint, team-member, and board-column definitions are supplied to the POC for R1. If configuration changes leave persisted Scrum state referring to a removed or unknown sprint, team member, or board column, Multi Board preserves the persisted reference and surfaces the state as invalid/orphaned rather than silently remapping it. The state must be corrected before it is treated as normal valid state.

## Release 1 implementation constraints

- Federated source records are represented through JSON source adapters.
- Sprint definitions are supplied to the POC.
- Team-member definitions are supplied to the POC.
- Board-column definitions are supplied to the POC, including exactly one origin designation.
- No live Jira, ServiceNow, or Epic Nova synchronization.
- Multi Board-owned state must survive refresh/restart.
- Accepted source projections and Multi Board-owned state must be reconstructable without browser/session/conversation state.
- Source refresh is validated and accepted atomically per source; failed imports preserve that source's last-known-good projection.
- The application must remain local-only for R1 and require no off-site sensitive-data storage.
- The required software stack must have zero mandatory license, hosting, subscription, or service fees.
- The Product Owner must not need local-administrator rights to build or run the POC.
- Professional visual quality is part of Done, not a later polish phase.

## Observable exit condition

Release 1 succeeds when a representative mixed-source Scrum workflow can be conducted from backlog through daily sprint-board management and demonstrated as credible evidence for a go/no-go investment decision.

The release candidate must demonstrate:

1. Load work representing Jira, ServiceNow, and Epic Nova into one backlog, identify the source, and access the supplied source URL.
2. Prioritize the unified backlog by drag/drop.
3. Assign and change story-point estimates during refinement.
4. Assign work to a configured sprint during sprint planning and place newly assigned work in the configured origin board column.
5. Assign work to a team member within Multi Board.
6. View sprint work on a board using configured columns.
7. Move work between board columns using drag/drop.
8. Filter the board by Multi Board team assignee.
9. Retain Scrum state across refresh/restart.
10. Retain timestamped board-column transition history with sprint context.
11. Distinguish source-owned information from Multi Board-owned Scrum state throughout.
12. Archive and hide an item after a successfully accepted source projection no longer contains it, without losing its persisted Scrum/history state.
13. Reactivate a reappearing archived item without duplicating or resetting its Scrum state.
14. Demonstrate that failure of one source refresh does not corrupt or block valid refreshes from other sources.
15. Surface orphaned/invalid persisted state caused by configuration changes instead of silently remapping it.
16. Demonstrate sprint removal/change semantics, including clearing board state when unsprinted and resetting to destination origin when moved between sprints.
17. Complete the journey through a professional, modern, cohesive interface without requiring an apology for prototype-quality UI.
18. Operate without sending sensitive source/work data to external services.

## Story sequence

- #1 — S1: Validate the interaction and visual design
- #2 — R1-1: Understand the team's complete workload
- #3 — R1-2: Refine and prioritize upcoming work
- #4 — R1-3: Plan a sprint from the unified backlog
- #5 — R1-4: Coordinate the team's active sprint work
- #6 — R1-5: Demonstrate the federated Scrum concept

Recommended sequence: **#1 -> #2 -> #3 -> #4 -> #5 -> #6**.

Issue #7 is the release-level GitHub reference. All Release 1 issues belong to the **Multi Board Release 1** milestone.

## Explicitly out of scope

Release 1 does not require:

- live source-system integration
- source-system write-back
- authentication or authorization
- multiple teams
- configuration-management UI
- sprint creation/editing UI
- source-status mapping
- reporting or flow metrics
- velocity/capacity calculations
- search
- arbitrary filters beyond team assignee
- notifications
- comments
- attachments
- dependencies
- production hosting or scalability
- sophisticated distributed conflict resolution

## Release-quality principle

Visual quality is mandatory within every user-facing vertical slice. If the presenter must say “ignore how rough this looks; focus on the idea,” Release 1 has failed a material objective.

## Product question answered by Release 1

> Is a federated Scrum-management layer sufficiently useful and credible to justify continued investment and live source-system integration?
