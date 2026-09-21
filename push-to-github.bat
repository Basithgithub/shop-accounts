@echo off
title Push KV Dryfish Accounts to GitHub
echo ===================================================
echo   Pushing KV Dryfish Accounts to GitHub (Basithgithub)
echo ===================================================
echo.
cd /d "%~dp0"
git push -u origin main
echo.
echo ===================================================
echo Done! You can now import on Vercel.
echo ===================================================
pause
