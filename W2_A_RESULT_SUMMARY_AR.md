# CEP — Wave 2 Lane A — ملخص المرشح التنفيذي

**المهمة:** `W2-A-GLOBAL-COMMAND-TRANSIENT-PREFERENCES`  
**التصنيف:** `CANDIDATE_ONLY / NOT_CONTROLLER_ACCEPTED / NOT_SELF_PROMOTED`

## نقطة الانطلاق

تم التنفيذ على نسخة معزولة فقط من E09 المصرح به:

- Successor ID: `CEP-FR-E09-FW-C-eebd3b8b`
- Parent ZIP SHA-256: `eebd3b8b0891b8c4c4d09a671f9bc0f8bad4a3e337eca9d8859b24a5bd5da137`
- Parent canonical source SHA-256: `8f44670ccdfd2aeefe6d0c5321259fb60c9be5ead68b3a338da4a1f9db89ff3f`

## الملاك التنفيذيون الناتجون

- `SemanticCommandBus`: هوية الأمر، التسجيل، discovery، availability-gated execution، route convergence، وإيصال تنفيذ دلالي واحد لكل فعل مقبول.
- `TransientFocusOwner`: ترتيب الـ transient stack، أولوية Escape / outside-click، modal isolation، وعودة focus إلى الـ invoker أو fallback بصورة حتمية.
- `ScopedPreferencesOwner`: scope precedence، applicability، set/reset/import/export، persistence truth، ومنع تسرب تفضيلات Structured / Spatial / Operational بين العائلات غير المتوافقة.

الواجهات التاريخية `CommandRegistry` و`TransientFocusController` و`ScopedPreferences` بقيت compatibility facades وليست ملاكًا موازيين.

## نتائج التحقق

- Model Tests: `140/140 PASS`.
- `npm run check`: `PASS`.
- Full Browser Conformance: `6/6 PASS` على `in-memory-current-built-graph` لأن localhost محجوب إداريًا في بيئة التنفيذ.
- Lane A Browser Proof: `3/3 PASS`.
- Command real-route convergence: `toolbar / context / object-doubleclick / menu / palette` على هوية أمر واحدة، مع إيصال واحد لكل تنفيذ مقبول.
- Lane A negative / ghost-owner scan: `16/16 PASS`.
- Central-modification proof: `PASS`، وهاش المصدر قبل وبعد التجربة المؤقتة متطابق تمامًا.
- Wave 1 A/B/C regressions: `PASS`.
- R3 / Golden: VS03 `4/4`، VS04 `8/8`، VS05 `6/6`.
- Canonical source scope: تسعة مسارات فقط ضمن النطاق المصرح؛ لا توجد تعديلات على ملاك Structured أو Spatial المحميين.

Candidate canonical source SHA-256:

`6542567d81f81cab3907bca1707202e54237fb82dabf88a3cf9daaef7fff9d57`

## عنصر تقارب محمي للـ Controller

المصدر المحمي `foundation/global/workspace-host-kernel.ts` لا يزال يحتوي metadata تاريخية:

`WORKSPACE_HOST_CONTRACT.stateOwners.transients = "TransientFocusController"`

لم يتم تعديل هذا الملف لأنه خارج قائمة Lane A المسموح بها. الحقيقة التنفيذية الحالية هي `TransientFocusOwner`، و`TransientFocusController` مجرد facade مفوض. تم تسجيل ذلك صراحة في `assurance/W2A_CONTROLLER_CONVERGENCE_REQUIREMENT.json` بدل الاستيلاء على نطاق غير مصرح.

لا يوجد تحديث لـ `CURRENT_CONTROL`، ولا كتابة إلى `40_ACCEPTED_SUCCESSORS`، ولا دمج لـ Lane B/C، ولا Wave 3 أو Surface work، ولا self-promotion.
