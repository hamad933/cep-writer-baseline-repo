@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Run-OwnerWindowsProof.ps1"
set "RC=%ERRORLEVEL%"
echo.
echo CEP Windows proof harness finished with exit code %RC%.
pause
exit /b %RC%
