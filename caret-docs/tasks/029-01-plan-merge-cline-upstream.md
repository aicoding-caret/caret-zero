# Task 029: Cline Upstream 변경 사항 병합 - 계획

**날짜:** 2024-05-18
**목표:** `@cline-upstream-merging-guide.md` 에 따라 `cline-upstream` 저장소의 변경 사항을 현재 프로젝트에 병합합니다.
**병합 대상 Upstream 버전:** `v3.16.1`

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
    -   **[중요 경고 및 전략 수정] 2024-05-18 확인 결과, `cline-upstream` (v3.16.1) 로컬 빌드 시도 시, `src/services/mcp/McpHub.ts`의 `content` 타입 불일치 문제를 포함하여 다수의 심각한 빌드 오류가 발견되었습니다. 이는 `cline-upstream` 원본 코드 자체에 이미 문제가 내재되어 있음을 의미하며, 기존의 단순 파일 병합 전략은 `caret-zero` 프로젝트에 큰 위험을 초래할 수 있습니다. 따라서, 아래의 "파일별 병합 전략"은 전면 재검토가 필요하며, Upstream 코드의 오류를 먼저 해결하거나 매우 신중한 점진적 병합 방식으로 변경해야 합니다. 상세한 오류 내용은 본 문서 하단 "2.1. `cline-upstream` 빌드 오류 분석 및 대응 방안" 섹션 또는 별첨된 로그를 참조하십시오.**
    -   **자동화 스크립트 결과(`scripts/merging-job/`) 분석을 통해 구체화 예정:**
        -   `upstream_only_changes.txt` 내용을 분석하여, 이 목록의 파일들을 우선 병합 대상으로 고려 (문서, CI/CD, 일부 API Provider, 설정 파일 등 다수 포함 확인됨).
            - **주의:** `src/api/providers/` 하위 파일 중 `upstream_only_changes.txt`에만 있는 파일들은 신규 Provider로 보이며, 현재 진행 중인 우리 측 리팩토링 작업과의 충돌 가능성을 고려하여 단순 덮어쓰기 대상에서 제외하고 별도 관리 및 신중한 통합 검토 필요. (Upstream 빌드 오류 해결 전까지 이 항목 작업 보류)
        -   `both_changed_files.txt` 내용을 분석하여, 충돌 가능성이 높은 핵심 파일들을 식별하고 신중한 병합 전략 수립. (Upstream 빌드 오류 해결 전까지 이 항목 작업 보류)
            - `src/api/providers/` 하위 파일 중 `both_changed_files.txt`에 포함된 파일들 (`gemini.ts`, `lmstudio.ts`, `openrouter.ts`, `requesty.ts`, `types.ts`, `vscode-lm.ts`)은 양쪽 변경 사항을 고려한 최우선 수동 병합 검토 대상임.
- [X] `cline-upstream` 변경 파일 목록 정확히 파악 (`git diff --name-only v3.10.1 v3.16.1` 실행 완료, 대상 버전: `v3.16.1`)
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
    -   [X] **자동화 스크립트 실행:** `scripts/merging-job/run_all_diffs.ps1`를 실행하여 다음 파일들을 `scripts/merging-job/` 폴더에 생성 완료:
        -   `upstream_only_changes.txt` (`cline-upstream` 단독 변경)
        -   `both_changed_files.txt` (양쪽 모두 변경)
        -   `caret_only_changes.txt` (`caret-zero` 단독 변경, 참고용)
        -   (`caret-docs/tasks/029-02-action-git-caret-zero-changes.txt` 와 `caret-docs/tasks/029-02-action-git-cline-upstream-changes.txt` 파일도 이 과정에서 업데이트됨)
    -   [X] `cline-upstream` 단독 변경 파일 목록 식별 (`scripts/merging-job/upstream_only_changes.txt` 내용 확인 완료)
    -   [ ] 양쪽 모두 변경된 파일 목록 식별 (`scripts/merging-job/both_changed_files.txt` 내용 확인)
    -   [ ] `caret-zero` 단독 변경 파일 목록 식별 (참고용, `scripts/merging-job/caret_only_changes.txt` 내용 확인)
- [X] 커스텀 로직 유지 결정 및 Upstream 기능 선택적 가져오기 결정 (마스터와 상의)
    -   **기본 원칙:** Upstream의 모든 새로운 기능과 개선 사항을 가져오는 것을 목표로 한다. (단, Upstream 빌드 오류 해결 및 안정성 확보 선행)
    -   **커스텀 로직:** 기존에 구현된 커스텀 로직(예: `ILogger` 시스템, 특정 프롬프트 구조 등)은 최대한 유지하면서 Upstream의 변경 사항과 조화롭게 통합한다.
    -   **선택적 통합:** API Provider 등 특정 기능에 대해서는 필요에 따라 선택적으로 통합하거나 우선순위를 둘 수 있으며, 이는 각 파일 병합 단계에서 마스터와 논의하여 결정한다.

## 2. 파일별 병합 전략 (재검토 필요 - Upstream 빌드 오류로 인해 기존 계획 보류)

### 2.1. `cline-upstream` (v3.16.1) 빌드 오류 분석 및 대응 방안 (신규 추가)

2024-05-18 `cline-upstream` (태그 `v3.16.1`) 프로젝트 로컬 클린 빌드 시도 결과, 다음과 같은 주요 오류들이 확인되었습니다. 이로 인해 기존 병합 계획은 전면적인 재검토가 필요하며, 아래 오류들에 대한 해결 또는 회피 방안이 선행되어야 합니다.

**발생 오류 요약:**

*   **`src/services/mcp/McpHub.ts:636:3` - 타입 불일치 (TS2322):**
    *   `connection.client.request`의 반환 타입 (`... | undefined`)이 `McpToolCallResponse`의 `content` 타입 (`...[]`)과 호환되지 않음. (`content`가 `undefined`일 수 없음).
    *   **원인 추정:** SDK의 `client.request` 메소드 실제 반환 타입과 `CallToolResultSchema` (Zod 스키마) 간의 불일치 또는 SDK 타입 정의의 불완전함.
    *   **대응 방안 (제안):**
        1.  `caret-zero/src/services/mcp/McpHub.ts`에서 `connection.client.request`의 반환 값에 대해 `content`가 `undefined`일 경우를 명시적으로 처리 (예: `toolResult.content = toolResult.content ?? []`). 또는,
        2.  `@modelcontextprotocol/sdk`의 `CallToolResultSchema` 정의 자체를 분석하여 `content`가 실제로 optional인지, 아니면 `client.request`의 제네릭 타입을 더 구체적으로 명시해야 하는지 확인.
        3.  (장기적) SDK 라이브러리 자체의 타입 정의 수정을 커뮤니티에 제안하거나, 우리 프로젝트에서 SDK 타입을 확장/오버라이드하여 사용.

*   **`src/api/providers/vscode-lm.ts:1:1` - 정의 충돌 (TS6200):**
    *   `LanguageModelChatMessage` 등 다수 식별자 정의가 `node_modules/@types/vscode/index.d.ts`의 정의와 충돌.
    *   **원인 추정:** `@types/vscode` 버전 업데이트 또는 `vscode-lm.ts` 내부의 타입 정의 방식 변경으로 인한 네임스페이스 충돌.
    *   **대응 방안 (제안):**
        1.  충돌하는 타입 이름 변경 또는 모듈화를 통해 네임스페이스 분리.
        2.  VSCode API에서 제공하는 기본 타입을 최대한 활용하도록 코드 수정.

*   **`src/integrations/terminal/TerminalManager.ts:75:3` 및 `TerminalProcess.test.ts:11:3` - `shellIntegration` 타입/수정자 불일치 (TS2687, TS2717):**
    *   `shellIntegration` 속성 선언이 `@types/vscode/index.d.ts`의 선언과 수정자 또는 타입이 일치하지 않음.
    *   **원인 추정:** VSCode API 변경에 따른 `TerminalShellIntegration` 타입 정의 변경 미반영.
    *   **대응 방안 (제안):** 최신 `@types/vscode`의 `TerminalShellIntegration` 타입 정의에 맞게 `TerminalManager.ts` 및 관련 테스트 코드의 타입 선언 수정.

*   **`webview-ui/src/utils/vscode.ts` - 모듈/이름 찾을 수 없음 (TS2307, TS2304):**
    *   `vscode-webview` 모듈 또는 `acquireVsCodeApi` 이름을 찾을 수 없음.
    *   **원인 추정:** Webview UI 빌드 환경 또는 의존성 설정 문제, 혹은 VSCode Webview API 사용 방식 변경.
    *   **대응 방안 (제안):** `webview-ui` 관련 `tsconfig.json`, `package.json` 의존성 확인 및 VSCode 최신 Webview API 가이드에 따른 코드 수정.

**종합 대응 전략:**

*   **최우선 과제:** 위 오류들, 특히 `McpHub.ts`의 타입 오류를 `caret-zero`에서 먼저 해결하고 안정적인 빌드를 확보하는 것을 목표로 합니다.
*   **점진적 접근:** `cline-upstream`의 다른 변경 사항들은 위 오류 해결 추이를 보면서, 작은 단위로 신중하게 병합하고 각 단계마다 빌드 및 테스트를 반복합니다.
*   **문서화:** 각 오류 해결 과정과 최종 수정 내용은 `029-03-report-merge-cline-upstream.md`에 상세히 기록합니다.

---
*(기존 "2. 파일별 병합 전략" 내용은 아래로 이동하며, 각 항목에 실행 보류 및 재검토 필요 명시)*
---

### 2.2. 파일별 병합 전략 (기존 계획 - Upstream 오류로 인해 실행 보류 및 재검토 필요)

- [ ] **1단계: Upstream 단독 변경 파일 우선 적용 [기존 계획 - Upstream 오류로 인해 실행 보류 및 재검토 필요. 대상 파일들의 빌드 오류 여부 선확인 후 신중히 진행]**
    -   **대상:** "1. 사전 분석" 단계에서 식별된 `cline-upstream`에서만 변경된 파일 (단, `src/api/providers/` 하위 신규 Provider 파일은 본 단계에서 제외하고 별도 관리).
    -   **작업:**
        -   [ ] **루트 디렉터리 파일 병합:**
            -   [ ] 대상 파일 식별: `.codespellrc`, `.mocharc.json`, `esbuild.js`, `tsconfig.json` (이 파일들은 `upstream_only_changes.txt` 목록에 있으며, `both_changed_files.txt`에는 없는 것으로 확인됨. `tsconfig.json`은 특히 주의하여 최종 확인).
            -   [ ] (선택사항) 현재 `caret-zero`의 해당 파일들 백업 (`.bak`).
            -   [ ] `cline-upstream` 버전으로 대상 파일들 덮어쓰기 (주의: 각 파일이 Upstream 빌드 오류와 관련 없는지 사전 확인 필요).
            -   [ ] 덮어쓴 파일 내용에 대해 `cline` -> `caret` 브랜딩 적용 (주의: 설정 파일의 경우 빌드에 영향을 미치지 않는 선에서 최소화하거나, 빌드 성공 후 전체 브랜딩 단계에서 진행).
            -   [ ] `npm run build` (또는 `npm run compile`) 실행하여 빌드 오류 확인 및 해결.
        -   [ ] **문서 파일 병합 (신규 `cline-docs` 폴더로 Upstream 내용 가져오기, `caret-docs`는 유지):**
            -   [ ] `caret-zero` 프로젝트 루트에 신규 `cline-docs` 폴더 생성.
            -   [ ] `cline-upstream/docs/` 폴더의 전체 내용을 `caret-zero/cline-docs/` 폴더로 복사 (기존 파일 있을 시 덮어쓰기).
            -   [ ] `caret-zero/cline-docs/` 내에 `old_docs` 폴더 생성.
            -   [ ] `cline-upstream/old_docs/` 폴더의 전체 내용을 `caret-zero/cline-docs/old_docs/` 폴더로 복사 (기존 파일 있을 시 덮어쓰기).
            -   [ ] 기존 `caret-docs` 폴더는 변경 없이 그대로 유지함.
            -   [ ] **브랜딩 적용 (추후 진행):** `cline-docs` 폴더 내부 파일들의 `cline` -> `caret` 브랜딩 작업은 전체 빌드 성공 및 안정화 이후 단계에서 진행.
            -   [ ] `npm run build` (또는 `npm run compile`) 실행 (문서 변경은 빌드에 큰 영향 없을 것으로 예상되나, 확인 차원).
        -   [ ] 위 작업들 중 처리된 파일 목록 (특별 관리 대상 제외)을 `029-03-report-merge-cline-upstream.md`에 기록.
        -   [ ] 덮어쓴 파일들에 대해 전역 문자열 치환 수행 (`cline` -> `caret` 등) - 이 항목은 위 브랜딩 적용으로 통합됨.

- [ ] **2단계: 전역 문자열 치환 (Branding Alignment) - 나머지 파일 대상 [기존 계획 - Upstream 오류로 인해 실행 보류 및 재검토 필요]**
    -   **대상:** 1단계에서 처리되지 않은 `cline-upstream`에서 가져올 나머지 파일들 (및 1단계에서 부분적으로 브랜딩된 파일들의 추가 확인).
    -   **작업:**
        -   [ ] 본격적인 병합 전, 또는 병합 직후 파일 단위로 `cline` -> `caret` (및 대소문자 변형) 문자열 일괄 변경 (`replace_in_file` 또는 마스터 지시 스크립트 사용).

- [ ] **3단계: `package.json` 의존성 관리 [기존 계획 - Upstream 오류로 인해 실행 보류 및 재검토 필요]**
    -   **분석:** 현재 프로젝트와 `cline-upstream`의 `package.json` 비교 완료. 주요 변경 사항은 버전, 이름, 설명, 활성화 이벤트, 명령어, 메뉴, 설정, 빌드 스크립트, 의존성 등 전반에 걸쳐 확인됨. Upstream 버전(3.16.1)은 현재 버전(3.10.1)보다 많은 기능과 개선 사항을 포함.
    -   **전략 (1차 제안):** `cline-upstream/package.json` 내용으로 현재 `package.json`을 `write_to_file`을 사용하여 덮어쓰기를 우선 고려.
    -   **후속 조치 (덮어쓰기 후 필수 확인 및 조정):**
        -   **프로젝트 식별 정보:** `name` (예: "caret-zero-dev"), `version` (예: "3.16.1-alpha") 등 우리 프로젝트를 식별할 수 있도록 수정 (마스터와 논의).
        -   **커스텀 로직 의존성:** `ILogger` 등 우리 커스텀 로직에 필요한 특정 의존성이 누락되지 않았는지 확인하고 필요시 추가.
        -   **빌드 스크립트 호환성:** `esbuild.js` 등 기존 빌드 시스템과 Upstream의 `scripts`가 호환되는지 확인하고 필요한 조정 수행.
        -   **Webview UI 빌드:** `webview-ui` 관련 빌드 스크립트(예: `build:webview`)가 현재 프로젝트 구조 및 빌드 방식과 맞는지 확인하고 조정.
        -   **의존성 설치:** 병합 후 `npm install` 또는 `npm update` 실행.

- [ ] **4단계: 나머지 핵심 모듈, UI, 프롬프트, 설정 파일 순차적/분석적 병합 [기존 계획 - Upstream 오류로 인해 실행 보류 및 재검토 필요]**
    -   **대상:** "1. 사전 분석"에서 식별된 양쪽 모두 변경된 파일 및 기타 분석 필요한 파일.
    -   **작업 (파일 유형별 세부 계획은 하위 항목으로 구체화):**
        -   [ ] `src/core` (커스텀 로직 `ILogger` 등 유지하며 병합)
        -   [ ] `src/services` (커스텀 로직 `ILogger` 등 유지하며 병합)
        -   [ ] `src/integrations`
        -   [ ] `src/shared`
        -   [ ] `webview-ui/`
        -   [ ] `src/core/prompts/` (JSON 구조 유지, 내용 분석 반영)
        -   [ ] 기타 설정 파일
        -   **공통 작업:**
            -   [ ] 각 파일 병합 시 `cline-upstream-merging-guide.md`의 지침(커스텀 로직 유지, `replace_in_file` 신중 사용 등) 준수.
            -   [ ] 병합 과정에서 사용되지 않는 코드 식별 및 마스터 확인 후 제거.
            -   [ ] 필요한 신규 코드/로직 통합.
            -   [ ] 각 파일 병합 후 `npm run compile` 실행.

## 3. 빌드 및 테스트 계획 (Upstream 오류 해결 후 재수립)

- [ ] 각 파일 병합 후 `npm run compile` 실행
- [ ] 주요 기능 병합 후 기능 테스트 (마스터에게 요청) 