# HyperCLOVA X MCP 서버 Docker 컨테이너 실행만 (Windows)

# .env에서 MODEL_PATH, LOG_DIR 읽기
$envPath = Join-Path $PSScriptRoot ".env"
$envLines = Get-Content $envPath
$MODEL_PATH = ($envLines | Where-Object { $_ -match '^MODEL_PATH=' }) -replace '^MODEL_PATH=', ''
$LOG_DIR = ($envLines | Where-Object { $_ -match '^LOG_DIR=' }) -replace '^LOG_DIR=', ''

# 현재 경로 기준 절대경로로 변환
$HOST_MODEL_DIR = Join-Path $PSScriptRoot (Split-Path $MODEL_PATH -Leaf)
$HOST_LOG_DIR = Join-Path $PSScriptRoot (Split-Path $LOG_DIR -Leaf)

$HOST_MODEL_DIR = $HOST_MODEL_DIR -replace "\\", "/"
$HOST_LOG_DIR = $HOST_LOG_DIR -replace "\\", "/"
$MODEL_PATH = $MODEL_PATH -replace "\\", "/"
$LOG_DIR = $LOG_DIR -replace "\\", "/"

$HostSrcDir = (Get-Location).Path
$ContainerSrcDir = "/app"

# 컨테이너 이름 고정
$ContainerName = "hyperclovax-server"

# Docker 실행 명령
$dockerCmd = "docker run --name $ContainerName --gpus all --env-file .env -v $HostSrcDir:$ContainerSrcDir -v $HOST_MODEL_DIR:$MODEL_PATH -v $HOST_LOG_DIR:$LOG_DIR -w $ContainerSrcDir -p 8000:8000 $ContainerName"
Write-Host "[DEBUG] $dockerCmd"
Invoke-Expression $dockerCmd