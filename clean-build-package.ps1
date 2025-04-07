# clean-build-package.ps1

# 스크립트 실행 시작 메시지
Write-Host "🚀 Starting clean rebuild and packaging process..."
Write-Host "⚠️ Note: Please ensure VS Code, any running terminals (especially watch processes), or other applications potentially using project files are closed before running this script to avoid permission errors."

# 오류 발생 시 스크립트 중단 설정
$ErrorActionPreference = "Stop"

# 1. 기존 빌드 결과물 및 의존성 폴더 삭제
Write-Host "🧹 Cleaning up old build artifacts, node_modules, and cache files..."
# package-lock.json 파일 삭제
if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" } # 루트 Lock 파일 삭제
if (Test-Path "webview-ui/package-lock.json") { Remove-Item -Force "webview-ui/package-lock.json" } # Webview Lock 파일 삭제 추가

# npm 캐시 정리 (선택적)
Write-Host "🧹 Cleaning npm cache..."
npm cache clean --force

if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "out") { Remove-Item -Recurse -Force "out" } # 테스트 빌드 폴더도 삭제 (존재할 경우)
if (Test-Path "webview-ui/dist") { Remove-Item -Recurse -Force "webview-ui/dist" }

# webview-ui/node_modules 삭제 (오류 처리 추가)
if (Test-Path "webview-ui/node_modules") {
    try {
        Remove-Item -Recurse -Force "webview-ui/node_modules"
    } catch [System.UnauthorizedAccessException] {
        Write-Error "❌ Permission denied while deleting 'webview-ui/node_modules'. This often happens if a file inside is locked by another process (e.g., VS Code, a running terminal, esbuild watcher)."
        Write-Error "👉 Please close any applications that might be using files in 'webview-ui/node_modules' and try running the script again."
        exit 1 # 오류 발생 시 스크립트 중단
    } catch {
        Write-Error "❌ An unexpected error occurred while deleting 'webview-ui/node_modules': $($_.Exception.Message)"
        exit 1 # 다른 종류의 오류 발생 시 스크립트 중단
    }
}

# node_modules 삭제 (오류 처리 추가)
if (Test-Path "node_modules") {
    try {
        Remove-Item -Recurse -Force "node_modules"
    } catch [System.UnauthorizedAccessException] {
        Write-Error "❌ Permission denied while deleting 'node_modules'. This often happens if a file inside is locked by another process (e.g., VS Code, a running terminal, esbuild watcher)."
        Write-Error "👉 Please close any applications that might be using files in 'node_modules' and try running the script again."
        exit 1 # 오류 발생 시 스크립트 중단
    } catch {
        Write-Error "❌ An unexpected error occurred while deleting 'node_modules': $($_.Exception.Message)"
        exit 1 # 다른 종류의 오류 발생 시 스크립트 중단
    }
}
Write-Host "✅ Cleanup complete."

# 2. 의존성 재설치
Write-Host "📦 Installing dependencies..."
npm run install:all
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Dependency installation failed!"
    exit 1
}
Write-Host "✅ Dependencies installed successfully."

# 3. 프로덕션 빌드 (타입 체크 건너뛰기)
Write-Host "⚙️ Building the extension for production (skipping type checks)..."

# Webview UI 빌드
Write-Host "🔧 Building webview UI..."
cd webview-ui
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Webview UI build failed!"
    cd .. # 원래 디렉토리로 돌아가기
    exit 1
}
cd .. # 원래 디렉토리로 돌아가기
Write-Host "✅ Webview UI build complete."

# esbuild 직접 실행 (타입 체크 및 린트 건너뛰기)
Write-Host "🔧 Building extension with esbuild directly..."
node esbuild.js --production
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Production build failed!"
    exit 1
}
Write-Host "✅ Production build complete."

# 4. VS Code 확장 파일(.vsix) 생성
Write-Host "🎁 Packaging the extension (.vsix)..."
# vsce (Visual Studio Code Extensions) CLI가 설치되어 있어야 합니다.
# 전역 설치: npm install -g @vscode/vsce
# 또는 개발 의존성으로 추가: npm install --save-dev @vscode/vsce 후 npx vsce package 사용
vsce package
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Packaging failed! Make sure 'vsce' is installed and accessible."
    exit 1
}
Write-Host "✅ Extension packaged successfully!"

Write-Host "🎉 Clean rebuild and packaging process finished successfully!"
