# FOUNDATION INHERITANCE + DEVIATION RULES

Default for an applicable mature shared mechanic: `INHERIT_AND_BIND`.

Allowed dispositions:
- MANDATORY_INHERIT
- INHERIT_AND_BIND
- ADAPT
- SPECIALIZE
- OPTIONAL
- NOT_APPLICABLE
- OWNER_DECISION_REQUIRED

Any `ADAPT`, `SPECIALIZE`, or `NOT_APPLICABLE` for a generally compatible mechanic must state:
1. exact mechanic;
2. domain reason;
3. why the shared implementation cannot satisfy it;
4. what behavior/design remains inherited;
5. tests proving no regression or duplicate owner.

A Writer may not create a parallel pane, command, settings, focus, transient, editor, spatial or operational engine merely for convenience.
