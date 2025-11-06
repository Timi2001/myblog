@echo off
REM Production Build Script for Personal Blog (Windows)
REM This script prepares and builds the application for production deployment

setlocal enabledelayedexpansion

echo 🚀 Starting production build process...

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    exit /b 1
)

REM Check if .env.production.local exists
if not exist ".env.production.local" (
    echo [WARNING] .env.production.local not found. Make sure to configure production environment variables.
    if exist ".env.production.example" (
        echo [INFO] You can copy .env.production.example to .env.production.local and update the values.
    )
)

REM Clean previous builds
echo [INFO] Cleaning previous builds...
if exist ".next" rmdir /s /q ".next"
if exist "out" rmdir /s /q "out"
echo [SUCCESS] Cleaned previous builds

REM Install dependencies
echo [INFO] Installing dependencies...
call npm ci --production=false
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [SUCCESS] Dependencies installed

REM Run type checking
echo [INFO] Running TypeScript type checking...
call npm run type-check
if errorlevel 1 (
    echo [ERROR] Type checking failed. Please fix TypeScript errors before building.
    exit /b 1
)
echo [SUCCESS] Type checking passed

REM Run linting
echo [INFO] Running ESLint...
call npm run lint
if errorlevel 1 (
    echo [WARNING] Linting issues found. Consider fixing them for better code quality.
) else (
    echo [SUCCESS] Linting passed
)

REM Set production environment
set NODE_ENV=production

REM Build the application
echo [INFO] Building Next.js application for production...
call npm run build:production
if errorlevel 1 (
    echo [ERROR] Build failed. Please check the error messages above.
    exit /b 1
)
echo [SUCCESS] Build completed successfully

REM Check build output
if exist ".next" (
    echo [SUCCESS] Build output directory (.next) created successfully
) else (
    echo [ERROR] Build output directory not found. Build may have failed.
    exit /b 1
)

REM Verify critical files exist
echo [INFO] Verifying critical build files...

if exist ".next\BUILD_ID" (
    echo [SUCCESS] ✓ .next\BUILD_ID exists
) else (
    echo [ERROR] ✗ .next\BUILD_ID missing
    exit /b 1
)

if exist ".next\static" (
    echo [SUCCESS] ✓ .next\static exists
) else (
    echo [ERROR] ✗ .next\static missing
    exit /b 1
)

if exist ".next\server" (
    echo [SUCCESS] ✓ .next\server exists
) else (
    echo [ERROR] ✗ .next\server missing
    exit /b 1
)

REM Generate build report
echo [INFO] Generating build report...
echo Production Build Report > build-report.txt
echo Generated: %date% %time% >> build-report.txt
echo Node.js Version: >> build-report.txt
node --version >> build-report.txt
echo npm Version: >> build-report.txt
npm --version >> build-report.txt
echo Environment: production >> build-report.txt
echo. >> build-report.txt
echo Build Status: SUCCESS >> build-report.txt
echo Type Check: PASSED >> build-report.txt
echo. >> build-report.txt
echo Next Steps: >> build-report.txt
echo 1. Test the build locally with: npm run preview >> build-report.txt
echo 2. Deploy to Vercel with: npm run deploy:vercel >> build-report.txt
echo 3. Verify deployment at your production URL >> build-report.txt
echo 4. Run post-deployment tests >> build-report.txt

echo [SUCCESS] Build report generated: build-report.txt

REM Final success message
echo [SUCCESS] 🎉 Production build completed successfully!
echo [INFO] Next steps:
echo   1. Test locally: npm run preview
echo   2. Deploy to Vercel: npm run deploy:vercel
echo   3. Monitor deployment and run tests

REM Optional: Start preview server
set /p answer="Would you like to start the preview server now? (y/n): "
if /i "%answer%"=="y" (
    echo [INFO] Starting preview server...
    call npm run preview
)

pause