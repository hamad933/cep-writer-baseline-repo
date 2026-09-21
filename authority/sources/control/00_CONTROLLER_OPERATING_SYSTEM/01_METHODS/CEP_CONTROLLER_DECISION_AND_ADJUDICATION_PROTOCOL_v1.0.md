# CEP CONTROLLER DECISION + ADJUDICATION PROTOCOL v1.0

## 1. Trigger
Open a Controller decision whenever a Writer would otherwise have to guess:
- semantic meaning;
- canonical vs presentation ownership;
- state/command owner;
- persistent schema/data contract;
- provider/runtime boundary;
- Production file/component/symbol;
- shared core vs domain adapter;
- write scope/collision boundary;
- whether a high-value proposal mechanic is admitted/superseded/N/A.

## 2. Required decision record
Each decision includes:
`DECISION_ID`, question, source basis, competing alternatives, selected option, rationale, affected requirements/surfaces, exact owner(s), negative requirements, tests/evidence, unresolved follow-ups, supersession relation.

## 3. Decision classes
- `OWNER_DIRECT`
- `CONTROLLER_NORMALIZATION`
- `ARCHITECTURE_DESTINATION`
- `SCHEMA_CONTRACT`
- `PROVIDER_BOUNDARY`
- `INTERACTION_GRAMMAR`
- `EVIDENCE_CLASSIFICATION`
- `SCOPE_BOUNDARY`
- `SUPERSESSION`

## 4. Fail-closed rule
If material semantics remain unresolved, block only the affected scope and record the exact question. Do not broaden the block to unrelated work and do not invent a temporary semantic owner.

## 5. No false closure
A decision may close ambiguity without proving implementation. Record separately:
`DECISION_RESOLVED`, `SOURCE_IMPLEMENTED`, `RUNTIME_PROVEN`, `OWNER_ACCEPTED`.
