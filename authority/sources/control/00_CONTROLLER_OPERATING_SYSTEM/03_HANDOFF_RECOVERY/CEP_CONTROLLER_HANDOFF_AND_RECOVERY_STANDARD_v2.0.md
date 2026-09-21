# CEP CONTROLLER HANDOFF + RECOVERY STANDARD v2.0

## Why v2
The earlier W03 recovery handoff successfully preserved exact W03 sources/gates, but a successor Controller also needs generalized governance state: decisions, lessons, evidence limitations, authority classes, branch truth, and control-debt status.

## Mandatory handoff sections
1. **Classification / what this handoff is NOT**
2. **Exact current baselines** — filenames, hashes, branches/SHAs
3. **Authority graph** — Owner rules, governed accepted sources, proposals, historical evidence
4. **Current lane state** — per writer/reviewer/controller lane
5. **Admitted requirement universes / denominators**
6. **Current Controller decisions** with IDs and rationale
7. **Open gates** with exact closure oracle
8. **Evidence status by class**
9. **Known defects/findings** and whether source/interaction/runtime
10. **Negative requirements / do-not-claim**
11. **Write/effect-domain map** and parallelism safety
12. **Branch/source identity truth** where Production-related
13. **Reusable lessons promoted during the wave**
14. **Control debt** — known observations not yet operationalized
15. **Exact next actions in dependency order**
16. **Cleanup/archive candidates** — no automatic deletion
17. **Manifest/hash receipt** when packaged

## Mandatory recovery behavior
A successor Controller must reconstruct from current files first, not memory. It may use the handoff as a map but must refresh time-sensitive GitHub/Drive/current-state facts when they materially affect the next action.

## Supersession model
Create successor handoff versions; archive predecessors. Do not rewrite historical evidence in place to match the new state.

## Read-budget rule
Use staged retrieval: index/manifest → exact relevant controls → direct sources needed for a decision. Do not reread every historical artifact, but never use context-budget pressure as justification for silently dropping a named unresolved requirement.
