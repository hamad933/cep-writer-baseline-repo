# GOLDEN LIBRARY VISUAL / INTERACTION PARITY MATRIX

**المشروع:** Cybersecurity Education Platform — CEP  
**الدور:** Writer R3 — Golden Library Browser / Visual / Interaction Auditor  
**الوضع:** `READ_ONLY_EXECUTABLE_BROWSER_ASSURANCE`  
**النتيجة:** `23/23 PASS` على الـ Golden donor المقبول، مع عدم تعديل الـ Foundation أو Writer A candidate.

## 1. الحكم التنفيذي

تم إنشاء مرجع Golden قابل لإعادة التشغيل لسلوك Library المقبول، وليس مرجع صور فقط. المرجع الحالي يثبت عبر Chromium حقيقي أن القيمة التي يجب الحفاظ عليها أو تحسينها تشمل: التحرير الفعلي، هوية الكتل، التحديد الفردي والمتعدد، الإدراج، الحذف البنيوي الآمن، إعادة الترتيب، Drag & Drop مع feedback قبل الإسقاط، الحافظة والقص الذري، اللصق المنسق الآمن، Undo / Redo، مزامنة Context، اللوحات، Focus Mode، RTL/LTR، الاختصارات، focus trapping، الحالات الفارغة، ومسار الفشل الآمن للحافظة.

هذا التقرير **لا يقبل** الـ Foundation الحالي ولا Writer A candidate. وظيفته أن يجعل أي Extraction لاحق قابلًا للرفض موضوعيًا إذا فقد سلوكًا مقبولًا أو جودة عملية، ما لم توجد Owner correction أحدث تُبدّل السلوك صراحةً.

## 2. السلطة والهوية

- الـ Golden donor: `CEP_LIBRARY_EDITOR_EXECUTABLE_BLUEPRINT_v1.2.17_ACCEPTED_DESIGN_REFERENCE.html`.
- الحجم: `672,893` bytes.
- SHA-256: `ea66b58ef122bf2f8ca23fd0aa9e461b07da11ea7390c451902e4b1592d396fd` — **مطابق للهوية المقبولة**.
- دوره السلطوي: `ACCEPTED_EXECUTABLE_DESIGN_DONOR` ضمن نطاقه المتوافق؛ وهو ليس `universal domain runtime` ولا `stack authority` ولا `final shell authority`.
- الـ Foundation baseline الذي بقي للقراءة فقط: `CEP_FOUNDATION_FORGE_v0.2.1c_CONTROLLER_SUCCESSION_READY_CANDIDATE.zip`، SHA-256 `b7af640ff6da4a6beb9339f44d936bfa8a21cccca3fc7dc242ee9c89da6927d7`.
- نجاح Browser الحالي للـ Foundation (`6/6`) يُعامل كدليل خاص بذلك الـ baseline، وليس بديلًا عن Golden UX parity للـ Library donor.

## 3. طريقة التنفيذ في المتصفح

- المحرك: system Chromium `144.0.7559.96` عبر Python Playwright.
- الـ accepted viewport الأساسي: `1440×1000`.
- التشغيل Headless، لكنه تشغيل Chromium كامل مع DOM، events، focus، keyboard، pointer، clipboard events، layout و screenshots؛ وليس تحليل HTML ثابتًا.
- بيئة التشغيل منعت التنقل المباشر عبر `file://` و localhost؛ لذلك شُغلت **نفس bytes** للملف self-contained داخل Chromium عبر `page.set_content`. هذا يطابق فئة `in-memory transport` المستخدمة في أدلة Controller الحالية، ولا يغيّر المصدر.
- لم تُجرَ أي كتابة داخل Foundation أو Surface أو Writer A candidate.

## 4. قوانين Golden التي تصبح بوابات قبول

- **GL-01:** At accepted desktop 1440×1000, preserve or improve the usable three-pane Library composition, document readability, context reachability, and bottom-shelf access; pixel identity is not required when a current Owner correction deliberately supersedes presentation.
- **GL-02:** Read mode is non-editable; Edit mode exposes real content editing. A typed change must commit to working state/history and drive truthful save status.
- **GL-03:** Single block selection drives block context; multi-select is stateful, count-aware, command-aware, and Escape-unwindable.
- **GL-04:** Insertion targets exact structural gaps; deletion respects subtree risk; reorder and drag/drop operate on canonical block identity/nesting and are undoable.
- **GL-05:** Clipboard claims must match browser clipboard evidence. Cut is atomic: clipboard success first, deletion second; clipboard failure must never delete content.
- **GL-06:** Rich paste crosses a sanitizer trust boundary: unsupported/dangerous markup is removed, safe portable markup is retained, and the result participates in history.
- **GL-07:** Keyboard users get equivalent command access: Ctrl+K, / search, F6 region cycling, Shift+F10 block menu, modal focus containment, deterministic Escape and focus return.
- **GL-08:** Pane collapse changes both layout and accessibility exposure; separators support keyboard resize; Focus Mode round-trips prior presentation state.
- **GL-09:** Bidi is block-aware: Arabic-first auto resolves RTL, English-first auto resolves LTR, technical code stays LTR, and explicit direction override is undoable.
- **GL-10:** Structure tree, center editor, right context and bottom deep-work shelf remain synchronized to one active knowledge/document state.
- **GL-11:** Empty and failure states are explicit and recoverable. Hidden diagnostic StateLab simulations are not Golden product UX and cannot be used as production error/loading proof.
- **GL-12:** Responsive medium/narrow behavior is supplemental resilience. The accepted desktop viewport is the primary parity gate; constrained widths must avoid destructive center squeeze and expose support panes as reachable overlays.

## 5. مصفوفة السيناريوهات التنفيذية

| ID | المجال | P | START STATE | USER ACTION | EXPECTED DOM / STATE | EXPECTED VISUAL RESULT | النتيجة | Evidence |
|---|---|:---:|---|---|---|---|:---:|---|
| `G01` | الهيكل البصري | `P0` | Donor exact bytes; fresh browser context; 1440×1000. | Load exact self-contained donor in Chromium. → Observe without mutation. → Capture viewport screenshot. | body: mode=read, responsiveBand=wide, left=open, right=open; 15 rendered blocks; no editables; no page/console errors. | Three-pane dark Library workspace with global + Library navigation, banner, structured document, context pane and bottom shelf rail; no overlap/clipping at accepted viewport. | **PASS** | G01_boot_golden_1440x1000.png |
| `G02` | التحرير والسياق | `P0` | Read mode with original p1. | Switch to Edit via UI. → Click p1 editable body. → Type marker at caret end. → Tab away to commit. | p1 selected; Context scope switches to block and names blk-d05-p1; committed text persists in DOM; Undo becomes available; save state becomes dirty/autosaving. | Selected block and context are visibly coupled; typed content appears in place without replacing block identity. | **PASS** | — |
| `G03` | التاريخ والاسترداد | `P0` | Edit mode, unchanged p1. | Append one edit transaction and blur. → Press Ctrl+Z. → Press Ctrl+Shift+Z. | Undo restores exact prior block content; Redo restores committed edit; toolbar availability tracks history truth. | Content visibly rolls backward/forward without losing block structure. | **PASS** | — |
| `G04` | التحديد | `P0` | Edit mode; no multi-selection. | Click p1. → Escape single focus. → Ctrl-click p1 and p-auto-ltr. → Observe multi toolbar. → Press Escape. | Single selection drives block context. Ctrl-click creates two-ID multi-selection and visible 2-block toolbar. Escape clears multi-selection first. | Two rows show selected styling; contextual multi-block command rail appears then disappears on Escape. | **PASS** | — |
| `G05` | الإدراج | `P0` | Edit mode, 15 blocks, first structural gap before h2. | Click first gap plus. → Filter palette for paragraph. → Choose paragraph. → Undo insertion. | Palette opens; exactly one new paragraph is inserted at targeted structural index, receives a new ID, focuses for edit, and is undoable. | A real blank paragraph appears at the requested boundary; palette closes; document reflows without layout breakage. | **PASS** | — |
| `G06` | سلامة الحذف | `P0` | Edit mode; toggle t1 owns two descendants. | Open t1 block menu. → Choose Delete. → Verify confirmation appears for structural risk. → Confirm. → Undo. | Smart policy detects subtree risk; confirmation is required; exactly t1 + its two descendants are removed as one transaction; undo restores all. | Confirmation explicitly warns before branch loss; after confirmation subtree disappears cleanly; undo restores it. | **PASS** | — |
| `G07` | إعادة الترتيب | `P0` | Edit mode; p1 precedes p-auto-ltr at root. | Open p1 block menu. → Expand “تحريك وبنية”. → Choose move down. → Undo. | p1 changes structural index by exactly one, sibling identity preserved, undo restores original order. | Rows exchange positions without copy/re-render identity loss or accidental nesting. | **PASS** | — |
| `G08` | السحب والإفلات | `P0` | Edit mode; p1 before p-auto-ltr. | Pointer-down on p1 grip. → Move >8px drag threshold. → Hover a structural drop boundary after p-auto-ltr. → Capture feedback. → Release pointer. | Source exposes dragging state after threshold; a structural target/preview appears; drop moves subtree to intended legal gap. | Source row enters drag styling and insertion/drop feedback becomes visible before commit; final row order changes only on drop. | **PASS** | G08_drag_drop_feedback.png |
| `G09` | الحافظة | `P0` | Edit mode; p1 focused. | Create a real DOM text selection inside p1. → Press Ctrl+C. → Observe browser copy event payload. | Copy event carries exact selected text/plain and formatted text/html when formatted clipboard preference is active; UI selection context remains truthful. | Text remains selected; copy does not mutate content; selection toolbar/context may expose selection actions. | **PASS** | — |
| `G10` | الحافظة وسلامة الحذف | `P0` | Edit mode; p1 exists. | Open p1 block menu. → Expand “نسخ ومشاركة”. → Choose Cut. → Observe toast and block count. | Cut writes clipboard first; only after successful clipboard write is p1 deleted; success feedback names the successful mode. | p1 disappears only after positive clipboard result; user receives explicit truthful cut feedback. | **PASS** | — |
| `G11` | اللصق الآمن | `P0` | Edit mode; caret at end of p1; rich paste enabled. | Dispatch a browser ClipboardEvent containing safe bold text plus img/onerror, script, and javascript: URL. → Let donor paste handler sanitize and commit. | Supported portable inline markup inserts; script/img/event handlers/javascript URLs do not survive or execute; paste is committed to history. | Safe text appears; malicious/unsupported visual content does not render; success feedback remains bounded to sanitized content. | **PASS** | — |
| `G12` | لوحة المفاتيح والطبقات | `P0` | Read mode; no modal open. | Press Ctrl+K. → Tab repeatedly through controls. → Capture overlay. → Press Escape. | Command backdrop opens and receives focus; Tab remains trapped inside modal; Escape closes top overlay and returns to workspace. | Centered command UI overlays workspace with unambiguous focus; background is visually de-emphasized. | **PASS** | G12_command_palette_keyboard.png |
| `G13` | تنقل لوحة المفاتيح | `P1` | Read mode, no overlay. | Press /. → Verify Library search focus. → Escape. → Press F6 repeatedly. | / focuses kuSearch in read mode; F6 cycles across primary workspace regions rather than trapping in one pane. | Keyboard user can visibly jump into search and cycle major panes without mouse. | **PASS** | — |
| `G14` | اللوحات | `P0` | Wide viewport; left and right open; left separator ~304px. | Collapse left pane via local toggle. → Verify inert/aria-hidden and center expansion. → Reopen. → Focus separator and press ArrowRight twice. | Collapse removes pane from active layout/accessibility flow; center expands. Separator Arrow keys adjust aria-valuenow and pane width in bounded steps. | Pane disappears/reappears without overlap; width change is visible and operable without pointer drag. | **PASS** | — |
| `G15` | وضع التركيز | `P0` | Wide desktop with support panes open and banner expanded. | Click Focus. → Observe support panes/banner/bottom. → Capture screenshot. → Exit Focus. | Focus mode hides support panes and banner and closes bottom work area while preserving previous presentation; exit restores previous pane/banner state. | Center document becomes distraction-reduced; restoration returns to the same workspace composition rather than defaults. | **PASS** | G15_focus_mode.png |
| `G16` | اتجاه النص | `P0` | Edit mode with Arabic-first auto paragraph, English-first auto paragraph, technical code block. | Inspect resolved directions. → Open Arabic p1 block menu > تنسيق > LTR. → Observe explicit direction. → Undo. | Arabic-first auto resolves RTL; English-first auto resolves LTR; code remains LTR. Explicit LTR overrides p1 and is undoable back to auto/RTL. | Mixed Arabic/English stays readable; technical tokens/code preserve LTR; explicit block direction changes alignment/flow predictably. | **PASS** | — |
| `G17` | المزامنة | `P0` | Active KU in tree; edit mode. | Observe current tree item. → Select p1, then p-auto-ltr. → Expand bottom shelf. | Tree retains current KU; Context inspector updates to exact selected block ID; bottom shelf opens without losing selection and presents history/compare/recovery workspace. | Left navigation, center selection, right context and bottom deep-work surface remain coherent rather than independent mock panels. | **PASS** | — |
| `G18` | الحالة الفارغة | `P1` | Read mode with populated knowledge tree. | Enter a guaranteed no-match search. → Observe empty state. → Clear search. | No-match state is explicit rather than blank failure; clearing restores tree and current KU indication. | User sees a bounded empty-state message and a recovery path; normal tree returns after clear. | **PASS** | G18_structure_empty_state.png |
| `G19` | القوائم وإتاحة الوصول | `P1` | Read mode; no overlay. | Open toolbar More/preferences. → Escape. → Open keyboard shortcuts. → Tab repeatedly. → Escape. | Menus expose workspace, bidi, clipboard, code, save/recovery, appearance, deletion and accessibility controls. Modal shortcuts keep focus contained and Escape closes. | Overlays appear above workspace with clear grouping and keyboard-dismiss behavior; focus does not leak behind the active modal. | **PASS** | — |
| `G20` | الاستجابة | `P1` | Start at accepted desktop 1440×1000 wide. | Resize to 1100×900. → Reveal right support pane. → Resize to 720×900. → Reveal left pane. → Return to 1440×1000. | Wide/medium/narrow bands update. Support panes collapse when center width would be harmed and reveal as overlay with scrim in constrained widths; returning wide restores wide composition logic. | Center content remains usable instead of being squeezed below its minimum; support panes become temporary overlays on constrained widths. | **PASS** | — |
| `G21` | حدود حالات النظام | `P0` | Accepted donor normal runtime. | Inspect product-exposed state controls. → Open bottom shelf Recovery tab. | Non-production StateLab remains CSS-hidden and must not be treated as accepted loading/error UX. Only exposed recovery/history behavior is Golden evidence; backend loading/error semantics require future admitted product… | No fake diagnostic lab appears to user. Recovery workspace is exposed through the bottom shelf, while hidden simulation controls stay absent. | **PASS** | — |
| `G22` | التركيز وإتاحة الوصول | `P0` | Edit mode; p1 block handle focused by keyboard. | Press Shift+F10. → Press / inside block menu. → Escape. | Shift+F10 opens same block command surface as pointer. / focuses menu search. Escape closes and restores focus to invoking handle. | Keyboard receives the same structural commands as mouse, with visible focus styling and deterministic focus return. | **PASS** | — |
| `G23` | الفشل الذري | `P0` | Edit mode; p1 exists; clipboard transports intentionally unavailable. | Inject clipboard-unavailable browser capability boundary. → Open p1 > نسخ ومشاركة > قص العنصر. → Observe failure path. | Cut failure is caught; p1 remains in document; block count is unchanged; UI reports that deletion did not happen because clipboard write failed. | User sees an explicit error toast and content remains visibly intact. | **PASS** | — |

## 6. نتائج عالية المخاطر يجب ألا تضيع في Extraction

### 6.1 التحرير والتاريخ

- وضع `Read` يبدأ دون `contenteditable`، بينما `Edit` يفعّل التحرير الحقيقي.
- تعديل `blk-d05-p1` ظهر في DOM، فعّل Undo، ودخل حالة `autosaving`.
- `Ctrl+Z` أعاد النص الأصلي حرفيًا، و `Ctrl+Shift+Z` أعاد التعديل. هذا هو الحد الأدنى لقبول أي History owner بديل.

### 6.2 التحديد، البنية، والإدراج

- التحديد الفردي يغيّر Context إلى scope الكتلة ويربط Inspector بهوية الكتلة.
- `Ctrl-click` على كتلتين أنتج Multi-selection حقيقيًا مع toolbar بعدد `2`، و Escape مسحه.
- Gap insertion أضاف كتلة واحدة في الموضع البنيوي المطلوب ثم عاد العدد الأصلي بعد Undo.
- حذف Toggle ذي تابعين أظهر Smart confirmation وحذف subtree كاملًا كمعاملة واحدة؛ Undo أعاده.
- Reorder من القائمة و Drag & Drop الفعلي كلاهما غيّرا الترتيب البنيوي مع الحفاظ على الهوية. أثناء Drag ظهر `data-dragging=true` وحدد gap صالحًا قبل Pointer Up.

### 6.3 الحافظة وحدود الثقة

- `Ctrl+C` من Text selection ولّد `text/plain` و `text/html` متوافقين مع التحديد عند تفضيل formatted clipboard.
- Cut الناجح أثبت قاعدة **clipboard-first, delete-second**.
- G23 عطّل كل clipboard transports عمدًا: بقي عدد الكتل `15` وبقي `blk-d05-p1` موجودًا، وظهر الخطأ «تعذر القص … لم يتم حذف العنصر». هذا Gate مانع لفقد البيانات.
- Rich paste مرّ عبر allowlist: ظهر `<strong>SAFE-RICH</strong>`، بينما لم يبق `script` أو `img/onerror` أو `javascript:` ولم يُنفذ أي payload؛ Undo أزال اللصق.

### 6.4 لوحة المفاتيح، Focus، والطبقات

- `Ctrl+K` فتح Command Palette وحافظ على focus داخل الـ modal عبر Tab، و Escape أغلقها.
- `/` في Read mode نقل focus إلى `kuSearch`.
- `F6` تنقّل بين مناطق أساسية متعددة.
- `Shift+F10` على block handle فتح نفس قائمة أوامر الكتلة، و `/` داخلها نقل focus إلى بحث القائمة، ثم Escape أعاد focus إلى الـ handle.

### 6.5 اللوحات و Focus Mode

- إغلاق LEFT pane جعلها `aria-hidden=true` ووسّع CENTER، ثم أعاد فتحها دون فقد الحالة.
- `leftResizer` يعمل كـ keyboard separator؛ ضغط ArrowRight مرتين رفع `aria-valuenow` من العرض الأصلي بخطوات فعلية.
- Focus Mode أخفى لوحات الدعم والـ banner، ثم أعاد LEFT/RIGHT والـ banner إلى الحالة السابقة بالضبط عند الخروج.

### 6.6 اتجاه النص RTL/LTR

- `blk-d05-p1`: `auto → rtl`.
- `blk-d05-p-auto-ltr`: `auto → ltr`.
- `blk-d05-code1`: `ltr → ltr` بوصفه technical code.
- تغيير الفقرة العربية صراحةً إلى LTR نجح، ثم أعاد Undo السلوك إلى RTL. المطلوب هو block-level bidi، وليس فرض اتجاه الصفحة على كل المحتوى.

### 6.7 المزامنة والحالات

- Tree حافظ على الـ active KU؛ اختيار `blk-d05-p1` ثم `blk-d05-p-auto-ltr` غيّر Inspector إلى الهوية الصحيحة؛ فتح Bottom shelf لم يفصل السياق.
- Search بلا نتائج أظهر Empty state صريحًا؛ Clear أعاد `9` صفوف مرئية وبقي current KU موجودًا.
- `StateLab` و `stateFab` كلاهما `display:none` في المنتج المقبول؛ لذلك **لا يجوز** اعتبار conflict/loading simulations المخفية دليلًا على Golden production UX.

## 7. Writer A — مقارنة تشخيصية فقط

- Writer A browser receipt يصنّف نفسه `WRITER_A_TARGETED_BROWSER_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE`، وكانت النتيجة `EXECUTED_PASS` بـ viewport `1440x980` و transport `in-memory`.
- صورة Writer A لـ Library هي حالة `Edit + selected block` عند `1440×980`، بينما صورة G01 هي `Read + unit context` عند `1440×1000`. لذلك لا يوجد أساس صالح لقرار pixel parity مباشر بينهما.
- توجد فروق بصرية مرئية تستحق Replay موحّد الحالة قبل القبول: تركيب الـ top/global navigation مختلف، مجموعة الأوامر المباشرة في toolbar مختلفة، والـ RIGHT pane يعرض block-context في Writer A مقابل unit-context في G01.
- هذه الفروق ليست Fail تلقائيًا لأن الـ accepted donor ليس `final shell authority`، ولأن Owner corrections الأحدث يمكن أن تغيّر shell. بوابة R3 هي: **لا تفقد mechanics أو الوصول أو الوضوح أو الغنى العملي دون supersession صريح ومبرر.**

## 8. ما لا يجوز اعتباره Proof

- Screenshot وحده.
- عدد tests أو registry row أو component name دون إعادة تشغيل السيناريو.
- نجاح Foundation `6/6` كبديل عن Library Golden interactions.
- الـ hidden StateLab بوصفه production loading/error UX.
- Writer A screenshot من حالة مختلفة بوصفها pixel comparison عادلة.

## 9. بوابة القبول المقترحة لأي Extraction لاحق

1. يعاد تشغيل كل سيناريو `P0` على candidate بنفس الحالة الأساسية، وتوثق DOM/state والنتيجة البصرية.  
2. أي فقد لسلوك `P0` = **REJECT** ما لم توجد Owner correction أعلى سلطة تُغيّر السلوك صراحةً.  
3. سيناريوهات `P1` يجب ألا تتراجع دون justification موثّق؛ وهي خصوصًا keyboard navigation، empty-state recovery، menus/accessibility، و constrained-width resilience.  
4. المقارنة البصرية يجب أن تكون state-matched و viewport-matched.  
5. Cut failure atomicity، sanitizer، subtree delete confirmation، Focus round-trip، و Bidi isolation هي **non-negotiable data/interaction safety gates**.  
6. لا يتم قبول canonical shared mechanic من اسم component أو test pass فقط؛ يجب أن يعيد إنتاج هذه النتائج من المستهلك الفعلي.

## 10. Evidence bundle

- `G01_boot_golden_1440x1000.png` — `207,176` bytes — SHA-256 `af7941c34f5afc2edec83fe647a6fa6419d836bde2c6042c03074def83b8b5ea` — `1440×1000`.
- `G08_drag_drop_feedback.png` — `209,459` bytes — SHA-256 `edcc65314136c491208ebda2e2e9c187b7e37649cbeac408196b5361c60dba22` — `1440×1000`.
- `G12_command_palette_keyboard.png` — `229,932` bytes — SHA-256 `f732154d98ff7343708474c9c73bb10df1d9ee8e83413004e4dd81edb16dc867` — `1440×1000`.
- `G15_focus_mode.png` — `111,116` bytes — SHA-256 `bff1edc9d3218458d772359448c33a3526d5f2f6e18448521ba07c744467cb12` — `1440×1000`.
- `G18_structure_empty_state.png` — `177,184` bytes — SHA-256 `deea142b30e396292a5773e21fafa2e20eb8577c6414f0cc9d1dd6b9c9d6e9ae` — `1440×1000`.

تم تضمين JSON machine-readable كامل لكل السيناريوهات والـ execution receipt داخل `GOLDEN_BROWSER_EVIDENCE_BUNDLE.zip`.

---
**R3 truth ceiling:** Golden oracle established for the accepted Library donor scope. No Foundation promotion, no Writer A acceptance, no self-acceptance.
