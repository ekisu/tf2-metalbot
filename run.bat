@echo off
IF NOT EXIST src\main.js build.bat /nopause
node src\main.js
pause
