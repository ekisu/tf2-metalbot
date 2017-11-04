@echo off
IF NOT EXIST src\main.js call build.bat /nopause
call node src\main.js
pause
