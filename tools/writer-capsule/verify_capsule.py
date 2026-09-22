#!/usr/bin/env python3
import hashlib, json, pathlib, subprocess, sys, tempfile

def sha256(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for c in iter(lambda:f.read(1024*1024),b""): h.update(c)
    return h.hexdigest()

def run(argv,cwd=None):
    return subprocess.run(argv,cwd=cwd,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)

def verify_bundle_standalone(bundle,expected_commit):
    heads=run(["git","bundle","list-heads",str(bundle)])
    if heads.returncode:
        raise SystemExit("git bundle list-heads failed:\n"+heads.stdout)
    rows=[line.split(None,1) for line in heads.stdout.splitlines() if line.strip()]
    commits=[row[0] for row in rows]
    if expected_commit not in commits:
        raise SystemExit(f"bundle does not expose expected capsule commit {expected_commit}")
    with tempfile.TemporaryDirectory(prefix="cep-capsule-verify-") as td:
        bare=pathlib.Path(td)/"verify.git"
        init=run(["git","init","--bare",str(bare)])
        if init.returncode:
            raise SystemExit("temporary bare git init failed:\n"+init.stdout)
        verify=run(["git","-C",str(bare),"bundle","verify",str(bundle)])
        if verify.returncode:
            raise SystemExit("git bundle verify failed:\n"+verify.stdout)
    return heads.stdout

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
        expected_parent=b.get("expectedProductParentCommit")
        if expected_parent and m.get("productParentCommit") != expected_parent:
            raise SystemExit("CAPSULE_BINDING expectedProductParentCommit mismatch")

    visual=root/"visual-bootstrap"/"VISUAL_BOOTSTRAP_MANIFEST.json"
    visual_status=None
    if visual.exists():
        v=json.loads(visual.read_text(encoding="utf-8"))
        if v.get("sourceCommit") != m["sourceCommit"]: raise SystemExit("visual bootstrap sourceCommit mismatch")
        if v.get("sourceTree") != m["sourceTree"]: raise SystemExit("visual bootstrap sourceTree mismatch")
        if v.get("trackedSourceGuard") != "PASS": raise SystemExit("visual bootstrap trackedSourceGuard is not PASS")
        visual_status=v.get("status") or v.get("classification")

    verify_bundle_standalone(root/"repo.bundle",m["sourceCommit"])
    print(json.dumps({
      "verdict":"PASS",
      "missionId":m["missionId"],
      "productParentCommit":m.get("productParentCommit"),
      "capsuleTransportCommit":m["sourceCommit"],
      "capsuleTransportTree":m["sourceTree"],
      "visualBootstrapStatus":visual_status,
      "trackedSourceGuard":m.get("trackedSourceGuard")
    }))

if __name__=="__main__": main()
