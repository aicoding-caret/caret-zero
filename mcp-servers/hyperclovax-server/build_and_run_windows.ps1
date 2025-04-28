# HyperCLOVA X MCP 서버 Docker 빌드 및 실행 (Windows)
# PowerShell에서 실행하세요.

Write-Host "[INFO] Please make sure Docker Desktop is running! (Start Docker Desktop from the start menu)"
Write-Host "[INFO] If Docker is not installed, please install it from https://www.docker.com/products/docker-desktop/."

# Docker 상태 체크
try {
    docker info | Out-Null
    Write-Host "[OK] Docker is running normally."
} catch {
    Write-Host "[ERROR] Docker daemon is not running or not installed."
    Write-Host "Please run Docker Desktop or install it and try again."
    exit 1
}

docker rm -f hyperclovax-server

# 8000포트 점유 컨테이너 강제 중지 및 삭제
$port8000 = docker ps -a --filter "publish=8000" -q
if ($port8000) {
    Write-Host "[INFO] Forcing shutdown and deletion of container occupying port 8000..."
    foreach ($id in $port8000) {
        docker stop $id | Out-Null
        docker rm $id | Out-Null
    }
}

# 기존 MCP 컨테이너 중지 및 삭제 (8000 포트 충돌 방지)
$existing = docker ps -q --filter "ancestor=hyperclovax-server"
if ($existing) {
    Write-Host "[INFO] Stopping and deleting existing MCP container to prevent port 8000 conflict..."
    docker stop $existing | Out-Null
    docker rm $existing | Out-Null
}

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

# Build
Write-Host "[INFO] Building Docker image..."
docker build -t hyperclovax-server .

# Run
Write-Host "[INFO] Running Docker container..."
docker run -v "${HOST_MODEL_DIR}:${MODEL_PATH}" -v "${HOST_LOG_DIR}:${LOG_DIR}" -p 8000:8000 --env-file .env hyperclovax-server
