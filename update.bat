@echo off
title ERP Portal Update
cd /d "%~dp0"

echo.
echo ================================
echo       ERP PORTAL UPDATE
echo ================================
echo.

echo Adding files...
git add .

echo.
echo Committing changes...
git commit -m "Updated website"

echo.
echo Pushing to GitHub...
git push

echo.
echo ================================
echo       UPDATE FINISHED
echo ================================
echo.
pause