#!/usr/bin/env python3
import argparse, datetime, glob, hashlib, json, os, pathlib, shutil, subprocess, sys

def sha256(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""): h.update(chunk)
    return h.hexdigest()

def run_argv(argv,cwd,env):
    p=subprocess.run(argv,cwd=cwd,env=env,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    return {"argv":argv,"cwd":str(cwd),"returnCode":p.returncode,"output":p.stdout[-12000:]}

def copy_matches(root, patterns, dest):
    copied=[]
    seen=set()
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
    config_path=(root/ns.config).resolve()
    head=subprocess.check_output(["git","rev-parse","HEAD"],cwd=root,text=True).strip()
    tree=subprocess.check_output(["git","rev-parse","HEAD^{tree}"],cwd=root,text=True).strip()

    if not config_path.exists():
        manifest={
          "schemaVersion":1,
          "classification":"VISUAL_BOOTSTRAP_NOT_CONFIGURED__WRITER_MAY_CAPTURE_LOCALLY",
          "enabled":False,"sourceCommit":head,"sourceTree":tree,
          "commands":[],"baselineFiles":[],"receiptFiles":[],"comparisonPlan":[],
          "generatedAtUtc":datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        (out/"VISUAL_BOOTSTRAP_MANIFEST.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
        print(json.dumps({"verdict":"NOT_CONFIGURED","head":head}))
        return

    cfg=json.loads(config_path.read_text(encoding="utf-8"))
    enabled=bool(cfg.get("enabled",True))
    expected=cfg.get("expectedSourceCommit")
    if expected and expected != head:
        raise SystemExit(f"visual bootstrap expectedSourceCommit {expected} != HEAD {head}")
    shutil.copy2(config_path,out/"VISUAL_BOOTSTRAP_CONFIG.json")
    if not enabled:
        manifest={
          "schemaVersion":1,
          "classification":"VISUAL_BOOTSTRAP_DISABLED_BY_CONTROLLER_BINDING",
          "enabled":False,"sourceCommit":head,"sourceTree":tree,
          "commands":[],"baselineFiles":[],"receiptFiles":[],
          "comparisonPlan":cfg.get("comparisonPlan",[]),
          "generatedAtUtc":datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        (out/"VISUAL_BOOTSTRAP_MANIFEST.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
        print(json.dumps({"verdict":"DISABLED","head":head}))
        return

    env=os.environ.copy()
    env.update({str(k):str(v) for k,v in cfg.get("environment",{}).items()})
    commands=[]
    failures=[]
    for spec in cfg.get("captureCommands",[]):
        argv=spec.get("argv")
        if not isinstance(argv,list) or not argv: raise SystemExit("captureCommands[].argv must be non-empty list")
        cwd=(root/spec.get("cwd",".")).resolve()
        r=run_argv([str(x) for x in argv],cwd,env)
        r["id"]=spec.get("id")
        commands.append(r)
        if r["returnCode"]!=0: failures.append(r["id"] or "unnamed")

    baseline_dir=out/"baseline-current"
    receipt_dir=out/"raw-receipts"
    baseline=copy_matches(root,cfg.get("baselineGlobs",[]),baseline_dir)
    receipts=copy_matches(root,cfg.get("receiptGlobs",[]),receipt_dir)

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
      "schemaVersion":1,
      "classification":"CONTROLLER_PREPARED_VISUAL_BOOTSTRAP__BOOTSTRAP_ONLY__NOT_FINAL_ACCEPTANCE_EVIDENCE",
      "enabled":True,
      "required":required,
      "allowWriterLocalRecapture":fallback,
      "status":status,
      "sourceCommit":head,
      "sourceTree":tree,
      "viewports":cfg.get("viewports",[]),
      "states":cfg.get("states",[]),
      "commands":commands,
      "baselineFiles":[file_meta(out,p) for p in baseline],
      "receiptFiles":[file_meta(out,p) for p in receipts],
      "referenceBindings":cfg.get("referenceBindings",[]),
      "comparisonPlan":cfg.get("comparisonPlan",[]),
      "minimumScreenshotCount":min_shots,
      "generatedAtUtc":datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    (out/"VISUAL_BOOTSTRAP_MANIFEST.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"verdict":status,"screenshots":len(baseline),"receipts":len(receipts),"failedCommands":failures}))

if __name__=="__main__":
    main()
