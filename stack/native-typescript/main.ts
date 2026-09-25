import {CommandRegistry,CapabilityRegistry,ActionSurfaceRegistry} from './foundation/models.js';
import {SemanticCommandBus} from './foundation/global/commands.js';
import {ScopedPreferencesOwner} from './foundation/global/preferences/store.js';
import {TransientFocusOwner} from './foundation/global/transient-focus.js';
import {defineContextDescriptorProvider} from './foundation/global/context-descriptor-contract.js';
import {eventTargetElement} from './foundation/global/input-ownership-contract.js';
import {AccessibilityFeedbackOwner} from './foundation/global/feedback.js';
import {mountWave3GlobalAssembly} from './foundation/wave3-assembly.js';
import {mountWave4FamilyInteractionAssembly} from './foundation/wave4-assembly.js';
import {WorkspaceFoundation,ContextDescriptorProvider,button,esc} from './foundation/workspace.js';
import {mountWorkspaceHost,createStructuredWorkspaceBinding,createFamilyWorkspaceBinding} from './foundation/workspace-host.js';
import {SpatialView} from './foundation/spatial.js';
import {WindowMotion} from './foundation/window-motion.js';
import {OperationalTerminalHost} from './foundation/operational/terminal-host.js';
import {createLocalRuntimePlatformInputDirectionBridge} from './foundation/contracts/platform-input-direction-bridge.js';
import {LocalRuntimePlatformWindowBridge} from './foundation/contracts/platform-window-capability.js';
import {WindowsTerminalRuntimeAdapter} from './adapters/windows-terminal-runtime.js';
import {W03V34RunsAdapter} from './adapters/w03-runs.js';
import {createEnterpriseAdapter} from './adapters/w03-enterprise.js';
import {RelationDomainAdapter,RelationInteraction} from './foundation/relations.js';
import {createLearnRuntimeComposition} from './adapters/learn.js';
import {BALANCED6_VISUALIZE_REPRESENTATIONS} from './adapters/balanced6-acceptance-data.js';
import {createStructuredConsumerAdapter,bindStructuredPersistence} from './adapters/structured-documents.js';
import {createLocalPersistenceClient} from './adapters/persistence/local-persistence-client.js';
import {ReviewAuthorityRegistry} from './adapters/reviews/domain.js';
import {createLibraryNoteRuntimeComposition} from './adapters/library-note-runtime-composition.js';
import {mountGlobalShellNavigation,canonicalizeGlobalShellRoute} from './foundation/global/shell/navigation.js';
import {CEP_PRODUCT_DESTINATION_REGISTRY} from './foundation/global/shell/cep-destinations.js';
import {mountM0ControllerComposition} from './surfaces/m0-controller-composition.js';
import {AnalyticalCompareOwner} from './foundation/analytical/compare.js';
import {TimelineReplayOwner} from './foundation/timeline/replay.js';

const shellCanonicalization=canonicalizeGlobalShellRoute(location.search,location.href,CEP_PRODUCT_DESTINATION_REGISTRY);
if(shellCanonicalization.required)history.replaceState(history.state,'',shellCanonicalization.href);
const shellRoute=shellCanonicalization.route;
const requested=shellRoute.requested;
const consumer=shellRoute.surface;
const family=['library','learn','labs','scenarios'].includes(consumer)?'structured':['visualize','enterprise'].includes(consumer)?'spatial':consumer==='runs'?'operational':'global';
const platformInputDirectionBridge=createLocalRuntimePlatformInputDirectionBridge();
function stageDetachedNoteContext(note:any,routeState:any={}){if(!note?.id)return null;const token='ctx-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);const payload={kind:'STICKY_WHOLE_SURFACE_CONTEXT',payload:{note:structuredClone(note),route:{activeKu:routeState.activeKu||null,contextLens:routeState.contextLens||null},createdAt:new Date().toISOString()}};try{sessionStorage.setItem('cep:detached:'+token,JSON.stringify(payload))}catch{}try{fetch((globalThis.CEP_LOCAL_RUNTIME_URL||'http://127.0.0.1:4174')+'/v1/platform/detach-context',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)}).catch(()=>{})}catch{}return token}
function readDetachedNoteContext(token:string|null){if(!token)return null;try{const item=sessionStorage.getItem('cep:detached:'+token);if(item)return JSON.parse(item).payload}catch{}return null}
const platformWindowBridge=new LocalRuntimePlatformWindowBridge({urlForPresentation:({presentationId,noteId,runtimeSessionId,providerId})=>{const u=new URL(location.href);u.searchParams.set('surface',noteId?'library':'runs');u.searchParams.set(noteId?'detachedNoteId':'detachedTerminalPresentationId',noteId||presentationId);if(noteId){u.searchParams.delete('terminal');u.searchParams.delete('terminalSessionId');u.searchParams.delete('terminalProviderId');const note=api?.state?.notes?.[noteId],route=api?.state?.route||{},handoffToken=stageDetachedNoteContext(note,{...route,contextLens:api?.state?.surface?.contextLens});if(handoffToken)u.searchParams.set('detachedContextToken',handoffToken);if(route.activeKu)u.searchParams.set('detachedKu',route.activeKu);if(note?.binding?.blockId)u.searchParams.set('detachedBlockId',note.binding.blockId);if(note?.binding?.route)u.searchParams.set('detachedBindingRoute',note.binding.route);if(api?.state?.surface?.contextLens)u.searchParams.set('detachedContextLens',api.state.surface.contextLens);if(note?.binding?.selection)u.searchParams.set('detachedSelection',JSON.stringify(note.binding.selection))}else if(runtimeSessionId&&providerId==='WindowsConptyRuntimeAdapter'){u.searchParams.set('terminal','conpty');u.searchParams.set('terminalSessionId',runtimeSessionId);u.searchParams.set('terminalProviderId',providerId)}return u.href}});
const commandBus=new SemanticCommandBus(),registry=new CommandRegistry(commandBus),capabilities=new CapabilityRegistry(commandBus),analyticalCompareOwner=new AnalyticalCompareOwner(),timelineReplayOwner=new TimelineReplayOwner(),reviewAuthorityRegistry=new ReviewAuthorityRegistry(),transientOwner=new TransientFocusOwner({fallbackFocus:()=>document.querySelector('[data-shell-destination][aria-current="page"], #centerPane, #workspaceViewButton')}),feedbackOwner=new AccessibilityFeedbackOwner();let api,workspace,spatial,operational,simulation,learn,motion,relations,relationUI,structured,bundles,wave3Assembly=null,wave4Assembly=null,shellNavigation=null,runOperationalContextProvider=null;
let windowsTerminal=null;
let storage;try{storage=localStorage}catch{storage=null}
const workspaceArea=CEP_PRODUCT_DESTINATION_REGISTRY.area(consumer)||'W02';
const preferences=new ScopedPreferencesOwner(storage,{workspace:workspaceArea,surface:consumer,view:'main',component:'workspace',family});
const structuredConsumer=['library','learn','labs','scenarios'].includes(consumer);
const libraryBundle=consumer==='library'?await import('./adapters/library-fixtures.js'):null;
const learnComposition=consumer==='learn'?createLearnRuntimeComposition():null;
if(learnComposition)learn=learnComposition.learn;
structured=consumer==='learn'?learnComposition.structured:consumer==='library'?createStructuredConsumerAdapter('library',libraryBundle,{inputDirectionBridge:platformInputDirectionBridge}):structuredConsumer?createStructuredConsumerAdapter(consumer,null,{inputDirectionBridge:platformInputDirectionBridge}):null;
if(structured)structured.inputDirectionResolver.bridge=platformInputDirectionBridge;
const persistenceClient=structuredConsumer?createLocalPersistenceClient():null;
let persistenceBootstrap={ok:false,code:'NOT_APPLICABLE'};
const presentPersistenceReceipt=receipt=>{if(!workspace||!receipt)return receipt;if(receipt.command==='document.commit'||receipt.operation==='EXPLICIT_SAVE'){const saved=receipt.persisted===true||receipt.committed===true,unavailable=['SAVE_BOUNDARY_UNAVAILABLE','RUNTIME_UNAVAILABLE','RUNTIME_TIMEOUT','FETCH_UNAVAILABLE'].includes(receipt.error||receipt.code||receipt.status||receipt.reason);workspace.projectExplicitSaveStatus?.(saved?'persisted':unavailable?'unavailable':'failed');workspace.status(saved?`Saved durably · ${receipt.committedRevision||receipt.revision}`:`Save failed · ${receipt.error||receipt.code||receipt.status||receipt.reason||'UNAVAILABLE'}`,saved?'info':'error')}return receipt};
if(structured&&persistenceClient){bindStructuredPersistence(structured,persistenceClient,{onReceipt:presentPersistenceReceipt});persistenceBootstrap=await persistenceClient.bootstrap(structured.snapshot(),{domainKind:structured.domainKind,surface:consumer});if(persistenceBootstrap?.ok&&persistenceBootstrap.document)structured.hydratePersistenceBaseline(persistenceBootstrap.document)}
const noteViewport=()=>{const center=document.querySelector('#centerPane')?.getBoundingClientRect?.(),css=getComputedStyle(document.documentElement),top=Math.max(8,parseFloat(css.getPropertyValue('--overlay-top'))||0)+8,bottom=Math.max(8,parseFloat(css.getPropertyValue('--bottom-live'))||0)+8;return {width:innerWidth,height:innerHeight,leftInset:center&&center.width>320?Math.max(8,center.left+8):8,rightInset:center&&center.width>320?Math.max(8,innerWidth-center.right+8):8,topInset:top,bottomInset:bottom}};
const noteRuntime=consumer==='library'?createLibraryNoteRuntimeComposition({viewport:noteViewport,platformWindowBridge,inputDirectionBridge:platformInputDirectionBridge}):null;
const structuredSharedCommandBinding=structured?structured.bindSharedCommands(registry):{commands:[]};
const structuredClipboardCommandBinding=structured?structured.bindSemanticCommands(registry):{commands:[]};
const structuredCommandBinding={commands:[...new Set([...(structuredSharedCommandBinding.commands||[]),...(structuredClipboardCommandBinding.commands||[])])]};
bundles=consumer==='library'?structured.fixtureBundle():null;
const familyBinding=structuredConsumer&&consumer!=='library'
 ? createStructuredWorkspaceBinding(structured,{id:`${consumer}-structured-workspace`})
 : consumer==='visualize'
  ? createFamilyWorkspaceBinding({id:'visualize-spatial-workspace',family:'spatial',domainKind:'visualize',label:'Spatial workspace'})
  : consumer==='runs'
   ? createFamilyWorkspaceBinding({id:'runs-operational-workspace',family:'operational',domainKind:'runs',label:'Operational workspace'})
   : consumer==='enterprise'
    ? createFamilyWorkspaceBinding({id:'enterprise-spatial-workspace',family:'spatial',domainKind:'enterprise',label:'Enterprise spatial workspace'})
    : consumer==='golden'
     ? createFamilyWorkspaceBinding({id:'golden-workspace-proof',family:'global-proof',domainKind:'golden',label:'Workspace proof harness'})
     : createFamilyWorkspaceBinding({id:`${consumer}-controller-workspace`,family:'global',domainKind:consumer,label:`${consumer} workspace`});
const genericDomainRef=()=>({surface:consumer,objectId:spatial?.model.selection.values().next().value||wave4Assembly?.operationalSession?.activeTab?.()?.runtimeIdentity?.deviceOrToolId||consumer});
const extension={
 transientOwner,
 feedbackPublish:input=>feedbackOwner.publish(input),
 bottomSet:(open,options={})=>wave3Assembly?.setBottomOpen(open,options)||false,
 structuredInputOwnership:()=>wave4Assembly?.structuredInputOwnership?.()||null,
 structuredInputKeydown:(event,context={})=>wave4Assembly?.handleStructuredKeydown?.(event,context)||null,
 structuredCompositionStart:(event,context={})=>wave4Assembly?.handleCompositionStart?.(event,context)||null,
 structuredCompositionEnd:(event,context={})=>wave4Assembly?.handleCompositionEnd?.(event,context)||null,
 structuredActionDescriptors:(surface,context={})=>wave4Assembly?.actionDescriptors?.(surface,context)||null,
 structuredActionDescribe:(actionId,context={})=>wave4Assembly?.describeStructuredAction?.(actionId,context)||null,
 structuredActionExecute:(actionId,context={})=>wave4Assembly?.executeStructuredAction?.(actionId,context)||null,
 structuredActionConfirm:(actionId,context={},options={})=>wave4Assembly?.confirmStructuredAction?.(actionId,context,options)||null,
 structuredDropValidate:(sourceBlockId,target,context={})=>wave4Assembly?.validateDrop?.(sourceBlockId,target,context)||null,
 structuredDragBegin:input=>wave4Assembly?.beginDrag?.(input)||null,
 structuredDragUpdate:input=>wave4Assembly?.updateDrag?.(input)||null,
 structuredDragCancel:reason=>wave4Assembly?.cancelDrag?.(reason)||null,
 structuredDragCommit:input=>wave4Assembly?.commitDrag?.(input)||null,
 resolveInputDirection:input=>wave4Assembly?.resolveDirection?.(input)||null,
 sanitizeStructuredInline:html=>wave4Assembly?.sanitizeRichInline?.(html)||null,
 projectRichBlock:(block,options={})=>wave4Assembly?.projectRichBlock?.(block,options)||null,
 windowPointerDown:e=>motion?.down(e),windowPointerMove:e=>motion?.move(e),windowPointerUp:e=>motion?.up(e),
 storageNamespace:`cep-foundation:${consumer}:`,
 domainKind:structured?.domainKind||familyBinding?.domainKind||consumer,
 structuredAdapter:structured||undefined,
 noteRuntime:noteRuntime||undefined,
 noteBinding:binding=>structured?{...structured.bindNote({blockId:binding.blockId,selection:binding.selection,route:`PERSONAL:CEP/W02/${consumer}`}),domainRef:{surface:consumer,objectId:structured.identity().id}}:{...binding,documentId:undefined,kuId:undefined,blockId:null,route:'PERSONAL:CEP/'+consumer,domainRef:genericDomainRef()},
 renderBottom:state=>{if(!['runs','enterprise','visualize'].includes(consumer))return false;const shelf=document.querySelector('#bottomShelf'),content=document.querySelector('#bottomContent');shelf.dataset.state=state.surface.bottomOpen?'open':'closed';document.querySelector('#bottomToggle').setAttribute('aria-expanded',String(state.surface.bottomOpen));content.inert=!state.surface.bottomOpen;document.querySelector('#bottomSummary').textContent=state.surface.bottomOpen?'Local event / view history':'Closed · open to inspect local history';content.innerHTML=state.surface.bottomOpen?'<pre dir="ltr">'+esc(JSON.stringify(simulation?.events||spatial?.model.history||[],null,2))+'</pre>':'';return true;},
 preferenceLoad:()=>({preferences:preferences.values()}),
 preferenceSave:snapshot=>{const current=preferences.values();for(const [k,v]of Object.entries(snapshot.preferences))if(k in current&&preferences.isApplicable(k)&&current[k]!==v)preferences.set(k,v,workspace?.scope||'global');return preferences.storageStatus()},
 hasCommand:id=>registry.commands.has(id),hasStructuredCommand:id=>structuredCommandBinding.commands.includes(id),commandAvailability:(id,p={})=>registry.availability(id,p),execute:(id,p={})=>registry.execute(id,{...p,route:p.route||p.context?.route||'library-action-surface'}),
 paletteItems:(donor,context={})=>{const projected=structuredConsumer?donor:[],seen=new Set(projected.map(item=>item.id)),safeStructured=new Set(['history.undo','history.redo','document.commit']);return [...projected,...registry.items(context).filter(c=>!seen.has(c.id)&&(!structuredCommandBinding.commands.includes(c.id)||safeStructured.has(c.id))).map(c=>({id:c.id,label:c.label,group:c.owner.startsWith('foundation')?'Workspace':'Current work',meta:c.reason||c.owner,enabled:c.enabled,availabilityCode:c.code||'',availabilityOwner:c.availabilityOwner||c.owner,keywords:c.id,icon:'i-command'}))]},
 settings:()=>wave4Assembly?.openSettings(document.activeElement)||{ok:false,code:'SETTINGS_CENTER_NOT_READY'},
 ready:a=>{api=a;if(consumer==='library')structured.bindExternal({read:()=>({id:a.state.route.activeKu,revision:bundles.FIXTURES[a.state.route.activeKu]?.revision||structured.committedRevision,title:a.state.editor.title,blocks:a.state.editor.blocks}),project:projection=>a.applyStructuredProjection?.(projection)})}
};
if(consumer==='library'){
 const {mountAcceptedRuntime}=await import('./foundation/accepted-runtime.js');
 mountAcceptedRuntime(bundles,extension);
}else api=mountWorkspaceHost({commands:registry,preferences,binding:familyBinding,extension});
workspace=new WorkspaceFoundation(api,registry,preferences,consumer,transientOwner);
if(consumer==='library'){const detachedParams=new URLSearchParams(location.search),detachedNoteId=detachedParams.get('detachedNoteId'),detachedKu=detachedParams.get('detachedKu'),detachedBlockId=detachedParams.get('detachedBlockId'),detachedLens=detachedParams.get('detachedContextLens'),detachedContext=readDetachedNoteContext(detachedParams.get('detachedContextToken'));if(detachedNoteId&&detachedContext?.note?.id===detachedNoteId){api.state.notes[detachedNoteId]=structuredClone(detachedContext.note);document.documentElement.dataset.detachedContextTransport='local-runtime-ephemeral-handoff'}const restoreKu=detachedContext?.route?.activeKu||detachedKu,restoreLens=detachedContext?.route?.contextLens||detachedLens;if(restoreKu&&api?.state?.route?.activeKu!==restoreKu&&typeof api?.switchKU==='function')api.switchKU(restoreKu);if(detachedNoteId&&api?.state?.notes?.[detachedNoteId]){api.renderNotes?.();api.openNote?.(detachedNoteId,false);if(restoreLens)api.state.surface.contextLens=restoreLens;if(detachedBlockId&&typeof api?.selectBlock==='function')api.selectBlock('main',detachedBlockId,false,'detached-window-restore');document.documentElement.dataset.detachedNoteId=detachedNoteId;document.documentElement.dataset.detachedNoteBinding=String(api.state.notes[detachedNoteId]?.binding?.documentId||api.state.notes[detachedNoteId]?.binding?.kuId||'');document.documentElement.dataset.detachedContextRestored='true'}}
if(structured&&persistenceClient)document.addEventListener('click',event=>{const target=eventTargetElement(event.target);const save=target?.closest?.('[data-action="explicit-save"]');if(!save)return;event.preventDefault();event.stopImmediatePropagation();Promise.resolve(api.Commands.execute('document.commit',{route:'toolbar',reason:'explicit-save'})).catch(error=>presentPersistenceReceipt({command:'document.commit',persisted:false,error:String(error?.message||error)}))},true);
motion=new WindowMotion(rawTarget=>{const target=eventTargetElement(rawTarget);if(!target)return null;const note=target.closest?.('.stickynote');if(note&&(target.closest?.('[data-note-drag-handle]')||target.closest?.('[data-note-resize]'))){const resizeHandle=target.closest?.('[data-note-resize]'),binding=noteRuntime?.motionBinding(note.dataset.noteId,note,{edge:resizeHandle?.dataset.noteResize||null});if(binding){const originalCommit=binding.commit;binding.commit=receipt=>{originalCommit?.(receipt);api.syncNoteFromCanonical?.(note.dataset.noteId);api.renderNotes()};return binding}}const ops=target.closest?.('.operational-host'),owner=wave4Assembly?.operationalSession,resize=target.closest?.('[data-operational-resize]'),drag=target.closest?.('[data-operational-drag]');if(ops&&owner&&(resize||drag)){const active=owner.activeTab?.();if(!active)return null;const binding=owner.motionBinding(active.presentationId,ops,{resizeEdge:resize?.dataset.operationalResize||null});if(binding){const originalCommit=binding.commit;binding.commit=receipt=>{originalCommit?.(receipt);operational?.render?.()};return binding}}return null});
if(consumer==='runs'){document.addEventListener('pointerdown',e=>motion.down(e),true);document.addEventListener('pointermove',e=>motion.move(e),true);document.addEventListener('pointerup',e=>motion.up(e),true)}
document.addEventListener('pointercancel',()=>motion.cancel(),true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&motion.cancel()){e.preventDefault();e.stopImmediatePropagation()}},true);

const reg=(id,owner,label,run,available)=>registry.register(id,owner,label,run,available);
if(consumer!=='library')reg('note.new',structured?'StructuredNoteBindingSeam':'WorkspaceNoteBindingSeam','New linked note',payload=>{const id=`note-${Object.keys(api.state.notes).length+1}`;const binding=structured?structured.bindNote({blockId:payload?.context?.blockId||api.state.editor?.selectedBlock||null,route:`PERSONAL:CEP/${consumer}`}):{documentId:undefined,blockId:null,route:`PERSONAL:CEP/${consumer}`};api.state.notes[id]={id,title:'',binding:{...binding,domainRef:structured?{surface:consumer,objectId:structured.identity().id}:genericDomainRef()},working:{blocks:[],dirty:true}};return api.state.notes[id]});
reg('foundation.palette','foundation.commands','Commands / الأوامر',()=>workspace.openCommandPalette());
reg('foundation.settings','SettingsCenterOwner','Settings / التفضيلات',()=>wave4Assembly?.openSettings(document.activeElement)||{ok:false,code:'SETTINGS_CENTER_NOT_READY'});
reg('foundation.focus','foundation.focus','Focus / التركيز',()=>api.toggleFocus());
reg('foundation.left','foundation.workspace','Structure pane / البنية',()=>api.togglePane('left'));
reg('foundation.right','foundation.workspace','Context pane / السياق',()=>api.togglePane('right'));
reg('foundation.bottom','foundation.workspace','History shelf / السجل',()=>{const integrated=wave3Assembly?.toggleBottom({invoker:document.activeElement,reason:'foundation.bottom'});if(integrated)return integrated;api.state.surface.bottomOpen=!api.state.surface.bottomOpen;api.renderBottom();return api.state.surface.bottomOpen});
reg('foundation.note','foundation.notes','New linked note / ملاحظة مرتبطة',()=>api.Commands.execute('note.new',{context:{surfaceKey:'main',blockId:api.state.editor?.selectedBlock||null},invoker:document.activeElement}));
reg('note.open','NotesWorkingState','Open existing note',p=>api.openNote(p.noteId,true),p=>!!api.state.notes[p.noteId]||'Choose an existing note');
reg('foundation.notes','foundation.notes','Linked notes',()=>{const notes=Object.values(api.state.notes).filter(n=>['library','learn'].includes(consumer)||n.binding.domainRef?.surface===consumer);workspace.dialog('Linked notes',notes.length?notes.map(n=>`<p><bdi dir="ltr">${esc(n.id)}</bdi> · ${esc(n.binding.domainRef?.objectId||n.binding.documentId||n.binding.kuId)} <button class="btn" data-open-note="${esc(n.id)}">Open same note</button></p>`).join(''):'<p>No linked notes. Use Note to create one.</p>',{safeOutside:true,onMount:bd=>bd.querySelectorAll('[data-open-note]').forEach(b=>b.onclick=()=>{workspace.closeDialog();api.Commands.execute('note.open',{noteId:b.dataset.openNote})})})});
reg('foundation.theme','foundation.preferences','Cycle theme',()=>{const themes=['dark-blue','notion-dark','light'],now=preferences.resolve('theme').preferredValue;preferences.set('theme',themes[(themes.indexOf(now)+1)%3],workspace.scope);workspace.applyPreferences()});
reg('foundation.guidance','foundation.preferences','Guidance / الإرشادات',()=>{preferences.set('guidance',!preferences.resolve('guidance').preferredValue,workspace.scope);workspace.applyPreferences()});
reg('foundation.context','foundation.actions','Context Actions',()=>workspace.menu([...registry.commands.keys()].filter(id=>!id.endsWith('context')),innerWidth/2,150));
const donorDoc=document.querySelector('#editorDocument');
let practiceUI=null;
if(consumer==='learn'){
 const learnDocument=structured.snapshot(),topBanner=document.querySelector('#topBanner'),bannerTitle=document.querySelector('#bannerTitle'),toolbarTitle=document.querySelector('#toolbarTitle'),bannerIdentity=document.querySelector('#bannerKuId'),toolbarIdentity=document.querySelector('#toolbarKuId');
 topBanner?.setAttribute('aria-label','Learn activity context');
 if(bannerTitle)bannerTitle.textContent=learn.activity.title;
 if(toolbarTitle)toolbarTitle.textContent=learn.activity.title;
 if(bannerIdentity)bannerIdentity.textContent=learn.activity.id;
 if(toolbarIdentity)toolbarIdentity.textContent=learn.activity.id;
 const crumbs=topBanner?.querySelector('.crumbs');if(crumbs)crumbs.innerHTML=`<span>التعلّم</span><span>›</span><span>نشاط تعلّم</span><span>›</span><bdi dir="ltr">${esc(learn.activity.id)}</bdi>`;
 const badge=topBanner?.querySelector('.badge.accent');if(badge)badge.textContent='نشاط تعلّم';
 const secondary=topBanner?.querySelector('.secondary');if(secondary)secondary.innerHTML='<span>المحتوى قابل للتحرير عبر المحرر البنيوي المشترك.</span><span>الحفظ الدائم متاح فقط عند اتصال <bdi dir="ltr">Local Runtime</bdi> المحلي.</span>';
 const tags=topBanner?.querySelector('.tags');if(tags)tags.innerHTML='<span class="badge">Practice</span><span class="badge">Local working state</span><span class="badge ok">Mastery not inferred</span>';
 const lockText=topBanner?.querySelector('.lock span');if(lockText)lockText.textContent='هوية النشاط ومصدره المحلي للقراءة فقط';
 document.querySelector('#editorDocument')?.setAttribute('aria-label','Learn structured working document');
 const introLead=document.querySelector('#editorDocument .doclead');if(introLead)introLead.textContent='اقرأ، حرّر، ونظّم دفتر التعلّم باستخدام المحرر البنيوي المشترك؛ حالة العمل محلية ولا تعني حفظًا دائمًا.';
 const groupTitle=document.querySelector('#contentGroupToggle .groupTitle');if(groupTitle)groupTitle.textContent='دفتر التعلّم / المحتوى';
 const groupHint=document.querySelector('#contentGroupToggle .groupHint');if(groupHint)groupHint.textContent='محتوى نشاط التعلّم الحالي';
 const leftBody=document.querySelector('#leftPane .pbody');if(leftBody){leftBody.innerHTML=`<label class="treesearch"><svg class="icon sm"><use href="#i-search"></use></svg><input aria-label="Search Learn document outline" id="learnOutlineSearch" placeholder="Search activity outline…" type="search"></label><div class="treetitle"><svg class="icon sm"><use href="#i-book"></use></svg>Learn activity outline</div><div id="learnStructureTree"></div><div class="domain-card"><strong>Local source</strong><p><bdi dir="ltr">${esc(learn.activity.id)} · r${learn.activity.revision}</bdi></p></div>`;}
 const outlineHost=document.querySelector('#learnStructureTree'),activateOutline=blockId=>{const block=document.querySelector(`#blockList [data-block-id="${CSS.escape(blockId)}"]`);block?.scrollIntoView({block:'nearest'});block?.querySelector('[data-editable-block]')?.focus();};
 const renderOutline=()=>learn.mountOutline(outlineHost,{query:document.querySelector('#learnOutlineSearch')?.value||'',onActivate:activateOutline});if(outlineHost)renderOutline();
 document.querySelector('#learnOutlineSearch')?.addEventListener('input',renderOutline);
 practiceUI=document.createElement('section');practiceUI.className='learn-practice';donorDoc.prepend(practiceUI);
 const renderPractice=()=>{const progress=learn.learningProgress();practiceUI.innerHTML=`<h2>Practice: identify the trust boundary</h2><p>اكتب تفسيرك داخل الدفتر، ثم سجّل إجابتك. يمكنك فتح أي نشاط دون إكمال السابق.</p><div>Journey → Practice → Assessment → Lab</div><p>Activity revision: ${learn.activity.revision} · Learning progress (local): ${progress.state} · Mastery: not inferred</p><p>Recommendation: ${esc(learn.recommendation())}</p><textarea id="practiceAnswer" aria-label="Practice answer" dir="auto" ${learn.attempt?.state==='SUBMITTED'?'readonly':''}>${esc(learn.attempt?.answer||'')}</textarea>${button('learn.start','Start / New attempt')}${button('learn.submit','Submit answer')}${button('learn.assessment','Open assessment')}${button('learn.lab','Open lab brief')}<output>${esc(learn.attempt?`${learn.attempt.id} · ${learn.attempt.state}`:'No attempt')}${learn.attempt?.feedback?` · ${esc(learn.attempt.feedback)}`:''}</output>`};
 reg('learn.start','LearnAdapter','Start practice',()=>{learn.start();renderPractice();wave3Assembly?.refreshContext()});
 reg('learn.submit','LearnAdapter','Submit answer',()=>{learn.submit(document.querySelector('#practiceAnswer').value);renderPractice();wave3Assembly?.refreshContext()},()=>learn.attempt?.state==='IN_PROGRESS'||'Start a practice attempt first');
 reg('learn.assessment','LearnAdapter','Open assessment',()=>workspace.dialog('Assessment',`<p>Prerequisites do not block navigation.</p><p>Which component owns canonical progress?</p><p><b>LearnAdapter</b> owns only local learning state. No grading provider is bound, and this action does not infer or write Mastery.</p>`,{safeOutside:true}));
 reg('learn.lab','LearnAdapter','Open lab brief',()=>workspace.dialog('Lab learning activity','<p>Learning brief: inspect a simulation status, shut down one device, compare before and after.</p><p>Opening this brief does not create a W03 runtime.</p>',{safeOutside:true}));
 renderPractice();workspace.toolbar(['learn.start','learn.assessment']);api.setMode('edit');
}
let stage=null,view='topology',recorded=null;
const isSpatial=['visualize','enterprise','runs'].includes(consumer);
if(isSpatial||consumer==='golden'){
 document.querySelector('#centerPane .docscroll').hidden=true;document.querySelector('#centerPane .docscroll').setAttribute('aria-hidden','true');document.querySelector('#centerPane .docscroll').inert=true;document.querySelector('#topBanner .badge').textContent=consumer==='runs'?'Simulation':consumer==='enterprise'?'W03 v3.4':consumer==='visualize'?'Representation':'Harness';document.querySelector('#topBanner .lock span').textContent='Local working state';document.querySelector('#topBanner').setAttribute('aria-label','Current work');document.querySelector('#centerPane').setAttribute('aria-label','Main workspace');document.querySelector('.toolbar').setAttribute('aria-label','Workspace toolbar');
 stage=document.createElement('div');stage.className='foundation-stage';stage.id='foundationStage';document.querySelector('#centerPane').append(stage);
 document.querySelector('#topBanner .title')?.replaceChildren(document.createTextNode(consumer==='runs'?'Run · Internal simulation':consumer==='enterprise'?'Enterprise · Local draft':consumer==='visualize'?'Knowledge relationships':'Golden Foundation Harness'));
}
function ensureRunOperationalContextProvider(){
 if(consumer!=='runs'||!simulation||!wave3Assembly?.contextInspector)return null;
 const id='operational-spatial-context';
 if(!runOperationalContextProvider)runOperationalContextProvider=defineContextDescriptorProvider({id,family:'operational',owner:'RunsOperationalContextProjection',isApplicable:()=>spatial?.model?.selection?.size>0,describe:()=>{const ids=[...spatial.model.selection],nodes=ids.map(value=>spatial.model.nodes.find(node=>node.id===value)).filter(Boolean),event=simulation.events.at(-1),descriptor=simulation.descriptor();return {id:`runs:${simulation.runId}:${ids.join('+')}:event-${event?.sequence||0}`,providerId:id,family:'operational',subject:ids.length===1?(nodes[0]?.label||ids[0]):`${ids.length} selected objects`,eyebrow:'Runs context / سياق التشغيل',summary:`Run ${simulation.runId} · ${simulation.run.lifecycle} · ${event?.output||'No live command events'}`,domainOwner:`${descriptor.id} + ${relations?.owner||'W03RunDomain.RecordedTopology'}`,revisionToken:`selection:${ids.join('+')}|event:${event?.sequence||0}|relations:${relations?.version||0}`,lenses:[{id:'runtime',label:'Runtime',tabs:[{id:'current',label:'Current',fields:[{id:'run-id',label:'Run',value:simulation.runId,technical:true},{id:'run-lifecycle',label:'Lifecycle',value:simulation.run.lifecycle,technical:true},{id:'event-sequence',label:'Latest event sequence',value:event?.sequence||0,technical:true},{id:'latest-event',label:'Latest event',value:event?.output||'No live command events',technical:true},...nodes.flatMap((node,index)=>[{id:`object-${index+1}`,label:node.label,value:node.id,technical:true},{id:`state-${index+1}`,label:'State',value:node.status||'Representation',technical:true}])]}]},{id:'relations',label:'Relations',tabs:[{id:'canonical',label:'Canonical',fields:[{id:'relation-owner',label:'Owner',value:relations?.owner||'W03RunDomain.RecordedTopology',technical:true},{id:'relation-version',label:'Version',value:relations?.version||0,technical:true}]}]}]};}});
 if(!wave3Assembly.contextInspector.providerIds().includes(id))wave3Assembly.contextInspector.registerProvider(runOperationalContextProvider);
 return id;
}
function refreshRunOperationalContext(){const id=ensureRunOperationalContextProvider();if(!id)return false;const activated=wave3Assembly.contextInspector.activate(id,{});if(!activated.ok)return false;const legacy=document.querySelector('#domainContext');if(legacy)legacy.hidden=true;wave3Assembly.renderContext();return true;}
function updateDomainContext(){if(!spatial)return;relationUI?.refresh();document.querySelectorAll('[data-foundation-command]').forEach(b=>{if(registry.commands.has(b.dataset.foundationCommand)){const a=registry.availability(b.dataset.foundationCommand);b.disabled=!a.enabled;b.title=a.reason}});const ids=[...spatial.model.selection],nodes=ids.map(id=>spatial.model.nodes.find(node=>node.id===id)).filter(Boolean);const provider=new ContextDescriptorProvider(simulation?'operational-spatial-context':'spatial-context',()=>({eyebrow:'Selection / التحديد',subject:`${ids.length} object(s)`,summary:simulation?`Run ${simulation.runId} · ${simulation.run.lifecycle} · ${simulation.events.at(-1)?.output||'No live command events'}`:'Canonical relationship workspace',fields:nodes.flatMap(node=>[{label:node.label,value:node.id,technical:true},{label:'State',value:node.status||'Representation'}]),actions:[{id:'spatial.connect',label:'Connect'},{id:'relation.edit',label:'Edit Relationship'},{id:'relation.undo',label:'Undo relation'},{id:'relation.redo',label:'Redo relation'},...(consumer==='runs'?[{id:'OPEN_TERMINAL',label:'Open terminal'}]:[]),{id:'foundation.note',label:'Add linked note'}],owner:`${relations?.owner} · version ${relations?.version}`,details:{label:'Canonical relationships',value:relations?.records||[]}}));if(wave3Assembly)wave3Assembly.refreshContext();else workspace.inspectorDescriptor(provider);if(wave3Assembly&&simulation)refreshRunOperationalContext();}
function renderDomainView(){if(spatial)spatial.setActiveMode(view==='recorded'?'recorded':consumer==='runs'?'live':'author');if(operational)operational.setReadOnly(view==='recorded',{render:false});const body=stage.querySelector('#domainView');const graph=stage.querySelector('#spatialHost');graph.hidden=view!=='topology';body.hidden=view==='topology';stage.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));if(view==='table'){body.innerHTML=`<table class="domain-table"><thead><tr><th>Object</th><th>ID</th><th>State</th><th>Action</th></tr></thead><tbody>${spatial.model.nodes.map(n=>`<tr><td>${esc(n.label)}</td><td>${esc(n.id)}</td><td>${esc(n.status||'Representation')}</td><td><button class="btn" data-select-object="${n.id}">Inspect</button></td></tr>`).join('')}</tbody></table>`;body.querySelectorAll('[data-select-object]').forEach(b=>b.onclick=event=>{spatial.model.select(b.dataset.selectObject);updateDomainContext();api.setPaneState('right','open')})}if(view==='history'){body.innerHTML=`<h2>${consumer==='runs'?'Simulation event history':'Representation history'}</h2><pre>${esc(JSON.stringify(simulation?.events||{undoDepth:spatial.model.history.length,edges:spatial.model.edges},null,2))}</pre>`}if(view==='recorded'){body.innerHTML=`<h2>Recorded result · Read only</h2><p>Captured ${recorded?.events.length||0} events. This view does not execute commands.</p><pre>${esc(JSON.stringify(recorded,null,2))}</pre>`}if(operational)operational.render();updateDomainContext();}
if(isSpatial){
 if(consumer==='runs')simulation=new W03V34RunsAdapter();
 if(consumer==='enterprise')relations=createEnterpriseAdapter();
 const nodes=relations?relations.nodes:simulation?simulation.devices.map((d,i)=>({id:d.id,label:d.name,x:80+i*210,y:120+(i%2)*130,status:d.up===null?'NOTE':d.up?'UP':'DOWN'})):BALANCED6_VISUALIZE_REPRESENTATIONS.map(item=>({id:item.representationId,label:item.label,x:item.x,y:item.y,status:'Local acceptance projection',canonicalRef:item.canonicalRef}));
 const edges=relations?relations.project():simulation?[{id:'edge-1',source:'DEV-WEB-01',target:'DEV-DB-01',type:'RECORDED_PATH',direction:'directed'},{id:'edge-2',source:'DEV-DB-01',target:'DEV-SIEM-01',type:'RECORDED_TELEMETRY',direction:'directed'}]:[{id:'b6-rel-d03-0001-0004',source:'b6-rep-ku-d03-0001',target:'b6-rep-ku-d03-0004',type:'SOURCE_DECLARED_RELATED',kind:'representation',canonical:false},{id:'b6-rel-d03-0004-0001',source:'b6-rep-ku-d03-0004',target:'b6-rep-ku-d03-0001',type:'SOURCE_DECLARED_RELATED',kind:'representation',canonical:false}];
 if(!capabilities.capabilities.has('RELATION_AUTHOR'))capabilities.register('RELATION_AUTHOR',relations?.owner||'RelationDomainAdapter',()=>!relations?.readOnly||'Relationship source is recorded/read-only');
 if(simulation&&!capabilities.capabilities.has('OPEN_TERMINAL'))capabilities.register('OPEN_TERMINAL',simulation.descriptor().id,p=>view==='recorded'?'Recorded Results are read only':simulation.capable(p.objectId)?true:'Select a terminal-capable device');
 if(!relations)relations=new RelationDomainAdapter({owner:simulation?'W03RunDomain.RecordedTopology':'VisualizeDomain.LocalAcceptanceProjection',nodes,relations:edges,readOnly:!!simulation||consumer==='visualize'});
 if(consumer!=='enterprise'){
  stage.innerHTML=`<header class="domain-heading"><strong>${consumer==='runs'?'RUN-0042 · Internal simulation':'Relationship workspace'}</strong><button class="btn" data-view="topology">Topology</button><button class="btn" data-view="table">Objects</button><button class="btn" data-view="history">History</button>${consumer==='runs'?'<button class="btn" data-view="recorded">Recorded result</button>':''}</header><div id="spatialHost" class="spatial-host"></div><div id="domainView" class="domain-readonly" hidden></div><div id="operationalHost" hidden></div>`;
 spatial=new SpatialView(stage.querySelector('#spatialHost'),nodes,edges,{select:()=>updateDomainContext(),context:(x,y)=>workspace.menu(['spatial.fit','spatial.connect','relation.edit','spatial.align','spatial.distribute',...(simulation?['OPEN_TERMINAL']:[]),'foundation.note'],x,y),open:id=>{if(simulation?.capable(id))api.Commands.execute('OPEN_TERMINAL',{deviceId:id,route:'canvas-doubleclick'});else updateDomainContext()},relation:id=>{relationUI.selectEdge(id);api.Commands.execute('relation.edit',{id,route:'canvas-relation'});},edgeSelect:id=>relationUI?.selectEdge(id),change:()=>relationUI?.refresh()});
 reg('spatial.fit','SpatialInteractionKernel','Fit',()=>spatial.fit());reg('spatial.zoomIn','SpatialInteractionKernel','＋',()=>spatial.zoom(1.25));reg('spatial.zoomOut','SpatialInteractionKernel','−',()=>spatial.zoom(.8));
 relationUI=new RelationInteraction(workspace,spatial,relations,()=>{updateDomainContext();if(view!=='topology')renderDomainView()});
 reg('spatial.align','SpatialInteractionKernel','Align',()=>{spatial.model.align('y');spatial.render()},()=>spatial.model.geometryMutationAvailability({minimumSelection:2,action:'spatial.align'}));
 reg('spatial.distribute','SpatialInteractionKernel','Distribute',()=>{spatial.model.distribute('x');spatial.render()},()=>spatial.model.geometryMutationAvailability({minimumSelection:3,action:'spatial.distribute'}));
 reg('spatial.undo','SpatialInteractionKernel','Undo view change',()=>{spatial.model.undo();spatial.render()},()=>spatial.model.geometryMutationAvailability({action:'spatial.undo'}));reg('spatial.redo','SpatialInteractionKernel','Redo view change',()=>{spatial.model.redo();spatial.render()},()=>spatial.model.geometryMutationAvailability({action:'spatial.redo'}));
 stage.querySelectorAll('[data-view]').forEach(b=>{reg('view.'+b.dataset.view,'WorkspaceView',b.textContent,()=>{view=b.dataset.view;if(view==='recorded')recorded=simulation.recorded();renderDomainView()});b.onclick=()=>api.Commands.execute('view.'+b.dataset.view,{route:'view-switcher'})});
 if(simulation){
  const update=()=>{for(const n of spatial.model.nodes){const d=simulation.devices.find(d=>d.id===n.id);n.status=d.up===null?'NOTE':d.up?'UP':'DOWN'}spatial.render();renderDomainView()};
  const providerId=simulation.descriptor().id,owner=()=>wave4Assembly?.operationalSession,activeTab=()=>owner()?.activeTab?.()||null;
  const renderOperational=options=>{if(operational)return operational.render(options);return null};
  reg('OPEN_TERMINAL',providerId,'Open terminal',p=>{const id=p.deviceId||[...spatial.model.selection][0],session=simulation.open(id),tab=wave4Assembly?.attachRuntimeSession(session);if(!tab)throw Error('OPERATIONAL_SESSION_OWNER_UNAVAILABLE');operational?.captureReturnFocus(p.invoker||document.activeElement);renderOperational({focusInput:tab.presentationId});return tab},p=>capabilities.inspect('OPEN_TERMINAL',{objectId:p.deviceId||[...spatial.model.selection][0]}).enabled||capabilities.inspect('OPEN_TERMINAL',{objectId:p.deviceId||[...spatial.model.selection][0]}).reason);
  reg('runtime.input',providerId,'Send runtime input',p=>{const tab=p.presentationId?owner()?.tab(p.presentationId):activeTab(),sessionId=p.sessionId||p.runtimeSessionId||tab?.runtimeSessionId;if(!sessionId)throw Error('LIVE_RUNTIME_SESSION_REQUIRED');const receipt=simulation.input(sessionId,p.command,p.invocationId);update();return receipt},p=>view!=='recorded'&&simulation.connected!==false&&(!!(p.sessionId||p.runtimeSessionId||p.presentationId||activeTab()))||'Live session required');
  reg('runtime.disconnect',providerId,'Disconnect provider',()=>{simulation.disconnect();update();return simulation.descriptor()},()=>view!=='recorded'||'Recorded Results are read only');
  reg('runtime.reconnect',providerId,'Reconnect session',()=>{const tab=activeTab();if(!tab)throw Error('LIVE_RUNTIME_SESSION_REQUIRED');const session=simulation.reconnect(tab.runtimeSessionId);update();return session},()=>view!=='recorded'&&!!activeTab()||'Live session required');
  reg('session.dock','OperationalSessionOwner','Dock',()=>{owner().setLayout('single');owner().setPlacement('bottom');return renderOperational({focusTab:activeTab()?.presentationId||null})},()=>!!activeTab()||'Open a runtime session first');
  reg('session.float','OperationalSessionOwner','Float',()=>{owner().setLayout('single');owner().setPlacement('floating');return renderOperational({focusTab:activeTab()?.presentationId||null})},()=>!!activeTab()||'Open a runtime session first');
  reg('session.split','OperationalSessionOwner','Split',()=>{owner().setPlacement('bottom');owner().setLayout('split');return renderOperational({focusTab:activeTab()?.presentationId||null})},()=>owner()?.tabsSnapshot().length>=2||'Open a second runtime session before split view.');
  reg('session.minimize','OperationalSessionOwner','Minimize',()=>{const o=owner();if(o.snapshot().chrome.lifecycle==='minimized')o.restoreChrome();else o.minimizeChrome();return renderOperational({focusTab:activeTab()?.presentationId||null})},()=>!!activeTab()||'Open a runtime session first');
  reg('session.close','OperationalSessionOwner','Close session presentation',()=>operational?.closePresentation(),()=>!!activeTab()||'Open a runtime session first');
  reg('session.tab-left','OperationalSessionOwner','Move selected tab left',()=>{const tab=activeTab();owner().reorderTab(tab.presentationId,-1);return renderOperational({focusTab:tab.presentationId})},()=>!!activeTab()||'Open a runtime session first');
  reg('session.tab-right','OperationalSessionOwner','Move selected tab right',()=>{const tab=activeTab();owner().reorderTab(tab.presentationId,1);return renderOperational({focusTab:tab.presentationId})},()=>!!activeTab()||'Open a runtime session first');
  reg('session.select','OperationalSessionOwner','Select session',p=>{owner().selectTab(p.id||p.presentationId);return renderOperational({focusTab:p.id||p.presentationId})},p=>!!owner()?.tab(p.id||p.presentationId)||'Choose a session');
  reg('session.detach','OperationalSessionOwner','Close visible tab',p=>{const id=p.id||p.presentationId,tab=owner()?.tab(id);owner().closeTab(id);renderOperational({focusTab:activeTab()?.presentationId||null});return {presentationId:id,runtimeSessionId:tab?.runtimeSessionId,providerSessionPreserved:true}},p=>!!owner()?.tab(p.id||p.presentationId)||'Choose a session');
  reg('session.geometry','OperationalSessionOwner','Move / Resize',()=>{const o=owner(),g=o.snapshot().chrome.geometry;return workspace.dialog('Window position and size',`<form id="geometryForm">${Object.entries(g).map(([k,v])=>`<label>${k}<input name="${k}" type="number" value="${v}"></label>`).join('')}<button class="btn">Apply</button></form>`,{onMount:bd=>bd.querySelector('form').onsubmit=e=>{e.preventDefault();const f=e.target,next={};for(const k of Object.keys(g))next[k]=Number(f.elements[k].value);o.setGeometry(next);workspace.closeDialog();renderOperational({focusTab:activeTab()?.presentationId||null})}})},()=>owner()?.snapshot().chrome.placement==='floating'||'Float the session presentation first');
  for(const action of ['pause','resume'])reg('runs.'+action,'W03V34RunsAdapter',action+' run',()=>{simulation.lifecycle(action);update()},()=>view!=='recorded'&&(action==='pause'?simulation.run.lifecycle==='RUNNING':simulation.run.lifecycle==='PAUSED')||'Run lifecycle does not allow this operation');
  spatial.model.select('DEV-WEB-01');
 }
 workspace.toolbar(['spatial.fit','spatial.zoomIn','spatial.zoomOut','spatial.connect',...(simulation?['OPEN_TERMINAL']:[])]);
 const left=document.querySelector('#leftPane .pbody');left.innerHTML=`<h3>Workspace views</h3>${['topology','table','history',...(simulation?['recorded']:[])].map(v=>button('view.'+v,v)).join('')}<h3>Objects</h3><div id="objectList">${nodes.map(n=>`<button class="btn object-entry" data-object="${n.id}">${esc(n.label)}</button>`).join('')}</div>`;
 left.querySelectorAll('[data-object]').forEach(b=>{b.onclick=event=>{spatial.model.select(b.dataset.object,event.shiftKey||event.ctrlKey||event.metaKey);spatial.render();updateDomainContext()};b.ondblclick=()=>{if(simulation?.capable(b.dataset.object))api.Commands.execute('OPEN_TERMINAL',{deviceId:b.dataset.object,invoker:b,route:'object-doubleclick'})}});
 workspace.onPreferences=p=>{spatial.grid=p.grid;spatial.minimap=p.minimap;spatial.model.snap=p.snap;spatial.render();const host=stage.querySelector('#spatialHost');host.querySelector('.spatial-legend')?.remove();if(p.guidance){const legend=document.createElement('aside');legend.className='spatial-legend';legend.innerHTML='<strong>Spatial input</strong><p>Drag blank space: select<br>Drag object: move<br>Space + drag: pan<br>Ctrl + wheel: zoom</p>'+button('foundation.guidance','Hide guidance');host.append(legend)}};
  renderDomainView();requestAnimationFrame(()=>spatial.fit());
 }
}
if(consumer==='golden'){
 stage.style.overflow='auto';stage.innerHTML=`<div class="golden-grid"><section><h2>Workspace slots</h2>${['left','right','bottom','focus'].map(k=>button('foundation.'+k,k)).join('')}<p>Internal close · external reveal · palette route</p></section><section><h2>Actions and focus</h2>${button('foundation.palette','Command Palette')}${button('foundation.context','Context Actions')}${button('foundation.settings','Settings')}${button('foundation.note','Linked note')}</section><section><h2>Presentation</h2>${button('foundation.theme','Cycle theme')}${button('foundation.guidance','Guidance')}<p>Language, direction, density, scope and reset are inspectable in Settings.</p></section><section><h2>Truth states</h2>${['empty','stale','unavailable','error','user-hidden'].map(s=>`<div class="state-token" data-state="${s}">${s}</div>`).join('')}</section><section><h2>Evidence harness</h2><a class="btn" href="tests.html">Run model contracts</a><p>Model tests do not constitute browser or Owner acceptance.</p></section><section><h2>Mixed Bidi</h2><p dir="rtl">تحقق من <bdi dir="ltr">TCP/IP</bdi> و <bdi dir="ltr">policy.can()</bdi> قبل المتابعة.</p><p dir="ltr">Reference: <bdi dir="rtl">حدود الثقة</bdi> · IEEE 802.11</p></section></div>`;
 workspace.toolbar(['foundation.left','foundation.right','foundation.bottom']);
}
wave3Assembly=mountWave3GlobalAssembly({commandBus,transientOwner,preferences,api,workspace,consumer,family,structured,learn,spatial,relations,simulation,feedbackOwner});
wave4Assembly=mountWave4FamilyInteractionAssembly({commandBus,transientOwner,preferences,wave3Assembly,structured,consumer,family,simulation,document});
if(consumer==='runs'&&wave4Assembly?.operationalSession){wave4Assembly.operationalSession.platformWindowBridge=platformWindowBridge;const tp=new URLSearchParams(location.search);if(tp.get('terminal')==='conpty'){windowsTerminal=new WindowsTerminalRuntimeAdapter();try{const existingSessionId=tp.get('terminalSessionId'),executable=tp.get('terminalExe')||'powershell.exe',args=tp.getAll('terminalArg'),cwd=tp.get('terminalCwd')||undefined,label=tp.get('terminalLabel')||executable;const realSession=existingSessionId?await windowsTerminal.attachSession(existingSessionId,{label}):await windowsTerminal.openProfile({executable,args,cwd,label,cols:120,rows:30});wave4Assembly.operationalSession.attachProviderSession(windowsTerminal,realSession.id,{classification:'REAL_RUNTIME_PROVIDER',evidenceRole:existingSessionId?'windows-conpty-detached-existing-session':'windows-conpty-real-consumer'});}catch(error){workspace?.status?.(`Windows terminal unavailable · ${String(error?.message||error)}`,'error')}}}
if(consumer==='runs'&&simulation&&wave4Assembly?.operationalSession){operational=new OperationalTerminalHost(stage.querySelector('#operationalHost'),wave4Assembly.operationalSession,{routeInput:input=>{const tab=wave4Assembly.operationalSession.tab(input.presentationId);if(tab?.providerId==='WindowsConptyRuntimeAdapter')return windowsTerminal?.input(tab.runtimeSessionId,input.rawInput);return api.Commands.execute('runtime.input',{presentationId:input.presentationId,runtimeSessionId:input.runtimeSessionId,sessionId:input.runtimeSessionId,command:input.rawInput,invocationId:input.invocationId,route:'operational-terminal-host'})},routeResize:size=>{const tab=wave4Assembly.operationalSession.tab(size.presentationId);if(tab?.providerId==='WindowsConptyRuntimeAdapter')return windowsTerminal?.resize(tab.runtimeSessionId,size.cols,size.rows)},onError:error=>workspace.status(String(error?.message||error),'error'),routeRestart:async input=>{const tab=wave4Assembly.operationalSession.tab(input.presentationId);if(!tab)throw Error('OPERATIONAL_SESSION_NOT_FOUND');if(tab.providerId==='WindowsConptyRuntimeAdapter'){if(!windowsTerminal)throw Error('WINDOWS_CONPTY_PROVIDER_UNAVAILABLE');return windowsTerminal.restart(tab.runtimeSessionId)}const session=simulation.reconnect(tab.runtimeSessionId);return {id:session.id,restarted:true,providerId:tab.providerId}},onGeometryRequest:()=>api.Commands.execute('session.geometry',{route:'operational-terminal-host'}),onDetachRequest:tab=>wave4Assembly.operationalSession.detachWindow({url:null})});operational.render();renderDomainView();}
const handleShellNavigate = async (destination: string) => {
  if (destination === window.CEPFoundation?.consumer) return true;
  if (window.CEPFoundation) window.CEPFoundation.consumer = destination;
  document.body.dataset.consumer = destination;
  document.body.dataset.globalShellSurface = destination;
  const donorDoc = document.querySelector<HTMLElement>('#editorDocument');
  const stage = document.querySelector<HTMLElement>('#foundationStage');
  if (destination === 'today') {
    if (donorDoc) donorDoc.hidden = true;
    if (stage) stage.hidden = false;
    await mountM0ControllerComposition({
      consumer: 'today',
      registry,
      commandBus,
      workspace,
      structured,
      learn,
      relations,
      simulation,
      wave3Assembly,
      wave4Assembly,
      api,
      button,
      esc,
      shellNavigation,
      analyticalCompareOwner,
      timelineReplayOwner,
      reviewAuthorityRegistry
    });
    workspace.applyPreferences();
    return true;
  } else if (destination === 'library') {
    if (stage) stage.hidden = true;
    if (donorDoc) donorDoc.hidden = false;
    workspace.applyPreferences();
    return true;
  }
  return true;
};
if(shellRoute.kind==='product')shellNavigation=mountGlobalShellNavigation({surface:consumer,workspace,api,preferences,noteRuntime,destinationRegistry:CEP_PRODUCT_DESTINATION_REGISTRY,onNavigate:handleShellNavigate});
const m0Composition=await mountM0ControllerComposition({consumer,registry,commandBus,workspace,structured,learn,relations,simulation,wave3Assembly,wave4Assembly,api,button,esc,shellNavigation,analyticalCompareOwner,timelineReplayOwner,reviewAuthorityRegistry});
workspace.applyPreferences();
if(false&&spatial){let previousSize='';const observer=new ResizeObserver(()=>{const key=spatial.svg.clientWidth+'x'+spatial.svg.clientHeight;if(key!==previousSize&&spatial.svg.clientWidth>0){previousSize=key;spatial.fit()}});observer.observe(spatial.host)}
const actionSurfaces=new ActionSurfaceRegistry(registry);
actionSurfaces.register('command-palette','WorkspaceFoundation',{presentation:'donor CommandPalette',routes:['global button','keyboard'],commands:['foundation.palette'],exitRoutes:['close button','Escape','backdrop']});
actionSurfaces.register('context-actions','WorkspaceFoundation',{presentation:'compact menu',routes:['RMB','Shift+F10','global action'],commands:['foundation.context'],exitRoutes:['Close item','Escape','outside pointer']});
if(relationUI){actionSurfaces.register('selection-actions','RelationInteractionOwner',{presentation:'selection-anchored compact toolbar',routes:['multi-selection'],commands:['spatial.connect'],exitRoutes:['dismiss button','selection change','Escape via composer']});actionSurfaces.register('relation-composer','RelationInteractionOwner',{presentation:'anchored non-modal dialog',routes:['selection Connect','edge double-click','edge F2/Enter','RMB','Inspector','Command Palette'],commands:['relation.edit','spatial.relation.commit'],exitRoutes:['Cancel','close button','Escape','safe outside pointer','Apply']})}
actionSurfaces.validate();
window.CEPFoundation={consumer,family,api,commandBus,registry,capabilities,actionSurfaces,transientOwner,feedbackOwner,preferences,workspace,structured,noteRuntime,spatial:m0Composition?.presentation?.spatial?.()||spatial,operational,simulation,learn,relations,relationUI,wave3Assembly,wave4Assembly,shellNavigation,shellRoute,m0Composition,sharedOwners:{analyticalCompareOwner,timelineReplayOwner,reviewAuthorityRegistry,operationalSessionOwner:wave4Assembly?.operationalSession||null},persistence:{client:persistenceClient,bootstrap:persistenceBootstrap},platform:{inputDirectionBridge:platformInputDirectionBridge,windowBridge:platformWindowBridge},windowsTerminal,classification:'WAVE6_CONTROLLER_CONVERGED_NOTES_FAMILY'};
// Visible source identity for reproducible evidence, never a claim of product acceptance.
document.documentElement.dataset.foundationVersion='0.2.1';

// Diagnostics are assurance-only and never consume normal product geometry.
const diagnosticsEnabled=new URLSearchParams(location.search).get('diagnostics')==='foundation';
if(diagnosticsEnabled){const diagnostics=document.createElement('details');diagnostics.id='foundationDiagnostics';diagnostics.dataset.assuranceOnly='true';diagnostics.innerHTML='<summary>Proof state</summary><pre dir="ltr"></pre>';document.querySelector('#domainContext')?.parentElement.append(diagnostics);setInterval(()=>{if(diagnostics.open)diagnostics.querySelector('pre').textContent=JSON.stringify({consumer,commands:registry.receipts.slice(-12),domainOwner:relations?.owner,canonicalVersion:relations?.version,canonical:relations?.records,projection:spatial?.model.edges,devices:simulation?.devices,events:simulation?.events,sessions:wave4Assembly?.operationalSession?.tabsSnapshot?.().map(tab=>({presentationId:tab.presentationId,runtimeSessionId:tab.runtimeSessionId,identity:tab.runtimeIdentity,lines:wave4Assembly.operationalSession.readRuntimeSession(tab.presentationId)?.lines||[]})),run:simulation?.run,preferences:preferences.values(),effectivePanes:{left:api.effectivePaneState('left'),right:api.effectivePaneState('right')},relationPolicy:relationUI?.policyRevision},null,2)},300);}
