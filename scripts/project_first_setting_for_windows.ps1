# Caret Project First Setup Script for Windows
# This script automates the initial setup process for the Caret project on Windows

Write-Host "🚀 Starting Caret project setup for Windows..." -ForegroundColor Cyan

# 1. Clone Cline sub-repository if not exists
if (-not (Test-Path "cline")) {
    Write-Host "📦 Cloning Cline sub-repository..." -ForegroundColor Yellow
    git clone https://github.com/cline/cline.git
    cd cline
    git checkout 59a68c8d7adef6afb59990008d66d5bd74d30558
    cd ..
} else {
    Write-Host "📦 Cline repository already exists, skipping clone..." -ForegroundColor Yellow
}

# 2. Install main dependencies
Write-Host "📦 Installing main dependencies..." -ForegroundColor Yellow
npm install

# 3. Copy Windows-specific protoc files
Write-Host "🔧 Setting up Windows-specific protoc files..." -ForegroundColor Yellow
if (Test-Path "src/patch/build-proto.js") {
    Copy-Item -Path "src/patch/build-proto.js" -Destination "cline/proto/" -Force
    Write-Host "✅ Copied build-proto.js" -ForegroundColor Green
} else {
    Write-Host "❌ Error: build-proto.js not found in src/patch/" -ForegroundColor Red
    exit 1
}

if (Test-Path "src/patch/protoc-31.0-win64") {
    Copy-Item -Path "src/patch/protoc-31.0-win64" -Destination "cline/proto/" -Recurse -Force
    Write-Host "✅ Copied protoc-31.0-win64 directory" -ForegroundColor Green
} else {
    Write-Host "❌ Error: protoc-31.0-win64 directory not found in src/patch/" -ForegroundColor Red
    exit 1
}

# 4. Install webview-ui dependencies
Write-Host "📦 Installing webview-ui dependencies..." -ForegroundColor Yellow
cd webview-ui
npm install
cd ..

Write-Host "✨ Setup completed successfully!" -ForegroundColor Green
Write-Host "You can now proceed with building the project using 'npm run compile'" -ForegroundColor Cyan 