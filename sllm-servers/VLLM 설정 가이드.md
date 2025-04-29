# vLLM Windows Docker 설치 및 설정 가이드 (RTX 3090 x2)

이 가이드는 Windows 환경에서 Docker를 사용하여 vLLM을 설치하고, 2개의 NVIDIA RTX 3090 GPU를 활용하여 `Qwen/Qwen2.5-Coder-32B-Instruct` 모델을 실행하는 방법을 안내합니다.

## 1. 사전 요구 사항

-   **Windows 10/11 Pro, Enterprise 또는 Education:** WSL 2 기능이 필요합니다.
-   **Docker Desktop for Windows:** [Docker 공식 웹사이트](https://www.docker.com/products/docker-desktop/)에서 다운로드하여 설치합니다.
    -   **참고:** Windows용 다운로드 옵션 중 **"AMD64"** 를 선택하세요. 이는 CPU 제조사(AMD)가 아닌 64비트 아키텍처(x86-64)를 의미하며, **Intel CPU와 AMD CPU 모두에 해당**하는 표준 버전입니다. (ARM64는 Surface Pro X 등 특수 기기용입니다.)
    -   설치 중 또는 설치 후 **WSL 2 기반 엔진 사용** 옵션이 활성화되어 있는지 확인하세요.
-   **NVIDIA 드라이버:** 최신 NVIDIA 드라이버가 설치되어 있어야 합니다. [NVIDIA 드라이버 다운로드 페이지](https://www.nvidia.com/Download/index.aspx)에서 GPU 모델에 맞는 드라이버를 설치하세요.
-   **WSL 2 및 NVIDIA Container Toolkit:**
    1.  **WSL 2 설치/업데이트:** 관리자 권한으로 PowerShell 또는 명령 프롬프트를 열고 다음 명령어를 실행합니다.
        ```powershell
        wsl --install 
        # 또는 이미 설치된 경우 업데이트
        wsl --update 
        ```
        재부팅이 필요할 수 있습니다.
    2.  **GPU 사용 설정 확인 (NVIDIA Container Toolkit 관련):**
        -   **핵심:** 최신 Windows용 Docker Desktop은 WSL 2 환경에서 NVIDIA GPU를 **자동으로 감지하고 설정**합니다. 따라서 대부분의 경우, 사용자가 **별도로 NVIDIA Container Toolkit을 설치할 필요가 없습니다.**
        -   **확인 사항:** Docker Desktop이 GPU를 사용할 수 있도록 설정되어 있는지 확인해야 합니다.
            1.  Docker Desktop을 실행합니다.
            2.  설정(Settings, 톱니바퀴 아이콘) > `Resources` > `WSL Integration`으로 이동합니다.
            3.  `Enable integration with my default WSL distro` 옵션이 켜져 있는지 확인합니다.
            4.  그 아래 목록에 있는 **사용 중인 WSL 배포판** (예: `docker-desktop` 또는 설치한 Linux 이름) 옆의 **토글 스위치가 켜져 있는지** 확인합니다. (이것이 중요!)
        -   **문제 발생 시:** 만약 TGI 컨테이너 실행 시 GPU 관련 오류가 발생하면, 먼저 Docker Desktop, WSL (`wsl --update`), NVIDIA 드라이버를 최신 버전으로 업데이트하고 Docker Desktop 설정을 다시 확인해 보세요. 그래도 문제가 지속되면 Docker Desktop 재설치를 고려해 볼 수 있습니다.

## 2. vLLM Docker 컨테이너 실행

관리자 권한으로 PowerShell 또는 명령 프롬프트를 열고 다음 명령어를 실행하여 vLLM 컨테이너를 시작합니다. vLLM은 OpenAI 호환 API 서버를 내장하고 있습니다.

```bash
# 사용할 모델 ID (Hugging Face Hub 기준)
export MODEL_ID="Qwen/Qwen2.5-Coder-32B-Instruct" 
# 데이터 볼륨 마운트 경로 (모델 캐시 등 저장) - 필요에 맞게 수정하세요.
# Windows 경로를 Linux 스타일로 변경 (예: D:\vllm_data -> /mnt/d/vllm_data)
# 또는 Docker Desktop 설정에서 직접 마운트 관리
export VOLUME_PATH="/mnt/d/vllm_data" 
# 호스트에서 사용할 포트 (vLLM 기본 OpenAI 호환 포트: 8000)
export HOST_PORT=8000 
# 컨테이너 내부 API 포트
export CONTAINER_PORT=8000

# Docker 실행 명령어 (GPU 2개 사용, Tensor Parallelism)
# vLLM 공식 Docker 이미지 사용 (예: vllm/vllm-openai:latest)
# --runtime=nvidia 제거 (Docker Desktop 최신 버전은 자동 처리)
# --shm-size는 필요에 따라 조절 (PagedAttention 사용 시 중요도 낮아질 수 있음)
docker run --gpus all -p ${HOST_PORT}:${CONTAINER_PORT} \
    -v ${VOLUME_PATH}:/root/.cache/huggingface \
    --env HUGGING_FACE_HUB_TOKEN=${YOUR_HF_TOKEN} \
    vllm/vllm-openai:latest \
    --model ${MODEL_ID} \
    --tensor-parallel-size 2 \
    --port ${CONTAINER_PORT}
    # --gpu-memory-utilization 0.90 # 필요시 GPU 메모리 사용률 제한 (0.0 ~ 1.0)
    # --max-model-len 4096 # 필요시 모델 최대 길이 명시적 지정
    # --trust-remote-code # Qwen 모델 로딩 시 필요할 수 있음
```

**명령어 설명:**

-   `--gpus all`: 사용 가능한 모든 GPU를 컨테이너에 할당합니다.
-   `-p ${HOST_PORT}:${CONTAINER_PORT}`: 호스트의 `8000` 포트를 컨테이너의 `8000` 포트로 매핑합니다. (vLLM OpenAI 호환 기본 포트)
-   `-v ${VOLUME_PATH}:/root/.cache/huggingface`: 모델 캐시 등을 저장할 호스트 경로를 컨테이너 내부의 Hugging Face 캐시 경로로 마운트합니다. `${VOLUME_PATH}`를 실제 원하는 경로로 변경하세요. (예: `/mnt/d/vllm_data`)
-   `--env HUGGING_FACE_HUB_TOKEN=${YOUR_HF_TOKEN}`: Hugging Face Hub 토큰을 환경 변수로 전달합니다. Gated 모델 접근 시 필요합니다. `${YOUR_HF_TOKEN}`을 실제 토큰으로 바꿔주세요.
-   `vllm/vllm-openai:latest`: 사용할 vLLM Docker 이미지입니다. OpenAI 호환 서버가 포함된 이미지입니다.
-   `--model ${MODEL_ID}`: 로드할 Hugging Face 모델 ID를 지정합니다.
-   `--tensor-parallel-size 2`: 사용할 GPU 수를 지정합니다 (Tensor Parallelism). RTX 3090 2개를 사용하므로 `2`로 설정합니다.
-   `--port ${CONTAINER_PORT}`: 컨테이너 내부에서 API 서버가 사용할 포트를 지정합니다.
-   `--gpu-memory-utilization 0.90`: (선택 사항) GPU 메모리 사용률을 제한합니다. 기본값은 0.9 (90%)입니다.
-   `--max-model-len 4096`: (선택 사항) 모델이 처리할 최대 시퀀스 길이를 명시적으로 지정합니다. 모델 기본값을 사용하는 것이 일반적입니다.
-   `--trust-remote-code`: (선택 사항) 일부 모델(특히 Qwen)은 원격 코드 실행을 허용해야 로드될 수 있습니다. 필요시 이 옵션을 추가하세요.

컨테이너가 시작되면 모델 다운로드 및 로딩이 진행됩니다. 로그를 확인하여 "Uvicorn running on http://0.0.0.0:8000" 메시지가 표시되면 vLLM 서버가 준비된 것입니다.

## 3. API 테스트 (OpenAI 호환 엔드포인트)

vLLM은 OpenAI API와 호환되는 엔드포인트를 제공합니다 (`/v1/chat/completions`). `curl`을 사용하여 간단히 테스트할 수 있습니다.

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-Coder-32B-Instruct", 
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "def calculate_fibonacci(n):"}
    ],
    "max_tokens": 100, 
    "stream": false 
  }'
```

**명령어 설명:**

-   `http://localhost:8000/v1/chat/completions`: vLLM의 OpenAI 호환 엔드포인트 주소입니다. `${HOST_PORT}`를 다르게 설정했다면 포트 번호를 맞춰주세요.
-   `-H "Content-Type: application/json"`: 요청 형식을 JSON으로 지정합니다.
-   `-d '{...}'`: 요청 본문(JSON 데이터)입니다.
    -   `"model"`: vLLM 실행 시 지정한 모델 ID를 사용합니다.
    -   `"messages"`: 대화 내용을 OpenAI 형식으로 전달합니다.
    -   `"max_tokens"`: 최대 생성 토큰 수를 제한합니다.
    -   `"stream"`: 스트리밍 응답 여부를 설정합니다.

성공적으로 응답이 오는지 확인합니다.

## 4. 컨텍스트 크기

vLLM은 PagedAttention 기술을 사용하여 이론적으로 모델의 최대 컨텍스트 길이까지 지원합니다. `Qwen/Qwen2.5-Coder-32B-Instruct` 모델의 최대 컨텍스트 길이는 Hugging Face 모델 카드에서 확인하세요. vLLM 실행 시 `--max-model-len` 옵션으로 명시적으로 제한할 수도 있습니다.

## 5. 중지 및 재시작

-   **중지:** vLLM을 실행한 터미널에서 `Ctrl + C`를 누릅니다. Docker 컨테이너가 자동으로 중지됩니다.
-   **재시작:** 위 2번 항목의 `docker run` 명령어를 다시 실행합니다. 마운트된 볼륨에 캐시된 모델이 있다면 더 빠르게 시작될 수 있습니다.

이제 이 가이드에 따라 vLLM을 설치하고 테스트를 진행하실 수 있습니다! 😊
