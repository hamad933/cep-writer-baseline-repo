#!/usr/bin/env python3
import argparse, hashlib, json, os, pathlib, subprocess, datetime

def run(*args, cwd=None):
    p=subprocess.run(args,cwd=cwd,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode:
        raise SystemExit("command failed: "+" ".join(args)+"\n"+p.stderr)
    return p.stdout.strip()

def sha256(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''):
            h.update(chunk)
    return h.hexdigest()

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--repo-root",default=".")
    ap.add_argument("--output",default="writer-capsule-out")
    ap.add_argument("--binding",default="cep-writer/CAPSULE_BINDING.json")
    ap.add_argument("--mission",default=None)
    ns=ap.parse_args()

    root=pathlib.Path(ns.repo_root).resolve()
    out=(root/ns.output).resolve()
    if out.exists():
        for p in sorted(out.rglob("*"),reverse=True):
            if p.is_file() or p.is_symlink(): p.unlink()
            elif p.is_dir(): p.rmdir()
    out.mkdir(parents=True,exist_ok=True)

    head=run("git","rev-parse","HEAD",cwd=root)
    tree=run("git","rev-parse","HEAD^{tree}",cwd=root)
    branch=os.environ.get("GITHUB_REF_NAME") or run("git","rev-parse","--abbrev-ref","HEAD",cwd=root)
    repo=os.environ.get("GITHUB_REPOSITORY","hamad933/cep-writer-baseline-repo")

    binding_path=root/ns.binding
    binding={}
    if binding_path.exists():
        binding=json.loads(binding_path.read_text(encoding="utf-8"))
        exp=binding.get("expectedSourceCommit")
        if exp and exp != head:
            raise SystemExit(f"binding expectedSourceCommit {exp} != HEAD {head}")
    mission=ns.mission or binding.get("missionId") or "INFRA_TEMPLATE_VALIDATION_ONLY"

    temp_ref="refs/heads/__cep_capsule_source"
    run("git","update-ref",temp_ref,head,cwd=root)
    bundle=out/"repo.bundle"
    try:
        run("git","bundle","create",str(bundle),temp_ref,cwd=root)
    finally:
        run("git","update-ref","-d",temp_ref,cwd=root)
    run("git","bundle","verify",str(bundle),cwd=root)

    bootstrap_sh = """#!/usr/bin/env bash
set -euo pipefail
CAPSULE_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="__TARGET_EXPR__"
python3 "$CAPSULE_DIR/verify_capsule.py" "$CAPSULE_DIR"
git clone "$CAPSULE_DIR/repo.bundle" "$TARGET"
git -C "$TARGET" checkout --detach __HEAD__
ACTUAL="$(git -C "$TARGET" rev-parse HEAD)"
test "$ACTUAL" = "__HEAD__"
echo "CEP capsule materialized: $TARGET @ $ACTUAL"
""".replace("__TARGET_EXPR__", '${1:-$CAPSULE_DIR/workspace}').replace("__HEAD__", head)
    (out/"bootstrap.sh").write_text(bootstrap_sh,encoding="utf-8",newline="\n")
    os.chmod(out/"bootstrap.sh",0o755)

    bootstrap_ps1 = """param([string]$Target = "$PSScriptRoot\\workspace")
$ErrorActionPreference = "Stop"
python "$PSScriptRoot\\verify_capsule.py" "$PSScriptRoot"
git clone "$PSScriptRoot\\repo.bundle" $Target
git -C $Target checkout --detach __HEAD__
$actual = (git -C $Target rev-parse HEAD).Trim()
if ($actual -ne "__HEAD__") { throw "HEAD mismatch: $actual" }
Write-Host "CEP capsule materialized: $Target @ $actual"
""".replace("__HEAD__", head)
    (out/"bootstrap.ps1").write_text(bootstrap_ps1,encoding="utf-8",newline="\n")

    verifier_src=root/"tools/writer-capsule/verify_capsule.py"
    (out/"verify_capsule.py").write_bytes(verifier_src.read_bytes())

    first=f"""# CEP Writer Capsule — READ FIRST

Mission: `{mission}`
Repository: `{repo}`
Source branch/ref: `{branch}`
Exact source commit: `{head}`
Exact source tree: `{tree}`

1. Run `verify_capsule.py`.
2. Materialize with `bootstrap.sh` or `bootstrap.ps1`.
3. Re-check exact task authority inside the materialized repository before Product mutation.
4. Work locally. Do not use connector-driven per-file assembly.
5. Intermediate evidence remains local unless final custody is explicitly required.
6. Stop on any identity/binding mismatch; never guess or silently refetch.
"""
    (out/"README_FIRST.md").write_text(first,encoding="utf-8",newline="\n")

    payload={}
    for name in ["repo.bundle","bootstrap.sh","bootstrap.ps1","verify_capsule.py","README_FIRST.md"]:
        p=out/name
        payload[name]={"bytes":p.stat().st_size,"sha256":sha256(p)}

    manifest={
      "schemaVersion":1,
      "classification":"SELF_CONTAINED_WRITER_WORKSPACE_CAPSULE__EXECUTION_TRANSPORT_ONLY__NOT_AUTHORITY",
      "missionId":mission,
      "repository":repo,
      "sourceRef":branch,
      "sourceCommit":head,
      "sourceTree":tree,
      "bindingPath":str(binding_path.relative_to(root)) if binding_path.exists() else None,
      "binding":binding or None,
      "noSilentLiveFetch":True,
      "localFirst":True,
      "payload":payload,
      "generatedAtUtc":datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    (out/"CAPSULE_MANIFEST.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    manifest_meta={"bytes":(out/"CAPSULE_MANIFEST.json").stat().st_size,"sha256":sha256(out/"CAPSULE_MANIFEST.json")}
    sums_payload=dict(payload)
    sums_payload["CAPSULE_MANIFEST.json"]=manifest_meta
    sums="".join(f"{v['sha256']}  {k}\n" for k,v in sorted(sums_payload.items()))
    (out/"SHA256SUMS.txt").write_text(sums,encoding="utf-8",newline="\n")
    print(json.dumps({"mission":mission,"head":head,"tree":tree,"output":str(out),"bundleSha256":payload["repo.bundle"]["sha256"]}))

if __name__=="__main__":
    main()
