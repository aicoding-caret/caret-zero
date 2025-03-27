#!/bin/bash

# 실행 디렉토리 설정
cd "$(dirname "$0")"

# 필요한 Python 패키지 설치
pip install psutil gputil pandas matplotlib seaborn

# 모델 목록
models=(
  "qwen2.5-coder-7b"
  "qwen2.5-coder-14b"
  "qwen2.5-coder-32b"
  "gemma3-12b"
  "gemma3-27b"
)

# 컨텍스트 크기
contexts=(12800 41200 51200 76800)

# 결과 저장 디렉토리
results_dir="experiment_results"
mkdir -p "$results_dir"

# 타임스탬프
timestamp=$(date +%Y%m%d_%H%M%S)

# 로그 파일
log_file="${results_dir}/batch_test_${timestamp}.log"

echo "sLLM 성능 테스트 시작: $(date)" | tee -a "$log_file"
echo "----------------------------------------" | tee -a "$log_file"

# 각 모델과 컨텍스트 크기 조합에 대해 테스트 실행
for model in "${models[@]}"; do
  for context in "${contexts[@]}"; do
    echo "테스트 시작: $model (컨텍스트: $context)" | tee -a "$log_file"
    
    # 메모리 정리
    echo "이전 모델 제거 중..." | tee -a "$log_file"
    ollama rm $model 2>> "$log_file"
    sleep 10
    
    # 모델 다운로드
    echo "모델 다운로드 중..." | tee -a "$log_file"
    ollama pull $model 2>> "$log_file"
    
    # 결과 파일명
    result_file="${results_dir}/${model}_ctx${context}_${timestamp}.json"
    
    # 테스트 실행 및 결과 저장
    echo "테스트 실행 중..." | tee -a "$log_file"
    python run_test.py --model $model --context $context > "$result_file" 2>> "$log_file"
    
    # 메모리 정리
    echo "메모리 정리 중..." | tee -a "$log_file"
    ollama rm $model 2>> "$log_file"
    sleep 10
    
    echo "테스트 완료: $model (컨텍스트: $context)" | tee -a "$log_file"
    echo "----------------------------------------" | tee -a "$log_file"
  done
done

# 최종 보고서 생성
echo "결과 분석 및 보고서 생성 중..." | tee -a "$log_file"
python generate_report.py --results-dir "$results_dir" --timestamp "$timestamp" 2>> "$log_file"

echo "테스트 완료!" | tee -a "$log_file"
echo "결과는 ${results_dir} 디렉토리에서 확인할 수 있습니다." | tee -a "$log_file"
echo "보고서: ${results_dir}/performance_report_${timestamp}.md" | tee -a "$log_file"
