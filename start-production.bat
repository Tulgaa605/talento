@echo off
echo Starting Next.js application in PRODUCTION mode...
cd /d %~dp0
pm2 start ecosystem.config.js --env production
pm2 save
echo.
echo Application started successfully!
echo Access at: http://192.168.0.117
echo.
echo To view logs: pm2 logs nextapp
echo To stop: pm2 stop nextapp
echo To restart: pm2 restart nextapp
pause

