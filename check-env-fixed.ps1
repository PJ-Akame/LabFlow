# =============================================================================
# STEP 2: PowerShell繧ｹ繧ｯ繝ｪ繝励ヨ迚医そ繝・ヨ繧｢繝・・繝輔ぃ繧､繝ｫ
# =============================================================================

# setup.ps1 菴懈・
@'
# LabFlow Windows Setup Script
param(
    [switch]$SkipChecks
)

Write-Host "ｧｪ LabFlow Windows Setup Starting..." -ForegroundColor Cyan

# 邂｡逅・・ｨｩ髯舌メ繧ｧ繝・け
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "笞・・ This script should be run as Administrator for best results" -ForegroundColor Yellow
}

if (-not $SkipChecks) {
    # 蠢・ｦ√↑繧ｽ繝輔ヨ繧ｦ繧ｧ繧｢縺ｮ遒ｺ隱・
    Write-Host "搭 Checking requirements..." -ForegroundColor Green
    
    # Node.js 繝√ぉ繝・け
    try {
        $nodeVersion = node --version
        Write-Host "笨・Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "笶・Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
        exit 1
    }
    
    # Python 繝√ぉ繝・け
    try {
        $pythonVersion = python --version
        Write-Host "笨・Python: $pythonVersion" -ForegroundColor Green
    } catch {
        Write-Host "笶・Python not found. Please install from https://python.org/" -ForegroundColor Red
        exit 1
    }
    
    # Git 繝√ぉ繝・け
    try {
        $gitVersion = git --version
        Write-Host "笨・Git: $gitVersion" -ForegroundColor Green
    } catch {
        Write-Host "笶・Git not found. Please install from https://git-scm.com/" -ForegroundColor Red
        exit 1
    }
    
    # JupyterLab 繝√ぉ繝・け
    try {
        $jupyterVersion = jupyter --version
        Write-Host "笨・JupyterLab: Available" -ForegroundColor Green
    } catch {
        Write-Host "笶・JupyterLab not found. Installing..." -ForegroundColor Yellow
        pip install jupyterlab
    }
}

# Node.js 萓晏ｭ倬未菫ゅう繝ｳ繧ｹ繝医・繝ｫ
Write-Host "逃 Installing Node.js dependencies..." -ForegroundColor Green
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "笶・npm install failed" -ForegroundColor Red
    exit 1
}

# Python 繝代ャ繧ｱ繝ｼ繧ｸ繧､繝ｳ繧ｹ繝医・繝ｫ・磯幕逋ｺ繝｢繝ｼ繝会ｼ・
Write-Host "錐 Installing Python package..." -ForegroundColor Green
pip install -e .

if ($LASTEXITCODE -ne 0) {
    Write-Host "笶・Python package installation failed" -ForegroundColor Red
    exit 1
}

# Extension 繝薙Ν繝・
Write-Host "畑 Building extension..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "笶・Build failed" -ForegroundColor Red
    exit 1
}

# JupyterLab Extension 繧､繝ｳ繧ｹ繝医・繝ｫ
Write-Host "ｧｩ Installing JupyterLab extension..." -ForegroundColor Green
jupyter labextension develop . --overwrite

# Magic Commands 繧ｻ繝・ヨ繧｢繝・・
Write-Host "ｪ・Setting up magic commands..." -ForegroundColor Green
python -c "
try:
    import IPython
    print('笨・IPython available')
    import ai_dev_extension.magics
    print('笨・Magic commands module loaded')
except Exception as e:
    print(f'邃ｹ・・ Magic commands will be available in Jupyter: {e}')
"

Write-Host "笨・Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "識 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Start JupyterLab: jupyter lab" -ForegroundColor White
Write-Host "   2. Look for LabFlow panel in left sidebar" -ForegroundColor White
Write-Host "   3. Try magic commands: %labflow_status" -ForegroundColor White
Write-Host ""
Write-Host "肌 Development commands:" -ForegroundColor Cyan
Write-Host "   npm run watch     - Watch for changes" -ForegroundColor White
Write-Host "   npm run build     - Build extension" -ForegroundColor White
Write-Host "   npm run clean     - Clean build files" -ForegroundColor White
'@ | Out-File -FilePath "setup.ps1" -Encoding UTF8
