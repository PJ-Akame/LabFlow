@echo off
REM =============================================================================
REM LabFlow 最終セットアップ - 環境完成版
REM =============================================================================

echo ========================================
echo    LabFlow Final Setup
echo ========================================
echo.

echo 環境診断結果:
echo   ✅ Node.js: v22.12.0
echo   ✅ npm: 11.0.0
echo   ✅ Python: 3.13.1
echo   ✅ pip: 25.2
echo   ✅ Git: 2.49.0.windows.1
echo   ✅ プロジェクトファイル: 存在
echo.

REM =============================================================================
REM STEP 1: JupyterLab インストール
REM =============================================================================

echo [STEP 1] JupyterLab インストール中...
echo -----------------------------------------

pip install jupyterlab
if %errorlevel% equ 0 (
    echo ✅ JupyterLab インストール完了
) else (
    echo ❌ JupyterLab インストール失敗
    pause
    exit /b 1
)

echo.

REM =============================================================================
REM STEP 2: Node.js 依存関係インストール
REM =============================================================================

echo [STEP 2] Node.js 依存関係インストール中...
echo --------------------------------------------

call npm install
if %errorlevel% equ 0 (
    echo ✅ npm install 完了
) else (
    echo ❌ npm install 失敗
    pause
    exit /b 1
)

echo.

REM =============================================================================
REM STEP 3: TypeScript ビルド
REM =============================================================================

echo [STEP 3] TypeScript ビルド中...
echo ---------------------------------

call npm run build
if %errorlevel% equ 0 (
    echo ✅ TypeScript ビルド完了
) else (
    echo ❌ TypeScript ビルド失敗
    echo.
    echo 手動でビルドを試してください:
    echo   npx tsc
    echo.
)

echo.

REM =============================================================================
REM STEP 4: JupyterLab Extension インストール
REM =============================================================================

echo [STEP 4] JupyterLab Extension インストール中...
echo ------------------------------------------------

jupyter labextension develop . --overwrite
if %errorlevel% equ 0 (
    echo ✅ Extension インストール完了
) else (
    echo ❌ Extension インストール失敗
    echo.
    echo 手動でインストールを試してください:
    echo   jupyter labextension install .
    echo.
)

echo.

REM =============================================================================
REM STEP 5: 最終確認
REM =============================================================================

echo [STEP 5] 最終確認
echo ------------------

echo JupyterLab バージョン確認:
jupyter --version
echo.

echo 利用可能な Extension 確認:
jupyter labextension list
echo.

REM =============================================================================
REM STEP 6: 完了・起動案内
REM =============================================================================

echo ========================================
echo    🎉 LabFlow セットアップ完了!
echo ========================================
echo.

echo 🚀 JupyterLab を起動します...
echo.
echo   起動後の確認事項:
echo   1. 左サイドバーに "LabFlow" パネルが表示される
echo   2. Command Palette (Ctrl+Shift+C) で "LabFlow" で検索
echo   3. AI-Dev Extension が有効になっている
echo.

set /p start_jupyter=JupyterLab を今すぐ起動しますか？ (y/n): 
if /i "%start_jupyter%"=="y" (
    echo.
    echo 🚀 JupyterLab を起動中...
    echo ブラウザが開いたら左サイドバーを確認してください
    echo.
    jupyter lab
) else (
    echo.
    echo 手動で起動する場合:
    echo   jupyter lab
    echo.
)

echo.
echo 📚 開発コマンド:
echo   - ビルド: npm run build
echo   - 監視モード: npm run watch
echo   - クリーン: npm run clean
echo   - Extension再インストール: jupyter labextension develop . --overwrite
echo.

echo 🎯 LabFlow は準備完了です！
pause