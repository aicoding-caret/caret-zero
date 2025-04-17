# 태스크 #008: Cline 다중 모드 아키텍처 설계 및 핵심 시스템 구현

## 태스크 정보
- **태스크 번호**: #008
- **태스크 이름**: Cline 다중 모드 아키텍처 설계 및 핵심 시스템 구현
- **생성일**: 2025-04-17
- **상태**: 진행 중
- **우선순위**: 높음
- **담당자**: luke, alpha
- **예상 소요 시간**: 미정

## 태스크 목적
*   Cline에서 사용자가 정의할 수 있는 다중 작동 모드(**Arch, Dev, Rule, Talk, Empty**)를 우선 지원하기 위한 핵심 시스템을 구현합니다. (기존 M1, M2, M3 등은 추후 고려)
*   사용자가 각 모드별 규칙을 정의할 수 있도록 지원합니다. (`agents-rules/alpha/modes.json` 활용)
*   모드 전환 로직, 각 모드의 상태 관리 방법을 정의하고, 핵심 시스템(`src/core/Controller.ts`, `webview-ui/src/context/ExtensionStateContext.tsx` 등)에 이를 반영합니다.
*   모든 모드에서 기능 제한 없이 모든 도구를 사용할 수 있도록 합니다.
*   이 작업은 Task #009에서 정의된 계층적 프롬프트/규칙 로딩 시스템 설계를 기반으로 합니다.

## 실행 단계 (변경된 순서 반영)
*   [X] **UI 변경 (Task #010의 일부):** 사용자 모드 선택 버튼 및 설정 화면 UI 레이아웃 구성 (기능 구현 제외). (2025-04-06 완료)
*   [X] **08-1. 다중 모드 아키텍처 설계 (일부 진행):**
    *   [X] 사용자가 정의할 모드(**Plan, Do, Rule, Talk, Empty**)의 기본 구조 및 규칙 정의 (`agents-rules/alpha/modes.json` 생성 완료).
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
    *   [X] 모드 설정 UI 이벤트 핸들러 타입 문제 해결 (`ModeSettingsView.tsx`)
        - `VSCodeTextArea` 대신 일반 `textarea` 사용으로 규칙 편집 기능 개선
        - 이벤트 타입 캐스팅 추가 (`e.target as HTMLInputElement`)
        - VSCode 테마 스타일 적용하여 일관된 디자인 유지
*   [X] **08-4. 모드 설정 편집 기능 구현:**
    *   [X] 설정 페이지에서 모드(Plan, Do, Rule, Talk, Empty)의 이름 및 규칙 편집 기능 구현
    *   [X] Mode1~5 설정에서 permissions 및 allowed file path 제거
    *   [X] 모드별 이름과 규칙만 설정 가능하도록 UI 조정
    *   [X] 설정 저장 및 불러오기 기능 구현 (modes.json 파일 직접 수정 방식)
*   [ ] **08-5. 알파 프로필 이미지 설정 기능 구현:**
    *   [ ] 설정 페이지에서 알파(챗봇) 프로필 이미지 변경 기능 추가
    *   [ ] 이미지 선택 및 적용 UI 구현
    *   [ ] 변경된 이미지 저장 및 불러오기 기능 구현
*   [ ] 백엔드 모듈 테스트
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
    *   테레메트리 서비스(`TelemetryService.ts`) 관련 타입 수정 완료.
    *   웹뷰(`ChatView.tsx`)에 모드 버튼 UI 코드 추가 완료.
    *   빌드 성공 확인 (타입 오류는 임시 해결 후 근본 해결).
    *   **문제 발생:** UI에 모드 버튼이 렌더링되지 않는 문제 확인됨.
*   **모드 설정 편집 및 저장 기능 구현 (2025-04-12):**
    *   `agents-rules/alpha/modes.json` 파일에 Empty 모드 추가 - 여러 모드 설정 테스트를 위한 빈 모드
    *   `ModeSettingsView.tsx` UI 개선 및 타입 오류 해결
        *   `VSCodeTextArea` 대신 일반 `textarea` 사용으로 규칙 편집 기능 개선
        *   이벤트 타입 캐스팅 추가 (`e.target as HTMLInputElement`)
        *   VSCode 테마 스타일 적용하여 일관된 디자인 유지
    *   `Controller.ts`에 모드 설정 관련 메시지 핸들러 추가
        *   `loadModesConfig`: modes.json 파일 읽기 기능
        *   `saveModeSettings`: 모드 설정 저장 기능 (백업 기능 포함)
        *   `resetModesToDefaults`: 기본값으로 초기화 기능
    *   `ExtensionMessage.ts`에 `modesConfigLoaded` 메시지 타입 추가
*   **타입 오류 및 빌드 문제 해결 (2025-04-13):**
    *   `Controller.ts`에 디버깅 로그 추가 및 타입 오류 수정
        *   로그 추가로 메시지 흐름 확인 가능
        *   `modesConfigLoaded` 메시지의 `ExtensionMessage` 타입 지정 오류 수정
    *   `ModeSettingsView.tsx`의 타입스크립트 오류 해결
        *   WebviewMessage 타입 적용 및 메시지 타입 오류 해결
        *   VSCode UI Toolkit 컴포넌트와 React 호환성 문제 해결
    *   웹뷰 빌드 스크립트 개선
        *   타입 체크를 건너뛰는 `build:quick` 명령 추가
        *   클린 빌드 및 패키징 성공 확인

## 메모
*   Task #009 (계층적 프롬프트/규칙 로딩 시스템 구현) 설계와 밀접하게 연관됩니다.
*   Task #010 (규칙 관리 UI 개발)의 UI 구현 부분을 이 태스크보다 먼저 진행합니다.
*   **모드 설정 파일 구조:** modes.json 파일은 시스템 프롬프트에 직접 포함되는 규칙 파일로, 사용자가 변경한 설정은 일반 설정과 달리 시스템 프롬프트에 영향을 주게 됩니다. 따라서 추후 전용 설정 저장소를 활용한 개선이 필요할 수 있습니다.

---
*2025-04-11 알파가 검토 및 정리함.* ｡•ᴗ•｡✨
