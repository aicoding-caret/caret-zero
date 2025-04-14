# debug-log.ps1
# 디버그 모드로 빌드하고 로그를 날짜별로 저장하는 간단한 스크립트

# 스크립트 실행 시작 메시지
Write-Host "🚀 Starting debug build with logging enabled..." -ForegroundColor Cyan

# 로그 디렉토리 설정
$logsDir = "$PSScriptRoot\logs"
if (-not (Test-Path $logsDir)) {
    Write-Host "📁 Creating logs directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# 타임스탬프 생성
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$logFile = "$logsDir\cline-debug-$timestamp.log"

# 1. 디버그 모드로 빌드
Write-Host "🔧 Building in debug mode..." -ForegroundColor Magenta

# 환경 변수 설정으로 타입 체크 건너뛰기
$env:VSCE_SKIP_TYPE_CHECK = "true"

# 디버그 모드로 esbuild 실행
Write-Host "🔨 Running esbuild in development mode..." -ForegroundColor Blue
node esbuild.js
if ($LASTEXITCODE -ne 0) {
    Write-Warning "⚠️ Debug build failed!"
    exit 1
}

# 2. VSIX 패키징 (디버그 버전)
$extensionName = "caret-dev" # package.json에서 가져옴
$extensionVersion = "3.10.1" # package.json에서 가져옴
$outputFileName = "$($extensionName)-$($extensionVersion)-$($timestamp)-debug.vsix"

Write-Host "📦 Packaging debug version as: $outputFileName" -ForegroundColor Green

# vsce 명령 실행
npx @vscode/vsce package --no-dependencies --no-git-tag-version --out $outputFileName
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Packaging failed! Could not create debug VSIX."
    exit 1
}

Write-Host "✅ Debug build packaged successfully as $outputFileName!" -ForegroundColor Green

# 3. 로그 사용 방법 안내
Write-Host "📝 Log Configuration:" -ForegroundColor Cyan
Write-Host "  - Logs will be saved to: $logFile" -ForegroundColor Cyan
Write-Host "  - To run VS Code with debug logging, use:" -ForegroundColor Cyan
Write-Host "    code --extensionDevelopmentPath=`"$PSScriptRoot`" > `"$logFile`" 2>&1" -ForegroundColor Yellow
Write-Host "  - To view logs in real-time, run:" -ForegroundColor Cyan
Write-Host "    Get-Content -Path `"$logFile`" -Wait" -ForegroundColor Yellow

# 4. 사용자에게 선택 제공
Write-Host ""
Write-Host "🚀 What would you like to do next?" -ForegroundColor Magenta
Write-Host "  [1] Run VS Code with debug logging (logs saved to $logFile)"
Write-Host "  [2] Exit"

$choice = Read-Host "Enter your choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host "🚀 Launching VS Code with debug logging..." -ForegroundColor Green
    Write-Host "📝 Debug logs will be saved to: $logFile" -ForegroundColor Cyan
    
    # VS Code 실행 및 로그 저장
    Start-Process powershell -ArgumentList "-Command", "code --extensionDevelopmentPath=`"$PSScriptRoot`" > `"$logFile`" 2>&1"
    
    Write-Host "✅ VS Code launched with debug logging enabled!" -ForegroundColor Green
    Write-Host "📋 To view logs in real-time, run: Get-Content -Path `"$logFile`" -Wait" -ForegroundColor Yellow
} else {
    Write-Host "👋 Exiting. You can run VS Code with debug logging later using:" -ForegroundColor Cyan
    Write-Host "   code --extensionDevelopmentPath=`"$PSScriptRoot`" > `"$logFile`" 2>&1" -ForegroundColor Yellow
}
