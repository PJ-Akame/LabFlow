# =============================================================================
# LABFLOW - WINDOWS環境 完全セットアップガイド
# =============================================================================

# =============================================================================
# WINDOWS前提条件の確認・インストール
# =============================================================================

## 必要なソフトウェアのインストール

### 1. Node.js インストール
# https://nodejs.org/en/download/ からLTS版をダウンロード・インストール

### 2. Python インストール  
# https://www.python.org/downloads/ から3.8+をダウンロード・インストール
# ⚠️ 重要：「Add Python to PATH」にチェックを入れる

### 3. Git インストール
# https://git-scm.com/download/win からダウンロード・インストール

### 4. Visual Studio Code (推奨)
# https://code.visualstudio.com/download からダウンロード・インストール

### 5. JupyterLab インストール
# PowerShell または コマンドプロンプトで実行：
pip install jupyterlab

# =============================================================================
# STEP 1: Windowsコマンドでフォルダ構成作成
# =============================================================================

# PowerShell または コマンドプロンプトを管理者として起動
# 作業ディレクトリ作成・移動
mkdir labflow
cd labflow

# フォルダ構成作成（Windowsコマンド）
mkdir src\components
mkdir src\managers  
mkdir src\magics
mkdir style
mkdir schema
mkdir ai_dev_extension
mkdir jupyter-config\server-config
mkdir jupyter-config\nb-config
mkdir .github\workflows
mkdir .github\ISSUE_TEMPLATE
mkdir docs
mkdir tests\unit
mkdir tests\integration
mkdir examples

# フォルダ構成確認（Windows tree コマンド）
tree /F

# =============================================================================
# STEP 2: PowerShellスクリプト版セットアップファイル
# =============================================================================

# setup.ps1 作成
@'
# LabFlow Windows Setup Script
param(
    [switch]$SkipChecks
)

Write-Host "🧪 LabFlow Windows Setup Starting..." -ForegroundColor Cyan

# 管理者権限チェック
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️  This script should be run as Administrator for best results" -ForegroundColor Yellow
}

if (-not $SkipChecks) {
    # 必要なソフトウェアの確認
    Write-Host "📋 Checking requirements..." -ForegroundColor Green
    
    # Node.js チェック
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
        exit 1
    }
    
    # Python チェック
    try {
        $pythonVersion = python --version
        Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Python not found. Please install from https://python.org/" -ForegroundColor Red
        exit 1
    }
    
    # Git チェック
    try {
        $gitVersion = git --version
        Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Git not found. Please install from https://git-scm.com/" -ForegroundColor Red
        exit 1
    }
    
    # JupyterLab チェック
    try {
        $jupyterVersion = jupyter --version
        Write-Host "✅ JupyterLab: Available" -ForegroundColor Green
    } catch {
        Write-Host "❌ JupyterLab not found. Installing..." -ForegroundColor Yellow
        pip install jupyterlab
    }
}

# Node.js 依存関係インストール
Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Green
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}

# Python パッケージインストール（開発モード）
Write-Host "🐍 Installing Python package..." -ForegroundColor Green
pip install -e .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python package installation failed" -ForegroundColor Red
    exit 1
}

# Extension ビルド
Write-Host "🔨 Building extension..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# JupyterLab Extension インストール
Write-Host "🧩 Installing JupyterLab extension..." -ForegroundColor Green
jupyter labextension develop . --overwrite

# Magic Commands セットアップ
Write-Host "🪄 Setting up magic commands..." -ForegroundColor Green
python -c "
try:
    import IPython
    print('✅ IPython available')
    import ai_dev_extension.magics
    print('✅ Magic commands module loaded')
except Exception as e:
    print(f'ℹ️  Magic commands will be available in Jupyter: {e}')
"

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Start JupyterLab: jupyter lab" -ForegroundColor White
Write-Host "   2. Look for LabFlow panel in left sidebar" -ForegroundColor White
Write-Host "   3. Try magic commands: %labflow_status" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Development commands:" -ForegroundColor Cyan
Write-Host "   npm run watch     - Watch for changes" -ForegroundColor White
Write-Host "   npm run build     - Build extension" -ForegroundColor White
Write-Host "   npm run clean     - Clean build files" -ForegroundColor White
'@ | Out-File -FilePath "setup.ps1" -Encoding UTF8

# =============================================================================
# STEP 3: バッチファイル版（PowerShell使えない環境用）
# =============================================================================

# setup.bat 作成
@'
@echo off
echo 🧪 LabFlow Windows Setup Starting...

REM 必要なソフトウェアの確認
echo 📋 Checking requirements...

REM Node.js チェック
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js: Found

REM Python チェック
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install from https://python.org/
    pause
    exit /b 1
)
echo ✅ Python: Found

REM Git チェック
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git not found. Please install from https://git-scm.com/
    pause
    exit /b 1
)
echo ✅ Git: Found

REM JupyterLab チェック
jupyter --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ JupyterLab not found. Installing...
    pip install jupyterlab
)
echo ✅ JupyterLab: Found

REM Node.js 依存関係インストール
echo 📦 Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

REM Python パッケージインストール
echo 🐍 Installing Python package...
pip install -e .
if %errorlevel% neq 0 (
    echo ❌ Python package installation failed
    pause
    exit /b 1
)

REM Extension ビルド
echo 🔨 Building extension...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

REM JupyterLab Extension インストール
echo 🧩 Installing JupyterLab extension...
jupyter labextension develop . --overwrite

REM Magic Commands テスト
echo 🪄 Testing magic commands...
python -c "import ai_dev_extension.magics; print('✅ Magic commands ready')" 2>nul

echo.
echo ✅ Setup complete!
echo.
echo 🎯 Next steps:
echo    1. Start JupyterLab: jupyter lab
echo    2. Look for LabFlow panel in left sidebar
echo    3. Try magic commands: %%labflow_status
echo.
pause
'@ | Out-File -FilePath "setup.bat" -Encoding ASCII

# =============================================================================
# STEP 4: Windows環境向けファイル作成
# =============================================================================

# package.json (Windows パス対応)
@'
{
  "name": "@labflow/jupyterlab-extension",
  "version": "1.0.0",
  "description": "🧪🌊 LabFlow - Seamless AI Development Workflow for JupyterLab. Connect Colab clusters, HuggingFace Hub, and Claude AI.",
  "keywords": [
    "jupyterlab",
    "jupyter-extension", 
    "artificial-intelligence",
    "machine-learning",
    "google-colab",
    "huggingface",
    "claude-ai",
    "gpu-computing",
    "distributed-training"
  ],
  "homepage": "https://github.com/labflow/jupyterlab-extension",
  "repository": {
    "type": "git",
    "url": "https://github.com/labflow/jupyterlab-extension.git"
  },
  "license": "MIT",
  "author": {
    "name": "LabFlow Team",
    "email": "team@labflow.ai"
  },
  "files": [
    "lib/**/*.{d.ts,eot,gif,html,jpg,js,js.map,json,png,svg,woff2,ttf}",
    "style/**/*.{css,js,eot,gif,html,jpg,json,png,svg,woff2,ttf}",
    "schema/*.json"
  ],
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "style": "style/index.css",
  "scripts": {
    "build": "jlpm build:lib && jlpm build:labextension:dev",
    "build:prod": "jlpm clean && jlpm build:lib:prod && jlpm build:labextension",
    "build:labextension": "jupyter labextension build .",
    "build:labextension:dev": "jupyter labextension build --development True .",
    "build:lib": "tsc --sourceMap",
    "build:lib:prod": "tsc",
    "clean": "jlpm clean:lib",
    "clean:lib": "rimraf lib tsconfig.tsbuildinfo",
    "clean:labextension": "rimraf ai_dev_extension/labextension",
    "clean:all": "jlpm clean:lib && jlpm clean:labextension",
    "eslint": "jlpm eslint:check --fix",
    "eslint:check": "eslint . --cache --ext .ts,.tsx",
    "install:extension": "jlpm build",
    "lint": "jlpm prettier && jlpm eslint",
    "prettier": "prettier --write \"**/*.{ts,tsx,js,jsx,css,json,md}\"",
    "watch": "run-p watch:src watch:labextension",
    "watch:src": "tsc -w --sourceMap",
    "watch:labextension": "jupyter labextension watch ."
  },
  "dependencies": {
    "@jupyterlab/application": "^4.0.0",
    "@jupyterlab/apputils": "^4.0.0",
    "@jupyterlab/coreutils": "^6.0.0",
    "@jupyterlab/launcher": "^4.0.0",
    "@jupyterlab/mainmenu": "^4.0.0",
    "@jupyterlab/notebook": "^4.0.0",
    "@jupyterlab/services": "^7.0.0",
    "@jupyterlab/settingregistry": "^4.0.0",
    "@lumino/widgets": "^2.0.0",
    "@lumino/signaling": "^2.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@jupyterlab/builder": "^4.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@typescript-eslint/eslint-plugin": "^6.1.0",
    "@typescript-eslint/parser": "^6.1.0",
    "eslint": "^8.36.0",
    "eslint-config-prettier": "^8.8.0",
    "npm-run-all": "^4.1.5",
    "prettier": "^3.0.0",
    "rimraf": "^5.0.0",
    "typescript": "~5.0.2"
  },
  "jupyterlab": {
    "extension": true,
    "outputDir": "ai_dev_extension/labextension",
    "schemaDir": "schema"
  }
}
'@ | Out-File -FilePath "package.json" -Encoding UTF8

# .gitignore (Windows対応)
@'
# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# PyInstaller
*.manifest
*.spec

# Jupyter Notebook
.ipynb_checkpoints

# IPython
profile_default/
ipython_config.py

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# TypeScript
*.tsbuildinfo

# JupyterLab
ai_dev_extension/labextension/

# Security - API Keys & Secrets
*.env*
secrets/
config/private*
*.pem
*.key
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Coverage
.coverage
htmlcov/
.pytest_cache/
coverage/

# VS Code
.vscode/

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/
*.cab
*.msi
*.msix
*.msm
*.msp
*.lnk

# macOS
.DS_Store

# Python virtual environments
venv/
env/
ENV/
.venv/
'@ | Out-File -FilePath ".gitignore" -Encoding UTF8

# pyproject.toml
@'
[build-system]
requires = ["hatchling>=1.5.0", "jupyter-packaging>=0.12,<2"]
build-backend = "hatchling.build"

[project]
name = "labflow"
readme = "README.md"
license = { file = "LICENSE" }
requires-python = ">=3.8"
classifiers = [
    "Framework :: Jupyter",
    "Framework :: Jupyter :: JupyterLab",
    "Framework :: Jupyter :: JupyterLab :: 4",
    "Framework :: Jupyter :: JupyterLab :: Extensions",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9", 
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
]
dependencies = [
    "jupyter_server>=2.0.0,<3",
    "jupyterlab>=4.0.0,<5",
    "ipython>=8.0.0",
    "requests>=2.25.0",
]
dynamic = ["version", "description", "authors", "urls", "keywords"]

[project.optional-dependencies]
test = ["coverage", "pytest", "pytest-asyncio", "pytest-cov"]
colab = ["flask>=2.0.0", "flask-cors>=3.0.0", "pyngrok>=5.0.0", "psutil>=5.8.0"]
huggingface = ["huggingface-hub>=0.16.0", "transformers>=4.21.0"]
claude = ["anthropic>=0.3.0"]
all = ["flask>=2.0.0", "flask-cors>=3.0.0", "pyngrok>=5.0.0", "psutil>=5.8.0", "huggingface-hub>=0.16.0", "transformers>=4.21.0", "anthropic>=0.3.0"]

[tool.hatch.version]
source = "nodejs"

[tool.hatch.metadata.hooks.nodejs]
fields = ["description", "authors", "urls"]

[tool.hatch.build.targets.wheel.shared-data]
"ai_dev_extension/labextension" = "share/jupyter/labextensions/@labflow/jupyterlab-extension"
"install.json" = "share/jupyter/labextensions/@labflow/jupyterlab-extension/install.json"
"jupyter-config/server-config" = "etc/jupyter/jupyter_server_config.d"
"jupyter-config/nb-config" = "etc/jupyter/jupyter_notebook_config.d"

[tool.hatch.build.hooks.jupyter-builder]
dependencies = ["hatch-jupyter-builder>=0.5"]
build-function = "hatch_jupyter_builder.npm_builder"
ensured-targets = [
    "ai_dev_extension/labextension/static/style.js",
    "ai_dev_extension/labextension/package.json",
]
skip-if-exists = ["ai_dev_extension/labextension/static/style.js"]

[tool.hatch.build.hooks.jupyter-builder.build-kwargs]
build_cmd = "build:prod"
npm = ["jlpm"]

[tool.hatch.build.hooks.jupyter-builder.editable-build-kwargs]
build_cmd = "install:extension"
npm = ["jlpm"]
source_dir = "src"
build_dir = "ai_dev_extension/labextension"
'@ | Out-File -FilePath "pyproject.toml" -Encoding UTF8

# =============================================================================
# STEP 5: TypeScript・React ファイル作成（Windows対応）
# =============================================================================

# src/index.ts
@'
import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";

import {
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker
} from "@jupyterlab/apputils";

import { ILauncher } from "@jupyterlab/launcher";
import { IMainMenu } from "@jupyterlab/mainmenu";
import { ISettingRegistry } from "@jupyterlab/settingregistry";

// Custom Components
import { LabFlowSidePanel } from "./components/LabFlowSidePanel";

// Managers
import { ColabManager } from "./managers/ColabManager";
import { AuthManager } from "./managers/AuthManager";
import { HFManager } from "./managers/HFManager";
import { ClaudeManager } from "./managers/ClaudeManager";

// Styles
import "../style/index.css";

const EXTENSION_ID = "labflow";
const PLUGIN_ID = `${EXTENSION_ID}:plugin`;

interface ILabFlowExtension {
  colabManager: ColabManager;
  authManager: AuthManager;
  hfManager: HFManager;
  claudeManager: ClaudeManager;
}

const plugin: JupyterFrontEndPlugin<ILabFlowExtension> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer, ISettingRegistry],
  optional: [ILauncher, IMainMenu],
  provides: ILabFlowExtension,
  activate: activateExtension
};

function activateExtension(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  restorer: ILayoutRestorer,
  settingRegistry: ISettingRegistry,
  launcher: ILauncher | null,
  mainMenu: IMainMenu | null
): ILabFlowExtension {
  
  console.log("🚀 LabFlow Extension activating...");

  // Initialize managers
  const authManager = new AuthManager(settingRegistry);
  const colabManager = new ColabManager(authManager);
  const hfManager = new HFManager(authManager);
  const claudeManager = new ClaudeManager(authManager);

  // Create side panel widget
  const sidePanel = new LabFlowSidePanel({
    colabManager,
    authManager,
    hfManager,
    claudeManager
  });
  
  sidePanel.id = "labflow-sidepanel";
  sidePanel.title.label = "LabFlow";
  sidePanel.title.caption = "AI Development Workflow";
  sidePanel.title.iconClass = "jp-labflow-icon";

  // Add to side panel
  app.shell.add(sidePanel, "left", { rank: 300 });

  // Register commands
  app.commands.addCommand("labflow:connect-colab", {
    label: "Connect to Colab",
    execute: async () => {
      console.log("Connecting to Colab...");
    }
  });

  // Add to command palette
  palette.addItem({ 
    command: "labflow:connect-colab", 
    category: "LabFlow" 
  });

  console.log("✅ LabFlow Extension activated successfully");

  return {
    colabManager,
    authManager,
    hfManager,
    claudeManager
  };
}

export default plugin;
'@ | Out-File -FilePath "src/index.ts" -Encoding UTF8

# =============================================================================
# STEP 6: PowerShell版 GitHub公開スクリプト
# =============================================================================

# publish.ps1
@'
# LabFlow GitHub Publishing Script (Windows PowerShell)
param(
    [string]$GitHubUsername = "",
    [switch]$Force
)

Write-Host "🚀 LabFlow GitHub Publishing (Windows)..." -ForegroundColor Cyan

# GitHub ユーザー名の確認
if (-not $GitHubUsername) {
    $GitHubUsername = Read-Host "Enter your GitHub username"
    if (-not $GitHubUsername) {
        Write-Host "❌ GitHub username is required" -ForegroundColor Red
        exit 1
    }
}

# Git リポジトリの初期化確認
if (-not (Test-Path ".git")) {
    Write-Host "📁 Initializing git repository..." -ForegroundColor Green
    git init
    git branch -M main
}

# GitHub リモートの確認・設定
$remoteUrl = ""
try {
    $remoteUrl = git remote get-url origin 2>$null
} catch {
    # リモートが設定されていない場合
}

if (-not $remoteUrl -or $Force) {
    $repoUrl = "https://github.com/$GitHubUsername/labflow.git"
    Write-Host "🔗 Setting GitHub remote to: $repoUrl" -ForegroundColor Green
    
    if ($remoteUrl) {
        git remote set-url origin $repoUrl
    } else {
        git remote add origin $repoUrl
    }
}

# Extension ビルド
Write-Host "🔨 Building extension..." -ForegroundColor Green
npm run build:prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# ファイルのステージング
Write-Host "📦 Staging files..." -ForegroundColor Green
git add .

# 変更の確認
$changes = git diff --staged --name-only
if (-not $changes) {
    Write-Host "ℹ️  No changes to commit" -ForegroundColor Yellow
} else {
    Write-Host "💾 Committing changes..." -ForegroundColor Green
    git commit -m @"
Initial LabFlow release

🧪 LabFlow - AI Development Accelerator for JupyterLab

Features:
- 🖥️ Google Colab Pro integration
- 🤗 HuggingFace Hub connectivity  
- 🤖 Claude AI assistance
- 🪄 Magic commands for streamlined workflow
- 📊 Real-time GPU monitoring
- 🚀 Distributed training support

Ready for community use and contributions!
"@
}

# GitHub へプッシュ
Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Published to GitHub successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Visit: https://github.com/$GitHubUsername/labflow" -ForegroundColor White
    Write-Host "   2. Configure branch protection rules" -ForegroundColor White
    Write-Host "   3. Enable security features" -ForegroundColor White
    Write-Host "   4. Create first release tag" -ForegroundColor White
    Write-Host "   5. Publish to PyPI: python -m build && twine upload dist/*" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Repository: https://github.com/$GitHubUsername/labflow" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    Write-Host "Make sure the repository exists: https://github.com/$GitHubUsername/labflow" -ForegroundColor Yellow
    exit 1
}
'@ | Out-File -FilePath "publish.ps1" -Encoding UTF8

# publish.bat (PowerShell使えない環境用)
@'
@echo off
echo 🚀 LabFlow GitHub Publishing (Windows Batch)...

REM GitHub ユーザー名入力
set /p GITHUB_USERNAME=Enter your GitHub username: 
if "%GITHUB_USERNAME%"=="" (
    echo ❌ GitHub username is required
    pause
    exit /b 1
)

REM Git リポジトリ初期化確認
if not exist ".git" (
    echo 📁 Initializing git repository...
    git init
    git branch -M main
)

REM GitHub リモート設定
echo 🔗 Setting GitHub remote...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/%GITHUB_USERNAME%/labflow.git

REM Extension ビルド
echo 🔨 Building extension...
call npm run build:prod
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

REM ファイルステージング
echo 📦 Staging files...
git add .

REM コミット
echo 💾 Committing changes...
git commit -m "Initial LabFlow release - AI Development Accelerator for JupyterLab"

REM GitHub プッシュ
echo ⬆️ Pushing to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo ✅ Published to GitHub successfully!
    echo.
    echo 🎯 Next steps:
    echo    1. Visit: https://github.com/%GITHUB_USERNAME%/labflow
    echo    2. Configure repository settings
    echo    3. Create first release
    echo.
) else (
    echo ❌ Failed to push to GitHub
    echo Make sure the repository exists: https://github.com/%GITHUB_USERNAME%/labflow
)

pause
'@ | Out-File -FilePath "publish.bat" -Encoding ASCII

# =============================================================================
# STEP 7: Windows環境確認・デバッグ用スクリプト
# =============================================================================

# check-env.ps1
@'
# Windows環境確認スクリプト
Write-Host "🔍 LabFlow Environment Check (Windows)" -ForegroundColor Cyan
Write-Host "=" * 50

# システム情報
Write-Host "💻 System Information:" -ForegroundColor Green
Write-Host "   OS: $([System.Environment]::OSVersion.VersionString)"
Write-Host "   PowerShell: $($PSVersionTable.PSVersion)"
Write-Host "   Architecture: $([System.Environment]::Is64BitOperatingSystem)"

# Node.js
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
}

# Python
try {
    $pythonVersion = python --version
    $pipVersion = pip --version
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
    Write-Host "✅ pip: Available" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found" -ForegroundColor Red
    Write-Host "   Download from: https://python.org/" -ForegroundColor Yellow
}

# Git
try {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found" -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/" -ForegroundColor Yellow
}

# JupyterLab
try {
    $jupyterVersion = jupyter --version 2>$null
    Write-Host "✅ JupyterLab: Available" -ForegroundColor Green
} catch {
    Write-Host "⚠️  JupyterLab not found" -ForegroundColor Yellow
    Write-Host "   Install with: pip install jupyterlab" -ForegroundColor White
}

# パス確認
Write-Host ""
Write-Host "📁 Path Information:" -ForegroundColor Green
Write-Host "   Current Directory: $(Get-Location)"
Write-Host "   Python Path: $(where.exe python 2>$null)"
Write-Host "   Node Path: $(where.exe node 2>$null)"
Write-Host "   Git Path: $(where.exe git 2>$null)"

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
if (Test-Path "setup.ps1") {
    Write-Host "   Run: .\setup.ps1" -ForegroundColor White
} else {
    Write-Host "   1. Create project files first" -ForegroundColor White
    Write-Host "   2. Run setup script" -ForegroundColor White
}
'@ | Out-File -FilePath "check-env.ps1" -Encoding UTF8

# =============================================================================
# WINDOWS実行手順ガイド
# =============================================================================

Write-Host "🎉 LabFlow Windows project files created!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Project structure created for Windows" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Quick Start (Windows):" -ForegroundColor Cyan
Write-Host "   1. Open PowerShell as Administrator" -ForegroundColor White
Write-Host "   2. cd to this directory" -ForegroundColor White
Write-Host "   3. Run: .\check-env.ps1    # Check environment" -ForegroundColor White
Write-Host "   4. Run: .\setup.ps1        # Setup project" -ForegroundColor White
Write-Host "   5. Run: jupyter lab        # Test locally" -ForegroundColor White
Write-Host "   6. Create GitHub repo" -ForegroundColor White
Write-Host "   7. Run: .\publish.ps1      # Publish to GitHub" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Alternative (Command Prompt):" -ForegroundColor Cyan
Write-Host "   Use .bat files instead: setup.bat, publish.bat" -ForegroundColor White
Write-Host ""
Write-Host "✨ Your Windows-compatible LabFlow is ready!" -ForegroundColor Green