@echo off

REM --- Load .env file ---
echo Loading Hugging Face token from .env file...
set HF_TOKEN=
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
    if "%%a"=="HUGGING_FACE_HUB_TOKEN" set HF_TOKEN=%%b
)

if defined HF_TOKEN (
    echo Token loaded successfully.
) else (
    echo WARNING: HUGGING_FACE_HUB_TOKEN not found in .env file.
    echo vLLM might fail for gated models.
)
echo.
REM --- End Load .env file ---

REM echo Starting Docker Desktop if not already running...
REM REM Attempt to start Docker Desktop - Adjust path if needed
REM start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

REM echo Waiting 120 seconds for Docker Desktop to initialize (especially for the first run)...
REM timeout /t 120 /nobreak > nul

echo.
echo Starting vLLM server with Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4 (4-bit)...
echo Using 2 GPUs (tensor-parallel-size 2)

REM Environment variables potentially needed for stability, especially in WSL
set VLLM_DISABLE_TORCH_COMPILE=1
set NCCL_P2P_DISABLE=1

docker run --rm -d --name vllm-qwen2.5-4bit --gpus all ^
    --shm-size 16g ^
    -e HUGGING_FACE_HUB_TOKEN=%HF_TOKEN% ^
    -e VLLM_DISABLE_TORCH_COMPILE=1 ^
    -e NCCL_P2P_DISABLE=1 ^
    -p 8000:8000 ^
    -v D:\dev\cline\models:/root/.cache/huggingface ^
    vllm/vllm-openai:v0.5.1 ^
    --model Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4 ^
    --quantization gptq ^
    --tensor-parallel-size 2 ^
    --dtype auto ^
    --trust-remote-code 

echo.
echo vLLM server started in detached mode with name 'vllm-qwen2.5-4bit'.
echo Use 'docker logs vllm-qwen2.5-4bit -f' to view logs.
echo Use 'docker stop vllm-qwen2.5-4bit' to stop the server.
pause
