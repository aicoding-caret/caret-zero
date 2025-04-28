# HyperCLOVA X SLLM 서버 Docker 컨테이너 실행만 (Windows)

# .env에서 MODEL_PATH 읽기
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$envPath = Join-Path $SCRIPT_DIR ".env"
if (Test-Path $envPath) {
    $envLines = Get-Content $envPath
    $modelPathLine = $envLines | Where-Object { $_ -match '^MODEL_PATH=' }
    $modelNameLine = $envLines | Where-Object { $_ -match '^MODEL_NAME=' }
    if ($modelPathLine) {
        $MODEL_PATH = $modelPathLine -replace '^MODEL_PATH=', ''
    } elseif ($modelNameLine) {
        $modelName = $modelNameLine -replace '^MODEL_NAME=', ''
        $MODEL_PATH = Join-Path $SCRIPT_DIR "models\$modelName"
    } else {
        Write-Host "ERROR: MODEL_PATH or MODEL_NAME not found in .env file."
        exit 1
    }
} else {
    Write-Host "ERROR: .env file not found."
    exit 1
}

# 호스트 로그 디렉토리는 무조건 현재 스크립트 기준 logs 폴더로 고정
$HOST_LOG_DIR = Join-Path $SCRIPT_DIR "logs"
$HOST_LOG_DIR = $HOST_LOG_DIR -replace "\\", "/"

# 컨테이너 내부 모델/로그 경로는 절대경로로 고정
if ($modelName) {
    $CONTAINER_MODEL_PATH = "/app/models/$modelName"
} else {
    $CONTAINER_MODEL_PATH = "/app/models/" + ([System.IO.Path]::GetFileName($MODEL_PATH))
}
$CONTAINER_LOG_DIR = "/app/logs"

$HOST_MODEL_DIR = $MODEL_PATH -replace "\\", "/"
Write-Host "[DEBUG] HOST_MODEL_DIR: $HOST_MODEL_DIR"
Write-Host "[DEBUG] MODEL_PATH (container): $CONTAINER_MODEL_PATH"
Write-Host "[DEBUG] HOST_LOG_DIR: $HOST_LOG_DIR"
Write-Host "[DEBUG] LOG_DIR (container): $CONTAINER_LOG_DIR"

$HostSrcDir = (Get-Location).Path
$ContainerSrcDir = "/app"
$ContainerName = "hyperclovax-server"

$dockerCmd = "docker run --name $ContainerName --gpus all --env-file .env --env MODEL_PATH=${CONTAINER_MODEL_PATH} -v ${HostSrcDir}:${ContainerSrcDir} -v ${HOST_MODEL_DIR}:${CONTAINER_MODEL_PATH} -v ${HOST_LOG_DIR}:${CONTAINER_LOG_DIR} -w ${ContainerSrcDir} -p 8000:8000 $ContainerName"
Write-Host "[DEBUG] $dockerCmd"
Invoke-Expression $dockerCmd