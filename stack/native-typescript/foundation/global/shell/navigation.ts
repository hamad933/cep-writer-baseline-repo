import {DEFAULT_SHELL_DESTINATION_REGISTRY,ShellDestinationRegistry} from './destination-registry.js';
import type {ShellProductSurface} from './destination-registry.js';
export type {ShellProductSurface,ShellDestinationDescriptor} from './destination-registry.js';

const escapeHTML=(value:string)=>String(value??'').replace(/[&<>"']/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'} as Record<string,string>)[char]);
export type ShellSurface=ShellProductSurface|'golden';
export const GLOBAL_SHELL_OWNER='GlobalShellNavigationOwner';
const SCROLL_TARGETS=Object.freeze([
  Object.freeze({key:'center-document',selector:'#centerPane .docscroll'}),
  Object.freeze({key:'center-pane',selector:'#centerPane'}),
  Object.freeze({key:'left-pane',selector:'#leftPane .pbody'}),
  Object.freeze({key:'right-pane',selector:'#rightPane .pbody'}),
  Object.freeze({key:'bottom-content',selector:'#bottomContent'}),
  Object.freeze({key:'foundation-stage',selector:'#foundationStage'})
]);

export function resolveGlobalShellRoute(search:string|URLSearchParams,destinationRegistry:ShellDestinationRegistry=DEFAULT_SHELL_DESTINATION_REGISTRY){
  const params=typeof search==='string'?new URLSearchParams(search):search;
  const raw=params.get('surface'),requested=raw===null?destinationRegistry.defaultId:raw;
  if(raw===null)return {requested,surface:destinationRegistry.defaultId,kind:'product' as const,fallback:false};
  if(destinationRegistry.has(raw))return {requested,surface:raw,kind:'product' as const,fallback:false};
  if(raw==='golden')return {requested,surface:'golden' as const,kind:'harness' as const,fallback:false};
  return {requested,surface:destinationRegistry.defaultId,kind:'product' as const,fallback:true};
}

export function canonicalizeGlobalShellRoute(search:string|URLSearchParams,href:string=location.href,destinationRegistry:ShellDestinationRegistry=DEFAULT_SHELL_DESTINATION_REGISTRY){
  const route=resolveGlobalShellRoute(search,destinationRegistry);
  if(route.kind!=='product'||!route.fallback)return {route,required:false,href};
  const url=new URL(href);url.searchParams.set('surface',route.surface);url.hash='';
  return {route,required:true,href:url.toString()};
}

export function isProductDestination(value:string,destinationRegistry:ShellDestinationRegistry=DEFAULT_SHELL_DESTINATION_REGISTRY):value is ShellProductSurface{return destinationRegistry.has(value)}

export interface ShellSemanticContextProvider {
  surface: ShellProductSurface;
  capture: () => Record<string, any> | undefined;
  restore: (context: Record<string, any>) => Promise<boolean | void> | boolean | void;
}

interface ShellBookmark{
  schemaVersion:1;
  owner:string;
  surface:ShellProductSurface;
  href:string;
  capturedAt:string;
  windowScroll:{x:number;y:number};
  scroll:Array<{key:string;top:number;left:number}>;
  focus:null|{id?:string;blockId?:string;objectId?:string;commandId?:string;destination?:string;history?:string};
  surfaceContext?:Record<string, any>;
}

interface NoteTransactionDirtySource{
  descriptor:()=>{notes?:Array<string>};
  transactionDescriptor:(noteId:string)=>{dirty?:boolean};
}

export type ShellNavigateHandler = (destination: ShellProductSurface, options?: any) => Promise<boolean | void> | boolean | void;

interface ShellOptions{
  surface:ShellProductSurface;
  workspace:any;
  api:any;
  preferences:any;
  noteRuntime?:NoteTransactionDirtySource|null;
  destinationRegistry?:ShellDestinationRegistry;
  onNavigate?:ShellNavigateHandler;
}

export class GlobalShellNavigationOwner{
  owner=GLOBAL_SHELL_OWNER;
  surface:ShellProductSurface;
  workspace:any;
  api:any;
  preferences:any;
  noteRuntime:NoteTransactionDirtySource|null;
  destinationRegistry:ShellDestinationRegistry;
  host:HTMLElement;
  observer:MutationObserver|null=null;
  storage:Storage|null=null;
  lastDirection='';
  lastLanguage='';
  onNavigate:ShellNavigateHandler|null=null;
  private contextProviders = new Map<string, ShellSemanticContextProvider>();

  registerContextProvider(provider: ShellSemanticContextProvider){
    this.contextProviders.set(provider.surface, provider);
  }

  unregisterContextProvider(surface: string){
    this.contextProviders.delete(surface);
  }

  private clickHandler:(event:MouseEvent)=>void;
  private keyHandler:(event:KeyboardEvent)=>void;
  private pagehideHandler:()=>void;
  private beforeUnloadHandler:(event:BeforeUnloadEvent)=>void;
  private popstateHandler:(event:PopStateEvent)=>void;

  constructor(options:ShellOptions){
    this.destinationRegistry=options.destinationRegistry||DEFAULT_SHELL_DESTINATION_REGISTRY;
    if(!isProductDestination(options.surface,this.destinationRegistry))throw Error('GLOBAL_SHELL_REAL_PRODUCT_SURFACE_REQUIRED');
    this.surface=options.surface;this.workspace=options.workspace;this.api=options.api;this.preferences=options.preferences;this.noteRuntime=options.noteRuntime??null;
    this.onNavigate=options.onNavigate||null;
    const legacy=document.querySelector<HTMLElement>('.foundation-shell');
    if(!legacy)throw Error('GLOBAL_SHELL_HOST_MISSING');
    this.host=legacy;
    try{this.storage=sessionStorage}catch{this.storage=null}
    this.clickHandler=event=>this.onClick(event);
    this.keyHandler=event=>this.onKeydown(event);
    this.pagehideHandler=()=>this.captureCurrentContext('pagehide');
    this.beforeUnloadHandler=event=>{if(!this.isDirty())return;event.preventDefault();event.returnValue='';};
    this.popstateHandler=event=>this.onPopState(event);
    this.adoptHost();
    this.render();
    this.host.addEventListener('click',this.clickHandler);
    this.host.addEventListener('keydown',this.keyHandler);
    window.addEventListener('pagehide',this.pagehideHandler);
    window.addEventListener('beforeunload',this.beforeUnloadHandler);
    window.addEventListener('popstate',this.popstateHandler);
    this.observer=new MutationObserver(()=>this.syncLocaleDirection());
    this.observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});
    this.restoreOnArrival();
  }

  adoptHost(){
    this.host.dataset.owner=GLOBAL_SHELL_OWNER;
    this.host.dataset.presentation='global-shell-navigation';
    this.host.setAttribute('aria-label',this.language()==='ar'?'التنقل العام في CEP':'CEP global navigation');
    document.body.dataset.globalShellOwner=GLOBAL_SHELL_OWNER;
    document.body.dataset.globalShellSurface=this.surface;
  }

  language(){return document.documentElement.lang==='en'?'en':'ar'}
  direction(){return document.documentElement.dir==='ltr'?'ltr':'rtl'}
  destinations(){return this.destinationRegistry.list()}
  globalAreas(){return this.destinationRegistry.globalAreas()}
  destination(id:ShellProductSurface){const destination=this.destinationRegistry.get(id);if(!destination)throw Error('GLOBAL_SHELL_DESTINATION_NOT_REGISTERED:'+id);return destination}
  activeArea(){return this.destination(this.surface).area}
  label(id:ShellProductSurface){const item=this.destination(id);return item.labels[this.language()]}
  description(id:ShellProductSurface){const item=this.destination(id);return item.description[this.language()]}
  areaBookmarkKey(area:string){return `cep:shell:area-last:${area}`}
  rememberAreaDestination(destination:ShellProductSurface){
    if(destination==='shell')return false;
    const item=this.destinationRegistry.get(destination);if(!item)return false;
    try{this.storage?.setItem(this.areaBookmarkKey(item.area),destination);return true}catch{return false}
  }
  areaDestination(area:string){
    const descriptor=this.globalAreas().find(item=>item.id===area);
    if(!descriptor)throw Error('GLOBAL_SHELL_AREA_NOT_REGISTERED:'+area);
    if(this.surface!=='shell'&&this.activeArea()===area)return this.surface;
    let remembered='';try{remembered=this.storage?.getItem(this.areaBookmarkKey(area))||''}catch{}
    if(remembered&&this.destinationRegistry.has(remembered)&&this.destinationRegistry.area(remembered)===area&&remembered!=='shell')return remembered;
    return descriptor.defaultSurfaceId;
  }

  render(){
    const lang=this.language(),dir=this.direction(),area=this.activeArea(),active=this.destination(this.surface);
    this.lastLanguage=lang;this.lastDirection=dir;
    this.rememberAreaDestination(this.surface);
    const destinations=this.destinations(),globalAreas=this.globalAreas();
    const destinationLinks=globalAreas.map(item=>{
      const target=this.areaDestination(item.id),current=item.id===area;
      return `<a class="global-shell-destination" href="${escapeHTML(this.destinationURL(target))}" data-shell-area="${item.id}" data-shell-destination="${target}" ${current?'aria-current="page"':''}><span class="global-shell-destination-label">${escapeHTML(item.labels[lang])}</span><bdi class="global-shell-area-token" dir="ltr">${item.id}</bdi></a>`;
    }).join('');
    const areaLinks=destinations.filter(item=>item.area===area&&item.id!=='shell').map(item=>`<a class="global-shell-context-link" href="${escapeHTML(this.destinationURL(item.id))}" data-shell-destination="${item.id}" ${item.id===this.surface?'aria-current="page"':''}>${escapeHTML(item.labels[lang])}</a>`).join('');
    const copy=lang==='ar'?{
      product:'مساحة CEP الشخصية',context:'المساحة الحالية',command:'بحث أو أمر',settings:'الإعدادات',back:'رجوع',forward:'تقدّم',local:'محلي · مالك واحد'
    }:{product:'Personal CEP workspace',context:'Current area',command:'Search or command',settings:'Settings',back:'Back',forward:'Forward',local:'Local · single owner'};
    const brandTarget=this.areaDestination('W01');
    this.host.setAttribute('aria-label',lang==='ar'?'التنقل العام في CEP':'CEP global navigation');
    this.host.innerHTML=`<div class="global-shell-primary" data-shell-region="primary"><a class="global-shell-brand" href="${escapeHTML(this.destinationURL(brandTarget))}" data-shell-destination="${brandTarget}" aria-label="CEP · ${escapeHTML(copy.product)}"><span class="global-shell-brandmark" aria-hidden="true">C</span><span class="global-shell-brandcopy"><strong>CEP</strong><small>${escapeHTML(copy.product)}</small></span></a><nav class="global-shell-destinations" tabindex="-1" aria-label="${lang==='ar'?'وجهات CEP':'CEP destinations'}" data-shell-destination-count="${globalAreas.length}" data-shell-route-count="${destinations.length}" data-shell-destination-count-frozen="false">${destinationLinks}</nav><div class="global-shell-tools" aria-label="${lang==='ar'?'أدوات عامة':'Global tools'}"><button class="btn global-shell-tool" type="button" data-foundation-command="foundation.palette" aria-label="${escapeHTML(copy.command)}"><span aria-hidden="true">⌘</span><span>${escapeHTML(copy.command)}</span><bdi class="global-shell-shortcut" dir="ltr">Ctrl K</bdi></button><button class="btn global-shell-tool global-shell-settings" type="button" data-foundation-command="foundation.settings" aria-label="${escapeHTML(copy.settings)}"><span aria-hidden="true">⚙</span><span>${escapeHTML(copy.settings)}</span></button></div></div><div class="global-shell-contextbar" data-shell-region="context"><div class="global-shell-context-title"><span>${escapeHTML(copy.context)}</span><bdi dir="ltr">${area}</bdi><strong>${escapeHTML(active.labels[lang])}</strong><small>${escapeHTML(active.description[lang])}</small></div><nav class="global-shell-area-nav" aria-label="${lang==='ar'?`تنقل ${area}`:`${area} navigation`}">${areaLinks}</nav><div class="global-shell-history" aria-label="${lang==='ar'?'سجل التنقل':'Navigation history'}"><button class="btn" type="button" data-shell-history="back" aria-label="${escapeHTML(copy.back)}" title="${escapeHTML(copy.back)}">←</button><button class="btn" type="button" data-shell-history="forward" aria-label="${escapeHTML(copy.forward)}" title="${escapeHTML(copy.forward)}">→</button><span class="global-shell-local">${escapeHTML(copy.local)}</span></div></div>`;
  }

  syncLocaleDirection(){
    const lang=this.language(),dir=this.direction();
    if(lang===this.lastLanguage&&dir===this.lastDirection)return;
    const active=document.activeElement as HTMLElement|null;
    const shellFocus=active&&this.host.contains(active)?this.focusIdentity(active):null;
    this.render();
    if(shellFocus)queueMicrotask(()=>this.restoreFocusIdentity(shellFocus,{shellFallback:true}));
  }

  destinationURL(destination:ShellProductSurface){
    const url=new URL(location.href);url.searchParams.set('surface',destination);url.hash='';return url.toString();
  }

  focusDestinationHeading(){
    const heading=document.querySelector<HTMLElement>('#foundationStage h1, #foundationStage h2, #domainStage h1, #domainStage h2, #centerPane h1, #centerPane h2');
    if(heading){if(!heading.hasAttribute('tabindex'))heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});return {ok:true,status:'DESTINATION_HEADING_FOCUSED',surface:this.surface};}
    const fallback=this.currentDestinationControl()||this.host.querySelector<HTMLElement>('.global-shell-destinations');fallback?.focus?.({preventScroll:true});
    return {ok:!!fallback,status:fallback?'SHELL_DESTINATION_FOCUSED':'DESTINATION_HEADING_NOT_FOUND',surface:this.surface};
  }

  isDirty(){
    const editor=this.api?.state?.editor;
    if(editor?.dirty===true)return true;
    if(new Set(['editing','dirty','autosaving','saving','not-persisted','failed','ambiguous','recovery','conflict']).has(String(editor?.saveState||'')))return true;
    if(this.noteRuntime){
      let ids:Array<string>=[];
      try{ids=this.noteRuntime.descriptor()?.notes||[]}catch{ids=[]}
      for(const id of ids)try{if(this.noteRuntime.transactionDescriptor(id)?.dirty===true)return true}catch{}
    }
    return false;
  }

  blockDirtyDeparture(destination:ShellProductSurface,invoker:Element|null){
    const lang=this.language(),target=this.label(destination);
    const title=lang==='ar'?'تغييرات غير محفوظة':'Unsaved changes';
    const body=lang==='ar'
      ? `<p>لم يتم الانتقال إلى <strong>${escapeHTML(target)}</strong>. احفظ أو عالج التغييرات الحالية أولًا؛ لن يتجاهل Shell أي مسودة ضمنيًا.</p>`
      : `<p>Navigation to <strong>${escapeHTML(target)}</strong> was not performed. Save or resolve the current changes first; Shell never discards a draft implicitly.</p>`;
    this.workspace?.dialog?.(title,body,{safeOutside:false});
    if(invoker instanceof HTMLElement)queueMicrotask(()=>{const dialog=document.querySelector<HTMLElement>('#foundationDialog');if(dialog&&!dialog.hidden)dialog.dataset.shellDepartureGuard='dirty'});
    return false;
  }

  onPopState(_event:PopStateEvent){
    const url=new URL(location.href);
    const targetSurface=(url.searchParams.get('surface')||this.destinationRegistry.defaultId) as ShellProductSurface;
    if(isProductDestination(targetSurface,this.destinationRegistry)){
      if(targetSurface!==this.surface){
        this.surface=targetSurface;
        this.adoptHost();
        this.render();
        try{this.onNavigate?.(targetSurface,{source:'popstate'})}catch(e){console.error('onNavigate popstate error',e)}
      }
    }
    this.restoreOnArrival();
  }

  navigate(destination:ShellProductSurface,invoker:Element|null=null){
    if(!isProductDestination(destination,this.destinationRegistry))throw Error('GLOBAL_SHELL_DESTINATION_NOT_PRODUCT');
    if(destination===this.surface){(invoker as HTMLElement|null)?.focus?.();return {ok:true,status:'ALREADY_ACTIVE',surface:this.surface};}
    if(this.isDirty()){this.blockDirtyDeparture(destination,invoker);return {ok:false,status:'DIRTY_DEPARTURE_BLOCKED',surface:this.surface,destination};}
    this.rememberAreaDestination(this.surface);
    const bookmark=this.captureCurrentContext('navigate');
    const arrival={schemaVersion:1,owner:GLOBAL_SHELL_OWNER,from:this.surface,to:destination,bookmarkKey:this.bookmarkKey(this.surface),capturedAt:bookmark?.capturedAt||new Date().toISOString()};
    try{this.storage?.setItem('cep:shell:arrival',JSON.stringify(arrival))}catch{}
    const targetUrl=this.destinationURL(destination);
    try{
      history.pushState({...history.state,cepDestination:destination},'',targetUrl);
      this.surface=destination;
      this.adoptHost();
      this.render();
      if(this.onNavigate){
        const handled=this.onNavigate(destination,{source:'navigate',bookmark});
        if(handled!==false){
          this.restoreOnArrival();
          return {ok:true,status:'NAVIGATING',surface:this.surface,destination};
        }
      }
    }catch{
      location.assign(targetUrl);
    }
    return {ok:true,status:'NAVIGATING',surface:this.surface,destination};
  }

  navigateWithPreservedRecovery(destination:ShellProductSurface,recoveryReceipt:any,invoker:Element|null=null){
    if(!isProductDestination(destination,this.destinationRegistry))throw Error('GLOBAL_SHELL_DESTINATION_NOT_PRODUCT');
    if(!recoveryReceipt||recoveryReceipt.preserved!==true||!String(recoveryReceipt.owner||''))return {ok:false,status:'PRESERVE_RECOVERY_RECEIPT_REQUIRED',surface:this.surface,destination};
    if(destination===this.surface)return {ok:true,status:'ALREADY_ACTIVE',surface:this.surface};
    this.rememberAreaDestination(this.surface);
    const bookmark=this.captureCurrentContext('navigate-preserved-recovery');
    const arrival={schemaVersion:1,owner:GLOBAL_SHELL_OWNER,from:this.surface,to:destination,bookmarkKey:this.bookmarkKey(this.surface),capturedAt:bookmark?.capturedAt||new Date().toISOString(),recoveryOwner:String(recoveryReceipt.owner)};
    try{this.storage?.setItem('cep:shell:arrival',JSON.stringify(arrival))}catch{}
    const targetUrl=this.destinationURL(destination);
    try{
      history.pushState({...history.state,cepDestination:destination,recoveryReceipt},'',targetUrl);
      this.surface=destination;
      this.adoptHost();
      this.render();
      if(this.onNavigate){
        const handled=this.onNavigate(destination,{source:'navigate-preserved-recovery',recoveryReceipt,bookmark});
        if(handled!==false){
          this.restoreOnArrival();
          return {ok:true,status:'NAVIGATING_WITH_VERIFIED_RECOVERY',surface:this.surface,destination,recoveryOwner:String(recoveryReceipt.owner)};
        }
      }
    }catch{
      location.assign(targetUrl);
    }
    return {ok:true,status:'NAVIGATING_WITH_VERIFIED_RECOVERY',surface:this.surface,destination,recoveryOwner:String(recoveryReceipt.owner)};
  }

  onClick(event:MouseEvent){
    const destination=(event.target as Element|null)?.closest<HTMLElement>('[data-shell-destination]');
    if(destination){event.preventDefault();const id=destination.dataset.shellDestination||'';if(isProductDestination(id,this.destinationRegistry))this.navigate(id,destination);return;}
    const historyButton=(event.target as Element|null)?.closest<HTMLElement>('[data-shell-history]');
    if(historyButton){event.preventDefault();if(this.isDirty()){this.blockDirtyDeparture(this.surface,historyButton);return;}this.captureCurrentContext('history');historyButton.dataset.shellHistory==='back'?history.back():history.forward();}
  }

  onKeydown(event:KeyboardEvent){
    const current=(event.target as Element|null)?.closest<HTMLElement>('[data-shell-destination]');
    if(!current||!current.closest('.global-shell-destinations'))return;
    const links=[...this.host.querySelectorAll<HTMLElement>('.global-shell-destinations [data-shell-destination]')];
    const index=links.indexOf(current);if(index<0)return;
    let next=index;
    if(event.key==='Home')next=0;else if(event.key==='End')next=links.length-1;else if(event.key==='ArrowRight')next=(index+(this.direction()==='rtl'?-1:1)+links.length)%links.length;else if(event.key==='ArrowLeft')next=(index+(this.direction()==='rtl'?1:-1)+links.length)%links.length;else return;
    event.preventDefault();links[next]?.focus();
  }

  bookmarkKey(surface:ShellProductSurface){return `cep:shell:bookmark:${surface}`}
  focusIdentity(active:HTMLElement|null=document.activeElement as HTMLElement|null){
    if(!active||active===document.body)return null;
    return {id:active.id||undefined,blockId:active.closest<HTMLElement>('[data-block-id]')?.dataset.blockId,objectId:active.closest<HTMLElement>('[data-object]')?.dataset.object,commandId:active.closest<HTMLElement>('[data-foundation-command]')?.dataset.foundationCommand,destination:active.closest<HTMLElement>('[data-shell-destination]')?.dataset.shellDestination,history:active.closest<HTMLElement>('[data-shell-history]')?.dataset.shellHistory};
  }

  restoreFocusIdentity(focus:ShellBookmark['focus'],{shellFallback=false}={}){
    if(!focus)return null;
    let element:HTMLElement|null=null;
    if(focus.id)element=document.getElementById(focus.id);
    if(!element&&focus.blockId)element=document.querySelector<HTMLElement>(`[data-block-id="${CSS.escape(focus.blockId)}"] [data-editable-block], [data-block-id="${CSS.escape(focus.blockId)}"] button`);
    if(!element&&focus.objectId)element=document.querySelector<HTMLElement>(`[data-object="${CSS.escape(focus.objectId)}"]`);
    if(!element&&focus.commandId)element=this.host.querySelector<HTMLElement>(`[data-foundation-command="${CSS.escape(focus.commandId)}"]`)||document.querySelector<HTMLElement>(`[data-foundation-command="${CSS.escape(focus.commandId)}"]`);
    if(!element&&focus.destination)element=this.host.querySelector<HTMLElement>(`.global-shell-destinations [data-shell-destination="${CSS.escape(focus.destination)}"]`)||this.host.querySelector<HTMLElement>(`[data-shell-destination="${CSS.escape(focus.destination)}"]`);
    if(!element&&focus.history)element=this.host.querySelector<HTMLElement>(`[data-shell-history="${CSS.escape(focus.history)}"]`);
    if(!element&&shellFallback)element=this.currentDestinationControl()||this.host.querySelector<HTMLElement>('.global-shell-destinations')||document.querySelector<HTMLElement>('#editorDocument, #foundationStage, #domainStage, main [tabindex]');
    element?.focus?.({preventScroll:true});
    return element;
  }

  captureCurrentContext(reason:string){
    let surfaceContext:ShellBookmark['surfaceContext']=undefined;
    const provider=this.contextProviders.get(this.surface);
    if(provider){
      surfaceContext=provider.capture() as any;
    }else if(this.surface==='today'){
      const activeFilterBtn=document.querySelector<HTMLElement>('[data-filter][aria-pressed="true"], [data-filter].active');
      const activeFilter=activeFilterBtn?.dataset.filter||undefined;
      const focusedItem=document.querySelector<HTMLElement>('[data-today-action][data-item-id]');
      const todayItemId=focusedItem?.dataset.itemId||undefined;
      surfaceContext={todayFilter:activeFilter,todayItemId};
    }else if(this.surface==='visualize'){
      const activeViewBtn=document.querySelector<HTMLElement>('[data-view][aria-pressed="true"]');
      const visualizeView=activeViewBtn?.dataset.view||undefined;
      const selectedNodes=[...document.querySelectorAll<HTMLElement>('.spatial-canvas g[aria-selected="true"]')].map(n=>n.dataset.nodeId||n.id).filter(Boolean);
      surfaceContext={visualizeView,visualizeSelected:selectedNodes};
    }
    const bookmark:ShellBookmark={schemaVersion:1,owner:GLOBAL_SHELL_OWNER,surface:this.surface,href:location.href,capturedAt:new Date().toISOString(),windowScroll:{x:scrollX,y:scrollY},scroll:[],focus:this.focusIdentity(),surfaceContext};
    for(const target of SCROLL_TARGETS){const element=document.querySelector<HTMLElement>(target.selector);if(element&&(element.scrollTop||element.scrollLeft||element.scrollHeight>element.clientHeight||element.scrollWidth>element.clientWidth))bookmark.scroll.push({key:target.key,top:element.scrollTop,left:element.scrollLeft});}
    try{this.storage?.setItem(this.bookmarkKey(this.surface),JSON.stringify(bookmark))}catch{}
    try{history.replaceState({...history.state,cepShell:{owner:GLOBAL_SHELL_OWNER,surface:this.surface,bookmarkKey:this.bookmarkKey(this.surface),reason,bookmark}},'',location.href)}catch{}
    return bookmark;
  }

  restoreOnArrival(){
    let arrival:any=null;try{arrival=JSON.parse(this.storage?.getItem('cep:shell:arrival')||'null')}catch{}
    if(arrival?.owner===GLOBAL_SHELL_OWNER&&arrival.to===this.surface){try{this.storage?.removeItem('cep:shell:arrival')}catch{};requestAnimationFrame(()=>this.currentDestinationControl()?.focus({preventScroll:true}));}
    const navEntry=performance.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming|undefined;
    const shouldRestore=navEntry?.type==='back_forward'||history.state?.cepShell?.surface===this.surface;
    if(!shouldRestore)return;
    let bookmark:ShellBookmark|null=history.state?.cepShell?.bookmark||null;
    if(!bookmark)try{bookmark=JSON.parse(this.storage?.getItem(this.bookmarkKey(this.surface))||'null')}catch{}
    if(!bookmark||bookmark.owner!==GLOBAL_SHELL_OWNER||bookmark.surface!==this.surface)return;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{void this.restoreBookmark(bookmark!)}));
  }

  private frame(){return new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()))}
  private closeEnough(actual:number,expected:number){return Math.abs(actual-expected)<=1}
  private applyBookmarkScroll(bookmark:ShellBookmark){
    try{scrollTo(bookmark.windowScroll.x,bookmark.windowScroll.y)}catch{}
    let ready=true;
    for(const saved of bookmark.scroll){
      const target=SCROLL_TARGETS.find(item=>item.key===saved.key),element=target?document.querySelector<HTMLElement>(target.selector):null;
      if(!element){ready=false;continue}
      element.scrollTop=saved.top;element.scrollLeft=saved.left;
    }
    return ready;
  }
  private bookmarkScrollMatches(bookmark:ShellBookmark){
    if(!this.closeEnough(scrollX,bookmark.windowScroll.x)||!this.closeEnough(scrollY,bookmark.windowScroll.y))return false;
    for(const saved of bookmark.scroll){
      const target=SCROLL_TARGETS.find(item=>item.key===saved.key),element=target?document.querySelector<HTMLElement>(target.selector):null;
      if(!element||!this.closeEnough(element.scrollTop,saved.top)||!this.closeEnough(element.scrollLeft,saved.left))return false;
    }
    return true;
  }

  async restoreBookmark(bookmark:ShellBookmark){
    delete this.host.dataset.contextRestored;
    delete document.documentElement.dataset.contextRestored;
    this.host.dataset.contextRestoreStatus='pending';
    if(bookmark.surfaceContext){
      const provider=this.contextProviders.get(this.surface);
      if(provider){
        try{
          await provider.restore(bookmark.surfaceContext);
        }catch(e){
          console.error('Context provider restore failed',e);
        }
      }else if(this.surface==='today'&&bookmark.surfaceContext.todayFilter){
        const filterBtn=document.querySelector<HTMLElement>(`[data-filter="${CSS.escape(bookmark.surfaceContext.todayFilter)}"]`);
        filterBtn?.click();
      }else if(this.surface==='visualize'&&bookmark.surfaceContext.visualizeView){
        const viewBtn=document.querySelector<HTMLElement>(`[data-view="${CSS.escape(bookmark.surfaceContext.visualizeView)}"]`);
        viewBtn?.click();
      }
    }
    let stableFrames=0;
    for(let attempt=0;attempt<12;attempt++){
      const ready=this.applyBookmarkScroll(bookmark);
      await this.frame();
      if(ready&&this.bookmarkScrollMatches(bookmark)){
        stableFrames++;
        if(stableFrames>=2){
          this.restoreFocusIdentity(bookmark.focus,{shellFallback:true});
          this.host.dataset.contextRestored='true';
          document.documentElement.dataset.contextRestored='true';
          this.host.dataset.contextRestoreStatus='restored';
          return true;
        }
      }else stableFrames=0;
    }
    delete this.host.dataset.contextRestored;
    delete document.documentElement.dataset.contextRestored;
    this.host.dataset.contextRestoreStatus='unresolved';
    return false;
  }

  currentDestinationControl(){return this.host.querySelector<HTMLElement>(`.global-shell-destinations [data-shell-area="${this.activeArea()}"]`)||this.host.querySelector<HTMLElement>(`[data-shell-destination="${this.surface}"]`)}
  descriptor(){return {
    owner:GLOBAL_SHELL_OWNER,surface:this.surface,kind:'product',destinationRegistryOwner:this.destinationRegistry.owner,
    globalDestinationBaselineCount:this.globalAreas().length,destinationCountFrozen:false,registeredSurfaceCount:this.destinations().length,
    globalDestinations:this.globalAreas().map(item=>({area:item.id,defaultSurfaceId:item.defaultSurfaceId})),
    destinations:this.destinations().map(item=>({id:item.id,area:item.area})),historyOwner:'window.history',bookmarkOwner:'sessionStorage',
    dirtyDeparture:'EDITOR_PLUS_PUBLIC_NOTE_TRANSACTION_DESCRIPTOR__NO_IMPLICIT_DISCARD',noteRuntimeBound:!!this.noteRuntime,
    routeCanonicalizationOwner:'canonicalizeGlobalShellRoute__REQUIRES_ROUTER_COMPOSITION_WHEN_REQUIRED',
    shellVisualComposition:'REOPENED__SEMANTIC_BASELINE_PRESERVED',adoptedLegacyProofHost:true,goldenConsumer:false,
    sharedOwners:{commands:'SemanticCommandBus/CommandRegistry',settings:'SettingsCenterOwner/WorkspaceFoundation',transients:'TransientFocusOwner',panes:'WorkspaceFoundation/PaneResponsiveCore',notes:'LibraryNoteRuntimeComposition/public transactionDescriptor'}
  }}
  destroy(){this.captureCurrentContext('destroy');this.host.removeEventListener('click',this.clickHandler);this.host.removeEventListener('keydown',this.keyHandler);window.removeEventListener('pagehide',this.pagehideHandler);window.removeEventListener('beforeunload',this.beforeUnloadHandler);window.removeEventListener('popstate',this.popstateHandler);this.observer?.disconnect();}
}

export function mountGlobalShellNavigation(options:ShellOptions){return new GlobalShellNavigationOwner(options)}
