@echo off
title Navapai Backend Server
cd /d "%~dp0backend"
echo [Navapai] Activating Python Virtual Environment...
call venv\Scripts\activate.bat
echo [Navapai] Applying Database Migrations...
python manage.py migrate
echo [Navapai] Starting Django Server at http://127.0.0.1:8000/ ...
python manage.py runserver 127.0.0.1:8000
pause
