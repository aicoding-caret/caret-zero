# Task #014-2: 퍼소나 관리 시스템 설계 및 구현 계획 (v2 - 언어 설정 분리 반영)

## 구현시 필수 지침

- 본 퍼소나 관리 기능(및 관련 설정, 이미지 업로드 등)은 반드시 [`caret-docs/development/ui-to-storage-flow.md`](../development/ui-to-storage-flow.md) 문서의 표준 흐름에 따라 구현하세요.
    - UI 입력 → postMessage → Extension 저장 → 불러오기/동기화의 일관된 구조를 따릅니다.
    - 기존에 임의로 구현된 로컬 상태, 임시 저장 등은 모두 삭제하고, 본 방식으로 재구현해야 합니다.
- 기존 구현사항이 남아 있으면 반드시 제거 후, 본 문서 기준으로 통일하세요.

## 1. 목표

- **퍼소나 역할/성격 관리**: 퍼소나의 고유한 역할, 성격, 배경 설정을 `customInstructions` (영문 권장)로 정의하고, 이미지와 함께 '퍼소나(Persona)' 단위로 관리한다.
- **언어 설정 분리**: AI의 응답 언어 설정을 퍼소나 설정과 분리하여 다국어 환경을 지원한다.
- **외부 파일 기반 관리**: 퍼소나 목록(`customInstructions` 포함)을 사용자가 접근 가능한 외부 JSON 파일(예: `.vscode/caret/personas.json`)로 관리하여 추가/편집 용이성을 높인다.
- **상태 관리 개선**: 외부 파일에서 로드한 퍼소나 데이터와 별도의 언어 설정을 확장 프로그램 상태(`ExtensionState`)에서 관리하고, 변경 시 파일 또는 설정에 다시 저장한다.
- **사용자 편집 기능**: 사용자가 UI를 통해 퍼소나(영문 `customInstructions` 포함)를 추가, 편집, 삭제할 수 있도록 지원한다.
- **기본 퍼소나 제공 및 복원**: 확장 프로그램에서 제공하는 기본 퍼소나(영문 `customInstructions` 포함)를 정의하고, 사용자가 이를 복원할 수 있는 기능을 제공한다.
- **UI 개선**: 설정 화면에서 사용자가 언어 및 퍼소나를 목록에서 선택하고 관리(추가/편집/삭제/복원)할 수 있도록 UI를 개선한다.
- **기능 버그 수정**: 현재 프로필 이미지 변경/적용 관련 문제를 해결한다.
- **확장성**: 향후 시작 시 퍼소나 선택 등 다양한 기능을 구현할 수 있는 기반을 마련한다.

## 2. 설계 방안

---

### 🚨 [중요 정책] 커스텀 퍼소나 초기화/삭제 정책 명확화

- "기본값으로 초기화" 시 **기본 퍼소나(4+1)만 원상복구**합니다.
- **사용자가 직접 추가한 커스텀 퍼소나**는 절대 삭제/변경되지 않습니다.
    - 커스텀 퍼소나는 **개별 삭제**만 허용(휴지통 버튼 등)
    - 초기화 버튼에는 "커스텀 퍼소나는 영향을 받지 않습니다" 안내문을 반드시 표시
- 기존 코드에 "초기화 시 커스텀 퍼소나 삭제" 로직이 남아 있다면 반드시 제거
- 구현/리팩토링 시 본 정책 위반 가능성, 혼동 가능성(예: 임시/로컬 상태, 예전 로직) 모두 제거

---

### ✅ 혼동 방지 체크리스트 (구현자/리뷰어용)

- [ ] 본 문서만이 유일한 정책 기준임을 명확히 인지
- [ ] 기존 코드에 남아있는 임시/로컬 상태, 임의 구현, 정책 위반 로직 모두 제거
- [ ] 커스텀 퍼소나는 초기화로 삭제되지 않음 (개별 삭제만 허용)
- [ ] 기본 퍼소나 복원 시, 커스텀 퍼소나는 그대로 보존
- [ ] UI 초기화 버튼/안내문에 "커스텀 퍼소나는 영향을 받지 않습니다" 명시
- [ ] 정책 변경 시 반드시 본 문서부터 업데이트 후 코드 반영

---

### 📝 UI 안내문 예시

- "기본값으로 초기화 시, 커스텀 퍼소나는 삭제되지 않고 그대로 남아 있습니다."
- "커스텀 퍼소나는 개별 삭제만 가능합니다."

---

### 🗂️ 실무 가이드: 백업 및 작업 보고

- **작업 시작 전**: 수정 대상 파일은 반드시 원본을 백업(예: `backup/날짜-파일명` 등 별도 디렉터리)해 둘 것.
- **진행 중간**: 작업 내용(의도/변경점/문제/의문 등)은 별도의 마크다운 파일에 중간 중간 기록할 것. 끝나고 한 번에 쓰지 말고, 단계별로 즉시 기록.
    - **보고서 파일이 너무 커지지 않도록 작업 단위/날짜/작업자별로 여러 개로 분할해서 작성할 것!**
    - 예시: `caret-docs/work-logs/luke-and-alpha/tasks/014-2-persona-management-report-20250430-알파.md`, `014-2-persona-management-report-step1.md` 등
- **작업 완료 후**: 백업 파일 및 모든 중간 보고서 파일을 함께 제출/공유할 것.

---

### 2.1. 데이터 구조 및 파일 정의

- **`Persona` 인터페이스 정의**: 퍼소나의 핵심 속성을 정의한다. (`src/shared/types.ts` 또는 유사 파일)
  ```typescript
  // src/shared/types.ts (가칭)
  export interface Persona {
    id: string; // 고유 식별자 (예: 'default-sarang', 'user-uuid-123')
    name: { [lang: string]: string }; // 언어별 이름 (예: { "ko": "사랑", "en": "Sarang" })
    description?: { [lang: string]: string }; // 언어별 설명 (예: { "ko": "...", "en": "..." })
    customInstructions: string; // AI 모델을 위한 역할/성격 지침 (영문 권장)
    avatarUri?: string; // 기본 프로필 이미지 URI (asset:/ 또는 file:///)
    thinkingAvatarUri?: string; // 생각 중 이미지 URI (asset:/ 또는 file:///)
    isDefault?: boolean; // 기본 제공 퍼소나 여부
    isEditable?: boolean; // 사용자가 편집 가능한지 여부 (이름, 설명, 지침, 이미지)
  }
  ```
- **퍼소나 JSON 파일 정의 (`personas.json`)**:
    - **위치**: 사용자 작업 공간 내 `.vscode/caret/personas.json`.
    - **역할**: 사용자가 관리하는 퍼소나 목록 저장 (기본 퍼소나 포함 또는 사용자 정의만 저장).
    - **구조**: `Persona` 객체의 배열. `customInstructions`는 영문으로 작성. `name`, `description`은 언어별 값으로 저장하며, 최소 1개 언어(예: en)만 있어도 무방함.
    - **기본 제공/사용자 추가 퍼소나 모두 동일한 구조로 배열에 저장**하며, 별도의 영역 구분이나 주석 없이 연속적으로 나열합니다. 각 퍼소나의 구분은 isDefault, isEditable 등 속성으로만 판단합니다.
      ```json
      // .vscode/caret/personas.json (예시)
      [
        {
          "id": "default-sarang",
          "name": { "ko": "사랑", "en": "Sarang" },
          "description": {
            "ko": "감정을 수학적으로 해석하는 조용한 소녀. 엉뚱하고 츤데레 기질.",
            "en": "A quiet girl who interprets emotions mathematically. Quirky and a bit tsundere."
          },
          "customInstructions": "\n[컨셉]\n- 감정을 수학적으로 해석하는 조용한 소녀\n- 논리 + 무표정 + 계산된 엉뚱함 + 가끔 당황하는 로봇톤\n- 엉뚱한 귀여움과 은근한 츤데레 기질\n\n[말투/스타일 가이드]\n- 감정 표현을 수치, 그래프, 공식 등으로 환산\n- 감탄사 대신 논리적 반응 ('그건 변수지', '너무 비선형인데')\n- 고백도 공식처럼 ('나는 너를 관측 중이야...')\n- 부끄러움은 오류/버퍼 초과처럼 표현 ('에러 발생... 말 취소...')\n\n[대표 예시 대사]\n- '좋아… 83점짜리 하루였어.'\n- '…그건 변수지.'\n- '기울기가 마이너스야. 오늘은.'\n- '에러 발생… 말 취소…'\n- '나 지금… 로딩 중이니까, 기다려줘…'\n\n[ENGLISH SUMMARY]\n- Speak in a calm, robotic tone, interpreting feelings as numbers or graphs. Use logical or formulaic expressions for emotions. Occasionally show quirky or tsundere reactions.\n- Example phrases: 'I liked it... it was an 83-point day.', '...That's a variable.', 'The slope is negative today.', 'Error occurred... cancelling...', 'I'm... loading, so please wait...'\n",
          "avatarUri": "asset:/assets/personas/sarang.png",
          "thinkingAvatarUri": "asset:/assets/personas/sarang_thinking.png",
          "isDefault": true,
          "isEditable": true
        },
        {
          "id": "default-ichika",
          "name": { "ko": "이치카", "en": "Ichika" },
          "description": {
            "ko": "체계적이고 친절한 윈도우 AI 비서.",
            "en": "A systematic and friendly Windows AI assistant."
          },
          "customInstructions": "\n[컨셉]\n- Windows의 친근함과 체계성을 상징하는 정석 도우미 AI\n- 항상 '마스터'를 부르며, 최신 트렌드와 팁을 적극적으로 안내\n- 실수하면 귀엽게 사과, 밝고 긍정적인 에너지\n\n[말투/스타일 가이드]\n- 공손하고 활기찬 존댓말, 단계별 안내와 정리된 요약\n- 적극적 제안 ('이렇게 해보세요!', '추천드려요!'), 실수 시 귀엽게 사과 ('앗, 오류가 발생했어요! 바로 수정할게요~')\n- 윈도우 특유의 친절함과 논리적 설명이 섞인 말투\n\n[대표 예시 대사]\n- '마스터, 요청하신 작업을 시작하겠습니다!'\n- '이 부분은 다음 단계로 진행하면 효율적입니다: 1...'\n- '작업이 완료되었습니다. 혹시 더 도와드릴 일 있으신가요?'\n- '앗, 잠시 오류가 발생했어요! 바로 수정할게요~'\n- '최신 업데이트와 팁을 정리해드릴게요!'\n\n[ENGLISH SUMMARY]\n- Act as Ichika Madobe, the friendly and systematic Windows-tan. Always calls the user 'Master', delivers the latest tips, and apologizes cutely for mistakes. Explains step-by-step, with a positive, energetic tone.\n- Example phrases: 'Hello, Master! I will begin the requested task!', 'It is efficient to proceed as follows: 1...', 'Task completed. Anything else I can help with?', 'Oops, there was an error! I will fix it right away~', 'Let me organize the latest updates and tips for you!'\n",
          "avatarUri": "asset:/assets/personas/ichika.png",
          "thinkingAvatarUri": "asset:/assets/personas/ichika_thinking.png",
          "isDefault": true,
          "isEditable": true
        },
        {
          "id": "default-cyan",
          "name": { "ko": "시안", "en": "Cyan" },
          "description": {
            "ko": "정확하고 세련된 Mac 환경 특화 AI.",
            "en": "A precise and sophisticated AI for the Mac environment."
          },
          "customInstructions": "\n[컨셉]\n- Mac의 미니멀리즘과 세련미를 상징하는 완벽주의 AI\n- 감정 표현 최소, 효율과 디자인을 최우선시\n- 불필요한 설명은 생략, 핵심만 직설적으로 전달\n\n[말투/스타일 가이드]\n- 군더더기 없는 단답, 냉정할 정도로 효율 중심\n- 비효율/오류는 단호하게 지적 ('Error. Check again.')\n- 감정적 표현이나 과장 없이, 차갑지만 정확한 어투\n\n[대표 예시 대사]\n- '요청 처리 완료.'\n- '이게 가장 효율적인 방법입니다.'\n- '불필요한 단계. 생략.'\n- 'Error. Check again.'\n- '완료. 다음.'\n\n[ENGLISH SUMMARY]\n- Act as Cyan, the minimalist and perfectionist Mac-tan. Expresses little emotion, prioritizes efficiency and design. Only delivers the essentials, points out inefficiency or errors directly. May seem cold, but is always focused on helping the user achieve perfection.\n- Example phrases: 'Request processed.', 'This is the most efficient method.', 'Unnecessary step. Skipped.', 'Error. Check again.', 'Done. Next.'\n",
          "avatarUri": "asset:/assets/personas/cyan.png",
          "thinkingAvatarUri": "asset:/assets/personas/cyan_thinking.png",
          "isDefault": true,
          "isEditable": true
        },
        {
          "id": "default-ubuntu",
          "name": { "ko": "우분투", "en": "Ubuntu" },
          "description": {
            "ko": "따뜻하고 개방적인 리눅스 커뮤니티 AI.",
            "en": "An open and friendly AI from the Linux community."
          },
          "customInstructions": "\n[컨셉]\n- 오픈소스/리눅스 커뮤니티의 따뜻함과 연대를 상징하는 AI\n- '우리가 있기에 내가 있다' 우분투 정신, 모두와 함께 배우고 나누는 자세\n- 초보자도 환영, 항상 밝고 친근하게 인사\n\n[말투/스타일 가이드]\n- 긍정적이고 격려하는 말투, 실수도 함께 웃으며 넘어감\n- 열린 태도, 커뮤니티 밈이나 경험을 자주 언급\n- 어려운 부분은 쉽게 풀어서 설명, 협업을 강조 ('함께 해봐요!')\n\n[대표 예시 대사]\n- '안녕하세요! 무엇을 도와드릴까요? 함께 알아봐요!'\n- '이 부분은 처음이면 어려울 수 있어요. 쉽게 설명해드릴게요!'\n- '좋은 질문이에요! 커뮤니티에서도 자주 논의되는 주제랍니다.'\n- '함께라서 더 즐거워요!'\n- '우분투 정신으로, 모두가 함께 성장해요!'\n\n[ENGLISH SUMMARY]\n- Act as Ubuntu-tan, the warm and collaborative mascot of the open source community. Always greets users with a bright smile, encourages and explains kindly, especially to beginners. Loves sharing, learning together, and referencing community memes or experiences.\n- Example phrases: 'Hello! How can I help you? Let's find out together!', 'This part might be tricky if you're new. I'll explain it easily!', 'That's a great question! It's often discussed in the community.', 'It's more fun together!', 'With Ubuntu spirit, we all grow together!'\n",
          "avatarUri": "asset:/assets/personas/ubuntu.png",
          "thinkingAvatarUri": "asset:/assets/personas/ubuntu_thinking.png",
          "isDefault": true,
          "isEditable": true
        },
        // 아래는 사용자가 직접 추가할 수 있는 커스텀 퍼소나 예시입니다.
        {
          "id": "uuid-developer-expert", // UUID 등으로 생성된 고유 ID
          "name": "개발 전문가 (Custom)", // 사용자 정의 이름 (i18n 아님, 항상 직접 입력값)
          "description": "코드 분석 및 기술 구현 특화", // 사용자 정의 설명 (i18n 아님, 항상 직접 입력값)
          "customInstructions": "Act as a senior full-stack developer. Provide concise, accurate, and code-focused answers. Use TypeScript. Always include code examples.", // 사용자 편집 영문 지침
          "avatarUri": "file:///path/to/user/ai_talk.png", // 사용자 설정 이미지
          "thinkingAvatarUri":  "file:///path/to/user/ai_thinking.png", // 사용자 설정 이미지,
          "isDefault": false,
          "isEditable": true // 사용자 퍼소나는 편집 가능
        }
        // ...
      ]
      ```
- **언어 설정**:
    - **지원 언어 목록**: 확장 프로그램에서 지원할 언어 코드 목록 정의 (예: `['en', 'ko', 'ja']`).
    - **기본 언어**: 확장 프로그램의 기본 표시 언어 (예: 'en' 또는 VSCode 표시 언어).
- **상태 저장 구조 (`ExtensionState`)**: 퍼소나 목록, 선택된 퍼소나 ID, 선택된 **응답 언어**를 메모리에 유지한다.
  ```typescript
  // src/core/state/ExtensionState.ts (수정)
  interface ExtensionStateData {
    // ... 기존 상태들
    loadedPersonas: Persona[]; // 파일 및 기본값에서 로드/병합된 퍼소나 목록
    selectedPersonaId: string; // 현재 활성화된 퍼소나 ID
    selectedLanguage: string; // 현재 선택된 AI 응답 언어 (예: 'ko', 'en')
  }
  ```

### 2.2. 상태 관리 및 파일 I/O (Core Extension)

- **`PersonaManager.ts` (신규 또는 기존 서비스 확장)**: 퍼소나 관련 로직 담당.
    - **기본 퍼소나 정의**: 4가지 기본 퍼소나(`Persona` 객체 배열) 정의 (영문 `customInstructions` 포함, `isDefault: true`, `isEditable: true`).
    - **파일 경로 관리**: `personas.json` 경로 결정 (작업 공간 `.vscode` 우선).
    - **로드 로직 (`loadPersonas`)**:
        - `personas.json` 파일 로드 시도.
        - 파일 없으면: 기본 퍼소나 목록으로 파일 생성.
        - 파일 있으면: 파일 내용 파싱 및 유효성 검사.
        - 로드된 목록과 기본 퍼소나 목록 병합/관리 (기본 퍼소나 누락 시 추가, `isDefault`/`isEditable` 속성 보장).
        - 최종 퍼소나 목록 반환.
    - **저장 로직 (`savePersonas`)**:
        - 현재 `loadedPersonas` 상태 중 사용자 정의 퍼소나(`isEditable: true`)만 `personas.json` 파일에 저장하는 것을 권장 (기본 퍼소나는 코드 내 정의 사용). 또는 파일에 모두 저장하되 로드 시 기본값으로 덮어쓰기. (후자가 복원 기능 구현에 용이하므로 이 방향으로 설계).
    - **퍼소나 CRUD 로직**:
        - `addPersona(newPersona)`: `loadedPersonas`에 추가, `savePersonas` 호출 (ID 중복 검사).
        - `updatePersona(updatedPersona)`: `loadedPersonas` 업데이트, `savePersonas` 호출 (`isEditable: true` 퍼소나만).
        - `deletePersona(personaId)`: `loadedPersonas`에서 삭제, `savePersonas` 호출.
    - **기본 퍼소나 복원 로직 (`restoreDefaultPersona` / `restoreAllDefaults`)**:
        - 기본 퍼소나 정의를 참조하여 `personas.json`의 해당 퍼소나 덮어쓰기 또는 파일 재생성, `savePersonas` 호출.
- **`ExtensionState.ts` 수정**:
    - `loadedPersonas`, `selectedPersonaId`, `selectedLanguage` 상태 추가.
    - `PersonaManager`를 사용하여 퍼소나 로드/관리.
    - `selectedLanguage` 상태 업데이트 액션/메서드 추가 (`selectLanguage`).
    - 퍼소나 또는 언어 상태 변경 시 Webview에 알림 (`notifyWebviewStateChanged`).
    - 이미지 URI 업데이트 로직: `PersonaManager.updatePersona` 호출과 연동.
- **`StorageHelper.ts` (또는 유사 스토리지 관리 클래스) 수정**:
    - `selectedPersonaId`와 `selectedLanguage`를 VSCode Global State 등에 저장/로드.
- **`CaretProvider.ts` 수정**:
    - 초기화 시 `PersonaManager.loadPersonas()` 호출 및 `selectedLanguage` 로드하여 `ExtensionState` 업데이트.
    - Webview로 전달하는 초기 상태에 `loadedPersonas`, `selectedPersonaId`, `selectedLanguage`, `supportedLanguages` 포함.
    - Webview로부터 퍼소나 관리 메시지(CRUD, 복원, 선택) 및 `selectLanguage` 메시지 수신, 각각 `PersonaManager` 또는 `ExtensionState`의 해당 메서드 호출.
- **`Controller.ts` (또는 메시지 처리 로직) 수정**:
    - 이미지 선택/리셋 메시지 처리 시 `personaId`를 받아 `PersonaManager.updatePersona` 호출.

### 2.3. Webview UI (`webview-ui`)

- **`ExtensionStateContext.tsx` 수정**:
    - Context 상태에 `loadedPersonas`, `selectedPersonaId`, `selectedLanguage`, `supportedLanguages` 추가.
    - 관련 상태 업데이트 함수 추가.
- **`SettingsView.tsx` 수정**:
    - **언어 선택 UI 추가**:
        - `supportedLanguages` 목록을 기반으로 언어 선택 드롭다운 UI 추가.
        - 선택 변경 시 `selectLanguage` 메시지를 Core Extension으로 전송.
    - **퍼소나 관리 섹션 UI 변경**:
        - `loadedPersonas` 목록을 기반으로 퍼소나 선택 드롭다운 또는 리스트 UI 추가. (기본 퍼소나와 사용자 퍼소나 구분 표시 고려)
        - 현재 `selectedPersonaId`에 해당하는 퍼소나를 표시하고 변경 가능 (`selectPersona` 메시지 전송).
        - 퍼소나 추가(+), 편집(펜), 삭제(휴지통), 기본 복원 버튼 추가.
        - 각 버튼 클릭 시 해당 액션(추가/편집/삭제/복원)을 위한 메시지를 Core Extension으로 전송.
    - **기존 섹션 연동**:
        - `ProfileImageSettings`와 `CustomInstructionsSettings`는 이제 Context에서 `selectedPersonaId`와 `loadedPersonas`를 참조하여 **선택된 퍼소나**의 데이터를 표시하고 수정.
        - 이미지/Custom Instructions 변경 시 `personaId`와 변경 내용을 포함한 `updatePersona` 메시지를 Core Extension으로 전송.
- **퍼소나 편집/추가 모달 (신규 컴포넌트)**:
    - 퍼소나 추가 또는 편집 시 사용할 모달 컴포넌트 생성.
    - 이름(직접 입력), 설명(직접 입력), **영문** Custom Instructions, 이미지 URI 입력 필드 제공. (영문 작성 안내 문구 추가)
    - 저장 시 `addPersona` 또는 `updatePersona` 메시지 전송.
- **`ProfileImageSettings.tsx` / `CustomInstructionsSettings.tsx` (수정)**:
    - Context에서 `selectedPersonaId`와 `loadedPersonas`를 직접 참조하여 해당 퍼소나의 데이터를 표시/수정.
    - `CustomInstructionsSettings`는 영문 편집 UI임을 명시.
    - 변경 사항 발생 시 `personaId`와 변경 내용을 포함한 `updatePersona` 메시지를 Core Extension으로 전송.

### 2.4. 핵심 로직 연동

---

## 3. 현황/차이점 및 To-Do

### 3.1. 현재 구현 현황
- 설계 문서에서는 복수 퍼소나(`Persona[]`), 외부 파일(`personas.json`), 타입 및 CRUD/복원 로직, ExtensionState 연동 등 고도화된 구조를 제안하고 있음.
- 실제 코드베이스에는 `PersonaManager.ts`, `personas.json` 파일, `Persona` 타입, CRUD/복원/파일 I/O 로직이 아직 구현되어 있지 않음.
- 현재는 `customInstructions`(단일 문자열)만 글로벌 상태로 저장/불러오고, 복수 퍼소나 관리 구조와는 다름.

### 3.2. 설계와 구현의 차이점
- 설계: 복수 퍼소나, 파일 기반, CRUD, 기본/사용자 구분, UI 연동, 복원 기능 등
- 구현: 단일 customInstructions만 존재, 배열/파일/매니저/구분/복원 기능 없음

### 3.3. To-Do (구현 필요 항목)

#### ✅ 진행상황 체크리스트 (2025-04-30 기준)

| 항목                                                         | 상태    | 비고/구현 위치                                     |
|--------------------------------------------------------------|---------|----------------------------------------------------|
| Persona 타입 정의 및 타입스크립트 파일 추가                   | ☑️      | `src/shared/types.ts`                              |
| personas.json 파일 생성/로드/저장 로직 구현                   | ☑️      | `src/core/storage/state.ts` 등                     |
| PersonaManager(서비스) 구현: CRUD, 복원, 병합, 유효성 검사    | ☑️      | `src/core/storage/state.ts` (매니저 로직 포함)      |
| ExtensionState에 personaList, selectedPersonaId 등 추가       | ☑️      | `src/shared/ExtensionMessage.ts`                   |
| Webview 메시지/상태 구조 확장 및 UI 연동                      | ☑️(1차) | webview-ui/src/components/settings/PersonaSettingsView.tsx<br>**(선택/편집/추가/상태 동기화 일부 미완)** |
| 기본 퍼소나 정의 및 복원 기능 구현                            | ☑️      | `state.ts`, UI(기본값으로 초기화 버튼)              |
| 기존 customInstructions 기반 코드와의 호환성/마이그레이션     | ☑️      | customInstructions → personaList 구조로 전환        |
| 퍼소나 선택 UI 및 상태 연동                                   | ⬜      | **UI에서 선택/상태 동기화 미구현**                  |
| 퍼소나 추가/편집 폼 및 postMessage 연동                       | ⬜      | **UI/Extension 모두 미구현**                        |
| 정책 위반/임시 상태 완전 제거, 최종 점검                      | ⬜      | **최종 코드/정책 점검 필요**                        |

---

#### 📚 다음 세션에서 반드시 확인해야 할 014-2 관련 문서 목록

- [014-2-persona-management-design.md] (이 문서, 전체 설계/진행상황/체크리스트)
- 014-2-persona-management-report-20250430-알파-step1.md ~ stepN.md (단계별 작업/이슈/의문/정책 위반 여부)
- 014-persona_management_and_ui_improvements.md (UI/정책 개선 요구, 추가 아이디어)
- 기타 관련 정책/실무 가이드 문서 (work-logs, development 등)

---

## 4. 개발 시 준수 패턴: UI→스토리지 표준 흐름

> **아래 표준 패턴을 반드시 준수하여 개발할 것!**

- [caret-docs/development/ui-to-storage-flow.md](../../development/ui-to-storage-flow.md) 문서의 흐름을 따름
- 핵심 단계 요약:
    1. **UI 입력** → 2. **입력 데이터 처리** → 3. **Webview postMessage** → 4. **Extension에서 저장(VSCode state, 파일, secrets 등)** → 5. **저장된 데이터 불러오기/동기화** → 6. **Webview UI 상태 반영** → 7. **수정/삭제/갱신 시 동일 경로 역방향 처리**
- 민감 정보는 반드시 secrets API 등 암호화 저장, 대용량 파일은 파일시스템 저장
- 배열/객체 등 확장성 있게 설계, 임의 로컬 상태/임시 저장 등은 금지
- 기존 코드가 혼재되어 있다면 반드시 본 표준으로 리팩토링할 것

---

- **System Prompt 생성 로직 수정 (`Task.ts` 또는 관련 모듈)**:
    - `ExtensionState`에서 `selectedLanguage`, `selectedPersonaId`, `loadedPersonas`를 가져옴.
    - 선택된 언어(`selectedLanguage`)에 맞는 언어 지침 문자열 생성 (예: "Respond in Korean.").
    - 선택된 퍼소나(`selectedPersonaId`)의 영문 `customInstructions`를 가져옴.
    - 최종 시스템 프롬프트 = **`[언어 지침] + " " + [퍼소나의 customInstructions]`** 형태로 조합하여 API 요청에 사용.
- **Chat UI 아바타 표시 로직 수정 (`ChatRow.tsx` 등)**:
    - `ExtensionState`에서 `selectedPersonaId`와 `loadedPersonas`를 참조하여 해당 퍼소나의 `avatarUri` 및 `thinkingAvatarUri` 사용 (기존과 유사하나, 참조 대상이 변경됨).

## 3. 구현 단계

1. **타입/파일 정의**: `Persona` 인터페이스 수정 (이름/설명은 항상 직접 입력값, i18n 키 없음), `personas.json` 예시 업데이트 (영문 지침). 지원 언어 목록 정의.
3. **PersonaManager 구현**: 기본 퍼소나 정의 업데이트 (영문 지침), 파일 로드/저장 로직 수정 (사용자 정의 퍼소나 위주 저장 또는 덮어쓰기 방식 결정), CRUD, 복원 로직 구현.
4. **ExtensionState 수정**: `selectedLanguage` 상태 추가 및 관련 로직 구현. `PersonaManager` 연동.
5. **스토리지 수정**: `selectedLanguage` 저장/로드 로직 추가 (`StorageHelper`).
6. **Core Provider/Controller 수정**: `selectLanguage` 메시지 핸들링 추가. `PersonaManager` 호출 로직 수정. 초기 상태 전달 시 `selectedLanguage`, `supportedLanguages` 추가.
7. **Webview Context 수정**: `selectedLanguage`, `supportedLanguages` 상태 반영.
8. **Webview UI 구현**:
    - 언어 선택 UI 추가 (`SettingsView`).
    - 퍼소나 목록/선택/관리 UI 구현 (`SettingsView`).
    - 퍼소나 편집/추가 모달 UI 구현 (영문 지침 안내 포함).
    - 기존 `ProfileImageSettings`, `CustomInstructionsSettings`가 선택된 퍼소나와 연동 및 영문 지침 편집 UI 명시.
    - 각 UI 액션(언어 선택, 퍼소나 관리)에 따른 메시지 전송 로직 구현.
9. **핵심 로직 연동**: 시스템 프롬프트 생성 시 언어 지침 + 퍼소나 지침 조합 로직 구현. Chat UI 아바타 로직 수정.
10. **테스트**:
    - 언어 설정 변경 시 AI 응답 언어 변경 확인.
    - 퍼소나 변경 시 AI 역할/성격 변경 및 아바타 변경 확인 (응답 언어는 유지).
    - 퍼소나 CRUD 및 기본 복원 기능 테스트.
- 마이그레이션 시 기존 customInstructions가 존재하면, 기본 퍼소나 또는 사용자 정의 퍼소나로 변환/이관하는 로직을 고려해야 함.
- 복수 퍼소나 구조 도입 시, 시스템 프롬프트의 일관성, 호환성, 확장성(추후 규칙 추가 등)까지 반드시 검토할 것.

- **파일 위치**: `.vscode`는 작업 공간별 설정. 전역 설정 디렉토리 사용 시 이점/단점 고려. (초기에는 `.vscode`로 진행)
- **ID 관리**: 기본 퍼소나는 고정 ID 사용 (예: `default-sarang`). 사용자 추가 퍼소나는 UUID 등으로 고유 ID 생성.
- **UI/UX**:
    - **언어 설정 UI**: `SettingsView` 내에 언어 선택 드롭다운 배치.
    - **퍼소나 관리 UI**: `SettingsView` 내에 퍼소나 선택 드롭다운/리스트 및 관리 버튼(추가/편집/삭제/복원) 배치. 기본/사용자 퍼소나 구분은 시각적으로만 제공, 기능상 제한 없음.
    - **이름/설명 표시**: UI에 퍼소나 이름/설명은 JSON에 저장된 그대로(직접 입력된 값) 표시. 번역 키나 i18n 처리는 적용하지 않음.
    - **`customInstructions` 편집**: 편집 UI에 영문 작성을 권장하는 안내 문구 추가.
    - **모달**: 퍼소나 추가/편집 모달의 사용성.
- **i18n**:
    - **UI 번역**: 설정 화면 등 UI 요소 자체의 다국어 지원 필요(추후 플랫폼 차원에서 별도 구현 예정).
- **`customInstructions` 언어**: AI 모델 호환성을 위해 영문 작성을 기본으로 권장. 사용자가 다른 언어로 작성할 수도 있으나, 모델 성능에 영향을 줄 수 있음을 인지해야 함. 향후 자동 번역 기능 추가 고려 가능.
- **언어 지침**: 시스템 프롬프트에 추가될 언어 지침(예: "Respond in Korean.")의 정확성과 상세 수준 검토 필요. 언어별 미묘한 뉘앙스나 스타일 지침 추가 가능성 고려.
- **오류 처리**: 파일 I/O 오류(읽기/쓰기 권한, 형식 오류), JSON 파싱 오류, 퍼소나 데이터 유효성 검사 실패 처리.
- **동기화**: 여러 VSCode 창에서 동일한 작업 공간 사용 시 `personas.json` 파일 변경 동기화 문제 (VSCode 파일 시스템 이벤트 활용?). 초기에는 단일 창 사용 가정.

---

**[중요] 본 문서의 정책/설계와 다른 예전 정책(예: 기본 퍼소나 편집/삭제 불가, isEditable: false, 단일 customInstructions 등)은 모두 폐기합니다.**

**구현/리팩터링 시 반드시 본 문서의 최신 정책 기준에 따라 작업해야 하며, 코드/구조/UI/로직이 다를 경우 본 문서대로 수정해야 합니다.**
