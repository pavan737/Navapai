@echo off
title Navapai Full-Stack Launcher
echo ======================================================
echo           NAVAPAI CLOUD PLATFORM LAUNCHER
echo ======================================================
echo.

cd /d "%~dp0"

echo [1/3] Freeing Port 8000 from conflicting background processes...
powershell -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo [2/3] Starting Django Backend in a new window...
start "Navapai Backend" cmd /k "run_backend.bat"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Vite Frontend in a new window...
start "Navapai Frontend" cmd /k "run_frontend.bat"

echo.
echo ======================================================
echo   Navapai is running!
echo   Frontend App:   http://127.0.0.1:5173/
echo   Backend API:    http://127.0.0.1:8000/api/
echo   Django Admin:   http://127.0.0.1:8000/admin/
echo ======================================================
echo.
pause
