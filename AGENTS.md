# Multi Board — Engineering Handoff

Read this file before making changes. It is the durable handoff between product/architecture work and CLI coding sessions.

## Product North Star

**Multi Board extends Jira into a unified Scrum workspace containing native Jira work and externally owned work, without recreating external work as Jira issues.**

A board item is a view of work participating in the team's Scrum process; it is not necessarily a Multi Board record or Jira issue.

Authority boundaries:
- Jira remains authoritative for Jira work. Prefer Jira-native capabilities and data directly rather than replicating Jira issues into Multi Board storage.
- ServiceNow, Epic Nova, and future external systems remain authoritative for their source work and source status.
- Multi Board owns only the additional cross-system Scrum state required for external work to participate in the team's Scrum process.
- Source-owned fields and Multi Board-owned overlay fields must remain conceptually and technically separate.

## R1 UX Requirement

R1 must match Jira's current look and feel. A Jira user should perceive Multi Board as an extension of Jira, not as a foreign web application embedded inside Jira.

Use Atlassian/Jira visual language and interaction conventions wherever practical: typography, spacing, density, navigation, buttons, forms, status presentation, issue-key treatment, tables, loading/empty/error states, dialogs, and accessibility behavior. Prefer Atlassian Design System patterns/tokens and Forge-compatible approaches over carrying forward MUI styling.

The pre-Forge polished UI remains useful as an interaction/functional reference, but it is not the R1 visual authority. Multi Board may be opinionated where federated work requires behavior Jira does not provide; matching Jira does not mean blindly copying every Jira backlog behavior.

## Forge Feasibility Spike — COMPLETE

All four architectural proofs passed in a Jira sandbox.

### F1 — Forge-hosted Custom UI: PASS
A Vite/React Custom UI builds, deploys, installs, and renders inside Jira through Forge.

### F2 — Native Jira work without replication: PASS
The Custom UI uses `requestJira` from `@forge/bridge` to retrieve and render native Jira issues in the current user's Jira context. No Jira issue replication into Multi Board storage is required. The spike used a bounded JQL query because the Jira search endpoint rejected unbounded JQL.

### F3 — Federated Jira + external work: PASS
Live Jira issues and synthetic ServiceNow/Nova records were normalized into one board-item-shaped application view. This demonstrated a common experience without creating Jira issues for external work. Early source-failure isolation was also demonstrated: external synthetic work can still render if Jira retrieval fails.

### F4 — External Scrum overlay persistence: PASS
Forge KVS persists Multi Board-owned Scrum state for external work. The proof changed a synthetic ServiceNow item's Multi Board board column from Backlog to Ready while its source status remained Open; after a full browser refresh, the Multi Board column remained Ready. This proves independent authority and persistence of the external Scrum overlay.

Current F4 resolver operations are `getBoardColumns` and `saveBoardColumn`; valid normalized columns are `BACKLOG`, `TO_DO`, `READY`, and `DONE`. KVS keys are based on the external work-item key.

## Current Forge Spike

The spike was scaffolded accidentally inside a nested `Multi-Board/` directory beneath the real repository. Treat that structure as temporary. Preserve the working Forge configuration and the F1–F4 capabilities, but integrate Forge cleanly into the existing repository before broad R1 feature implementation.

Known app/environment identifiers from the spike:
- Forge app ID: `ari:cloud:ecosystem::app/a16c5d86-064b-4e66-afb7-b1c0b86bd9a7`
- Development environment ID: `0051b737-3124-4882-b2c7-69506ecd4605`
- Staging environment ID: `950fa1e9-42c0-4e16-afa5-43933c073f79`
- Production environment ID: `6d272216-3667-4cd9-89b0-9e9949f13754`

Current spike technology:
- Forge Custom UI
- React/Vite frontend
- Forge resolver backend
- `@forge/bridge` for Jira calls/resolver invocation
- `@forge/kvs` for app-owned persistence
- Node.js 24 Forge runtime

Known Forge scopes:
- `read:jira-work`
- `storage:app`

The current spike module is `jira:fullPage`. This was sufficient for feasibility but is not a final navigation decision. It does not provide the desired Apps-navigation discoverability, and it has a known deprecation path. Before treating the surface as production architecture, deliberately evaluate the appropriate current Jira/Forge module (including Jira global-page/global full-page options) and escalate a material product/architecture tradeoff rather than silently choosing one.

## Architecture Direction After the Spike

The pre-Forge standalone architecture (Node/Fastify/SQLite/local-only runtime) is no longer the assumed R1 architecture. Do not continue building it by default.

In particular:
- Do not build a Jira projection/LKG database merely to display Jira work.
- Do not recreate external ServiceNow/Nova work as Jira issues.
- Do not treat the JSON adapter from the old POC as production persistence.
- Do not automatically migrate the old MUI styling into Forge.
- Do preserve useful domain logic, interaction design, acceptance criteria, tests, and product learning from the pre-Forge work where they remain valid.

Expected conceptual flow:

`Jira native work + external source projections -> Forge-hosted Multi Board experience`

Jira data should normally be fetched in the active Jira user's context so Jira permissions continue to apply. Future external adapters should preserve source authorization boundaries; delegated active-user access is preferred where feasible.

Security invariant for future integrations: if the active user cannot see a source item in its authoritative system, they must not gain visibility to it through Multi Board. Fail closed. Do not solve authorization by replicating broad source ACLs into Multi Board.

## External Integrations

ServiceNow is the next likely real integration spike. Expected concerns include Forge external egress configuration, OAuth/provider support, ServiceNow client registration/scopes, and preserving user-level source authorization.

Epic Nova remains the larger unknown. Establish its supported API, authentication model, authorization semantics, and Forge/network compatibility before designing around it. Do not assume Forge can access Nova simply because Forge supports external remotes/OAuth.

## R1 Product Model From Pre-Forge Work

The external-work Scrum overlay includes these concepts unless R1 re-refinement changes them:
- Story Point Estimate
- Sprint
- Backlog priority
- normalized Board Column
- Board Column history with timestamps
- team assignment/assignee overlay where appropriate

Original configurable normalized board columns were Backlog, To Do, Ready, Done. Two-week sprints were assumed.

Source records conceptually expose source-system URL, source name/type, source ID, source assignee, description/summary, and source status as source-owned data.

Important: authority for sprint, estimate, assignee, and related fields may differ between Jira-native and external work. Re-refine this explicitly rather than applying one storage model to both.

## R1 Quality Bar

R1 is a professional, cohesive, executive-demo-ready product experience. Visual/usability quality is acceptance criteria, not deferred polish. If the presenter needs to apologize for how rough it looks, the POC has failed.

Representative R1 workflows should cover understanding the team's complete workload, refinement/prioritization, sprint planning, active sprint/day-to-day work, and demonstrating the concept end-to-end.

## Planning / Product Governance

The existing GitHub R1 backlog was created largely before the Forge pivot. **Do not blindly implement old R1 issues as if their architectural assumptions are still current.** Rebaseline/refine R1 stories and acceptance criteria against the Forge North Star first.

Planning principles:
- Outcomes, not components.
- Prefer vertical slices.
- One story owns each behavior.
- Priority belongs at story level.
- All acceptance criteria are mandatory.
- Keep AC solution-agnostic unless something is genuinely a technical requirement.
- Quality/security are built in.
- Validate risky assumptions early.
- Sequence for risk and learning.
- Documentation is not evidence that behavior works.
- Stop and escalate material stakeholder/product decisions instead of silently selecting an answer.
- Refinement is complete only after a Release Readiness/North Star pass produces no material changes.

## Security, Privacy, and Repository Hygiene

Never commit:
- API tokens, passwords, OAuth secrets, or credentials
- private organizational exports/fixtures
- real Jira/ServiceNow/Nova data used for local analysis
- sensitive runtime data

The earlier local work used private organizational Jira, ServiceNow, and Nova fixtures. Those are not public test fixtures and must remain outside the public repository. Use synthetic fixtures in committed tests/demos.

A prior local PowerShell Jira analytics script contained a hard-coded Jira API token and organizational email. Never copy that credential into source, docs, prompts, examples, tests, or Forge configuration. Treat exposed credentials as requiring rotation outside this repository.

Before production use with organizational data, review Forge analytics/log sharing and privacy configuration deliberately.

## Known Technical Debt / Follow-ups

- The Forge scaffold is nested under `Multi-Board/`; integrate it cleanly into the repository.
- The generated Forge frontend was stale CRA/React and was replaced during the spike with Vite/React. Preserve the working Vite approach unless a better Jira-native approach is deliberately selected.
- Root Forge dependency installation reported npm audit findings during the spike. Do not run `npm audit fix` blindly. Run `npm audit`, determine runtime vs development/transitive exposure, and assess/fix deliberately before production viability is claimed.
- Decide the final Forge/Jira navigation module deliberately.
- Revisit the old absolute zero-required-fee constraint because Forge now uses consumption-based pricing/free allowances; this is a product constraint decision, not an engineering assumption.
- Revisit exact Jira-native vs external authority for sprint, story points, team assignee, priority, and board column during R1 refinement.

## Immediate Engineering Handoff

Before broad R1 implementation:
1. Inspect the repository and the nested Forge spike; preserve the proven F1–F4 behavior.
2. Establish a clean repository structure for Forge without losing useful pre-Forge assets.
3. Ensure synthetic-only committed data and credential hygiene.
4. Establish repeatable local build/lint/test commands for the integrated repository.
5. Do not silently choose unresolved product decisions listed above.
6. Use the rebaselined GitHub R1 backlog as the implementation contract once Product declares it ready.

When starting a CLI session, a useful instruction is:

> Read AGENTS.md and the project documentation it references. Inspect the repository before changing it. Preserve the F1–F4 Forge proofs. Do not implement stale pre-Forge R1 architectural assumptions. Identify the highest-priority implementation-ready R1 story, or report the blocking product decision if the backlog has not yet been rebaselined.
