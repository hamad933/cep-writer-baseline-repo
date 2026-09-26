import assert from 'node:assert/strict';
import {CommandRegistry} from '../../../dist/foundation/models.js';
import {bindLibrarySurface} from '../../../dist/surfaces/library/surface.js';
import {createLibraryRuntimeComposition} from '../../../dist/surfaces/library/runtime-composition.js';

const document={
  id:'lib-1',
  revision:'r1',
  title:'Library',
  tags:['Knowledge'],
  blocks:[{id:'p1',type:'paragraph',html:'A'}],
  sources:[{id:'src-1',label:'Canonical source'}]
};
const sourceBase={
  classification:'CANONICAL_LIBRARY_PROVIDER',
  truth:'CANONICAL_PROVIDER_TRUTH',
  providerRef:'provider://library/canonical',
  document
};

let cases=0;
const check=(actual,expected,message)=>{assert.deepEqual(actual,expected,message);cases+=1;};

const unboundRuntime=createLibraryRuntimeComposition({source:sourceBase});
const unboundCommands=new CommandRegistry();
const unbound=bindLibrarySurface({commands:unboundCommands,structured:unboundRuntime.structured,libraryRuntime:unboundRuntime});

check(unbound.owner,'LibraryDomainAdapter','Library must remain the domain adapter owner');
check(unbound.transactionOwner,'StructuredTransactionHistoryRecoveryOwner','Library must consume the canonical transaction owner');
check(unboundRuntime.descriptor().fixtureFallback,false,'Library must not claim fixture fallback');

const beforeRevision=unboundRuntime.structured.snapshot();
const reviseBlocked=unboundCommands.execute('library.revise',{title:'Library revised'});
check(reviseBlocked.code,'LIBRARY_REVISION_PROVIDER_UNAVAILABLE','Revision requires the real successor-revision provider');
check(unboundRuntime.structured.snapshot(),beforeRevision,'Blocked revision must not mutate the document');

const saveBlocked=unboundCommands.execute('library.save',{});
check(saveBlocked.code,'SAVE_BOUNDARY_UNAVAILABLE','Save must not claim persistence without a persistence boundary');
check(saveBlocked.ok,false,'Unavailable Save must be explicit');

const historyBlocked=unboundCommands.execute('library.history',{leftRevision:'r1',rightRevision:'r2'});
check(historyBlocked.code,'LIBRARY_EXACT_REVISION_PAIR_REQUIRED','History requires both an exact pair and a comparison provider');

const calls=[];
const providerRuntime=createLibraryRuntimeComposition({
  source:{
    ...sourceBase,
    services:{
      createDocument:payload=>({ok:true,status:'CREATED_BY_PROVIDER',payload}),
      createSuccessorRevision:payload=>({ok:true,status:'SUCCESSOR_CREATED_BY_PROVIDER',payload}),
      compareRevisions:payload=>{calls.push(payload);return {ok:true,status:'COMPARED_BY_PROVIDER',payload};}
    }
  }
});
const providerCommands=new CommandRegistry();
bindLibrarySurface({commands:providerCommands,structured:providerRuntime.structured,libraryRuntime:providerRuntime});

check(providerRuntime.canCompareRevisions({leftRevision:'r1',rightRevision:'r2'}),true,'Exact revision pair is available when provider exists');
check(providerRuntime.canCompareRevisions({leftRevision:'latest',rightRevision:'r2'}),false,'latest must never be advertised as an exact revision');
check(providerRuntime.canCompareRevisions({leftRevision:' R1 ',rightRevision:' LATEST '}),false,'latest alias rejection is case-insensitive and whitespace-safe');

const aliasBlocked=providerRuntime.compareRevisions({leftRevision:'latest',rightRevision:'r2'});
check(aliasBlocked.status,'LIBRARY_LATEST_ALIAS_FORBIDDEN','Direct runtime compare must distinguish forbidden latest aliases');
check(calls.length,0,'Forbidden alias must not reach the comparison provider');

const exactCompared=providerCommands.execute('library.history',{leftRevision:' r1 ',rightRevision:'r2'});
check(exactCompared.status,'COMPARED_BY_PROVIDER','Exact history comparison must route to the bound provider');
check(calls,[{documentId:'lib-1',leftRevision:'r1',rightRevision:'r2'}],'Comparison provider must receive normalized exact identities');

const beforeProviderRevision=providerRuntime.structured.snapshot();
const revised=providerCommands.execute('library.revise',{title:'Successor title'});
check(revised.status,'SUCCESSOR_CREATED_BY_PROVIDER','Revision command must route to provider');
check(providerRuntime.structured.snapshot(),beforeProviderRevision,'Successor creation must not overwrite the current published document locally');

const forbiddenRuntime=createLibraryRuntimeComposition({
  source:{
    classification:'DS01_HARNESS',
    truth:'NON_PRODUCTION_ACCEPTANCE_SEED',
    providerRef:'provider://library/ds01',
    document
  }
});
const forbiddenCommands=new CommandRegistry();
const forbiddenBound=bindLibrarySurface({commands:forbiddenCommands,structured:forbiddenRuntime.structured,libraryRuntime:forbiddenRuntime});
check(forbiddenBound.sourceAvailability.enabled,false,'Harness/fixture truth must not enter normal Library Product truth');
check(forbiddenBound.sourceAvailability.code,'LIBRARY_CANONICAL_SOURCE_UNAVAILABLE','Rejected source must be explicitly unavailable');
check(forbiddenRuntime.structured.identity().id,'library-unavailable','Rejected source must degrade to a non-canonical placeholder');

const beforeForbiddenInsert=forbiddenRuntime.structured.snapshot();
const forbiddenInsert=forbiddenCommands.execute('library.insert',{block:{id:'p2',type:'paragraph',html:'B'},index:1});
check(forbiddenInsert.code,'LIBRARY_CANONICAL_SOURCE_UNAVAILABLE','Unavailable source must gate Library mutation commands');
check(forbiddenRuntime.structured.snapshot(),beforeForbiddenInsert,'Rejected source must not be mutated through the Library surface');

console.log(JSON.stringify({
  surface:'library',
  status:'PASS',
  cases,
  duplicateTransactionOwner:false,
  fixtureClaimed:false,
  exactRevisionAliasesRejected:true
}));
