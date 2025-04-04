# 작업 로그: #003 - sLLM 성능 테스트

## 작업 정보
- **작업 번호:** 003
- **작업 명:** sLLM 성능 테스트 (Qwen2.5-Coder & Gemma3)
- **시작일:** 2025-03-27
- **완료일:** 2025-03-28
- **상태:** 완료

## 작업 목적
RTX-3090 2-Way 환경에서 Ollama를 통한 sLLM(small Language Model) 성능 테스트를 수행하여 로컬 환경에서 사용할 최적의 모델을 선정합니다.

## 실험 환경
### 하드웨어
- GPU: NVIDIA RTX-3090 x 2
- VRAM: 24GB x 2

### 테스트 대상 모델
1. Qwen2.5-Coder
   - qwen2.5-coder:14b (9.0 GB)
   - qwen2.5-coder:32b (19 GB)
2. Gemma3
   - gemma3:12b (8.1 GB)
   - gemma3:27b (17 GB)

Note: All models are pre-installed and verified in Ollama. Models will be properly stopped and cleaned up between tests to ensure accurate memory measurements.

### 컨텍스트 윈도우 크기 변수
- 12,800
- 41,200
- 51,200
- 76,800

## 구현된 평가 시스템

### 1. 정량적 평가
- 응답 시간 측정
  * 총 응답 시간
  * 첫 토큰 생성 시간
- GPU 리소스 모니터링
  * 메모리 사용량
  * GPU 활용률
- 각 지표에 대한 통계 분석 및 시각화

### 2. 정성적 평가
- 정확성 (40%)
  * 코드 완성: 피보나치 함수 자동 테스트
  * 디버깅: UserManager 클래스 기능 테스트
  * 코드 리뷰 & 아키텍처 설계: 체크리스트 기반 평가
- 일관성 (20%)
  * 동일 프롬프트 3회 반복 실행
  * 응답의 구조적 일관성 분석
  * AST 기반 코드 구조 비교
- 코드 품질 (20%)
  * 구문 유효성
  * 들여쓰기 일관성
  * 명명 규칙 준수
  * 주석/문서화
  * 복잡도
- 설명 명확성 (20%)
  * 목적 설명
  * 동작 원리 설명
  * 제약사항 설명
  * 예시 포함
  * 구조화된 설명

## 구현된 스크립트
1. **[run_test.py](/experiment/sllm_test/run_test.py)**   
   - 개별 테스트 실행
   - 응답 수집 및 메트릭 측정
   - 정성적 평가 통합

2. **[evaluator.py](/experiment/sllm_test/evaluator.py)**
   - 테스트 케이스 정의
   - 정확성 평가 자동화
   - 코드 품질 분석
   - 설명 명확성 평가

3. **[generate_report.py](/experiment/sllm_test/generate_report.py)**
   - 성능 메트릭 분석
   - 시각화 그래프 생성
   - 종합 보고서 생성

4. **[run_batch_test.ps1](/experiment/sllm_test/run_batch_test.ps1)** (Windows용)
   - 전체 실험 자동화
   - 메모리 관리
   - 로그 기록

## 실행 방법
1. 필요한 패키지 설치:
   ```powershell
   cd experiment/sllm_test
   pip install -r requirements.txt
   ```

2. Ollama 설치 확인:
   ```powershell
   ollama --version
   ```

3. 테스트 실행:
   ```powershell
   .\run_batch_test.ps1
   ```

4. 결과 확인:
  * 실험 결과는 d:/dev/cline/experiment/sllm_test/experiment_results/ 디렉토리에 저장됩니다. 이 디렉토리는 스크립트 실행 시 자동으로 생성되며, 다음과 같은 구조를 가집니다:

      experiment_results/
      ├── batch_test_[timestamp].log        # 실행 로그
      ├── [model]_ctx[size]_[timestamp].json # 개별 테스트 결과
      ├── performance_report_[timestamp].md  # 종합 보고서
      └── *.png                             # 성능 비교 그래프

## 결과
- 성능 테스트가 완료되었으며, 결과 보고서가 생성되었습니다:
  - [performance_report_20250327_203217.md](/experiment/sllm_test/experiment_results/performance_report_20250327_203217.md)
  - [performance_report_20250327_203217.ko.md](/experiment/sllm_test/experiment_results/performance_report_20250327_203217.ko.md)
- 주요 결과: `qwen2.5-coder:14b` 모델이 초기 테스트에서 효율적인 성능을 보였습니다. `qwen2.5-coder:32b` 모델은 최대 메모리 사용 환경(컨텍스트 크기 76,800 토큰, Claude 3.5 API의 약 70.8%)에서 테스트되었으며, TabbyAPI 환경에서 어떤 성능을 보일지 추가 테스트가 필요합니다.

## 다음 단계 (2025-03-28 예정)
1. Ollama의 멀티 GPU 지원 제한 가능성 확인.
2. TabbyAPI 설정 및 테스트 환경 구축.
3. `Qwen2.5:32b` (float16) 모델 성능 테스트 (TabbyAPI 환경).

---
*마지막 업데이트: 2025-03-28 00:08*
