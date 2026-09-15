# Forge Feasibility Spike

Status: **COMPLETE — F1 through F4 passed**

The spike answered whether the Multi Board product model can be implemented as a Jira-hosted Forge application before rebaselining R1 around Forge.

## F1 — Forge-hosted Custom UI

**PASS**

A Vite/React Custom UI was built, deployed, installed, and rendered successfully inside the Jira sandbox through Forge.

The generated Custom UI template used an obsolete CRA dependency combination, so the spike replaced the generated frontend setup with Vite/React while retaining Forge's expected built-resource path.

## F2 — Native Jira work without replication

**PASS**

The frontend used `requestJira` from `@forge/bridge` to query Jira and render live Jira issues. The request executes in the current Jira user's context, allowing Jira to remain authoritative and enforce Jira permissions.

The Jira search endpoint rejected unbounded JQL, so the proof used a bounded query. This is an API/query-design consideration, not evidence that Jira data needs replication.

Conclusion: Multi Board does not need to import Jira issues into a Multi Board work-item store merely to show Jira-native work.

## F3 — Federated Jira + external work

**PASS**

Live Jira issues plus synthetic ServiceNow and Epic Nova items were normalized into one common application view with source identity, source ID, summary, source status, and assignee.

No ServiceNow/Nova Jira issues were created. The proof therefore demonstrated that independently owned work can participate in the same application experience as native Jira work without duplication into Jira.

The spike also provided an early source-failure-isolation behavior: synthetic external items remained renderable if the Jira API request failed.

## F4 — Forge persistence of external Scrum overlay

**PASS**

The resolver used `@forge/kvs` with `storage:app` and exposed two operations to Custom UI through Forge bridge invocation:
- `getBoardColumns`
- `saveBoardColumn`

The proof used normalized board columns:
- `BACKLOG`
- `TO_DO`
- `READY`
- `DONE`

A synthetic ServiceNow item whose source status was `Open` was changed in Multi Board from Backlog to Ready. After the write completed and the browser was fully refreshed:
- source status was still `Open`;
- Multi Board board column was still `Ready`.

This demonstrates that Forge can persist Multi Board-owned Scrum overlay state independently of source-owned work state.

## Spike Configuration Snapshot

Forge app ID:
`ari:cloud:ecosystem::app/a16c5d86-064b-4e66-afb7-b1c0b86bd9a7`

Environment IDs:
- development: `0051b737-3124-4882-b2c7-69506ecd4605`
- staging: `950fa1e9-42c0-4e16-afa5-43933c073f79`
- production: `6d272216-3667-4cd9-89b0-9e9949f13754`

Known scopes:
- `read:jira-work`
- `storage:app`

Runtime during spike:
- `nodejs24.x`
- 256 MB
- arm64

The spike currently uses `jira:fullPage` and a `main` Custom UI resource. This module choice is not considered final architecture; navigation/discoverability and Atlassian's deprecation path must be evaluated deliberately for R1.

## Repository State

The Forge scaffold was created accidentally at `Multi-Board/` beneath the existing `multi-board` repository. It is a working feasibility implementation, not the desired long-term repository structure.

Do not discard it until its working manifest, frontend, resolver, package dependencies, and F1–F4 behavior have been integrated into the main repository. Do not commit private organizational data while performing that integration.

## Resulting Decision

The spike removed the primary feasibility risk behind a Forge-hosted R1. The standalone Fastify/SQLite architecture should no longer be treated as the default R1 architecture.

Before broad feature implementation, rebaseline the R1 backlog around the new product North Star and authority model, then integrate the spike cleanly and implement against the rebaselined stories.
