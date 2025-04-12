# 파일 수정 모니터링 스크립트
# 사용법: .\monitor-file-changes.ps1 -FilePath "대상파일경로" -LogFile "로그파일경로"

param (
    [Parameter(Mandatory=$true)]
    [string]$FilePath,
    
    [Parameter(Mandatory=$false)]
    [string]$LogFile = "",
    
    [Parameter(Mandatory=$false)]
    [int]$IntervalMs = 500,
    
    [Parameter(Mandatory=$false)]
    [int]$DurationMinutes = 30
)

# 로그 파일 경로 설정
if ([string]::IsNullOrEmpty($LogFile)) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $fileName = Split-Path $FilePath -Leaf
    $LogFile = ".\file_monitor_${fileName}_${timestamp}.log"
}

# 타임스탬프와 함께 로그 메시지 기록
function Write-LogMessage {
    param (
        [string]$Message,
        [string]$LogLevel = "INFO",
        [ConsoleColor]$Color = [ConsoleColor]::White
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$LogLevel] $Message"
    
    # 콘솔에 출력
    Write-Host $logEntry -ForegroundColor $Color
    
    # 파일에 로그 저장
    Add-Content -Path $LogFile -Value $logEntry -Encoding UTF8
}

# 파일 내용을 캡처하는 함수
function Get-FileSnapshot {
    param ([string]$Path)
    
    if (Test-Path $Path) {
        $hash = (Get-FileHash -Path $Path -Algorithm SHA256).Hash
        $size = (Get-Item $Path).Length
        $lastWrite = (Get-Item $Path).LastWriteTime
        $content = $null
        
        try {
            $content = Get-Content -Path $Path -Raw -ErrorAction Stop
        }
        catch {
            $content = "[읽기 오류: $($_.Exception.Message)]"
        }
        
        return @{
            Exists = $true
            Hash = $hash
            Size = $size
            LastWriteTime = $lastWrite
            Content = $content
        }
    }
    
    return @{
        Exists = $false
        Hash = $null
        Size = 0
        LastWriteTime = $null
        Content = $null
    }
}

# 모니터링 시작 메시지
Write-LogMessage "파일 모니터링 시작: '$FilePath'" "START" Green
Write-LogMessage "모니터링 간격: ${IntervalMs}ms" "CONFIG" Cyan
Write-LogMessage "모니터링 기간: ${DurationMinutes}분" "CONFIG" Cyan
Write-LogMessage "로그 파일: '$LogFile'" "CONFIG" Cyan

# 초기 파일 상태 확인
if (-not (Test-Path $FilePath)) {
    Write-LogMessage "대상 파일이 존재하지 않습니다: '$FilePath'" "WARNING" Yellow
    Write-LogMessage "파일이 생성될 때까지 대기합니다." "INFO" Yellow
}

# 초기 스냅샷 생성
$previousSnapshot = Get-FileSnapshot -Path $FilePath
if ($previousSnapshot.Exists) {
    Write-LogMessage "초기 파일 상태:" "INFO" White
    Write-LogMessage "  - 크기: $($previousSnapshot.Size) 바이트" "INFO" White
    Write-LogMessage "  - 해시: $($previousSnapshot.Hash)" "INFO" White
    Write-LogMessage "  - 수정 시간: $($previousSnapshot.LastWriteTime)" "INFO" White
}

# 모니터링 종료 시간 계산
$endTime = (Get-Date).AddMinutes($DurationMinutes)
$changeCount = 0

# 파일 모니터링 루프
try {
    while ((Get-Date) -lt $endTime) {
        Start-Sleep -Milliseconds $IntervalMs
        
        # 현재 스냅샷 생성
        $currentSnapshot = Get-FileSnapshot -Path $FilePath
        
        # 파일 존재 여부 변화 감지
        if ($previousSnapshot.Exists -ne $currentSnapshot.Exists) {
            if ($currentSnapshot.Exists) {
                Write-LogMessage "파일이 생성되었습니다!" "CREATED" Green
                Write-LogMessage "  - 크기: $($currentSnapshot.Size) 바이트" "INFO" Green
                Write-LogMessage "  - 해시: $($currentSnapshot.Hash)" "INFO" Green
                Write-LogMessage "  - 수정 시간: $($currentSnapshot.LastWriteTime)" "INFO" Green
            } else {
                Write-LogMessage "파일이 삭제되었습니다!" "DELETED" Red
            }
            $changeCount++
        }
        # 기존 파일 내용 변경 감지
        elseif ($previousSnapshot.Exists -and $currentSnapshot.Exists) {
            $contentChanged = $previousSnapshot.Hash -ne $currentSnapshot.Hash
            $sizeChanged = $previousSnapshot.Size -ne $currentSnapshot.Size
            $timeChanged = $previousSnapshot.LastWriteTime -ne $currentSnapshot.LastWriteTime
            
            if ($contentChanged -or $sizeChanged -or $timeChanged) {
                Write-LogMessage "파일이 변경되었습니다!" "CHANGED" Yellow
                
                if ($sizeChanged) {
                    $sizeDiff = $currentSnapshot.Size - $previousSnapshot.Size
                    $direction = if ($sizeDiff -gt 0) { "증가" } else { "감소" }
                    Write-LogMessage "  - 크기: $($Math.Abs($sizeDiff)) 바이트 $direction ($($previousSnapshot.Size) → $($currentSnapshot.Size))" "CHANGE" Yellow
                }
                
                if ($contentChanged) {
                    Write-LogMessage "  - 해시: $($previousSnapshot.Hash) → $($currentSnapshot.Hash)" "CHANGE" Yellow
                }
                
                if ($timeChanged) {
                    Write-LogMessage "  - 수정 시간: $($previousSnapshot.LastWriteTime) → $($currentSnapshot.LastWriteTime)" "CHANGE" Yellow
                }
                
                # 내용이 변경된 경우 백업 생성
                if ($contentChanged) {
                    $backupDir = Join-Path $env:TEMP "file-monitor-backups"
                    if (-not (Test-Path $backupDir)) {
                        New-Item -ItemType Directory -Path $backupDir | Out-Null
                    }
                    
                    $fileName = Split-Path $FilePath -Leaf
                    $backupTime = Get-Date -Format "yyyyMMdd_HHmmss_fff"
                    $backupPath = Join-Path $backupDir "${fileName}.${backupTime}.bak"
                    
                    try {
                        # 이전 내용 백업
                        $previousSnapshot.Content | Set-Content -Path $backupPath -Encoding UTF8 -ErrorAction Stop
                        Write-LogMessage "  - 이전 버전 백업 생성: '$backupPath'" "BACKUP" Magenta
                    }
                    catch {
                        Write-LogMessage "  - 백업 생성 실패: $($_.Exception.Message)" "ERROR" Red
                    }
                }
                
                $changeCount++
            }
        }
        
        # 스냅샷 업데이트
        $previousSnapshot = $currentSnapshot
    }
}
catch {
    Write-LogMessage "오류 발생: $($_.Exception.Message)" "ERROR" Red
    Write-LogMessage "스택 트레이스: $($_.ScriptStackTrace)" "ERROR" Red
}
finally {
    # 모니터링 종료 메시지
    Write-LogMessage "모니터링 종료됨. 총 $changeCount 개의 변경 감지됨." "END" Cyan
    Write-LogMessage "로그 파일 위치: '$LogFile'" "END" Cyan
}
