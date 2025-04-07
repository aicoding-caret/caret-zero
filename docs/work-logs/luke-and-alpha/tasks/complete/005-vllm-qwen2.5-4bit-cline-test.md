# 작업 005: vLLM Qwen-2.5 4bit 모델 Cline 연동 테스트

**날짜:** 2025년 3월 29일

**담당자:** 루크 마스터, 알파

**관련 보고서:** [작업 004 보고서: Ollama vs vLLM 성능 비교](../reports/004-ollama-vs-vllm-performance-comparison.md)

## 목표

- 로컬 vLLM 서버에 배포된 Qwen-2.5 7B Chat (AWQ 4bit) 모델을 Cline과 연동하여 정상적으로 작동하는지 테스트합니다.
- 기본적인 프롬프트 응답 생성 속도와 품질을 확인합니다.

## 테스트 계획

1.  **vLLM 서버 실행 확인:**
    -   Qwen-2.5 7B Chat (AWQ 4bit) 모델이 vLLM 서버에서 정상적으로 로드되었는지 확인합니다.
    
    -   서버 엔드포인트가 활성화되어 있는지 확인합니다.
2.  **Cline 설정:**
    -   Cline 설정에서 로컬 LLM 공급자로 vLLM을 선택합니다.
    -   vLLM 서버 주소와 모델 이름을 정확히 입력합니다. (예: `Qwen/Qwen2.5-7B-Chat-AWQ`)
3.  **기본 응답 테스트:**
    -   간단한 질문 (예: "안녕하세요?")을 통해 응답이 생성되는지 확인합니다.
    -   응답 생성 속도를 주관적으로 평가합니다.
4.  **코드 생성 테스트:**
    -   간단한 코드 생성 요청 (예: "파이썬으로 피보나치 함수 만들어줘")을 통해 코드 생성 능력을 확인합니다.
5.  **한국어 응답 테스트:**
    -   한국어 질문 (예: "오늘 날씨 어때?")에 대한 응답 품질을 확인합니다.

## Cline 연동 설정 (GPTQ-Int4 모델 기준)

로컬 vLLM 서버(`start_vllm_qwen2.5_4bit.bat` 스크립트 사용)로 실행된 `Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4` 모델을 Cline에서 사용하기 위한 설정입니다. (보고서 004 섹션 12 참고)

1.  **API Provider:** `OpenAI Compatible`
2.  **Base URL:** `http://localhost:8000`
3.  **API Key:** (비워두거나 `NA` 입력)
4.  **Model ID:** `Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4`
5.  **Model Configuration** (펼쳐서 설정):
    *   `Supports Images`, `Supports Computer Use`, `Enable R1 messages format` 체크박스: **모두 해제**
    *   **Context Window Size:** `4096` (스크립트의 `--max-model-len` 값과 동일하게)
    *   **Max Output Tokens:** `-1` (무제한) 또는 `4096`
    *   **Input Price / 1M tokens:** `0`
    *   **Output Price / 1M tokens:** `0`
    *   **Temperature:** `0` 또는 `0.2` (일관된 결과 선호 시)

## 실제 Cline 연동 테스트 결과 (2025-03-29)

-   **테스트 모델:** `Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4` (4bit)
-   **Cline 연동 상태:** **실패**
-   **실패 원인 분석:**
    -   Cline에서 vLLM 서버로 API 요청 시, `400 Bad Request` 오류 발생.
    -   `tcpdump`를 사용하여 컨테이너 내부 네트워크 트래픽 확인 결과, vLLM 서버에서 다음과 같은 오류 메시지 반환:
        ```json
        {"object":"error","message":"This model's maximum context length is 32768 tokens. However, you requested 54692 tokens (21924 in the messages, 32768 in the completion). Please reduce the length of the messages or completion.","type":"BadRequestError","param":null,"code":400}
        ```
    -   **원인:** 요청된 총 토큰 수(54692)가 모델의 최대 컨텍스트 길이(32768)를 초과함.
        -   메시지(시스템 프롬프트 + 사용자 입력) 토큰: 21924
        -   요청된 최대 응답 토큰(`max_tokens`): 32768
    -   Cline이 사용하는 기본 시스템 프롬프트의 크기가 매우 커서 발생하는 문제로 확인됨.

## 결론 및 후속 조치

-   현재 설정된 `Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4` (4bit) 모델은 Cline의 기본 시스템 프롬프트 크기 때문에 **연동이 불가능**합니다.
-   **해결 방안:**
    1.  **Cline 시스템 프롬프트 최적화:** Cline 내부적으로 API 요청 시 전송하는 시스템 프롬프트의 길이를 줄이는 방안 모색 (예: 불필요한 규칙 제거, 요약 등). 또는 컨텍스트 길이 초과 시 자동으로 메시지를 잘라내는(truncate) 로직 적용/개선.
    2.  **`max_tokens` 동적 조절:** API 요청 시, 메시지 길이를 계산하여 `max_tokens` 값을 (모델 최대 컨텍스트 길이 - 메시지 토큰 수) 이하로 동적으로 설정하는 로직 구현.
    3.  **모델 변경:** 더 긴 컨텍스트 길이를 지원하는 다른 모델 사용 검토.
-   보고서 004에 해당 실패 결과 및 분석 내용 업데이트 완료. ([보고서 링크](../reports/ollama-vs-vllm-performance-comparison.md#13-cline-연동-테스트-결과-vllm-qwen-32b-gptq-int4-2025-03-29))
