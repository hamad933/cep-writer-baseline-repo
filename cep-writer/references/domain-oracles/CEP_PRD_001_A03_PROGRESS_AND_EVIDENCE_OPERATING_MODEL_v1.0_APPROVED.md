# CEP-PRD-001-A03 — Progress & Evidence Operating Model

**Project:** Cybersecurity Education Platform — CEP
**Route:** `PERSONAL:CEP`
**Mode:** `BOUNDED ARCHITECTURE CORRECTION`
**Workstream:** `CEP-PRD-001-A03`
**Gate:** `CEP-PRD-001-A03-G01 — CLOSED — APPROVED`
**Parent Authority:** `CEP v0.3.1` + `CEP-PRD-001-A01 — APPROVED` + `CEP-PRD-001-A02 — APPROVED`
**Status:** **APPROVED — OWNER APPROVED**
**Owner Decision:** `CEP-DEC-026`
**Approved:** `2026-08-14`
**Approval Basis:** `CEP-PRD-001-A03-R01` after Controller PASS and explicit owner approval.
**Implementation Authorization:** **NONE**

---

# 1. Architecture Summary

`Progress & Evidence` هو الـ Workspace الكنسي المسؤول عن تحويل المخرجات المؤهلة القادمة من مجالات CEP الأخرى إلى:

```
Candidate Evidence
→ Evidence
→ Review
→ Decision
→ Mastery State

```

مع الحفاظ على دورة الحياة الحاكمة كاملة:

```
Definition
→ Attempt / Run
→ Result
→ Candidate Evidence
→ Evidence
→ Review
→ Decision
→ Mastery State

```

وتبقى الحدود التالية ثابتة:

```
Result ≠ Evidence automatically
Completion ≠ Mastery

```

`A01` يثبت هذه الدورة، ويجعل `Accepted Evidence` و`Evidence Review` و`Reviewer Decisions` و`Mastery States` مملوكة لـ `Progress & Evidence`، مع السماح بإسقاطات سياقية خارج مساحة الملكية دون إنشاء نسخ كنسية جديدة.

ويثبت `A02` أن ملكية `Simulation & Enterprise` تنتهي عند حد التسليم:

```
Run Result
→ Candidate Evidence Handoff
→ Progress & Evidence Intake

```

وبعد ذلك يبدأ `Candidate Evidence` الكنسي في `Progress & Evidence`.

قرار `A03-R01` لا يعيد تصميم المعمارية الأساسية التي اجتازت Controller review.

التصحيح محصور في:

- فصل أبعاد حالة Evidence.
- تصحيح معنى Admission.
- منع استخدام Portfolio كسبب لإنشاء Candidate Evidence.
- فصل Evidence جديد مستقل عن Superseding Evidence Revision.
- فصل Mastery Judgment عن Freshness.
- إعادة تصنيف Owner Decisions.
- تحديث Ownership / State Matrix.

---

# 2. Exact Primary Areas

البنية الداخلية تبقى بالضبط:

```
Progress & Evidence
├── Evidence
├── Reviews
├── Mastery
└── Portfolio

```

لا توجد Primary Area خامسة باسم:

```
Progress

```

## 2.1 Evidence

تغطي:

- Evidence Intake
- Candidate Evidence
- governed Evidence
- source provenance
- Evidence revisions
- criterion linkage
- supporting references
- Evidence lifecycle
- review-state projections

## 2.2 Reviews

تغطي:

- Review Requests
- assignment
- formal Evidence Review
- Review Findings
- Review Decisions
- re-review
- decision supersession
- review provenance

## 2.3 Mastery

تغطي:

- Mastery Policy
- Mastery Judgment
- Freshness Status
- evidence contribution
- decision provenance
- conflicts
- revalidation
- Mastery History

## 2.4 Portfolio

هو Workspace للعرض والتنظيم والـ curation فوق الأشياء الكنسية الموجودة.

لا يملك Evidence ثانية.

---

# 3. Ownership Boundary

تظل الحدود التالية دون تغيير:

```
Knowledge & Learning
owns:
learning definitions
learning context
Practice / Assessment definitions
learning-progress context
Project context where applicable

```

```
Simulation & Enterprise
owns:
Lab Definitions
Scenarios
Runs
Run Results
Candidate Evidence Handoff / Submission boundary

```

```
Progress & Evidence
owns:
Candidate Evidence
Evidence
Evidence Review
Review Decision
Mastery State
Portfolio Views

```

والقاعدة:

```
CANONICAL OWNER
≠
WORKSPACE SURFACE
≠
CONTEXT OF CREATION

```

تبقى حاكمة. `A01` يقرر صراحة أن Projection لا تنشئ نسخة صامتة من الشيء الكنسي.

---

# 4. Candidate Evidence Model

## 4.1 Definition

`Candidate Evidence` هو:

> اقتراح كنسي داخل `Progress & Evidence` بأن مجموعة محددة ومتعقبة المصدر من المواد تمثل Evidence Claim متماسكة وقد تكون مؤهلة للتحول إلى Evidence رسمية.

بالتالي:

```
Candidate Evidence ≠ Evidence

```

Candidate Evidence يجب أن يملك:

```
Coherent Evidence Claim
+
Purpose
+
Subject
+
Criterion Scope
OR
Explicitly Governed Evidence Purpose
+
Source Provenance

```

## 4.2 What creates Candidate Evidence?

يمكن أن يبدأ من:

- Run Result handoff.
- Assessment Result.
- qualifying Practice / Activity output.
- Project Output.
- owner-created supporting material.
- imported supporting material.

لكن المصدر لا ينشئ Canonical Candidate Evidence داخل مجاله.

المصدر ينشئ:

```
Handoff / Submission

```

ثم:

```
Progress & Evidence Intake
→ Candidate Evidence

```

## 4.3 Canonical Owner

```
Candidate Evidence
Canonical Owner
=
Progress & Evidence → Evidence

```

## 4.4 Candidate Lifecycle

```
RECEIVED / DRAFT
→ PREPARED
→ SUBMITTED_FOR_INTAKE
→ ADMITTED

or

→ RETURNED_FOR_CONTEXT
→ DECLINED
→ WITHDRAWN

```

`DECLINED` Candidate لا تصبح Evidence.

وبالتالي:

```
Candidate declined at Intake
≠
Evidence rejected by Formal Review

```

## 4.5 Mutability

قبل `ADMITTED` يمكن تعديل Candidate-layer metadata مثل:

- claim formulation
- intended purpose
- criterion references
- material selection
- contextual explanation
- grouping
- submitter notes

لكن لا يمكن تغيير:

- source Result truth
- source Result Revision
- source Attempt / Run
- source Artifact contents
- original producer identity
- source timestamps
- immutable handoff receipt

## 4.6 One Result → Multiple Candidates

يجوز لمصدر واحد إنتاج عدة Candidates عندما تمثل Claims مختلفة فعليًا.

مثال:

```
RUN-0042 Result
├── Candidate A
│   └── claim: investigation capability
│
└── Candidate B
    └── claim: detection-analysis capability

```

لكن لا يجوز إنشاء Candidate أخرى لمجرد:

```
"أريد إظهار هذه المادة في Portfolio"

```

## 4.7 Candidate Creation Law

Portfolio curation ليست Evidence purpose كافية.

يحظر:

```
Result
→ Candidate Evidence
because:
"project portfolio material"

```

المسار الصحيح:

```
Source Output
→ coherent Evidence claim
→ Candidate Evidence
→ Evidence

then, optionally:

Evidence
→ Portfolio View

```

وبالتالي:

```
Portfolio
≠ Evidence intake shortcut

```

## 4.8 Multiple Artifacts

Candidate واحدة قد تشير إلى عدة مواد داعمة، مثل:

```
HTTP transaction
+
alert payload
+
log extract
+
timeline segment
+
observation

```

طالما أنها تخدم Evidence Claim واحدة متماسكة.

## 4.9 Duplicate Candidates

إذا تطابق:

- source revision
- selected material
- subject
- Evidence claim
- criterion scope
- governed purpose

يجب اكتشاف duplicate ومنع إنشاء نسخة صامتة.

أما التداخل الجزئي فيسمح به عندما تختلف Evidence Claim أو Review scope بصورة ذات معنى.

## 4.10 Source Supersession

إذا تم supersede للمصدر قبل Admission:

```
Candidate Evidence
→ SOURCE_SUPERSEDED condition

```

والخيارات:

- update Candidate to reference the superseding source؛
- retain the historical source revision مع justification صريح؛
- withdraw Candidate.

إذا أصبحت المادة Evidence بالفعل، فلا يعاد كتابة تاريخها.

مصدر جديد قد يؤدي إلى:

- Evidence جديدة مستقلة؛ أو
- Superseding Evidence Revision؛ أو
- Re-review trigger

وفق طبيعة التغيير.

---

# 5. Evidence Admission Model

## 5.1 Governing Sequence

يصحح `A03-R01` أي صياغة سابقة من نوع:

```
Candidate
→ Evidence Revision 1
→ SEALED FOR REVIEW

```

المسار الصحيح هو:

```
Candidate Evidence
→ ADMITTED
→ Evidence Revision 1
→ SEALED CANONICAL EVIDENCE
→ REVIEW-ELIGIBLE

```

## 5.2 Meaning of Admission

`ADMITTED` يعني:

> أن Candidate اجتازت Evidence Intake وأصبحت سجل Evidence كنسيًا محكومًا.

Admission لا يعني:

```
Review Request created

```

ولا يعني:

```
Review started

```

ولا يعني:

```
Decision issued

```

ولا يعني:

```
Evidence accepted

```

ولا يعني:

```
Mastery changed

```

## 5.3 Formal Review Start

Formal Review يبدأ فقط عبر:

```
Evidence
→ Review Request
→ Evidence Review

```

بالتالي تكون Evidence حديثة Admission مثلًا:

```
Evidence Lifecycle:
ACTIVE

Review Status:
UNREVIEWED

Effective Review Decision:
NONE

```

---

# 6. Canonical Evidence Model

`Evidence` هو:

> سجل كنسي محكوم ومراجع بالإصدار، يحفظ Evidence Claim محددة ومصدرها وسياقها والمواد الداعمة لها وعلاقتها بالمعايير، ويكون صالحًا للدخول في Formal Review.

Evidence ليست:

- generic file.
- upload.
- screenshot.
- Result.
- Runtime Artifact.
- completion flag.

وتظل القاعدة:

```
Evidence ≠ Artifact

```

متوافقة مع فصل `A02` بين `Runtime Artifact`, `Run Result` و`Evidence`.

## 6.1 Evidence Identity

كل Evidence تمتلك:

- stable Evidence ID
- Evidence Revision
- subject
- Evidence Claim
- owner
- admitted timestamp
- admitted-by provenance

## 6.2 Source Provenance

تشمل:

- source type
- source object ID
- source revision
- Attempt / Run reference where applicable
- Result reference where applicable
- handoff/submission reference
- submitter
- source context
- source timestamps
- integrity references

## 6.3 Relevance

تشمل:

- Review Criterion References
- Capability relevance
- objective relevance where applicable
- governed Evidence purpose

## 6.4 Supporting Material

تشمل References إلى:

- Result records
- assessment outputs
- Project outputs
- artifacts
- observations
- timeline segments
- imported supporting materials

هذه References لا تنقل Canonical ownership للمادة الأصلية.

## 6.5 Integrity

كل Revision تحفظ:

- immutable revision identity
- prior revision reference where applicable
- source pinning
- integrity fingerprint where appropriate
- provenance
- revision reason
- actor
- timestamp

---

# 7. Evidence State Dimensions

هذا القسم يستبدل أي acceptance-state vocabulary مختلطة في `A03`.

هناك **ثلاثة أبعاد مستقلة**.

---

## 7.1 Dimension A — Evidence Lifecycle

```
ACTIVE
WITHDRAWN
SUPERSEDED

```

### ACTIVE

Evidence / Evidence Revision الحالية صالحة للمشاركة في العمليات الحاكمة.

### WITHDRAWN

تم سحب Evidence من الاستخدام المستقبلي وفق سياسة الحوكمة.

السحب:

```
does not delete history

```

ولا يمحو:

- prior Reviews
- prior Decisions
- Mastery History

### SUPERSEDED

Evidence Revision أو Evidence record تم استبداله بسجل أو Revision أحدث مع الحفاظ على التاريخ السابق.

لا يحدث overwrite.

---

# 7.2 Dimension B — Review Status

```
UNREVIEWED
IN_REVIEW
REVIEWED

```

### UNREVIEWED

لا توجد Formal Review فعالة أو مكتملة على الـ scope الجاري.

### IN\_REVIEW

يوجد Review Request / Evidence Review نشط.

هذه الحالة قد تتزامن مع Decision تاريخية ما زالت Effective أثناء Re-review.

مثال مشروع:

```
Lifecycle:
ACTIVE

Review Status:
IN_REVIEW

Effective Review Decision:
ACCEPT

```

وذلك عندما بدأت Re-review جديدة بينما يبقى قرار القبول السابق فعّالًا إلى أن يُستبدل بقرار جديد.

### REVIEWED

اكتملت Formal Review ذات صلة، ولا توجد Review نشطة في ذلك الـ scope.

---

# 7.3 Dimension C — Effective Review Decision

```
NONE
ACCEPT
ACCEPT_WITH_LIMITATIONS
MORE_EVIDENCE_REQUIRED
REJECT

```

هذه القيمة ليست Lifecycle state.

وهي ليست Review workflow state.

إنها Projection للحكم الفعّال الناتج من Review Decision records غير superseded.

## NONE

لا يوجد قرار Review فعّال.

## ACCEPT

Evidence مقبولة ضمن الـ Review scope المحدد.

## ACCEPT\_WITH\_LIMITATIONS

Evidence مقبولة ضمن قيود معلنة.

## MORE\_EVIDENCE\_REQUIRED

Evidence الحالية لا تكفي وحدها لإنهاء الحكم المطلوب.

## REJECT

Evidence غير مقبولة ضمن Review scope المحدد.

---

# 7.4 Scope Sensitivity

عندما تستخدم Evidence في أكثر من Review scope، لا يجوز دمج القرارات المختلفة في Label عالمية مبهمة.

يجب أن يظل Effective Review Decision مرتبطًا بـ:

```
Evidence
+
Applicable Review Scope

```

وبالتالي قد تكون Evidence مقبولة لCriterion محدد وغير كافية لCriterion آخر دون تناقض.

---

# 7.5 Accepted Evidence Projection

لا يوجد Canonical Object جديد باسم:

```
Accepted Evidence Object

```

بل:

```
Accepted Evidence
=
Evidence Projection

```

وتتحقق عندما:

```
Evidence Lifecycle = ACTIVE

```

و:

```
Effective Review Decision
=
ACCEPT
or
ACCEPT_WITH_LIMITATIONS

```

بالنسبة إلى الـ applicable Review scope.

وبصياغة حاكمة:

```
Accepted Evidence
=
Evidence whose effective Review Decision is
ACCEPT
or
ACCEPT_WITH_LIMITATIONS

AND

whose lifecycle is not
WITHDRAWN
or
SUPERSEDED

```

---

# 8. Source / Handoff Model

العقد العام:

```
Authoritative Source Domain
→ Source-owned Handoff / Submission
→ Progress & Evidence Intake
→ Candidate Evidence

```

## 8.1 Common Handoff Contract

كل Handoff مؤهل يجب أن يحفظ:

- source type
- source ID
- source revision
- subject
- selected material references
- submitter
- timestamp
- purpose
- Evidence claim context
- criterion references where available
- integrity metadata
- source workspace identity

---

# 8.2 Run Result

الحد المعتمد في `A02`:

```
Run Result
→ Candidate Evidence Handoff
→ Progress & Evidence Intake
→ Candidate Evidence

```

ويجب أن يحافظ Handoff على:

- source Run Result ID
- Result Revision
- Run ID
- selected Task Outcomes
- selected Observations
- selected Artifacts
- selected events / timeline segments
- submitter
- timestamp
- purpose/context.

Candidate Evidence Handoff لا يعني Evidence acceptance، كما أن Canonical Candidate Evidence يبدأ في `Progress & Evidence`.

---

# 8.3 Assessment Result

العقد:

```
Assessment Result
→ Candidate Evidence Submission
→ P&E Intake

```

ويحمل عند انطباقه:

- Assessment Definition ID + Revision
- Attempt ID
- Assessment Result ID + Revision
- criterion outcomes
- submitted responses/output references
- assessor/system provenance
- subject
- timestamps
- integrity metadata

ولا يحدث:

```
Assessment completed
→ Evidence automatically

```

---

# 8.4 Practice / Activity Output

لا تكون كل Activity output مؤهلة.

يلزم على الأقل:

- identifiable output
- Attempt reference
- provenance
- Evidence claim
- subject
- governed purpose أو criterion scope
- enough context for later review

`Completed` وحدها غير كافية.

---

# 8.5 Project Output

`A01` يسمح للـ Projects بإنتاج Candidate Evidence دون امتلاك نسخة من Evidence نفسها.

المسار:

```
Project Output
→ Candidate Evidence Submission
→ P&E Intake

```

لكن فقط عندما توجد:

```
coherent Evidence claim
+
subject
+
purpose
+
criterion scope
or governed evidence purpose

```

ولا يجوز استخدام:

```
Portfolio display

```

وحده كسبب لإنشاء Candidate.

---

# 8.6 Owner-Created / Imported Supporting Material

يمكن أن يبدأ Intake داخل `Progress & Evidence`.

يجب تسجيل:

- creator/uploader
- stated origin
- source identity where known
- acquisition timestamp
- integrity fingerprint
- context
- purpose
- subject
- assurance/provenance classification
- applicable criterion scope

ولا يسمح لهذا المسار بتجاوز Admission أو Review.

---

# 9. Supplemental Evidence vs Evidence Revision

`MORE_EVIDENCE_REQUIRED` لا يحدد وحده ما إذا كان الناتج:

```
new Evidence

```

أو:

```
new Revision of existing Evidence

```

يجب التمييز بين حالتين.

---

# 9.1 Case A — New Independent Proof

إذا وصلت مادة جديدة لها معنى إثباتي مستقل:

```
New source/output/material
→ New Candidate Evidence
→ ADMITTED
→ New Evidence
→ Evidence Revision 1

```

ثم يمكن لـ Review Request مستقبلية أن تجمع:

```
Evidence A
+
Evidence B
+
Evidence C

```

ضمن Review scope واحدة.

### Example

Evidence A:

```
Run Result demonstrating SQL investigation

```

Evidence B:

```
Independent Assessment demonstrating the same capability

```

وجود B لا يعني:

```
Evidence A Revision 2

```

بل:

```
Evidence B Revision 1

```

---

# 9.2 Case B — Correction / Extension of Same Evidence Record

إذا كان التغيير يصحح أو يمدد **نفس Evidence Claim الكنسية**:

```
Existing Evidence Revision N
→ Candidate / Amendment preparation
→ Admission
→ Superseding Evidence Revision N+1

```

ويجب أن يحفظ Revision N+1:

- previous revision
- correction/extension reason
- changed material
- changed provenance where applicable
- actor
- timestamp

Revision N تبقى محفوظة تاريخيًا.

---

# 9.3 Governing Rule

```
Independent new proof
→ New Evidence object
→ Revision 1

```

```
Correction/material extension of same governed Evidence claim
→ Superseding Evidence Revision

```

يحظر استخدام:

```
Superseding Evidence Revision

```

لمجرد أن Evidence مستقلة أخرى وصلت لاحقًا.

---

# 10. Formal Evidence Review Model

`Evidence Review` هو Workflow حكم رسمي مستقل.

```
Evidence Review
≠ Research & Quality Review

```

و:

```
Evidence Review
≠ After-Action Review

```

`A01` يميز رسميًا بين Knowledge Review الذي يحكم جودة المعرفة والمصادر والClaims، وبين Evidence Review الذي يحكم ما إذا كانت Evidence تحقق Criteria.

كما يثبت `A02`:

```
AAR ≠ Evidence Review

```

ولا ينتج AAR Mastery مباشرة.

---

# 10.1 Formal Flow

```
Evidence
→ Review Request
→ Reviewer Assignment
→ Evidence Review
→ Review Findings
→ Review Decision
→ Review Closed

```

---

# 10.2 Review Request

يحفظ:

- Evidence Revision(s)
- requested Review scope
- Criterion References
- purpose
- requester
- reviewer / reviewer requirements
- due date where applicable
- prior Decision reference for re-review
- provenance

---

# 10.3 Review Workflow States

هذه تخص Review workflow نفسها:

```
REQUESTED
ASSIGNED
IN_REVIEW
READY_FOR_DECISION
CLOSED
CANCELLED

```

ولا يجب خلطها مع:

```
Evidence Review Status

```

ولا مع:

```
Review Decision

```

---

# 10.4 Review Workspace

Formal Review قد يعرض تدريجيًا:

- Evidence under review
- criterion scope
- source provenance
- supporting references
- prior evidence
- Review Findings
- reviewer notes
- decision controls

ولا يعرض كل المعلومات دائمًا.

---

# 11. Criteria Model

`Progress & Evidence` لا ينسخ Criterion definitions.

بل يستخدم:

```
Review Criterion Reference

```

إلى Canonical definitions.

قد تشير إلى:

- Learning Objective
- Capability Requirement
- Assessment Criterion
- Project Criterion
- Mastery Criterion

## 11.1 Criterion Reference

يجب أن تحفظ:

- criterion ID
- canonical owner
- pinned revision
- criterion type
- review scope
- historical display label snapshot

Display snapshot ليست Canonical criterion copy.

---

# 11.2 Review Findings

لكل Criterion يمكن تسجيل Finding مثل:

```
SATISFIED
PARTIALLY_SATISFIED
NOT_SATISFIED
NOT_ASSESSABLE

```

مع:

- rationale
- supporting Evidence references
- limitations
- conflict notes
- provenance concerns

وهذه:

```
Findings ≠ Review Decision

```

---

# 12. Review Decision Model

Review Decision منفصل عن Review working state:

```
Review ≠ Decision

```

## 12.1 Proposed Decision Vocabulary

```
ACCEPT
ACCEPT_WITH_LIMITATIONS
MORE_EVIDENCE_REQUIRED
REJECT

```

هذه Vocabulary **APPROVED — CEP-DEC-026**.

## ACCEPT

Evidence تحقق Review scope المعني.

## ACCEPT\_WITH\_LIMITATIONS

Evidence صالحة ولكن بقيود صريحة.

يجب حفظ:

- accepted criterion scope
- limitation scope
- rationale

## MORE\_EVIDENCE\_REQUIRED

Evidence ذات صلة ولكنها غير كافية للحكم المطلوب.

هذا القرار لا يحدد تلقائيًا نوع المادة اللاحقة.

المادة الإضافية تطبق قواعد Section 9.

## REJECT

Evidence غير مقبولة في Review scope بسبب مثلًا:

- relevance failure
- criterion failure
- provenance failure
- material integrity problem

ولا يعني REJECT حذف Evidence.

---

# 12.2 Decision Integrity

عند الإصدار:

```
Review Decision
→ IMMUTABLE

```

أي correction ينتج:

```
Superseding Review Decision

```

ويحفظ:

- previous Decision
- correction reason
- reviewer
- timestamp
- affected review scope
- provenance

لا يحدث:

```
edit old Decision in place

```

---

# 13. Mastery Model

## 13.1 Definition

`Mastery State` هو:

> سجل كنسي محكوم يعبر عن competency judgment للـ Subject بالنسبة إلى Mastery Target محدد، باستخدام Evidence وReview Decisions فعالة تحت Mastery Policy محددة الإصدار.

لا يشتق Mastery مباشرة من:

- Completion.
- Attempt count.
- Run lifecycle.
- Run Result Outcome.
- Candidate Evidence.
- Artifact.
- Activity percentage.

---

# 13.2 Default Mastery Target Recommendation

تظل التوصية المعمارية:

```
Capability
=
default canonical Mastery Target

```

أما:

```
Knowledge Unit
Objective
Criterion
Project

```

فتبقى افتراضيًا:

```
contribution / context references

```

ولا تصبح Mastery Targets مستقلة تلقائيًا.

هذه التوصية:

```
OD-A03-01

```

وهي **APPROVED — CEP-DEC-026**.

لا يعتمدها `A03-R01` ذاتيًا.

---

# 13.3 Mastery Policy

`Mastery Policy` تعريف Versioned داخل:

```
Progress & Evidence → Mastery

```

وقد يحدد:

- required criteria
- qualifying Review Decisions
- Evidence diversity
- minimum attribution confidence
- conflict handling
- permitted limitations
- recency requirements
- freshness triggers
- revalidation conditions

Published Mastery Policy Revision لا تعدل in-place.

---

# 14. Mastery Dimensions

`A03-R01` يفصل بين:

```
Competency Judgment

```

و:

```
Freshness Status

```

---

# 14.1 Dimension A — Mastery Judgment

الـ proposed vocabulary:

```
NOT_EVALUATED
INSUFFICIENT_EVIDENCE
INCONCLUSIVE
NOT_MASTERED
MASTERED

```

### NOT\_EVALUATED

لم يحدث governed Mastery evaluation بعد.

### INSUFFICIENT\_EVIDENCE

لا توجد Evidence كافية وفق Mastery Policy.

### INCONCLUSIVE

المواد/القرارات الموجودة لا تسمح بحكم حاسم، مثل وجود Evidence متعارضة لم تحسم.

### NOT\_MASTERED

أصبح الحكم الحاكم أن متطلبات Mastery غير محققة.

### MASTERED

استوفت Evidence والقرارات الفعالة شروط Mastery Policy.

هذه Vocabulary:

```
OD-A03-02

```

وهي **APPROVED — CEP-DEC-026**.

---

# 14.2 Dimension B — Freshness Status

```
CURRENT
REVALIDATION_REQUIRED

```

### CURRENT

Mastery judgment ما زالت ضمن شروط freshness الحالية في Mastery Policy.

### REVALIDATION\_REQUIRED

الحكم التاريخي محفوظ، لكن Policy الحالية تتطلب إعادة إثبات أو revalidation.

وبالتالي يجوز:

```
Mastery Judgment:
MASTERED

Freshness Status:
REVALIDATION_REQUIRED

```

ولا يتم تحويل الحكم إلى:

```
REVALIDATION_REQUIRED

```

لأنها ليست Mastery Judgment.

---

# 14.3 Important Semantic Law

```
MASTERED + REVALIDATION_REQUIRED

```

يعني:

> آخر competency judgment الحاكم هو MASTERED، لكن freshness policy تتطلب revalidation.

ولا يعني:

```
Mastery removed

```

إلا إذا نتج لاحقًا Review/Decision جديد يقود إلى Mastery Judgment جديدة.

---

# 14.4 Mastery State Required Provenance

كل Mastery State يجب أن تحفظ:

- subject
- Mastery Target
- Mastery Judgment
- Freshness Status
- Mastery Policy Revision
- applicable criteria
- effective Review Decision references
- Evidence Revision references
- prior Mastery State
- evaluation timestamp
- reason / trigger

---

# 14.5 Multiple Evidence Contribution

عدة Evidence items يمكن أن تسهم في Mastery واحدة:

```
Evidence A
→ Decision A

Evidence B
→ Decision B

Evidence C
→ Decision C

          ↓

Mastery Policy Revision

          ↓

Mastery State

```

---

# 14.6 Conflicting Evidence

لا يستخدم CEP قاعدة:

```
latest wins

```

بصمت.

قد ينتج التعارض:

```
Mastery Judgment:
INCONCLUSIVE

```

أو:

```
new Review / re-review required

```

وفق Mastery Policy.

---

# 14.7 Mastery History

Mastery current state قد يعاد تقييمها.

لكن History لا يعاد كتابتها.

```
New effective Decision
→ evaluate against Mastery Policy
→ create new Mastery State if required
→ supersede prior current Mastery State

```

السجل السابق يبقى immutable.

---

# 15. Progress vs Mastery Boundary

تبقى القاعدة:

```
Progress
=
contextual journey / activity state

```

بينما:

```
Mastery
=
governed competency truth

```

Progress قد يشمل:

- started
- resumed
- attempted
- in progress
- completed
- due
- recently active

Mastery يعتمد على:

- governed Evidence
- effective Review Decisions
- applicable Mastery Policy

لذلك:

```
100% completion
≠ Mastery

```

و:

```
COMPLETED Run
≠ Mastery

```

وهي امتداد مباشر للقاعدة المعتمدة:

```
Completion ≠ Mastery

```

في `A01`.

---

# 16. Portfolio Model

## 16.1 Portfolio Meaning

```
Portfolio
=
workspace surface

```

وليس:

```
canonical Evidence container

```

ولا:

```
Evidence intake mechanism

```

## 16.2 Portfolio View

الشيء القابل للحفظ هو:

```
Portfolio View

```

وهو Projection قد يحفظ:

- canonical Evidence references
- Mastery State references
- filters
- grouping
- ordering
- curation
- annotations
- presentation configuration

ولا يحتوي Copies من Evidence.

## 16.3 Possible Views

- by Capability
- by Project
- by Objective
- by Evidence Type
- by Time
- by Mastery Judgment
- by Freshness Status

## 16.4 Removal Law

```
Remove Evidence from Portfolio View
≠
Delete Evidence

```

## 16.5 Candidate Law

```
Portfolio curation
≠
Candidate Evidence purpose

```

Evidence يجب أن توجد أولًا لسبب إثباتي حاكم.

ثم:

```
Evidence
→ optional Portfolio projection

```

---

# 17. Evidence Bundles / Collections

لا يقدم `A03-R01` Canonical Core Object باسم:

```
Evidence Bundle

```

أو:

```
Evidence Collection

```

لأن الاحتياجات مغطاة بواسطة:

```
Review Request
→ may reference multiple Evidence items

```

و:

```
Portfolio View
→ may curate multiple Evidence items

```

و:

```
Export
→ may generate report / snapshot

```

إضافة container كنسي جديد ستخلق احتمال:

```
duplicate Evidence ownership

```

دون حاجة ملكية واضحة.

---

# 18. Integrity / Revision Model

`A01` يقرر أن accepted Evidence وReviewer Decisions وRun Results وغيرها من السجلات الحساسة للنزاهة لا تعامل كمحتوى عادي قابل للتعديل التدميري.

## 18.1 Candidate Evidence

قبل Admission:

```
editable
+
revision / change history

```

بعد النهاية:

```
ADMITTED
DECLINED
WITHDRAWN

```

لا يعاد فتح Candidate القديمة بصمت.

---

# 18.2 Evidence

بعد Admission:

```
Evidence Revision
=
immutable canonical record

```

أي تغيير جوهري في نفس Evidence claim ينتج:

```
Superseding Evidence Revision N+1

```

---

# 18.3 Review

Review notes وFindings يمكن تعديلها أثناء Review cycle النشطة.

عند إصدار Decision:

```
Review cycle
→ sealed historical record

```

---

# 18.4 Decision

```
immutable after issue

```

Correction:

```
Superseding Review Decision

```

لا overwrite.

---

# 18.5 Mastery State

```
immutable once created

```

الحالة الحالية هي أحدث State فعالة، وليس mutable row يعاد كتابتها.

---

# 18.6 Withdrawal

Withdrawal لا يحذف التاريخ.

Evidence withdrawn قد تؤدي إلى:

```
Mastery reevaluation

```

لكن:

- prior Review محفوظ.
- prior Decision محفوظ.
- prior Mastery State محفوظ.

---

# 18.7 Re-review

```
Existing Evidence
→ New Review Request
→ New Evidence Review
→ New Review Decision

```

ولا يعاد فتح Decision القديمة لتعديلها.

---

# 19. Traceability Model

يجب دعم السلسلة:

```
Definition / Objective / Capability
        ↓
Attempt / Run
        ↓
Result
        ↓
Candidate Evidence Handoff / Submission
        ↓
Candidate Evidence
        ↓
Evidence Revision
        ↓
Review Request
        ↓
Evidence Review
        ↓
Review Findings
        ↓
Review Decision
        ↓
Mastery State

```

ويجب أن يستطيع النظام الإجابة عن:

### Why is this Evidence here?

من:

- Evidence Claim
- purpose
- Source Reference
- Criterion Reference

### What produced it?

من:

- Attempt
- Run
- Result
- Assessment Result
- Project Output
- imported source provenance

### What criterion did it satisfy?

من:

```
Review Criterion Reference
+
Review Finding

```

### Who reviewed it?

من:

```
Evidence Review
→ reviewer attribution

```

### Which Decision changed Mastery?

من:

```
Mastery State
→ effective Review Decisions

```

### What remains insufficient?

من:

- Review Findings
- `MORE_EVIDENCE_REQUIRED`
- missing Mastery Policy requirements
- conflict records
- freshness requirements

---

# 20. Updated Ownership / State Matrix

| ObjectCanonical OwnerEditable?Revision / HistoryIntegrity PointReusable / ReferenceableContextual Projections |                                             |                                           |                                                      |                                            |                               |                                             |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------- | ---------------------------------------------------- | ------------------------------------------ | ----------------------------- | ------------------------------------------- |
| **Candidate Evidence**                                                                                        | Progress & Evidence → Evidence              | نعم قبل terminal Candidate state          | Candidate history                                    | closes on Admission / Decline / Withdrawal | لا كـ Evidence                | Intake, source receipt                      |
| **Evidence**                                                                                                  | Progress & Evidence → Evidence              | لا in-place بعد Admission                 | superseding Evidence Revisions                       | each admitted revision immutable           | نعم بالمرجع                   | Review, Mastery, Portfolio, Learn, Projects |
| **Evidence Lifecycle**                                                                                        | Evidence Revision state dimension           | controlled transition only                | history preserved                                    | no destructive rollback                    | N/A                           | Evidence summaries                          |
| **Review Status**                                                                                             | Derived P&E projection over Reviews         | لا كCanonical content field               | derived from review history                          | N/A                                        | N/A                           | Evidence lists / context                    |
| **Effective Review Decision**                                                                                 | Derived from Review Decision records        | لا                                        | superseding decisions determine effective projection | Decision records immutable                 | نعم كـ governed input         | Evidence, Mastery                           |
| **Evidence Source Reference**                                                                                 | Evidence aggregate                          | Candidate-stage preparation               | parent-versioned                                     | sealed with Evidence Revision              | referenceable                 | Provenance                                  |
| **Evidence Artifact Reference**                                                                               | Evidence aggregate                          | Candidate-stage preparation               | parent-versioned                                     | sealed with Evidence Revision              | referenceable                 | Review / temporary inspection               |
| **Review Request**                                                                                            | Progress & Evidence → Reviews               | نعم قبل Review begins                     | amendment/new request history                        | scope pinned when Review begins            | لا                            | Queue / Evidence context                    |
| **Evidence Review**                                                                                           | Progress & Evidence → Reviews               | نعم أثناء active Review                   | Re-review = new Review cycle                         | sealed on Decision                         | لا                            | Evidence history                            |
| **Review Criterion Reference**                                                                                | Review aggregate                            | قبل pinned review scope                   | parent-versioned                                     | pinned during Review                       | underlying criterion reusable | Review / Trace                              |
| **Review Finding**                                                                                            | Evidence Review                             | أثناء active Review                       | sealed finding set per Review                        | sealed with Decision                       | لا                            | Decision rationale / Mastery trace          |
| **Review Decision**                                                                                           | Progress & Evidence → Reviews               | لا in-place                               | superseding Decisions                                | immutable when issued                      | governed reference            | Evidence / Mastery / Portfolio              |
| **Mastery Policy**                                                                                            | Progress & Evidence → Mastery               | Draft before publish                      | Policy Revisions                                     | published revision immutable               | نعم                           | Mastery evaluation                          |
| **Mastery State**                                                                                             | Progress & Evidence → Mastery               | لا in-place                               | append / supersede                                   | immutable when created                     | queryable                     | Learn / Today / Portfolio                   |
| **Mastery Judgment**                                                                                          | Dimension of Mastery State                  | لا منفصلًا عن State                       | carried per Mastery State                            | immutable within state                     | N/A                           | contextual mastery projection               |
| **Freshness Status**                                                                              | Dimension of Mastery State                  | recomputed only through new Mastery State | historical states preserved                          | immutable within state                     | N/A                           | Learn / Today / Portfolio                   |
| **Mastery History**                                                                                           | Progress & Evidence → Mastery               | لا                                        | append-only history over Mastery States              | immutable                                  | queryable                     | History / audit                             |
| **Portfolio**                                                                                                 | لا يملك canonical Evidence                  | N/A                                       | N/A                                                  | N/A                                        | N/A                           | Workspace Surface                           |
| **Portfolio View**                                                                                            | Progress & Evidence → Portfolio             | نعم                                       | optional saved-view revisions                        | not evidence-grade historical truth        | نعم                           | Portfolio / export                          |
| **Evidence Collection / Bundle**                                                                              | **Not introduced as core canonical object** | —                                         | —                                                    | —                                          | —                             | Review Request / Portfolio View cover need  |

---

# 20.1 Evidence State Matrix

Evidence state must be understood dimensionally.

| DimensionValues               |                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| **Evidence Lifecycle**        | `ACTIVE` / `WITHDRAWN` / `SUPERSEDED`                                               |
| **Review Status**             | `UNREVIEWED` / `IN_REVIEW` / `REVIEWED`                                             |
| **Effective Review Decision** | `NONE` / `ACCEPT` / `ACCEPT_WITH_LIMITATIONS` / `MORE_EVIDENCE_REQUIRED` / `REJECT` |

Valid examples:

```
ACTIVE
+
UNREVIEWED
+
NONE

```

```
ACTIVE
+
IN_REVIEW
+
NONE

```

```
ACTIVE
+
REVIEWED
+
ACCEPT

```

```
ACTIVE
+
IN_REVIEW
+
ACCEPT

```

ممكن أثناء Re-review، مع بقاء القرار السابق Effective حتى إصدار قرار superseding.

```
WITHDRAWN
+
REVIEWED
+
ACCEPT

```

تاريخيًا ممكن، لكن لا تُعرض كـ currently Accepted Evidence لأن Lifecycle لم تعد ACTIVE.

---

# 20.2 Mastery State Matrix

كل Mastery State تحتوي على الأقل:

```
Mastery Judgment
+
Freshness Status
+
Mastery Policy Revision
+
Decision provenance
+
Evidence provenance

```

مثال:

```
Target:
CAP-APPSEC-SQLI

Judgment:
MASTERED

Freshness:
CURRENT

Policy:
MP-APPSEC-v3

```

ومثال آخر:

```
Target:
CAP-APPSEC-SQLI

Judgment:
MASTERED

Freshness:
REVALIDATION_REQUIRED

Policy:
MP-APPSEC-v4

```

الحكم لم يتحول إلى `NOT_MASTERED` لمجرد انتهاء freshness.

---

# 21. End-to-End Flows

## FLOW A — Run Result → Mastery

```
Run Result
→ select eligible result material
→ Candidate Evidence Handoff
→ Progress & Evidence Intake
→ Candidate Evidence
→ ADMITTED
→ Evidence Revision 1
→ SEALED CANONICAL EVIDENCE
→ REVIEW-ELIGIBLE
→ Review Request
→ Evidence Review
→ Findings
→ Review Decision
→ Mastery Evaluation where applicable
→ Mastery State

```

`A02` يثبت هذا الحد من Run Result إلى Candidate Evidence Handoff ثم P&E Intake.

---

## FLOW B — Assessment Result

```
Assessment Result
→ Candidate Evidence Submission
→ P&E Intake
→ Candidate Evidence
→ ADMITTED
→ Evidence
→ Review Request
→ Evidence Review
→ Decision
→ Mastery Evaluation
→ Mastery State

```

ولا يحدث:

```
Assessment completion
→ automatic Evidence

```

ولا:

```
Assessment completion
→ automatic Mastery

```

---

## FLOW C — Project Output

```
Project Output
→ coherent Evidence claim identified
→ Candidate Evidence Submission
→ Candidate Evidence
→ ADMITTED
→ Evidence

```

بعد ذلك:

```
Evidence
→ optional Portfolio View

```

أو، إذا لزم competency judgment:

```
Evidence
→ Formal Review
→ Decision
→ Mastery Evaluation

```

Portfolio ليست سبب Intake.

---

## FLOW D — Existing Evidence → Re-review

```
Existing Evidence
→ Re-review Request
→ New Evidence Review
→ New Findings
→ New Review Decision
→ supersede prior effective Decision where applicable
→ Mastery reevaluation
→ New Mastery State if required

```

---

## FLOW E — Evidence Summary Viewed Elsewhere

`A01` يسمح بالـ contextual Evidence summary خارج `Progress & Evidence`، لكنه ينقل العمل إلى P&E عند Formal Review.

```
Learn / Project / Simulation Result / Today
→ contextual Evidence summary
→ Formal Review requested
→ transition to Progress & Evidence
→ Reviews
→ preserve selected Evidence + context

```

---

## FLOW F — MORE\_EVIDENCE\_REQUIRED / Independent Proof

```
Review Decision:
MORE_EVIDENCE_REQUIRED

→ new independent source material
→ New Candidate Evidence
→ New Evidence Revision 1
→ new Review Request may evaluate:
   Existing Evidence + New Evidence

```

---

## FLOW G — MORE\_EVIDENCE\_REQUIRED / Same Evidence Correction

```
Review Decision:
MORE_EVIDENCE_REQUIRED

→ correction / material extension
   of same Evidence claim
→ Candidate / amendment preparation
→ Superseding Evidence Revision N+1
→ New Review Request
→ Re-review

```

---

# 22. Workspace / Interaction Grammar

تبقى قاعدة `A02`:

```
TOP
=
tools / actions / modes

LEFT
=
structure / navigation

CENTER
=
primary work

RIGHT
=
unique contextual information

BOTTOM
=
temporary workspace
closed by default

```

والقاعدة:

```
ONE INFORMATION ITEM
=
ONE AUTHORITATIVE DISPLAY LOCATION

```

وهي مثبتة في `A02`.

---

# 22.1 Evidence Workspace

## TOP

- Create Candidate where authorized
- Submit Candidate
- Admit / Decline where authorized
- Compare Source
- More

## LEFT

Internal Evidence navigation:

- Intake
- Candidates
- Evidence
- Withdrawn
- Superseded

## CENTER

الـ Candidate أو Evidence record الجاري.

## RIGHT

Unique context فقط:

- provenance warnings
- criterion relevance
- source integrity
- revision relation

## BOTTOM

Closed by default.

يستخدم مؤقتًا لـ:

- deep artifact inspection
- source diff
- integrity metadata
- raw provenance

---

# 22.2 Reviews Workspace

## TOP

- Assign
- Start / Resume Review
- Request More Evidence
- Issue Decision
- Compare Prior Evidence
- More

## LEFT

- Review Queue
- Assigned
- In Review
- Closed

## CENTER

المساحة المهنية الأساسية:

```
Evidence
+
Criteria
+
Findings
+
Decision work

```

## RIGHT

Unique Review context:

- reviewer scope
- prior review relationships
- criterion authority
- provenance conflict
- policy implications

## BOTTOM

- deep artifact inspection
- source comparison
- prior Evidence Revision
- raw provenance

---

# 22.3 Mastery Workspace

## LEFT

- Capability / Mastery Target structure
- subject scope
- current/historical state navigation

## CENTER

يجيب:

```
What is the current governed competency judgment?
Why?
What is missing?

```

ويعرض عند الحاجة:

- Mastery Judgment
- Freshness Status
- applicable criteria
- governing Decisions
- Evidence contribution
- gaps/conflicts

## RIGHT

Unique context:

- Mastery Policy Revision
- why freshness changed
- revalidation trigger
- policy rationale
- unique provenance

## BOTTOM

- Decision chain
- Evidence trace
- prior Mastery State diff

لا يتم استخدام:

- learner score wall
- completion percentage as Mastery
- game-like mastery badges

---

# 22.4 Portfolio Workspace

## LEFT

- Saved Views
- Curated Views

## CENTER

Projection من:

- Evidence
- Accepted Evidence projections
- Mastery States

## RIGHT

- view scope
- filters
- curation metadata

## BOTTOM

- item inspection
- provenance
- export preparation

ولا توجد Intake controls لمجرد إضافة مادة إلى Portfolio.

---

# 23. Contextual Projections

Projection لا يغيّر Canonical ownership.

## Learn may preview

- Evidence summary
- relevant Accepted Evidence
- current Mastery Judgment
- Freshness status
- evidence insufficiency indicator

ولا يستضيف Formal Review.

## Projects may preview

- linked Evidence
- Candidate submission status
- project-relevant Mastery projection

لكن:

```
Project ≠ Evidence owner

```

## Simulation Results may preview

- Handoff receipt
- submitted material
- P&E reference
- downstream Candidate state

ولا تستضيف Evidence Review.

## Today may surface

- Review requiring attention
- Candidate waiting for Intake
- Evidence requiring more context
- revalidation requirement
- newly changed Mastery State

لكن Today يبقى orchestration surface.

---

# 24. Core Invariants

1. `Definition → Attempt / Run → Result → Candidate Evidence → Evidence → Review → Decision → Mastery State`.
2. `Result ≠ Evidence`.
3. `Candidate Evidence ≠ Evidence`.
4. `Evidence ≠ Artifact`.
5. `Review ≠ Decision`.
6. `Decision ≠ Mastery`.
7. `Completion ≠ Mastery`.
8. `Progress ≠ Mastery`.
9. `AAR ≠ Evidence Review`.
10. `Research & Quality Review ≠ Evidence Review`.
11. `Portfolio ≠ duplicate Evidence store`.
12. `Contextual Projection ≠ Canonical Copy`.
13. Candidate Evidence must represent a coherent Evidence Claim.
14. Portfolio curation is not sufficient Candidate purpose.
15. Admission creates governed Evidence but does not start Review.
16. Admission does not create Acceptance.
17. Admission does not create Mastery.
18. Evidence Lifecycle is independent from Review Status.
19. Review Status is independent from Effective Review Decision.
20. Accepted Evidence is a Projection, not a new object.
21. Evidence Revision is immutable after Admission.
22. Review Decision is immutable after issuance.
23. New independent proof creates new Evidence, not a Revision of unrelated Evidence.
24. Correction/extension of the same governed Evidence claim may create a superseding Evidence Revision.
25. Mastery Judgment is independent from Freshness Status.
26. `MASTERED + REVALIDATION_REQUIRED` is valid.
27. Freshness rules belong to versioned Mastery Policy.
28. Conflicting Evidence must not be silently resolved through `latest wins`.
29. Source supersession never rewrites accepted history.
30. Withdrawal never deletes Review / Decision / Mastery history.
31. One canonical owner exists per object.

---

# 25. Explicitly Prohibited Collapses

يحظر:

```
Result = Evidence

```

```
Candidate Evidence = Evidence

```

```
Evidence = Artifact

```

```
Evidence Lifecycle = Review Status

```

```
Review Status = Review Decision

```

```
Accepted = ACTIVE

```

```
Review = Decision

```

```
Decision = Mastery

```

```
Completion = Mastery

```

```
Progress = Mastery

```

```
REVALIDATION_REQUIRED = replacement for MASTERED

```

```
AAR = Evidence Review

```

```
Research & Quality Review = Evidence Review

```

```
Portfolio = Evidence intake shortcut

```

```
Portfolio = duplicate Evidence store

```

```
Contextual Evidence preview = canonical Evidence copy

```

```
New independent proof = Evidence Revision N+1

```

```
Candidate Evidence Handoff = Evidence acceptance

```

---

# 26. Owner Decisions — Reclassified

# 26.1 BLOCKING FOR A03 APPROVAL

هذه القرارات يجب أن تُحسم قبل اعتماد `A03`.

---

## OD-A03-01 — Default Mastery Target Scope

### Architecture Recommendation

```
Capability
=
default canonical Mastery Target

```

و:

```
Knowledge Unit
Objective
Criterion
Project
=
contribution / context references by default

```

**Status:** `APPROVED — CEP-DEC-026`

---

## OD-A03-02 — Mastery Judgment Vocabulary

التوصية:

```
NOT_EVALUATED
INSUFFICIENT_EVIDENCE
INCONCLUSIVE
NOT_MASTERED
MASTERED

```

مع بعد منفصل:

```
Freshness Status:
CURRENT
REVALIDATION_REQUIRED

```

**Status:** `APPROVED — CEP-DEC-026`

---

## OD-A03-03 — Review Decision Vocabulary

التوصية:

```
ACCEPT
ACCEPT_WITH_LIMITATIONS
MORE_EVIDENCE_REQUIRED
REJECT

```

**Status:** `APPROVED — CEP-DEC-026`

---

# 26.2 NON-BLOCKING POLICY / DELIVERY DECISIONS

المبادئ المعمارية التالية تُجمّد الآن، بينما التفاصيل الدقيقة يمكن تأجيلها.

---

## OD-A03-04 — Mastery Freshness Durations / Triggers

### Frozen Architecture Principle

```
Mastery freshness
belongs to
versioned Mastery Policy

```

ولا توجد Global hard-coded freshness period.

تفاصيل:

- durations
- trigger thresholds
- revision sensitivity

يمكن اعتمادها لاحقًا.

**Classification:** `NON-BLOCKING POLICY / DELIVERY DECISION`

---

## OD-A03-05 — Reviewer Independence Levels

### Frozen Architecture Principle

Reviewer independence:

```
policy-based
according to:
criterion
target
risk
review purpose

```

لا يوجد مستوى استقلال واحد عالميًا.

**Classification:** `NON-BLOCKING POLICY / DELIVERY DECISION`

---

## OD-A03-06 — Team Evidence Attribution

### Frozen Invariant

```
Team Output
MUST NOT
create individual Mastery
without explicit attributable individual contribution

```

المساهمة الفردية قد تأتي من:

- role attribution
- task attribution
- action provenance
- artifact attribution
- decision attribution
- individual result dimensions

التفاصيل التنفيذية والسياسات الدقيقة يمكن تحديدها لاحقًا.

**Classification:** `NON-BLOCKING POLICY / DELIVERY DECISION`

---

## OD-A03-07 — Imported Evidence Assurance

### Frozen Invariant

```
Imported material
MUST carry
explicit assurance / provenance classification

```

ولا يجوز التعامل مع unknown-origin material وsource-authenticated material كأنهما متساويان.

الـ exact assurance vocabulary يمكن تحديدها لاحقًا.

**Classification:** `NON-BLOCKING POLICY / DELIVERY DECISION`

---

## OD-A03-08 — Sensitive Evidence Retention

### Frozen Invariant

قبل تنفيذ handling لـ sensitive Evidence يجب وجود Policy تغطي:

- retention
- privacy
- access
- redaction
- export
- withdrawal implications
- deletion restrictions
- auditability

لكن:

```
exact retention periods

```

ليست مطلوبة لاعتماد Architecture A03.

**Classification:** `NON-BLOCKING POLICY / DELIVERY DECISION`

---

# 27. Visual-Synthesis Implications

هذه الوثيقة لا تعتمد Final UI.

لكنها تحدد ما يجب على Visual Synthesis إثباته.

---

# 27.1 Primary Navigation

يستخدم بالضبط:

```
Evidence
Reviews
Mastery
Portfolio

```

ولا تتم إضافة:

```
Progress

```

كـ Primary Area.

---

# 27.2 Candidate vs Evidence

يجب أن يكون الفرق البصري واضحًا بين:

```
Candidate Evidence

```

و:

```
Admitted Evidence

```

ولا تعرض Candidate كأنها already accepted.

---

# 27.3 Admission

يجب أن يعكس UI:

```
ADMITTED
→ SEALED CANONICAL EVIDENCE
→ REVIEW-ELIGIBLE

```

ولا يجب أن يُظهر Admission كأنه:

```
Accepted

```

أو:

```
Reviewed

```

---

# 27.4 Evidence Three-Dimension State

يحظر Chip واحدة مبهمة تخلط:

- Lifecycle
- Review Status
- Decision

إذا احتاجت الشاشة إلى عرض أكثر من Dimension، يجب أن تكون دلالاتها منفصلة بوضوح.

مثال صحيح:

```
Lifecycle
ACTIVE

Review
REVIEWED

Decision
ACCEPT_WITH_LIMITATIONS

```

وليس:

```
Status:
Accepted

```

كحالة شاملة تخفي semantics مختلفة.

---

# 27.5 Formal Review

CENTER يجب أن يركز على:

```
Evidence
+
Criteria
+
Findings
+
Decision work

```

ولا يصبح Review Workspace card wall.

---

# 27.6 Machine / Historical Truth vs Judgment

على التصميم التفريق بين:

```
Evidence facts / provenance

```

و:

```
Reviewer's judgment

```

و:

```
Mastery judgment

```

فهذه طبقات مختلفة.

---

# 27.7 Mastery Dimensions

يجب ألا يظهر `REVALIDATION_REQUIRED` كبديل لـ Mastery Judgment.

مثال بصري صحيح:

```
Mastery:
MASTERED

Freshness:
REVALIDATION_REQUIRED

```

---

# 27.8 Portfolio

Portfolio يجب أن يبدو:

```
curated projection

```

وليس:

- upload inbox
- evidence intake
- duplicate repository

---

# 27.9 MORE\_EVIDENCE\_REQUIRED

عند هذه Decision، يجب ألا يدفع UI المستخدم تلقائيًا إلى:

```
Create Revision

```

بدون معرفة نوع المادة.

يجب أن يميز المسار بين:

```
Add Independent Evidence

```

و:

```
Amend Existing Evidence

```

---

# 27.10 Cross-Workspace Handoff

يبقى المسار:

```
Simulation & Enterprise
→ Results
→ Candidate Evidence Handoff
→ Progress & Evidence
→ Evidence Intake

```

ويحافظ على source provenance دون تحويل Results إلى Evidence Workspace.

---

# 28. Architecture Decision Summary

البنية النهائية المرشحة لـ `A03-R01`:

```
Progress & Evidence

├── Evidence
│   ├── Intake
│   ├── Candidate Evidence
│   └── Canonical Evidence
│
├── Reviews
│   ├── Review Requests
│   ├── Evidence Reviews
│   ├── Findings
│   └── Decisions
│
├── Mastery
│   ├── Mastery Policies
│   ├── Mastery States
│   └── Mastery History
│
└── Portfolio
    └── Portfolio Views

```

ويطبق Evidence:

```
Lifecycle
+
Review Status
+
Effective Review Decision

```

كأبعاد منفصلة.

ويطبق Mastery:

```
Mastery Judgment
+
Freshness Status
+
Mastery Policy Revision
+
Decision / Evidence Provenance

```

ويظل:

```
Progress
=
contextual journey/activity projection

```

و:

```
Mastery
=
governed competency truth

```

والحدود الكبرى تبقى:

```
SOURCE DOMAIN
owns
Definition / Attempt / Run / Result

        ↓

Handoff / Submission

        ↓

PROGRESS & EVIDENCE
owns
Candidate Evidence
→ Evidence
→ Review
→ Decision
→ Mastery State

```

---

# 28.1 Owner Decision Resolution

تمت الموافقة الصريحة من المالك على `CEP-PRD-001-A03` بتاريخ `2026-08-14` تحت القرار:

`CEP-DEC-026`

وتشمل الموافقة القرارات الحاجبة التالية:

- `OD-A03-01` — `Capability` هو Default Canonical Mastery Target، بينما `Knowledge Unit / Objective / Criterion / Project` تبقى contribution/context references افتراضيًا.
- `OD-A03-02` — Mastery Judgment vocabulary المعتمدة: `NOT_EVALUATED / INSUFFICIENT_EVIDENCE / INCONCLUSIVE / NOT_MASTERED / MASTERED` مع بعد مستقل `Freshness Status = CURRENT / REVALIDATION_REQUIRED`.
- `OD-A03-03` — Review Decision vocabulary المعتمدة: `ACCEPT / ACCEPT_WITH_LIMITATIONS / MORE_EVIDENCE_REQUIRED / REJECT`.

كما تم تثبيت المبادئ غير الحاجبة `OD-A03-04` إلى `OD-A03-08` كما وردت في هذا المستند، دون تحويلها إلى تفاصيل تنفيذية أو سياسات تشغيلية نهائية.

# 29. STATUS

**CEP-PRD-001-A03**
**Progress & Evidence Operating Model**

**STATUS:**
`APPROVED — OWNER APPROVED`

**NOT SELF-APPROVED**

**IMPLEMENTATION AUTHORIZATION:**
`NONE`

---

# 30. Gate Closure

```
CEP-PRD-001-A03-G01

CLOSED — APPROVED

```

**APPROVED. IMPLEMENTATION AUTHORIZATION REMAINS NONE.**