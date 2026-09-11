# Release 1 Input and Configuration Contracts

## Principles
All R1 external/configuration input is validated before acceptance. Validation is all-or-nothing per source or configuration set. A rejected candidate never partially replaces last-known-good state.

All committed examples are synthetic.

## Source work input
R1 uses one logical source adapter per source system. Files may be separated by source so refresh failure and archival are source-scoped.

Example:

```json
[
  {
    "sourceSystem": "JIRA",
    "sourceId": "ABC-123",
    "sourceUrl": "https://example.invalid/browse/ABC-123",
    "name": "Upgrade authentication service",
    "assignee": "Jane Smith",
    "description": "Representative synthetic description",
    "sourceVersion": "42"
  }
]
```

Required:
- `sourceSystem`: one of the source systems supported by the adapter invocation
- `sourceId`: non-empty string
- `sourceUrl`: absolute `http` or `https` URL
- `name`: non-empty string

Optional/nullable:
- `assignee`
- `description`
- `sourceVersion`

Validation:
- duplicate `(sourceSystem, sourceId)` in a candidate source projection invalidates the entire refresh
- an item supplied under a source-specific adapter must declare that same source system
- unknown properties may be rejected in R1 to catch fixture mistakes early
- source text is data, never trusted HTML
- URLs are displayed/navigated only; Multi Board does not fetch them

## Sprint configuration

```json
[
  {
    "id": "2026-19",
    "name": "Sprint 2026-19",
    "startsOn": "2026-09-07",
    "endsOn": "2026-09-20"
  }
]
```

Rules:
- `id` and `name` required and non-empty
- IDs unique
- dates optional ISO `YYYY-MM-DD`
- if both dates exist, `endsOn >= startsOn`
- R1 does not infer an active sprint from dates; sprint selection is explicit in the UI

## Team identity configuration

```json
{
  "id": "demo-team",
  "displayName": "Demo Scrum Team"
}
```

Rules:
- `id` and `displayName` are required and non-empty
- the display name is presentation/configuration data and must not be hard-coded into the UI
- the team identity is distinct from the list of assignable team members
- committed examples must use synthetic/generic team identity values
- the S1 design-validation fixture may optionally include this object as a top-level `team` property; when omitted, the committed synthetic demo team is used

## Team-member configuration

```json
[
  { "id": "alex", "displayName": "Alex Morgan" },
  { "id": "sam", "displayName": "Sam Rivera" }
]
```

Rules:
- ID and display name required
- IDs unique
- no relationship is inferred between source assignee text and team member identity

## Board-column configuration

```json
[
  { "id": "TODO", "name": "To Do", "order": 10, "origin": true },
  { "id": "READY", "name": "Ready", "order": 20, "origin": false },
  { "id": "DONE", "name": "Done", "order": 30, "origin": false }
]
```

Rules:
- ID and name required
- IDs unique
- `order` must be an integer and unique within the set
- exactly one usable column has `origin=true`
- origin behavior never depends on a reserved ID or display name
- zero or multiple origins rejects the candidate configuration

## Last-known-good configuration behavior
For each configuration type:
1. read candidate
2. parse JSON
3. validate complete set
4. if invalid, record failure summary and keep previous accepted configuration
5. if valid, atomically replace the accepted configuration set
6. do not rewrite persisted Scrum state to fit the new configuration
7. references to removed values become orphaned/invalid and are surfaced to the user

## Missing files / first run
Recommended R1 behavior:
- if no accepted state exists and a required source/config fixture is missing or invalid, startup succeeds into a clear unusable/degraded state rather than fabricating defaults
- communicate which input is invalid/missing
- do not silently create production-looking example work in the user's real runtime
- the repository's demo/development command may point explicitly at committed synthetic fixtures

## File placement
Recommended repository layout:

```text
fixtures/
  demo/
    jira.json
    servicenow.json
    nova.json
    sprints.json
    team.json
    team-members.json
    board-columns.json
fixtures/private/        # ignored
config/local/            # ignored
.local-data/             # ignored
```

The exact CLI/env mechanism for choosing files may be finalized during implementation, but it must not require admin rights or external services.
