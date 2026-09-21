$ErrorActionPreference = 'Stop'
$ProofDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Resolve-Path (Join-Path $ProofDir '..\..\..')
$Sidecar = Join-Path $Root 'stack\windows-platform\bin\cep-win-sidecar.exe'
$Stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')
$Out = Join-Path $ProofDir "OWNER_WINDOWS_E2E_$Stamp"
New-Item -ItemType Directory -Force $Out, (Join-Path $Out 'screenshots') | Out-Null
$results = New-Object 'System.Collections.Generic.List[object]'

function Add-Case([string]$id,[string]$status,[string]$reason,[hashtable]$evidence=@{}) {
  $row=[ordered]@{testId=$id;status=$status;reason=$reason;timestamp=(Get-Date).ToUniversalTime().ToString('o')}
  foreach($k in $evidence.Keys){$row[$k]=$evidence[$k]}
  $results.Add([pscustomobject]$row)
}

function Record-InteractiveCase([string]$id) {
  Write-Host ''
  Write-Host "Record $id: PASS / FAIL / NOT_RUN" -ForegroundColor Cyan
  $status=(Read-Host 'Status [P/F/N]').Trim().ToUpperInvariant()
  $mapped = if($status -eq 'P'){'PASS'} elseif($status -eq 'F'){'FAIL'} else {'NOT_RUN'}
  $reason=(Read-Host 'Observed result / reason').Trim()
  $refs=(Read-Host 'Evidence paths relative to proof folder, comma-separated (required for PASS)').Trim()
  $files=@(); if($refs){$files=@($refs -split ',' | ForEach-Object {$_.Trim()} | Where-Object {$_})}
  $missing=@($files | Where-Object {-not (Test-Path (Join-Path $Out $_))})
  if($mapped -eq 'PASS' -and ($files.Count -eq 0 -or $missing.Count -gt 0)){
    $mapped='FAIL'; $reason="EVIDENCE_REQUIRED_OR_MISSING: $($missing -join ',') :: $reason"
  }
  Add-Case $id $mapped $reason @{evidence=$files}
  ([ordered]@{timestamp=(Get-Date).ToUniversalTime().ToString('o');testId=$id;status=$mapped;reason=$reason;evidence=$files} | ConvertTo-Json -Compress) |
    Add-Content -Encoding utf8 (Join-Path $Out 'events.jsonl')
}
function Snapshot-WindowVerifier([string]$phase) {
  Get-Process msedge -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowHandle -ne 0} | ForEach-Object {
    ([ordered]@{timestamp=(Get-Date).ToUniversalTime().ToString('o');phase=$phase;pid=$_.Id;hwnd=[string]$_.MainWindowHandle;title=$_.MainWindowTitle} | ConvertTo-Json -Compress) |
      Add-Content -Encoding utf8 (Join-Path $Out 'independent-window-verifier.jsonl')
  }
}
function Finalize-Evidence {
  $required=@('WIN-01','WIN-02','WIN-03','WIN-04','WIN-05','WIN-06','WIN-07','WIN-08','WIN-09','WIN-10','WIN-11','WIN-12','WIN-13','INP-01','INP-02','INP-03','INP-04','INP-05','INP-06','INP-07','INP-08','INP-09','TERM-OWNER-XTERM-CONPTY','TERM-OWNER-RAW-IO','TERM-OWNER-INPUT-AFTER-RESIZE','TERM-OWNER-RESTART-STABLE-ID','TERM-OWNER-DETACH-RETAINS-RUNTIME')
  $byId=@{}; foreach($row in $results){$byId[$row.testId]=$row}
  $missing=@($required | Where-Object {-not $byId.ContainsKey($_)})
  $notRun=@($required | Where-Object {$byId.ContainsKey($_) -and $byId[$_].status -eq 'NOT_RUN'})
  $failed=@($required | Where-Object {$byId.ContainsKey($_) -and $byId[$_].status -eq 'FAIL'})
  $final=[ordered]@{complete=($missing.Count -eq 0 -and $notRun.Count -eq 0 -and $failed.Count -eq 0);acceptanceClaim='NONE';missing=$missing;notRun=$notRun;failed=$failed;truth='INTERACTIVE_EVIDENCE_ONLY__CONTROLLER_ACCEPTANCE_REQUIRED'}
  $final|ConvertTo-Json -Depth 6|Set-Content -Encoding utf8 (Join-Path $Out 'finalization.json')
}

function Write-Results {
  $results | ConvertTo-Json -Depth 10 | Set-Content -Encoding utf8 (Join-Path $Out 'test-results.json')
}
function Write-Hashes {
  $hashFile = Join-Path $Out 'sha256.txt'
  if (Test-Path $hashFile) { Remove-Item $hashFile -Force }
  Get-ChildItem -File -Recurse $Out | Where-Object { $_.FullName -ne $hashFile } | ForEach-Object {
    "$((Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant())  $($_.FullName.Substring($Out.Length+1))"
  } | Set-Content -Encoding ascii $hashFile
}

if (-not (Test-Path $Sidecar)) { throw "Missing prebuilt sidecar: $Sidecar" }
$binaryHash=(Get-FileHash $Sidecar -Algorithm SHA256).Hash.ToLowerInvariant()
$expectedFile=Join-Path $ProofDir 'EXPECTED_BINARY_SHA256.txt'
$expected=''
if (Test-Path $expectedFile) { $expected=((Get-Content $expectedFile -Raw).Trim().ToLowerInvariant()) }
if($expected -and $binaryHash -ne $expected){throw "Sidecar hash mismatch: $binaryHash != $expected"}

$nodeVersion='UNAVAILABLE'
try { $nodeVersion = (& node --version) } catch {}
$envInfo=[ordered]@{
  utc=(Get-Date).ToUniversalTime().ToString('o')
  computer=$env:COMPUTERNAME
  os=[Environment]::OSVersion.VersionString
  ps=$PSVersionTable.PSVersion.ToString()
  node=$nodeVersion
  sidecarSha256=$binaryHash
  interactive=[Environment]::UserInteractive
}
$envInfo|ConvertTo-Json -Depth 6|Set-Content -Encoding utf8 (Join-Path $Out 'environment.json')

$runtime=$null
$web=$null
try {
  $runtime=Start-Process -FilePath 'node.exe' -ArgumentList @('stack/local-runtime/server.mjs') -WorkingDirectory $Root -WindowStyle Hidden -PassThru
  $web=Start-Process -FilePath 'node.exe' -ArgumentList @('tools/serve.mjs') -WorkingDirectory $Root -WindowStyle Hidden -PassThru
  Start-Sleep -Seconds 2

  try {
    $desc=Invoke-RestMethod -Uri 'http://127.0.0.1:4174/v1/platform/describe' -Method Get -TimeoutSec 5
    $desc|ConvertTo-Json -Depth 8|Set-Content -Encoding utf8 (Join-Path $Out 'provider-descriptor.json')
    Add-Case 'WIN-01' 'PASS' 'Provider descriptor returned capability-specific identity/epoch.' @{providerId=$desc.providerId;providerEpoch=$desc.providerEpoch}
  } catch { Add-Case 'WIN-01' 'FAIL' $_.Exception.Message }

  try {
    $hint=Invoke-RestMethod -Uri 'http://127.0.0.1:4174/v1/platform/input-direction' -Method Get -TimeoutSec 5
    @([ordered]@{timestamp=(Get-Date).ToUniversalTime().ToString('o');hint=$hint.hint;recognized=$hint.recognized;semanticInference=$hint.semanticInference;contentInspectedForLanguage=$hint.contentInspectedForLanguage}) |
      ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 (Join-Path $Out 'input-layout-verifier.jsonl')
  } catch {
    ([ordered]@{timestamp=(Get-Date).ToUniversalTime().ToString('o');error=$_.Exception.Message} | ConvertTo-Json -Compress) |
      Set-Content -Encoding utf8 (Join-Path $Out 'input-layout-verifier.jsonl')
  }

  Write-Results
  New-Item -ItemType File -Force (Join-Path $Out 'events.jsonl'),(Join-Path $Out 'independent-window-verifier.jsonl') | Out-Null
  Snapshot-WindowVerifier 'before-interaction'

  $runs='http://127.0.0.1:4173/?surface=runs&terminal=conpty&terminalExe=C%3A%5CWindows%5CSystem32%5CWindowsPowerShell%5Cv1.0%5Cpowershell.exe&terminalLabel=PowerShell'
  $library='http://127.0.0.1:4173/?surface=library'
  Start-Process $runs
  Start-Sleep -Milliseconds 500
  Start-Process $library

  @"
CEP OWNER INTERACTIVE CHECKPOINTS — FAST PATH
=============================================
KEEP THIS POWERSHELL WINDOW OPEN. CEP web + local runtime stay alive until you press ENTER here.

1. Runs: xterm visible -> type a real command -> resize -> type again -> restart -> Pin -> Separate/Detached.
2. Library: open one real Sticky Note -> Pin -> Separate/Detached; note identity/content must survive.
3. Windows: verify topmost on/off and switch EN/AR keyboard layout on real Structured/Note inputs.
4. Save required screenshots/evidence under: $Out\screenshots\
5. Do not mark PASS without observed evidence. NOT_RUN is intentional until observed.

When finished, return here and press ENTER. Only then will temporary servers stop and hashes finalize.
"@ | Set-Content -Encoding utf8 (Join-Path $Out 'OWNER_CHECKPOINTS.txt')

  Write-Host ''
  Write-Host 'CEP proof runtime is ACTIVE.' -ForegroundColor Green
  Write-Host "Evidence folder: $Out"
  [void](Read-Host 'Press ENTER only AFTER the interactive checks are complete')
  Snapshot-WindowVerifier 'after-interaction'
  foreach($id in @('WIN-02','WIN-03','WIN-04','WIN-05','WIN-06','WIN-07','WIN-08','WIN-09','WIN-10','WIN-11','WIN-12','WIN-13','INP-01','INP-02','INP-03','INP-04','INP-05','INP-06','INP-07','INP-08','INP-09','TERM-OWNER-XTERM-CONPTY','TERM-OWNER-RAW-IO','TERM-OWNER-INPUT-AFTER-RESIZE','TERM-OWNER-RESTART-STABLE-ID','TERM-OWNER-DETACH-RETAINS-RUNTIME')) { Record-InteractiveCase $id }

  try {
    $descEnd=Invoke-RestMethod -Uri 'http://127.0.0.1:4174/v1/platform/describe' -Method Get -TimeoutSec 5
    $descEnd|ConvertTo-Json -Depth 8|Set-Content -Encoding utf8 (Join-Path $Out 'provider-descriptor-final.json')
  } catch {
    ([ordered]@{timestamp=(Get-Date).ToUniversalTime().ToString('o');error=$_.Exception.Message} | ConvertTo-Json -Compress) |
      Set-Content -Encoding utf8 (Join-Path $Out 'provider-descriptor-final.json')
  }
  Write-Results
  Finalize-Evidence
  Write-Hashes
  Write-Host "Proof directory finalized: $Out" -ForegroundColor Green
} finally {
  if($web -and -not $web.HasExited){Stop-Process -Id $web.Id -Force -ErrorAction SilentlyContinue}
  if($runtime -and -not $runtime.HasExited){Stop-Process -Id $runtime.Id -Force -ErrorAction SilentlyContinue}
}
