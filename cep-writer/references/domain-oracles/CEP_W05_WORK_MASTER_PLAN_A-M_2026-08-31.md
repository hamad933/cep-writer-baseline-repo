# CEP W05 — Work Master Plan A–M

**الحالة:** خطة تنفيذية للقراءة والتحكيم فقط — لا تنفيذ ولا قبول  
**تاريخ التخطيط:** 2026-08-31  
**المشروع/المسار:** `CEP` / `PERSONAL:CEP`  
**مرجع التخطيط الدقيق:** `snapshot/cep-w05-work-master-planner-01-20260831@a83ea389323b3942959ab7628480da8849ffe801`  
**Tree:** `1321635fa94bb90f43ff25d7782ee855bda51295`  
**علاقة PR:** نفس bytes لرأس PR #57 `work/cep-ui-w05-visual-r02@a83ea389323b3942959ab7628480da8849ffe801`؛ PR مفتوح/Draft/غير مدمج، ولا يشكل baseline مقبولًا للمنتج أو التكامل المشترك.  
**نطاق المنتج:** Health / Processing / Validation / Manual AI / Backup & Restore / Audit / Releases / Configuration.  
**سلطة الوثيقة:** تخطيط implementation-grade يعاد للتحكيم؛ لا يمنح سلطة كتابة أو تجميد أو قبول أو دمج أو إصدار أو نشر.

---

## A. Authoritative Scope / Exact Planning Baseline / Classification

### A1. حقيقة المصدر والتصنيف

| البند | الحقيقة الحاكمة |
|---|---|
| المستودع | `hamad933/Cybersecurity-Education-Platform` |
| مرجع القراءة | `snapshot/cep-w05-work-master-planner-01-20260831` |
| commit | `a83ea389323b3942959ab7628480da8849ffe801` |
| tree | `1321635fa94bb90f43ff25d7782ee855bda51295` |
| alias delta | صفر bytes مقارنة برأس PR #57 المذكور أعلاه |
| التصنيف | `UNREVIEWED_PLANNING_INPUT_ONLY`; `NOT_ACCEPTED_PRODUCT_BASELINE`; `NOT_SHARED_INTEGRATION_BASELINE`; `NO_IMPLEMENTATION_WRITE_AUTHORITY` |
| بوابة التكامل | مغلقة؛ لا اختيار baseline مشترك في هذه الخطة |

تم التحقق المباشر من أن المرجع يحل إلى SHA المطلوب، وأن commit يحل إلى tree المطلوب، وأن PR #57 غير مدمج. أي حقيقة عن الملفات/الرموز الحالية في هذه الخطة تعني هذه الشجرة فقط، لا `main` ولا branch متحركًا.

### A2. ترتيب السلطة

1. **Current State الحاكم والقرارات المعتمدة**: يملكان التوجيه، الملكية، والبوابات.
2. **GitHub على SHA/tree أعلاه**: يملك الحقيقة التقنية الحالية.
3. **عقود IA/Visual المعتمدة**: تضبط معنى المنتج وملكية TOP/LEFT/CENTER/RIGHT/BOTTOM.
4. **حزم التحكيم/التصحيح المعتمدة**: تضبط findings المقبولة لـ SYSOPS/AIB/BACKUP.
5. **صور exact-build والمراجع البصرية المحكومة**: تثبت العرض فقط، لا صحة runtime غير الظاهرة.
6. **handoffs وIPA**: مدخلات إثبات/فرضيات؛ لا تتغلب على المصدر أو التحكيم.

مؤشرات IPA الخام الثمانية قُرئت أخيرًا كما طُلب، لكن الملفات الهدف أعادت `404` عند القراءة المباشرة؛ لذلك لا تعتمد الخطة أي finding مادي عليها. الـ findings أدناه مثبتة بالمصدر، الصور الدقيقة، أو authority المحكّمة.

### A3. الحد الديناميكي R22/R18/R30

- التنفيذات الموسومة حاليًا `SYSOPS R22` و`AIB R18` و`BACKUP R30` قيود خارجية متحركة، لا bytes مقبولة ولا frozen inputs لهذه الشجرة.
- لا تنتظر الخطة AIB freeze، ولا تقرأ نجاح provider أو `COMPLETED` كـ review/freeze/acceptance.
- لا يستهلك التكامل المستقبلي أيًا منها إلا بعد توريد **remote full SHA من 40 خانة + tree + path manifest + test/evidence manifest + قرار reviewed/frozen صريح**.
- إذا اختلفت bytes المستقبلية عن هذه الشجرة، تسجل كـ input delta ولا يعاد تفسير planning snapshot بأثر رجعي.

### A4. الاستبعادات المطلقة في هذه الجلسة

لا source mutation، لا writer جديد، لا branch/commit/push/PR mutation، لا تكامل W05 مشترك، لا تعديل PR #57، لا merge/release/deploy/publication/final acceptance، لا Current State بديل، ولا قبول بصري أو تقني مستمد من هذه الوثيقة وحدها.

---

## B. W05 Product & Information Architecture

W05 هو مقصد **System & Operations** داخل IA ذات الوجهات الخمس. يملك الحقيقة التشغيلية التقنية، ولا يملك الحكم على جودة المعرفة أو canonical knowledge truth.

| السطح | يملك | يستهلك | يعرض/يسقط | لا يجوز أن يكرر أو يدّعي |
|---|---|---|---|---|
| Health | تجميع صحة تقنية قابلة للتتبع وف freshness | فحوص الأساس، worker/queue evidence، Processing، Validation، Manual AI، Backup، Audit، Release | حالة كل مكوّن، وقت الرصد، المصدر، السبب، recovery action | لا uptime/SLA، لا worker liveness من وجود جدول، لا `UNAVAILABLE=HEALTHY`، ولا تفاصيل object الموجودة في سطحه المختص |
| Processing | lifecycle للطلب/التشغيل/المحاولة/الإلغاء/الفشل | طلبات ingest، jobs، outbox، correlation/idempotency | requested→claimed/running→terminal، attempts، heartbeat، safe failure | لا knowledge decision، لا retry غير مضبوط، ولا اعتبار إلغاء سجل DB إيقافًا للعمل وحده |
| Validation | integrity/schema/type/signature/conformance التقني | SafeSourceImport، SafePackage، digests، schema registry | نتائج تقنية وأسباب رفض قابلة للتنفيذ | لا حكم علمي/تربوي/مصدر موثوق، ولا اعتبار `exported` = accepted |
| Manual AI | تبادل يدوي provider-neutral وحوكمة review | selected-source provenance، SafePackage ZIP، prompt/result digests | lifecycle، proposals، evidence، decisions البشرية | لا provider call/polling/embeddings، لا auto publish، لا silent acceptance، لا JSON خام بدل SafePackage |
| Backup & Restore | backup/verify/stage/drill/compare/activation-pending evidence | PostgreSQL، blobs، audit chain، SafePackage | حالة المحاولة، التشفير الحقيقي، stage مقابل apply، compensation | لا ادعاء تشفير غير منفذ، لا claim أن web stage طبق DB، لا web activation |
| Audit | append-only application trail + hash-chain verification | أحداث كل الأسطح وcorrelation IDs | sequence، actor، action، outcome، first invalid، filters/history | لا DB immutability أو «نزاهة تامة» بلا قيد DB مثبت، ولا تسمية hash تشفيرًا |
| Releases | التحقق التقني من candidate-bound evidence | source/tree SHA، test/runtime/visual manifests، Owner decision | technical readiness منفصل عن authorization/deployment | لا اعتبار generic actor packages دليل إصدار، ولا `PUSH=ACCEPTANCE=MERGE` |
| Configuration | عرض operational config الآمن؛ وربما preferences محلية بعد قرار سلطة | whitelist من config غير السري | القيمة، المصدر، effective state، restart requirement | لا secrets، لا runtime mutation implied، ولا وصف القيمة «معتمدة» بلا provenance |

قاعدة العرض: كل information item له authoritative display location واحد. CENTER يملك العمل الأساسي، RIGHT يملك سياقًا فريدًا فقط، وBOTTOM يملك التفاصيل المؤقتة الثقيلة.

---

## C. Shared Workspace / Navigation / Layout Architecture

### C1. ملكية المناطق

| المنطقة | العقد |
|---|---|
| TOP | عنوان السطح، حالة تشغيلية مختصرة، وأفعال حقيقية فقط. زر refresh يسمى refresh؛ لا يسمى «تشغيل فحص» ما لم يبدأ فحصًا durable. |
| LEFT | تنقل W05 الثماني وبنية النطاق. يحفظ active item ظاهرًا وقابلًا للوصول، ولا يحتوي تفاصيل object. |
| CENTER | المهمة الأساسية ويظهر أولًا دلاليًا وبصريًا في نصف سطح المكتب. |
| RIGHT | context فريد، policy/guardrails/next action؛ لا يعيد جدول CENTER أو حالته التفصيلية. |
| BOTTOM | deep diagnostics مؤقتة، مغلقة افتراضيًا، تفتح بفعل صريح، تحافظ على focus وتغلق بـ Escape وزر مسمى، ولا تحل محل route/history. |

### C2. التنقل والاستمرارية

- تحتفظ routes الحالية `/system`, `/processing`, `/validation`, `/ai-bridge`, `/backups`, `/audit`, `/releases`, `/configuration` بهوية الأسطح.
- back/forward يعيدان السطح، filter/selection المرمّز في URL حيث يلزم، وحالة BOTTOM المغلقة ما لم توجد deep-link policy معتمدة.
- لا يعتمد context continuity على refs محلية غير قابلة للاستعادة وحدها؛ selection طويل العمر يشفّر في query/route، أما تفاصيل لحظية فتبقى محلية.
- W05 لا يعيد إنشاء global navigation؛ يستهلك عقد الوجهات الخمس.

### C3. نصف سطح المكتب والاستجابة

المصدر الحالي في `resources/css/app.css` يضع عند `max-width:64rem` صف `structure context` قبل `center center`، والصور 768 تثبت أن CENTER يتأخر. prescription: عند 768/~1024 يكون CENTER أول منطقة بعد TOP؛ LEFT/RIGHT يتحولان إلى drawers/disclosures أو صف لاحق، مع بقاء navigation/context قابلين للوصول. لا page-level CSS hacks؛ الإصلاح في shared layout بواسطة integration owner المحجوز.

### C4. العربية/Bidi والوصول

- shell `dir=rtl`, grid physical placement واضح، وكل SHA/UUID/status/code/path في `<bdi dir="ltr">` أو container LTR.
- أسماء الحقول عربية أولًا؛ المصطلح الإنجليزي مساعد وليس بديلًا.
- ترتيب DOM يطابق القراءة والتبويب: TOP → CENTER → controls لفتح LEFT/RIGHT → BOTTOM عند الفتح.
- كل status لا يعتمد على اللون وحده؛ focus visible؛ tables لها captions/headers؛ errors مرتبطة بالحقول؛ الأفعال الخطرة لها confirmation مناسب.
- لا nested interactive controls، ولا link داخل row button أو العكس.

---

## D. Health + Processing + Validation Lifecycle / State Contracts

### D1. عقد الرصد المشترك

كل projection يعيد envelope صريحًا بدل `[]/0/false` الاحتياطي:

```text
observation_state = AVAILABLE_DATA | AVAILABLE_EMPTY | UNAVAILABLE | ERROR | STALE
observed_at       = UTC timestamp أو null
source            = provider/check/query identifier
fresh_until       = UTC timestamp أو null
error_category    = safe bounded code أو null
recovery_action   = refresh | retry_check | open_surface | operator_action | none
data              = typed payload أو null
```

القواعد: `AVAILABLE_EMPTY` تعني أن الاستعلام نجح ولا records؛ `UNAVAILABLE` تعني dependency/schema/provider غير متاح؛ `ERROR` يعني attempt فشل؛ `STALE` يعني آخر بيانات ناجحة تجاوزت freshness؛ لا حالة منها تصبح success. `SystemOperationsState::safe`, `rows`, `actorRows`, `statusCounts`, و`tableAvailable` يجب ألا تطمس هذا الفرق.

### D2. Health

- `FoundationHealth::summaryChecks()` هو probe واحد، وليس aggregation كاملًا.
- Health يضم projections صريحة لـ Processing worker heartbeat/queue, Outbox, Validation engine, Manual AI policy/lifecycle, Backup last verified + last failed attempt، Audit chain، وRelease technical gate.
- queue table/row لا يثبت worker liveness؛ يلزم heartbeat أو bounded probe مع `observed_at`.
- Top actions: `Refresh observed state` دائمًا ممكن؛ `Run checks` فقط إذا route ينشئ check run durable ويعرض lifecycle. «Retry» يظهر فقط لفحص فاشل قابل لإعادة المحاولة.
- نسخة النص لا تستخدم «مراقبة متواصلة/ضمان الاستمرارية» دون scheduler/runtime evidence.

### D3. Processing

العقد المنطقي المطلوب:

```text
REQUESTED/PENDING
  -> CLAIMED/RUNNING(attempt_no, worker_id, lease, heartbeat)
  -> COMPLETED
  -> RETRY_WAIT -> CLAIMED/RUNNING (attempt_no + 1)
  -> FAILED | TIMED_OUT
  -> CANCEL_REQUESTED -> CANCELLED
```

- attempt يزيد عند claim فعلي لكل محاولة، لا فقط `pending→running` الأولى.
- worker يعيد قراءة status/lease قبل side effect وقبل completion؛ `cancelled`/`cancel_requested` لا ينتقل إلى completed.
- idempotency key فريد لكل logical request؛ attempt history append-only، وterminal result واحد.
- timeout/heartbeat/worker loss حالات صريحة، مع safe error وcorrelation.
- يحافظ pipeline على `SafeSourceImportService` ويضيف correlation من SourceImport إلى extraction/staging وProcessingRun وValidation result؛ لا bypass لمسح signature/digest.
- retry policy bounded، category-aware، ولا duplicate side effects؛ UI يشرح لماذا retry متاح/محجوب.

### D4. Validation

- current SafeSourceImport يتحقق من extension/media/signature وdigest؛ لا توجد validation engine كاملة في snapshot. UI لا يسمي ذلك schema/data validation قبل وجود نتيجة executable.
- lifecycle تقني: `RECEIVED -> QUARANTINED/TYPE_REJECTED` أو `TECHNICAL_VALIDATING -> TECHNICALLY_VALID/TECHNICALLY_INVALID/ERROR`; أي knowledge review خارج W05.
- status `exported` للحزمة لا يدخل accepted count. accepted يعكس validation result صريحًا فقط.
- كل failure يعيد safe code، field/path عند الإمكان، schema version، digest، وrecovery action.
- import الناجح لا ينشر معرفة canonical ولا يصدر quality verdict.

---

## E. Manual AI Bridge Lifecycle / Human Review / Provenance

### E1. حدود النقل والتنفيذ

- backend الحاكم في `ReleaseController::importAiResult` و`ManualAiBridgeService::importResult` يقبل SafePackage ZIP من نوع `manual-ai-result`; واجهة `.json`/`JSON Package` الحالية خاطئة وتصحح إلى ZIP.
- لا raw JSON endpoint، لا provider credentials، لا network provider call، لا polling، لا embeddings، ولا auto publish.

### E2. provenance الدائم

قبل export تحفظ وتتحقق الحقول: actor، prompt package/revision، purpose، normalized input digest، package digest، selected source ID، exact source revision ID، source content digest، stable anchor/range، ownership/actor binding، governing authority/baseline IDs، timestamp. لا default مصنوع إذا source selection غير موجود؛ يفشل الطلب fail-closed.

عند import: يطابق actor + prompt revision + input digest + selected-source provenance + package manifest + result digest. duplicate proposal IDs داخل الحزمة مرفوضة، وإعادة استيراد نفس digest idempotent لنفس actor فقط.

### E3. lifecycle والقرار

```text
DRAFT -> EXPORTED -> AWAITING_MANUAL_PROCESSING
       -> RESULT_IMPORTED
       -> STRUCTURE_VALIDATION_FAILED | PROVENANCE_VALIDATION_FAILED
       -> AWAITING_HUMAN_REVIEW
       -> PARTIALLY_REVIEWED
       -> ACCEPTED_AS_DRAFT | REJECTED | SUPERSEDED
```

- decision unit هي proposal/change، لا package كامل فقط.
- القرارات append-only: `ACCEPT`, `EDIT`, `REJECT`, `DEFER`, `REQUEST_EVIDENCE` مع rationale، actor، input/result/proposal digests، prior decision link، وtimestamp.
- `EDIT` يحفظ original proposal + human-edited draft؛ `DEFER` غير terminal ويمكن أن يتبعه `ACCEPT`; finality تمنع تغيير terminal decision إلا بسجل supersession جديد.
- aggregate state مشتق من proposals: pending/partial/accepted/rejected؛ لا overwrite لتاريخ القرار.
- `ACCEPT` ينشئ draft فقط عبر capability المملوكة؛ لا canonical publish ولا auto acceptance.

### E4. حدود الكتابة

مرشح AIB المستقبلي يملك `app/Modules/ManualAiBridge/**`، AIB-specific migrations/tests، و`components/ai-bridge/**` فقط. `ReleaseController.php`, routes، `SystemOperationsState.php`, `Workspace.vue`, `types.ts` والتجميع المشترك محجوزة لسلطة التكامل الواحدة.

---

## F. Backup & Restore Lifecycle / Compensation / Restore Drill

### F1. Backup create/verify

- يسجل attempt durable قبل أول snapshot/blob/package side effect: actor، correlation، phase، started_at.
- PostgreSQL فقط في V1 كما يفرض `BackupService::tableSnapshot`; أي driver آخر failure صريح.
- scope الحالي يقول `encryption=NOT_IMPLEMENTED_LOCAL_V1`; UI يعرض «حزمة موقعة/متحقق من بصمتها وغير مشفرة في V1» إلى أن توجد encryption مثبتة، ولا يستخدم «مشفرة» للبصمة.
- success يتطلب DB snapshot + blob inventory/content verification + SafePackage creation + manifest/audit. failure يبقى record دائمًا.

### F2. Restore lifecycle

```text
RECEIVED -> PACKAGE_VERIFIED -> STAGED
-> ISOLATED_APPLY_RUNNING (_restore_drill only)
-> ISOLATED_APPLY_FAILED | VALIDATING
-> COMPARED
-> ACTIVATION_PENDING | ABANDONED
```

- web `stage` يفحص/يمرآة/يسجل فقط؛ لا يدعي apply أو DB test.
- apply يبقى CLI في DB اسمها ينتهي `_restore_drill`؛ لا HTTP activation route.
- compare يثبت counts، digests، blobs، audit chain، schema/version، ويخرج mismatches.
- activation production خارج سلطة W05 الحالية ويتطلب قرارًا منفصلًا؛ الخطة لا تنشئ مساره.

### F3. rollback/compensation truth

- DB transaction rollback حقيقة منفصلة عن blob compensation.
- قبل كتابة blob يسجل pre-state: absent أو digest/size/status/key؛ يسجل كل created/overwritten key.
- عند failure: يحتفظ original exception كسبب رئيسي آمن (category + class fingerprint + phase)، ثم يجرب compensation؛ compensation failure يسجل مستقلًا ولا يحجب الأصل.
- `rollback_failed` لا يستخدم إلا عند failure صريح في rollback/compensation، لا message heuristics. إن نجح rollback تسجل `failed_rolled_back`; إن لم تبدأ mutation تسجل `failed_before_mutation`.
- migration `down` التي قد تفقد provenance/decisions/runs تحتاج preflight يفشل إذا توجد rows غير قابلة للحفظ؛ يختبر rollback/reapply على PostgreSQL.

### F4. حدود الكتابة

مرشح BACKUP يملك `app/Modules/Platform/Backup/**`, commands الخاصة، dedicated migrations/tests، و`components/backups/**`. كل route/controller/state/gateway مشترك محجوز للتكامل.

---

## G. Audit + Releases + Configuration

### G1. Audit

- snapshot يفرض append-only عبر Eloquent hooks ويكتشف tamper بسلسلة SHA-256؛ هذا **ليس** DB-level immutability ولا encryption ولا total integrity.
- تصحح نسخة UI إلى «سجل append-only على مستوى التطبيق مع سلسلة hash قابلة للتحقق». إذا أضيف DB trigger/revoke لاحقًا، لا يرفع claim قبل PostgreSQL runtime proof.
- `AuditChainVerifier::first_invalid_sequence` يعبر إلى state وCENTER/diagnostic بدل إسقاطه.
- endpoint/query يدعم pagination وfilters بـ actor/action/target/outcome/correlation/time؛ latest 50 ليس history كاملًا.
- كل محاولة فاشلة مادية في AIB/Backup/Processing/Release تسجل outcome failure حتى لو فشل العمل قبل success record.
- observation errors لا تصبح chain valid/count 0.

### G2. Releases

يفصل النموذج بين:

1. **Technical verification**: source SHA/tree، tests، migrations، runtime، evidence completeness.
2. **Owner authorization**: قرار بشري صريح bound إلى exact candidate؛ ليس مشتقًا من PASS تقني.
3. **Deployment authorization/execution**: سلطة منفصلة غير متاحة لهذه الخطة.

يحتاج سطح Releases binding حقيقيًا بين release candidate وevidence packages؛ الاستعلام الحالي لكل `portable_packages` الخاصة بالactor لا يكفي. الحقول المنطقية: candidate SHA/tree، evidence kind، producer/check، observed_at، artifact digest، result، reviewer/decision ref. يبقى implementation داخل `app/Modules/Platform/Release/**` وdedicated schema بعد تحكيم exact design؛ لا يختلق الكاتب أسماء ملفات قبل packet معتمد. `ReleaseReadiness::ready` تعني technical gate فقط؛ WARN لا يجوز أن ينتج READY إذا policy تحكم خلاف ذلك. `PUSH != ACCEPTANCE != MERGE != RELEASE != DEPLOY`.

### G3. Configuration

- operational/security config يبقى read-only whitelist، secret-safe، مع source/effective value/freshness، ولا يظهر `auth_bypass` إذا لم يكن product-relevant.
- تستبدل كلمة «المعتمدة» بـ «القيم الفعالة المرصودة» ما لم توجد provenance لapproval.
- قرار `AUTHORITY_DECISION_REQUIRED`: هل surface يشمل preferences محلية غير حساسة (language/direction/appearance/local behavior)؟ الافتراضي الآمن حتى القرار: لا mutation.
- إذا أجيزت preferences، تكون نطاقًا منفصلًا بحالات `NORMAL/UNSAVED/SAVED/RESTART_REQUIRED`، allowlist، CSRF/auth/audit، ولا تختلط بالoperational config أو الأسرار.

---

## H. Shared W05 Integration / Reserved Ownership

### H1. collision map

| المسار/العقد | سبب التصادم | المالك الوحيد لاحقًا |
|---|---|---|
| `app/Http/Controllers/ReleaseController.php` | يجمع Safe Source + Manual AI + Backup + release/package download | `CEP-SYSOPS-INTEGRATION-CORR-01` فقط بعد admission |
| `routes/workspaces/system-operations.php` | routes للسطوح الثلاثة وcompat `/release` | سلطة التكامل نفسها |
| `app/Modules/Platform/SystemOperations/SystemOperationsState.php` | aggregation لكل الأسطح، observation contract | سلطة التكامل نفسها |
| `app/Modules/Platform/SystemOperations/SystemOperationsController.php` | rendering/cancel/shared request mapping | سلطة التكامل نفسها |
| `resources/js/pages/SystemOperations/Workspace.vue` | TOP actions وsurface composition وBOTTOM | سلطة التكامل نفسها |
| `resources/js/pages/SystemOperations/types.ts` | DTO موحد لكل candidates | سلطة التكامل نفسها |
| `resources/css/app.css`, `resources/js/layouts/CepWorkspaceLayout.vue` | responsive order مشترك لكل workspaces | Parent-reserved shared integration؛ لا lane page patch |
| shared migrations/tables في `2026_07_25_000012_create_v1_integration_release_tables.php` | AIB/Backup/Release/Processing shared schema | integration owner أو migration owner صريح واحد فقط |
| `tests/Feature/SystemOperations*`, `resources/js/tests/SystemOperations*` | cross-lane contract/e2e | integration owner؛ lanes تملك dedicated tests فقط |

### H2. frozen input admission

لا يبدأ integration writer حتى يسلم Parent/Controller النشط لكل lane:

1. اسم remote ref وتحقق readback إلى full SHA 40-char؛
2. commit/tree وتاريخ freeze/قرار reviewed؛
3. exact baseline/merge-base؛
4. `git diff --name-status` path manifest وcollision manifest؛
5. commands، exit statuses، environment versions، PostgreSQL evidence؛
6. migration up/down/preflight report؛
7. visual manifest إذا تغير UI؛
8. known failures و`NOT_RUN_ENVIRONMENT_MISMATCH` مصنفة non-PASS؛
9. تصريح أن bytes لم تعد متحركة.

أي missing item يرفض admission. أي shared-path mutation داخل lane يعاد للتحكيم: إما split/cherry-pick bounded domain bytes فقط، أو Parent يمنح reservation جديدًا؛ لا يدمج integration owner تصادمًا صامتًا.

### H3. baseline selection

لا تختار الخطة `main` أو PR #57 أو أي correction branch تلقائيًا. Parent يحدد لاحقًا **exact shared integration baseline SHA** بعد رؤية frozen inputs. integration branch جديدة—إن منحت—تنشأ من ذلك SHA فقط، ويطبق owner واحد inputs بترتيب معلن: schema/domain adapters أولًا، state/gateway/routes ثانيًا، UI composition ثالثًا، tests/evidence أخيرًا. لا octopus merge ولا multiple writers على branch واحدة.

---

## I. Interaction / Visual / Accessibility Plan

### I1. الأدلة التي فُحصت

| السطح | current exact Dark 1440 على `a83ea389…` | governed reference | 768 المنتقى |
|---|---|---|---|
| Health | Drive `1UyF6Pl6gFROiyAZFTGG5CHdi3KRAkiqT` | `1VKIQyj47KcKl_T2lTUWZUouPVTaMOoGL` | `1-4T5xtgBOzYINbAO1QSH-GPL5Zhve1Xl` |
| Processing | `1yt0J2bM-cD0jimhSoEH8BTBPCKUxmR7f` | لا صورة نهائية مستقلة؛ contract + current source فقط | `15Ogf4XViubbf_q4WzHhU8CBNYPb7-UKJ` |
| Validation | `1DzWcVtU3K_S46H0pMbmCBDQB7_kL4nf0` | `1WNirS-5EPauDOKjG1jL697-PDcvoYSDB` | `1gTX6vlE27hkhMYJRURDsrURJKVbRek1i` |
| Manual AI | `1qeS9U00G06L3m3CMhYd-wmo_mrHVdztl` | `1kfJay0dVRfUvqhkbdj1dMGuNPRr0Ipuj` | انتقائي غير لازم للتشخيص الحالي |
| Backup | `1_p2BfGpx-jnNPBJ8ocngXMyXJ9rQ2gev` | `1X2OSPu7RxdJQ6OFpm68DAcPAvGv5wzgI` | انتقائي غير لازم |
| Audit | `1DUFnp3FiVuUKRaaLvKhciIXY4Blk-b5s` | `1YEnxOYvjRD5BZM3DGJQc7FO7ZePqzXwh` | انتقائي غير لازم |
| Releases | `11BtaqHj5HSskYdLvrxq0nZDMWryyRnah` | `1vk_AGgW3LBAmojUdijO_vWnfLvCdVp9Q` | انتقائي غير لازم |
| Configuration | `1CpDSZouhVabgWWbSbHcPLsP8Gws0WIuB` | `14j2wvRdTpWqb0KL53GT9XgMhQ-iaBZgC` | `1SqFpJNkNs2KIUhnyhqpTowWSdjqDmJCb` |

### I2. الاستنتاجات البصرية الملزمة

- 1440 يثبت shell متسقًا، لكنه يكشف فراغات طويلة وحالات unavailable بلا recovery hierarchy؛ Health يعرض diagnostic raw كثيفًا، والسطوح الفارغة لا تحقق density/next-action المرجعية.
- 768 يثبت CENTER بعد LEFT/RIGHT؛ هذا violation عقدي مشترك وليس defect محليًا لكل صفحة.
- TOP يخلط action حقيقي وrefresh مع labels توحي ببدء فحص؛ يصحح حسب capability.
- RIGHT يكرر policy/status الموجودة في CENTER في بعض الأسطح؛ يبقى فقط context فريد.
- BOTTOM الحالي مغلق افتراضيًا في المصدر والاختبارات؛ يحافظ على ذلك، وتظهر الصورة النهائية له فقط في state مقصودة إضافية لا كdefault.

### I3. candidate evidence الإلزامي لاحقًا

لكل سطح تغير مادي: exact candidate full SHA ظاهر في manifest، Dark 1440 full-page + state-focused crops، وDark ~1024 (لا 768 بديلًا عنها)، مع browser viewport/zoom/font/locale. يضاف 768 فقط إذا تغير breakpoint. يلزم default/empty/unavailable/error/loading/success/disabled/destructive-confirmation حيث ينطبق، وBOTTOM closed + one opened evidence. لا visual PASS قبل مقارنة المرجع المناظر وعقد IA، ولا current screenshot يعاد استخدامه كدليل candidate.

---

## J. Exact Repository Binding / Material Finding Ledger

> Evidence type في كل صف واحد من الأنواع الخمسة المطلوبة فقط. `P0` يمنع candidate freeze، `P1` يمنع product/visual acceptance، و`P2` polish/accessibility مع اختبار إلزامي إذا مس المسار.

| ID | severity | evidence type | observed evidence | root cause | authority basis | exact files | exact symbols/components | implementation change | state/data impact | Bidi impact | desktop/half-desktop impact | dependencies | prohibited shortcuts | tests required | browser/runtime checks | completion criteria |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SYSOPS-OBS-TRUTH-01 | P0 | SOURCE_CONTRACT_VERIFIED | `safe()` يرجع `[]/false` للفشل وعدم الجدول، فتتطابق empty/unavailable/error | fallback غير typed | SYSOPS adjudication + observation rules | `app/Modules/Platform/SystemOperations/SystemOperationsState.php`; `resources/js/pages/SystemOperations/types.ts`; جميع surfaces | `safe`, `rows`, `actorRows`, `statusCounts`, `tableAvailable`, `WorkspaceState` | observation envelope موحد مع timestamps/error/recovery | API/DTO يتغير؛ لا success مصطنع | status codes LTR مع شرح عربي | 1440/1024 حالات منفصلة بلا فراغ غامض | frozen SYSOPS ثم integration | إبقاء `[]` كدليل نجاح؛ catch صامت | unit/feature/frontend matrix لكل 5 حالات | إسقاط DB/table/provider عمدًا وملاحظة UI | لا assertion يساوي empty بالفشل؛ كل surface يعرض recovery |
| W05-RESP-CENTER-01 | P0 | IMAGE_AND_SOURCE_VERIFIED | صور 768 تضع LEFT/RIGHT قبل CENTER؛ CSS يصرح بذلك | grid areas عند 64rem/40rem | Visual contract: CENTER dominant | `resources/css/app.css`; `resources/js/layouts/CepWorkspaceLayout.vue` | media queries `.cep-workspace-grid*`; DOM regions | CENTER أولًا؛ rails drawers/disclosures؛ ترتيب tab مطابق | لا data change | physical placement محفوظ مع RTL وLTR IDs | 1440 ثلاثي؛ ~1024 center-first؛ mobile center-first | Parent shared-layout reservation | per-page `order`/duplicate CSS | layout unit/e2e/a11y tab order | 1440/~1024/768 screenshots + keyboard | CENTER يظهر ويقرأ أولًا بعد TOP بلا فقد rail/context |
| HEALTH-AGG-02 | P0 | SOURCE_CONTRACT_VERIFIED | Health state لا يضم AIB/Backup rows؛ queue truth من counts/foundation فقط | aggregation ناقص وliveness غير معرف | SYSOPS adjudication | `SystemOperationsState.php`; `HealthSurface.vue`; `HealthContext.vue` | `healthState`, `subsystems`, `inspectorDetails` | typed projections لكل subsystem + heartbeat/freshness | health DTO أوسع؛ unavailable fail-closed | mixed labels isolated | cards compact مع next action | frozen SYSOPS/AIB/BACKUP via integration | queue table=worker alive؛ missing=healthy | feature/provider fault tests | stop worker, stale heartbeat, missing table | aggregate لا يقول healthy إذا أي required check unavailable/error/stale |
| HEALTH-ACTION-03 | P1 | IMAGE_AND_SOURCE_VERIFIED | «تشغيل فحص» و«إعادة المحاولة» كلاهما `router.reload`; copy يضمن المراقبة | labels غير مرتبطة capability | truthfulness + TOP ownership | `Workspace.vue`; Health backend route owner TBD after freeze | `refreshSurface`, health TOP template | rename refresh أو durable check-run route؛ retry record-specific | قد يضاف check_run lifecycle | لا أثر خاص | TOP واضح في 1440/~1024 | SYSOPS + integration route | تغيير النص مع الإبقاء على claim؛ fake toast | feature + frontend action tests | network request/status/reload evidence | كل label يطابق request/side effect durable |
| SYSOPS-PROC-CANCEL-01 | P0 | SOURCE_CONTRACT_VERIFIED | controller يسجل cancelled لكن job يكمل إلا إذا completed | worker لا يفحص cancel/lease قبل completion | SYSOPS adjudication | `SystemOperationsController.php`; `FoundationSmokeJob.php`; `ProcessingRun.php` | `cancelProcessingRun`, `handle`, `transitionTo` | cancel_requested/worker checkpoints/atomic transition؛ terminal guard | lifecycle + audit attempt | status LTR | actionable states واضحة | SYSOPS domain | DB update فقط؛ السماح cancelled→completed | concurrency/integration/job tests | worker paused أثناء cancel ثم resume | لا side effect/completion بعد cancel؛ audit يثبت النتيجة |
| SYSOPS-PROC-RETRY-02 | P0 | SOURCE_CONTRACT_VERIFIED | `$tries=3` لكن attempt يزيد فقط عند pending→running | attempt model يساوي state transition لا execution attempt | SYSOPS adjudication | `FoundationSmokeJob.php`; `ProcessingRun.php`; migrations الخاصة | `$tries`, `$backoff`, `handle`, `transitionTo` | append-only attempt records أو atomic attempt_no لكل claim؛ retry_wait/timeouts | schema/history/idempotency | attempts LTR | details في BOTTOM لا CENTER raw | SYSOPS frozen input | زيادة رقم client-side؛ overwrite failure | retry/backoff/max/timeout tests | induce transient failure then success | UI/DB/audit تتفق على عدد المحاولات وتمنع duplicate effect |
| SYSOPS-PROC-PIPELINE-03 | P0 | SOURCE_CONTRACT_VERIFIED | SafeSourceImport ينتهي إلى source row؛ لا end-to-end Processing/Validation engine | orchestration/correlation مفقود | SYSOPS adjudication + IA | `SafeSourceImportService.php`; `ProcessingRun.php`; SystemOperations state/routes | `import`, ProcessingRun creation/orchestration | preserve safe ingest؛ dispatch durable pipeline مع correlation/idempotency | links SourceImport→run→result | IDs LTR | progress trace center | SYSOPS candidate + integration gateway | bypass SafeSourceImport؛ synchronous mega-request | feature/integration/outbox/idempotency | import real fixtures، worker، failure/retry | trace واحد يغطي ingest حتى technical result بلا knowledge verdict |
| SYSOPS-VALIDATE-01 | P0 | SOURCE_CONTRACT_VERIFIED | surface يسمي schema/integrity لكن المصدر يثبت type/signature import فقط | لا executable validation engine/result model | adjudication + Validation boundary | `SafeSourceImportService.php`; `ValidationSurface.vue`; `SystemOperationsState.php` | `import`, `submitSource`, `validationState` | engine bounded + result lifecycle أو narrow copy حتى وجوده | validation result/error/schema fields | paths/codes LTR | loading/result/error states | SYSOPS frozen input | اعتبار import accepted تحققًا شاملًا | schema fixtures/unit/feature/frontend | malformed JSON/schema/signature | claim لا يتجاوز check الفعلي؛ result قابل للتتبع |
| SYSOPS-VALIDATE-COUNT-02 | P0 | SOURCE_CONTRACT_VERIFIED | UI يجمع `exported + valid` تحت «المقبولة» | خلط package transport بالvalidation | adjudication | `ValidationSurface.vue`; `HealthSurface.vue` | `validation-count-accepted`, package exported badges | accepted من technical validation result فقط؛ exported label مستقل | count semantics تتغير | status LTR | badges أوضح | SYSOPS | rename بلا تغيير الحساب | frontend count matrix + feature DTO | fixtures exported/valid/rejected | exported لا يزيد accepted في أي سطح |
| AIB-TRANSPORT-01 | P0 | IMAGE_AND_SOURCE_VERIFIED | UI `accept=.json` وJSON Package؛ backend `mimes:zip` وSafePackage | contract drift | AIB adjudication | `AiBridgeSurface.vue`; `ReleaseController.php`; `ManualAiBridgeService.php` | `aiImportForm`, `importAiResult`, `importResult` | ZIP labels/accept/error؛ raw JSON reject | لا schema جديد بحد ذاته | filename LTR | form واضح 1440/~1024 | AIB + integration controller | تحويل backend إلى raw JSON؛ frontend parse | frontend accept + feature SafePackage | ZIP صحيح، raw JSON، malformed ZIP | UI/network/backend يتفقون على ZIP فقط |
| AIB-PROVENANCE-02 | P0 | SOURCE_CONTRACT_VERIFIED | current scope يربط prompt/input digest لكن لا selected source revision/digest/anchor | provenance غير مكتمل | AIB correction instruction | `ManualAiBridgeService.php`; AIB models/migrations/tests | `exportPrompt`, `importResult`, prompt/result records | persist/verify canonical source provenance fail-closed | dedicated immutable fields/records + migration preflight | IDs/digests LTR | provenance summary CENTER والتفاصيل BOTTOM | exact frozen AIB + source capability | defaults fabricated؛ mutable pointer فقط | provenance/actor/duplicate/migration tests | export then mutate source; import must bind old revision | لا export/import/decision بلا exact provenance |
| AIB-LIFECYCLE-03 | P0 | SOURCE_CONTRACT_VERIFIED | current `exported/result_imported/pending_review/accepted` وقرار package-level ACCEPT_AS_DRAFT/REJECT فقط | lifecycle/proposal granularity مختصر | AIB adjudication | `ManualAiBridgeService.php`; AIB models; `AiBridgeSurface.vue` | `exportPrompt`, `importResult`, `decide`, decision UI | states E3 + proposal decisions append-only + partial/finality/supersession | schema/data migration؛ draft-only acceptance | action/status LTR | long payload BOTTOM، controls near proposal | frozen AIB; integration DTO/routes | overwrite decision؛ auto publish؛ final decision mutation | DEFER→ACCEPT, edit, duplicate IDs, finality, actor isolation | multi-proposal package browser flow | aggregate يطابق decisions؛ history لا يفقد؛ لا canonical publish |
| BACKUP-TRUTH-01 | P0 | IMAGE_AND_SOURCE_VERIFIED | UI يقول backups مشفرة؛ manifest يقول `NOT_IMPLEMENTED_LOCAL_V1` | hash/signature سميت encryption | Backup adjudication | `Workspace.vue`; `BackupsSurface.vue`; `BackupsContext.vue`; `BackupService.php` | backup subtitles/lede/context; `scope.encryption` | truthful unencrypted V1 wording + visible protection status | expose encryption_state | status LTR | warning non-alarmist | frozen BACKUP + integration copy | إخفاء field؛ تسمية digest encryption | frontend/feature manifest tests | create/download inspect package | لا كلمة encrypted إلا إذا runtime cryptography مثبتة |
| BACKUP-STAGE-02 | P0 | IMAGE_AND_SOURCE_VERIFIED | web stage يمرآة/يسجل، UI يقول تجهيز واختبار DB منفصلة | stage وisolated apply مدموجان لغويًا | Backup adjudication | `BackupService.php`; `RestoreApplyCommand.php`; `BackupsSurface.vue` | `stage`, `applyToIsolatedDatabase`, `stageRestore` | lifecycle F2؛ web stage verify-only؛ CLI drill evidence/compare | restore states/provenance | DB names LTR | stepper واضح | frozen BACKUP + integration state | web activation؛ claim test عند stage | PostgreSQL stage/apply/compare/actor tests | web request ثم CLI `_restore_drill` | stage لا يعرض applied؛ drill فقط في DB معزولة؛ لا activation route |
| BACKUP-FAILURE-03 | P0 | RUNTIME_VERIFICATION_REQUIRED | current create/stage لا يسجل durable failed attempt قبل risky work؛ compensation truth غير ممثلة | success-oriented records ولا journal pre-state | Backup correction instruction | `BackupService.php`; Backup models/migrations/tests | `create`, `stage`, `applyToIsolatedDatabase` | durable attempts + original exception + blob journal + explicit compensation status | new failure/compensation records; down preflight | error codes LTR | recovery actions بلا stack/secrets | frozen BACKUP | catch يحجب الأصل؛ message heuristics؛ delete failure evidence | fault injection every phase, rollback/reapply | filesystem/blob/DB failures في PostgreSQL/container | failure يبقى قابلًا للتدقيق؛ rollback_failed فقط بفشل مثبت |
| AUDIT-TRUTH-01 | P0 | IMAGE_AND_SOURCE_VERIFIED | UI يدعي غير قابل للتعديل/نزاهة تامة/تجزئة مشفرة؛ enforcement Eloquent فقط + hash | overclaim | SYSOPS adjudication | `AuditRecord.php`; `AuditWriter.php`; `AuditChainVerifier.php`; Audit UI/context | Eloquent hooks, `verify`, copy | narrow claim؛ DB immutability فقط إذا نفذت واختبرت | لا data change أو DB constraint منفصل | hashes LTR | compact trust explanation | SYSOPS | CSS/copy يخفي limitation؛ تسمية hash تشفير | direct DB tamper + ORM mutation + frontend copy | SQL update test, verifier first invalid | wording مطابق enforcement، tamper يظهر لا يمنع ادعاءً |
| AUDIT-OBS-HISTORY-02 | P1 | SOURCE_CONTRACT_VERIFIED | state catch يمكن أن يعطي valid=false/count=0 بلا error؛ latest 50 فقط؛ first invalid مسقط | observation/pagination ناقص | SYSOPS adjudication | `SystemOperationsState.php`; `AuditSurface.vue`; `AuditContext.vue` | `auditState`, `verify`, records query | observation envelope؛ first invalid؛ server pagination/filters | query DTO/cursors | codes/IDs LTR | table usable 1440/~1024 | SYSOPS + integration query | client-only filter لأحدث 50 | feature pagination/filter/error/frontend | >50 rows، verifier error، invalid at N | user يميز empty/error ويصل للتاريخ ويشاهد first invalid |
| RELEASE-EVIDENCE-01 | P0 | SOURCE_CONTRACT_VERIFIED | release surface يسمي كل actor portable_packages أدلة إصدار؛ لا release candidate binding | catalog عام استخدم كevidence model | SYSOPS adjudication | `ReleaseReadiness.php`; `SystemOperationsState.php`; `ReleasesSurface.vue`; `ReleaseController.php`; release module/migrations | `releaseState`, `evaluate`, package list | candidate-bound evidence + policy statuses + separate Owner/deploy authority | schema/bindings/decision refs | SHA/status LTR | checklist + evidence hierarchy | SYSOPS frozen + integration | type string وحده؛ actor scope وحده؛ READY=Owner accepted | feature/integration/policy/frontend | candidate A/B package isolation, WARN/FAIL rules | كل evidence يربط exact SHA/tree؛ technical ready لا يمنح authorization |
| CONFIG-AUTH-01 | P1 | AUTHORITY_DECISION_REQUIRED | snapshot surface read-only؛ correction authority يقترح bounded preferences مع states | scope Configuration غير محسوم بين operational view وuser settings | IA + SYSOPS adjudication | `ConfigurationSurface.vue`; `ConfigurationContext.vue`; `SystemOperationsState.php`; `config/platform.php` | `configurationState`, policy/cards | افتراضي read-only؛ قرار منفصل قبل preferences؛ truth copy/source | ربما preference store بعد القرار | locale/direction يتطلب Bidi QA | responsive settings form إن أجيز | Parent/W05 controller decision | إضافة mutation ضمنًا؛ عرض secrets؛ «معتمد» بلا provenance | feature secret/redaction/method tests؛ UI state tests إن أجيز | inspect HTML/network/logs for secrets | لا mutation قبل القرار؛ operational config secret-safe دائمًا |
| SHARED-COLLISION-01 | P0 | SOURCE_CONTRACT_VERIFIED | ReleaseController/routes/state/types/workspace تجمع lanes | shared composition مركزية | Current State collision law | مسارات H1 | shared symbols المذكورة | owner واحد بعد frozen admission؛ serialize composition | DTO/routes/migrations تتقارب مرة واحدة | cross-surface Bidi | cross-surface 1440/~1024 | Parent baseline decision | عدة writers؛ silent conflict resolution؛ cherry-pick shared files بلا review | collision manifest + full targeted suites | route matrix + remote SHA readback | صفر unadjudicated overlap؛ exact integrated SHA قابل لإعادة البناء |
| W05-VIS-DENSITY-01 | P1 | IMAGE_VERIFIED | 1440 current: raw diagnostic طويل/فراغات كبيرة/next action ضعيف مقابل المراجع | hierarchy لا تتكيف مع observation state | Visual contract/register | eight surface components + contexts؛ shared layout فقط عبر H1 | empty/error/detail cards | compact summary + recovery; heavy JSON BOTTOM | presentation فقط مع typed state | Arabic-first; IDs LTR | 1440 density و~1024 center dominance | domain candidates + integration | نسخ المرجع حرفيًا؛ data duplication لملء الفراغ | frontend snapshots/a11y | candidate screenshot matrix | المهمة/الحالة/الفعل الأول واضح؛ لا duplicate RIGHT |

### J2. ترتيب تنفيذ findings داخل candidates

1. truth/state/schema قبل copy/visual؛
2. domain lifecycle واختبارات failure/migration؛
3. frozen input review؛
4. shared DTO/routes/state/controller composition بمالك واحد؛
5. visual/accessibility polish على integrated candidate؛
6. runtime/browser/evidence ثم rereview.  
لا يقبل patch بصري يخفي missing lifecycle، ولا backend lifecycle بلا UI state/error/recovery contract.

---

## K. Writer / Reviewer / Assurance Topology

هذه topology **مقترحة للتحكيم فقط**؛ لا تطلق writer أو reviewer. الأولوية استهلاك نفس-lineage outputs لـ R22/R18/R30 بعد freeze بدل إنشاء writers بديلة.

### K1. Packet `W05-SYSOPS-DOMAIN`

`objective` — معالجة Health/Processing/Validation/Audit/Releases/Configuration domain truth وفق D/G/J، أو تصحيح same-lineage candidate إذا فشل review.  
`exact baseline dependency` — exact SYSOPS baseline وcandidate SHA يوردهما controller؛ لا branch متحرك.  
`writeScope` — `app/Modules/Platform/{Health,Processing,Audit,Release}/**`, bounded SourceGovernance orchestration، SYSOPS-specific frontend components عدا shared composition، dedicated migrations/tests.  
`prohibitedScope` — AIB/Backup internals، `ReleaseController.php`, shared routes/state/controller/workspace/types/layout/CSS/shared migration، W01–W04.  
`validation` — observation, cancellation/retry/pipeline, validation, audit, release/config suites؛ PostgreSQL migration up/down.  
`evidence` — full SHA/tree/path manifest/commands/exits/runtime and UI screenshots للسطوح المتغيرة؛ expected changed paths ضمن writeScope فقط.  
`handoff` — frozen reviewed candidate إلى admission H2، لا merge.  
`Stop Gate` — `W05_SYSOPS_DOMAIN_CANDIDATE_RETURNED__NO_SHARED_PATHS__NO_INTEGRATION__NO_ACCEPTANCE__NO_MERGE__NO_RELEASE__NO_DEPLOY`.

### K2. Packet `W05-AIB-DOMAIN`

`objective` — E كامل: ZIP SafePackage، selected-source provenance، lifecycle/decisions append-only.  
`exact baseline dependency` — exact reviewed PR #57 ancestor + exact same-lineage AIB SHA supplied; no moving R18 ref.  
`writeScope` — `app/Modules/ManualAiBridge/**`, AIB-specific migrations/tests، `components/ai-bridge/**`.  
`prohibitedScope` — shared H1، Release/Backup/SYSOPS internals، publish/provider calls.  
`validation` — raw JSON rejection، ZIP/schema، actor isolation، duplicate IDs، provenance mutation، DEFER→ACCEPT، EDIT، finality، rollback/reapply.  
`evidence` — source/test/runtime manifest؛ current-vs-candidate 1440/~1024؛ expected paths داخل scope.  
`handoff` — exact frozen reviewed AIB SHA + adapter requirements فقط.  
`Stop Gate` — `W05_AIB_DOMAIN_CANDIDATE_RETURNED__MANUAL_ONLY__NO_SHARED_PATHS__NO_INTEGRATION__NO_ACCEPTANCE__NO_MERGE__NO_RELEASE__NO_DEPLOY`.

### K3. Packet `W05-BACKUP-DOMAIN`

`objective` — F كامل: durable attempts/failure truth/compensation/stage/drill/compare.  
`exact baseline dependency` — exact same-lineage BACKUP SHA supplied؛ PostgreSQL 8.5-compatible environment.  
`writeScope` — `app/Modules/Platform/Backup/**`, backup/restore commands، dedicated migrations/tests، `components/backups/**`.  
`prohibitedScope` — shared H1، HTTP activation، AIB/SYSOPS internals، helper artifacts خارج repo policy.  
`validation` — failure injection، original exception preservation، rollback status، actor isolation، stage vs CLI drill، blob pre-state، migration preflight/down/reapply.  
`evidence` — full SHA/path/tests/container/PostgreSQL/browser + 1440/~1024؛ expected paths ضمن scope.  
`handoff` — frozen reviewed SHA + explicit gateway/state adapter.  
`Stop Gate` — `W05_BACKUP_DOMAIN_CANDIDATE_RETURNED__NO_WEB_ACTIVATION__NO_SHARED_PATHS__NO_INTEGRATION__NO_ACCEPTANCE__NO_MERGE__NO_RELEASE__NO_DEPLOY`.

### K4. Packet `CEP-SYSOPS-INTEGRATION-CORR-01` — المالك المحجوز الوحيد

`objective` — تركيب exact frozen reviewed SYSOPS/AIB/BACKUP inputs على baseline اختاره Parent، وحل H1، ثم إنتاج integrated candidate واحد.  
`exact baseline dependency` — Parent-issued baseline full SHA + ثلاث admission records مكتملة.  
`writeScope` — H1 حصريًا، adapters اللازمة، cross-lane tests/evidence؛ أي shared migration بتفويض صريح.  
`prohibitedScope` — إعادة كتابة domain internals المقبولة، امتلاك أكثر من branch writer، اختيار baseline ذاتيًا، merge/release/deploy.  
`validation` — collision-free composition، route/DTO/state matrix، full focused suites، migrations، runtime، visual/accessibility.  
`evidence` — exact integrated SHA/tree، source-input map، conflict decisions، commands/exits، Dark 1440+~1024 لكل سطح مادي، remote publication readback إن سمح لاحقًا.  
`handoff` — integrated candidate إلى Controller W05 النشط وParent للتحكيم/risk reviews.  
`Stop Gate` — `W05_SHARED_INTEGRATION_CANDIDATE_RETURNED_FOR_REVIEW__NO_ACCEPTANCE__NO_MERGE__NO_RELEASE__NO_DEPLOY`.

### K5. Assurance مستقل محفز بالمخاطر

- lifecycle/security reviewer لـ AIB/Backup بعد candidate فقط؛
- PostgreSQL migration/compensation reviewer عند أي schema/destructive down؛
- runtime/queue concurrency reviewer لـ cancellation/retry/heartbeat؛
- Arabic/Bidi/accessibility/visual reviewer على integrated exact SHA؛
- release-evidence/authority reviewer إذا أضيف model أو تغير READY policy.  
الreview outputs evidence فقط؛ لا reviewer يكتب في candidate ولا يمنح acceptance.

---

## L. Runtime / Tests / Browser / Candidate Evidence + Risks / Unknowns / Decisions

### L1. أوامر إثبات لاحقة على exact candidate

تسجل الأوامر كما نفذت مع versions وexit codes؛ أمثلة binding للمستودع:

```bash
php --version                         # يجب أن يكون PHP 8.5.x
php artisan about
php artisan migrate:status
php vendor/bin/phpunit --testsuite=Unit,Feature --fail-on-empty-test-suite
php vendor/bin/phpunit --testsuite=Integration --fail-on-empty-test-suite
php vendor/bin/phpunit --testsuite=Architecture --fail-on-empty-test-suite
php vendor/bin/phpunit --testsuite="Repository Safety" --fail-on-empty-test-suite
npm run lint
npm run format:check
npm run typecheck
npm test -- resources/js/tests/SystemOperationsWorkspace.spec.ts resources/js/tests/SystemOperationsSurfaces.spec.ts
npm run build
composer analyse
composer security
```

Focused execution must include current and new tests: `SystemOperationsCompletionTest`, `SystemOperationsWorkspaceTest`, `AuditIntegrityTest`, `ManualAiBridgeTest`, `BackupRestoreTest`، وdedicated lifecycle/migration tests. `composer quality` مطلوب قبل freeze إذا البيئة تدعمه؛ الإخفاق أو skip لا يعاد تصنيفه PASS.

### L2. PostgreSQL/migration/runtime matrix

- clean DB `migrate:fresh`، seeded upgrade من schema السابقة، `migrate:rollback` مع preflight، ثم reapply؛ hashes/counts/provenance مقارنة.
- worker حقيقي database queue: transient failure→retry، cancel أثناء paused job، timeout/heartbeat stale، outbox idempotency.
- AIB SafePackage: valid ZIP، raw JSON، malformed archive، wrong actor، source revision changed، duplicate proposal IDs، same digest idempotency.
- Backup: create failure بكل phase، blob write/restore/compensation failures، stage-only web، CLI `_restore_drill` apply/compare، target name refusal، non-PostgreSQL refusal.
- Audit: direct SQL tamper detection، ORM mutation block، first invalid propagation، >50 pagination/filter.
- Release: evidence from candidate A cannot satisfy B، WARN/FAIL policy، Owner authorization absent، deployment route absent.

### L3. Browser/request/console checks

- Auth redirect لكل routes الثمانية؛ actor isolation؛ CSRF/throttle؛ safe validation errors.
- Network panel يثبت health refresh مقابل check-run، AIB ZIP multipart، stage-only Backup، وعدم وجود provider/web activation/deploy calls.
- console صفر uncaught errors/warnings المادية؛ no secret in DOM, props, network, logs, downloaded evidence.
- keyboard-only: skip link، TOP، CENTER first، rail/context toggles، tables، dialogs، BOTTOM open/close/focus return.
- Arabic 1440/~1024: no clipping/overlap، LTR isolation، center dominance؛ prefers-reduced-motion و200% zoom.

### L4. candidate publication/readback/rereview gate

إذا منح publication لاحقًا: يقرأ controller remote ref مباشرة ويطابق SHA كاملًا، tree، changed paths، commit parents، evidence digests. يعاد تشغيل focused review على **remote SHA**؛ local success أو push success ليس acceptance. لا PR/merge قبل هذا readback والرereview.

### L5. المخاطر والunknowns والقرارات

| النوع | البند | المعالجة/صاحب القرار |
|---|---|---|
| Runtime unknown | bytes والنتائج الفعلية لـ R22/R18/R30 غير admissible حتى frozen review | H2؛ لا تخمين |
| Evidence gap | raw IPA target files تعيد 404 | لا تستخدم؛ Controller قد يعيد مشاركة exact files إن احتاج، ولا يحجب direct findings |
| Runtime unknown | worker liveness/heartbeat والبنية الفعلية للqueue في candidate | runtime probe + SYSOPS review |
| Runtime unknown | failure compensation تحت blob/DB faults | BACKUP fault injection |
| Authority decision | editable local preferences داخل Configuration أم read-only فقط | W05 controller + Parent؛ default no mutation |
| Authority decision | shared integration baseline exact SHA | Parent فقط بعد inputs |
| Authority decision | DB-level audit immutability مطلوب أم truthful app-level contract كافٍ | Controller/Parent؛ لا claim قبل proof |
| Model decision | candidate-bound Release evidence schema/policy | SYSOPS design review ثم Parent adjudication |
| Routing discrepancy | schema/Stop Gate يسمي Controller C؛ Current State الأحدث يملك W05 لـ Controller E وC لـ W03 | احفظ Stop Gate حرفيًا، لكن Parent يوجه الناتج إلى Controller E النشط؛ الاسم لا ينقل السلطة |

`NOT_RUN_ENVIRONMENT_MISMATCH`, timeout، missing dependency، unavailable browser، أو screenshot غير مربوط بـ SHA = **ليس PASS**.

---

## M. Composition / Convergence / Freeze / Controller Handoff

### M1. progression الإلزامي

1. **Planning adjudication:** Parent + Controller W05 النشط يقبلان/يعدلان هذه الخطة؛ لا implementation acceptance.
2. **Terminal evidence review:** فحص exact outputs الحالية لـ SYSOPS/AIB/BACKUP؛ تحديد same-lineage correction إن لزم.
3. **Domain freeze:** لكل lane full SHA/tree/path/test/migration/visual evidence وindependent risk review؛ frozen قرار صريح، لا provider status.
4. **Input admission:** تطبيق H2، ورفض shared overlap غير المحكّم.
5. **Baseline selection:** Parent يصدر exact shared baseline SHA وowner reservation؛ لا اختيار ضمني.
6. **Single-owner composition:** تطبيق domain inputs/adapters/shared routes/state/controller/workspace/types بترتيب معلن، مع سجل conflict decisions.
7. **Integrated validation:** targeted + full relevant suites، PostgreSQL، queue/browser/accessibility، candidate-bound 1440/~1024.
8. **Controller review:** review على exact integrated SHA، ثم risk-triggered rereviews؛ visual وruntime قرارات منفصلة.
9. **Remote publication فقط إذا منحت:** push/PR authority منفصلة؛ full-SHA readback ثم post-publication rereview.
10. **Freeze recommendation:** تتطلب صفر P0/P1 مفتوح، صفر unadjudicated collision، migrations reversible/preflight، evidence كاملة، authority decisions مغلقة. التوصية ليست merge/release/deploy.

### M2. convergence invariants

- كل input exact، frozen، reviewed، remote-readable؛
- writer واحد لكل write domain وintegration owner واحد؛
- `ReleaseController.php` وH1 لا يملكها أي lane domain؛
- observation truth وAIB provenance وBackup failure evidence لا تضيع أثناء composition؛
- Processing cancellation/retry/pipeline واختبارات concurrency مثبتة؛
- Release technical readiness لا يمنح Owner/deployment authority؛
- CENTER dominant عند ~1024، BOTTOM مغلق افتراضيًا، Arabic/Bidi/accessibility مثبتة؛
- current planning SHA يبقى provenance، لا يعاد تسميته baseline accepted؛
- لا final acceptance من plan أو provider output أو screenshot وحده.

### M3. handoff

الوثيقة تعاد إلى Parent وإلى مالك W05 النشط وفق Current State. حفاظًا على schema/Owner start message، يبقى Stop Gate المطلوب حرفيًا أدناه؛ لكن `Controller C` في النص legacy routing label ولا يتجاوز التعيين الأحدث: Controller E لـ W05 وController C لـ W03. على Parent تصحيح routing عند adjudication بدل افتراض نقل السلطة.

### M4. Required final planning Stop Gate

`W05_WORK_MASTER_PLANNING_OUTPUT_RETURNED_TO_CONTROLLER_C_AND_PARENT_FOR_ADJUDICATION__NO_IMPLEMENTATION_ACCEPTANCE__NO_VISUAL_ACCEPTANCE__NO_SHARED_INTEGRATION__NO_MERGE__NO_RELEASE__NO_DEPLOY`

