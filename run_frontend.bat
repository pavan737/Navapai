@echo off
title Navapai Frontend Server
cd /d "%~dp0frontend"
echo [Navapai] Starting React Vite Frontend at http://127.0.0.1:5173/ ...
npm run dev
pause
