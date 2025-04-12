# replace_in_file 도구 테스트 스크립트
# 사용법: .\test-replace-in-file.ps1 -FilePath "대상파일경로" -TestName "테스트이름"

param (
    [Parameter(Mandatory=$true)]
    [string]$FilePath,
    
    [Parameter(Mandatory=$false)]
    [string]$TestName = "replace_in_file-test",
    
    [Parameter(Mandatory=$false)]
    [string]$BackupDir = ""
)

# 백업 디렉토리 설정
if ([string]::IsNullOrEmpty($BackupDir)) {
    $BackupDir = Join-Path $env:TEMP "replace-in-file-tests"
}

# 디렉토리가 없으면 생성
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# 타임스탬프 생성
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$fileName = Split-Path $FilePath -Leaf
$logFile = Join-Path $BackupDir "${TestName}_${timestamp}.log"

# 로그 함수
function Write-Log {
    param (
        [string]$Message,
        [ConsoleColor]$Color = [ConsoleColor]::White
    )
    
    $logTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$logTime] $Message"
    
    # 콘솔 출력
    Write-Host $logEntry -ForegroundColor $Color
    
    # 파일에 저장
    Add-Content -Path $logFile -Value $logEntry -Encoding UTF8
}

# 파일 내용 저장 함수
function Save-FileContent {
    param (
        [string]$SourcePath,
        [string]$DestPath
    )
    
    try {
        if (Test-Path $SourcePath) {
            Copy-Item -Path $SourcePath -Destination $DestPath -Force -ErrorAction Stop
            Write-Log "파일 복사 성공: $SourcePath -> $DestPath" Green
            return $true
        } else {
            Write-Log "파일이 존재하지 않습니다: $SourcePath" Red
            return $false
        }
    } catch {
        Write-Log "파일 복사 실패: $($_.Exception.Message)" Red
        return $false
    }
}

# 파일 메타데이터 가져오기 함수
function Get-FileMetadata {
    param ([string]$Path)
    
    if (Test-Path $Path) {
        $file = Get-Item $Path
        $hash = (Get-FileHash -Path $Path -Algorithm SHA256).Hash
        
        return @{
            Exists = $true
            Size = $file.Length
            LastWriteTime = $file.LastWriteTime
            Hash = $hash
        }
    }
    
    return @{
        Exists = $false
        Size = 0
        LastWriteTime = $null
        Hash = $null
    }
}

# 테스트 시작
Write-Log "===== replace_in_file 도구 테스트 시작: $TestName =====" Cyan
Write-Log "대상 파일: $FilePath" Cyan
Write-Log "로그 파일: $logFile" Cyan

# 파일 존재 여부 확인
if (-not (Test-Path $FilePath)) {
    Write-Log "오류: 대상 파일이 존재하지 않습니다." Red
    exit 1
}

# 원본 파일 메타데이터 가져오기
$originalMetadata = Get-FileMetadata -Path $FilePath
Write-Log "원본 파일 정보:" Yellow
Write-Log "  - 크기: $($originalMetadata.Size) 바이트" Yellow
Write-Log "  - 수정 시간: $($originalMetadata.LastWriteTime)" Yellow
Write-Log "  - SHA256: $($originalMetadata.Hash)" Yellow

# 백업 파일 생성
$backupPath = Join-Path $BackupDir "${fileName}.${timestamp}.original"
if (-not (Save-FileContent -SourcePath $FilePath -DestPath $backupPath)) {
    Write-Log "백업 파일 생성 실패로 테스트를 중단합니다." Red
    exit 2
}

# 모니터링 스크립트 시작 (백그라운드에서 실행)
$monitorLogFile = Join-Path $BackupDir "${TestName}_${timestamp}_monitor.log"
$monitorScript = Join-Path (Split-Path -Parent $PSCommandPath) "monitor-file-changes.ps1"

if (Test-Path $monitorScript) {
    Write-Log "파일 모니터링 시작 (백그라운드)..." Magenta
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$monitorScript`" -FilePath `"$FilePath`" -LogFile `"$monitorLogFile`" -IntervalMs 100 -DurationMinutes 5" -WindowStyle Hidden
} else {
    Write-Log "경고: 모니터링 스크립트를 찾을 수 없습니다: $monitorScript" Yellow
}

# 사용자에게 안내
Write-Log "replace_in_file 도구 사용 준비 완료" Green
Write-Log "이제 windsurf IDE에서 replace_in_file 도구를 사용하여 '$FilePath' 파일을 수정해보세요." Green
Write-Log "작업이 완료되면 엔터 키를 눌러주세요..." Green
$null = Read-Host

# 수정 후 파일 메타데이터 가져오기
$modifiedMetadata = Get-FileMetadata -Path $FilePath
Write-Log "수정 후 파일 정보:" Yellow
Write-Log "  - 크기: $($modifiedMetadata.Size) 바이트" Yellow
Write-Log "  - 수정 시간: $($modifiedMetadata.LastWriteTime)" Yellow
Write-Log "  - SHA256: $($modifiedMetadata.Hash)" Yellow

# 수정 후 백업 파일 생성
$modifiedBackupPath = Join-Path $BackupDir "${fileName}.${timestamp}.modified"
Save-FileContent -SourcePath $FilePath -DestPath $modifiedBackupPath

# 파일 변경 여부 확인
$fileChanged = $originalMetadata.Hash -ne $modifiedMetadata.Hash
if ($fileChanged) {
    $sizeDiff = $modifiedMetadata.Size - $originalMetadata.Size
    $direction = if ($sizeDiff -gt 0) { "증가" } else { "감소" }
    
    Write-Log "파일이 변경되었습니다:" Green
    Write-Log "  - 크기: $($Math.Abs($sizeDiff)) 바이트 $direction ($($originalMetadata.Size) → $($modifiedMetadata.Size))" Green
    Write-Log "  - 해시: 변경됨" Green
    Write-Log "  - 수정 시간: $($originalMetadata.LastWriteTime) → $($modifiedMetadata.LastWriteTime)" Green
    
    # 내용 비교
    Write-Log "변경 내용 비교 시작..." Cyan
    
    try {
        $originalContent = Get-Content -Path $backupPath -Raw
        $modifiedContent = Get-Content -Path $modifiedBackupPath -Raw
        
        if ($originalContent -eq $modifiedContent) {
            Write-Log "경고: 파일 내용은 정확히 동일합니다! (해시 차이만 존재)" Red
        } else {
            # 파일 비교를 위한 임시 파일 생성
            $tempDir = Join-Path $env:TEMP "replace-in-file-diffs"
            if (-not (Test-Path $tempDir)) {
                New-Item -ItemType Directory -Path $tempDir | Out-Null
            }
            
            $beforeFile = Join-Path $tempDir "${fileName}.before.txt"
            $afterFile = Join-Path $tempDir "${fileName}.after.txt"
            
            $originalContent | Set-Content -Path $beforeFile -Encoding UTF8
            $modifiedContent | Set-Content -Path $afterFile -Encoding UTF8
            
            # diff 명령 실행 (내장 명령 또는 설치된 도구 사용)
            $diffCommand = "Compare-Object (Get-Content '$beforeFile') (Get-Content '$afterFile')"
            Write-Log "다음 명령으로 차이점을 확인할 수 있습니다:" Yellow
            Write-Log $diffCommand Yellow
            
            Write-Log "간단한 차이점 요약:" Cyan
            $diff = Compare-Object (Get-Content $beforeFile) (Get-Content $afterFile)
            
            foreach ($line in $diff) {
                $indicator = if ($line.SideIndicator -eq "=>") { "추가됨" } else { "삭제됨" }
                $content = $line.InputObject
                Write-Log "[$indicator] $content" Yellow
            }
        }
    } catch {
        Write-Log "내용 비교 중 오류 발생: $($_.Exception.Message)" Red
    }
} else {
    Write-Log "경고: 파일이 전혀 변경되지 않았습니다! replace_in_file 도구가 작동하지 않았을 수 있습니다." Red
}

# 테스트 결과 요약
Write-Log "===== replace_in_file 도구 테스트 결과 =====" Cyan
Write-Log "테스트 이름: $TestName" Cyan
Write-Log "대상 파일: $FilePath" Cyan
Write-Log "결과: $(if ($fileChanged) { "파일 변경됨 ✓" } else { "파일 변경 없음 ✗" })" $(if ($fileChanged) { "Green" } else { "Red" })
Write-Log "원본 백업: $backupPath" Cyan
Write-Log "수정본 백업: $modifiedBackupPath" Cyan
Write-Log "모니터링 로그: $monitorLogFile" Cyan
Write-Log "테스트 로그: $logFile" Cyan

# Visual Studio Code로 비교 (설치된 경우)
if ($fileChanged) {
    Write-Log "VS Code로 변경 내용을 확인하시겠습니까? (Y/N)" Yellow
    $response = Read-Host
    
    if ($response -eq "Y" -or $response -eq "y") {
        try {
            # VS Code 실행
            Start-Process "code" -ArgumentList "--diff `"$backupPath`" `"$modifiedBackupPath`"" -ErrorAction Stop
            Write-Log "VS Code로 비교 뷰를 열었습니다." Green
        } catch {
            Write-Log "VS Code 실행 실패: $($_.Exception.Message)" Red
        }
    }
}

Write-Log "replace_in_file 도구 테스트 완료!" Cyan
