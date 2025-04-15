# 태스크 #004: vLLM 설정 및 성능 테스트

**상태:** 완료 ✨

**목표:**

1.  vLLM을 로컬 환경(RTX 3090 x2 활용)에 설치 및 설정합니다.
2.  기존 sLLM 테스트 스크립트(`experiment/sllm_test/`)를 수정하여 vLLM 엔드포인트(OpenAI 호환)를 지원하도록 합니다.
3.  vLLM 환경에서 `Qwen/Qwen2.5-Coder-32B-Instruct` 모델을 사용하여 태스크 #003과 동일한 조건으로 성능 테스트를 수행합니다.
4.  Ollama 환경에서의 테스트 결과와 vLLM 환경에서의 테스트 결과를 비교 분석합니다.

**주요 작업:**

-   [x] vLLM 설치 (Docker 권장) 및 멀티 GPU 설정 확인 (`tensor-parallel-size 2`)
-   [x] vLLM을 통해 `Qwen/Qwen2.5-Coder-32B-Instruct` 모델 로딩 및 API 엔드포인트 확인
-   [x] `experiment/sllm_test/run_test.py` 수정 (vLLM API 타입 및 OpenAI 호환 엔드포인트 처리 확인)
-   [x] `experiment/sllm_test/run_batch_test.ps1` 및 `run_batch_test.sh` 수정 (vLLM Docker 명령어 및 관련 파라미터 반영)
    -   [x] vLLM 환경에서 성능 테스트 실행 (빠른 테스트 진행 중)
        -   [x] `run_test.py`에 `--limit-scenarios`, `--limit-prompts` 옵션 추가
        -   [x] `run_batch_test.ps1` 수정하여 빠른 테스트 (1회 반복, 3개 모델, 제한 옵션 적용) 실행
        -   [x] `AWQ` 모델 빠른 테스트 성공
        -   [x] `GPTQ-Int4` 모델 빠른 테스트 성공 (초기 시도 시 타임아웃 후 `gptq` 옵션 재확인 후 성공)
        -   [ ] `GPTQ-Int8` 모델 빠른 테스트 진행 중 (로딩 시간 소요)
    -   [ ] 결과 분석 및 보고서 작성

**메모리 사용량 관찰 (2025-03-28):**

-   Ollama 환경에서 `qwen2.5-coder:32b` 모델 테스트 시, 작업 관리자 스크린샷 확인 결과:
    -   두 GPU 모두 전용 메모리(VRAM) 사용량이 거의 최대치(예: 23.4GB/24GB, 22.0GB/24GB)에 도달함.
    -   공유 GPU 메모리(시스템 RAM 활용) 사용량이 약 16.6GB/63.9GB로 나타남.
    -   이는 모델 실행에 필요한 메모리가 VRAM 용량을 초과하여 시스템 RAM을 사용하고 있음을 의미하며, 성능 저하의 원인이 될 수 있음.
-   **질문:** 공유 메모리 사용이 속도 저하를 일으키는지? 완전히 줄일 수 있는지? 줄이면 속도가 증가하는지?
    -   **답변:** 공유 메모리 사용은 시스템 RAM 접근으로 인해 VRAM보다 느리므로 속도 저하 발생. 모델 크기 축소, 양자화 강화, 하드웨어 업그레이드 등으로 줄일 수 있으며, 줄이면 속도 향상 기대 가능.
-   vLLM 테스트 시 메모리 사용량 비교 필요.
-   **추가 질문 (48GB VRAM):** RTX 3090 x2 (총 48GB VRAM) 환경에서 4비트 양자화 모델(AWQ, ~14.9GB 가중치)이 왜 공유 메모리까지 사용하는지?
    -   **답변:** 텐서 병렬 처리 오버헤드, 각 GPU의 KV 캐시 할당량, vLLM의 메모리 예약 방식(`gpu_memory_utilization`), AWQ 구현 특성 등으로 인해 개별 GPU(24GB) 한계를 넘어서 시스템 RAM(공유 메모리)을 사용할 수 있음. 48GB 전체가 아닌 개별 GPU의 한계가 중요.
-   향후 GPTQ Int4/Int8 모델과 비교 테스트하여 메모리/성능 차이 확인 예정.

**다음 계획 (2025-03-28 23:30):**

1.  **Ollama 결과 확인:** 중지된 Ollama 테스트의 1회차 결과 파일 (`qwen2.5-coder_32b_ollama_20250328_211339_continuous_1.json`) 내용을 확인하여 테스트 코드 자체의 오류 여부 점검.
2.  **vLLM 빠른 테스트:**
    *   `run_batch_test.ps1` 수정:
        *   `$apiTypesToTest = @("vllm")`
        *   `$repetitionsContinuous = 1`
        *   테스트 모델: `Qwen/Qwen2.5-Coder-32B-Instruct-AWQ`, `Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4`, `Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int8`
        *   `run_test.py` 호출 부분을 수정하여 각 모델별 **첫 시나리오의 첫 프롬프트만** 실행하도록 변경 (예: `--limit-scenarios 1 --limit-prompts 1` 같은 옵션 추가 필요 - `run_test.py` 수정 필요할 수 있음).
        *   리포트 생성(`generate_report.py`) 부분은 유지.
    *   수정된 스크립트 실행하여 전체 파이프라인 (모델 로딩, 1회 테스트, 리포트 생성) 동작 확인.
3.  **vLLM 전체 테스트 (밤샘):**
    *   `run_batch_test.ps1` 수정: 빠른 테스트 시 추가했던 프롬프트 제한 옵션 제거. (반복 1회, 모델 3종은 유지)
    *   밤샘 테스트 실행 준비:
        -   [x] `run_batch_test.ps1` 수정: 테스트 모델을 `AWQ`, `GPTQ-Int4` 2종으로 설정 (`GPTQ-Int8` 제외).
        -   [x] `run_batch_test.ps1` 수정: `$Repetitions = 3` 으로 설정.
        -   [x] `run_batch_test.ps1` 수정: `run_test.py` 호출 시 `--limit-scenarios`, `--limit-prompts` 옵션 제거.
        -   [x] `run_batch_test.ps1` 수정: 스크립트 마지막에 `shutdown /s /t 0` 명령어 추가.
    *   [ ] 수정된 스크립트 실행하여 밤새 전체 테스트 진행.
4.  **결과 분석 및 보고서 작성:** 테스트 완료 후 `generate_report.py` 실행하여 Ollama 1회차 결과와 vLLM 3회차 결과 비교 분석 보고서 생성.

**참고:**

-   vLLM 공식 문서: [https://docs.vllm.ai/en/latest/](https://docs.vllm.ai/en/latest/)
-   vLLM OpenAI 호환 엔드포인트: [https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html](https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html)
-   이전 테스트 태스크: [#003](/docs/work-logs/luke-and-alpha/tasks/003-sllm-performance-test.md)
