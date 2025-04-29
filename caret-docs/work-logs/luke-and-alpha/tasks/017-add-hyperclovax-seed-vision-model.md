# Task 002: Add HyperCLOVA X SEED Vision Instruct 3B Model

## 개요
Hugging Face의 `naver-hyperclovax/HyperCLOVAX-SEED-Vision-Instruct-3B` 모델을 Caret에서 사용할 수 있도록 지원을 추가합니다.

## 관련 링크
- 모델 정보: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Vision-Instruct-3B
- hyperclova 공식 Python 예제 코드: sllm\hyperclovax_sample.py

## 작업 상태
- [x] 모델 연동 방식 조사 (API, 로컬 실행 등) - 로컬 실행 (Python + Transformers) 방식으로 결정
- [x] 관련 코드 위치 파악 (`src/api/providers/`, `src/shared/api.ts`, `src/api/index.ts`)
- [x] 모델 설정 추가 (`src/shared/api.ts`, `src/shared/models/hyperclovax-local.json`)
- [x] API Provider 기본 구현 (`src/api/providers/hyperclovax-local.ts`, `src/api/index.ts`에 핸들러 등록)
- [x] Python 스크립트 구현 (`scripts/run_hyperclovax.py`) - 모델 로딩, 입출력 처리, 스트리밍 (초기 구현 완료, 스트리밍은 미구현)
- [x] API Provider 상세 구현 (`hyperclovax-local.ts`) - Python 스크립트 호출 및 데이터 변환 로직 구체화 (초기 구현 완료)
- [x] 지원 모델 목록 업데이트 (`caret-docs/supported-models.md`, `caret-docs/supported-models.ko.md`)
- [x] 모델 다운로드 스크립트 구현 (`sllm\hyperclovax_download.ps1`)
- [x] Python 환경 설정 구현 (`sllm\hyperclovax_setup_env.ps1`)
    * sllm\hyperclova사전설치_가이드.md 업데이트. 스크립트로 안되는경우 보강
- [x] 테스트 (단위 테스트, 통합 테스트) - 테스트 파일 생성 (`sllm\hyperclovax_test_interface.ps1`), 테스트 실행
    * 테스트 이미지 : caret-docs\caret_feature.png (텍스트, 아이콘 포함)
    * 테스트 사진 : assets\imgs\main_banner.webp (사진)
- [x] **Docker 환경에서 MCP 서버 기동 및 REST/MCP 프로토콜 테스트 완전 통과**
- [x] **Caret에서 MCP 서버와 실전 연동 및 실제 사용 시나리오 검증**
- [x] **테스트 결과 및 문제점/개선점 문서화**
    * 테스트 보고서 (`caret-docs\reports\하이퍼클로바-sLLM-Caret적용을위한테스트보고서.md`)

## 참고사항
- Vision 모델이므로 이미지/비디오 입력 처리 방식 고려 필요 (Python 스크립트 및 TypeScript 핸들러 양쪽에서 처리 필요)
- Python 스크립트는 TypeScript에서 `child_process.spawn`으로 실행 예정
- 모델 컨텍스트 길이는 16k (정보 출처: 사용자 제공 문서)
- `src/shared/models`, `src/shared/providers` 디렉토리에 리팩토링 중 생성된 JSON 파일 존재 확인 및 신규 모델 정보 추가 (`hyperclovax-local.json`)

## 진행 상황 (2025-04-27)
- 작업 목표 확인: `naver-hyperclovax/HyperCLOVAX-SEED-Vision-Instruct-3B` 모델 추가
- 연동 방식 결정: 사용자 제공 Python 예제 코드 및 모델 정보 확인 결과, 로컬에서 `transformers` 라이브러리를 사용하여 Python 스크립트로 모델을 실행하고, TypeScript 백엔드에서 이 스크립트를 자식 프로세스로 호출하는 방식으로 결정.
- 모델 정보 업데이트 (`src/shared/api.ts`):
    - `ApiProvider`에 `hyperclovax-local` 추가.
    - `ApiHandlerOptions`에 `hyperclovaxModelPath`, `hyperclovaxDevice` 추가.
    - `hyperClovaXLocalModels` 객체 정의 (컨텍스트 16k, 이미지/비디오 지원 등).
- 리팩토링 흔적 반영:
    - `src/shared/models/hyperclovax-local.json` 파일 생성 및 모델 정보 추가.
    - `src/shared/providers/hyperclovax-local.json` 파일 생성 (빈 객체).
- API Provider 기본 구현:
    - `src/api/providers/hyperclovax-local.ts` 파일 생성 (기본 구조 및 Python 스크립트 호출 로직 포함).
    - 타입 오류 수정 (`ApiHandler` 인터페이스 사용, `createMessage` 시그니처 및 반환 타입 수정).
    - `src/api/index.ts`의 `buildApiHandler` 함수에 `HyperClovaXLocalHandler` 등록.
- Python 스크립트 구현 (`scripts/run_hyperclovax.py`):
    - `transformers` 라이브러리를 사용하여 모델 로딩, 인자 파싱, JSON 입출력 처리 기본 로직 구현.
    - 이미지 입력(base64) 처리 로직 추가.
    - 오류 처리 및 로깅(stderr) 추가.
- API Provider 상세 구현 (`src/api/providers/hyperclovax-local.ts`):
    - Python 스크립트(`run_hyperclovax.py`)를 `spawn`으로 호출하는 로직 구현.
    - 스크립트에 필요한 인자(model_path, device) 전달 및 입력(prompt, image_base64) JSON 생성 로직 구현.
    - 스크립트의 stdout(JSON 응답) 및 stderr 처리, 종료 코드 확인 로직 구현.
    - `ApiStreamChunk` 타입 정의 (`src/shared/api.ts`) 및 관련 타입 오류 수정.
- 지원 모델 목록 업데이트:
    - `caret-docs/supported-models.md` 및 `caret-docs/supported-models.ko.md`에 HyperCLOVA X Local 제공자 및 모델 추가.
- 테스트 파일 생성:
    - `src/test/api/hyperclovax-local.test.ts` 파일 생성 및 기본 테스트 케이스 (생성자, 모델 목록, 기본 메시지 생성, 오류 처리) 추가.
    - `child_process.spawn` 모킹 및 초기 타입 오류 수정.
- 다음 단계: 단위 테스트 보강 (이미지 처리, 중단 신호 등) 및 통합 테스트 수행.

## 진행 상황 (2025-04-27) - 연동 방식 변경 및 MCP 서버 구현 계획
- **연동 방식 재검토:** 기존의 "요청 시 스크립트 실행" 방식은 매번 모델 로딩으로 인한 성능 저하가 예상되어, 모델을 미리 로딩하는 방식으로 변경하기로 결정.
- **구현 방식 논의:** Caret 내 프로세스 유지, 별도 HTTP API 서버, MCP 서버 방식 등 다양한 옵션 검토.
- **MCP 서버 방식 채택:** 모델을 미리 로딩하고 Caret 툴 시스템과 자연스럽게 통합하기 위해 MCP 서버 방식으로 구현하기로 최종 결정.
    - Caret(클라이언트)가 MCP 서버(HyperCLOVA X 모델 호스팅 및 '툴' 제공)의 툴을 호출하는 구조.
- **프로젝트 구조 결정:** 로드맵 및 현재 개발 단계를 고려하여, MCP 서버를 별도 프로젝트로 분리하지 않고 우선 `caret-zero` 프로젝트 내 `mcp-servers/hyperclovax-server` 디렉토리에 구현하기로 결정 (추후 분리 가능).
- **기본 동작 확인:** 샘플 코드(`hyperclovax_sample.py`) 기반 테스트 스크립트(`hyperclovax_sample_test.py`)를 수정하여 모델 로딩 및 기본적인 VLM 기능(로컬 이미지 설명)이 정상 동작함을 확인함.
- **다음 단계 (MCP 서버 구현):**
    1. `mcp-servers/hyperclovax-server` 디렉토리 생성.
    2. 해당 디렉토리에 파이썬 MCP 서버 프로젝트 생성 (`@modelcontextprotocol/create-server` 사용).
    3. 성공한 샘플 테스트 코드(`hyperclovax_sample_test.py`) 기반으로 MCP 서버 기본 구현 (모델 로딩, `generate_hyperclovax_vision` 툴 정의).
    4. MCP 서버 실행 스크립트 생성.
    5. Caret 설정 파일에 MCP 서버 등록.

## MCP 서버 Docker화 및 테스트 자동화 (2025-04-27)

- 기존 sllm 환경설정/테스트 스크립트(`hyperclovax_setup_env.ps1`, `hyperclovax_test_interface.ps1`) 및 설치 가이드(`hyperclova사전설치_가이드.md`)의 패키지/환경 요구사항을 모두 반영하여 Dockerfile 및 requirements.txt를 보강함.
- Docker 컨테이너 내부에서 직접 모델 로딩 및 추론을 테스트하는 [test_in_container.py]를 추가.
- 로컬호스트에서 Docker MCP 서버에 HTTP로 요청을 보내는 [test_call_localhost.py] 추가.
- MCP 툴 프로토콜을 사용하는 클라이언트(예: Caret)에서 MCP 서버 엔드포인트를 호출하는 [test_call_mcp.py] 추가.
- requirements.txt에 torch, transformers, pillow, opencv-python, timm, einops, av, requests 등 모든 주요 의존성 반영.
- Dockerfile에서 pip install이 실패하지 않도록 최신 패키지 설치 및 CUDA/CPU 자동 감지 환경 적용.
- README 및 .env.example에 환경 변수, 실행법, 테스트법 추가.
- MCP 서버가 정상적으로 동작하는지 자동/반자동 테스트가 가능하도록 설계함.

### 테스트 방법 요약
1. 모델 다운로드 및 MODEL_PATH 지정
2. 도커 빌드 및 실행
3. 컨테이너 내부에서 `python test_in_container.py`로 직접 테스트
4. 호스트에서 `python test_call_localhost.py`로 REST API 테스트
5. MCP 프로토콜 클라이언트에서 `python test_call_mcp.py`로 MCP 툴 테스트

### 다음 단계
- MCP 서버가 Caret에서 정상적으로 연동되는지 확인 및 문서화 진행 예정

## [추가 필요] Caret Vision 모델 완전 연동 체크리스트 (2025-04-28)

### 1. UI (webview-ui)
- [ ] Vision inference(이미지+텍스트) 입력 UI 구현 (이미지 업로드, 프롬프트 입력, 결과 표시)
- [ ] MCP Vision 서버 연결상태 및 오류 안내 UI 추가
- [ ] Vision inference 요청/응답이 실제로 동작하는지 end-to-end 테스트

### 2. Core Extension 연동
- [ ] src/extension.ts, src/core/webview/CaretProvider.ts 등에서 vision tool/모드 등록 및 메시지 포맷(content: [텍스트, 이미지], system role 포함 등) 일치화
- [ ] MCP 서버 엔드포인트 주소, 모델 ID 등 환경설정이 일관성 있게 반영되는지 확인
- [ ] 상태 동기화, 에러 핸들링, 메시지 구조 테스트

### 3. 문서화/가이드
- [ ] 본 문서에 UI 연동, 설정법, 실사용 예시, 문제해결법 등 구체적으로 보강
- [ ] README 및 사용법 안내에 HyperClovaX Vision 전용 내용 추가

### 4. 테스트/자동화
- [ ] UI→서버→응답까지 실제 Caret UI에서 vision inference가 동작하는지 최종 E2E 테스트
- [ ] 테스트 결과/문제점/개선점 문서화

---

> 위 체크리스트를 기반으로 Vision 모델의 실전 연동, UI/핸들러/문서 등 빠짐없이 보강할 예정입니다. (Alpha 자동 정리)

## 통합 테스트 (수동 설정)

통합 테스트를 위해서는 다음 단계를 수동으로 진행해야 합니다.

1. **필수 조건**:
    * Python 3.8 이상 설치
    * `transformers` 라이브러리 설치 (`pip install transformers`)
    * `huggingface_hub` 라이브러리 설치 (`pip install huggingface_hub`)
    * `huggingface-cli` 도구 설치 및 Hugging Face 계정으로 로그인 (`huggingface-cli login`)
2. **모델 다운로드**:
    * `huggingface-cli download naver-hyperclovax/HyperCLOVAX-SEED-Vision-Instruct-3B --local-dir <다운로드_경로>` 명령을 사용하여 모델 다운로드
    * `<다운로드_경로>`는 모델을 저장할 로컬 디렉토리 경로로, 예를 들어 `$HOME/models/HyperCLOVAX-SEED-Vision-Instruct-3B`와 같이 지정할 수 있습니다.
3. **환경 변수 설정**:
    * `CARET_HYPERCLOVAX_MODEL_PATH` 환경 변수를 다운로드한 모델의 경로로 설정합니다. 예를 들어, `$HOME/models/HyperCLOVAX-SEED-Vision-Instruct-3B`로 설정합니다.
    * `CARET_HYPERCLOVAX_DEVICE` 환경 변수를 모델 실행에 사용할 장치로 설정합니다. `cuda` 또는 `cpu`를 선택할 수 있습니다.
4. **Caret 설정**:
    * Caret 설정에서 `HyperCLOVA X Local` 제공자를 선택하고, 모델 ID를 `naver-hyperclovax/HyperCLOVAX-SEED-Vision-Instruct-3B`로 설정합니다.
    * API 키는 필요하지 않습니다.

---

### [2025-04-27] HyperCLOVA X SEED Vision MCP 서버 Docker화 및 실전 연동 진행 상황 (Alpha 기록)

#### 1. MCP 서버 코드 개선 및 로깅 체계 구축
- FastAPI 서버에서 generate_vision 엔드포인트 입력/출력/에러를 모두 날짜별 로그 파일로 저장하도록 개선
    - .env의 LOGGING, LOG_DIR 환경변수 지원 (없으면 기본값)
    - logs 폴더가 없으면 자동 생성, 파일명은 `<디렉토리명>-YYYY-MM-DD.log` 형식
    - 입력은 prompt/메시지구조, 출력 결과, 에러 메시지까지 모두 기록
- 도커 컨테이너 실행 시 로그 폴더가 호스트와 1:1 볼륨 맵핑되도록 run_windows.ps1 개선
    - .env에서 LOG_DIR을 읽어 -v <호스트 logs>:<컨테이너 /app/logs>로 자동 연결
    - 경로 자동 변환 및 기본값 처리, 디버깅 메시지 추가

#### 2. 모델 로딩 오류 해결
- transformers의 from_pretrained 호출 시 `trust_remote_code=True` 옵션 누락으로 인한 ValueError 발생
    - server.py에서 processor/model 모두 trust_remote_code=True 명시적으로 추가하여 해결

#### 3. 테스트 및 자동화
- Docker 빌드/실행 스크립트에서 모델, 코드, 로그 모두 올바르게 볼륨 맵핑되는지 확인
- 서버 기동 후 컨테이너 내부/외부에서 REST API 및 MCP 프로토콜 테스트 스크립트로 정상 동작 확인 예정

#### 4. 다음 작업 예정
- run_linux.sh에도 동일한 LOG_DIR 볼륨 맵핑 로직 적용 필요
- Caret 연동 실전 테스트 및 문서화
- 추가 로깅 포맷/옵션, 장애 상황 자동 알림 등 고도화 아이디어 논의

---

> 이 기록은 Alpha가 자동으로 정리한 최신 진행상황입니다. 다음 작업 시 이어서 참고해 주세요. ｡•ᴗ•｡☕✨

---

#### ⚠️ 현재 Caret 연동 테스트 중 발생한 에러 (2025-04-28)
- HyperCLOVA X Vision provider 설정 후 메시지 전송 시 아래와 같은 에러 발생:
    - `Error: HyperCLOVA X model path (hyperclovaxModelPath) is not configured.`
    - extension backend 로그 및 스택트레이스:
      ```
      Error: HyperCLOVA X model path (hyperclovaxModelPath) is not configured.
          at new HyperClovaXLocalHandler (src/api/providers/hyperclovax-local.ts:23:10)
          at buildApiHandler (src/api/index.ts:92:11)
          at new Task2 (src/core/extension/index.ts:187:15)
          at Controller.initCaretWithTask (src/core/controller/index.ts:242:15)
          at Controller.handleWebviewMessage (src/core/controller/index.ts:798:5)
      ```
    - 웹뷰/콘솔에도 동일한 오류 메시지 노출됨
- 원인 추정: 설정 UI에서 입력한 모델 경로가 extension backend에 제대로 반영되지 않음 (값이 undefined로 전달)
- 대응: 내일(2025-04-29) 추가 디버깅 및 수정 예정

> Alpha 자동 기록: 에러 상황과 로그를 남깁니다. 내일 이어서 대응할 것! ｡•ᴗ•｡☕✨
