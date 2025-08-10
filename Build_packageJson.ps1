# ファイルを個別に作成（ネスト問題を回避）

# 1. package.json作成
Write-Host "Creating package.json..." -ForegroundColor Green
$packageJson = @{
    name = "@labflow/jupyterlab-extension"
    version = "1.0.0"
    description = "LabFlow - AI Development Workflow for JupyterLab"
    keywords = @("jupyterlab", "jupyter-extension", "ai", "colab", "huggingface", "claude")
    homepage = "https://github.com/labflow/jupyterlab-extension"
    license = "MIT"
    main = "lib/index.js"
    types = "lib/index.d.ts"
    style = "style/index.css"
    files = @(
        "lib/**/*.{d.ts,eot,gif,html,jpg,js,js.map,json,png,svg,woff2,ttf}",
        "style/**/*.{css,js}",
        "schema/*.json"
    )
    scripts = @{
        build = "jlpm build:lib && jlpm build:labextension:dev"
        "build:prod" = "jlpm clean && jlpm build:lib:prod && jlpm build:labextension"
        "build:labextension" = "python -m jupyter labextension build ."
        "build:lib" = "tsc --sourceMap"
        "build:lib:prod" = "tsc"
        clean = "jlpm clean:lib && jlpm clean:labextension"
        "clean:lib" = "rimraf lib tsconfig.tsbuildinfo"
        "clean:labextension" = "rimraf ai_dev_extension/labextension"
        "install:extension" = "jlpm build"
        watch = "run-p watch:src watch:labextension"
        "watch:src" = "tsc -w --sourceMap"
        "watch:labextension" = "python -m jupyter labextension watch ."
        lab = "python -m jupyterlab"
        start = "python -m jupyterlab"
    }
    dependencies = @{
        "@jupyterlab/application" = "^4.0.0"
        "@jupyterlab/apputils" = "^4.0.0"
        "@jupyterlab/coreutils" = "^6.0.0"
        "@jupyterlab/settingregistry" = "^4.0.0"
        "@lumino/widgets" = "^2.0.0"
        "@lumino/signaling" = "^2.0.0"
        "react" = "^18.0.0"
        "react-dom" = "^18.0.0"
    }
    devDependencies = @{
        "@jupyterlab/builder" = "^4.0.0"
        "@types/react" = "^18.0.0"
        "@types/react-dom" = "^18.0.0"
        "rimraf" = "^5.0.0"
        "run-p" = "^0.0.0"
        "typescript" = "~5.0.2"
    }
    jupyterlab = @{
        extension = $true
        outputDir = "ai_dev_extension/labextension"
        schemaDir = "schema"
    }
}

$packageJson | ConvertTo-Json -Depth 10 | Out-File -FilePath "package.json" -Encoding UTF8
Write-Host "✅ package.json created" -ForegroundColor Green