#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,sys
root=Path(__file__).resolve().parents[2]
man=json.loads((root/'cep-writer'/'REPOSITORY_MANIFEST.json').read_text(encoding='utf-8'))
expected={x['path']:(x['size'],x['sha256']) for x in man['entries']}
actual={}
for p in root.rglob('*'):
    if p.is_file() and p.relative_to(root).as_posix()!='cep-writer/REPOSITORY_MANIFEST.json':
        rel=p.relative_to(root).as_posix(); b=p.read_bytes(); actual[rel]=(len(b),hashlib.sha256(b).hexdigest())
if set(actual)!=set(expected):
    print('PATH_SET_MISMATCH',sorted(set(actual)-set(expected))[:10],sorted(set(expected)-set(actual))[:10]);sys.exit(2)
bad=[k for k,v in expected.items() if actual[k]!=v]
if bad:
    print('HASH_SIZE_MISMATCH',bad[:10]);sys.exit(2)
rows=sorted(expected.items(),key=lambda x:x[0].encode())
stream=''.join(f'{p}\0{s}\0{h}\n' for p,(s,h) in rows).encode()
tree=hashlib.sha256(stream).hexdigest()
if tree!=man['repositoryTreeSha256']:
    print('TREE_MISMATCH',tree,man['repositoryTreeSha256']);sys.exit(2)
print(json.dumps({'status':'PASS','files':len(expected),'repositoryTreeSha256':tree,'productCanonicalSourceSha256':man['productCanonicalSourceSha256']},indent=2))
