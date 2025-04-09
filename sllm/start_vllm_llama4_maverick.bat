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
    echo vLLM might fail for gated models like Llama 4. Please ensure the token is in the .env file.
    pause
    exit /b 1
)
echo.
REM --- End Load .env file ---

echo.
echo Starting vLLM server with meta-llama/Llama-4-Maverick-17B-128E-Instruct...
echo Using 2 GPUs (tensor-parallel-size 2)
echo Cache volume mounted to D:\vllm_data (ensure this directory exists!)

REM Environment variables potentially needed for stability, especially in WSL
set VLLM_DISABLE_TORCH_COMPILE=1
set NCCL_P2P_DISABLE=1

docker run -d --name vllm-llama4-maverick --gpus all ^
    --shm-size 16g ^
    -e HUGGING_FACE_HUB_TOKEN=%HF_TOKEN% ^
    -e VLLM_DISABLE_TORCH_COMPILE=1 ^
    -e NCCL_P2P_DISABLE=1 ^
    -p 8000:8000 ^
    -v D:\vllm_data:/root/.cache/huggingface ^
    vllm/vllm-openai:latest ^
    --model meta-llama/Llama-4-Maverick-17B-128E-Instruct ^
    --tensor-parallel-size 2 ^
    --dtype auto 
    REM --trust-remote-code REM Add this line if model loading fails due to remote code execution issues

echo.
echo vLLM server started in detached mode with name 'vllm-llama4-maverick'.
echo Use 'docker logs vllm-llama4-maverick -f' to view logs.
echo Use 'docker stop vllm-llama4-maverick' to stop the server.
pause
