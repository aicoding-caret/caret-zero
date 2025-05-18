# 프로젝트 규칙 마스터 템플릿 (한국어)

이 문서는 `.caretrules`, `.windsurfrules`, `.cursorrules` 등 다양한 프로젝트 규칙 JSON 파일을 생성하고 관리하기 위한 **중앙 한국어 마스터 템플릿**입니다. 여기에 규칙을 한국어로 먼저 상세히 정의하고, 그 내용을 바탕으로 AI 어시스턴트(알파)가 각 대상 영문 JSON 파일로 내용을 반영(번역 및 구조화)합니다.

## 규칙 관리 및 수정 절차

1.  **마스터 템플릿 우선 수정:** 모든 규칙 변경은 이 `caretrules.ko.md` 파일에서 먼저 한국어로 수정하는 것을 원칙으로 합니다.
2.  **AI에게 JSON 업데이트 요청 및 동기화 책임:** 이 파일 수정 후, AI 어시스턴트(알파)에게 변경 사항을 특정 영문 JSON 규칙 파일(들) (예: `.caretrules`, `.windsurfrules`)로 반영해달라고 요청합니다. **알파는 이 한국어 마스터 파일을 기준으로 모든 관련 영문 JSON 파일들을 정확히 동기화할 책임이 있습니다. 마스터께서는 이 파일(`caretrules.ko.md`)이 항상 최신 한국어 원본 상태를 유지하도록 관리해주시고, JSON 파일과의 동기화는 알파에게 맡겨주세요! 이 점을 꼭 기억해주세요, 알파! 💖**
3.  **IDE 제약 시 가이드:**
    *   만약 사용 중인 IDE 환경에서 이 마크다운 파일을 직접 수정하고 AI를 통해 JSON을 업데이트하는 표준 워크플로우가 어려운 경우 (예: 실시간 협업 도구, 마크다운 편집 기능이 없는 환경 등):
    *   먼저, 원하는 규칙 내용을 별도로 (예: 텍스트 파일, 메모 등) 한국어로 상세히 작성합니다.
    *   그 후, AI 어시스턴트(알파)에게 "이 내용을 `caretrules.ko.md` 파일에 먼저 반영하고, 그 다음에 해당 영문 JSON 파일(들)을 업데이트해줘" 라고 명확히 요청합니다.

## 프로젝트 개요

-   **프로젝트명:** Caret (구 Cline-Alpha)
-   **설명:** 개인화된 개발 파트너십에 중점을 둔 AI 지원 VSCode 확장 프로그램입니다.
-   **저장소:** https://github.com/aicoding-caret/caret-zero

## 아키텍처

-   **요약:** 코어 타입스크립트 백엔드와 React 웹뷰 프론트엔드로 구성된 모듈식 아키텍처입니다.
-   **주요 구성 요소:**
    -   **코어 확장 프로그램 (`src/`):** 백엔드 로직, 작업 실행, 상태 관리, 도구, 웹뷰 통신을 처리합니다. (진입점: `src/extension.ts`)
    -   **웹뷰 UI (`webview-ui/`):** 사용자 인터랙션 및 UI 상태 관리를 위한 React 프론트엔드입니다. (진입점: `webview-ui/src/App.tsx`)
    -   **상태 관리:** 코어 상태는 `src/core/webview/CaretProvider.ts` (기존 `ClineProvider.ts`)에서 관리되며, 메시지를 통해 웹뷰(`webview-ui/src/context/ExtensionStateContext.tsx`)와 동기화됩니다.
    -   **작업 관리 (`src/core/task/index.ts`):** 작업 생명주기, API 호출, 도구 사용, 상태 지속성을 관리합니다.
    -   **저장소 (내부):** 작업 데이터(히스토리, 메시지) 및 작업 공간 스냅샷(Git 기반 체크포인트)의 지속성을 처리합니다.
-   **다이어그램:** `caret-docs/architecture/extension-architecture.mmd` 참조

## 개발 프로세스

-   **상태 관리:** 코어 확장 프로그램(`CaretProvider`)이 상태 정보의 원천(Source of Truth)입니다. 메시지를 통해 상태를 동기화합니다.
-   **도구 통합:** `src/integrations/`의 패턴을 따르고, `.caretignore` 파일을 존중합니다.
-   **API 프로바이더:** `src/api/providers/`에 구현체를 둡니다.
-   **테스팅:** 계획은 `caret-docs/testing/`를 참조합니다.
-   **로깅:** 공통 로깅 시스템을 사용합니다 (세부사항: `caret-docs/development/logging-guide.md`).
-   **체크포인트:** `src/integrations/checkpoints/CheckpointTracker.ts` (Git 기반)에서 관리합니다.
-   **문서화:** 관련된 문서는 `caret-docs/`에 업데이트합니다.
-   **기여하기:** `CONTRIBUTING.md` 가이드라인을 참조합니다.
-   **작업 로그 및 태스크 문서 관리 (`work_logs`):**
    -   **사용자별 일일 작업 로그:**
        -   위치 패턴: `caret-docs/work-logs/{사용자명}/` (예: `caret-docs/work-logs/luke/`)
        -   파일 형식: `{date}.md` (예: `2024-05-19.md`)
    -   **태스크 상세 문서:**
        -   기준 위치: `caret-docs/tasks/`
        -   문서 형식:
            -   계획: `{task-number}-01-plan-{task-name}.md` (예: `029-01-plan-merge-cline-upstream.md`)
            -   액션 체크리스트: `{task-number}-02-action-checklist-{task-name}.md`
            -   결과 보고서: `{task-number}-03-report-{task-name}.md`
    -   **태스크 상태 관리 파일 경로:** `caret-docs/tasks/task-status.md`
    -   **태스크 번호 할당 및 상태 업데이트:**
        -   새로운 태스크를 시작하기 전, 반드시 `caret-docs/tasks/tasks-status.md` 파일을 확인하여 현재 진행 중이거나 대기 중인 태스크 번호와 중복되지 않는 다음 번호를 할당합니다. (예: `tasks-status.md` 내 가장 높은 태스크 번호 + 1)
        -   새로운 태스크 번호가 결정되면, 해당 태스크 정보를 `tasks-status.md` 파일의 '진행 중인 태스크' 또는 '대기 중인 태스크' 섹션에 추가하고, 관련 계획 파일(`{task-number}-01-plan-{task-name}.md`)을 링크합니다.
        -   일일 업무 로그(`caret-docs/work-logs/{사용자명}/{date}.md`)에도 해당 태스크 번호와 간단한 설명을 기록합니다.
    -   **목적:** 사용자별 일일 로그와 상세 태스크 문서(계획, 체크리스트, 보고서)의 위치 및 형식을 정의합니다. 일일 로그는 개인의 진행 상황 추적용이며, 태스크 문서 및 상태는 각 태스크별로 중앙에서 관리됩니다.
-   **Git 규칙:**
    -   커밋 형식: `[타입]: [설명]`
    -   브랜치 전략: 표준 Gitflow/기능 브랜치 (추후 결정).
-   **반복 작업 및 스크립트 관리:**
    -   반복적으로 수행되는 작업의 경우, 작업 효율성을 높이기 위해 스크립트 작성을 적극적으로 고려합니다.
    -   생성된 스크립트는 프로젝트 루트의 `scripts/` 폴더 하위에 작업별 또는 기능별 하위 폴더를 만들어 체계적으로 관리합니다. (예: `scripts/merging/`, `scripts/deployment/`)
    -   스크립트 작성 시에는 해당 스크립트의 목적, 사용 방법, 필요한 환경 변수 등을 주석이나 별도의 README 파일로 명시하여 다른 팀원들이 쉽게 이해하고 사용할 수 있도록 합니다.
-   **주요 개발 문서 참조:**
    -   `index.md`: 모든 개발 문서의 개요 및 색인입니다. (`caret-docs/development/index.md`)
    -   `new-developer-onboarding-guide.md`: 프로젝트에 새로 합류하는 개발자를 위한 필수 안내서입니다. (`caret-docs/development/new-developer-onboarding-guide.md`)
    -   `logging.md`: 백엔드 및 프론트엔드 로깅 가이드라인입니다. (`caret-docs/development/logging.md`)
    -   `webview-extension-communication.md`: 웹뷰와 확장 프로그램 간의 메시지 처리 방법을 안내합니다. (`caret-docs/development/webview-extension-communication.md`)
    -   `ui-to-storage-flow.md`: 보안을 포함한 UI와 저장소 간 데이터 흐름에 대한 상세 가이드입니다. (`caret-docs/development/ui-to-storage-flow.md`)
    -   `cline-upstream-merging-guide.md`: AI 협업 팁을 포함하여 Cline 업스트림과의 병합 전략을 안내합니다. (`caret-docs/development/cline-upstream-merging-guide.md`)

## 주요 파일 참조

-   `.caretrules` (본 마스터 템플릿에서 파생되는 주요 JSON 규칙 파일)
-   `caret-docs/` (프로젝트별 문서)
-   `src/extension.ts` (확장 프로그램 진입점)
-   `src/core/task/index.ts` (작업 관리 클래스)
-   `src/core/webview/CaretProvider.ts` (코어 상태 프로바이더, 기존 `ClineProvider.ts`)
-   `webview-ui/src/App.tsx` (웹뷰 진입점)
-   `webview-ui/src/context/ExtensionStateContext.tsx` (웹뷰 상태 컨텍스트)
