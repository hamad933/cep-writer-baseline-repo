# CEP-VIS-001-FINAL — CEP Final Visual & Interaction Contract

**Project:** Cybersecurity Education Platform — CEP  
**Route:** `PERSONAL:CEP`  
**Mode:** `FINAL VISUAL CONTRACT CONSOLIDATION`  
**Workstream:** `CEP-VIS-001-FINAL`  
**Parent:** `CEP-VIS-001`  
**Gate:** `CEP-VIS-001-G01 — CLOSED — APPROVED`  
**Architecture Authority:** `CEP v0.3.1` + `CEP-PRD-001-A01 — APPROVED` + `CEP-PRD-001-A02 — APPROVED` + `CEP-PRD-001-A03 — APPROVED`  
**Status:** `APPROVED — OWNER APPROVED`  
**Approval Authority:** `Owner — CEP-DEC-027`  
**Approved:** `2026-08-14`  
**Implementation Authorization:** `NONE`

---

## 1. Contract Purpose

هذا العقد يجمّد **القواعد البصرية والتفاعلية المشتركة** التي أثبتتها موجات `CEP-VIS-001`، ويحوّلها إلى عقد تنفيذي موحّد صالح لاحقًا لتوجيه التنفيذ الحقيقي دون نسخ الشاشات حرفيًا.

العقد لا يعتمد تفاصيل مولد الصور، ولا يعتبر أخطاء الحروف أو اتجاه النص داخل الصور مرجعًا تنفيذيًا. المرجع هو **الهيكل، الملكية، التدرج، السلوك، وحدود المجالات**.

القانون الأعلى:

```text
ONE INFORMATION ITEM
→ ONE AUTHORITATIVE DISPLAY LOCATION
```

وقانون الملكية:

```text
CANONICAL OWNER
≠
WORKSPACE SURFACE
≠
CONTEXT OF CREATION
```

وقانون التنقل:

```text
GLOBAL DESTINATION
→ PRIMARY AREA
→ ACTIVE OBJECT / TASK
→ CONTEXTUAL TOOL
```

---

# 2. Global CEP Visual Grammar

## 2.1 Global Destinations

تُستخدم الوجهات الخمس فقط:

```text
اليوم
المعرفة والتعلّم
المحاكاة والمؤسسات
التقدم والأدلة
النظام والعمليات
```

`Today` هو سطح orchestration/command، أما الوجهات الأربع الأخرى فهي Workspaces عالية القيمة.

لا يجوز إعادة إنشاء `Learning Map` أو `Knowledge Studio` أو `System Utilities` كوجهات عالمية مستقلة.

---

## 2.2 Global Shell

الغلاف العام يجب أن يكون:

- داكنًا، مهنيًا، عالي الكثافة دون ازدحام.
- Arabic-first.
- ثابتًا عبر المجالات.
- لا يتحول إلى dashboard chrome يطغى على العمل.
- يعرض وجهة واحدة نشطة بوضوح.
- يحتفظ بسياق العودة عند الانتقال بين المجالات.

المظهر يجب أن يوحي بأداة مهنية mature، لا بمنتج ألعاب، ولا بلوحة SOC افتراضية في كل سياق، ولا بواجهة consumer settings.

---

# 3. Workspace Composition Contract

البنية الحاكمة في كل Workspace:

```text
TOP
=
tools + modes/views + current workflow actions

LEFT
=
structure / tree / navigation only

CENTER
=
actual primary work surface

RIGHT
=
unique contextual information only

BOTTOM
=
temporary deep workspace
closed by default
```

## 3.1 TOP

يمتلك:

- workflow actions الحالية؛
- mode/view switching عند انطباقه؛
- actions العالمية داخل الـactive object؛
- `More (...)` للأوامر الثانوية.

لا يكرر navigation بنيوي موجود في LEFT.

لا يكرر أزرارًا موجودة أصلًا في CENTER أوRIGHT.

---

## 3.2 LEFT

يمتلك:

- tree؛
- structural hierarchy؛
- queue/category navigation؛
- saved-view navigation؛
- primary object structure.

لا يتحول إلى mini-dashboard.

لا يعرض:

- ملخصات object detail؛
- KPI cards؛
- duplicate status؛
- duplicated source/evidence facts؛
- contextual explanation.

---

## 3.3 CENTER

هو السطح المسيطر بصريًا ووظيفيًا.

يمتلك:

- الشيء أوالمهمة الأساسية؛
- الحقيقة التشغيلية أوالتحريرية الأساسية؛
- record/work surface؛
- causal workflow؛
- structured inspection/editing؛
- governed decisions عندما تكون هي مهمة CENTER.

يجب أن يبقى أكبر وأوضح منطقة في الشاشة.

---

## 3.4 RIGHT

يمتلك فقط المعلومات **السياقية الفريدة** بالنسبة للاختيار الحالي.

أمثلة:

- provenance warning؛
- reviewer authority؛
- criterion authority؛
- impact؛
- dependencies؛
- policy rationale؛
- conflict context؛
- recommended interpretation.

لا يكرر:

- active object identity؛
- source IDs؛
- Evidence Claim؛
- status الموجود في CENTER؛
- list of artifacts؛
- actions الموجودة في TOP.

---

## 3.5 BOTTOM

هو:

```text
temporary workspace
```

ومغلق افتراضيًا.

يستخدم فقط لعمل عميق مؤقت مثل:

- raw provenance؛
- logs؛
- diagnostics؛
- comparison؛
- artifact inspection؛
- trace؛
- revision diff؛
- temporary console.

عند إغلاقه لا يعرض أدواته الداخلية كصف دائم.

---

# 4. Navigation & Context Contract

## 4.1 Primary Tab

يغير Major Area داخل نفس Workspace.

أمثلة:

```text
Knowledge & Learning
→ Library / Learn / Visualize / Research & Quality
```

```text
Simulation & Enterprise
→ Enterprise / Scenarios / Labs / Runs / Results
```

```text
Progress & Evidence
→ Evidence / Reviews / Mastery / Portfolio
```

---

## 4.2 Side Panel

معلومات داعمة دون فقد الـactive object.

يجب ألا يصبح نسخة مصغرة من CENTER.

---

## 4.3 Drawer

لعمل قصير ومركز، مثل إعداد/تأكيد/اختيار محدود.

لا يستخدم كمساحة عمل دائمة.

---

## 4.4 Context Menu / Object Menu

لأوامر سريعة خاصة بالشيء.

لا يستبدل Workflow رئيسيًا يحتاج reasoning أوtraceability.

---

## 4.5 Contextual Task Tab

لعمل عميق مؤقت مثل:

- Compare؛
- Review؛
- source inspection؛
- focused preparation.

---

## 4.6 Split View

يستخدم عندما تكون المقارنة أوالعمل المتوازي نفسه هو المهمة.

لا يستخدم لمجرد زيادة المعلومات.

---

## 4.7 Global Transition

يحدث فقط عندما يتغير **domain of work materially**.

أمثلة:

```text
Inspect Lab from Learn
→ stay contextual in Knowledge & Learning
```

```text
Prepare / Start Run
→ transition to Simulation & Enterprise
```

```text
Inspect Evidence summary
→ may stay contextual
```

```text
Formal Evidence Review
→ transition to Progress & Evidence
```

---

## 4.8 Back Navigation

يجب حفظ قدر الإمكان:

- active object؛
- active section؛
- scroll position؛
- selected node؛
- active task/contextual state.

---

# 5. Knowledge & Learning Contract

Primary Areas بالضبط:

```text
Library
Learn
Visualize
Research & Quality
```

## 5.1 Library

المرجع الأقوى هو Golden Structural Reference المقبول.

القواعد:

- compact hierarchy في LEFT؛
- canonical object في CENTER؛
- document-dominant working surface؛
- تحرير canonical object in-context عندما يكون editable؛
- progressive disclosure؛
- explicit Save/Apply حيث يلزم؛
- context lens واحد فعّال في الوقت نفسه؛
- لا نسخ بين Library وLearn.

---

## 5.2 Learn

يعرض نفس canonical learning objects في سياق journey/progress.

يحظر:

```text
Learn object copy
≠ Library object
```

Progress هنا journey/activity context وليس Mastery truth.

Practice / Assessment / Lab يمكن معاينتها contextually دون نقل canonical ownership.

---

## 5.3 Visualize

القواعد:

```text
MAP
=
saved visualization scope/world

VIEW
=
representation

OVERLAY
=
analytical layer
```

Views المعتمدة:

```text
Tree
Path
Graph
Canvas
```

Graph/Canvas لا ينشئان object store جديدًا.

تحريك عنصر بصريًا لا يغير canonical containment بصمت.

---

## 5.4 Research & Quality

يمتلك:

- source comparison؛
- provenance inspection؛
- claim/conflict analysis؛
- reconciliation؛
- knowledge-quality review.

القانون:

```text
Research & Quality Review
≠ Evidence Review
```

System processing لا يقرر knowledge truth.

---

# 6. Simulation & Enterprise Contract

Primary Areas بالضبط:

```text
Enterprise
Scenarios
Labs
Runs
Results
```

`Operations` ليست Primary Area؛ هي mode داخل active Run.

`Replay / AAR / Compare` قدرات داخل Results.

---

## 6.1 Enterprise / Digital Twin

القواعد البصرية:

- LEFT = Enterprise/Twin structure؛
- CENTER = topology/operational model؛
- RIGHT = unique selected-object context؛
- no duplicate object details؛
- Enterprise-backed وSimulation-local يجب أن يكون الفرق بينهما واضحًا.

المعنى الحاكم:

```text
Digital Twin
=
interactive simulated operational model
of an Enterprise environment
```

---

## 6.2 Scenario Studio

Scenario ≠ Lab.

CENTER يركز على orchestration/timeline/flow.

LEFT يملك phase/structure names.

CENTER لا يعيد كتابة نفس phase names في بطاقات موازية عندما يكفي numbering/flow.

Actions مثل Add Phase لها Home واحد.

---

## 6.3 Lab Definition Studio

LEFT يملك Lab structure فقط.

CENTER يملك task graph / definition work.

RIGHT يملك unique properties.

لا تعرض environment summary دائمًا إن كانت مجرد تكرار.

---

## 6.4 Active Run / Operations

القانون البصري:

```text
machine/runtime truth
≠
analytical interpretation
```

CENTER يملك runtime/machine facts.

RIGHT يملك interpretation فقط.

Operations لا تتحول إلى console-dashboard عام.

Run lifecycle:

```text
PREPARING
→ READY
→ RUNNING ↔ PAUSED
→ COMPLETED / STOPPED / FAILED
```

وهو منفصل عن Result Outcome.

---

## 6.5 Results / Replay

CENTER يملك sealed historical replay facts.

RIGHT يملك analytical interpretation.

Result:

```text
Result ≠ Evidence
```

Candidate Evidence Handoff يبقى action/handoff boundary، ولا يحول Results إلى Evidence Workspace.

---

# 7. Progress & Evidence Contract

Primary Areas بالضبط:

```text
Evidence
Reviews
Mastery
Portfolio
```

لا توجد Primary Area باسم `Progress`.

---

## 7.1 Evidence Intake / Candidate Evidence

القوانين:

```text
Candidate Evidence ≠ Evidence
Admission ≠ Review
Admission ≠ Acceptance
Admission ≠ Mastery
```

المسار:

```text
Candidate Evidence
→ ADMITTED
→ Evidence Revision 1
→ SEALED CANONICAL EVIDENCE
→ REVIEW-ELIGIBLE
```

قبل Admission لا تعرض Evidence dimensions مثل:

```text
ACTIVE
UNREVIEWED
NONE
```

Candidate state لها Home واحد.

Source Handoff يظهر كـreferences، لا كنسخة ثانية من Run Result.

---

## 7.2 Evidence State Dimensions

ثلاثة أبعاد مستقلة:

### Evidence Lifecycle

```text
ACTIVE
WITHDRAWN
SUPERSEDED
```

### Review Status

```text
UNREVIEWED
IN_REVIEW
REVIEWED
```

### Effective Review Decision

```text
NONE
ACCEPT
ACCEPT_WITH_LIMITATIONS
MORE_EVIDENCE_REQUIRED
REJECT
```

يحظر collapsed label غامض مثل `Status: Accepted` إذا كان يخفي هذه الأبعاد.

---

## 7.3 Formal Evidence Review

القوانين:

```text
Evidence facts
≠
Review Findings
≠
Review Decision
```

Workflow:

```text
Evidence
→ Review Request
→ Reviewer Assignment
→ Evidence Review
→ Findings
→ Review Decision
→ Closed
```

Review workflow state منفصل عن Evidence Review Status.

Finding vocabulary:

```text
SATISFIED
PARTIALLY_SATISFIED
NOT_SATISFIED
NOT_ASSESSABLE
```

Decision vocabulary:

```text
ACCEPT
ACCEPT_WITH_LIMITATIONS
MORE_EVIDENCE_REQUIRED
REJECT
```

`Issue Decision` يستخدم progressive disclosure، وليس أربعة أزرار دائمة.

Reviewer identity لها Home واحد.

---

## 7.4 Mastery

Default canonical Mastery Target:

```text
Capability
```

القانون:

```text
Progress ≠ Mastery
Completion ≠ Mastery
Decision ≠ Mastery
```

Mastery لها بعدان منفصلان:

### Mastery Judgment

```text
NOT_EVALUATED
INSUFFICIENT_EVIDENCE
INCONCLUSIVE
NOT_MASTERED
MASTERED
```

### Freshness Status

```text
CURRENT
REVALIDATION_REQUIRED
```

حالة صحيحة:

```text
MASTERED
+
REVALIDATION_REQUIRED
```

ولا تعني فقد Mastery التاريخية.

CENTER يثبت causal trace:

```text
Mastery Policy
→ Required Criteria
→ Effective Review Decisions
→ Supporting Evidence
→ Evaluation Basis
```

لا تستخدم:

- course completion؛
- XP؛
- streak؛
- score wall؛
- gaming badges؛
- mastery percentage كبديل للحكم.

---

## 7.5 Portfolio

القانون:

```text
Portfolio
=
workspace surface

Portfolio View
=
saved projection
```

ويحظر:

```text
Portfolio
=
second Evidence repository
```

```text
Remove from Portfolio View
≠
Delete Evidence
```

Portfolio يجوز أن يعرض:

- Evidence references؛
- Accepted Evidence projection؛
- Mastery projection؛
- saved filters/grouping/order؛
- curation annotations؛
- export/presentation configuration.

إضافة Evidence إلى Portfolio تعني **reference existing canonical Evidence**، لا upload/intake جديد.

---

# 8. System & Operations Contract

الحد المعماري:

```text
System & Operations
=
technical ingestion
validation
extraction
processing
staging
Manual AI Bridge
backup / restore
health
audit
release
configuration
```

مقابل:

```text
Research & Quality
=
knowledge/source/claim quality judgment
```

Technical processing لا ينشر knowledge truth بصمت.

---

## 8.1 Operating Workspace Grammar

LEFT:

- operational structure فقط.

CENTER:

- technical state/work؛
- selected component details؛
- failure details؛
- block state؛
- remediation guidance.

RIGHT:

- impact؛
- dependencies؛
- validation context؛
- configuration scope.

BOTTOM:

- diagnostics/logs/traces فقط؛
- closed by default.

TOP:

- executable operational actions فقط.

---

## 8.2 Bounded V1 Truth

لا يجوز أن توحي الواجهة بأن V1 يعتمد على:

- Docker؛
- Kubernetes؛
- VMware؛
- VM orchestration؛
- cloud providers؛
- remote ranges؛
- real SIEM/AD integration.

أي real runtime integration مستقبلية:

```text
FUTURE OPTIONAL EXTENSION
```

---

# 9. Action Ownership Contract

لكل action class Home متوقع واحد:

| Action Type | Canonical UI Home |
|---|---|
| current workflow action | TOP |
| quick object-specific command | Context Menu / `...` |
| short focused action | Drawer |
| deep temporary workflow | Contextual Task Tab |
| deep inspection / raw detail | BOTTOM temporary workspace |
| parallel comparison | Split View |
| material domain change | Global Transition |

يحظر عرض نفس action دائمًا في TOP وCENTER وRIGHT معًا.

---

# 10. Information Ownership Matrix

| Region | Owns | May Reference | Must Never Become |
|---|---|---|---|
| Global Shell | global destination, user/global controls | current workspace identity | duplicate object summary |
| TOP | current tools/actions/modes | active task | structural tree or duplicate action strip |
| LEFT | structure/navigation | counts only when operationally essential and non-duplicative | dashboard, object-detail panel |
| CENTER | primary object/work/truth | source references, criterion references | summary-only dashboard |
| RIGHT | unique context/interpretation/authority/impact | CENTER identity implicitly | second object-detail panel |
| BOTTOM | temporary deep work | active object/task | permanent information shelf |

---

# 11. Semantic State Separation Rules

هذه الفواصل إلزامية بصريًا ونصيًا:

```text
Candidate State
≠
Evidence Lifecycle
```

```text
Evidence Review Status
≠
Review Workflow State
```

```text
Finding
≠
Review Decision
```

```text
Review Decision
≠
Mastery Judgment
```

```text
Mastery Judgment
≠
Freshness Status
```

```text
Operational State
≠
Operational Impact
```

```text
Run Lifecycle
≠
Result Outcome
```

```text
Runtime Fact
≠
Analytical Interpretation
```

---

# 12. RTL / LTR Production Contract

أخطاء النصوص داخل صور التوليد ليست جزءًا من العقد.

التطبيق الحقيقي يجب أن يفرض:

- Arabic-first shell؛
- `dir="rtl"` على الأسطح العربية المناسبة؛
- English identifiers وIDs في spans LTR مستقلة؛
- عدم قلب IDs أوtimestamps؛
- مسافات صريحة بين العربية والمصطلحات الإنجليزية؛
- منع التصاق الكلمات العربية بالمصطلحات الإنجليزية؛
- canonical UI strings من مصدر تطبيق واحد؛
- عدم الاعتماد على نصوص مرسومة داخل images؛
- مراجعة الجداول والحقول والchips والأزرار وليس body text فقط؛
- punctuation وparentheses وslashes مستقرة في mixed-direction content.

Rendering artifacts في mock images لا تغير architecture، لكنها يجب ألا تظهر في التطبيق الحقيقي.

---

# 13. Responsive / Implementation-Neutral Rules

هذا العقد لا يحدد mobile layout.

أي responsive adaptation يجب أن يحافظ على:

- primary-work dominance؛
- one authoritative information location؛
- semantic separations؛
- action ownership؛
- canonical ownership؛
- progressive disclosure.

عند ضيق العرض يمكن collapse/move surfaces، لكن لا يجوز إنشاء نسخ دائمة جديدة من نفس الحقيقة.

---

# 14. Explicit Anti-Patterns

يحظر في CEP:

- `card wall` عندما تكون المهمة document/workspace-driven؛
- LEFT mini-dashboard؛
- duplicated summary panels؛
- breadcrumb يعيد global + primary + left hierarchy بلا حاجة؛
- object title مكرر في CENTER وRIGHT؛
- same status في أكثر من permanent region؛
- duplicate source IDs/provenance facts؛
- permanent open diagnostics drawer؛
- multiple homes for same action؛
- generic KPI dashboard كبديل لعمل مهني؛
- consumer settings layout لـSystem & Operations؛
- universal SOC-dashboard styling؛
- gamified Mastery؛
- Completion/percentage presented as Mastery؛
- `Accepted` كـcollapsed universal status يخفي lifecycle/review/decision؛
- Portfolio كـEvidence store؛
- Results كـEvidence Review workspace؛
- Research & Quality كـEvidence Review؛
- technical processing كـknowledge judgment.

---

# 15. Validated Domain Pattern Index

## Owner-approved visual authority

- `CEP_VIS_001_W03_LIBRARY_KU_GOLDEN_STRUCTURAL_REFERENCE_v1.0.png`
  - Classification: `OWNER-APPROVED VISUAL GRAMMAR AUTHORITY`
  - Governs: global dark identity, Library/KU structural grammar, hierarchy, context behavior, progressive disclosure.

## Controller-validated — Reference Only

- `Enterprise Cybersecurity Topology Dashboard.png`
  - Enterprise / Digital Twin.

- `Cybersecurity Scenario Timeline Dashboard(1).png`
  - Scenario Studio.

- `Cybersecurity Lab Task Graph Dashboard(2).png`
  - Lab Definition Studio.

- `image-gen-1(20260813-230627).png`
  - Active Scenario Run / Operations.

- `Cybersecurity Replay Dashboard Timeline.png`
  - Results / Replay.

- `Cybersecurity Evidence Dashboard in Arabic(1).png`
  - Evidence Intake / Candidate Evidence.

- `Cybersecurity Evidence Review Dashboard.png`
  - Formal Evidence Review.

- `Arabic Cybersecurity Mastery Dashboard.png`
  - Mastery.

- `Cybersecurity Portfolio Evidence Dashboard.png`
  - Portfolio.

- `Arabic Operational Health Dashboard.png`
  - System & Operations / Health.

كل عناصر هذه الفئة:

```text
REFERENCE_ONLY
```

حتى يوافق المالك صراحة على Final Visual Contract أوعلى الصور نفسها.

---

# 16. Implementation Handoff Requirements

قبل أي تنفيذ repository يجب أن يستلم Executor:

1. exact approved architecture authority؛
2. هذا Visual Contract بعد اعتماده فقط؛
3. minimum applicable visual reference(s)؛
4. repository governance reading order؛
5. exact scope and prohibitions؛
6. required responsive/accessibility/RTL acceptance criteria؛
7. test/evidence requirements؛
8. Stop Gate.

لا يجوز للExecutor:

- تغيير canonical ownership؛
- توسيع scope؛
- استخدام mock values كproduct truth؛
- تحويل reference image إلى hardcoded screenshot clone؛
- اختراع backend/runtime authority من visual mock؛
- تحديث canonical Drive state؛
- self-approve implementation.

---

# 17. Final Gate Checklist

| Criterion | Controller Status |
|---|---|
| Five global destinations fixed | PASS |
| Knowledge & Learning four-area model preserved | PASS |
| Global workspace law fixed | PASS |
| Zero-duplication law fixed | PASS |
| Context/action ownership fixed | PASS |
| Simulation & Enterprise five-area model preserved | PASS |
| Operations-as-Run-mode preserved | PASS |
| Result/Evidence boundary preserved | PASS |
| Progress & Evidence four-area model preserved | PASS |
| Candidate/Evidence/Review/Decision/Mastery separation preserved | PASS |
| Mastery Judgment/Freshness separation preserved | PASS |
| Portfolio projection semantics preserved | PASS |
| System & Operations / Research & Quality boundary preserved | PASS |
| RTL/LTR production requirements defined | PASS |
| Image rendering artifacts excluded from implementation truth | PASS |
| No implementation authorization introduced | PASS |
| Owner Final Visual Contract approval | PASS — `CEP-DEC-027` |

---

# 18. Controller Verdict

```text
CEP-VIS-001-FINAL

CONTROLLER VERDICT:
PASS

FINAL VISUAL CONTRACT:
OWNER_APPROVED

MATERIAL ARCHITECTURE DEFECTS:
NONE FOUND

ADDITIONAL IMAGE WAVES REQUIRED:
NONE

OWNER APPROVAL:
APPROVED — CEP-DEC-027

IMPLEMENTATION AUTHORIZATION:
NONE
```

---

# 19. Approval Effect and Closed Gate

```text
CEP-VIS-001-G01
CLOSED — APPROVED

OWNER DECISION:
CEP-DEC-027

ACCEPTED VISUAL / INTERACTION CONTRACT:
CEP-VIS-001-FINAL

NEXT LIFECYCLE STAGE:
Legacy Reuse Assessment and Technical Readiness

IMPLEMENTATION AUTHORIZATION:
NONE
```

This approval freezes the Visual / Interaction Contract as the authority for legacy-reuse assessment and later implementation planning. It does not authorize repository mutation, implementation, migration, merge, release, or deployment.
