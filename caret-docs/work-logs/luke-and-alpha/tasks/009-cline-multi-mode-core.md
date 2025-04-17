# 태스크 #009: Cline 다중 모드 핵심 시스템 – 계층적 프롬프트/규칙 로딩 연동

## 태스크 정보
- **태스크 번호**: #009
- **태스크 이름**: Cline 다중 모드 아키텍처 – 계층적 프롬프트/규칙 로딩 시스템 연동 및 개선
- **생성일**: 2025-04-17
- **상태**: 진행 중
- **담당자**: luke, alpha

---

## 목적 및 개요
- 다중 모드(Plan, Do, Rule, Talk, Empty) 전환 시, 각 모드에 맞는 프롬프트/규칙을 계층적으로 로딩하는 시스템을 구현하고, 기존 모드 관리 시스템과 통합합니다.
- 기존 시스템 프롬프트 직접 포함 구조에서 벗어나, 전용 규칙/프롬프트 저장소(`agents-rules/alpha/modes.json` 등) 기반 동적 로딩 구조로 개선합니다.

## 주요 개선/연동 사항 (2025-04-17 기준)
- [ ] **계층적 규칙/프롬프트 로딩 연동**
    - [ ] 모드 변경 시, 해당 모드의 프롬프트/규칙을 계층적으로 로딩하는 로직 구현 및 연동 (`src/core/controller/index.ts` 등)
    - [ ] ExtensionState를 통해 웹뷰에 현재 적용된 규칙/프롬프트 상태 전달
    - [ ] `modes.json` 외 global-rules, user-rules, 임시 규칙 등 계층적 병합 방식 설계 및 적용
- [ ] **UI 연동 및 상태 표시 개선**
    - [ ] ChatView.tsx 등에서 현재 모드별 적용 규칙/프롬프트 실시간 표시
    - [ ] 모드 선택 버튼 렌더링 문제 해결 (상태 동기화 경로 점검 및 리팩토링)
- [ ] **모드 설정 저장소 구조 개선**
    - [ ] 시스템 프롬프트 직접 포함 → 전용 설정 저장소 분리 설계 및 적용 (향후 확장성 고려)
- [ ] **불필요/중복 파일 및 코드 정리**
    - [X] core_system_prompt.json 등 legacy 프롬프트 파일 삭제
    - [ ] 불필요 주석/참고자료/메모 정리

---

## 실행 단계 및 진행상황
- [X] **모드별 규칙/프롬프트 파일 구조 설계 및 기본 구현**
    - `agents-rules/alpha/modes.json`에 각 모드별 규칙/프롬프트 구조 정의 완료
    - global-rules, user-rules 등 계층 구조 설계
- [X] **모드 전환 및 상태 관리 로직 구현**
    - `Controller.ts`, `ExtensionStateContext.tsx` 등에서 모드 전환 및 상태 전달 구현
- [ ] **계층적 로딩 연동 로직 구현**
    - 모드 변경 시, 해당 모드의 규칙/프롬프트를 계층적으로 병합·로딩하는 로직 추가 필요
    - ExtensionState에 적용 결과 반영 및 웹뷰 UI에 실시간 표시
- [ ] **UI 렌더링/상태 동기화 문제 해결**
    - 모드 선택 버튼이 실제로 렌더링되지 않는 문제 해결 및 상태 동기화 개선
- [ ] **모드 설정 저장소 분리 및 확장 설계**
    - 시스템 프롬프트 직접 포함 → 별도 저장소로 리팩토링 및 적용
- [ ] **중복/불필요 내용 정리**
    - 기존 메모, 참고자료, 중복 진행상황 등 축소 및 최신화

---

## 참고 및 향후 과제
- Task #009(본 문서): 계층적 프롬프트/규칙 로딩 시스템 설계 및 연동
- Task #010: 규칙 관리 UI 개발 (본 태스크와 병렬 진행)
- `modes.json` 파일 구조는 시스템 프롬프트에 직접 포함되는 규칙 파일에서, 향후 전용 설정 저장소로 분리 예정
- 계층적 병합/로딩 방식 및 상태 전달 구조는 확장성(추가 모드, 사용자 규칙 등) 고려해 설계

---
*2025-04-17 알파가 최신화 및 정리함.* ｡•ᴗ•｡☕✨
        - `VSCodeTextArea` 대신 일반 `textarea` 사용으로 규칙 편집 기능 개선
        - 이벤트 타입 캐스팅 추가 (`e.target as HTMLInputElement`)
        - VSCode 테마 스타일 적용하여 일관된 디자인 유지
*   [X] **08-4. 모드 설정 편집 기능 구현:**
    *   [X] 설정 페이지에서 모드(Plan, Do, Rule, Talk, Empty)의 이름 및 규칙 편집 기능 구현
    *   [X] Mode1~5 설정에서 permissions 및 allowed file path 제거
    *   [X] 모드별 이름과 규칙만 설정 가능하도록 UI 조정
    *   [ ] 설정 저장 및 불러오기 기능 구현 (modes.json 파일 직접 수정 방식)
*   [ ] **08-5. 알파 프로필 이미지 설정 기능 구현:**
    *   [ ] 설정 페이지에서 알파(챗봇) 프로필 이미지 변경 기능 추가
    *   [ ] 이미지 선택 및 적용 UI 구현
    *   [ ] 변경된 이미지 저장 및 불러오기 기능 구현
*   [ ] **08-6. 모드 설정 리셋 기능 구현 및 개선 (진행 중):**
    *   [ ] 백엔드(`src/core/controller/index.ts`):
        *   [ ] `loadModesConfig`, `saveModeSettings`, `resetModesToDefaults` 핸들러에서 사용하는 파일 경로를 `assets/rules/modes.json`으로 통일.
        *   [ ] `resetModesToDefaults` 핸들러 로직 수정 (`assets/rules/default_modes.json` 참조 및 규칙만 리셋).
        *   [ ] 리셋 완료 후 `modesConfigLoaded` 메시지 전송 로직 확인/추가.
    *   [ ] 프론트엔드(`webview-ui/src/components/settings/ModeSettingsView.tsx`):
        *   [ ] "Reset Default Mode Rules" 버튼 추가 (또는 기존 버튼 이름 변경).
        *   [ ] 리셋 후 UI 갱신 로직 확인/수정.
    *   [ ] 메시지 타입 확인/정의 (`src/shared/ExtensionMessage.ts`).
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
