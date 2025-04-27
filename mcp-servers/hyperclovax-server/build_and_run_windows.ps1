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

docker rm -f hyperclovax-mcp


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
$existing = docker ps -q --filter "ancestor=hyperclovax-mcp"
if ($existing) {
    Write-Host "[INFO] Stopping and deleting existing MCP container to prevent port 8000 conflict..."
    docker stop $existing | Out-Null
    docker rm $existing | Out-Null
}

# .env 파일에서 HOST_MODEL_DIR, LOG_DIR 읽기 (run_windows.ps1와 동일하게)
$defaultModelDir = "C:/path/to/your/model"
$defaultLogDir = "./logs"
$envPath = Join-Path (Get-Location).Path ".env"
$HostModelDir = $null
$LogDir = $null
if (Test-Path $envPath) {
    $envLines = Get-Content $envPath
    $hostLine = $envLines | Where-Object { $_ -match "^HOST_MODEL_DIR=" }
    if ($hostLine) {
        $HostModelDir = ($hostLine -replace "^HOST_MODEL_DIR=", "").Trim()
    }
    $logDirLine = $envLines | Where-Object { $_ -match "^LOG_DIR=" }
    if ($logDirLine) {
        $LogDir = ($logDirLine -replace "^LOG_DIR=", "").Trim()
    }
}
if (-not $HostModelDir -or $HostModelDir -eq "") {
    Write-Host "[ERROR] HOST_MODEL_DIR not found in .env. Please set the actual model path in HOST_MODEL_DIR!"
    exit 1
}
if (-not $LogDir -or $LogDir -eq "") {
    $LogDir = $defaultLogDir
}
# Absolute path and slash conversion
if (!(Split-Path $LogDir -IsAbsolute)) {
    $LogDir = Join-Path (Get-Location).Path $LogDir
}
$HostModelDir = $HostModelDir -replace "\\", "/"
$LogDir = $LogDir -replace "\\", "/"

# Build
Write-Host "[INFO] Building Docker image..."
docker build -t hyperclovax-mcp .
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker build failed. Please check the error message."
    exit 1
}

# Run
./run_windows.ps1