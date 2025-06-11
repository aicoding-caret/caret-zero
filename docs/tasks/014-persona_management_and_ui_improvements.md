# UI 개선 작업: 퍼소나 관리 및 내부 사고 과정 표시 개선

* 이전 원본 위치 : `/private-cline` 에 있으므로 잘못된 동작시 원본과 비교하여 확인하면 용이함

## 배경
현재 UI에서는 AI의 내부 사고 과정(`<thinking>` 태그 내용)과 실제 사용자와의 대화 내용이 함께 노출되고 있어 사용자가 혼란을 겪을 수 있습니다. 또한, 프로필 이미지 설정 및 생각중 이미지 표시에 문제가 있어 사용자 경험이 저하되고 있습니다. 더불어 custom_instruction과 에이전트 이미지가 별도로 관리되어 일관된 퍼소나 관리가 어려운 상황입니다.

## 목표
1. **퍼소나 관리 개선**
   - custom_instruction과 에이전트 이미지를 통합 관리
   - 시작 시 에이전트 선택 기능을 위한 기반 마련
   - 프로필 이미지 변경 기능 수정

2. **내부 사고 과정 표시 개선**
   - AI의 내부 사고 과정과 실제 대화 내용을 UI에서 명확히 분리
   - 내부 사고 과정에 '생각중' 이미지 표시 구현
   - 사용자에게 최종 응답만 표시하고, 필요시 내부 사고 과정을 선택적으로 볼 수 있는 옵션 제공

3. **ChatView 컴포넌트 리팩토링 ([014-1](./014-1-chatview-refactoring.md))**
   - **(코드 완료 - 기능 테스트 필요)** 큰 컴포넌트를 작은 단위로 분할하고 코드 품질 향상

## 제안 개선 사항
1. **퍼소나 관리 시스템**
   - custom_instruction, 프로필 이미지, 생각중 이미지를 하나의 퍼소나 세트로 통합
   - 설정 UI 개선으로 퍼소나 선택 및 관리 기능 제공
   - 이미지 업로드 및 적용 로직 수정 (현재 업로드해도 적용 안되는 문제 해결)

2. **시각적 분리 및 이미지 표시**
   - 내부 사고 과정에 '생각중' 이미지 표시 (현재 표시되지 않는 문제 해결)
   - 내부 사고 과정과 실제 응답을 다른 색상이나 스타일로 구분
   - 내부 사고 과정은 기본적으로 접혀 있고, 필요시 펼칠 수 있는 토글 기능 추가

3. **레이블 및 이미지 관리**
   - 내부 사고 과정에는 "AI의 내부 분석" 레이블과 '생각중' 이미지 표시
   - 실제 응답에는 "AI 응답" 레이블과 프로필 이미지 표시
   - 에이전트별 이미지 asset 관리 개선

4. **사용자 설정**
   - 사용자가 내부 사고 과정 표시 여부를 설정할 수 있는 옵션 제공
   - 퍼소나 선택 및 커스터마이징 옵션 제공
   - 개발자 모드와 일반 사용자 모드 구분 (개발자는 내부 과정 볼 수 있음)

## 기대 효과
- 사용자 혼란 감소 및 의사소통 명확성 향상
- 일관된 퍼소나 경험으로 사용자 몰입도 증가
- 시작 시 에이전트 선택 기능 구현을 위한 기반 마련
- 이미지 관련 버그 수정으로 사용자 경험 향상

## 우선순위
- 중요도: 높음
- 긴급성: 중간
- **1순위**: 퍼소나 관리 시스템 (더 중요)
- **2순위**: 내부 사고 과정 표시 개선

## 담당자
- 알파
- 루크

## 일정
- 퍼소나 관리 시스템 설계: 1일
- 이미지 관련 버그 수정: 1일
- 내부 사고 과정 표시 개선: 1일
- 통합 테스트 및 피드백: 1일
- 배포: 1일

## 참고 사항
이 작업은 크게 두 가지 주요 개선을 포함합니다:
1. **퍼소나 관리 개선**: custom_instruction과 에이전트 이미지를 통합 관리하여 일관된 퍼소나 경험을 제공하고, 향후 시작 시 에이전트 선택 기능의 기반을 마련합니다.
2. **내부 사고 과정 표시 개선**: 사용자가 AI의 내부 사고 과정과 실제 응답을 명확히 구분할 수 있도록 하며, 적절한 이미지 표시로 사용자 경험을 향상시킵니다.

특히 프로필 이미지와 생각중 이미지 관련 현재 발생하는 문제(변경 안됨, 표시 안됨)를 우선적으로 해결하여 기본 기능이 원활히 작동하도록 합니다.

**추가 개발 원칙 (2025-04-25):**
- 코드 분석 중 일정 길이 이상(기준: 400 라인)으로 길거나 복잡한 파일을 발견하면, 해당 태스크 문서에 리팩토링 계획을 먼저 기록합니다.
- 리팩토링은 관련 기능을 여러 개의 작은 파일로 분리하는 방향으로 진행하며, 이는 입력 토큰 증가를 억제하고 코드 유지보수성을 높이기 위함입니다.

## 코드 분석 및 작업 계획 (2025-04-25)

### 분석 대상 파일
- `webview-ui/src/components/settings/SettingsView.tsx` (513 라인)
- `webview-ui/src/components/settings/ApiOptions.tsx` (1776 라인)
- `webview-ui/src/components/settings/ModeSettingsView.tsx` (403 라인)
- `src/core/webview/Controller.ts`
- `src/core/state/ExtensionState.ts`
- `webview-ui/src/context/ExtensionStateContext.tsx`

### 리팩토링 필요 파일 식별 (기준: 400 라인 초과)
- **`webview-ui/src/components/settings/ApiOptions.tsx` (1776 라인): 리팩토링 1순위**
- `webview-ui/src/components/chat/ChatRow.tsx` (1512 라인): 리팩토링 완료
- `webview-ui/src/components/chat/ChatView.tsx` (1170 라인): 리팩토링 완료
- `webview-ui/src/components/settings/SettingsView.tsx` (513 라인): 리팩토링 완료
- `webview-ui/src/components/settings/ModeSettingsView.tsx` (403 라인): 리팩토링 완료

### `ApiOptions.tsx` 분석 및 리팩토링 계획

**분석:**
- 단일 컴포넌트가 모든 API 제공자(OpenAI, Anthropic, Ollama, OpenRouter, Bedrock, Gemini, DeepSeek, Mistral, Qwen, Requesty, Together, VSCode LM, LM Studio, LiteLLM, AskSage, X AI, SambaNova, Caret)의 설정을 처리합니다.
- 각 제공자별 UI가 조건부 렌더링으로 복잡하게 얽혀 있습니다.
- 파일 길이가 1776 라인으로 매우 길어 가독성, 유지보수성, 입력 토큰 관리에 문제가 있습니다.

**리팩토링 계획:**
1. **API 제공자별 컴포넌트 분리:**
    - `ApiOptions.tsx` 내 각 제공자 설정 로직을 별도 컴포넌트 파일로 분리합니다. (예: `AnthropicOptions.tsx`, `OpenAiOptions.tsx`, `OllamaOptions.tsx` 등)
    - 각 컴포넌트는 해당 제공자 설정에 필요한 상태와 로직만 포함하도록 합니다.
2. **`ApiOptions` 역할 축소:**
    - 최상위 API 제공자 선택 드롭다운과, 선택된 제공자에 맞는 설정 컴포넌트를 동적으로 로드/렌더링하는 역할만 수행하도록 변경합니다.
3. **공통 로직 분리:**
    - `normalizeApiConfiguration` 함수, `ModelInfoView` 컴포넌트 등 공통 유틸리티/컴포넌트를 분리합니다.
4. **상태 관리 검토:**
    - 각 제공자별 설정 상태 관리 방식을 검토하여 컴포넌트 분리에 맞게 조정합니다.

**결정:** Task #014의 퍼소나 관련 기능 구현 전에 `ApiOptions.tsx` 리팩토링을 먼저 진행합니다.

### `SettingsView.tsx` 분석 및 리팩토링 계획 (2025-04-25)

**분석:**
- 파일 길이: 513 라인 (400 라인 기준 초과)
- 주요 역할: 설정 UI의 메인 컨테이너 역할 수행
    - 프로필 이미지 (기본/생각 중) 설정 섹션
    - 사용자 기본 규칙 (Custom Instructions) 섹션
    - 모드 설정 (`ModeSettingsView` 컴포넌트 렌더링) 섹션
    - 익명 오류 및 사용량 보고 섹션
    - 상태 초기화 섹션
    - 전체 설정 저장 (`handleSubmit`) 로직 처리
    - 프로필 이미지 선택/초기화 액션 처리 (`vscode.postMessage` 사용)
    - 레거시 Plan/Act 모드 전환 로직 포함 (`handleTabChange`, `getCurrentModeType`)
    - 상단 고정 헤더 및 하단 푸터 포함

**리팩토링 필요성:**
- 파일 길이가 길어 가독성 및 유지보수성이 저하됨
- 여러 설정 섹션의 로직이 한 파일에 혼재되어 있음
- 레거시 모드 관련 로직 정리 필요

**리팩토링 계획:**
1. **설정 섹션별 컴포넌트 분리:**
    - 각 `<SettingsSection>`을 별도 컴포넌트 파일로 분리합니다.
    - `settings_ui/` 디렉토리 생성:
        - `ProfileImageSettings.tsx`: 기본/생각 중 이미지 미리보기, 버튼, 관련 로직 포함
        - `CustomInstructionsSettings.tsx`: 사용자 기본 규칙 텍스트 영역 관리
        - `TelemetrySettings.tsx`: 익명 보고 관련 UI 및 로직
        - `StateResetSettings.tsx`: 상태 초기화 버튼 및 설명
2. **`SettingsView.tsx` 역할 축소:**
    - 분리된 섹션 컴포넌트들을 가져와 렌더링하는 역할만 수행하도록 변경합니다.
    - 필요한 상태와 핸들러를 props로 전달하거나 Context API를 활용합니다.
3. **로직 정리 및 단순화:**
    - `handleSubmit` 함수 검토: 유효성 검사 로직 명확화, `postMessage` 호출 통합 가능성 검토, 주석 처리된 레거시 코드 제거
    - 레거시 Plan/Act 모드 전환 로직 (`handleTabChange`, `getCurrentModeType` 등) 제거 또는 `ModeSettingsView`와 통합하여 리팩토링
4. **상태 관리 검토:**
    - `SettingsView`의 로컬 상태 중 일부를 분리된 자식 컴포넌트로 이동하거나 Context API 사용을 검토합니다.
5. **코드 정리:**
    - 사용하지 않는 import, 주석 처리된 코드 등을 정리합니다.

**결정:** Task #014의 퍼소나 관련 기능 구현 전에 `SettingsView.tsx` 리팩토링을 진행합니다.

### `ModeSettingsView.tsx` 분석 및 리팩토링 계획 (2025-04-25)

**분석:**
- 파일 길이: 403 라인 (400 라인 기준 살짝 초과)
- 주요 역할: 다양한 AI 모드(Plan, Do, Rule 등)의 설정을 관리하는 UI
    - `VSCodePanels`를 사용하여 각 모드 설정을 탭으로 분리하여 표시
    - 각 모드의 이름, 설명, 규칙(rules)을 편집하는 UI 제공 (`renderTabContent` 함수)
    - 모드 설정 데이터를 로드(`useEffect` 내 `loadModesConfig`), 저장(`saveAllModeSettings`), 기본값 복원(`resetToDefaults`)하는 로직 포함 (`vscode.postMessage` 사용)
    - `ExtensionState`의 `availableModes`를 기반으로 동적으로 탭 생성
    - 내부 상태(`modeSettings`, `activeTab`)로 UI 및 데이터 관리

**리팩토링 필요성:**
- 파일 길이가 기준을 약간 초과했으며, 여러 책임(데이터 관리, UI 렌더링, 탭 관리)이 혼재되어 있음
- 개별 모드 설정 UI(`renderTabContent`)와 데이터 관리 로직(로드/저장/초기화)을 분리하면 가독성과 유지보수성이 향상될 수 있음

**리팩토링 계획:**
1. **개별 모드 설정 UI 컴포넌트 분리:**
    - `renderTabContent` 함수의 내용을 별도 컴포넌트 파일(`ModeTabContent.tsx`)로 분리합니다.
    - 이 컴포넌트는 단일 모드의 이름, 설명, 규칙을 표시하고 수정하는 역할을 담당하며, 필요한 데이터와 업데이트 핸들러를 props로 받습니다.
    - `settings_ui/` 또는 `mode_settings_ui/` 디렉토리 생성 고려
2. **모드 설정 관리 로직 커스텀 훅 분리:**
    - 모드 설정 데이터(`modeSettings` 상태)와 관련된 로직(로드, 저장, 초기화, 업데이트)을 커스텀 훅(`useModeSettingsManagement.ts`)으로 분리합니다.
    - 이 훅은 `vscode.postMessage`를 통한 백엔드 통신을 포함하여 데이터 관리 책임을 가집니다.
3. **`ModeSettingsView.tsx` 역할 축소:**
    - `useModeSettingsManagement` 훅을 사용하여 모드 설정 데이터와 관련 액션 함수들을 가져옵니다.
    - `VSCodePanels`, `VSCodePanelTab`을 렌더링하여 탭 구조를 관리합니다.
    - 활성 탭에 해당하는 `ModeTabContent` 컴포넌트를 렌더링하고 필요한 props를 전달합니다.
    - 전체적인 레이아웃(헤더, 푸터 버튼 등)을 유지합니다.
4. **코드 정리:**
    - `@ts-nocheck` 주석 제거 시도 (타입 문제 해결 후)
    - 불필요한 콘솔 로그 정리

**결정:** `SettingsView.tsx` 리팩토링 이후, `ModeSettingsView.tsx` 리팩토링을 진행하여 코드 구조를 개선합니다.

### `ChatRow.tsx` 리팩토링 계획 (2025-04-24)

**분석:**
- `ChatRow.tsx`는 1512 라인으로 매우 길며, 대화 메시지의 렌더링을 담당합니다.
- 메인 컴포넌트 ChatRow와 ChatRowContent가 있으며, ChatRowContent가 특히 거대합니다 (약 1300 라인).
- 다양한 메시지 유형(도구 호출, 완료 결과, 명령 출력 등)을 처리하는 복잡한 조건부 렌더링 로직이 포함되어 있습니다.
- 아바타 이미지, 스타일, 마크다운 렌더링 등의 UI 로직도 포함됩니다.

**리팩토링 계획:**

1. **메시지 유형별 렌더러 분리:**
   - 각 메시지 유형(tool, command, completion_result 등)을 렌더링하는 로직을 별도 컴포넌트로 분리
   - `chat_renderers` 디렉토리 생성: `ToolRenderer.tsx`, `CommandRenderer.tsx`, `CompletionRenderer.tsx` 등

2. **UI 컴포넌트 분리:**
   - 아바타, 메시지 스타일 등 공통 UI 요소를 `chat_ui` 디렉토리로 분리
   - `ChatAvatar.tsx`, `MessageContainer.tsx` 등 생성

3. **유틸리티 함수 분리:**
   - 메시지 파싱, 분할, 아이콘 생성 등의 유틸리티 함수를 별도 파일로 분리
   - `chat_utils` 디렉토리에 `messageParser.ts`, `iconUtils.ts` 등 생성

4. **ChatRowContent 리팩토링:**
   - 거대한 `renderSpecificContent` 함수를 분할하여 각 메시지 유형별 렌더러로 이동
   - 중앙 라우팅 로직만 남기고 실제 렌더링은 적절한 컴포넌트에 위임

5. **타입 정의 정리:**
   - 중복된 타입 정의 제거 및 일관된 인터페이스 설계
   - 각 컴포넌트가 필요한 최소한의 props만 받도록 수정

구현 순서:
1. 디렉토리 구조 설정 및 기본 파일 생성
2. 공통 UI 컴포넌트 추출
3. 유틸리티 함수 분리
4. 메시지 유형별 렌더러 개발
5. ChatRow 및 ChatRowContent 리팩토링

### 다음 단계
1. `ApiOptions.tsx` 리팩토링 실행 (새로운 태스크로 분리 가능성 검토)
2. 다른 긴 파일들(`ChatRow.tsx`, `ChatView.tsx`, `SettingsView.tsx`, `ModeSettingsView.tsx`) 분석 및 리팩토링 계획 수립
3. Task #014 목표 기능 구현 시작 (퍼소나 관리 및 UI 개선)
    - `SettingsView.tsx`에서 퍼소나 관련 UI (이미지, custom instruction) 확인 및 필요시 수정
    - `SettingsView.tsx`의 레거시 모드 관련 코드 제거 (`handleTabChange` 등)
    - `ChatView.tsx`, `ChatRow.tsx`에서 `<thinking>` 표시 및 이미지 로직 확인/개선
    - `Controller.ts` 및 상태 관리 로직에서 퍼소나 데이터 통합 및 이미지 처리 로직 확인/개선

### `ApiOptions.tsx` 리팩토링 진행상황 (2025-04-24)

**완료된 컴포넌트:**
1. AnthropicOptions
2. OpenAiNativeOptions
3. DeepSeekOptions
4. QwenOptions (API 키 링크 추가)
5. MistralOptions
6. BedrockOptions
7. VertexOptions (불필요 속성 제거)
8. GeminiOptions
9. OpenAiCompatOptions (타입 오류 해결)
10. RequestyOptions
11. TogetherOptions

**아직 만들어야 할 컴포넌트:**
1. OllamaOptions
2. LmStudioOptions 
3. VSCodeLmOptions
4. LiteLLMOptions
5. XAIOptions
6. SambanovaOptions
7. CaretOptions

**통합 과정에서 문제 발생:**
- OpenRouterOptions 컴포넌트는 만들었으나 ApiOptions.tsx에 통합 과정에서 문제 발생
- 모든 컴포넌트 분리 작업 완료 후 이 문제 해결 예정

**2025-04-24 진행상황:**

완료된 컴포넌트 분리 및 적용:
1. OpenAiCompatOptions
2. RequestyOptions
3. TogetherOptions
4. OllamaOptions
5. LmStudioOptions 
6. VSCodeLmOptions
7. LiteLLMOptions
8. XAIOptions
9. SambanovaOptions
10. CaretOptions

**다음 작업:**
1. 남은 컴포넌트 분리하기:
   - AskSageOptions
   - AnthropicOptions
   - OpenAIOptions (Native)
   - DeepSeekOptions
   - QwenOptions
   - MistralOptions
   - BedrockOptions
   - OpenRouterOptions (이전에 문제가 있었던 부분)

2. 모든 컴포넌트 적용 후:
   - 빌드 테스트 실행
   - lint 오류 수정
   - 작업 로그 업데이트

**2025-04-24 추가 메모:**

OpenRouterOptions 통합 이슈:
1. OpenRouterOptions 컴포넌트는 이미 생성되어 있음
2. 문제점: ApiOptions.tsx에서 다음과 같이 중복 사용되고 있음
   ```typescript
   {selectedProvider === "openrouter" && (
     <div>
       <VSCodeTextField
         value={apiConfiguration?.openRouterApiKey || ""}
         ...
       </VSCodeTextField>
       <OpenRouterOptions apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} uriScheme={uriScheme} />
     </div>
   )}
   ```
3. 해결 방법: 
   - OpenRouterOptions.tsx 컴포넌트 내용 확인 (이미 API 키 입력 필드 포함)
   - ApiOptions.tsx에서 OpenRouter 부분을 다른 컴포넌트처럼 교체
   - 만약 통합에 문제 발생 시 git에서 이전 버전 확인하여 비교

현재까지 진행된 작업:
- AskSageOptions 생성 및 통합 완료
- QwenOptions 수정 및 통합 완료
- 다른 컴포넌트들은 이미 생성되어 있음 확인

다음 작업:
1. OpenRouterOptions 통합 문제 해결
2. 모든 컴포넌트가 올바르게 적용되었는지 최종 점검
3. 빌드 테스트 진행
4. 문제 발생 시 백업 버전으로 복원 고려

**2025-04-24 추가 진행 상황:**

1. OpenRouterOptions 통합 문제 해결
   - ApiOptions.tsx에서 중복된 코드 제거
   - OpenRouterOptions 컴포넌트만 사용하도록 수정 완료

현재 상태:
- 모든 API 제공자 옵션 컴포넌트가 성공적으로 리팩토링 및 통합 완료
- 필요한 imports가 모두 확인됨 (60-74줄)
- 기존 API 제공자 옵션들이 개별 컴포넌트로 대체됨

다음 단계:
1. 빌드 테스트에서 발견된 오류는 우리 작업과 무관한 AccountView.tsx의 CountUp 컴포넌트 관련 문제
2. 작업 로그 업데이트
3. 모든 작업이 완료되었으므로 PR 준비 가능

## 2025-04-24: ChatRow 컴포넌트 리팩토링 중간 진행

작업 내용:
1. `ChatRow.tsx` 파일의 타입 오류 수정
   - `message.id` 타입 오류 해결 (CheckpointControls 대신 직접 버튼 렌더링으로 변경)
   - `getScrollHeight` 대신 `getBoundingClientRect()` 사용하도록 변경
   - `onHeightChange` props 추가 및 높이 변경 감지 로직 추가

2. `ChatRowContent.tsx` 파일 수정
   - ExtensionState 접근 방식 수정 (context 직접 사용)
   - settings 대신 extensionState.alphaAvatarUri로 직접 접근

3. 렌더러 컴포넌트 오류 수정
   - `CommandRenderer.tsx`: VSCodeButton 임포트 추가, commandResponse → optionsResponse로 타입 수정
   - `ToolRenderer.tsx`: CaretSayTool 관련 타입 문제 해결, CodeBlock props 수정
   - `CompletionRenderer.tsx`: seeNewChanges 메시지 타입 수정
   - `McpRenderer.tsx`: 복잡한 타입 대신 단순한 UI로 대체 (pre 태그 사용)

4. `ProgressIndicator.tsx` 컴포넌트 추가
   - BrowserSessionRow에서 필요한 진행 표시기 컴포넌트 구현

현재 상태:
- ChatRow 컴포넌트 구조 개선 및 주요 타입 오류 수정 진행 중
- 렌더러 컴포넌트들의 TypeScript 오류 수정 중

다음 단계:
1. 빌드 테스트 완료 및 성공 확인
2. 남은 컴포넌트 리팩토링 작업 진행 (BrowserSessionRow, ChatView 등)
3. 전체 작업 완료 후 PR 준비

## 2025-04-24: ChatView 컴포넌트 리팩토링 진행

작업 내용:
1. `ChatView.tsx` 파일 분석 및 리팩토링 계획 수립
   - 큰 컴포넌트를 여러 작은 파일로 분리하기 위한 전략 수립
   - 상태 관리 로직, UI 컴포넌트, 이벤트 핸들러 등 분리

2. 디렉토리 구조 설정
   - `chat_hooks/` - 상태 관리 및 로직 분리를 위한 커스텀 훅 모음
   - `chat_ui/` - UI 컴포넌트 분리
   - `chat_utils/` - 유틸리티 함수 모음

3. 커스텀 훅 구현
   - `useChatInputState.ts` - 텍스트 입력과 이미지 선택 상태 관리
   - `useBrowserSessionState.ts` - 브라우저 세션 관련 상태 관리
   - `useCaretAskState.ts` - 질문 상태 관리 
   - `useMessageState.ts` - 메시지 관련 상태 관리
   - `useModeShortcuts.ts` - 모드 단축키 관리
   - `useScrollControl.ts` - 스크롤 컨트롤 관리

4. UI 컴포넌트 분리
   - `ChatHeader.tsx` - 채팅 헤더 컴포넌트
   - `ChatButtons.tsx` - 채팅 인터페이스 버튼 컴포넌트
   - `ScrollControls.tsx` - 스크롤 컨트롤 UI 컴포넌트
   - `ModeSelector.tsx` - 모드 선택 컴포넌트

5. 빌드 오류 해결
   - 임포트 경로 문제 수정 (`useEvent`를 `react-use`에서 가져오도록 수정)
   - `MAX_IMAGES_PER_MESSAGE` 상수 추가
   - `vscode.postMessage` 호출의 메시지 타입 수정
   - `ApiConfiguration` 타입과 관련된 문제 해결 중

현재 상태:
- 리팩토링을 위한 파일 구조 생성 완료
- 주요 커스텀 훅과 UI 컴포넌트 분리 완료
- 일부 타입 오류 수정 완료
- `normalizeApiConfiguration` 함수 및 관련 타입 문제 해결 중

다음 단계:
1. 남은 타입 오류 해결 (특히 `ApiProvider` 임포트 문제)
2. `ChatView.tsx`와 분리된 컴포넌트들 간의 상태 공유 문제 해결
3. 리팩토링된 코드에 대한 전체 빌드 테스트
4. 기능 테스트 (실제 동작 확인)
