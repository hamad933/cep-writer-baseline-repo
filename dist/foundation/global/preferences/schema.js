export const PREFERENCE_DEFINITIONS={
  locale:{safeDefault:'ar',values:['ar','en']},chromeDirection:{safeDefault:'auto',values:['auto','rtl','ltr']},contentDirection:{safeDefault:'auto',values:['auto','rtl','ltr']},
  theme:{safeDefault:'dark-blue',values:['dark-blue','notion-dark','light']},density:{safeDefault:'comfortable',values:['compact','comfortable','relaxed']},
  scale:{safeDefault:1,min:.8,max:2},font:{safeDefault:'system-ui',values:['system-ui','Tahoma','Arial']},alignment:{safeDefault:'start',values:['start','end','left','right','center','justify']},
  toolbar:{safeDefault:'full',values:['full','compact']},toolbarOrder:{safeDefault:'standard',values:['standard','domain-first']},guidance:{safeDefault:false},
  grid:{safeDefault:true},snap:{safeDefault:true},minimap:{safeDefault:true},highContrast:{safeDefault:false},motion:{safeDefault:'system',values:['system','reduced','full']},
  left:{safeDefault:'open',values:['open','collapsed']},right:{safeDefault:'open',values:['open','collapsed']},leftWidth:{safeDefault:304,min:1,max:720},rightWidth:{safeDefault:420,min:1,max:720},
  documentWidth:{safeDefault:'comfortable',values:['compact','comfortable','wide','full','custom']},customWidth:{safeDefault:860,min:280,max:2400},
  emptyBlockDirection:{safeDefault:'system',values:['system','rtl','ltr']},clipboardMode:{safeDefault:'formatted',values:['plain','formatted']},richPaste:{safeDefault:true},
  codeSyntax:{safeDefault:'auto',values:['auto','off']},codeLineNumbers:{safeDefault:true},codeWrap:{safeDefault:'wrap',values:['wrap','scroll']},codeFocusLines:{safeDefault:true},codeShowCopyControls:{safeDefault:true},
  defaultBlockDirection:{safeDefault:'auto',values:['auto','rtl','ltr']},defaultBlockType:{safeDefault:'paragraph',values:['paragraph','bullet']},autosave:{safeDefault:true},recoveryEnabled:{safeDefault:true},
  focusIndicators:{safeDefault:true},focusOnInput:{safeDefault:true},focusOnCommandRail:{safeDefault:true},focusOnBlockSelection:{safeDefault:true},deleteConfirmation:{safeDefault:'smart',values:['smart','always','never']},
  themeBehavior:{safeDefault:'manual',values:['manual','system']},systemDarkTheme:{safeDefault:'notion-dark',values:['dark-blue','notion-dark']},disclosureMode:{safeDefault:'multiple',values:['multiple','accordion']}
};

const STRUCTURED=new Set(['contentDirection','alignment','documentWidth','customWidth','emptyBlockDirection','clipboardMode','richPaste','codeSyntax','codeLineNumbers','codeWrap','codeFocusLines','codeShowCopyControls','defaultBlockDirection','defaultBlockType','autosave','recoveryEnabled','focusOnInput','focusOnCommandRail','focusOnBlockSelection','disclosureMode']);
const SPATIAL=new Set(['grid','snap','minimap']);
export const PREFERENCE_APPLICABILITY=Object.freeze(Object.fromEntries(Object.keys(PREFERENCE_DEFINITIONS).map(key=>[key,STRUCTURED.has(key)?['structured']:SPATIAL.has(key)?['spatial']:['global','structured','spatial','operational']])));
export const preferenceApplies=(key,family='global')=>family==='global-proof'||(PREFERENCE_APPLICABILITY[key]||[]).includes(family)||(PREFERENCE_APPLICABILITY[key]||[]).includes('global');
