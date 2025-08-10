# 2. tsconfig.json作成
Write-Host "Creating tsconfig.json..." -ForegroundColor Green
$tsconfig = @{
    compilerOptions = @{
        target = "ES2018"
        lib = @("ES2018", "DOM")
        module = "CommonJS"
        moduleResolution = "node"
        resolveJsonModule = $true
        allowSyntheticDefaultImports = $true
        esModuleInterop = $true
        allowJs = $true
        outDir = "./lib"
        rootDir = "./src"
        strict = $true
        noUnusedLocals = $true
        preserveConstEnums = $true
        sourceMap = $true
        declaration = $true
        declarationMap = $true
        experimentalDecorators = $true
        emitDecoratorMetadata = $true
        jsx = "react-jsx"
        skipLibCheck = $true
        types = @("node")
    }
    include = @("src/**/*")
    exclude = @("node_modules", "lib", "**/*.d.ts")
}

$tsconfig | ConvertTo-Json -Depth 10 | Out-File -FilePath "tsconfig.json" -Encoding UTF8
Write-Host "✅ tsconfig.json created" -ForegroundColor Green