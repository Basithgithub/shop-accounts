@echo off
title KV Dryfish Kulumani - Cash Flow & Profit Ledger
echo ===================================================================
echo     KV DRYFISH KULUMANI, TRICHY - CASH FLOW & PROFIT LEDGER
echo            Protected by AES-256-GCM Local Encryption
echo ===================================================================
echo.
echo [1/3] Preparing environment and checking ports...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1

echo [2/3] Starting your local accounts server...
start /b "" cmd /c "npm.cmd run start"

echo [3/3] Waiting for server to initialize...
timeout /t 3 /nobreak >nul

echo Opening http://localhost:3000 in your browser...
start http://localhost:3000

echo.
echo ===================================================================
echo  Accounts system is ACTIVE at http://localhost:3000
echo  Administrator: Basith ^| PIN: 9090
echo  Keep this terminal window open while using the application.
echo ===================================================================
echo.
pause
