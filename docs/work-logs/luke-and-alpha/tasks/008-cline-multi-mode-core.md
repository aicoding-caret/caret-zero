# 태스크 #008: Cline 다중 모드 아키텍처 설계 및 핵심 시스템 구현

## 태스크 정보
- **태스크 번호**: #008
- **태스크 이름**: Cline 다중 모드 아키텍처 설계 및 핵심 시스템 구현
- **생성일**: 2025-04-06 (추정)
- **상태**: 진행 중
- **우선순위**: 높음
- **담당자**: luke, alpha
- **예상 소요 시간**: 미정

## 태스크 목적
*   (수정됨) Cline에서 사용자가 정의할 수 있는 다중 작동 모드(**Plan, Do, Rule, Talk**)를 우선 지원하기 위한 핵심 시스템을 구현합니다. (기존 M1, M2, M3 등은 추후 고려)
*   사용자가 각 모드별 규칙을 정의할 수 있도록 지원합니다. (`agents-rules/alpha/modes.json` 활용)
*   모드 전환 로직, 각 모드의 상태 관리 방법을 정의하고, 핵심 시스템(`src/core/Controller.ts`, `webview-ui/src/context/ExtensionStateContext.tsx` 등)에 이를 반영합니다.
*   모든 모드에서 기능 제한 없이 모든 도구를 사용할 수 있도록 합니다.
*   이 작업은 Task #009에서 정의된 계층적 프롬프트/규칙 로딩 시스템 설계를 기반으로 합니다.

## 실행 단계 (변경된 순서 반영)
*   [X] **UI 변경 (Task #010의 일부):** 사용자 모드 선택 버튼 및 설정 화면 UI 레이아웃 구성 (기능 구현 제외). (2025-04-06 완료)
*   [X] **08-1. 다중 모드 아키텍처 설계 (일부 진행):**
    *   [X] 사용자가 정의할 모드(**Plan, Do, Rule, Talk**)의 기본 구조 및 규칙 정의 (`agents-rules/alpha/modes.json` 생성 완료).
    *   [ ] 모드 간 전환 조건 및 로직 설계 (UI 트리거 방식 - 일부 구현됨).
    *   [X] 모드별 상태 정보(현재 활성 모드) 관리 방안 설계 (`ChatSettings.ts` 수정 완료).
    *   [ ] 계층적 규칙 로딩 시스템(Task #009)과 연동 방안 설계.
*   [X] **08-2. 다중 모드 시스템 핵심 구현 (진행 중):**
    *   [X] 핵심 모드 전환 및 상태 관리 로직 일부 구현 (`src/core/Controller.ts`, `webview-ui/src/context/ExtensionStateContext.tsx`, `src/shared/ExtensionMessage.ts` 관련 타입 및 상태 수정 완료).
    *   [X] 모드 변경 시 Telemetry 로깅 수정 (`src/services/telemetry/TelemetryService.ts` 수정 완료).
    *   [ ] 모드 변경 시 Task #009에서 구현될 프롬프트 로딩 시스템을 트리거하는 로직 연동.
*   [ ] **08-3. UI 구현 및 문제 해결:**
    *   [X] 모드 선택 버튼 UI 코드 추가 (`webview-ui/src/components/chat/ChatView.tsx` 수정 완료).
    *   [ ] **(문제)** UI에 모드 버튼이 실제 렌더링되지 않는 문제 해결 필요.
*   [ ] 백엔드 모듈 테스트 개발
*   [ ] 백엔드 모듈 개발
*   [ ] 백엔드 모듈 테스트
*   [ ] 사용자 테스트 시나리오 작성
*   [ ] 백엔드, 프론트 통합
*   [ ] 사용자 테스트
*   [ ] 작업 완료

## 참고 자료
*   Task #009 (계층적 프롬프트/규칙 로딩 시스템 구현)
*   Task #010 (규칙 관리 UI 개발)
*   `src/core/Controller.ts`
*   `webview-ui/src/context/ExtensionStateContext.tsx`
*   `src/shared/ChatSettings.ts`
*   `src/shared/ExtensionMessage.ts`
*   `webview-ui/src/components/chat/ChatView.tsx`
*   `agents-rules/alpha/modes.json`

## 진행 상황
*   계획 수정 완료 (2025-04-06): 사용자 요청에 따라 UI 구현(Task #010의 일부)을 우선 진행하기로 함. 아키텍처 설계 및 백엔드 구현은 UI 작업 이후 진행.
*   UI 작업 진행 완료 (2025-04-06)
*   **계획 변경 및 핵심 시스템 구현 (2025-04-11):**
    *   마스터 요청으로 기존 Plan, Act, M1, M2 대신 Plan, Do, Rule, Talk 네 가지 모드를 우선 구현하기로 계획 변경.
    *   `modes.json` 파일 생성 및 규칙 정의 완료.
    *   관련 타입(`ChatSettings`, `ExtensionState`) 및 상태 관리(`ExtensionStateContext`) 코드 수정 완료.
    *   백엔드 컨트롤러(`Controller.ts`)에 모드 로딩 및 상태 변경 핸들러 추가 완료.
    *   텔레메트리 서비스(`TelemetryService.ts`) 관련 타입 수정 완료.
    *   웹뷰(`ChatView.tsx`)에 모드 버튼 UI 코드 추가 완료.
    *   빌드 성공 확인 (타입 오류는 임시 해결 후 근본 해결).
    *   **문제 발생:** UI에 모드 버튼이 렌더링되지 않는 문제 확인됨.

## 메모
*   Task #009 (계층적 프롬프트/규칙 로딩 시스템 구현) 설계와 밀접하게 연관됩니다.
*   Task #010 (규칙 관리 UI 개발)의 UI 구현 부분을 이 태스크보다 먼저 진행합니다.
*   **기존 마스터 메모:** (생략 - 이전 내용과 동일)

---
*2025-04-11 알파가 검토 및 정리함.* ｡•ᴗ•｡✨
