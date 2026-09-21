#!/usr/bin/env python3
from pathlib import Path
import json, subprocess
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'assurance'/'FINAL_FOUNDATION_R3'
chunks=[json.loads((OUT/f'FINAL_FOUNDATION_R3_CHUNK_{i}.json').read_text()) for i in range(1,5)]
if any(c.get('status')!='PASS' for c in chunks): raise SystemExit('R3_CHUNK_NOT_PASS')
results=[];shots=[]
for c in chunks: results+=c['results'];shots+=c.get('screenshots',[])
if len(results)!=23 or len({r['id'] for r in results})!=23: raise SystemExit('R3_SCENARIO_SET_INVALID')
code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs';const x=await canonicalSourceIdentity(new URL('file://'+process.cwd().replaceAll('\\\\','/')+'/'));console.log(JSON.stringify({sha256:x.sha256,files:x.files}))"
identity=json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True))
if any(c.get('sourceCanonicalTreeSha256')!=identity['sha256'] for c in chunks): raise SystemExit('R3_SOURCE_DRIFT')
receipt={'schemaVersion':2,'kind':'FINAL_FOUNDATION_R3_23_SCENARIO_REPLAY','classification':'CONTROLLER_FINAL_FOUNDATION_GATE_EVIDENCE','status':'PASS','executionMode':'ISOLATED_BROWSER_CHUNKS_WITH_CANONICAL_ROUTE_ASSERTIONS_FOR_HEADLESS_KEY_TRANSPORT_EDGE_CASES','sourceIdentity':identity,'sourceCanonicalTreeSha256':identity['sha256'],'canonicalSourceFileCount':identity['files'],'scenarioCount':23,'pass':23,'fail':0,'results':sorted(results,key=lambda x:int(x['id'][1:])),'screenshots':shots,'r3LawCoverage':sorted(set(r['law'] for r in results)),'chunks':[{'file':f'FINAL_FOUNDATION_R3_CHUNK_{i}.json','pass':chunks[i-1]['pass'],'fail':chunks[i-1]['fail']} for i in range(1,5)]}
(OUT/'FINAL_FOUNDATION_R3_23_SCENARIO_REPLAY.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':'PASS','pass':23,'fail':0,'sourceIdentity':identity},indent=2))
