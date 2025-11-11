@echo off
echo Restarting Next.js application in PRODUCTION mode...
pm2 restart nextapp --update-env
echo.
echo Application restarted successfully!
echo Access at: http://192.168.0.117
pause

