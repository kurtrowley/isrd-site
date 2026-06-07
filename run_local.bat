@echo off
REM Launch ISRD.com locally and open it in your default browser.
cd /d "%~dp0"

start "" cmd /c "npm run dev"

REM Give the dev server a moment to boot before opening the browser.
timeout /t 5 /nobreak >nul

start "" "http://localhost:5173"
