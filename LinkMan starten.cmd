@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -WindowStyle Hidden -Command "if (-not (Test-NetConnection 127.0.0.1 -Port 8765 -InformationLevel Quiet -WarningAction SilentlyContinue)) { Start-Process -FilePath 'node.exe' -ArgumentList 'server.js' -WorkingDirectory '%~dp0' -WindowStyle Hidden }"
timeout /t 1 /nobreak >nul
start "" http://127.0.0.1:8765
