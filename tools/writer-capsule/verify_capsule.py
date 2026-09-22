#!/usr/bin/env python3
import hashlib, json, pathlib, subprocess, sys

def sha256(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for c in iter(lambda:f.read(1024*1024),b""): h.update(c)
    return h.hexdigest()

def main():
    root=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else ".").resolve()
    mf=root/"CAPSULE_MANIFEST.json"
    if not mf.exists(): raise SystemExit("CAPSULE_MANIFEST.json missing")
    m=json.loads(mf.read_text(encoding="utf-8"))
    for name,meta in m["payload"].items():
        p=root/name
        if not p.exists(): raise SystemExit(f"payload missing: {name}")
        if p.stat().st_size != meta["bytes"]: raise SystemExit(f"size mismatch: {name}")
        if sha256(p) != meta["sha256"]: raise SystemExit(f"sha256 mismatch: {name}")

    binding=root/"CAPSULE_BINDING.json"
    if binding.exists():
        b=json.loads(binding.read_text(encoding="utf-8"))
        if b.get("expectedSourceCommit") and b["expectedSourceCommit"] != m["sourceCommit"]:
            raise SystemExit("CAPSULE_BINDING expectedSourceCommit mismatch")

    visual=root/"visual-bootstrap"/"VISUAL_BOOTSTRAP_MANIFEST.json"
    visual_status=None
    if visual.exists():
        v=json.loads(visual.read_text(encoding="utf-8"))
        if v.get("sourceCommit") != m["sourceCommit"]: raise SystemExit("visual bootstrap sourceCommit mismatch")
        if v.get("sourceTree") != m["sourceTree"]: raise SystemExit("visual bootstrap sourceTree mismatch")
        visual_status=v.get("status") or v.get("classification")

    p=subprocess.run(["git","bundle","verify",str(root/"repo.bundle")],text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    if p.returncode: raise SystemExit("git bundle verify failed:\n"+p.stdout)
    print(json.dumps({"verdict":"PASS","missionId":m["missionId"],"sourceCommit":m["sourceCommit"],"sourceTree":m["sourceTree"],"visualBootstrapStatus":visual_status}))

if __name__=="__main__": main()
