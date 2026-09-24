import {StructuredDocumentDomainAdapter} from '../foundation/structured.js';

export const NOTE_CONTENT_COMPATIBILITY_CONTRACT=Object.freeze({
  id:'StructuredNoteContentCompatibilityFixture',
  version:'1.0.0',
  purpose:'CONTENT_COMPATIBILITY_ONLY',
  semanticOwner:false,
  stickyNoteWindowOwnerImplemented:false,
  finalNoteBindingAdapterImplemented:false,
  popoutLifecycleImplemented:false,
  pinAlwaysOnTopImplemented:false,
  secondEditorEngineImplemented:false
});

export const NOTE_CONTENT_COMPATIBILITY_DOCUMENT=Object.freeze({
  id:'note-content-compatible-document',
  revision:'note-content-rev-1',
  title:'محتوى ملاحظة متوافق مع المحرر المنظّم',
  tags:Object.freeze(['Note content','Compatibility fixture']),
  blocks:Object.freeze([
    Object.freeze({id:'note-h1',type:'h2',html:'ملاحظة منظّمة · <bdi dir="ltr">Structured Note Content</bdi>'}),
    Object.freeze({id:'note-p1',type:'paragraph',html:'محتوى ملاحظة يعمل عبر نفس <bdi dir="ltr">StructuredSurfaceHost</bdi> من دون محرك تحرير ثانٍ.'}),
    Object.freeze({id:'note-toggle-1',type:'toggle',title:'تفاصيل التحقق',titleHtml:'<strong>تفاصيل</strong> التحقق',open:true,children:Object.freeze([
      Object.freeze({id:'note-toggle-p1',type:'paragraph',html:'المعرّف البنيوي والمسار يظلان من الشجرة القانونية نفسها.'})
    ])}),
    Object.freeze({id:'note-code-1',type:'code',html:'const compatible = true;\nverify(compatible);',dir:'ltr'})
  ])
});

export function createStructuredNoteContentCompatibilityAdapter(){
  const document=structuredClone(NOTE_CONTENT_COMPATIBILITY_DOCUMENT);
  const adapter=new StructuredDocumentDomainAdapter({
    owner:'NoteContentCompatibilityAdapter',
    domainKind:'note-content',
    document,
    metadata:{surface:'note-content',contentCompatibilityOnly:true,noWindowLifecycle:true,noSecondEditorEngine:true},
    sourceBinding:{sources:[]},
    noteBinding:{route:'PERSONAL:CEP/W05/note-content-compatibility',contentOnly:true}
  });
  adapter.noteContentCompatibilityContract=NOTE_CONTENT_COMPATIBILITY_CONTRACT;
  return adapter;
}
