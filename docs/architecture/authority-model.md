# Federated Authority Model

## Core Rule

Multi Board provides one Scrum experience without becoming the authoritative work-management system for every item it displays.

## Jira-native work

Jira remains authoritative for Jira issues and Jira-owned fields. Multi Board should normally retrieve Jira work directly using Forge/Jira APIs in the active user's context. Do not create a local Jira projection merely for display convenience unless a separately justified capability requires it.

Where Jira already has an appropriate native concept, prefer using that concept rather than inventing a parallel Multi Board value. Exact R1 ownership of sprint, estimate, priority, assignment, and workflow/board-column behavior must be explicitly refined.

## External work

ServiceNow, Epic Nova, and future external sources remain authoritative for their records and source-owned attributes, including source identity, description/summary, source assignee, source status, and source URL where available.

Multi Board may persist additional Scrum overlay state needed to make that external work participate in the Jira team's Scrum process. The Forge spike proved independent persistence of a normalized Multi Board board column for external work.

A source status and a Multi Board board column are deliberately different concepts. For example, an external task can remain `Open` in its source while being `Ready` in the team's Multi Board Scrum workflow.

## Normalized Board Item

The application may normalize heterogeneous work into a common view model for rendering and Scrum operations. That normalization does not transfer ownership of the underlying record.

A conceptual board item may contain:
- stable source-qualified key;
- source type/system;
- source record ID;
- summary/description projection;
- source status;
- source assignee;
- source URL;
- source-owned/native metadata as needed;
- Multi Board-owned Scrum overlay metadata where applicable.

Keep source-owned and Multi Board-owned fields distinct in code and persistence.

## Authorization Invariant

**If the active user cannot see a source item in the authoritative system, they must not be able to see it through Multi Board.**

For Jira, current-user Forge/Jira requests preserve Jira permission enforcement. For external systems, prefer delegated active-user credentials/access where feasible. Treat the authorized visible source set as a prerequisite to joining Multi Board overlay data. Fail closed on authorization uncertainty or source-access failure.

Do not copy broad source ACLs into Multi Board as a substitute for authoritative authorization.

## Persistence

Jira-native work does not require a replicated Multi Board work-item record merely to appear in the board.

External source projections should remain separable from Multi Board Scrum overlay persistence. Forge KVS has been proven for R1 overlay persistence, but production schemas, history, indexes, retention, and concurrency behavior should be designed from story requirements rather than copied blindly from the spike.

Board-column history was an original product requirement and should remain append-only/timestamped unless R1 refinement explicitly changes it.

## Failure Isolation

One source failure should not unnecessarily erase usable work from other sources. The F3 spike demonstrated the basic principle by continuing to render synthetic external work if Jira retrieval failed. Production behavior, stale-data signaling, and error states must be refined per integration and must not weaken authorization guarantees.
