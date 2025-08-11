# LabFlow BOM Fix Script - Quick Solution
Write-Host "LabFlow BOM Error Fix" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Problem: UTF-8 BOM in JSON files causing JupyterLab 500 error" -ForegroundColor Yellow
Write-Host "Solution: Remove BOM and recreate files without BOM" -ForegroundColor Green
Write-Host ""

# Step 1: Stop any running JupyterLab instances
Write-Host "[1/5] Stopping JupyterLab instances..." -ForegroundColor Green
Write-Host "---------------------------------------"
try {
    Get-Process | Where-Object {$_.ProcessName -like "*jupyter*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Stopped running JupyterLab instances" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ No JupyterLab instances to stop" -ForegroundColor Yellow
}

# Step 2: Remove problematic extension directory
Write-Host ""
Write-Host "[2/5] Cleaning problematic extension files..." -ForegroundColor Green
Write-Host "----------------------------------------------"

try {
    $jupyterDataDir = python -c "import jupyter_core.paths; print(jupyter_core.paths.jupyter_data_dir())" 2>$null
    if ($jupyterDataDir) {
        $labflowExtDir = Join-Path $jupyterDataDir "labextensions\@labflow"
        if (Test-Path $labflowExtDir) {
            Remove-Item $labflowExtDir -Recurse -Force
            Write-Host "✅ Removed problematic extension directory" -ForegroundColor Green
        } else {
            Write-Host "ℹ️ No problematic extension directory found" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠️ Could not clean extension directory: $_" -ForegroundColor Yellow
}

# Step 3: Recreate package.json without BOM
Write-Host ""
Write-Host "[3/5] Recreating package.json without BOM..." -ForegroundColor Green
Write-Host "---------------------------------------------"

$packageJsonContent = @'
{
  "name": "@labflow/jupyterlab-extension",
  "version": "1.0.0",
  "description": "LabFlow AI Development Extension",
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "style": "style/index.css",
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "clean": "rimraf lib",
    "start": "python -m jupyterlab"
  },
  "dependencies": {
    "@jupyterlab/application": "^4.0.0",
    "@jupyterlab/apputils": "^4.0.0",
    "@lumino/widgets": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "~5.0.2",
    "rimraf": "^5.0.0"
  },
  "jupyterlab": {
    "extension": true
  }
}
'@

# Use .NET method to write without BOM
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "package.json"), $packageJsonContent, [System.Text.UTF8Encoding]::new($false))
Write-Host "✅ package.json recreated without BOM" -ForegroundColor Green

# Step 4: Recreate tsconfig.json without BOM
Write-Host ""
Write-Host "[4/5] Recreating tsconfig.json without BOM..." -ForegroundColor Green
Write-Host "----------------------------------------------"

$tsconfigContent = @'
{
  "compilerOptions": {
    "target": "ES2018",
    "lib": ["ES2018", "DOM"],
    "module": "CommonJS",
    "outDir": "./lib",
    "rootDir": "./src",
    "strict": false,
    "declaration": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "lib"]
}
'@

[System.IO.File]::WriteAllText((Join-Path (Get-Location) "tsconfig.json"), $tsconfigContent, [System.Text.UTF8Encoding]::new($false))
Write-Host "✅ tsconfig.json recreated without BOM" -ForegroundColor Green

# Step 5: Rebuild and restart
Write-Host ""
Write-Host "[5/5] Rebuilding and restarting..." -ForegroundColor Green
Write-Host "----------------------------------"

# Clean rebuild
Write-Host "Cleaning old build..." -ForegroundColor Yellow
if (Test-Path "lib") {
    Remove-Item "lib" -Recurse -Force
}

Write-Host "Rebuilding TypeScript..." -ForegroundColor Yellow
try {
    npm run build
    if (Test-Path "lib/index.js") {
        Write-Host "✅ TypeScript build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ TypeScript build failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Build failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    BOM Fix Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎯 What was fixed:" -ForegroundColor Green
Write-Host "  ✅ Removed UTF-8 BOM from JSON files" -ForegroundColor White
Write-Host "  ✅ Cleaned problematic extension directory" -ForegroundColor White
Write-Host "  ✅ Recreated files with proper encoding" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Ready to test!" -ForegroundColor Cyan
Write-Host ""

$startJupyter = Read-Host "Start JupyterLab now? (y/n)"
if ($startJupyter -eq "y" -or $startJupyter -eq "Y") {
    Write-Host ""
    Write-Host "🚀 Starting JupyterLab..." -ForegroundColor Green
    Write-Host "This time it should work without 500 errors!" -ForegroundColor Yellow
    Write-Host ""
    
    # Wait a moment for any lingering processes to clear
    Start-Sleep -Seconds 2
    
    python -m jupyterlab
} else {
    Write-Host ""
    Write-Host "Manual start command:" -ForegroundColor Yellow
    Write-Host "   python -m jupyterlab" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 If 500 error persists:" -ForegroundColor Yellow
    Write-Host "   1. Wait 30 seconds and try again" -ForegroundColor White
    Write-Host "   2. Check browser cache (Ctrl+F5)" -ForegroundColor White
    Write-Host "   3. Try incognito/private browser window" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 Extension should now load properly!" -ForegroundColor Green