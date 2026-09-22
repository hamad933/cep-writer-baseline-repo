#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,subprocess,sys
root=Path(__file__).resolve().parents[2]
mp=root/'cep-writer'/'C1_PACKET_MANIFEST.json'
if not mp.is_file():
    print('C1_PACKET_MANIFEST_MISSING');sys.exit(2)
m=json.loads(mp.read_text(encoding='utf-8'))
bad=[]
for row in m.get('entries',[]):
    p=root/row['path']
    if not p.is_file():
        bad.append({'path':row['path'],'error':'MISSING'});continue
    b=p.read_bytes();h=hashlib.sha256(b).hexdigest()
    if len(b)!=row['size'] or h!=row['sha256']:
        bad.append({'path':row['path'],'error':'HASH_SIZE_MISMATCH','size':len(b),'sha256':h})
if bad:
    print(json.dumps({'status':'FAIL','bad':bad[:20]},indent=2));sys.exit(2)
if m.get('noRequiredLiveDriveFetch') is not True:
    print('LIVE_DRIVE_DEPENDENCY_NOT_CLOSED');sys.exit(2)
branch='UNAVAILABLE_CONNECTED_CHAT_ENVIRONMENT';head='UNAVAILABLE_CONNECTED_CHAT_ENVIRONMENT'
try:
    branch=subprocess.check_output(['git','branch','--show-current'],cwd=root,text=True).strip()
    head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
    parent=m['exactProductParentCommit']
    if branch and branch!=m['candidateBranch']:
        print('BRANCH_MISMATCH',branch,m['candidateBranch']);sys.exit(2)
    if subprocess.run(['git','merge-base','--is-ancestor',parent,head],cwd=root).returncode!=0:
        print('PARENT_NOT_ANCESTOR',parent,head);sys.exit(2)
except (FileNotFoundError,subprocess.CalledProcessError):
    pass
print(json.dumps({'status':'PASS','entries':len(m.get('entries',[])),'candidateBranch':m['candidateBranch'],'exactProductParentCommit':m['exactProductParentCommit'],'branchObserved':branch,'headObserved':head,'noRequiredLiveDriveFetch':True},indent=2))
