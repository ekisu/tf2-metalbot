@echo off
npm install
node_modules\.bin\tsc
echo "Done!"
IF /I NOT "%1" == "/nopause" pause
