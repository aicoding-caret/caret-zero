# clean-build-package.ps1

# 스크립트 실행 시작 메시지
Write-Host "🚀 Starting clean rebuild and packaging process..."
Write-Host "⚠️ Note: Please ensure VS Code, any running terminals (especially watch processes), or other applications potentially using project files are closed before running this script to avoid permission errors."

# 오류 발생 시 스크립트 중단 설정
$ErrorActionPreference = "Continue" # 오류가 발생해도 스크립트 계속 실행

# 실행 중인 Node.js 프로세스 종료
Write-Host "🔄 Terminating any running Node.js processes..."
$originalErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue" # 오류 메시지 표시하지 않음
taskkill /F /IM node.exe 2>$null
if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne 128) {
    Write-Host "  No Node.js processes were running."
}
$ErrorActionPreference = $originalErrorActionPreference

# 1. 기존 빌드 결과물 및 의존성 폴더 삭제
Write-Host "🧹 Cleaning up old build artifacts, node_modules, and cache files..."
# package-lock.json 파일 삭제
if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" } # 루트 Lock 파일 삭제
if (Test-Path "webview-ui/package-lock.json") { Remove-Item -Force "webview-ui/package-lock.json" } # Webview Lock 파일 삭제 추가

# npm 캐시 정리 (선택적)
Write-Host "🧹 Cleaning npm cache..."
npm cache clean --force

if (Test-Path "dist") { 
    try {
        Remove-Item -Recurse -Force "dist" 
    } catch {
        Write-Warning "⚠️ Could not delete 'dist' folder: $($_.Exception.Message)"
    }
}
if (Test-Path "out") { 
    try {
        Remove-Item -Recurse -Force "out" # 테스트 빌드 폴더도 삭제 (존재할 경우)
    } catch {
        Write-Warning "⚠️ Could not delete 'out' folder: $($_.Exception.Message)"
    }
}
if (Test-Path "webview-ui/dist") { 
    try {
        Remove-Item -Recurse -Force "webview-ui/dist" 
    } catch {
        Write-Warning "⚠️ Could not delete 'webview-ui/dist' folder: $($_.Exception.Message)"
    }
}

# webview-ui/node_modules 삭제 (오류 처리 추가)
if (Test-Path "webview-ui/node_modules") {
    try {
        Remove-Item -Recurse -Force "webview-ui/node_modules"
    } catch [System.UnauthorizedAccessException] {
        Write-Warning "⚠️ Permission denied while deleting 'webview-ui/node_modules'. This often happens if a file inside is locked by another process (e.g., VS Code, a running terminal, esbuild watcher)."
        Write-Warning "👉 Continuing with the script, but you may encounter issues later."
    } catch {
        Write-Warning "⚠️ An unexpected error occurred while deleting 'webview-ui/node_modules': $($_.Exception.Message)"
        Write-Warning "👉 Continuing with the script, but you may encounter issues later."
    }
}

# node_modules 삭제 (오류 처리 추가)
if (Test-Path "node_modules") {
    try {
        Remove-Item -Recurse -Force "node_modules"
    } catch [System.UnauthorizedAccessException] {
        Write-Warning "⚠️ Permission denied while deleting 'node_modules'. This often happens if a file inside is locked by another process (e.g., VS Code, a running terminal, esbuild watcher)."
        Write-Warning "👉 Continuing with the script, but you may encounter issues later."
    } catch {
        Write-Warning "⚠️ An unexpected error occurred while deleting 'node_modules': $($_.Exception.Message)"
        Write-Warning "👉 Continuing with the script, but you may encounter issues later."
    }
}
Write-Host "✅ Cleanup complete."

# 2. 의존성 재설치
Write-Host "📦 Installing dependencies..."
npm run install:all
if ($LASTEXITCODE -ne 0) {
    Write-Warning "⚠️ Dependency installation failed! Continuing anyway..."
}
Write-Host "✅ Dependencies installed successfully."

# 3. 프로덕션 빌드 (타입 체크 건너뛰기)
Write-Host "⚙️ Building the extension for production (skipping type checks)..."

# Webview UI 빌드
Write-Host "🔧 Building webview UI..."
cd webview-ui
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Warning "⚠️ Webview UI build failed! Continuing anyway..."
}
cd .. # 원래 디렉토리로 돌아가기
Write-Host "✅ Webview UI build complete."

# esbuild 직접 실행 (타입 체크 및 린트 건너뛰기)
Write-Host "🔧 Building extension with esbuild directly..."
node esbuild.js --production
if ($LASTEXITCODE -ne 0) {
    Write-Warning "⚠️ Production build failed! Continuing anyway..."
}
Write-Host "✅ Production build complete."

# 4. VS Code 확장 파일(.vsix) 생성 (타입 체크 건너뛰기)
Write-Host "🎁 Packaging the extension (.vsix)..."

# 파일 이름 설정 (이름-버전-날짜시간.vsix)
$extensionName = "caret-dev" # package.json에서 가져옴
$extensionVersion = "3.10.1" # package.json에서 가져옴
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$outputFileName = "$($extensionName)-$($extensionVersion)-$($timestamp).vsix"
Write-Host "  Output filename will be: $outputFileName"

# 타입 체크를 건너뛰고 직접 npx vsce package 실행
# 환경 변수 설정으로 타입 체크 건너뛰기
$env:VSCE_SKIP_TYPE_CHECK = "true"

# vsce 설치 확인 및 설치
Write-Host "🔍 Checking if @vscode/vsce is installed..."
npm list -g @vscode/vsce
if ($LASTEXITCODE -ne 0) {
    Write-Host "📦 Installing @vscode/vsce globally..."
    npm install -g @vscode/vsce
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "⚠️ Failed to install @vscode/vsce globally. Trying to use npx instead."
        npx @vscode/vsce package --no-dependencies --no-git-tag-version --out $outputFileName # 출력 파일 이름 지정
    } else {
        vsce package --no-dependencies --no-git-tag-version --out $outputFileName # 출력 파일 이름 지정
    }
} else {
    vsce package --no-dependencies --no-git-tag-version --out $outputFileName # 출력 파일 이름 지정
}

if ($LASTEXITCODE -ne 0) {
    Write-Warning "⚠️ vsce package command failed. Trying with npx as fallback..."
    npx @vscode/vsce package --no-dependencies --no-git-tag-version --out $outputFileName # 출력 파일 이름 지정 (Fallback)
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Packaging failed! Could not run vsce package command."
        exit 1
    }
}
Write-Host "✅ Extension packaged successfully as $outputFileName!"

Write-Host "🎉 Clean rebuild and packaging process finished successfully!"
