@echo off
setlocal
cd /d "%~dp0"

if exist "release\ArsonistTimerDesktop\ArsonistTimer.exe" (
  start "" "%~dp0release\ArsonistTimerDesktop\ArsonistTimer.exe"
  exit /b 0
)

if not exist "dist\index.html" (
  call npm run build
  if errorlevel 1 (
    echo.
    echo Arsonist build failed.
    pause
    exit /b 1
  )
)

call npm run app:open
