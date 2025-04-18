# 태스크 #009: Cline 다중 모드 핵심 시스템 – 계층적 프롬프트/규칙/모델 로딩 연동

## 태스크 정보
- **태스크 번호**: #009
- **태스크 이름**: Cline 다중 모드 아키텍처 – 계층적 프롬프트/규칙/모델 로딩 시스템 연동 및 개선
- **생성일**: 2025-04-17
- **상태**: 진행 중
- **담당자**: luke, alpha

---

## 목적 및 개요
- 다중 모드(`Arch`, `Dev`, `Rule`, `Talk`, `Empty`) 전환 시, 각 모드에 맞는 프롬프트/규칙 및 **모델 설정**을 계층적으로 로딩하는 시스템을 구현하고, 기존 모드 관리 시스템과 통합합니다.
- 기존 시스템 프롬프트 직접 포함 구조에서 벗어나, 전용 규칙/프롬프트 저장소(`assets/rules/modes.json` 등) 기반 동적 로딩 구조로 개선합니다.

## 주요 개선/연동 사항 (2025-04-18 기준)
- [X] **계층적 규칙/프롬프트/모델 로딩 연동**
    - [X] 모드 변경 시, 해당 모드의 프롬프트/규칙 및 **모델 설정**을 계층적으로 로딩하는 로직 구현 및 연동 (리팩토링 완료)
    - [X] ExtensionState를 통해 웹뷰에 현재 적용된 규칙/프롬프트/모델 상태 전달
    - [X] `modes.json` 외 global-rules, user-rules, 임시 규칙 등 계층적 병합 방식 설계 및 적용
- [X] **UI 연동 및 상태 표시 개선**
    - [X] ChatView.tsx 등에서 현재 모드별 적용 규칙/프롬프트/모델 실시간 표시
    - [X] 모드 선택 버튼 렌더링 문제 해결 (상태 동기화 경로 점검 및 리팩토링)
- [X] **모드 설정 저장소 구조 개선**
    - [X] 시스템 프롬프트 직접 포함 → 전용 설정 저장소 분리 설계 및 적용 (향후 확장성 고려)
    - [X] **모드별 모델 설정 기능 추가**: `modes.json`에 모드별 모델 지정 기능 구현 완료
- [X] **설정 UI 정리 및 개선**
    - [X] 설정 페이지(`ModeSettingsView.tsx` 등)에서 기존 모드(`Plan`, `Act`) 흔적 제거 완료
    - [X] 모드별 모델 선택/설정 UI 추가 완료
- [ ] **불필요/중복 파일 및 코드 정리**
    - [X] `core_system_prompt.json` 등 legacy 프롬프트 파일 삭제 완료
    - [X] Plan/Act 모드 전환 관련 레거시 코드(`shouldSwitchModel`, `toggleModeWithChatSettings` 등) 제거 완료
    - [ ] 불필요 주석/참고자료/메모 정리

---

## 실행 단계 및 진행상황 (요약)
- **완료**:
    - 모드별 규칙/프롬프트 파일 구조 설계 (`modes.json` 등) 및 기본 구현 완료.
    - 모드 전환 및 상태 관리 로직 구현 완료.
    - 모드 설정 편집/저장/리셋 기능 구현 완료.
    - 타입 오류 및 빌드 문제 해결 완료.
    - 설정 UI 한글화 및 모드별 모델 설정 UI 구현 완료.
    - 레거시 모드(`Plan`, `Act`) 관련 코드/UI 요소 제거 및 정리 완료.
    - `shouldSwitchModel` 로직 및 `toggleModeWithChatSettings` 함수 제거 완료.
- **완료된 주요 기능**:
    - [X] **계층적 로딩 로직 구현**: 모드 변경 시 규칙/프롬프트/**모델** 병합 및 로딩 로직 구현 완료.
    - [X] **UI 렌더링/동기화 문제 해결**: 모드 버튼 미표시 문제 해결 및 상태 동기화 개선 완료.
    - [X] **모드별 모델 설정 기능 구현**:
        - [X] 백엔드 로직 추가 (모델 설정 로딩/저장/적용) 완료.
        - [X] 설정 파일 구조 변경 완료: `modes.json`에 모드별 모델 정보 직접 저장.
        - [X] 프론트엔드 UI 구현 완료: 모드별 모델/API 선택 컴포넌트 추가.
    - [X] **설정 UI 정리**: 기존 모드(`Plan`, `Act`) 관련 UI 제거 완료.
- **향후 가능 작업**:
    - [X] **설정 UI 추가 개선**:
        - [X] 설정창에 "설정완료" 버튼 추가 (상단 float 고정, 스크롤 시 유지)
        - [X] "모드 설정" 한글화 및 텍스트 수정
        - [X] 모드 설정 페이지에서 수정사항 자동 저장 기능 추가
        - [X] 가로 스크롤 생성 버그 수정
    - [ ] 코드 리팩토링 추가 개선 및 최적화
    - [ ] 불필요 주석/참고자료/메모 추가 정리
    - [ ] **코드 정리**: 불필요 주석, 로그, 임시 코드 등 제거.
    - [ ] **테스트**: 백엔드 모듈 및 사용자 테스트.

---

## 참고 및 향후 과제
- Task #010: 규칙 관리 UI 개발 (본 태스크와 병렬 진행)
- `modes.json` 파일 구조는 시스템 프롬프트에 직접 포함되는 규칙 파일에서, 향후 전용 설정 저장소(모델 설정 포함)로 분리/개선 필요.
- 계층적 병합/로딩 방식 및 상태 전달 구조는 확장성(추가 모드, 사용자 규칙, 모델 설정 등) 고려해 설계.

---

## 최종 분석 요약 및 향후 상세 작업 계획 (2025-04-18 기준)

**최종 분석 요약:**

*   **모드별 모델 설정 기능:** 현재 전혀 구현되어 있지 않음. 설정 파일(`modes.json`), 타입 정의(`ChatSettings.ts`), 백엔드 로직(`Controller.ts`), 프론트엔드 UI(`ModeSettingsView.tsx`) 모두 해당 기능 누락.
*   **레거시 모드 흔적:** 설정 UI 코드(`ModeSettingsView.tsx`의 초기 상태값, `defaultModes` 상수)와 백엔드 코드(`Controller.ts`의 `resetModesToDefaults`, `DEFAULT_CHAT_SETTINGS`)에 이전 모드(Plan, Act, Do, strategy) 관련 내용 잔존. 정리 필요.
*   **UI 렌더링 문제:** 채팅창에 모드 버튼 미표시 문제 존재. 해결 필요. (이번 분석에서 직접 원인 파악 X)
*   **계층적 로딩:** 모드 변경 시 규칙/프롬프트/모델 설정을 계층적으로 병합하는 핵심 로직 미구현.

**향후 상세 작업 계획:**

1.  **UI 렌더링 문제 해결**:
    *   `ChatView.tsx` 및 관련 컴포넌트 분석하여 모드 버튼 미표시 원인 파악.
    *   상태 관리(`ExtensionStateContext.tsx`) 및 메시지 전달(`Controller.ts`) 로직 점검하여 동기화 문제 해결.
2.  **모드별 모델 설정 기능 구현**:
    *   **설정 파일 구조 정의**: `assets/rules/modes.json`에 `model` 필드 추가 또는 별도 파일 구조 설계 및 `src/shared/ChatSettings.ts` 타입 업데이트.
    *   **백엔드 로직 구현 (`Controller.ts`)**:
        *   모드 변경 시 해당 모드의 모델 설정 로드 로직 추가.
        *   모델 설정 저장/리셋 핸들러(`saveModeSettings`, `resetModesToDefaults`) 수정/추가.
        *   로드된 모델 설정을 `ExtensionState`에 반영 및 웹뷰 전달 로직 추가.
    *   **프론트엔드 UI 구현 (`ModeSettingsView.tsx`)**:
        *   모드별 모델 선택 UI(드롭다운 등) 추가.
        *   선택된 모델 설정 저장 로직 연동.
3.  **계층적 로딩 로직 구현 (`Controller.ts`)**:
    *   모드 변경 시 Global Rules, Project Rules (`.caretrules`), Mode Rules (`modes.json`) 및 임시 규칙 병합 로직 구현.
    *   병합된 최종 규칙/프롬프트/모델 설정을 `ExtensionState`에 반영.
4.  **레거시 코드 정리**:
    *   **설정 UI 정리 (`ModeSettingsView.tsx`)**: 기존 `Plan`, `Act` 모드 관련 UI 코드 및 로직(초기 상태값, `defaultModes` 등) 완전히 제거.
    *   **백엔드 정리 (`Controller.ts`)**: `resetModesToDefaults` 핸들러의 경로 및 기본값 수정, `DEFAULT_CHAT_SETTINGS`의 기본 모드 값 수정 (`"strategy"` -> 예: `"arch"`).
5.  **코드 정리**:
    *   개발 중 추가된 임시 주석, `console.log` 등 디버깅 코드 제거.
    *   사용하지 않는 변수, 함수, 임포트 정리.
6.  **테스트**:
    *   각 기능 구현 후 단위/통합 테스트 수행.
    *   전체 기능 구현 후 사용자 시나리오 기반 테스트 수행.

---

## 추가 작업 요구사항 (2025-04-18 00:34)

**1. 설정 UI 한글화 및 재구성:**

1. ✅ "Settings" 항목을 "설정"으로 변경
2. 레거시 항목 정리:
   - ✅ 상단 Plan/Act 모드 탭 삭제 (현재는 Arch, Dev 등의 새 모드 사용)
   - ✅ 모드별 설정이 있으니 탭 위에 표시되는 API Provider 삭제
   - ✅ "Use different models for Plan and Act modes" 옵션 삭제
3. UI 요소 재배치:
   - ✅ AI 에이전트 프로필 이미지 설정을 최상단으로 (기본 이미지, 생각 중 이미지 두개 설정 UI 추가)
   - ✅ "Custom Instructions"를 "사용자 기본 규칙"으로 변경
   - ✅ 중복된 Done 버튼은 하나만 남기고 "설정완료"로 변경
   - ✅ "Mode Settings"를 "모드 설정"으로 변경
   - ✅ 모드별 모델 설정 추가 (API Provider, API Key, Model 선택 및 "모든 모드에 적용" 버튼 추가)
   - ✅ 익명 오류 보고 관련 설정을 한글로 번역하고 최하단으로 이동

## 추가 분석 결과 (2025-04-18 01:10)

**1. UI 렌더링 문제 원인 분석:**

- `Controller` 클래스에 `availableModes` 배열은 선언되어 있고, `loadAvailableModes` 함수도 구현되어 있으나 웹뷰 시작 시점에 호출되는 코드가 없음
- `getStateToPostToWebview` 함수에서 웹뷰에 상태를 전송할 때 `availableModes`를 포함하지만, 이 함수가 적절한 시점에 호출되지 않는 것으로 보임
- 생성자에서 `loadAvailableModes`를 호출하지 않고 있으며, 주석에 의하면 `webviewDidLaunch` 메시지 핸들러에서 처리해야 하지만 실제 코드는 구현되지 않음
- `handleWebviewMessage` 함수 내에 `webviewDidLaunch` 케이스가 없어 웹뷰 시작 시 모드 로딩이 일어나지 않음

**2. 모드별 모델 설정 기능 미구현:**

- `modes.json` 파일에 모델 설정 필드가 없음
- 모드별 다른 모델을 사용하도록 하는 로직이 전혀 구현되어 있지 않음
- `ChatSettings` 타입에 모드별 모델 정보를 저장할 구조 부재

**3. 레거시 코드 잔존:**

- `resetModesToDefaults` 함수에서 경로 불일치: `assets/rules/modes.json`이 아닌 `agents-rules/alpha/modes.json` 참조
- 기본 모드 설정에 `plan`, `do` 등 레거시 모드가 포함됨
- `modetype` 필드 (`"plan"` 또는 `"act"`)가 여전히 사용 중이며 제거되지 않음

## 모드별 모델 설정 버그 분석 (2025-04-18 11:45)

**문제 분석:**

1. **파일 경로 불일치:**
   - `assets/rules/modes.json`과 `assets/rules/default_modes.json`에 모드 설정이 있으나, `Controller.ts`의 `resetModesToDefaults` 함수에서 `agents-rules/alpha/modes.json` 경로를 참조하고 있음 → 초기화/리셋 기능이 제대로 작동하지 않음
   - 모드 설정 파일 구조가 일관되지 않아 로드 오류 발생 가능성 있음

2. **모델 설정 데이터 불일치:**
   - `toggleModeWithChatSettings` 함수에서 모델 ID 파싱 및 처리 로직이 일부 경우(provider가 있는 경우)에만 적용됨
   - 특히 `modelId.split('/')` 로직이 일관되게 적용되지 않음(모델 ID 형식에 따라 다르게 처리됨)
   - `apiProvider`와 실제 로딩되는 모델 ID 간 매핑 로직이 명확하지 않음

3. **웹뷰 초기화 시 타이밍 문제:**
   - `webviewDidLaunch` 메시지 처리는 구현되어 있으나, 모드 정보 로딩 후 UI 업데이트 시점 불일치
   - 모드 변경 시 상태 업데이트와 웹뷰 통신 간 타이밍 이슈로 일부 상황에서 UI 갱신되지 않음

4. **레거시 코드 간섭:**
   - `planActSeparateModelsSetting` 같은 레거시 설정과 새 모드별 모델 설정 시스템이 충돌
   - `shouldSwitchModel` 로직이 여전히 구 `plan`/`act` 시스템에 기반해 작동하며 새 모드 시스템 무시
   - 코드에 `previousModeModelId` 관련 로직이 남아있어 새 모드별 모델 설정을 방해

**해결 방안:**

1. **파일 경로 수정:**
   ```typescript
   // resetModesToDefaults 함수의 경로 수정
   const defaultModesPath = path.join(this.context.extensionPath, "assets", "rules", "default_modes.json")
   const userModesPath = path.join(this.context.extensionPath, "assets", "rules", "modes.json")
   ```

2. **모델 ID 처리 통합:**
   ```typescript
   // toggleModeWithChatSettings 함수에서 일관된 모델 ID 처리
   if (currentMode?.model) {
       const modelId = currentMode.model
       let provider = currentMode.apiProvider || "anthropic" // 기본값 설정
       let modelName = modelId
       
       // provider/model 형식 처리
       if (modelId.includes('/')) {
           const [providerPart, modelPart] = modelId.split('/')
           provider = providerPart
           modelName = modelPart
       }
       
       // API Provider에 따른 설정 적용
       switch (provider) {
           case "anthropic": 
               await updateGlobalState(this.context, "apiProvider", "anthropic")
               await updateGlobalState(this.context, "apiModelId", modelName)
               break
           case "openai":
               await updateGlobalState(this.context, "apiProvider", "openai")
               await updateGlobalState(this.context, "openAiModelId", modelName)
               break
           // 다른 프로바이더 케이스...
       }
   }
   ```

3. **모드 로딩 및 상태 업데이트 개선:**
   ```typescript
   // 웹뷰 초기화 시 모드 데이터 로딩 및 즉시 상태 업데이트 보장
   case "webviewDidLaunch": {
       await this.loadAvailableModes()
       // 상태 갱신 및 즉시 전송
       this.postMessageToWebview(this.getStateToPostToWebview())
       break
   }
   ```

4. **레거시 코드 제거:**
   - `shouldSwitchModel` 로직 및 연관 코드 삭제
   - `modetype` 필드 사용 중단
   - `previousModeModel*` 관련 전역 상태 저장 대신 모드별 설정으로 통합

## 백엔드 연동 작업 완료 (2025-04-18 01:18)

**모드별 모델 및 API 연동 구현:**

1. **백엔드 변경사항**:
   - `Controller.ts`에 모드별 모델 설정 적용 로직 구현 완료
   - 모델 ID 파싱 및 API 제공자 자동 매핑 (예: `anthropic/claude-3-5-sonnet` → Anthropic API)
   - 모드별 API 키 지원 (각 모드마다 다른 API 키 사용 가능)
   - ModeInfo 인터페이스에 `apiKey` 및 `apiProvider` 필드 추가

2. **설정 파일 업데이트**:
   - `modes.json` 파일에 `apiProvider` 필드 추가
   - 각 모드마다 개별 API 제공자 지정 가능

3. **지원하는 API 제공자**:
   - Anthropic: `anthropic/claude-3-5-sonnet` 또는 `claude-3-5-sonnet`
   - OpenAI: `openai/gpt-4o` 또는 `gpt-4o`
   - Gemini: `google/gemini-1.5-pro`
   - Ollama: `ollama/llama3`
   - DeepSeek: `deepseek/deepseek-chat`
   - 기타 모델: OpenRouter로 자동 라우팅

4. **기타 개선사항**:
   - 타입 안전성 향상 (SecretKey 타입 오류 해결)
   - 모드 전환 시 자동으로 해당 모드의 모델 설정 적용

## 모드별 모델 설정 수정 계획 (2025-04-18 11:50)

**즉시 수정이 필요한 코드:**

1. **Controller.ts 파일에서 수정할 부분:**

   ```typescript
   // 1. 파일 경로 수정 (resetModesToDefaults 함수)
   const defaultModesPath = path.join(this.context.extensionPath, "assets", "rules", "default_modes.json")
   const userModesPath = path.join(this.context.extensionPath, "assets", "rules", "modes.json")
   
   // 2. 모델 ID 파싱 통합 (toggleModeWithChatSettings 함수)
   private async toggleModeWithChatSettings(mode: string, settings: ChatSettings) {
       // ... 기존 코드 유지 ...
       
       // 현재 모드 정보 찾기
       const currentMode = this.availableModes.find(m => m.id === mode)
       
       // 모드별 모델 설정 적용
       if (currentMode?.model) {
           this.logger.log(`모드별 맞춤 모델 감지됨: ${currentMode.id} => ${currentMode.model}`)
           
           // API Provider 결정 (모드 설정 또는 기본값)
           const apiProvider = currentMode.apiProvider || "anthropic"
           let modelName = currentMode.model
           
           // provider/model 형식 처리 (일관된 방식으로)
           if (modelName.includes('/')) {
               const [providerPart, modelPart] = modelName.split('/')
               // provider 부분이 있으면 우선 적용, 없으면 apiProvider 사용
               await updateGlobalState(this.context, "apiProvider", providerPart || apiProvider)
               modelName = modelPart
           } else {
               // 명시적 provider 없는 경우 모드의 apiProvider 사용
               await updateGlobalState(this.context, "apiProvider", apiProvider)
           }
           
           // 각 API Provider에 맞게 설정 업데이트
           switch (apiProvider.toLowerCase()) {
               case "anthropic":
                   await updateGlobalState(this.context, "apiModelId", modelName)
                   break
               case "openai":
                   await updateGlobalState(this.context, "openAiModelId", modelName)
                   break
               case "google":
               case "gemini":
                   // Gemini 처리
                   break
               // 다른 제공자 케이스 처리...
               default:
                   // 알 수 없는 제공자는 OpenRouter로 라우팅
                   await updateGlobalState(this.context, "openRouterModelId", modelName)
           }
           
           // API 키 업데이트 (모드별 API 키가 있는 경우)
           if (currentMode.apiKey) {
               switch (apiProvider.toLowerCase()) {
                   case "anthropic":
                       await updateGlobalState(this.context, "anthropicApiKey", currentMode.apiKey)
                       break
                   case "openai":
                       await updateGlobalState(this.context, "openAiApiKey", currentMode.apiKey)
                       break
                   // 다른 API 키 처리...
               }
           }
       }
       
       // 레거시 코드 제거 - 다음 코드 블록 삭제:
       // const shouldSwitchModel = planActSeparateModelsSetting === true
       // if (shouldSwitchModel) { ... }
   }
   ```

2. **레거시 코드 정리 작업:**

   ```typescript
   // DEFAULT_CHAT_SETTINGS에서 레거시 모드 제거
   private readonly DEFAULT_CHAT_SETTINGS: ChatSettings = {
       mode: "arch", // "strategy" -> "arch"로 변경
       rulesCollapsed: false,
       useSharedHistory: false
   }
   ```

3. **웹뷰 초기화 핸들러 수정:**

   ```typescript
   case "webviewDidLaunch": {
       // 모드 데이터 로딩
       await this.loadAvailableModes()
       
       // 상태 갱신 및 즉시 전송
       const state = this.getStateToPostToWebview()
       this.postMessageToWebview(state)
       
       // 모델 목록도 로드하여 바로 전송
       this.refreshModelLists()
       break
   }
   
   // 모델 목록 로드 헬퍼 함수 추가
   private async refreshModelLists() {
       const openRouterModels = await this.readOpenRouterModels()
       this.postMessageToWebview({ type: "openRouterModels", openRouterModels })
       
       try {
           const ollamaModels = await this.getOllamaModels()
           if (ollamaModels) {
               this.postMessageToWebview({ type: "ollamaModels", ollamaModels })
           }
       } catch (error) {
           this.logger.log("Ollama 모델 로드 실패: " + error)
       }
       
       // 다른 모델 제공자 로드...
   }
   ```

**추가 개선 사항:**

1. **모드별 모델 설정 저장 로직 개선:**
   - `saveModeSettings` 함수에서 모드별 모델 설정 저장 로직 추가
   - 모델 ID, API 제공자, API 키 저장 기능 강화

2. **오류 처리 강화:**
   - 모드별 설정 로딩 및 적용 시 오류 처리 개선
   - 파일 불일치나 잘못된 설정 감지 시 기본값으로 안전하게 대체

3. **모드 설정 편집 UI 연동:**
   - `ModeSettingsView.tsx`에서 모델 선택 시 올바른 포맷으로 저장되도록 수정
   - API 제공자와 모델 ID를 일관된 형식(`provider/model` 또는 개별 필드)으로 관리
