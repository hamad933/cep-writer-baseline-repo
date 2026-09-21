import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {seedBalanced6,loadAndValidateBalanced6,validateBalanced6Manifest,validateBalanced6Source,BALANCED6_CLASSIFICATION} from '../stack/local-runtime/persistence/acceptance-seed/balanced6/seed.mjs';
import {CepSqlitePersistenceProvider} from '../stack/local-runtime/persistence/sqlite-persistence-provider.mjs';

const EXPECTED_IDS=['KU-D03-0001','KU-D03-0004','KU-D03-0011','KU-D05-0021','KU-D05-0023','KU-D09-0002'];
const tests=[]; const record=(id,fn)=>{try{const detail=fn();tests.push({id,status:'PASS',detail:detail??null})}catch(error){tests.push({id,status:'FAIL',detail:String(error?.stack||error)})}};
const root=mkdtempSync(join(tmpdir(),'cep-balanced6-'));const db=join(root,'balanced6-acceptance.sqlite');
const first=seedBalanced6({databasePath:db,reset:true}),second=seedBalanced6({databasePath:db});
const {manifest,records}=loadAndValidateBalanced6();
record('seed.exact-six-ids',()=>assert.deepEqual(first.documents.map(x=>x.document_id),EXPECTED_IDS));
record('seed.exact-titles',()=>{const p=new CepSqlitePersistenceProvider({databasePath:db});try{for(const r of records)assert.equal(p.readCommitted(r.id).document.title,r.title)}finally{p.close()}});
record('seed.exact-source-hashes',()=>{for(const r of records)assert.equal(r.document.provenance.sourceSha256,r.sourceSha256)});
record('seed.classification-non-production',()=>assert.equal(first.classification,BALANCED6_CLASSIFICATION));
record('seed.clean-counts',()=>assert.deepEqual({docs:first.counts.structured_documents,revisions:first.counts.structured_revisions,fts:first.counts.structured_fts},{docs:6,revisions:6,fts:6}));
record('seed.second-run-idempotent',()=>assert.deepEqual(second.counts,first.counts));
record('seed.restart-readback',()=>{const p=new CepSqlitePersistenceProvider({databasePath:db});try{assert.deepEqual(p.listDocuments().map(x=>x.document_id),EXPECTED_IDS)}finally{p.close()}});
record('sqlite.integrity-check',()=>assert.equal(first.integrity[0]?.integrity_check,'ok'));
record('sqlite.foreign-key-check',()=>assert.deepEqual(first.foreignKeys,[]));
record('sqlite.schema-v1-only',()=>{assert.equal(first.migrations.length,1);assert.equal(Number(first.migrations[0].version),1);assert.equal(first.migrations[0].name,'schema-v1')});
record('negative.no-seventh-ku',()=>{const x=structuredClone(manifest);x.documents.push({...x.documents[0],id:'KU-D99-9999'});x.count=7;assert.throws(()=>validateBalanced6Manifest(x),/BALANCED6_EXACT_SIX_REQUIRED/)});
record('negative.wrong-ku-id',()=>{const x=structuredClone(manifest);x.documents[0].id='KU-D03-9999';assert.throws(()=>validateBalanced6Manifest(x),/BALANCED6_ID_SET_OR_ORDER_MISMATCH/)});
record('negative.production-classification-rejected',()=>{const x=structuredClone(manifest);x.classification='PRODUCTION';assert.throws(()=>validateBalanced6Manifest(x),/BALANCED6_CLASSIFICATION_MISMATCH/)});
record('negative.wrong-title-rejected',()=>{const r={...records[0],title:'Wrong title'};const b=readFileSync(new URL('../stack/local-runtime/persistence/acceptance-seed/balanced6/source/KU-D03-0001.md',import.meta.url));assert.throws(()=>validateBalanced6Source(r,b),/BALANCED6_TITLE_MISMATCH/)});
record('negative.wrong-source-hash-rejected',()=>{const r={...records[0],sourceSha256:'0'.repeat(64)};const b=readFileSync(new URL('../stack/local-runtime/persistence/acceptance-seed/balanced6/source/KU-D03-0001.md',import.meta.url));assert.throws(()=>validateBalanced6Source(r,b),/BALANCED6_SOURCE_SHA_MISMATCH/)});
record('negative.legacy-b10-not-imported',()=>assert.equal(first.documents.some(x=>/B10|LEGACY/i.test(String(x.document_id))),false));

const p=new CepSqlitePersistenceProvider({databasePath:db});
try{
 record('fts.d03',()=>assert(p.searchCommitted('WebAuthn').some(x=>x.document_id.startsWith('KU-D03-'))));
 record('fts.d05',()=>assert(p.searchCommitted('authorization').some(x=>x.document_id.startsWith('KU-D05-'))));
 record('fts.d09',()=>assert(p.searchCommitted('incident').some(x=>x.document_id==='KU-D09-0002')));
 const truthBefore=p.committedTruthFingerprint();
 record('fts.rebuild-preserves-committed-truth',()=>{const out=p.rebuildFts();assert.equal(out.ok,true);assert.equal(out.rebuilt,6);assert.equal(out.committedTruthBefore,out.committedTruthAfter);assert.equal(p.committedTruthFingerprint(),truthBefore)});
 const d1=p.readCommitted('KU-D03-0001');const mixed=structuredClone(d1.document);mixed.blocks.push({id:'bidi-roundtrip',type:'paragraph',html:'<p dir="rtl">تحقق من <bdi dir="ltr">WebAuthn / SHA-256</bdi> داخل السياق المحلي.</p>',children:[]});
 const save=p.saveStructuredDocument(mixed,{documentId:mixed.id,expectedRevision:d1.revisionId,workingRevision:1,requestId:'b6-save-bidi-1',reason:'balanced6-bidi-roundtrip'});
 record('save.explicit-commit',()=>{assert.equal(save.ok,true);assert.notEqual(save.committedRevision,d1.revisionId);assert.equal(p.currentRevision(mixed.id),save.committedRevision)});
 record('bidi.seed-db-readback',()=>{const read=p.readCommitted(mixed.id).document;assert.match(JSON.stringify(read),/تحقق من/);assert.match(JSON.stringify(read),/WebAuthn \/ SHA-256/)});
 const d4=p.readCommitted('KU-D03-0004'),auto=structuredClone(d4.document);auto.blocks.push({id:'draft-only',type:'paragraph',html:'<p>draft only</p>',children:[]});const beforeAuto=p.currentRevision(d4.document.id),ar=p.autosaveWorkingDraft({document:auto,baseRevisionId:beforeAuto,workingRevision:1,dirty:true});
 record('autosave.draft-only',()=>{assert.equal(ar.ok,true);assert.equal(p.currentRevision(d4.document.id),beforeAuto);assert.equal(p.readDraft(d4.document.id).document.blocks.at(-1).id,'draft-only')});
 const d23=p.readCommitted('KU-D05-0023'),recovery=structuredClone(d23.document);recovery.blocks.push({id:'recovery-only',type:'paragraph',html:'<p>recovery only</p>',children:[]});const base23=d23.revisionId,rr=p.captureRecovery({recoveryId:'b6-recovery-1',document:recovery,baseRevisionId:base23,workingRevision:1,reason:'balanced6-test'});
 record('recovery.capture-does-not-commit',()=>{assert.equal(rr.ok,true);assert.equal(p.currentRevision(d23.document.id),base23);assert.equal(p.readRecovery('b6-recovery-1').document.blocks.at(-1).id,'recovery-only')});
 const recovered=p.readRecovery('b6-recovery-1').document,commitRecovery=p.saveStructuredDocument(recovered,{documentId:recovered.id,expectedRevision:base23,workingRevision:2,requestId:'b6-recovery-save-1',reason:'explicit-save-after-recovery'});
 record('recovery.explicit-save-commits-new-revision',()=>{assert.equal(commitRecovery.ok,true);assert.notEqual(commitRecovery.committedRevision,base23)});
 const revCount=p.revisionCount('KU-D03-0001'),beforeStale=p.currentRevision('KU-D03-0001'),fingerprint=p.committedTruthFingerprint();const staleDoc=structuredClone(p.readCommitted('KU-D03-0001').document);staleDoc.title+=' stale';const stale=p.saveStructuredDocument(staleDoc,{documentId:staleDoc.id,expectedRevision:d1.revisionId,workingRevision:99,requestId:'b6-stale-1',reason:'stale-negative'});
 record('save.stale-atomic-rejection',()=>{assert.equal(stale.ok,false);assert.equal(stale.code,'STALE_BASE');assert.equal(p.currentRevision('KU-D03-0001'),beforeStale);assert.equal(p.revisionCount('KU-D03-0001'),revCount);assert.equal(p.committedTruthFingerprint(),fingerprint)});
 record('provenance.source-binding-preserved-after-save',()=>{const prov=p.documentProvenance('KU-D03-0001').provenance;assert.equal(prov.sourceSha256,records[0].sourceSha256);assert.equal(prov.classification,BALANCED6_CLASSIFICATION);assert.equal(prov.canonicalPublication,false)});
 record('assurance-db-not-canonical-product-state',()=>{for(const x of p.listDocuments()){assert.equal(x.source_kind,'b09-source-grounded-local-acceptance');assert.equal(x.provenance.canonicalPublication,false)}});
} finally {p.close()}

// Static architecture falsification: UI/Surface code must not import/query node:sqlite or structured_fts directly.
const nativeRoot=new URL('../stack/native-typescript/',import.meta.url);const fs=await import('node:fs');const path=await import('node:path');
const scan=[];const walk=d=>{for(const ent of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,ent.name);if(ent.isDirectory())walk(f);else if(/\.(ts|js|mjs)$/.test(ent.name)){const t=fs.readFileSync(f,'utf8');if(/node:sqlite|structured_fts|DatabaseSync/.test(t))scan.push(path.relative(fileURLToPath(nativeRoot),f))}}};walk(fileURLToPath(nativeRoot));
record('negative.ui-cannot-bypass-provider-to-sqlite',()=>assert.deepEqual(scan,[]));
const learnText=readFileSync(new URL('../stack/native-typescript/adapters/balanced6-acceptance-data.ts',import.meta.url),'utf8');
record('negative.learn-does-not-infer-mastery',()=>{assert.match(learnText,/BALANCED6_LEARN_SOURCE/);assert.doesNotMatch(learnText,/mastered\s*:\s*true|grading\s*:\s*true|labSuccess\s*:\s*true/i)});
record('negative.rq-no-formal-review-fabrication',()=>assert.doesNotMatch(learnText,/formalReviewDecision\s*:/));
record('negative.visualize-local-projection-not-canonical',()=>assert.match(learnText,/LOCAL_ACCEPTANCE_PROJECTION_OF_SOURCE_RELATIONSHIP/)&&assert.match(learnText,/canonical:false/));

const pass=tests.filter(x=>x.status==='PASS').length,fail=tests.length-pass;const result={schemaVersion:1,classification:BALANCED6_CLASSIFICATION,pass,fail,total:tests.length,firstSeedCounts:first.counts,secondSeedCounts:second.counts,tests};process.stdout.write(JSON.stringify(result,null,2)+'\n');rmSync(root,{recursive:true,force:true});if(fail)process.exitCode=1;
