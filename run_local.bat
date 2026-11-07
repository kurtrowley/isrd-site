@echo off
REM Launch ISRD.com locally and open it in your default browser.
cd /d "%~dp0"

REM Free port 5173 if something is already listening there — e.g. a stale
REM dev server left running from another checkout of this project. Without
REM this, Vite would silently fall back to a different port while this
REM script still opens the browser to 5173, landing you on the wrong site.
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%p >nul 2>&1
)

REM --strictPort makes Vite fail loudly instead of silently picking a
REM different port if 5173 is somehow still unavailable.
start "ISRD dev server" cmd /c "npm run dev -- --port 5173 --strictPort"

REM Give the dev server a moment to boot before opening the browser.
timeout /t 5 /nobreak >nul

start "" "http://localhost:5173"
