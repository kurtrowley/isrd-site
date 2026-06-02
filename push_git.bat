@echo off
echo === ISRD.com Git Push ===
cd /d "%~dp0"

git add -A
git status

echo.
set /p MSG="Commit message (or press Enter for 'update'): "
if "%MSG%"=="" set MSG=update

git commit -m "%MSG%"
git push origin main

echo.
echo Done.
pause
