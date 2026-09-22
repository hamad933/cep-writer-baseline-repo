#!/usr/bin/env python3
import argparse, datetime, hashlib, json, os, pathlib, shutil, subprocess

def run(*args,cwd=None):
    p=subprocess.run(args,cwd=cwd,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode: raise SystemExit("command failed: "+" ".join(args)+"\n"+p.stderr)
    return p.stdout.strip()

def tracked_changes(root):
    names=set()
    for args in [("git","diff","--name-only"),("git","diff","--cached","--name-only")]:
        out=run(*args,cwd=root)
        for line in out.splitlines():
            line=line.strip()
            if line: names.add(line)
    return sorted(names)

def sha256(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""): h.update(chunk)
    return h.hexdigest()

def clean_dir(path):
    if path.exists(): shutil.rmtree(path)
    path.mkdir(parents=True,exist_ok=True)

def file_meta(base,path):
    return {"bytes":path.stat().st_size,"sha256":sha256(path)}

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--repo-root",default=".")
    ap.add_argument("--output",default="writer-capsule-out")
    ap.add_argument("--binding",default="cep-writer/CAPSULE_BINDING.json")
    ap.add_argument("--visual-bootstrap",default=".capsule-visual-bootstrap")
    ap.add_argument("--mission",default=None)
    ns=ap.parse_args()

    root=pathlib.Path(ns.repo_root).resolve()
    tracked=tracked_changes(root)
    if tracked:
        raise SystemExit("capsule build requires zero tracked source delta from packaging/capture: "+", ".join(tracked))

    out=(root/ns.output).resolve()
    clean_dir(out)

    head=run("git","rev-parse","HEAD",cwd=root)
    tree=run("git","rev-parse","HEAD^{tree}",cwd=root)
    branch=os.environ.get("GITHUB_REF_NAME") or run("git","rev-parse","--abbrev-ref","HEAD",cwd=root)
    repo=os.environ.get("GITHUB_REPOSITORY","hamad933/cep-writer-baseline-repo")

    binding_path=(root/ns.binding).resolve()
    binding={}
    if binding_path.exists():
        binding=json.loads(binding_path.read_text(encoding="utf-8"))
        exp=binding.get("expectedSourceCommit")
        if exp and exp != head: raise SystemExit(f"binding expectedSourceCommit {exp} != HEAD {head}")
        shutil.copy2(binding_path,out/"CAPSULE_BINDING.json")
    mission=ns.mission or binding.get("missionId") or "INFRA_TEMPLATE_VALIDATION_ONLY"

    temp_ref="refs/heads/__cep_capsule_source"
    run("git","update-ref",temp_ref,head,cwd=root)
    bundle=out/"repo.bundle"
    try:
        run("git","bundle","create",str(bundle),temp_ref,cwd=root)
    finally:
        run("git","update-ref","-d",temp_ref,cwd=root)
    run("git","bundle","verify",str(bundle),cwd=root)

    visual_src=(root/ns.visual_bootstrap).resolve()
    visual_status=None
    if visual_src.exists():
        visual_dst=out/"visual-bootstrap"
        shutil.copytree(visual_src,visual_dst)
        vm=visual_dst/"VISUAL_BOOTSTRAP_MANIFEST.json"
        if vm.exists():
            v=json.loads(vm.read_text(encoding="utf-8"))
            if v.get("sourceCommit") != head: raise SystemExit("visual bootstrap sourceCommit mismatch")
            if v.get("sourceTree") != tree: raise SystemExit("visual bootstrap sourceTree mismatch")
            if v.get("trackedSourceGuard") != "PASS": raise SystemExit("visual bootstrap trackedSourceGuard is not PASS")
            visual_status=v.get("status") or v.get("classification")

    if tracked_changes(root):
        raise SystemExit("capsule packaging introduced tracked source delta")

    bootstrap_sh="""#!/usr/bin/env bash
set -euo pipefail
CAPSULE_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-$CAPSULE_DIR/workspace}"
python3 "$CAPSULE_DIR/verify_capsule.py" "$CAPSULE_DIR"
git clone "$CAPSULE_DIR/repo.bundle" "$TARGET"
git -C "$TARGET" checkout --detach __HEAD__
ACTUAL="$(git -C "$TARGET" rev-parse HEAD)"
test "$ACTUAL" = "__HEAD__"
echo "CEP capsule materialized: $TARGET @ $ACTUAL"
echo "Visual bootstrap: $CAPSULE_DIR/visual-bootstrap"
""".replace("__HEAD__",head)
    (out/"bootstrap.sh").write_text(bootstrap_sh,encoding="utf-8",newline="\n")
    os.chmod(out/"bootstrap.sh",0o755)

    bootstrap_ps1="""param([string]$Target = "$PSScriptRoot\\workspace")
$ErrorActionPreference = "Stop"
python "$PSScriptRoot\\verify_capsule.py" "$PSScriptRoot"
git clone "$PSScriptRoot\\repo.bundle" $Target
git -C $Target checkout --detach __HEAD__
$actual = (git -C $Target rev-parse HEAD).Trim()
if ($actual -ne "__HEAD__") { throw "HEAD mismatch: $actual" }
Write-Host "CEP capsule materialized: $Target @ $actual"
Write-Host "Visual bootstrap: $PSScriptRoot\\visual-bootstrap"
""".replace("__HEAD__",head)
    (out/"bootstrap.ps1").write_text(bootstrap_ps1,encoding="utf-8",newline="\n")

    shutil.copy2(root/"tools/writer-capsule/verify_capsule.py",out/"verify_capsule.py")

    first=f"""# CEP Writer Capsule — READ FIRST

Mission: `{mission}`
Repository: `{repo}`
Source ref: `{branch}`
Exact source commit: `{head}`
Exact source tree: `{tree}`
Visual bootstrap status: `{visual_status or 'NOT_CONFIGURED'}`

1. Run `verify_capsule.py`.
2. Materialize with `bootstrap.sh` or `bootstrap.ps1`.
3. Read the local mission packet and exact scope.
4. Open `visual-bootstrap/VISUAL_BOOTSTRAP_MANIFEST.json` before creating a new baseline.
5. If status is READY, use the prebuilt exact-parent screenshots/reference mappings as the first comparison.
6. Capture locally only when a required state is missing/partial or after Product changes.
7. Work locally; do not use connector-driven per-file assembly.
8. Stop on identity/binding mismatch; never guess or silently refetch.
"""
    (out/"README_FIRST.md").write_text(first,encoding="utf-8",newline="\n")

    payload={}
    for p in sorted(out.rglob("*")):
        if not p.is_file(): continue
        if p.name in {"CAPSULE_MANIFEST.json","SHA256SUMS.txt"}: continue
        rel=str(p.relative_to(out)).replace(os.sep,"/")
        payload[rel]=file_meta(out,p)

    manifest={
      "schemaVersion":2,
      "classification":"SELF_CONTAINED_WRITER_WORKSPACE_CAPSULE_V1_1__CONTROLLER_PREPARED__EXECUTION_TRANSPORT_ONLY__NOT_AUTHORITY",
      "missionId":mission,"repository":repo,"sourceRef":branch,
      "sourceCommit":head,"sourceTree":tree,
      "bindingPath":str(binding_path.relative_to(root)) if binding_path.exists() else None,
      "binding":binding or None,
      "controllerPrepared":True,
      "writerPreparationDuty":"VERIFY_MATERIALIZE_COMPARE__NOT_CAPSULE_OR_BASELINE_ASSEMBLY",
      "visualBootstrapStatus":visual_status,
      "trackedSourceGuard":"PASS",
      "noSilentLiveFetch":True,"localFirst":True,
      "payload":payload,
      "generatedAtUtc":datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    manifest_path=out/"CAPSULE_MANIFEST.json"
    manifest_path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    sums_payload=dict(payload)
    sums_payload["CAPSULE_MANIFEST.json"]=file_meta(out,manifest_path)
    (out/"SHA256SUMS.txt").write_text("".join(f"{v['sha256']}  {k}\n" for k,v in sorted(sums_payload.items())),encoding="utf-8",newline="\n")
    print(json.dumps({"mission":mission,"head":head,"tree":tree,"output":str(out),"files":len(payload),"visualBootstrapStatus":visual_status,"trackedSourceGuard":"PASS","bundleSha256":payload["repo.bundle"]["sha256"]}))

if __name__=="__main__": main()
