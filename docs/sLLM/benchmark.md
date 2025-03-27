# LLM Benchmark

## 상용 LLM 정보 (참고용)

### 논의/복합 작업용 모델

-   **Claude 3.5 Sonnet:** $3 / 1M input tokens, $15 / 1M output tokens (규칙 개선, 프로젝트 구조 등 복잡한 논의 가능 수준)
-   **Google Gemini 1.5 Flash:** 분당 2회 무료 (API Key 필요)
-   **OpenAI GPT-4o:** $5 / 1M input tokens, $15 / 1M output tokens

### 단발성/간단 작업용 모델

-   **Claude 3 Haiku:** $0.25 / 1M input tokens, $1.25 / 1M output tokens (o3-mini로 언급된 모델 추정)
-   **Google Gemini 1.0 Pro / Flash:** 분당 60회 무료 (API Key 필요, Gemini 2.0 Flash로 언급된 모델 추정)

*참고: 가격 및 무료 티어 정책은 변경될 수 있으므로 공식 문서를 확인하는 것이 좋습니다.*

## 로컬 sLLM 성능 벤치마크

이 섹션에는 로컬에서 테스트한 sLLM (Small Language Models)의 성능 측정 결과를 기록합니다.

**테스트 환경:**

*   (여기에 테스트 환경 정보 기입: 예: CPU, GPU, RAM, Ollama 버전 등)

**측정 지표:**

*   **TTFT (Time To First Token):** 첫 토큰 응답 시간 (초기 로딩 성능 지표)
*   **TPS (Tokens Per Second):** 초당 토큰 생성 속도 (생성 처리량 지표)
*   **모델 로딩 시간:** `ollama_load_duration_sec` (콜드 스타트 시 모델 로딩에 걸린 시간)
*   **GPU 사용률/메모리:** 테스트 중 GPU 자원 사용량

**테스트 결과:**

*   (테스트 완료 후 `performance_report_*.md` 파일 내용을 바탕으로 여기에 결과 테이블 또는 요약 추가)

| 모델 (Model)        | 컨텍스트 (Context) | 테스트 타입 (Type) | TTFT (s) | TPS (Ollama) | 로딩 시간 (s) | GPU 사용률 (%) | GPU 메모리 (MB) |
| :------------------ | :----------------- | :----------------- | :------- | :----------- | :------------ | :------------- | :-------------- |
| qwen2.5-coder_14b | 12800              | initial            | ...      | ...          | ...           | ...            | ...             |
| qwen2.5-coder_14b | 12800              | continuous         | ...      | ...          | ...           | ...            | ...             |
| ...                 | ...                | ...                | ...      | ...          | ...           | ...            | ...             |

## sLLM vs 상용 LLM 비교 고찰

로컬 sLLM의 성능(특히 TTFT와 TPS)을 위의 상용 LLM들과 비교하여 어떤 수준의 작업에 적합할지 판단하는 것이 목표입니다.

*   **목표:** 최소한 Gemini 1.0 Pro/Flash 수준의 응답성 및 처리량을 보여주는 sLLM을 찾는 것.
*   **판단 기준:**
    *   **응답성 (TTFT):** 사용자와의 상호작용에 중요한 지표. 특히 `initial` 테스트의 TTFT (콜드 스타트 포함)가 너무 길지 않아야 함.
    *   **처리량 (TPS):** 긴 코드 생성이나 문서 작업 시 중요한 지표. `continuous` 테스트의 TPS를 통해 판단.
*   **결론:** (벤치마크 결과 분석 후 여기에 결론 추가)
