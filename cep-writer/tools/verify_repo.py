#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,sys
root=Path(__file__).resolve().parents[2]
man=json.loads((root/'cep-writer'/'WRITER_INPUT_MANIFEST.json').read_text(encoding='utf-8'))
if man.get('noRequiredLiveDriveFetch') is not True:
    print('LIVE_DRIVE_DEPENDENCY_NOT_ALLOWED');sys.exit(2)
bad=[]
for e in man['entries']:
    p=root/e['path']
    if not p.is_file(): bad.append((e['path'],'MISSING')); continue
    b=p.read_bytes(); got=(len(b),hashlib.sha256(b).hexdigest()); exp=(e['size'],e['sha256'])
    if got!=exp: bad.append((e['path'],'HASH_SIZE_MISMATCH',got,exp))
if bad:
    print('REQUIRED_INPUT_MISMATCH',bad[:10]);sys.exit(2)
source=root/'stack'/'native-typescript'
rows=[]
for p in source.rglob('*'):
    if p.is_file():
        b=p.read_bytes(); rows.append((p.relative_to(source).as_posix(),len(b),hashlib.sha256(b).hexdigest()))
rows.sort(key=lambda x:x[0])
stream=''.join(f'{p}\0{s}\0{h}\n' for p,s,h in rows).encode()
source_sha=hashlib.sha256(stream).hexdigest()
if source_sha!=man['productCanonicalSourceSha256'] or len(rows)!=man['productCanonicalSourceFiles']:
    print('PRODUCT_SOURCE_IDENTITY_MISMATCH',source_sha,len(rows),man['productCanonicalSourceSha256'],man['productCanonicalSourceFiles']);sys.exit(2)
print(json.dumps({'status':'PASS','requiredInputs':len(man['entries']),'productCanonicalSourceSha256':source_sha,'productCanonicalSourceFiles':len(rows),'noRequiredLiveDriveFetch':True},indent=2))
