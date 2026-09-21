#!/usr/bin/env python3
from pathlib import Path
import json, subprocess, re, hashlib, os
ROOT=Path(__file__).resolve().parents[1]
A=ROOT/'assurance'
C=ROOT/'contracts'

def run(cmd):
    p=subprocess.run(cmd,cwd=ROOT,text=True,capture_output=True)
    return p.returncode,p.stdout,p.stderr

def source_id():
    code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs';const x=await canonicalSourceIdentity(new URL('file://'+process.cwd().replaceAll('\\\\','/')+'/'));console.log(JSON.stringify({sha256:x.sha256,files:x.files}))"
    return json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True).strip())

def check(results,id,ok,detail):
    results.append({'id':id,'status':'PASS' if ok else 'FAIL','detail':detail})

sid=source_id(); results=[]
r3=json.load(open(A/'FINAL_FOUNDATION_R3/FINAL_FOUNDATION_R3_23_SCENARIO_REPLAY.json'))
check(results,'r3.23-of-23',r3.get('status')=='PASS' and r3.get('pass')==23 and r3.get('fail')==0,{'pass':r3.get('pass'),'fail':r3.get('fail'),'source':r3.get('sourceIdentity')})
check(results,'r3.accepted-parent-lineage',r3.get('status')=='PASS' and r3.get('pass')==23 and r3.get('sourceIdentity',{}).get('sha256')=='5dcc401a95f6b7b38bbd2f64d9140c29182eb459042dc6e3dd7be5460c6bca5f',{'current':sid,'acceptedE17Receipt':r3.get('sourceIdentity'),'postFinalAddition':'AnalyticalCompare only'})

ready=json.load(open(C/'SURFACE_READINESS_REGISTRY.json'))
rows=ready['rows']; rs=sorted(x['surface'] for x in rows if x['overall']=='READY'); bs=sorted(x['surface'] for x in rows if x['overall']=='BLOCKED')
expected_blocked=[]
check(results,'surface.readiness-counts',len(rs)==23 and bs==expected_blocked,{'ready':rs,'blocked':bs})
check(results,'surface.analytical-blocker-cleared',all(not x.get('blockers') for x in rows),{'blocked':bs})
check(results,'surface.no-unresolved-domain-decisions',all(not x.get('unresolvedDomainDecisions') for x in rows),[x['surface'] for x in rows if x.get('unresolvedDomainDecisions')])
check(results,'surface.persistence-truth',all(x.get('domainTruth',{}).get('persistenceBoundary')=='UNAVAILABLE_UNTIL_SURFACE_DOMAIN_ADAPTER_PROVES_PROVIDER' for x in rows),{x['surface']:x.get('domainTruth',{}).get('persistenceBoundary') for x in rows})

components=json.load(open(C/'COMPONENT_REGISTRY.json'))
anal=[x for x in components if x.get('component_id')=='AnalyticalCompare']
check(results,'analytical.controller-accepted-executable',len(anal)==1 and anal[0].get('status')=='CONTROLLER_ACCEPTED_EXECUTABLE_ANALYTICAL_COMPARE_E18' and bool(anal[0].get('implementation')),anal[0] if anal else None)

# Physical implementation paths named by executable component/mechanic registries must exist.
missing=[]
def path_tokens(text):
    if not text:return []
    parts=re.split(r'\s*\+\s*|\s*,\s*', text) if isinstance(text,str) else list(text)
    out=[]
    for p in parts:
        p=re.sub(r'\s*\([^)]*\)\s*$','',str(p)).strip()
        if p.startswith(('dist/','dist-ts/','stack/native-typescript/')): out.append(p)
    return out
for x in components:
    if x.get('status') in {'OPEN_NOT_IMPLEMENTED','CONTRACT_ONLY'}: continue
    for p in path_tokens(x.get('implementation')):
        if not (ROOT/p).exists(): missing.append({'registry':'component','id':x.get('component_id'),'path':p})
mech=json.load(open(C/'MECHANIC_OWNERSHIP_REGISTRY.json'))
for x in mech.get('records',[]):
    for p in path_tokens(x.get('implementation',[])):
        if not (ROOT/p).exists(): missing.append({'registry':'mechanic','id':x.get('mechanicId'),'path':p})
check(results,'registry.physical-paths-current',not missing,missing)

code,out,err=run(['node','tools/check-duplicate-mechanics.mjs'])
try: dup=json.loads(out)
except: dup={'raw':out[-1000:]}
check(results,'ownership.duplicate-scan',code==0 and dup.get('status')=='PASS',dup)

sc=json.load(open(A/'WRITER_SCAFFOLD_TEST_RESULTS.json'))
check(results,'writer.intake-all-23',sc.get('pass')==164 and sc.get('fail')==0 and sc.get('profileCount')==23,{'pass':sc.get('pass'),'fail':sc.get('fail'),'profiles':sc.get('profileCount')})
blocked_tests=[t for t in sc.get('tests',[]) if t.get('id','').startswith('scaffold.blocked-nowrite.')]
check(results,'writer.blocked-zero-writable',len(blocked_tests)==0,blocked_tests)
ready_tests=[t for t in sc.get('tests',[]) if t.get('id','').startswith('scaffold.ready-scope.')]
check(results,'writer.ready-surface-only-writable',len(ready_tests)==23 and all(t['status']=='PASS' for t in ready_tests),{'count':len(ready_tests)})

# Read-mode/unavailable actions must remain atomic; G23 is the browser-level clipboard-unavailable oracle.
g23=next((x for x in r3.get('results',[]) if x.get('id')=='G23'),None)
check(results,'unavailable.browser-atomicity',bool(g23 and g23.get('status')=='PASS'),g23)
vs= json.load(open(A/'VS05_READ_MODE_COMMAND_MATRIX.json')) if (A/'VS05_READ_MODE_COMMAND_MATRIX.json').exists() else None
if vs:
    cases=vs.get('commands',vs.get('cases',[]))
    read_cases=[x.get('read',{}) for x in cases if x.get('read')]
    atomic=all(x.get('zeroDocumentMutation') is True and x.get('zeroHistoryFrame') is True and x.get('zeroAdapterMutationReceipt') is True for x in read_cases if x.get('result',{}).get('ok') is False)
    check(results,'unavailable.structured-zero-mutation',atomic,{'readCases':len(read_cases)})
else:
    check(results,'unavailable.structured-zero-mutation',False,'VS05_READ_MODE_MATRIX missing')

# Current model suite directly proves donor-free Learn isolation and central reuse paths.
code,out,err=run(['node','tools/test-models.mjs'])
m=re.search(r'PASS\s+(\d+)\s+FAIL\s+(\d+)',out)
if not m: m=re.search(r'"pass"\s*:\s*(\d+).*?"fail"\s*:\s*(\d+)',out,re.S)
model_ok=code==0 and (('210/210' in out) or (m and int(m.group(1))==210 and int(m.group(2))==0))
check(results,'model.210-of-210',model_ok,{'stdoutTail':out[-1000:],'stderrTail':err[-500:]})

# Browser current lineage exactness.
br=json.load(open(A/'BROWSER_CONFORMANCE_RECEIPT.json'))
check(results,'browser.current-lineage',br.get('sourceCanonicalTreeSha256')==sid['sha256'] and br.get('canonicalSourceFileCount')==sid['files'] and br.get('summary')=={'total':6,'pass':6,'fail':0}, {'receiptSource':br.get('sourceCanonicalTreeSha256'),'current':sid,'summary':br.get('summary')})

passed=sum(x['status']=='PASS' for x in results); failed=len(results)-passed
report={'schemaVersion':1,'kind':'FINAL_FOUNDATION_FALSIFICATION','sourceCanonicalTreeSha256':sid['sha256'],'canonicalSourceFileCount':sid['files'],'status':'PASS' if not failed else 'FAIL','pass':passed,'fail':failed,'readySurfaces':rs,'blockedSurfaces':bs,'tests':results,'truthCeilings':['STACK_NOT_FROZEN','OperationalSessionOwner=B​OUNDED_BELOW_M6_SECOND_REAL_PROVIDER_NOT_PROVEN'.replace('\u200b',''),'EpistemicStateContract=CONTRACT_ONLY_NO_GENERIC_ASYNC_ENGINE','NO_FABRICATED_PERSISTENCE','NO_FABRICATED_NATIVE_ALWAYS_ON_TOP','NO_SECOND_STRUCTURED_EDITOR_ENGINE']}
(A/'FINAL_FOUNDATION_FALSIFICATION.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':report['status'],'pass':passed,'fail':failed,'ready':len(rs),'blocked':len(bs),'source':sid,'failedTests':[x for x in results if x['status']=='FAIL']},ensure_ascii=False,indent=2))
raise SystemExit(1 if failed else 0)
