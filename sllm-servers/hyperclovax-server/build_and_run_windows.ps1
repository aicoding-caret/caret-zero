# HyperCLOVA X SLLM 서버 Docker 빌드 및 실행 (Windows)
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

# 기존 SLLM 컨테이너 중지 및 삭제 (8000 포트 충돌 방지)
$existing = docker ps -q --filter "ancestor=hyperclovax-server"
if ($existing) {
    Write-Host "[INFO] Stopping and deleting existing SLLM container to prevent port 8000 conflict..."
    docker stop $existing | Out-Null
    docker rm $existing | Out-Null
}

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

# Build
Write-Host "[INFO] Building Docker image..."
docker build -t hyperclovax-server .

# Run
Write-Host "[INFO] Running Docker container via run_windows.ps1..."
$runScript = Join-Path $SCRIPT_DIR "run_windows.ps1"
if (Test-Path $runScript) {
    & $runScript
} else {
    Write-Host "ERROR: run_windows.ps1 not found."
    exit 1
}
