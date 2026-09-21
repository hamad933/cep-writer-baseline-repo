$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$out = Join-Path $root 'bin'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$src = Join-Path $root 'src\main.cpp'
$exe = Join-Path $out 'cep-win-sidecar.exe'
& cl.exe /nologo /std:c++17 /O2 /EHsc /MT /DUNICODE /D_UNICODE /DNOMINMAX $src /Fe:$exe /link user32.lib shell32.lib advapi32.lib ws2_32.lib
if ($LASTEXITCODE -ne 0) { throw "C++ build failed: $LASTEXITCODE" }
$hash = (Get-FileHash $exe -Algorithm SHA256).Hash.ToLowerInvariant()
@{ok=$true; binary=$exe; sha256=$hash; compiler='MSVC'; target='windows-x64'} | ConvertTo-Json -Depth 4
