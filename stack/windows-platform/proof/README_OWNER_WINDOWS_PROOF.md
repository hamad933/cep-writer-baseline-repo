# CEP Owner Windows Proof — Fast Path

1. Double-click `START_PLATFORM_PROOF.cmd`.
2. Keep the PowerShell window open; Runs + Library open automatically and the runtime stays alive.
3. Perform the short checkpoints printed in PowerShell.
4. Press Enter only after finishing; then hashes are finalized and temporary servers stop.

`NOT_RUN` remains truthful until observed. The kit does not self-promote or close OE-001/OE-004 by itself.

## Detailed reference

# CEP Lane 1 — Owner Windows Interactive Proof Kit

This kit is the final **interactive evidence step**, not a compiler/install kit. It intentionally requires no Visual Studio, C++ SDK, Python, Rust/Tauri, Electron, Docker, WSL, or browser download. It uses the prebuilt `cep-win-sidecar.exe`, the CEP Node local runtime, and the installed Windows browser/Edge runtime.

Run `START_PLATFORM_PROOF.cmd`. The harness creates a fresh `OWNER_WINDOWS_E2E_<UTC>` directory using the L08 evidence filenames and opens the real `Runs` and `Library` consumers. It automatically records the provider descriptor and environment, but it leaves desktop/session-sensitive `WIN-*` and `INP-*` cases as `NOT_RUN` until observed interactively. Never relabel them `PASS` without the corresponding screenshots/verifier evidence.

Required terminal runtime evidence is separately produced on the managed Windows carrier and shipped with the candidate. This Owner kit focuses on the capabilities that genuinely need an interactive Windows desktop: native HWND lifecycle/topmost/focus, detached real consumers, active keyboard-layout switching, and provider-loss/recovery presentation truth.


## Managed Windows carrier boundary

The managed Windows Server 2025 carrier produced real provider evidence for: C++17 x64 build, PowerShell profile with args/cwd/env and exit truth, `cmd.exe` profile, `ResizePseudoConsole`, arbitrary executable launch, truthful missing-executable failure, and the no-allowlist descriptor. The exact latest carrier evidence is under `assurance/lane1-windows-native-terminal/managed-windows-run37/`.

The hosted carrier repeatedly accepted every raw-input byte at the sidecar (`WriteFile` byte-for-byte) but did not consume that input in the interactive child. A separate minimal Microsoft-style ConPTY probe reproduced the same hosted-runner behavior outside CEP. Therefore **interactive raw typing is not marked PASS**. The Owner Windows run is the authoritative next proof for terminal typing through xterm, typing after resize, restart continuity, detach/hide lifecycle truth, and the native HWND/input-direction cases. This is a candidate handoff, not Controller acceptance and not closure of OE-001/OE-004.
