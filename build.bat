@echo off
call npm install
call node_modules\.bin\tsc
call echo "Done!"
IF /I NOT "%1" == "/nopause" pause
