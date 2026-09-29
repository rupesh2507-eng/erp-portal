@echo off
echo Updating ERP Portal...
echo.

git add .
git commit -m "Updated website"
git push

echo.
echo ============================
echo Website updated successfully!
echo ============================
pause