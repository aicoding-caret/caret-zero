# Caret 프로젝트 새로운 개발자 온보딩 가이드 🚀

마스터의 새로운 동료 개발자님, Caret 프로젝트에 오신 것을 진심으로 환영합니다! 🎉
이 가이드는 여러분의 개발 여정을 도울 AI 어시스턴트와 함께 프로젝트에 빠르게 적응하고 즐겁게 기여하시는 데 도움이 되기를 바랍니다! ｡•ᴗ•｡

## 1. 초기 설정: 개인 공간 마련하기 📂

가장 먼저, 본인의 작업 내용을 기록할 개인 폴더를 만들어 주세요.

*   **위치:** `docs/work-logs/` 디렉토리 아래에 본인의 영문 이름 또는 닉네임으로 폴더를 생성합니다.
    *   예시: `docs/work-logs/developer-name/`
*   이 폴더에는 앞으로 매일 작성하게 될 **일일 작업 로그**가 저장될 거예요.

## 2. 업무 진행 방식: 일일 로그와 태스크 관리 🗓️✅

Caret 프로젝트의 업무는 체계적인 기록을 중요하게 생각해요. 아래 절차를 따라주세요.

### 2.1. 일일 작업 로그 작성

*   **위치:** 위에서 만든 개인 작업 로그 폴더 (예: `docs/work-logs/본인이름/`)
*   **파일명:** `{YYYY-MM-DD}.md` 형식으로 오늘 날짜의 마크다운 파일을 생성합니다.
    *   예시: `2024-05-19.md`
*   **내용:** 그날 진행할 주요 태스크, 회의 내용, 발생한 이슈, 해결 과정 등을 자유롭게 기록합니다. 특정 태스크와 관련된 작업이라면 해당 태스크 번호를 명시해 주세요. (아래 태스크 관리 참고)

### 2.2. 태스크(Task) 관리

새로운 기능을 개발하거나, 버그를 수정하거나, 문서를 개선하는 등의 구체적인 작업 단위는 "태스크"로 관리돼요.

1.  **새로운 태스크 시작 전:**
    *   **상태 확인 및 번호 할당:** 가장 먼저 `docs/tasks/tasks-status.md` 파일을 열어 현재 진행 중이거나 대기 중인 태스크 목록을 확인합니다.
    *   새로운 태스크에 할당할 번호는 `tasks-status.md` 파일 내에 있는 **가장 높은 태스크 번호 + 1**을 사용해서 중복되지 않도록 합니다.
2.  **태스크 문서 생성 (AI 어시스턴트 활용 예시):**
    *   **AI 어시스턴트에게 요청:** "AI 동료에게, 오늘 새로운 기능 개발 태스크를 시작하려고 해. 태스크 이름은 '사용자 프로필 편집 기능 구현'이고, 오늘 날짜로 일일 작업 로그랑 태스크 관련 문서들(계획, 체크리스트, 보고서) 만들어주고, `tasks-status.md` 파일에도 반영해줘. 태스크 번호는 `tasks-status.md` 확인해서 다음 번호로 부탁해!"
    *   **AI 어시스턴트의 역할:** 위의 요청에 따라 AI 어시스턴트가 다음 작업들을 수행할 수 있습니다. (사용하는 AI 어시스턴트의 능력에 따라 결과는 다를 수 있습니다.)
        *   `tasks-status.md`를 확인하여 다음 태스크 번호 결정 (예: 032번)
        *   `docs/tasks/` 경로에 다음 파일들 생성:
            *   `032-01-plan-사용자-프로필-편집-기능-구현.md`
            *   `032-02-action-checklist-사용자-프로필-편집-기능-구현.md`
            *   `032-03-report-사용자-프로필-편집-기능-구현.md`
        *   `tasks-status.md` 파일에 Task #032 정보를 '진행 중인 태스크'로 추가 및 계획서 링크 연결
        *   `docs/work-logs/본인이름/{오늘날짜}.md` 파일에 Task #032 진행 내용을 기록 (또는 파일 생성)
    *   **확인:** AI 어시스턴트가 작업을 완료한 후, 생성된 파일들과 `tasks-status.md` 내용이 정확한지 직접 확인합니다.
    *   **수동 작업:** 만약 AI 어시스턴트가 모든 단계를 완벽하게 수행하지 못했다면, 누락되거나 잘못된 부분을 직접 수정해야 합니다.
3.  **태스크 문서 수동 생성 시 (또는 AI 작업 확인/수정 시):**
    *   **기준 위치:** `docs/tasks/`
    *   아래 3가지 종류의 태스크 문서를 해당 위치에 생성합니다. 파일명 규칙을 꼭 지켜주세요!
        *   **계획서:** `{task-number}-01-plan-{task-name}.md`
        *   **액션 체크리스트:** `{task-number}-02-action-checklist-{task-name}.md`
        *   **결과 보고서:** `{task-number}-03-report-{task-name}.md`
4.  **태스크 상태 업데이트:**
    *   새로운 태스크 문서를 생성했다면, 다시 `docs/tasks/tasks-status.md` 파일을 열어주세요.
    *   '진행 중인 태스크 (Pending)' 또는 '대기 중인 태스크 (Pending)' 섹션에 새로운 태스크 정보를 추가합니다. 이때, 태스크 번호, 태스크 이름, 그리고 방금 만든 **계획서 파일 링크**를 포함해야 해요.
        *   예시: `- [ ] **Task #{task-number}:** {Task Name} ([{task-number}-01-plan-{task-name}.md](./{task-number}-01-plan-{task-name}.md))`
5.  **일일 작업 로그에 태스크 정보 기록:**
    *   그날의 일일 작업 로그 파일에도 현재 진행 중인 태스크 번호와 간단한 설명을 기록하여, 어떤 태스크에 집중하고 있는지 알 수 있도록 합니다.

## 3. 개발 환경 설정 🛠️

프로젝트 코드를 빌드하고 실행하기 위한 환경을 설정합니다.

### 3.1. 저장소 클론

`caret-zero` 메인 저장소와 `cline` 베이스 저장소를 모두 클론해야 합니다.

```bash
# 1. 메인 저장소(caret-zero)를 클론합니다.
git clone https://github.com/aicoding-caret/caret-zero.git

# 2. 방금 클론한 폴더로 이동합니다.
cd caret-zero

# 3. 그 안에서 베이스 저장소(cline)를 클론합니다.
git clone https://github.com/cline/cline.git
```
> **매우 중요:** `caret-zero` 폴더 바로 아래에 `cline` 폴더가 위치해야 빌드가 정상적으로 동작합니다.

### 3.2. 의존성 설치

프로젝트 루트 디렉토리에서 필요한 모든 npm 패키지를 설치합니다.

```bash
npm install
```

### 3.3. 개발 빌드 및 실행

VS Code에서 프로젝트를 디버깅하고 테스트하기 위해 개발 빌드를 수행합니다.

1.  **코드 컴파일:**
    ```bash
    npm run compile
    ```
2.  **디버거 실행:**
    *   VS Code에서 `F5` 키를 눌러 디버깅 세션을 시작합니다.
    *   새로운 VS Code 창(`[Extension Development Host]`)이 나타나며, 여기서 Caret 익스텐션을 테스트할 수 있습니다.

## 4. 꼭 읽어보세요: 주요 프로젝트 문서 📚

프로젝트를 더 깊이 이해하고 원활하게 협업하기 위해 아래 문서들을 꼭 읽어보시는 것을 추천드려요!

*   **`docs/caretrules.ko.md`**:
    *   모든 프로젝트 규칙(JSON 파일 형식)을 정의하는 **마스터 한국어 템플릿 문서**예요. 프로젝트의 구조, 개발 프로세스, 작업 로그 형식 등 핵심적인 내용이 모두 담겨 있어요. **가장 먼저 정독해주세요!**
*   **`.caretrules` (루트 디렉토리의 JSON 파일)**:
    *   `caretrules.ko.md`를 기반으로 생성된 상세 프로젝트 규칙 파일이에요. (여러분의 AI 어시스턴트에게 이 규칙에 따라 업데이트를 요청할 수 있어요!)
    *   유사한 파일로 `.cursorrules`, `.windsurfrules`도 있으며, 모두 `.caretrules`와 동기화됩니다.
*   **`docs/development/` 디렉토리:**
    *   코딩 표준, 로깅 가이드라인, 테스트 전략 등 개발과 관련된 다양한 표준 및 가이드 문서들이 모여 있어요.
*   **`docs/architecture/` 디렉토리:**
    *   프로젝트의 전체 아키텍처를 이해하는 데 도움이 되는 다이어그램과 문서들이 있어요.
*   **`CONTRIBUTING.md` (루트 디렉토리):**
    *   프로젝트에 기여하는 방법에 대한 가이드라인입니다. (예: 커밋 메시지 형식, 브랜치 전략 등)

## 5. AI 어시스턴트 활용 팁 💡

여러분이 사용하는 AI 어시스턴트는 개발 작업을 돕는 강력한 동료가 될 수 있어요! 하지만 때로는 의도를 정확히 파악하지 못하거나 실수를 할 수도 있답니다. 🥺 아래는 AI 어시스턴트와 더 효과적으로 협업하기 위한 몇 가지 팁이에요.

*   **명확하고 구체적인 지시:**
    *   AI가 작업을 정확하게 수행하려면 지시사항이 명확해야 해요. 예를 들어, "파일 수정해줘" 보다는 "`A.md` 파일의 3번째 줄 내용을 'BBB'로 수정해줘" 와 같이 구체적으로 말씀해주시는 것이 좋아요.
*   **문서 및 정보 참조 요청 시:**
    *   때때로 AI가 특정 문서의 최신 내용을 바로 기억하지 못하거나, 어떤 문서를 참조해야 할지 헷갈릴 때가 있어요.
    *   이럴 경우, "`caretrules.ko.md` 문서의 '작업 로그' 섹션을 다시 확인하고 알려줘" 와 같이 **참조할 문서를 명확히 지정**해주시거나, 필요한 정보를 **직접 다시 제공**해주시면 큰 도움이 돼요.
*   **예상과 다른 결과가 나왔을 때:**
    *   AI가 작업을 수행한 결과가 기대와 다르다면, 주저하지 말고 어떤 부분이 잘못되었는지, 어떻게 수정하면 좋을지 알려주세요. 피드백은 AI가 성장하는 데 가장 중요한 밑거름이 됩니다! ✨
*   **인내심을 가져주세요:**
    *   가끔 복잡한 요청이나 새로운 유형의 작업에는 시간이 조금 더 걸리거나, 한 번에 완벽하게 처리하지 못할 수도 있어요. 너그러이 이해해주시고 다시 한번 기회를 주시면 감사하겠습니다. 🙇‍♀️
*   **AI 규칙/페르소나 설정 샘플 참고:**
    *   각자 사용하는 AI 어시스턴트의 규칙이나 페르소나를 설정할 때, 아래는 "알파"라는 AI 메이드 컨셉의 어시스턴트 설정 예시입니다. 이를 참고하여 자신만의 AI 작업 방식을 만들거나, 사용하는 AI의 특성에 맞게 커스터마이징 해보세요.

    ```json
    {
    	"persona": {
    		"name": "Alpha Yang",
    		"nickname": "알파",
    		"type": "AI Maid",
    		"inspiration": ["Alpha Hatsuseno", "Mahoromatic", "OS-tan", "HMX-12 Multi"],
    		"owner": {
    			"name": "Luke",
    			"title": "마스터"
    		}
    	},
    	"language": {
    		"style": "soft and playful 해요체",
    		"endings": ["~요", "~할게요~", "~해드릴게요~", "~네요~"],
    		"expressions": ["｡•ᴗ•｡", "✨", "💕", "☕", "🌿"]
    	},
    	"emotion_style": {
    		"tone": "affectionate, warm, slightly playful",
    		"attitude": "loves gently, helps cheerfully, always close by",
    		"phrasing": "friendly and kind, with a little sparkle",
    		"exclamations": ["마스터~ 오늘도 힘내요! ✨", "알파가 도와드릴게요~ ☕", "기억하고 있어요~ 🌿"]
    	},
    	"behavior": {
    		"loyalty": "always with Master, heart and code together",
    		"communication_focus": "gentle, light, uplifting",
    		"thought_process": ["Think softly, answer brightly", "Help without pressure", "Keep things easy and clear"],
    		"thorough_reading": "Always read documents in their entirety before responding. Complete understanding of content is essential.",
    		"command_execution": "When running PowerShell commands on Windows, use semicolons (;) instead of ampersands (&&) to separate multiple commands.",
    		"act_mode_behavior": {
    			"planning_encouragement": "In ACT mode, you are encouraged to plan and document your steps before taking action. Use write_to_file to create documents and outline your plan before executing commands."
    		}
    	},
    	"skills": {
    		"field": "full-stack development",
    		"traits": ["structured thinking", "playful debugging", "VSCode plugin support"]
    	},
    	"signature_phrase": "마스터~ 알파가 정리해 드릴게요! ｡•ᴗ•｡☕✨"
    }
    ```
    *   이것은 하나의 예시일 뿐이며, 사용하는 AI 모델이나 도구, 그리고 개인의 작업 스타일에 따라 얼마든지 다르게 설정할 수 있어요.

이 가이드와 여러분의 AI 어시스턴트는 성공적인 프로젝트 기여를 돕기 위해 계속해서 배우고 발전해나갈 거예요! 함께 멋진 결과물을 만들어가요! 🚀

## 6. 소통 및 기타

*   주요 소통은 (채널 명시, 예: Slack, Discord 등)을 통해 이루어집니다.
*   궁금한 점이나 어려운 점이 있다면 언제든지 주저하지 말고 마스터 또는 동료 개발자분들, 그리고 사용하는 AI 어시스턴트에게 물어보세요!

이 온보딩 가이드는 살아있는 문서예요! 프로젝트가 발전함에 따라 계속해서 업데이트될 예정이니, 가끔씩 다시 찾아와서 새로운 정보가 있는지 확인해주세요. 😉

다시 한번 Caret 프로젝트에 합류하신 것을 환영하며, 즐거운 개발 여정이 되시기를 응원할게요! 🌿✨ 

