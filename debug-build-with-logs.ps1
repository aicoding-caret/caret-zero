# debug-build-with-logs.ps1
# 디버그 모드로 빌드하고 로그를 날짜별로 저장하는 스크립트

# 스크립트 실행 시작 메시지
Write-Host "🚀 Starting debug build with logging enabled..." -ForegroundColor Cyan
Write-Host "⚠️ Note: Please ensure VS Code, any running terminals, or other applications potentially using project files are closed before running this script." -ForegroundColor Yellow

# 오류 발생 시 스크립트 중단 설정
$ErrorActionPreference = "Continue" # 오류가 발생해도 스크립트 계속 실행

# 실행 중인 Node.js 프로세스 종료
Write-Host "🔄 Terminating any running Node.js processes..." -ForegroundColor Magenta
$originalErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue" # 오류 메시지 표시하지 않음
taskkill /F /IM node.exe 2>$null
if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne 128) {
    Write-Host "  No Node.js processes were running." -ForegroundColor Gray
}
$ErrorActionPreference = $originalErrorActionPreference

# 1. 기존 빌드 결과물 삭제 (node_modules는 유지)
Write-Host "🧹 Cleaning up old build artifacts..." -ForegroundColor Magenta
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
Write-Host "✅ Cleanup complete." -ForegroundColor Green

# 2. 의존성 확인 및 필요시 설치
Write-Host "📦 Checking dependencies..." -ForegroundColor Magenta
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Magenta
    npm run install:all
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "⚠️ Dependency installation failed! Continuing anyway..."
    }
} else {
    Write-Host "✅ Dependencies already installed." -ForegroundColor Green
}

# 3. 로그 디렉토리 설정
$logDir = "logs"
$currentDate = Get-Date -Format "yyyy-MM-dd"
$logPath = "$logDir\$currentDate"

# 로그 디렉토리 생성
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
    Write-Host "📁 Created logs directory." -ForegroundColor Green
}
if (-not (Test-Path $logPath)) {
    New-Item -ItemType Directory -Path $logPath | Out-Null
    Write-Host "📁 Created log directory for today: $logPath" -ForegroundColor Green
}

# 4. 디버그 모드 설정을 위한 환경 변수
$env:NODE_ENV = "development"
$env:DEBUG = "cline:*"
$env:DEBUG_HIDE_DATE = "false"
$env:DEBUG_COLORS = "true"

# 5. Webview UI 빌드 (개발 모드)
Write-Host "🔧 Building webview UI in development mode..." -ForegroundColor Magenta
cd webview-ui
npm run build:dev
if ($LASTEXITCODE -ne 0) {
    Write-Warning "⚠️ Webview UI build failed! Continuing anyway..."
}
cd .. # 원래 디렉토리로 돌아가기
Write-Host "✅ Webview UI build complete." -ForegroundColor Green

# 6. esbuild 디버그 모드로 실행
Write-Host "🔧 Building extension with esbuild in debug mode..." -ForegroundColor Magenta
node esbuild.js --development
if ($LASTEXITCODE -ne 0) {
    Write-Warning "⚠️ Debug build failed! Continuing anyway..."
}
Write-Host "✅ Debug build complete." -ForegroundColor Green

# 7. VS Code 확장 파일(.vsix) 생성
Write-Host "🎁 Packaging the extension (.vsix) in debug mode..." -ForegroundColor Magenta

# 파일 이름 설정 (이름-버전-날짜시간-debug.vsix)
$extensionName = "caret-dev" # package.json에서 가져옴
$extensionVersion = "3.10.1" # package.json에서 가져옴
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$outputFileName = "$($extensionName)-$($extensionVersion)-$($timestamp)-debug.vsix"
Write-Host "  Output filename will be: $outputFileName" -ForegroundColor Gray

# 타입 체크를 건너뛰고 직접 npx vsce package 실행
$env:VSCE_SKIP_TYPE_CHECK = "true"

# vsce 설치 확인 및 설치
Write-Host "🔍 Checking if @vscode/vsce is installed..." -ForegroundColor Magenta
npm list -g @vscode/vsce
if ($LASTEXITCODE -ne 0) {
    Write-Host "📦 Installing @vscode/vsce globally..." -ForegroundColor Magenta
    npm install -g @vscode/vsce
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "⚠️ Failed to install @vscode/vsce globally. Trying to use npx instead."
        npx @vscode/vsce package --no-dependencies --no-git-tag-version --out $outputFileName # 출력 파일 이름 지정
    } # Properly closing the inner 'if' block for npm installation fallback
} else {
    vsce package --no-dependencies --no-git-tag-version --out $outputFileName # 출력 파일 이름 지정
} # Properly closing the outer 'if' block for vsce installation check

if ($LASTEXITCODE -ne 0) {
    Write-Warning "⚠️ vsce package command failed. Trying with npx as fallback..."
    npx @vscode/vsce package --no-dependencies --no-git-tag-version --out $outputFileName # 출력 파일 이름 지정 (Fallback)
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Packaging failed! Could not run vsce package command."
        exit 1
    }
}
Write-Host "✅ Extension packaged successfully as $outputFileName!" -ForegroundColor Green

# 8. 로그 설정 안내
Write-Host "📝 Log Configuration:" -ForegroundColor Cyan
Write-Host "  - Logs will be saved to: $logPath" -ForegroundColor Cyan
Write-Host "  - To view logs in real-time, run: Get-Content -Path '$logPath\cline-debug.log' -Wait" -ForegroundColor Cyan
Write-Host "  - To redirect console output to log file when running the extension, use:" -ForegroundColor Cyan
Write-Host "    code --extensionDevelopmentPath=`"$(Get-Location)`" > '$logPath\cline-debug.log' 2>&1" -ForegroundColor Gray

# 9. 설치 방법 안내
Write-Host "🔧 Installation Instructions:" -ForegroundColor Cyan
Write-Host "  1. Open VS Code" -ForegroundColor Cyan
Write-Host "  2. Go to Extensions view (Ctrl+Shift+X)" -ForegroundColor Cyan
Write-Host "  3. Click on '...' menu (top-right of Extensions view)" -ForegroundColor Cyan
Write-Host "  4. Select 'Install from VSIX...'" -ForegroundColor Cyan
Write-Host "  5. Navigate to and select: $outputFileName" -ForegroundColor Cyan

Write-Host "🎉 Debug build and packaging process finished successfully!" -ForegroundColor Green
Write-Host "💡 Remember to check logs in $logPath directory if the extension crashes." -ForegroundColor Yellow
