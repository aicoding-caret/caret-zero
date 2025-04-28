# HyperCLOVA X SLLM Server(Docker)

Caret용 HyperCLOVA X SEED Vision Instruct 3B 모델 MCP 서버입니다.

## 주요 특징
- Docker 기반, Python 3.8+, CUDA 지원
- Hugging Face Transformers 기반 모델 로딩 및 VLM inference
- MCP(Model Context Protocol) 툴 엔드포인트 제공

## MCP (Model Context Protocol) 서버 설명

- 본 서버는 Caret 에이전트와 연동되는 **MCP(Model Context Protocol) 서버**입니다.
- HyperCLOVA X SEED Vision Instruct 3B 모델을 API로 제공하며, Caret 또는 외부 클라이언트에서 HTTP로 접근할 수 있습니다.
- 주요 엔드포인트:
  - `/tool/generate_hyperclovax_vision` : 텍스트+이미지 입력 지원 (VLM)
  - `/tool/generate_hyperclovax_vision_stream` : 스트리밍 응답 지원

### 부동소수점 지원 현황
- **현재 서버는 fp32(float32) 모드만 정상 지원**합니다.
- fp16(float16) 지원은 추후 확인 및 개선이 필요합니다. (모델 및 입력 변환 관련 이슈 있음)

## 운영체제별 빠른 실행 가이드

### Windows (PowerShell)
1. Docker Desktop을 설치 및 실행하세요.
2. PowerShell에서 아래 명령어를 실행하세요:
   ```powershell
   ./build_and_run_windows.ps1
   ```

### Linux (Bash)
1. Docker를 설치하고, 데몬을 실행하세요(`sudo systemctl start docker`).
2. 터미널에서 아래 명령어를 실행하세요:
   ```bash
   bash build_and_run_linux.sh
   ```

- 두 스크립트 모두 .env 파일을 자동으로 활용하며, Docker 미설치/미실행 시 안내 메시지를 출력합니다.

## 환경 변수 예시 (.env)
```
MODEL_PATH=/models/HyperCLOVAX-SEED-Vision-Instruct-3B
DEVICE=cuda
HUGGINGFACE_TOKEN=your_hf_token
HOST_MODEL_DIR=C:/path/to/your/model
```
- HOST_MODEL_DIR: 호스트(PC)에서 실제 모델이 저장된 경로를 지정하세요. (예: D:/ai/models/HyperCLOVAX-SEED-Vision-Instruct-3B)

### 볼륨 매핑 설명
- 소스코드: 현재 디렉토리 → 컨테이너 /app
- 모델: .env의 HOST_MODEL_DIR → 컨테이너 /models/HyperCLOVAX-SEED-Vision-Instruct-3B
- .env에서 HOST_MODEL_DIR을 반드시 지정해 주세요!

## 엔드포인트
- `/tool/generate_hyperclovax_vision` : 텍스트+이미지 입력 지원

## Vision API 사용법

### 1. 엔드포인트 개요
- **POST /tool/generate_hyperclovax_vision**
    - 텍스트 + 이미지 입력 지원
    - `stream` 파라미터로 스트리밍/비스트리밍 모두 지원
- **POST /tool/generate_hyperclovax_vision_stream**
    - 별도의 스트리밍 전용 엔드포인트 (동일 기능)

### 2. 요청 예시
#### (1) 일반 응답 (한 번에 반환)
```
POST /tool/generate_hyperclovax_vision
Content-Type: application/json
{
  "prompt": "이 이미지를 설명해줘.",
  "image_base64": "...base64..."
}
```

#### (2) 스트리밍 응답 (실시간)
```
POST /tool/generate_hyperclovax_vision?stream=true
Content-Type: application/json
{
  "prompt": "이 이미지를 설명해줘.",
  "image_base64": "...base64..."
}
```
- 응답이 토큰 단위로 실시간 스트림으로 반환됨 (text/plain)

#### (3) 별도 스트리밍 엔드포인트
```
POST /tool/generate_hyperclovax_vision_stream
Content-Type: application/json
{
  "prompt": "이 이미지를 설명해줘.",
  "image_base64": "...base64..."
}
```

### 3. 파라미터 설명
- `prompt`: 텍스트 프롬프트 (질문/설명 등)
- `image_base64`: base64 인코딩된 이미지 데이터
- `stream`: (선택) true로 설정 시 스트리밍 모드 활성화

### 4. 응답 예시
- 일반: `{ "result": "..." }`
- 스트리밍: 토큰이 실시간으로 text/plain 스트림으로 전송됨

### 5. 클라이언트 참고
- 스트리밍 응답은 HTTP chunked/text stream, SSE, WebSocket 등으로 수신 가능
- 예시: fetch/axios에서 response.body 사용, Python requests는 지원 안 됨
- Caret 등 실시간 프론트엔드에서 stream 모드 적극 활용 추천

## 실행 및 테스트 배치 스크립트

### 실행 (서버 구동)
- Windows:
  ```powershell
  ./build_and_run_windows.ps1
  ```
- Linux:
  ```bash
  bash build_and_run_linux.sh
  ```

### 테스트 (엔드포인트 호출)
- PowerShell/CMD:
  ```powershell
  python test_call_all_modes.py
  ```
- (테스트 스크립트에서 텍스트/이미지 inference 모두 자동 검증)

## 테스트 코드
- 컨테이너 내부 테스트: `python test_in_container.py`
- 로컬호스트에서 REST API 테스트: `python test_call_localhost.py`
- MCP 툴 프로토콜 테스트: `python test_call_mcp.py`

## 참고
- 최초 실행 시 모델 다운로드 필요 (Hugging Face 계정 필요)
- CUDA 환경 권장, CPU도 동작 가능
