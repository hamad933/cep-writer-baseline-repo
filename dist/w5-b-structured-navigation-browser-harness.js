import {createStructuredConsumerAdapter} from './adapters/structured-documents.js';
import {STRUCTURE_TREE,FIXTURES,NOTE_FIXTURES} from './adapters/library-fixtures.js';
import {StructuredNavigationDescriptorOwner} from './foundation/structured/outline-descriptor.js';

const bundle={initialDocumentId:'KU-D05-0021',STRUCTURE_TREE,FIXTURES,NOTE_FIXTURES};
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const consumers={library:createStructuredConsumerAdapter('library',bundle),learn:createStructuredConsumerAdapter('learn')};
const owners={library:new StructuredNavigationDescriptorOwner({adapter:consumers.library}),learn:new StructuredNavigationDescriptorOwner({adapter:consumers.learn})};
const state={active:'library',lastInspection:null,lastQuickJumpRequest:null,scrollCalls:0};
const originalScroll=Element.prototype.scrollIntoView;
Element.prototype.scrollIntoView=function(...args){state.scrollCalls++;return originalScroll?.apply(this,args)};

function render(surface=state.active){
  state.active=surface;const owner=owners[surface],descriptor=owner.descriptor(),host=document.querySelector('#descriptorHarness');if(!host)return descriptor;
  host.dataset.owner=owner.owner;host.dataset.surface=surface;
  host.innerHTML=`<section data-outline-owner="${owner.owner}"><h2>${surface}</h2><ol>${descriptor.outline.entries.map(item=>`<li data-canonical-block="${esc(item.target.blockId)}" id="dom-outline-${esc(surface)}-${esc(item.target.blockId)}">${esc(item.label)}</li>`).join('')}</ol></section><section data-quick-jump-owner="${owner.owner}">${descriptor.quickJump.items.map(item=>`<button type="button" data-quick-canonical="${esc(item.target.blockId)}" id="dom-quick-${esc(surface)}-${esc(item.target.blockId)}">${esc(item.label)}</button>`).join('')}</section>`;
  host.querySelectorAll('[data-quick-canonical]').forEach(button=>button.addEventListener('click',()=>{const item=owner.quickJump().items.find(entry=>entry.target.blockId===button.dataset.quickCanonical);state.lastQuickJumpRequest=item?.request||null;}));
  return descriptor;
}
function inspect(surface,blockId){const descriptor=owners[surface].readInspection(blockId,{mode:'read'});state.lastInspection=descriptor;return descriptor;}
render('library');
globalThis.CEPW5BNavigationHarness={consumers,owners,state,render,inspect};
