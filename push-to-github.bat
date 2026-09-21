@echo off
title Push KV Dryfish Accounts to GitHub
echo ===================================================
echo   Pushing KV Dryfish Accounts to GitHub (Basithgithub)
echo ===================================================
echo.
cd /d "%~dp0"
git remote set-url origin https://Basithgithub@github.com/Basithgithub/shop-accounts.git
git config credential.https://github.com.username Basithgithub
git -c credential.username=Basithgithub push -u origin main
echo.
echo ===================================================
echo Done! You can now import on Vercel.
echo ===================================================
pause
