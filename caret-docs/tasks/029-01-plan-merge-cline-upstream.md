# Task 029: Cline Upstream 변경 사항 병합 - 계획

**날짜:** 2024-05-18
**목표:** `@cline-upstream-merging-guide.md` 에 따라 `cline-upstream` 저장소의 변경 사항을 현재 프로젝트에 병합합니다.

## 1. 사전 분석 (Preparation & Analysis)

- [x] `cline-upstream/CHANGELOG.md` 변경 사항 파악 (v3.10.1 이후 ~ v3.16.1 최신 버전 분석 완료)
    - **주요 변경 사항 요약 (v3.10.1 이후 ~ v3.16.1):**
        -   **신규 주요 기능:** 워크플로우 시스템, 작업 타임라인 시각화, 과거 메시지 편집 (작업 공간 복원 포함), 규칙 관리 UI 개선 (팝오버, `/newrule`), 다수 신규 API Provider 및 기존 Provider 대폭 개선 (Fireworks, Gemini, Vertex, OpenAI, Azure DeepSeek, xAI Grok 등), 자동 승인 기능 강화, VSCode 고급 설정 웹뷰 이전.
        -   **주요 개선 사항:** 다양한 UI/UX 개선 (접이식 작업 목록, 새 사용자 안내, 복사 버튼, 드래그앤드롭, 체크포인트 UI 개편 등), 성능/안정성 향상 (메모리 누수, 속도제한 처리, PowerShell 타임아웃, 대용량 스트리밍/웹뷰 안정화), 터미널 기능 강화 (Ctrl+C, 타임아웃), 캐싱 전략 고도화.
        -   **기타 중요 변경:** 신규 모델 다수 지원, LaTeX 렌더링, `.clineignore` 개선, Protobuf 마이그레이션 일부.
- [ ] 병합 대상 파일 목록 추리기 (위 분석 기반 잠정 목록)
    -   `package.json`
    -   `src/core/task/index.ts` (및 관련 핵심 로직 파일)
    -   `src/api/providers/` (폴더 전체)
    -   `webview-ui/` (폴더 전체, 대규모 변경 예상)
    -   `src/services/` (폴더 전체, 설정 및 신규 서비스)
    -   `src/integrations/` (체크포인트, 터미널 등)
    -   `src/core/prompts/` (및 `clinerules`, `cursorrules`, `windsurfrules` 관련)
    -   `src/shared/` (공유 타입 정의)
    -   기타 설정 파일 (`.eslintrc.json`, `tsconfig.json` 등)
- [X] `cline-upstream` 변경 파일 목록 정확히 파악 (`git diff --name-only v3.10.1 v3.16.1` 실행 완료)
    -   **주요 변경 영역 (요약):**
        -   루트 설정 파일 다수 (`.codespellrc`, `.gitignore`, `.mocharc.json`, `package.json`, `tsconfig.json` 등)
        -   `.github/workflows/` CI/CD 관련 파일 다수
        -   `docs/` 문서 파일 대규모 변경 및 추가
        -   `evals/` 평가 관련 스크립트 및 파일 (신규 추가 또는 대규모 변경)
        -   `locales/` 다국어 지원 파일
        -   `proto/` protobuf 정의 파일 다수
        -   `scripts/` 빌드 및 기타 스크립트 파일
        -   `src/` 전체적으로 광범위한 변경:
            -   `src/api/providers/`: 대부분의 provider 파일 변경 또는 추가
            -   `src/core/`: `assistant-message`, `context`, `controller`, `ignore`, `prompts`, `slash-commands`, `storage`, `task`, `webview` 등 핵심 로직 전반
            -   `src/integrations/`: `checkpoints`, `diagnostics`, `editor`, `git`, `misc`, `terminal` 등
            -   `src/services/`: `account`, `browser`, `error`, `logging`, `mcp`, `posthog`, `search` 등
            -   `src/shared/`: `proto-conversions`, `proto`, `services` 등 공유 모듈
            -   `src/standalone/`: 독립 실행 관련 코드
        -   `webview-ui/`: UI 관련 파일 전반 (`App.tsx`, 컴포넌트, 컨텍스트, 훅, 서비스, 유틸리티 등)
    -   (상세 전체 목록은 `git diff --name-only v3.10.1 v3.16.1` 명령 결과 참조)
- [ ] **우리 프로젝트(`caret-zero`)의 `v3.10.1` (커밋 `1cd3bd50` 기준) 이후 변경 사항과 위 `cline-upstream` 변경 목록 비교 분석**
    -   [X] `caret-zero` 변경 파일 목록 추출 (`git diff --name-only 1cd3bd50 HEAD > caret_zero_changes.txt` 실행 및 결과 저장 완료)
    -   [ ] `cline-upstream` 단독 변경 파일 목록 식별 (두 `diff` 결과 비교 - `caret_zero_changes.txt` 와 `cline_upstream_changes.txt` 파일 내용 비교 필요)
    -   [ ] 양쪽 모두 변경된 파일 목록 식별 (두 `diff` 결과 비교 - `caret_zero_changes.txt` 와 `cline_upstream_changes.txt` 파일 내용 비교 필요)
    -   [ ] `caret-zero` 단독 변경 파일 목록 식별 (참고용, `caret_zero_changes.txt` 와 `cline_upstream_changes.txt` 파일 내용 비교 필요)
- [X] 커스텀 로직 유지 결정 및 Upstream 기능 선택적 가져오기 결정 (마스터와 상의)
    -   **기본 원칙:** Upstream의 모든 새로운 기능과 개선 사항을 가져오는 것을 목표로 한다.
    -   **커스텀 로직:** 기존에 구현된 커스텀 로직(예: `ILogger` 시스템, 특정 프롬프트 구조 등)은 최대한 유지하면서 Upstream의 변경 사항과 조화롭게 통합한다.
    -   **선택적 통합:** API Provider 등 특정 기능에 대해서는 필요에 따라 선택적으로 통합하거나 우선순위를 둘 수 있으며, 이는 각 파일 병합 단계에서 마스터와 논의하여 결정한다.

## 2. 파일별 병합 전략 (File-by-File Merging Strategy)

- [ ] `package.json` 의존성 관리
    -   **분석:** 현재 프로젝트와 `cline-upstream`의 `package.json` 비교 완료. 주요 변경 사항은 버전, 이름, 설명, 활성화 이벤트, 명령어, 메뉴, 설정, 빌드 스크립트, 의존성 등 전반에 걸쳐 확인됨. Upstream 버전(3.16.1)은 현재 버전(3.10.1)보다 많은 기능과 개선 사항을 포함.
    -   **전략 (1차 제안):** `cline-upstream/package.json` 내용으로 현재 `package.json`을 `write_to_file`을 사용하여 덮어쓰기를 우선 고려.
    -   **후속 조치 (덮어쓰기 후 필수 확인 및 조정):**
        -   **프로젝트 식별 정보:** `name` (예: "caret-zero-dev"), `version` (예: "3.16.1-alpha") 등 우리 프로젝트를 식별할 수 있도록 수정 (마스터와 논의).
        -   **커스텀 로직 의존성:** `ILogger` 등 우리 커스텀 로직에 필요한 특정 의존성이 누락되지 않았는지 확인하고 필요시 추가.
        -   **빌드 스크립트 호환성:** `esbuild.js` 등 기존 빌드 시스템과 Upstream의 `scripts`가 호환되는지 확인하고 필요한 조정 수행.
        -   **Webview UI 빌드:** `webview-ui` 관련 빌드 스크립트(예: `build:webview`)가 현재 프로젝트 구조 및 빌드 방식과 맞는지 확인하고 조정.
        -   **의존성 설치:** 병합 후 `npm install` 또는 `npm update` 실행.
- [ ] 핵심 모듈 병합 (`src/core`, `src/services`, `src/integrations`, `src/shared`)
- [ ] UI 병합 (`webview-ui/`)
- [ ] 시스템 프롬프트 병합 (`src/core/prompts/`)
- [ ] 기타 설정 파일 병합

## 3. 빌드 및 테스트 계획

- [ ] 각 파일 병합 후 `npm run compile` 실행
- [ ] 주요 기능 병합 후 기능 테스트 (마스터에게 요청) 