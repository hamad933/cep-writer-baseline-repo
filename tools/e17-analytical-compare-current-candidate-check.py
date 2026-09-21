#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,subprocess,sys
ROOT=Path(__file__).resolve().parents[1]; ASSURANCE=ROOT/'assurance'
historical_receipt=ASSURANCE/'BROWSER_CONFORMANCE_RECEIPT.json'
historical_manifest=ASSURANCE/'SCREENSHOT_MANIFEST.json'
current_receipt=ASSURANCE/'E17_ANALYTICAL_COMPARE_BROWSER'/'LEGACY_CURRENT_CORRECTED_CANDIDATE_RECEIPT.json'
current_manifest=ASSURANCE/'E17_ANALYTICAL_COMPARE_BROWSER'/'LEGACY_CURRENT_CORRECTED_CANDIDATE_SCREENSHOT_MANIFEST.json'
out=ASSURANCE/'E17_ANALYTICAL_COMPARE_CURRENT_CANDIDATE_REGRESSION.json'
def sha_bytes(data): return hashlib.sha256(data).hexdigest()
original_receipt=historical_receipt.read_bytes(); original_manifest=historical_manifest.read_bytes()
current=json.loads(current_receipt.read_text()); expected_source=current['sourceCanonicalTreeSha256']; expected_files=current['canonicalSourceFileCount']
contract_stdout=''; npm_stdout=''; contract_rc=npm_rc=99
try:
    historical_receipt.write_bytes(current_receipt.read_bytes())
    historical_manifest.write_bytes(current_manifest.read_bytes())
    contract=subprocess.run(['node','tools/check-contracts.mjs'],cwd=ROOT,text=True,capture_output=True,timeout=90)
    contract_rc=contract.returncode; contract_stdout=contract.stdout; contract_stderr=contract.stderr
    npm=subprocess.run(['npm','run','check'],cwd=ROOT,text=True,capture_output=True,timeout=120)
    npm_rc=npm.returncode; npm_stdout=npm.stdout; npm_stderr=npm.stderr
finally:
    historical_receipt.write_bytes(original_receipt)
    historical_manifest.write_bytes(original_manifest)
restored=(historical_receipt.read_bytes()==original_receipt and historical_manifest.read_bytes()==original_manifest)
try: contracts=json.loads(contract_stdout)
except Exception: contracts={}
report={
 'schemaVersion':1,'kind':'E17_ANALYTICAL_COMPARE_CURRENT_CANDIDATE_REGRESSION','status':'PASS' if contract_rc==0 and npm_rc==0 and restored else 'FAIL',
 'candidateOnly':True,'controllerAccepted':False,'canonicalSourceSha256':expected_source,'canonicalSourceFiles':expected_files,
 'temporaryLineageProjection':{'reason':'Historical E17 browser receipt remains immutable; exact-current Candidate receipt is projected only during regression execution.','historicalReceiptSha256Before':sha_bytes(original_receipt),'historicalManifestSha256Before':sha_bytes(original_manifest),'restoredByteExact':restored},
 'contracts':{'returnCode':contract_rc,'pass':contracts.get('pass'),'fail':contracts.get('fail'),'stdoutTail':contract_stdout[-3500:],'stderrTail':contract_stderr[-1500:] if 'contract_stderr' in locals() else ''},
 'npmCheck':{'returnCode':npm_rc,'stdoutTail':npm_stdout[-3500:],'stderrTail':npm_stderr[-1500:] if 'npm_stderr' in locals() else ''},
 'currentBrowserReceipt':{'executionStatus':current.get('executionStatus'),'summary':current.get('summary'),'sourceCanonicalTreeSha256':current.get('sourceCanonicalTreeSha256'),'canonicalSourceFileCount':current.get('canonicalSourceFileCount')}
}
out.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'status':report['status'],'contracts':{'returnCode':contract_rc,'pass':contracts.get('pass'),'fail':contracts.get('fail')},'npmCheckReturnCode':npm_rc,'historicalRestoredByteExact':restored,'source':expected_source},indent=2))
raise SystemExit(0 if report['status']=='PASS' else 1)
