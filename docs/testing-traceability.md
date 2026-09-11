# Release 1 AC-to-Evidence Traceability

## Purpose
Every mandatory acceptance criterion must have credible evidence. This matrix defines the minimum evidence expected before a story is Done. Tests may be reorganized during implementation, but coverage intent must remain.

## S1 — Validate interaction and visual design
Evidence:
- high-fidelity representative interactive design
- realistic synthetic mixed-source workload
- usability walkthrough of backlog -> estimate -> prioritize -> sprint -> team assignment -> board -> filter -> move
- degraded-state walkthrough: source refresh failure, orphaned config state
- stakeholder/representative-user UX acceptance

## R1-1 — Understand complete workload
| Behavior | Evidence |
| --- | --- |
| mixed Jira/ServiceNow/Nova backlog | fixture + API/integration + Playwright |
| source/name/id/assignee/description | component/E2E assertions |
| source provenance/link | E2E + URL validation test |
| restart reconstruction | persistence integration + Playwright restart/reload |
| malformed/incomplete source rejection | validation + integration |
| last-known-good preservation | integration |
| accepted-refresh archival | integration + E2E |
| rejected refresh does not archive | integration |
| reappearance restores active state/history | integration |
| demo-quality backlog | UX acceptance |

## R1-2 — Refine and prioritize
| Behavior | Evidence |
| --- | --- |
| estimate assign/change | application + E2E |
| null vs 0; whole non-negative semantics | unit/domain |
| decimal/negative rejection | unit/API/E2E negative |
| drag/drop reorder | Playwright |
| persisted rank/estimate | persistence + reload E2E |
| source fields unchanged | application/integration invariant |
| interaction quality | UX acceptance |

## R1-3 — Plan sprint
| Behavior | Evidence |
| --- | --- |
| supplied sprint list | config/integration + E2E |
| assign/change/remove sprint | application + E2E |
| mixed-source sprint | fixture + E2E |
| new sprint assignment enters configured origin | domain/integration/E2E |
| no hard-coded origin ID/name | config variant test |
| zero/multiple origins rejected | config validation tests |
| sprint removal clears board state/history entry | integration |
| Sprint A -> B creates leave/enter history with sprint context | integration |
| persistence | restart/reload test |
| planning clarity | UX acceptance |

## R1-4 — Coordinate active sprint
| Behavior | Evidence |
| --- | --- |
| sprint board configured columns | integration + E2E |
| team assign/reassign/remove | application + E2E |
| source vs team assignee distinction | E2E/UX |
| filter by team assignee and clear filter | E2E |
| drag between columns | E2E |
| transition append/current-state atomicity | persistence integration |
| transition includes sprint/from/to/UTC timestamp | integration |
| move to same column is no-op/no duplicate event | unit/integration |
| archived work excluded | integration/E2E |
| removed sprint/member/column preserved as orphaned | config integration/E2E |
| no silent remapping | integration |
| failed UI mutation reconciles/rolls back | E2E negative |
| board usability | UX acceptance |

## R1-5 — Demonstrate concept
Evidence is a scripted release-candidate acceptance journey covering:
1. mixed-source workload
2. source identity/link
3. estimate
4. backlog reorder
5. sprint assignment -> configured origin
6. local team assignment
7. board/filter/move
8. reload/restart
9. failed source refresh retains last-known-good
10. successful source refresh archives missing item
11. archived item disappears from active views
12. reappearing item restores prior Scrum/history state
13. config change creates visible orphaned reference rather than remap
14. local-only/no required remote service posture
15. professional visual quality suitable for Head of Agile demo

## Cross-cutting automated invariants
Automate these wherever practical:
- source refresh cannot modify Scrum overlay
- failed refresh cannot archive
- source refreshes isolated by source system
- work identity uniqueness
- unsprinted item has no board column
- exactly one board origin
- sprint/board state plus history committed atomically
- UTC timestamp persistence
- append-only transition history
- archived work excluded from active queries
- reactivation preserves overlay/history
- config replacement last-known-good
- orphaned references preserved
- real/private fixture paths ignored by Git

## Test levels
- **Unit/domain:** deterministic pure rules and validation.
- **Application:** use-case behavior with repository doubles where valuable.
- **SQLite integration:** transactions, persistence, reconstruction, archival, orphaning, history.
- **Contract/config:** JSON parsing and adapter/config validation.
- **Playwright E2E:** real user workflows and visible failure/recovery behavior.
- **UX acceptance:** visual/interaction quality against S1 design.

## Performance evidence
R1 should be exercised with a representative synthetic workload large enough to expose obvious UI/query problems. Recommended acceptance fixture: at least 150 active items across the three sources, at least 50 items in a sprint, and meaningful assignee distribution. No fixed millisecond SLA is required for R1 unless implementation shows a problem; interactions must feel immediate enough for a live executive demo.

## Security/privacy evidence
Before R1 demo:
- verify server binds only to loopback
- verify no required remote requests in normal production build
- verify no telemetry/analytics/remote fonts/CDNs
- verify sensitive fixture/database paths are ignored
- verify descriptions render as text rather than executable HTML
- verify parameterized SQL use
- verify source links require explicit user navigation
