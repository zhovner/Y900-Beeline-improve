@echo off
echo -----------------------------
echo Acatel Y900NB Beeline Patcher
echo -----------------------------
echo Press ENTER to start patching...
pause >nul

adb push Y900_Beeline_improve.tgz /
adb shell cd /; tar xvzpf Y900_Beeline_improve.tgz; rm Y900_Beeline_improve.tgz

pause 