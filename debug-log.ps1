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
$logFile = "$logsDir\caret-debug-$timestamp.log"

# 1. 디버그 모드로 빌드
Write-Host "🔧 Building in debug mode..." -ForegroundColor Magenta

# 환경 변수 설정으로 타입 체크 건너뛰기
$env:VSCE_SKIP_TYPE_CHECK = "true"

# 디버그 모드로 esbuild 실행
Write-Host "🔨 Running esbuild in development mode..." -ForegroundColor Blue
Write-Host "📝 Saving esbuild logs to: $logFile" -ForegroundColor Cyan
node esbuild.js > "$logFile" 2>&1
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
Write-Host "📝 Appending vsce packaging logs to: $logFile" -ForegroundColor Cyan
npx @vscode/vsce package --no-dependencies --no-git-tag-version --out $outputFileName >> "$logFile" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Packaging failed! Could not create debug VSIX."
    exit 1
}

Write-Host "✅ Debug build packaged successfully as $outputFileName!" -ForegroundColor Green

# 3. 로그 사용 방법 안내
Write-Host "📝 Log Configuration:" -ForegroundColor Cyan
Write-Host "  - Logs have been saved to: $logFile" -ForegroundColor Cyan
Write-Host "  - To view logs, run: Get-Content -Path `"$logFile`"" -ForegroundColor Yellow
Write-Host "  - To run VS Code with debug logging, use:" -ForegroundColor Cyan
Write-Host "    code --extensionDevelopmentPath=`"$PSScriptRoot`" >> `"$logFile`" 2>&1" -ForegroundColor Yellow

Write-Host "✅ Debug build and packaging completed successfully!" -ForegroundColor Green
