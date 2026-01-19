#!/bin/bash

echo "========================================"
echo "Deploying Next.js application to PRODUCTION"
echo "========================================"
echo ""

cd "$(dirname "$0")"

echo "[1/6] Stopping application..."
pm2 stop nextapp
echo ""

echo "[2/6] Pulling latest code..."
git pull origin main
if [ $? -ne 0 ]; then
    echo "WARNING: Git pull failed. Continuing with existing code..."
fi
echo ""

echo "[3/6] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: npm install failed!"
    exit 1
fi
echo ""

echo "[4/6] Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "ERROR: Prisma generate failed!"
    exit 1
fi
echo ""

echo "[5/6] Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed!"
    exit 1
fi
echo ""

echo "[6/6] Starting application..."
pm2 restart nextapp --update-env
pm2 save
echo ""

echo "========================================"
echo "Deployment completed successfully!"
echo "========================================"
echo ""
echo "Application is running at: http://192.168.0.117"
echo ""
echo "To view logs: pm2 logs nextapp"
echo "To check status: pm2 status"
echo ""

