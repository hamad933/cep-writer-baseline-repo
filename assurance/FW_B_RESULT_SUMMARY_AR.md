# FW-B Structured Selection — ملخص التصحيح المحدود

تم تصحيح Candidate Lane B الحالي مباشرةً دون الرجوع إلى E06.

- قاعدة التصحيح: `CEP_FOUNDATION_FORGE_v0.2.1c_FW_B_STRUCTURED_SELECTION_KERNEL_CANDIDATE.zip`.
- SHA-256 للقاعدة: `97b77faa4f769192c6f9dbfdcda2860506836f34cd77f4d9bdcd908354e62176`.
- العيب المثبت: إصلاح Top-level Selection بعد حذف endpoint كان يترك `range.anchorBlockId` أو `range.focusBlockId` قديمًا، ثم قد يؤدي Bookmark projection إلى مسح Selection صالح.
- الإصلاح: توحيد إصلاح Top-level وNested range metadata، مع إعادة بناء `rawBlockIds` و`direction` من الهوية المتبقية الصالحة، وإصلاح stale bookmark projection بدل إسقاط كامل Selection.
- Canonical source SHA-256 بعد التصحيح: `7a66cf34bda230208d6e79fa88250403dcb56b93fb4867cb310c973b431c4a5b`.
- Model: `117/117 PASS`.
- Contracts: `151/151 PASS`.
- Full Browser: `6/6 PASS`.
- Targeted Golden: `G02/G05/G06/G09/G12/G13/G17/G23 = 8/8 PASS`.
- Library + Learn correction proof: `PASS`.
- Ownership gates: `15/15 PASS`.
- Central modification/revert: `PASS`.

لم يتم تنفيذ Clipboard أو Structured keyboard أو Renderer أو Drag & Drop أو Workspace أو Spatial، ولم يتم تحديث `CURRENT_CONTROL` أو إجراء Self-promotion.
