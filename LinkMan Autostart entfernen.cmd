@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0LinkMan Autostart entfernen.ps1"
echo.
pause

