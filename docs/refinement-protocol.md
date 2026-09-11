# Multi Board Release Planning and Refinement Protocol

Use this protocol whenever planning a new release/milestone or materially replanning an existing one. Planning is not complete until the Release Readiness Gate passes and another complete refinement/North Star pass produces no material changes.

If a stakeholder decision is required, stop and surface the decision, alternatives, consequences, and recommendation rather than silently choosing.

## Core rules

- Plan around user and product outcomes, not implementation components.
- Slice vertically. Architecture supports vertical stories; it does not dictate horizontal backlog layers.
- Every material product behavior has one clear story owner.
- Priority is at story level; every acceptance criterion is mandatory for Done and inherits the story priority.
- Stories remain solution- and architecture-agnostic unless a technology itself is a product requirement.
- Quality, security, safety, reliability, usability, and testability belong inside relevant slices.
- Expose assumptions early.
- Sequence work to retire risk and maximize learning, not to construct architecture layers.
- Do not solve future-story problems before they are needed.
- Documentation, intended APIs, architecture diagrams, and planned integrations are not evidence that capabilities exist.
- Refine repeatedly until another rigorous pass produces no material improvement.

## 1. Define the release goal

Define the user/product outcome, why it matters, boundaries, and observable exit condition. Ask: if every proposed story were complete, would the release goal unquestionably be achieved?

## 2. Build the candidate story set

Search the existing backlog first. Pull existing stories that own required behavior and create only genuinely missing behavior. Maintain bidirectional traceability between the release and its stories. Defer work not required for the outcome.

## 3. Refine every story

Apply INVEST. Ensure each story is a meaningful vertical behavior. Acceptance criteria must be sufficient for the story's “so that” and objectively verifiable.

Consider, where relevant:

- correctness
- integrity
- reliability
- usability
- performance
- security
- privacy
- accessibility
- observability
- explainability
- maintainability
- failure handling

Do not hide optional, stretch, or “later” work inside acceptance criteria.

## 4. Analyze story boundaries, overlap, and gaps

Inspect outcomes, behaviors, decisions, state, acceptance criteria, plans, and out-of-scope statements for:

- duplicate ownership
- overlapping stories
- split ownership of one behavior
- nested stories
- missing behaviors
- contradictions
- hidden dependencies
- premature shared capabilities
- wrong abstractions
- horizontal decomposition

Every material behavior should have one clear owner.

## 5. Analyze domain, state, authority, and lifecycle

For each important concept, determine:

- owner of truth
- who may change it
- canonical state versus projection
- current versus historical state
- creation and modification
- correction
- approval when relevant
- cancellation/retirement when relevant
- conflicts
- missing versus intentionally absent data
- source time versus effective time when relevant

External systems must not accidentally become authorities for state Multi Board owns, and Multi Board must not accidentally become authoritative for external work.

## 6. Refine the complete set to convergence

Run a North Star pass over the entire release:

1. Can this improve the release goal?
2. Can technical or feasibility risk be pushed earlier?
3. Can implementation accidentally satisfy code while failing acceptance criteria?
4. Can performance be improved materially?
5. Can quality improve or likely bugs/technical debt be reduced?
6. Are there unmitigated or unaccepted risks?
7. Are any stories horizontal slices?
8. Does every behavior have one owner with no gaps?
9. Are we solving a future problem too early?
10. Is every acceptance criterion necessary at the story's priority?

Repeat until there are no material changes or a stakeholder decision is required.

## 7. First architecture impact pass

Identify required architectural decisions, contracts, persistence, integrations, data flows, security/privacy implications, quality attributes, and standards.

Do not automatically create architecture stories. The first relevant vertical story should implement only the minimum architecture needed to prove its behavior.

## 8. Inspect implementation reality

Inspect actual code, schema, persistence, tests, integrations, APIs, configuration, environment, data, permissions, and entitlements. Documented or intended behavior is not implemented behavior.

Commercial, operational, API, and entitlement restrictions must be checked where relevant. Unknowns remain explicit assumptions.

## 9. Identify existing capabilities and gaps

For each needed behavior, distinguish:

- already usable
- extendable
- missing
- uncertain
- should be replaced

Inspect behavior, architecture, data, integrations, testing, tooling, security/privacy, and operations. Avoid speculative infrastructure.

## 10. Analyze failure, temporal behavior, and quality attributes

Consider:

- missing, stale, conflicting, or corrupt data
- unavailable dependencies
- external failures
- partial completion
- retries and duplicates
- interrupted operations
- rejected actions
- superseded state
- degraded operation

For state changes, consider idempotency and recovery. Non-functional analysis is mandatory, not optional polish.

## 11. Create the implementation plan inside each story

Break each story into concrete subtasks that still deliver one end-to-end vertical behavior. Include only what that story needs, such as:

- capability extension
- minimum architecture
- persistence
- integrations
- implementation
- migrations
- tests
- negative-path handling
- observability
- performance checks
- UAT

Every subtask should map to one or more acceptance criteria. No future story should be required to prove the current story works.

Fixtures, test doubles, and contract tests are acceptable when the release composes them into a credible integrated journey.

## 12. Map acceptance criteria to evidence of Done

For each acceptance criterion identify credible evidence such as:

- unit/domain test
- contract test
- integration test
- fixture test
- end-to-end test
- performance measurement
- security evidence
- UAT

Automate critical invariants where feasible.

## 13. Analyze assumptions and risk

Explicitly inspect:

- technical risk
- feasibility risk
- architecture risk
- integration risk
- data risk
- performance risk
- security/privacy risk
- commercial/licensing risk
- external dependency risk

Turn important uncertainty into early validation rather than leaving it implicit.

## 14. Use spikes only when necessary

A spike must answer a specific question. Define:

- uncertainty
- experiment
- evidence
- exit criteria
- resulting decision

## 15. Sequence for risk and learning

Prefer a thin real vertical slice over generalized infrastructure. Test assumptions that could invalidate the product cheaply and early.

## 16. Fresh-context reconstruction

Ask whether the system can reconstruct materially necessary state tomorrow without relying on a browser session, conversation, or developer memory.

Inspect persistence, current state, authority, provenance, lifecycle, version/effective state, and any required history.

## 17. Exercise integrated journeys

Walk normal and negative/degraded journeys across stories. Look for:

- contradictions
- competing sources of truth
- lost state
- duplicate decisions
- missing handoffs
- incompatible semantics
- composition/performance problems

## 18. Final story and subtask refinement

Rerun INVEST, vertical-slice analysis, acceptance-criteria cohesion, overlap/gaps, ownership, solution independence, assumptions, risks, technical debt, testability, priority, dependencies, and premature abstraction analysis.

Then run another complete North Star pass. Repeat until no material improvement remains or a stakeholder decision is needed.

# Release Readiness Gate

Planning is ready only when all of the following are true:

- observable release outcome and exit condition are explicit
- every required outcome is covered
- every story contributes directly to the release goal
- stories satisfy INVEST sufficiently for the work
- stories are vertical
- each material behavior has one clear owner
- there are no accidental overlaps or gaps
- every acceptance criterion is mandatory and at the story's priority
- acceptance criteria are sufficient for the “so that”
- stories are solution/architecture agnostic unless technology itself is a requirement
- state, authority, and lifecycle are understood
- architecture impacts are identified
- actual implementation capabilities have been inspected
- commercial/API/entitlement constraints have been inspected where relevant
- identified capability gaps have implementation plans
- failure and degraded behavior are intentional
- every acceptance criterion has credible evidence
- assumptions are explicit
- risks are mitigated, tested early, or consciously accepted
- spikes have clear questions and exit decisions
- sequence maximizes learning and risk retirement
- persistent state survives fresh context
- the integrated journey is coherent
- subtasks contain no hidden horizontal dependencies
- no critical/high quality, security, safety, or technical-debt concern is silently deferred
- another complete North Star pass produces no material changes

# Definition of Planning Done

Planning is done when the release consists of coherent, independently valuable vertical slices with mandatory, sufficient, prioritized, testable acceptance criteria; implementation reality and gaps are understood; assumptions and risks receive early validation; architecture is pulled by product slices; acceptance criteria map to evidence; the integrated journey is coherent; persistent state is reconstructable; no critical concern is silently deferred; and another rigorous pass produces no material improvement.
