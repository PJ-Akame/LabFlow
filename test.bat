@echo off
REM ================================================================
REM LabFlow Quick Fix - Build lib/index.js
REM ================================================================

echo ========================================
echo  LabFlow Quick Fix
echo ========================================

REM Step 1: Install TypeScript if needed
echo [STEP 1] Ensuring TypeScript is available...
npx tsc --version >nul 2>&1
if %errorlevel% neq 0 (
    echo TypeScript not found, installing...
    npm install typescript
    if %errorlevel% neq 0 (
        echo Installing globally...
        npm install -g typescript
    )
) else (
    echo [OK] TypeScript is available
)

REM Step 2: Verify TypeScript version
echo.
echo [STEP 2] TypeScript version:
npx tsc --version

REM Step 3: Check current src/index.ts
echo.
echo [STEP 3] Checking src/index.ts...
if exist "src\index.ts" (
    echo [OK] src\index.ts exists
    echo File size:
    for %%I in (src\index.ts) do echo %%~zI bytes
) else (
    echo [ERROR] src\index.ts not found!
    pause
    exit /b 1
)

REM Step 4: Check/fix tsconfig.json
echo.
echo [STEP 4] Checking tsconfig.json...
if exist "tsconfig.json" (
    echo [OK] tsconfig.json exists
) else (
    echo Creating tsconfig.json...
    echo {> tsconfig.json
    echo   "compilerOptions": {>> tsconfig.json
    echo     "target": "ES2018",>> tsconfig.json
    echo     "module": "CommonJS",>> tsconfig.json
    echo     "outDir": "./lib",>> tsconfig.json
    echo     "rootDir": "./src",>> tsconfig.json
    echo     "strict": false,>> tsconfig.json
    echo     "declaration": true>> tsconfig.json
    echo   }>> tsconfig.json
    echo }>> tsconfig.json
    echo [OK] tsconfig.json created
)

REM Step 5: Clean and build
echo.
echo [STEP 5] Building TypeScript...
echo Cleaning lib directory...
rmdir /s /q lib 2>nul
mkdir lib 2>nul

echo Building...
npx tsc
echo Build exit code: %errorlevel%

REM Step 6: Verify results
echo.
echo [STEP 6] Verification...
if exist "lib\index.js" (
    echo [SUCCESS] lib\index.js generated!
    echo.
    echo Generated files:
    dir lib /b
    echo.
    echo File sizes:
    dir lib
    echo.
    echo [SUCCESS] TypeScript build completed successfully!
) else (
    echo [ERROR] lib\index.js not generated
    echo.
    echo Checking for TypeScript errors...
    npx tsc --noEmit
    echo.
    echo [ERROR] Build failed - check errors above
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Quick Fix Complete!
echo ========================================
echo.
echo Ready for JupyterLab:
echo   python -m jupyterlab
echo.
echo In browser console, look for:
echo   "LabFlow Extension: Starting activation..."
echo   "LabFlow Extension: Successfully activated!"
echo.

set /p start_lab=Start JupyterLab now? (y/n): 
if /i "%start_lab%"=="y" (
    python -m jupyterlab
)

pause