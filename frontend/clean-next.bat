@echo off
echo Stopping Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo Cleaning .next folder...
if exist .next (
    rmdir /s /q .next
    echo .next folder deleted successfully!
) else (
    echo .next folder not found.
)
echo Done!
pause








