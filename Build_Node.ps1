# 4. Node.js依存関係インストール
Write-Host "Installing Node.js dependencies..." -ForegroundColor Green
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    Write-Host "Trying with --legacy-peer-deps..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
}