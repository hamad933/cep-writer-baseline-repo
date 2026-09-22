#!/usr/bin/env python3
import argparse, datetime, glob, hashlib, json, os, pathlib, shutil, subprocess

def sha256(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""): h.update(chunk)
    return h.hexdigest()

def run_argv(argv,cwd,env):
    p=subprocess.run(argv,cwd=cwd,env=env,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    return {"argv":argv,"cwd":str(cwd),"returnCode":p.returncode,"output":p.stdout[-12000:]}

def git_output(root,*args):
    p=subprocess.run(["git",*args],cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode:
        raise SystemExit("git command failed: git "+" ".join(args)+"\n"+p.stderr)
    return p.stdout

def tracked_changes(root):
    names=set()
    for args in [("diff","--name-only"),("diff","--cached","--name-only")]:
        for line in git_output(root,*args).splitlines():
            line=line.strip()
            if line: names.add(line)
    return sorted(names)

def copy_matches(root,patterns,dest):
    copied=[]; seen=set()
    for pattern in patterns:
        for raw in glob.glob(str(root/pattern),recursive=True):
            p=pathlib.Path(raw)
            if not p.is_file(): continue
            rp=p.resolve()
            if rp in seen: continue
            seen.add(rp)
            try: rel=rp.relative_to(root.resolve())
            except ValueError: continue
            target=dest/rel
            target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(rp,target)
            copied.append(target)
    return copied

def file_meta(root,path):
    return {"path":str(path.relative_to(root)).replace(os.sep,"/"),"bytes":path.stat().st_size,"sha256":sha256(path)}

def run_specs(specs,phase,root,env):
    results=[]; failures=[]
    for spec in specs:
        argv=spec.get("argv")
        if not isinstance(argv,list) or not argv:
            raise SystemExit(f"{phase}Commands[].argv must be non-empty list")
        cwd=(root/spec.get("cwd",".")).resolve()
        r=run_argv([str(x) for x in argv],cwd,env)
        r["id"]=spec.get("id")
        r["phase"]=phase
        results.append(r)
        if r["returnCode"]!=0: failures.append(r["id"] or f"{phase}:unnamed")
    return results,failures

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--repo-root",default=".")
    ap.add_argument("--config",default="cep-writer/CAPSULE_VISUAL_BOOTSTRAP.json")
    ap.add_argument("--output",default=".capsule-visual-bootstrap")
    ns=ap.parse_args()

    root=pathlib.Path(ns.repo_root).resolve()
    out=(root/ns.output).resolve()
    if out.exists(): shutil.rmtree(out)
    out.mkdir(parents=True,exist_ok=True)

    initial_tracked=tracked_changes(root)
    if initial_tracked:
        raise SystemExit("visual bootstrap requires clean tracked source at start: "+", ".join(initial_tracked))

    config_path=(root/ns.config).resolve()
    head=git_output(root,"rev-parse","HEAD").strip()
    tree=git_output(root,"rev-parse","HEAD^{tree}").strip()

    if not config_path.exists():
        manifest={
          "schemaVersion":2,
          "classification":"VISUAL_BOOTSTRAP_NOT_CONFIGURED__WRITER_MAY_CAPTURE_LOCALLY",
          "enabled":False,"sourceCommit":head,"sourceTree":tree,
          "setupCommands":[],"captureCommands":[],"baselineFiles":[],"receiptFiles":[],
          "comparisonPlan":[],"trackedSourceGuard":"PASS",
          "generatedAtUtc":datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        (out/"VISUAL_BOOTSTRAP_MANIFEST.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
        print(json.dumps({"verdict":"NOT_CONFIGURED","head":head,"trackedSourceGuard":"PASS"}))
        return

    cfg=json.loads(config_path.read_text(encoding="utf-8"))
    enabled=bool(cfg.get("enabled",True))
    expected_parent=cfg.get("expectedProductParentCommit")
    if expected_parent:
        subprocess.run(["git","cat-file","-e",expected_parent+"^{commit}"],cwd=root,check=True)
        anc=subprocess.run(["git","merge-base","--is-ancestor",expected_parent,head],cwd=root)
        if anc.returncode != 0:
            raise SystemExit(f"visual bootstrap expected Product parent {expected_parent} is not an ancestor of transport HEAD {head}")
    if cfg.get("expectedSourceCommit"):
        raise SystemExit("legacy expectedSourceCommit is self-referential; use expectedProductParentCommit")
    shutil.copy2(config_path,out/"VISUAL_BOOTSTRAP_CONFIG.json")

    if not enabled:
        manifest={
          "schemaVersion":2,
          "classification":"VISUAL_BOOTSTRAP_DISABLED_BY_CONTROLLER_BINDING",
          "enabled":False,"sourceCommit":head,"sourceTree":tree,
          "setupCommands":[],"captureCommands":[],"baselineFiles":[],"receiptFiles":[],
          "comparisonPlan":cfg.get("comparisonPlan",[]),"trackedSourceGuard":"PASS",
          "generatedAtUtc":datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        (out/"VISUAL_BOOTSTRAP_MANIFEST.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
        print(json.dumps({"verdict":"DISABLED","head":head,"trackedSourceGuard":"PASS"}))
        return

    env=os.environ.copy()
    env.update({str(k):str(v) for k,v in cfg.get("environment",{}).items()})

    setup_results,setup_failures=run_specs(cfg.get("setupCommands",[]),"setup",root,env)
    capture_results,capture_failures=run_specs(cfg.get("captureCommands",[]),"capture",root,env)

    after_commands=tracked_changes(root)
    if after_commands:
        raise SystemExit("visual bootstrap harness mutated tracked source: "+", ".join(after_commands))

    baseline_dir=out/"baseline-current"
    receipt_dir=out/"raw-receipts"
    baseline=copy_matches(root,cfg.get("baselineGlobs",[]),baseline_dir)
    receipts=copy_matches(root,cfg.get("receiptGlobs",[]),receipt_dir)

    after_copy=tracked_changes(root)
    if after_copy:
        raise SystemExit("visual bootstrap packaging mutated tracked source: "+", ".join(after_copy))

    failures=setup_failures+capture_failures
    required=bool(cfg.get("required",False))
    fallback=bool(cfg.get("allowWriterLocalRecapture",True))
    min_shots=int(cfg.get("minimumScreenshotCount",0))
    enough=len(baseline)>=min_shots

    if required and (failures or not enough) and not fallback:
        raise SystemExit(f"required visual bootstrap failed commands={failures} screenshots={len(baseline)} min={min_shots}")

    status="READY"
    if failures or not enough:
        status="PARTIAL__LOCAL_RECAPTURE_ALLOWED" if fallback else "FAILED"

    manifest={
      "schemaVersion":2,
      "classification":"CONTROLLER_PREPARED_VISUAL_BOOTSTRAP__BOOTSTRAP_ONLY__NOT_FINAL_ACCEPTANCE_EVIDENCE",
      "enabled":True,
      "required":required,
      "allowWriterLocalRecapture":fallback,
      "status":status,
      "sourceCommit":head,
      "sourceTree":tree,
      "viewports":cfg.get("viewports",[]),
      "states":cfg.get("states",[]),
      "setupCommands":setup_results,
      "captureCommands":capture_results,
      "baselineFiles":[file_meta(out,p) for p in baseline],
      "receiptFiles":[file_meta(out,p) for p in receipts],
      "referenceBindings":cfg.get("referenceBindings",[]),
      "comparisonPlan":cfg.get("comparisonPlan",[]),
      "minimumScreenshotCount":min_shots,
      "trackedSourceGuard":"PASS",
      "trackedSourceChanges":[],
      "generatedAtUtc":datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    (out/"VISUAL_BOOTSTRAP_MANIFEST.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"verdict":status,"screenshots":len(baseline),"receipts":len(receipts),"failedCommands":failures,"trackedSourceGuard":"PASS"}))

if __name__=="__main__":
    main()
