# R1 Product North Star

## Goal

**Multi Board extends Jira into a unified Scrum workspace containing native Jira work and externally owned work, without recreating external work as Jira issues.**

The user outcome is one coherent place in Jira where a Scrum team can understand, refine, plan, and work its complete workload even when some authoritative work lives outside Jira.

## Product Principles

### One Scrum experience, multiple authorities
A board item represents work participating in the team's Scrum process. It does not imply that the work is stored by Multi Board or exists as a Jira issue.

Jira owns Jira work. External systems own external work. Multi Board owns only the cross-system Scrum metadata it genuinely needs for external work.

### Jira-native where Jira is already authoritative
Do not replicate Jira merely to make it visible to Multi Board. Prefer Jira APIs and Jira-native concepts/capabilities where appropriate.

### External work remains external
ServiceNow/Nova work should be projected into the experience rather than recreated as Jira issues. Users must be able to distinguish source-owned state from Multi Board's normalized Scrum state.

### Native Jira experience
R1 must look and feel like Jira. A Jira user should perceive Multi Board as an extension of Jira, not a separate application embedded in it. Atlassian/Jira visual and interaction conventions are the R1 visual authority.

### Professional demo quality
Visual/usability quality is part of every delivered workflow. R1 must be cohesive and executive-demo-ready; polish is not a cleanup phase after functional completion.

### Preserve source authorization
Multi Board must not become a route around source-system permissions. If the active user cannot see an authoritative source item, Multi Board must not reveal it.

## Representative R1 Outcomes

The R1 experience should support a representative team workflow across federated work:
- understand the team's complete workload;
- refine and prioritize it;
- plan a sprint;
- work an active sprint/day-to-day Scrum flow; and
- demonstrate that Jira-native and externally owned work participate coherently without changing their systems of record.

The precise story/AC set must be re-refined after the Forge pivot before broad implementation.

## Proven Architecture

The Forge feasibility spike proved:
1. Multi Board Custom UI can run in Jira through Forge.
2. Native Jira issues can be read directly in the current Jira user's context without replication.
3. Jira and independently owned external work can be normalized into one experience.
4. Multi Board-owned Scrum overlay state for external work can persist independently in Forge KVS while source-owned state remains unchanged.

See `docs/architecture/forge-spike.md` and `docs/architecture/authority-model.md`.

## Explicit Non-goals / Guardrails

For R1, do not default to:
- recreating external work as Jira issues;
- building a Jira projection database merely to display Jira;
- continuing the old standalone Fastify/SQLite runtime as the assumed production architecture;
- visually porting the old MUI application unchanged into Jira;
- broad source-data replication as an authorization strategy.

## Decisions Still Requiring Product Refinement

Before R1 is implementation-ready, explicitly resolve:
- final Jira/Forge application surface/navigation;
- authority for sprint, story points, priority, team assignment, and board column for Jira-native versus external work;
- how the original zero-required-fee constraint should be restated under Forge consumption pricing;
- the first real ServiceNow integration/authentication slice;
- what can be claimed for Nova only after its supported API/auth path is established.
