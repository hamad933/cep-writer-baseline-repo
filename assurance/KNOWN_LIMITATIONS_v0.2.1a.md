# Known limitations — v0.2.1a

هذا المرشح هو Foundation review-hardening محدود، وليس إصدار Product نهائيًا.

- `STACK_NOT_FROZEN`: لم تُعتمد تقنية Product نهائية، ولم يُستخدم الـProduction stack التاريخي كسلطة تنفيذ.
- `NOT_OWNER_ACCEPTED` و`NOT_FROZEN`: النجاح الآلي لا يساوي قبول المالك أو التجميد.
- بقيت العناصر العشرة عالية القيمة مؤجلة: cross-family `NotesCore`، و`OperationalSurfaceAttachmentController`، و`SessionShelf`، و`LayoutProfileManager`، و`AnalyticalWorkbenchCore`، وReview/Audit family engine، و`GuidanceSupportUI`، وEpistemic/claim/evidence common contract، وexternal `RuntimeAdapter` providers، وfull 23-Surface semantic adjudication.
- Structured clipboard هو seam منظم محدود: اختيار fragment من blocks، و`COPY/CUT/PASTE`، والتحقق من read-only/schema، والـcanonical mutation/undo. ليس rich-editor clipboard framework كاملًا.
- `ActionAvailability@1.2.0` يثبت policy seam عام عبر actions تمثيلية؛ لا يدّعي تنفيذ كل action مستقبلي.
- تدقيق W03 الدلالي استخدم الـ318 Atom المجمعة الموجودة فقط؛ لم يُعد archaeology تاريخي ولم يُعد atomization. بقي `SEMANTIC_ADJUDICATION_PARTIAL`، وW03 v3.4 يبقى value/domain/requirement/evidence donor فقط.
- Browser conformance يقتصر على ستة flows حرجة في Headless Chromium، وليس browser/device matrix شاملًا.
- `playwright@1.62.1` مثبت في `package.json` و`package-lock.json`. في بيئة التصحيح الحالية لم تكن tarballs الخاصة بـ`playwright-core` موجودة في npm offline cache؛ لذلك استُخدم override صريح لموديول Playwright وChromium محلي. كما فرض Chromium المُدار حظر URL إداريًا، فاستُخدم `CEP_BROWSER_TRANSPORT=in-memory` لتنفيذ نفس build ESM دون تغيير application source.
- لم يُنفذ أي external runtime حقيقي، ولم تُضف PTY/PowerShell/WSL semantics إلى `InternalSimulationAdapter`.
