# 파일 수정 검증 스크립트
# 사용법: .\verify-file-changes.ps1 -FilePath "대상파일경로" -Operation "수행작업설명"

param (
    [Parameter(Mandatory=$true)]
    [string]$FilePath,
    
    [Parameter(Mandatory=$false)]
    [string]$Operation = "File modification"
)

# 함수: 파일 해시 계산
function Get-FileHash256 {
    param ([string]$Path)
    if (Test-Path $Path) {
        return (Get-FileHash -Path $Path -Algorithm SHA256).Hash
    }
    return $null
}

# 현재 시간 기록
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "[$timestamp] 파일 수정 검증 시작: $Operation" -ForegroundColor Cyan

# 초기 파일 상태 확인
if (-not (Test-Path $FilePath)) {
    Write-Host "[$timestamp] 오류: 파일이 존재하지 않습니다: $FilePath" -ForegroundColor Red
    exit 1
}

# 초기 파일 해시 계산
$initialHash = Get-FileHash256 -Path $FilePath
$initialSize = (Get-Item $FilePath).Length
$initialLastWriteTime = (Get-Item $FilePath).LastWriteTime

Write-Host "[$timestamp] 초기 파일 정보:" -ForegroundColor Yellow
Write-Host "  - 경로: $FilePath"
Write-Host "  - 크기: $initialSize 바이트"
Write-Host "  - 마지막 수정 시간: $initialLastWriteTime"
Write-Host "  - SHA256: $initialHash"

Write-Host "[$timestamp] 작업('$Operation')을 수행하세요. 완료 후 아무 키나 눌러주세요..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# 작업 후 파일 상태 확인
if (-not (Test-Path $FilePath)) {
    Write-Host "[$timestamp] 경고: 작업 후 파일이 삭제되었습니다!" -ForegroundColor Red
    exit 2
}

# 작업 후 파일 해시 계산
$afterHash = Get-FileHash256 -Path $FilePath
$afterSize = (Get-Item $FilePath).Length
$afterLastWriteTime = (Get-Item $FilePath).LastWriteTime

Write-Host "[$timestamp] 작업 후 파일 정보:" -ForegroundColor Yellow
Write-Host "  - 크기: $afterSize 바이트"
Write-Host "  - 마지막 수정 시간: $afterLastWriteTime"
Write-Host "  - SHA256: $afterHash"

# 변경 사항 비교
$changed = $false
$changes = @()

if ($initialHash -ne $afterHash) {
    $changed = $true
    $changes += "파일 내용이 변경되었습니다 (해시 변경)"
}

if ($initialSize -ne $afterSize) {
    $changed = $true
    $sizeDiff = $afterSize - $initialSize
    $direction = if ($sizeDiff -gt 0) { "증가" } else { "감소" }
    $changes += "파일 크기가 $($Math.Abs($sizeDiff)) 바이트 $direction했습니다"
}

if ($initialLastWriteTime -ne $afterLastWriteTime) {
    $changed = $true
    $timeDiff = $afterLastWriteTime - $initialLastWriteTime
    $changes += "마지막 수정 시간이 변경되었습니다 (${timeDiff})"
}

# 결과 출력
$resultTimestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
if ($changed) {
    Write-Host "[$resultTimestamp] 파일이 변경되었습니다:" -ForegroundColor Green
    foreach ($change in $changes) {
        Write-Host "  - $change" -ForegroundColor Green
    }
} else {
    Write-Host "[$resultTimestamp] 파일이 변경되지 않았습니다!" -ForegroundColor Red
    Write-Host "  - 모든 파일 특성(해시, 크기, 수정시간)이 동일합니다." -ForegroundColor Red
}

# 자세한 내용 비교를 위한 템프 파일 생성 (내용이 변경된 경우)
if ($initialHash -ne $afterHash) {
    $tempDir = Join-Path $env:TEMP "file-verify"
    if (-not (Test-Path $tempDir)) {
        New-Item -ItemType Directory -Path $tempDir | Out-Null
    }
    
    $fileName = Split-Path $FilePath -Leaf
    $beforeCopy = Join-Path $tempDir "${fileName}.before"
    $afterCopy = Join-Path $tempDir "${fileName}.after"
    
    Copy-Item -Path $FilePath -Destination $afterCopy -Force
    
    Write-Host "[$resultTimestamp] 파일 비교를 위한 복사본이 생성되었습니다:" -ForegroundColor Cyan
    Write-Host "  - 작업 전 파일: $beforeCopy"
    Write-Host "  - 작업 후 파일: $afterCopy"
    Write-Host "  - 다음 명령으로 비교할 수 있습니다: Compare-Object (Get-Content '$beforeCopy') (Get-Content '$afterCopy')"
}

Write-Host "[$resultTimestamp] 파일 수정 검증 완료" -ForegroundColor Cyan
