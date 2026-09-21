import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';
import {runW6AStickyNoteWindowProof} from '../dist/w6-a-sticky-note-window-tests.js';
import {runW4FOperationalSessionTests} from '../dist/w4-f-operational-session-tests.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const assurance=path.join(root,'assurance');
const source=await canonicalSourceIdentity(new URL('../',import.meta.url));
const executable=runW6AStickyNoteWindowProof();
const operationalTests=runW4FOperationalSessionTests(),operationalFailures=operationalTests.filter(test=>test.status!=='PASS');
const walk=async dir=>(await fs.readdir(dir,{withFileTypes:true})).flatMap(()=>[]);
async function sourceFiles(dir){const out=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())out.push(...await sourceFiles(full));else out.push(full)}return out}
const canonicalRoot=path.join(root,'stack','native-typescript'),files=await sourceFiles(canonicalRoot);
const texts=await Promise.all(files.filter(file=>file.endsWith('.ts')).map(async file=>({file:path.relative(canonicalRoot,file).replaceAll(path.sep,'/'),text:await fs.readFile(file,'utf8')})));
const windowMotionDeclarations=texts.flatMap(item=>[...item.text.matchAll(/\bclass\s+WindowMotion\b/g)].map(match=>({path:item.file,index:match.index})));
const stickyOwnerDeclarations=texts.flatMap(item=>[...item.text.matchAll(/\bclass\s+StickyNoteWindowOwner\b/g)].map(match=>({path:item.file,index:match.index})));
const noteOwnerText=(texts.find(item=>item.file==='foundation/notes/sticky-note-window.ts')||{}).text||'';
const negativeChecks=[
  {id:'single-generic-window-motion-class',pass:windowMotionDeclarations.length===1&&windowMotionDeclarations[0].path==='foundation/window-motion.ts',detail:windowMotionDeclarations},
  {id:'single-sticky-note-window-owner-class',pass:stickyOwnerDeclarations.length===1&&stickyOwnerDeclarations[0].path==='foundation/notes/sticky-note-window.ts',detail:stickyOwnerDeclarations},
  {id:'sticky-owner-reuses-window-motion-no-duplicate-class',pass:!noteOwnerText.includes('class WindowMotion')&&noteOwnerText.includes('WINDOW_RESIZE_EDGES')},
  {id:'default-platform-truth-unavailable',pass:noteOwnerText.includes("alwaysOnTop:false")&&noteOwnerText.includes("separateWindow:false")&&noteOwnerText.includes("UNAVAILABLE")},
  {id:'presentation-only-contract',pass:noteOwnerText.includes("scope:'STICKY_NOTE_PRESENTATION_WINDOW_LIFECYCLE_ONLY'")&&noteOwnerText.includes('structuredContentTruth:false')&&noteOwnerText.includes('sourceBindingTruth:false')},
  {id:'duplicate-and-fake-owner-negative-fixtures-executed',pass:executable.cases.some(x=>x.id==='w6a.owner.one-per-host-graph'&&x.status==='PASS')&&executable.cases.some(x=>x.id==='w6a.owner.fake-owner-rejected'&&x.status==='PASS')}
];
const negative={schemaVersion:1,kind:'W6_A_DUPLICATE_FAKE_OWNER_AND_WINDOW_MOTION_NEGATIVE_PROOF',classification:'LANE_A_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',status:negativeChecks.every(x=>x.pass)?'PASS':'FAIL',sourceCanonicalTreeSha256:source.sha256,canonicalSourceFileCount:source.files,checks:negativeChecks};
const execOut={...executable,sourceCanonicalTreeSha256:source.sha256,canonicalSourceFileCount:source.files};
const operational={schemaVersion:1,kind:'W6_A_OPERATIONAL_WINDOW_MOTION_REGRESSION',classification:'LANE_A_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',status:operationalFailures.length?'FAIL':'PASS',sourceCanonicalTreeSha256:source.sha256,canonicalSourceFileCount:source.files,pass:operationalTests.length-operationalFailures.length,fail:operationalFailures.length,tests:operationalTests};
await fs.writeFile(path.join(assurance,'W6_A_EXECUTABLE_OWNER_PROOF.json'),JSON.stringify(execOut,null,2)+'\n');
await fs.writeFile(path.join(assurance,'W6_A_NEGATIVE_DUPLICATE_OWNER_PROOF.json'),JSON.stringify(negative,null,2)+'\n');
await fs.writeFile(path.join(assurance,'W6_A_OPERATIONAL_REGRESSION.json'),JSON.stringify(operational,null,2)+'\n');
const status=[execOut.status,negative.status,operational.status].every(x=>x==='PASS')?'PASS':'FAIL';
console.log(JSON.stringify({status,sourceCanonicalTreeSha256:source.sha256,canonicalSourceFileCount:source.files,executable:{pass:execOut.passCount,fail:execOut.failCount},negative:negative.status,operational:{pass:operational.pass,fail:operational.fail}},null,2));
if(status!=='PASS')process.exitCode=1;
