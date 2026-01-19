@echo off
echo ========================================
echo Deploying Next.js application to PRODUCTION
echo ========================================
echo.

cd /d %~dp0

echo [1/5] Stopping application...
pm2 stop nextapp
echo.

echo [2/5] Pulling latest code...
git pull origin main
if errorlevel 1 (
    echo WARNING: Git pull failed. Continuing with existing code...
)
echo.

echo [3/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo.

echo [4/5] Generating Prisma client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Prisma generate failed!
    pause
    exit /b 1
)
echo.

echo [5/5] Building application...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

echo [6/6] Starting application...
pm2 restart nextapp --update-env
pm2 save
echo.

echo ========================================
echo Deployment completed successfully!
echo ========================================
echo.
echo Application is running at: http://192.168.0.117
echo.
echo To view logs: pm2 logs nextapp
echo To check status: pm2 status
echo.
pause

