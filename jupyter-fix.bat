@echo off
REM =============================================================================
REM JupyterLab PATH問題 解決スクリプト
REM =============================================================================

echo ========================================
echo   JupyterLab PATH修正
echo ========================================
echo.

echo 現在の状況:
echo   ✅ JupyterLab: インストール済み
echo   ❌ jupyter コマンド: PATH未設定
echo.

REM =============================================================================
REM 方法1: Python モジュールとして直接実行 (最も確実)
REM =============================================================================

echo [方法1] Python モジュールとして実行
echo ------------------------------------

echo JupyterLab を Python モジュールとして起動します...
python -m jupyterlab --version
if %errorlevel% equ 0 (
    echo ✅ JupyterLab は Python モジュールとして動作します
    echo.
    set /p start_now=今すぐ JupyterLab を起動しますか？ (y/n): 
    if /i "!start_now!"=="y" (
        echo.
        echo 🚀 JupyterLab を起動中...
        echo ブラウザが開いたら左サイドバーでLabFlowを確認してください
        echo.
        python -m jupyterlab
        goto end
    )
) else (
    echo ❌ Python モジュールでも実行できません
)

echo.

REM =============================================================================
REM 方法2: Scripts フォルダを確認・PATH追加
REM =============================================================================

echo [方法2] Scripts フォルダ確認・PATH追加
echo --------------------------------------

REM Python Scripts フォルダを探す
set PYTHON_SCRIPTS=%APPDATA%\Python\Python313\Scripts
echo Python Scripts フォルダを確認: %PYTHON_SCRIPTS%

if exist "%PYTHON_SCRIPTS%\jupyter.exe" (
    echo ✅ jupyter.exe が見つかりました: %PYTHON_SCRIPTS%\jupyter.exe
    echo.
    echo 一時的にPATHに追加してテスト...
    set PATH=%PYTHON_SCRIPTS%;%PATH%
    jupyter --version
    if %errorlevel% equ 0 (
        echo ✅ PATH追加で jupyter コマンドが動作しました
        echo.
        echo 永続的にPATHに追加しますか？
        set /p add_path=PATH に永続追加しますか？ (y/n): 
        if /i "!add_path!"=="y" (
            setx PATH "%PATH%;%PYTHON_SCRIPTS%"
            echo ✅ PATH に永続追加しました
        )
    )
) else (
    echo ❌ %PYTHON_SCRIPTS%\jupyter.exe が見つかりません
    echo.
    echo 他の場所を確認中...
    
    REM 他の可能な場所
    set ALT_SCRIPTS=%LOCALAPPDATA%\Programs\Python\Python313\Scripts
    if exist "%ALT_SCRIPTS%\jupyter.exe" (
        echo ✅ jupyter.exe が見つかりました: %ALT_SCRIPTS%\jupyter.exe
        set PYTHON_SCRIPTS=%ALT_SCRIPTS%
    ) else (
        echo ❌ 標準的な場所にjupyter.exeが見つかりません
    )
)

echo.

REM =============================================================================
REM 方法3: Extension インストール (Python モジュール経由)
REM =============================================================================

echo [方法3] Extension インストール
echo -------------------------------

echo LabFlow Extension を Python モジュール経由でインストール...
python -m jupyter labextension develop . --overwrite
if %errorlevel% equ 0 (
    echo ✅ Extension インストール完了
) else (
    echo ❌ Extension インストール失敗
    echo.
    echo 代替方法を試します...
    python -m pip install -e .
    if %errorlevel% equ 0 (
        echo ✅ pip install -e . で開発版インストール完了
    )
)

echo.

REM =============================================================================
REM 最終確認・起動
REM =============================================================================

echo [最終確認] LabFlow 起動
echo -------------------------

echo Extension 一覧確認:
python -m jupyter labextension list

echo.
echo ========================================
echo   🎯 LabFlow 起動準備完了
echo ========================================
echo.

echo 起動方法:
echo   [推奨] Python モジュール: python -m jupyterlab
if exist "%PYTHON_SCRIPTS%\jupyter.exe" (
    echo   [直接]  Direct command: jupyter lab
)

echo.
set /p final_start=今すぐ LabFlow を起動しますか？ (y/n): 
if /i "%final_start%"=="y" (
    echo.
    echo 🚀 LabFlow (JupyterLab) を起動中...
    echo 📝 確認事項:
    echo   1. ブラウザでJupyterLabが開く
    echo   2. 左サイドバーに"LabFlow"パネルが表示される
    echo   3. Command Palette (Ctrl+Shift+C) で "LabFlow" 検索
    echo.
    python -m jupyterlab
)

:end
echo.
echo 🎉 LabFlow セットアップ完了！
echo.
echo 💡 今後の起動方法:
echo   python -m jupyterlab
echo.
pause