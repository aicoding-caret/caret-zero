#!/bin/bash

# 실행 디렉토리 설정
cd "$(dirname "$0")"

# 필요한 Python 패키지 설치 (openai 추가)
pip install psutil gputil pandas matplotlib seaborn openai tiktoken

# --- Configuration ---
api_type="vllm" # API type: 'ollama' or 'vllm'
api_url="http://localhost:8000" # API base URL (vLLM OpenAI compatible default)
# api_type="ollama"
# api_url="http://localhost:11434"

# !!! 중요: 데이터 볼륨 마운트 경로를 실제 경로로 수정하세요 !!!
# (WSL 경로 형식 사용, 예: /mnt/d/dev/cline/models)
# vLLM은 /root/.cache/huggingface 를 사용합니다.
volume_path="/mnt/d/dev/cline/models" 
host_port=8000 # 호스트에서 사용할 포트 (vLLM 기본값)
container_port=8000 # 컨테이너 내부 포트 (vLLM 기본값)
vllm_image="vllm/vllm-openai:v0.5.1" # Update to a newer stable version (v0.5.1)
container_name="vllm_test_container" # 관리할 컨테이너 이름
health_check_timeout_sec=600 # vLLM 준비 대기 시간 (초)
# shm_size="4g" # vLLM은 PagedAttention으로 shm 중요도 낮음 (필요시 주석 해제)

# !!! 중요: 허깅페이스 Hub 토큰 (Gated 모델 접근 시 필요) !!!
# https://huggingface.co/settings/tokens 에서 read 권한 토큰 생성 후 아래에 붙여넣으세요.
export HUGGING_FACE_HUB_TOKEN="[REDACTED]" # 여기에 실제 토큰을 입력하세요!
# --- End Configuration ---

# 토큰 입력 확인
if [ "$api_type" == "vllm" ] && { [ "$HUGGING_FACE_HUB_TOKEN" == "hf_YOUR_TOKEN_HERE" ] || [ -z "$HUGGING_FACE_HUB_TOKEN" ]; }; then
    echo "경고: Hugging Face Hub 토큰이 설정되지 않았습니다. vLLM 사용 시 Gated 모델 접근에 오류가 발생할 수 있습니다." >&2
fi

# 모델 목록
models=(
  # Ollama examples:
  # "qwen2.5-coder:7b"
  # "qwen2.5-coder:14b"
  # "qwen2.5-coder:32b"
  # "gemma3:12b"
  # "gemma3:27b"
  # vLLM examples:
   "Qwen/Qwen2.5-Coder-32B-Instruct-AWQ" # Try AWQ quantized version with vLLM
  # "Qwen/Qwen2.5-Coder-32B-Instruct" # FP16 seems too large for 2x3090
  # "Qwen/Qwen2.5-14B-Coder-Instruct" 
  # "mistralai/Mistral-7B-Instruct-v0.1" 
)

# 컨텍스트 크기
contexts=(12800 41200 51200 76800)

# 결과 저장 디렉토리
results_dir="experiment_results"
mkdir -p "$results_dir"

timestamp=$(date +%Y%m%d_%H%M%S)

# 로그 파일
log_file="${results_dir}/batch_test_${timestamp}.log"

echo "sLLM 성능 테스트 시작 using API type: $api_type at $api_url: $(date)" | tee -a "$log_file"
echo "----------------------------------------" | tee -a "$log_file"

# 각 모델과 컨텍스트 크기 조합에 대해 테스트 실행
for model in "${models[@]}"; do
    # Create a safe filename (replace slashes and colons)
  safe_model_name=$(echo "$model" | sed 's|[:/]|_|g')

  echo "테스트 시작: $model (API: $api_type)" | tee -a "$log_file"

  # --- vLLM Container Management ---
  if [ "$api_type" == "vllm" ]; then
    # 1. Stop and Remove existing container if it exists
    echo "기존 vLLM 컨테이너 '$container_name' 확인 중..." | tee -a "$log_file"
    existing_container=$(docker ps -a -q --filter "name=$container_name")
    if [ -n "$existing_container" ]; then
      echo "기존 컨테이너 '$container_name' ($existing_container) 중지 중..." | tee -a "$log_file"
      docker stop "$existing_container" > /dev/null
      echo "기존 컨테이너 '$container_name' ($existing_container) 제거 중..." | tee -a "$log_file"
      docker rm "$existing_container" > /dev/null
      echo "정리 후 잠시 대기 중..." | tee -a "$log_file"
      sleep 5
    else
      echo "기존 컨테이너 '$container_name' 없음." | tee -a "$log_file"
    fi

    # 2. Start the new vLLM container
    echo "새 vLLM 컨테이너 '$container_name' 시작 중 (모델: '$model')..." | tee -a "$log_file"
    # Note: Ensure volume_path uses Linux-style paths for WSL/Docker
    docker_command="docker run --gpus all -d --name $container_name \
        -p ${host_port}:${container_port} \
        -v ${volume_path}:/root/.cache/huggingface \
        --shm-size 16g \
        -e HUGGING_FACE_HUB_TOKEN=${HUGGING_FACE_HUB_TOKEN} \
        -e VLLM_DISABLE_TORCH_COMPILE=1 \
        -e NCCL_P2P_DISABLE=1 \
        ${vllm_image} \
        --model \"$model\" \
        --tensor-parallel-size 2 \
        --port ${container_port} \
        --dtype float16 \
        --quantization awq \
        --trust-remote-code" # Often needed for Qwen models
        # --gpu-memory-utilization 0.85 # Remove for now, rely on quantization

    echo "실행 명령어: $docker_command" | tee -a "$log_file"
    eval "$docker_command" > /dev/null
    if [ $? -ne 0 ]; then
        echo "오류: vLLM 컨테이너 시작 실패 ($model). 이 모델 테스트 건너뜀." | tee -a "$log_file"
        continue # Skip to the next model
    fi

    # 3. Health Check Loop (Use standard /health endpoint)
    echo "vLLM 컨테이너 준비 대기 중 (타임아웃: ${health_check_timeout_sec}초)..." | tee -a "$log_file"
    health_check_url="http://localhost:${host_port}/health" # Use standard health endpoint
    start_time=$(date +%s)
    ready=false
    while [ $(( $(date +%s) - start_time )) -lt $health_check_timeout_sec ]; do
        # Check only for 200 status code using curl -f (fail silently on error)
        if curl -s -f "$health_check_url" > /dev/null; then
            echo "vLLM 컨테이너 준비 완료!" | tee -a "$log_file"
            ready=true
            break
        fi
        echo "vLLM 대기 중..." | tee -a "$log_file"
        sleep 10
    done

    if [ "$ready" = false ]; then
        echo "오류: vLLM 컨테이너가 타임아웃 내에 준비되지 않음. 컨테이너 중지 및 테스트 건너뜀 ($model)." | tee -a "$log_file"
        docker stop "$container_name" > /dev/null
        docker rm "$container_name" > /dev/null
        continue # Skip to the next model
    fi
  fi
  # --- End vLLM Container Management ---


  for context in "${contexts[@]}"; do
    echo "테스트 시리즈 시작: $model (API: $api_type, 컨텍스트: $context)" | tee -a "$log_file"

    # 메모리 정리 및 모델 다운로드 (Ollama specific)
    if [ "$api_type" == "ollama" ]; then
      # ... (Ollama cleanup/pull logic remains here) ...
    fi

    # 결과 파일명 (include api_type)
    result_file_initial="${results_dir}/${safe_model_name}_${api_type}_ctx${context}_${timestamp}_initial.json"
    result_file_continuous_base="${results_dir}/${safe_model_name}_${api_type}_ctx${context}_${timestamp}_continuous"

    # 1. 초기 로딩 테스트
    echo "초기 로딩 테스트 실행 중..." | tee -a "$log_file"
    # vLLM uses the base URL for the OpenAI compatible server
    run_test_api_url=$api_url 
    python run_test.py --api-type "$api_type" --api-url "$run_test_api_url" --model "$model" --context "$context" --test-type "initial" > "$result_file_initial" 2>> "$log_file"
    if [ $? -ne 0 ]; then
        echo "오류: 초기 테스트 실패 ($model, 컨텍스트 $context)" | tee -a "$log_file"
        # Optionally skip continuous tests if initial fails
        # continue
    fi

    # 2-4. 연속 응답 테스트 (3회)
    echo "연속 응답 테스트 실행 중..." | tee -a "$log_file"
    for i in {1..3}; do
        echo "연속 테스트 #$i 실행 중..." | tee -a "$log_file"
        result_file_continuous="${result_file_continuous_base}_${i}.json"
        python run_test.py --api-type "$api_type" --api-url "$run_test_api_url" --model "$model" --context "$context" --test-type "continuous" > "$result_file_continuous" 2>> "$log_file"
        if [ $? -ne 0 ]; then
            echo "오류: 연속 테스트 #$i 실패 ($model, 컨텍스트 $context)" | tee -a "$log_file"
        fi
        sleep 2 # 짧은 대기 시간
    done

    # 메모리 정리 (Ollama specific)
    if [ "$api_type" == "ollama" ]; then
      # ... (Ollama cleanup logic remains here) ...
    fi

    echo "테스트 시리즈 완료: $model (API: $api_type, 컨텍스트: $context)" | tee -a "$log_file"
    echo "----------------------------------------" | tee -a "$log_file"
  done # End context loop

  # --- Stop vLLM container after all contexts for the model are tested ---
  if [ "$api_type" == "vllm" ]; then
      echo "vLLM 컨테이너 '$container_name' 중지 중 (모델 '$model' 테스트 후)..." | tee -a "$log_file"
      docker stop "$container_name" > /dev/null
      docker rm "$container_name" > /dev/null
      echo "vLLM 컨테이너 '$container_name' 중지 및 제거 완료." | tee -a "$log_file"
      echo "다음 모델 시작 전 잠시 대기 중..." | tee -a "$log_file"
      sleep 10
  fi
  # --- End vLLM Container Stop ---

done # End model loop

# 최종 보고서 생성
echo "결과 분석 및 보고서 생성 중..." | tee -a "$log_file"
python generate_report.py --results-dir "$results_dir" --timestamp "$timestamp" 2>> "$log_file"

echo "테스트 완료!" | tee -a "$log_file"
echo "결과는 ${results_dir} 디렉토리에서 확인할 수 있습니다." | tee -a "$log_file"
echo "보고서: ${results_dir}/performance_report_${timestamp}.md" | tee -a "$log_file"
