# HyperCLOVA X MCP 서버 Docker 컨테이너 실행만 (Windows)

# .env 파일에서 HOST_MODEL_DIR만 읽기
$defaultModelDir = "C:/path/to/your/model"
$HostModelDir = $null
$envPath = Join-Path (Get-Location).Path ".env"
if (Test-Path $envPath) {
    $envLines = Get-Content $envPath
    $hostLine = $envLines | Where-Object { $_ -match "^HOST_MODEL_DIR=" }
    if ($hostLine) {
        $HostModelDir = ($hostLine -replace "^HOST_MODEL_DIR=", "").Trim()
    }
}
Write-Host "[DEBUG] HostModelDir(before replace) = $HostModelDir"
if (-not $HostModelDir -or $HostModelDir -eq "") {
    Write-Host "[ERROR] .env 파일에서 HOST_MODEL_DIR을 찾을 수 없습니다. 반드시 실제 모델 경로를 HOST_MODEL_DIR에 지정해 주세요!"
    Write-Host "예시: HOST_MODEL_DIR=D:/ai/models/HyperCLOVAX-SEED-Vision-Instruct-3B"
    exit 1
}

# 로그 디렉토리 무조건 ./logs로 고정
$LogDir = "./logs"
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
    Write-Host "[INFO] logs 디렉토리가 없어서 새로 생성했습니다: $LogDir"
}

$HostSrcDir = (Get-Location).Path
$ContainerSrcDir = "/app"
$ContainerModelDir = "/models/HyperCLOVAX-SEED-Vision-Instruct-3B"
$ContainerLogDir = "/app/logs"

# 경로를 모두 슬래시(/)로 통일
$HostSrcDir = $HostSrcDir -replace "\\", "/"
$HostModelDir = $HostModelDir -replace "\\", "/"
$LogDir = $LogDir -replace "\\", "/"
Write-Host "[DEBUG] HostSrcDir = $HostSrcDir"
Write-Host "[DEBUG] HostModelDir = $HostModelDir"
Write-Host "[DEBUG] LogDir = $LogDir"

# 컨테이너 이름 고정
$ContainerName = "hyperclovax-mcp"

# 로그 디렉토리 매핑을 항상 /app/logs로 고정
$ContainerLogDir = "/app/logs"

$dockerCmd = "docker run --name $ContainerName --gpus all --env-file .env -v ${HostSrcDir}:${ContainerSrcDir} -v ${HostModelDir}:${ContainerModelDir} -v ${LogDir}:${ContainerLogDir} -w ${ContainerSrcDir} -p 8000:8000 hyperclovax-mcp"
Write-Host "[DEBUG] $dockerCmd"
Invoke-Expression $dockerCmd