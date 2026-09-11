# Release 1 Data Model

## Goals
The Release 1 database must reconstruct the active Scrum workspace after restart, preserve source/overlay ownership boundaries, retain append-only board history, support source archival/reactivation, and reject invalid configuration without destructive side effects.

SQLite is the R1 persistence implementation. Exact DDL may change slightly during coding, but the logical model and invariants in this document are implementation requirements unless refinement is reopened.

## Tables

### `source_system_state`
Tracks independently accepted source projections.

| Column | Type | Notes |
| --- | --- | --- |
| `source_system` | TEXT PK | `JIRA`, `SERVICENOW`, `NOVA` |
| `last_successful_refresh_at` | TEXT NULL | UTC ISO-8601 instant |
| `last_attempt_at` | TEXT NULL | UTC ISO-8601 instant |
| `last_attempt_status` | TEXT | success/failure |
| `last_error_summary` | TEXT NULL | operational summary only; no sensitive payload |

### `source_work_item`
Last accepted projection plus lifecycle state.

| Column | Type | Notes |
| --- | --- | --- |
| `work_item_key` | TEXT PK | `${source_system}:${source_id}` |
| `source_system` | TEXT NOT NULL | indexed |
| `source_id` | TEXT NOT NULL | unique with source_system |
| `source_url` | TEXT NOT NULL | validated URL, never auto-fetched |
| `name` | TEXT NOT NULL | source-owned |
| `source_assignee` | TEXT NULL | source-owned |
| `description` | TEXT NULL | source-owned |
| `source_version` | TEXT NULL | optional adapter metadata |
| `last_seen_at` | TEXT NOT NULL | UTC instant |
| `archived` | INTEGER NOT NULL | 0/1, derived local marker |
| `archived_at` | TEXT NULL | UTC instant when absent from accepted refresh |

Constraints:
- unique `(source_system, source_id)`
- archived item remains stored
- reappearance resets `archived=0`, clears `archived_at`, updates source-owned fields

### `scrum_overlay`
One row per work item when any local Scrum state exists.

| Column | Type | Notes |
| --- | --- | --- |
| `work_item_key` | TEXT PK/FK | references source_work_item |
| `story_points` | INTEGER NULL | >= 0 |
| `sprint_id` | TEXT NULL | intentionally not hard-deleted when config changes |
| `backlog_rank` | TEXT NULL | sortable rank token |
| `team_assignee_id` | TEXT NULL | local team assignment |
| `board_column_id` | TEXT NULL | must be NULL when sprint_id is NULL |
| `updated_at` | TEXT NOT NULL | UTC instant |

Important design choice: sprint/team/column references are not modeled with destructive foreign-key cascades to configuration tables. Configuration may validly change while historical/current state becomes orphaned; Multi Board must preserve and surface that state rather than silently erase or remap it.

### `sprint`
Last accepted sprint configuration.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT PK | stable config identity |
| `name` | TEXT NOT NULL | display name |
| `starts_on` | TEXT NULL | ISO local date |
| `ends_on` | TEXT NULL | ISO local date |

### `team_member`
Last accepted team-member configuration.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT PK | stable config identity |
| `display_name` | TEXT NOT NULL | display label |

### `board_column`
Last accepted board configuration.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT PK | stable config identity |
| `name` | TEXT NOT NULL | display label |
| `display_order` | INTEGER NOT NULL | unique ordering |
| `is_origin` | INTEGER NOT NULL | exactly one row = 1 |

### `board_transition`
Append-only event history.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT PK | application-generated immutable id |
| `work_item_key` | TEXT NOT NULL | federated work identity |
| `sprint_id` | TEXT NOT NULL | sprint context at transition time |
| `from_column_id` | TEXT NULL | null = outside board context |
| `to_column_id` | TEXT NULL | null = leaving board context |
| `changed_at` | TEXT NOT NULL | UTC instant |

No updates/deletes are expected in normal R1 behavior.

### `configuration_state`
Tracks the last accepted configuration set.

| Column | Type | Notes |
| --- | --- | --- |
| `config_type` | TEXT PK | sprints/team-members/board-columns |
| `last_accepted_at` | TEXT NULL | UTC instant |
| `last_attempt_at` | TEXT NULL | UTC instant |
| `last_attempt_status` | TEXT | success/failure |
| `last_error_summary` | TEXT NULL | no raw sensitive payload |

## Transactions

### Successful source refresh for one source system
One transaction:
1. upsert all validated records for the source
2. unarchive records that reappear
3. mark previously active records absent from the accepted set archived
4. update source-system refresh state
5. commit

If any database operation fails, rollback the entire source refresh.

### Sprint assignment
One transaction:
- determine current sprint/column state
- update `scrum_overlay`
- append required `board_transition` rows
- commit

New sprint assignment: `null -> origin`.
Sprint removal: `column -> null`.
Sprint A -> Sprint B: append departure event in A, then entry event in B, and persist B/origin as current state in the same transaction.

### Board movement
One transaction:
- validate target column against accepted configuration
- update `scrum_overlay.board_column_id`
- append one transition row
- commit

### Configuration acceptance
Candidate config is fully parsed/validated before replacement. A valid accepted set replaces the corresponding config table atomically. Existing Scrum references are not rewritten. A rejected candidate leaves the last accepted config untouched.

## Indexes
Recommended R1 indexes:

```text
source_work_item(source_system, source_id) UNIQUE
source_work_item(source_system, archived)
scrum_overlay(sprint_id)
scrum_overlay(team_assignee_id)
scrum_overlay(board_column_id)
scrum_overlay(backlog_rank)
board_transition(work_item_key, changed_at)
board_transition(sprint_id, changed_at)
```

## Time semantics
All event/operational timestamps are UTC instants. UI converts them to the user's local display timezone. Sprint start/end dates, when supplied, are local calendar dates rather than instants.

## Deletion policy
R1 does not physically delete source items merely because they disappear from a refresh. Archive instead. R1 also does not automatically delete Scrum overlay or board history when a source item archives.

## Database location
Runtime SQLite files live only in ignored local-data paths and are never committed to Git. Tests use disposable databases. Synthetic fixtures may be committed.
