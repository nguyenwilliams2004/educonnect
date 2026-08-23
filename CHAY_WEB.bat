@echo off
title HanTutor Local Server
echo ========================================================
echo   DANG KHOI DONG SERVER HANTUTOR TREN MAY CUA BAN...
echo ========================================================
echo.
cd /d "%~dp0"
start http://localhost:5173
npm run dev
pause
