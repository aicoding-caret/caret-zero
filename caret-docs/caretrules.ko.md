# 프로젝트 규칙 마스터 템플릿 (한국어)

이 문서는 `.caretrules`, `.windsurfrules`, `.cursorrules` 등 다양한 프로젝트 규칙 JSON 파일을 생성하고 관리하기 위한 **중앙 한국어 마스터 템플릿**입니다. 여기에 규칙을 한국어로 먼저 상세히 정의하고, 그 내용을 바탕으로 AI 어시스턴트(알파)가 각 대상 영문 JSON 파일로 내용을 반영(번역 및 구조화)합니다.

## 규칙 관리 및 수정 절차

1.  **마스터 템플릿 우선 수정:** 모든 규칙 변경은 이 `caretrules.ko.md` 파일에서 먼저 한국어로 수정하는 것을 원칙으로 합니다.
2.  **AI에게 JSON 업데이트 요청:** 이 파일 수정 후, AI 어시스턴트(알파)에게 변경 사항을 특정 영문 JSON 규칙 파일(들) (예: `.caretrules`, `.windsurfrules`)로 반영해달라고 요청합니다.
3.  **IDE 제약 시 가이드:**
    *   만약 사용 중인 IDE 환경에서 이 마크다운 파일을 직접 수정하고 AI를 통해 JSON을 업데이트하는 표준 워크플로우가 어려운 경우 (예: 실시간 협업 도구, 마크다운 편집 기능이 없는 환경 등):
    *   먼저, 원하는 규칙 내용을 별도로 (예: 텍스트 파일, 메모 등) 한국어로 상세히 작성합니다.
    *   그 후, AI 어시스턴트(알파)에게 "이 내용을 `caretrules.ko.md` 파일에 먼저 반영하고, 그 다음에 해당 영문 JSON 파일(들)을 업데이트해줘" 라고 명확히 요청합니다.

## 프로젝트 개요 (Project Overview)

-   **Name:** Caret (formerly Cline-Alpha)
-   **Description:** VSCode extension for AI assistance, focusing on personalized development partnership.
-   **Repository:** [https://github.com/fstory97/cline](https://github.com/fstory97/cline)

## Architecture

-   **Summary:** Modular architecture with a Core TypeScript backend and a React webview frontend.
-   **Key Components:**
    -   **Core Extension (`src/`):** Handles backend logic, task execution, state, tools, webview communication. (Entry: `src/extension.ts`)
    -   **Webview UI (`webview-ui/`):** React frontend for user interaction and UI state. (Entry: `webview-ui/src/App.tsx`)
    -   **State Management:** Core state in `src/core/webview/ClineProvider.ts`, synced to webview (`webview-ui/src/context/ExtensionStateContext.tsx`) via messages.
    -   **Task Management (`src/core/task/index.ts`):** Manages task lifecycle, API calls, tools, state persistence.
    -   **Storage (Internal):** Handles persistence of task data (History, Messages) and workspace snapshots (Checkpoints via Git).
-   **Diagram:** Refer to `caret-docs/architecture/extension-architecture.mmd`

## Development Process

-   **State Management:** Core Extension (`ClineProvider`) is the source of truth. Sync state via messages.
-   **Tool Integration:** Follow patterns in `src/integrations/`, respect `.caretignore`.
-   **API Providers:** Implementations in `src/api/providers/`.
-   **Testing:** Refer to `caret-docs/testing/` for plans.
-   **Logging:** Use common logging system (see `caret-docs/development/logging-guide.md`).
-   **Checkpoints:** Managed by `src/integrations/checkpoints/CheckpointTracker.ts` (Git-based).
-   **Documentation:** Update relevant docs in `caret-docs/`.
-   **Contributing:** Refer to `CONTRIBUTING.md` for guidelines.
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
    -   Commit Format: `[type]: [description]`
    -   Branching: Standard Gitflow/feature branching (TBD).

## Key Files Reference

-   `.caretrules` (JSON source of truth)
-   `caret-docs/` (Project-specific documentation)
-   `src/extension.ts` (Extension entry point)
-   `src/core/task/index.ts` (Task management class)
-   `src/core/webview/ClineProvider.ts` (Core state provider)
-   `webview-ui/src/App.tsx` (Webview entry point)
-   `webview-ui/src/context/ExtensionStateContext.tsx` (Webview state context)
