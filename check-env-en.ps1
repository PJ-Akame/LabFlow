# LabFlow Environment Check Script (English)
Write-Host "LabFlow Environment Check" -ForegroundColor Cyan
Write-Host "=========================" 

# Node.js check
Write-Host ""
Write-Host "Checking Node.js..." -ForegroundColor Green
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "OK - Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "ERROR - Node.js: Not found" -ForegroundColor Red
        Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR - Node.js: Not found" -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
}

# npm check
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "OK - npm: v$npmVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING - npm: Not found" -ForegroundColor Yellow
}

# Python check
Write-Host ""
Write-Host "Checking Python..." -ForegroundColor Green
try {
    $pythonVersion = python --version 2>$null
    if ($pythonVersion) {
        Write-Host "OK - Python: $pythonVersion" -ForegroundColor Green
    } else {
        # Try python3
        $python3Version = python3 --version 2>$null
        if ($python3Version) {
            Write-Host "OK - Python: $python3Version (python3)" -ForegroundColor Green
        } else {
            Write-Host "ERROR - Python: Not found" -ForegroundColor Red
            Write-Host "   Download from: https://python.org/" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "ERROR - Python: Not found" -ForegroundColor Red
}

# pip check
try {
    $pipVersion = pip --version 2>$null
    if ($pipVersion) {
        Write-Host "OK - pip: Available" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING - pip: Not found" -ForegroundColor Yellow
}

# Git check
Write-Host ""
Write-Host "Checking Git..." -ForegroundColor Green
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "OK - Git: $gitVersion" -ForegroundColor Green
    } else {
        Write-Host "ERROR - Git: Not found" -ForegroundColor Red
        Write-Host "   Download from: https://git-scm.com/" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR - Git: Not found" -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/" -ForegroundColor Yellow
}

# JupyterLab check
Write-Host ""
Write-Host "Checking JupyterLab..." -ForegroundColor Green
try {
    $jupyterOutput = jupyter --version 2>$null
    if ($jupyterOutput) {
        Write-Host "OK - JupyterLab: Available" -ForegroundColor Green
    } else {
        Write-Host "WARNING - JupyterLab: Not found" -ForegroundColor Yellow
        Write-Host "   Install with: pip install jupyterlab" -ForegroundColor White
    }
} catch {
    Write-Host "WARNING - JupyterLab: Not found" -ForegroundColor Yellow
    Write-Host "   Install with: pip install jupyterlab" -ForegroundColor White
}

# Current directory info
Write-Host ""
Write-Host "Current Directory:" -ForegroundColor Green
Write-Host "   $(Get-Location)" -ForegroundColor White

# Files in directory
Write-Host ""
Write-Host "Files in directory:" -ForegroundColor Green
Get-ChildItem | Format-Table Name, Length, LastWriteTime -AutoSize

Write-Host ""
Write-Host "Environment check complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Install missing software if any" -ForegroundColor White
Write-Host "   2. Run: .\setup-en.ps1" -ForegroundColor White
Write-Host "   3. Test with: jupyter lab" -ForegroundColor White
