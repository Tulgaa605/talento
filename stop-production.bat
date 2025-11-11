@echo off
echo Stopping Next.js application...
pm2 stop nextapp
pm2 save
echo.
echo Application stopped successfully!
pause

