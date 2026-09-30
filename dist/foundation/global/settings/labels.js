/* Presentation-only bilingual catalog for the Settings center.
 *
 * The SETTINGS CENTER *model* (SETTINGS_CENTER_GROUPS / SETTINGS_CENTER_SECTION_CATALOG labels)
 * stays stable and English — contracts and tests bind to it. Localisation happens HERE, at render
 * time, keyed by stable ids. Adding a key never changes model semantics.
 *
 * Owner policy (G-20): Arabic and English are both first-class. Nothing in this catalog implies a
 * product-language preference; both languages are always fully written out.
 */

                                            
const bi=(ar       ,en       )          =>Object.freeze({ar,en});

export const SETTINGS_GROUP_LABELS                         =Object.freeze({
  preferences:bi('التفضيلات','Preferences'),
  settings:bi('الإعدادات','Settings'),
  commands:bi('الأوامر','Commands'),
  'editor-shortcuts':bi('اختصارات المحرر','Editor Shortcuts'),
  shortcuts:bi('الاختصارات','Shortcuts')
});

export const SETTINGS_GROUP_NOTES                         =Object.freeze({
  preferences:bi('لغة المنتج والاتجاه والمظهر — تفضيلاتك أنت، لا سلطة لغوية للمنتج','Product language, direction and appearance — your preferences, with no product-language authority'),
  settings:bi('إعدادات عامة وتخطيط مساحة العمل ونقل التفضيلات','General settings, workspace layout and preference transfer'),
  commands:bi('كتالوج الأوامر الدلالية وحالة توفرها','Semantic command catalog and its availability'),
  'editor-shortcuts':bi('اختصارات محرر المستندات المنظمة','Structured document editor shortcuts'),
  shortcuts:bi('الاختصارات العامة المربوطة بـ GlobalInputKeymapOwner','Global shortcuts bound to GlobalInputKeymapOwner')
});

export const SETTINGS_SECTION_LABELS                         =Object.freeze({
  'preferences.appearance':bi('المظهر وإمكانية الوصول','Appearance & access'),
  'preferences.editor':bi('تفضيلات المحرر','Editor preferences'),
  'settings.general':bi('عام','General'),
  'settings.layout':bi('تخطيط مساحة العمل','Workspace layout'),
  'commands.catalog':bi('كتالوج الأوامر','Command catalog'),
  'shortcuts.global':bi('الاختصارات العامة','Global shortcuts'),
  'settings.transfer':bi('تصدير / استيراد / إعادة ضبط','Export / import / reset')
});

export const SETTINGS_SECTION_DESCRIPTIONS                         =Object.freeze({
  'preferences.appearance':bi('السمة والكثافة والمقياس والخط والحركة والتباين — كلها تفضيلات عرض تُحفظ لك وحدك.','Theme, density, scale, font, motion and contrast — presentation preferences saved for you alone.'),
  'preferences.editor':bi('اتجاه وسلوك محرر المستندات المنظمة.','Direction and behaviour of the structured document editor.'),
  'settings.general':bi('السلوك العام وإرشادات الواجهة ومؤشرات التركيز.','General behaviour, interface guidance and focus indicators.'),
  'settings.layout':bi('أبعاد اللوحات وشريط الأدوات وعرض المستند. اتجاه الواجهة يُضبط من بلوك اللغة والاتجاه في الأعلى.','Pane geometry, toolbar and document width. Chrome direction is controlled by the language & direction block above.'),
  'commands.catalog':bi('عرض فقط — الأوامر تُملَك بواسطة SemanticCommandBus.','Display only — commands are owned by the SemanticCommandBus.'),
  'shortcuts.global':bi('عرض فقط — الاختصارات تُملَك بواسطة GlobalInputKeymapOwner.','Display only — shortcuts are owned by GlobalInputKeymapOwner.'),
  'settings.transfer':bi('تُنفَّذ عبر SettingsCenterOwner وتُخزَّن بواسطة ScopedPreferencesOwner.','Executed through SettingsCenterOwner and persisted by ScopedPreferencesOwner.')
});

export const PREFERENCE_LABELS                         =Object.freeze({
  locale:bi('لغة المنتج','Product language'),
  chromeDirection:bi('اتجاه الواجهة','Interface direction'),
  contentDirection:bi('اتجاه المحتوى','Content direction'),
  theme:bi('السمة','Theme'),
  density:bi('الكثافة','Density'),
  scale:bi('مقياس الواجهة','Interface scale'),
  font:bi('خط الواجهة','Interface font'),
  alignment:bi('المحاذاة','Text alignment'),
  toolbar:bi('شريط الأدوات','Toolbar'),
  toolbarOrder:bi('ترتيب شريط الأدوات','Toolbar order'),
  guidance:bi('الإرشادات','Guidance'),
  grid:bi('الشبكة','Grid'),
  snap:bi('المحاذاة التلقائية','Snap'),
  minimap:bi('الخريطة المصغّرة','Minimap'),
  highContrast:bi('تباين مرتفع','High contrast'),
  motion:bi('الحركة','Motion'),
  left:bi('لوحة البنية','Structure pane'),
  right:bi('لوحة السياق','Context pane'),
  leftWidth:bi('عرض لوحة البنية','Structure pane width'),
  rightWidth:bi('عرض لوحة السياق','Context pane width'),
  documentWidth:bi('عرض المستند','Document width'),
  customWidth:bi('عرض مخصص','Custom width'),
  emptyBlockDirection:bi('اتجاه الكتلة الفارغة','Empty block direction'),
  clipboardMode:bi('وضع الحافظة','Clipboard mode'),
  richPaste:bi('لصق منسّق','Rich paste'),
  codeSyntax:bi('تمييز صيغة الشيفرة','Code syntax'),
  codeLineNumbers:bi('أرقام أسطر الشيفرة','Code line numbers'),
  codeWrap:bi('لفّ أسطر الشيفرة','Code wrap'),
  codeFocusLines:bi('تمييز الأسطر المحددة','Code focus lines'),
  codeShowCopyControls:bi('أزرار نسخ الشيفرة','Code copy controls'),
  defaultBlockDirection:bi('اتجاه الكتلة الافتراضي','Default block direction'),
  defaultBlockType:bi('نوع الكتلة الافتراضي','Default block type'),
  autosave:bi('الحفظ التلقائي','Autosave'),
  recoveryEnabled:bi('الاسترداد','Recovery'),
  focusIndicators:bi('مؤشرات التركيز','Focus indicators'),
  focusOnInput:bi('التركيز عند الكتابة','Focus on input'),
  focusOnCommandRail:bi('التركيز على شريط الأوامر','Focus on command rail'),
  focusOnBlockSelection:bi('التركيز عند تحديد الكتلة','Focus on block selection'),
  deleteConfirmation:bi('تأكيد الحذف','Delete confirmation'),
  themeBehavior:bi('سلوك السمة','Theme behaviour'),
  systemDarkTheme:bi('سمة النظام الداكنة','System dark theme'),
  disclosureMode:bi('وضع الطي','Disclosure mode')
});

const value=(key       ,tokens                         )=>Object.freeze(tokens);
export const PREFERENCE_VALUE_LABELS                                        =Object.freeze({
  locale:value('locale',{ar:bi('العربية','Arabic'),en:bi('الإنجليزية','English')}),
  chromeDirection:value('chromeDirection',{auto:bi('تتبع اللغة النشطة','Follow active language'),rtl:bi('من اليمين إلى اليسار','Right to left'),ltr:bi('من اليسار إلى اليمين','Left to right')}),
  contentDirection:value('contentDirection',{auto:bi('تلقائي','Automatic'),rtl:bi('من اليمين إلى اليسار','Right to left'),ltr:bi('من اليسار إلى اليمين','Left to right')}),
  theme:value('theme',{'dark-blue':bi('أزرق داكن','Dark blue'),'notion-dark':bi('داكن بنّي','Notion dark'),light:bi('فاتح','Light')}),
  density:value('density',{compact:bi('مضغوط','Compact'),comfortable:bi('مريح','Comfortable'),relaxed:bi('مترابط','Relaxed')}),
  font:value('font',{'system-ui':bi('خط النظام','System font'),Tahoma:bi('Tahoma','Tahoma'),Arial:bi('Arial','Arial')}),
  alignment:value('alignment',{start:bi('بداية السطر','Start'),end:bi('نهاية السطر','End'),left:bi('يسار','Left'),right:bi('يمين','Right'),center:bi('توسيط','Center'),justify:bi('ضبط','Justify')}),
  toolbar:value('toolbar',{full:bi('كامل','Full'),compact:bi('مضغوط','Compact')}),
  toolbarOrder:value('toolbarOrder',{standard:bi('قياسي','Standard'),'domain-first':bi('المجال أولاً','Domain first')}),
  motion:value('motion',{system:bi('تبع النظام','Follow system'),reduced:bi('مخفّض','Reduced'),full:bi('كامل','Full')}),
  left:value('left',{open:bi('مفتوحة','Open'),collapsed:bi('مطوية','Collapsed')}),
  right:value('right',{open:bi('مفتوحة','Open'),collapsed:bi('مطوية','Collapsed')}),
  documentWidth:value('documentWidth',{compact:bi('مضغوط','Compact'),comfortable:bi('مريح','Comfortable'),wide:bi('عريض','Wide'),full:bi('كامل','Full'),custom:bi('مخصص','Custom')}),
  emptyBlockDirection:value('emptyBlockDirection',{system:bi('تبع النظام','Follow system'),rtl:bi('من اليمين إلى اليسار','Right to left'),ltr:bi('من اليسار إلى اليمين','Left to right')}),
  clipboardMode:value('clipboardMode',{plain:bi('نص صافٍ','Plain'),formatted:bi('منسّق','Formatted')}),
  codeSyntax:value('codeSyntax',{auto:bi('تلقائي','Automatic'),off:bi('معطّل','Off')}),
  codeWrap:value('codeWrap',{wrap:bi('لفّ','Wrap'),scroll:bi('تمرير','Scroll')}),
  defaultBlockDirection:value('defaultBlockDirection',{auto:bi('تلقائي','Automatic'),rtl:bi('من اليمين إلى اليسار','Right to left'),ltr:bi('من اليسار إلى اليمين','Left to right')}),
  defaultBlockType:value('defaultBlockType',{paragraph:bi('فقرة','Paragraph'),bullet:bi('نقطة','Bullet')}),
  deleteConfirmation:value('deleteConfirmation',{smart:bi('ذكي','Smart'),always:bi('دائمًا','Always'),never:bi('أبدًا','Never')}),
  themeBehavior:value('themeBehavior',{manual:bi('يدوي','Manual'),system:bi('تبع النظام','Follow system')}),
  systemDarkTheme:value('systemDarkTheme',{'dark-blue':bi('أزرق داكن','Dark blue'),'notion-dark':bi('داكن بنّي','Notion dark')}),
  disclosureMode:value('disclosureMode',{multiple:bi('متعدد','Multiple'),accordion:bi('تتابعي','Accordion')})
});

export const SETTINGS_COPY=Object.freeze({
  title:bi('الإعدادات والتفضيلات','Settings & Preferences'),
  subtitle:bi('إعداد ثم إصدار تفضيلاتك — اللغة والاتجاه قابلة للتغيير في أي وقت','Configure, then revise, your preferences — language and direction stay changeable at any time'),
  searchPlaceholder:bi('ابحث في الإعدادات','Search settings'),
  searchCount:bi('مطابقة','matches'),
  close:bi('إغلاق الإعدادات','Close settings'),
  noResults:bi('لا توجد إعدادات مطابقة.','No matching settings.'),
  noItems:bi('لا توجد عناصر مطبقة.','No applicable items.'),
  sourceDefault:bi('لغة الجهاز','Device language'),
  sourceOverride:bi('اخترته أنت','Set by you'),
  scopeGlobal:bi('نطاق عام','global scope'),
  scopeSession:bi('نطاق جلسة','session scope'),
  footValueOwner:bi('مالك القيم','Value owner'),
  footPersistence:bi('مالك الحفظ','Persistence owner'),
  footTransfer:bi('نقل التفضيلات','Preference transfer'),
  footLanguageAuthority:bi('سلطة اللغة','Language authority'),
  operationUnavailable:bi('التخزين غير متاح','Storage unavailable')
});

/** Best-effort human label for a preference value token, falling back to the raw token. */
export function preferenceValueLabel(key       ,locale          ,token        )       {
  if(typeof token==='boolean')return locale==='ar'?(token?'مفعّل':'معطّل'):(token?'On':'Off');
  const mapped=PREFERENCE_VALUE_LABELS[key]?.[String(token)];
  if(mapped)return mapped[locale];
  if(token===null||token===undefined||token==='')return locale==='ar'?'—':'—';
  const text=String(token);
  if(/^\d+(\.\d+)?$/.test(text))return text;
  if(locale==='ar')return text;
  return text.replace(/^([a-z])([A-Z])/,'$1 $2').replace(/^./,c=>c.toUpperCase());
}
