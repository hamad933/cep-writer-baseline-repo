#!/usr/bin/env python3
import hashlib, json, pathlib, struct, subprocess, zlib

ROOT=pathlib.Path(__file__).resolve().parents[3]
OUT=ROOT/".capsule-validation-output"
BASE=OUT/"baseline"
BASE.mkdir(parents=True,exist_ok=True)

def git(*args):
    return subprocess.check_output(["git",*args],cwd=ROOT,text=True).strip()

def png_bytes(width,height,rgb):
    raw=b"".join(b"\x00"+bytes(rgb)*width for _ in range(height))
    def chunk(kind,data):
        return struct.pack(">I",len(data))+kind+data+struct.pack(">I",zlib.crc32(kind+data)&0xffffffff)
    return b"\x89PNG\r\n\x1a\n"+chunk(b"IHDR",struct.pack(">IIBBBBB",width,height,8,2,0,0,0))+chunk(b"IDAT",zlib.compress(raw,9))+chunk(b"IEND",b"")

head=git("rev-parse","HEAD")
tree=git("rev-parse","HEAD^{tree}")
shots=[
    ("validation-1440x1000.png",1440,1000,(33,41,54)),
    ("validation-1024x900.png",1024,900,(46,55,71)),
]
files=[]
for name,w,h,rgb in shots:
    p=BASE/name
    data=png_bytes(w,h,rgb)
    p.write_bytes(data)
    files.append({"path":str(p.relative_to(ROOT)),"width":w,"height":h,"bytes":len(data),"sha256":hashlib.sha256(data).hexdigest()})
receipt={
    "schemaVersion":1,
    "classification":"CAPSULE_V1_1_VALIDATION_FIXTURE_ONLY__NOT_PRODUCT_OR_ACCEPTANCE_EVIDENCE",
    "sourceCommit":head,
    "sourceTree":tree,
    "captureMethod":"DETERMINISTIC_STANDARD_LIBRARY_PNG_GENERATOR",
    "purpose":"Exercise visual-bootstrap transport, hashing, manifesting and clean materialization without claiming Product UI evidence.",
    "files":files
}
(OUT/"validation-receipt.json").write_text(json.dumps(receipt,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"verdict":"PASS","sourceCommit":head,"sourceTree":tree,"files":files}))
