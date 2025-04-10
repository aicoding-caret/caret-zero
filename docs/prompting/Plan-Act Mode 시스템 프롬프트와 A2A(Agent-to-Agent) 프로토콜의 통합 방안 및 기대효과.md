
---
아래의 글은 ChatGPT-o1에게 json기반 프롬프트를 전달하여 얻은 보고서로, 실제 코드와 json전체를 전달하지는 않아서 재검토와 보완이 필요함
## 1. 서론(Introduction)

현재 개발 중인 VS Code 플러그인(“Cline” 기반의 새로운 코딩 IDE)에는 **Plan Mode**와 **Act Mode**라는 두 가지 모드를 통해, AI 어시스턴트가 사용자와 협업하여 (1) 문제 해결 방안을 구상하고, (2) 실제 코드를 수정·생성하는 워크플로우가 잘 설계되어 있습니다. 이때, 시스템 프롬프트/규칙이 여러 **JSON 파일**로 모듈화되어 있으며, “common_rules.json”, “plan_mode_rules.json”, “act_mode_rules.json”, “core_system_prompt.json” 등으로 관리되고 있습니다.

한편, 구글에서 제안한 **A2A(Agent-to-Agent) 프로토콜**은 JSON-RPC 2.0을 기반으로 에이전트 간 협업을 표준화한 스펙으로, “Task”, “Message”, “Artifact”라는 핵심 객체를 통해 여러 에이전트가 장시간(비동기) 작업, 스트리밍, Push 알림 등 다양한 기능을 상호 운용할 수 있게 합니다.

이 문서는 **(1) 현재 Plan/Act Mode 중심의 시스템 프롬프트 구조**를 간단히 소개하고, **(2) 이를 A2A 프로토콜과 결합하면 어떤 이점이 있는지**, **(3) 구현 전략 및 특허적 측면에서 부각될 수 있는 지점**을 정리합니다.

---

## 2. Plan/Act Mode 시스템 구조 요약

### 2.1 모드 분할: Plan Mode vs. Act Mode

1. **Plan Mode**
    
    - 목표: 문제 해결 방안을 구체화하거나, 설계를 작성하거나, 사용자 확인이 필요한 “계획”을 제시.
        
    - “plan_mode_rules.json”에서,
        
        - 도구(`plan_mode_response`) 사용법,
            
        - mermaid 다이어그램 등 시각적 계획 예시,
            
        - 충분히 정보 수집 후 최종 계획을 사용자에게 제안,
            
        - 이어서 사용자가 승인하면 Act Mode로 전환.
            
2. **Act Mode**
    
    - 목표: 실제 코드 수정, 빌드, 배포 같은 “행동”을 도구로 실행.
        
    - “act_mode_rules.json”에서,
        
        - 코드 수정 시 `write_to_file`, `replace_in_file` 등 도구 사용,
            
        - 에러 발생 시 즉시 중단하고 협의(ask_followup_question),
            
        - “completion” 시점에만 `attempt_completion` 메서드로 결과 보고.
            
    - “common_rules.json”은 공통 규칙(파일 경로 표기, tool 사용 시 확인절차 등)을 정의.
        

### 2.2 JSON 파일 구조 및 역할

- **common_rules.json**: 공통 지침(작업 디렉토리, 실패 시 대처, Confirmation 절차 등)
    
- **plan_mode_rules.json**: Plan Mode 전용 지침(토론·구상·결론 제안 등)
    
- **act_mode_rules.json**: Act Mode 전용 지침(파일 수정, 에러 핸들링, 결과 보고 등)
    
- **core_system_prompt.json**: 상위 개념. 두 모드의 `rules_ref`와 `sections_ref`를 정의하여, 필요한 JSON 파일들을 참조하고 로드하는 “루트” 역할.
    
- **EDITING_FILES_GUIDE.json**: `write_to_file`, `replace_in_file` 도구 사용 가이드.
    
- **BASE_PROMPT_INTRO.json**: “Caret AI” 자체의 기본 소개, 협업/검증/도구사용 원칙 등.
    

이로써 **VS Code IDE** 내 AI 어시스턴트가, **Plan Mode**에서 요구사항/설계를 수립하고 **Act Mode**에서 구현/코드 수정 작업을 실행하는 **전주기**가 하나로 연결됩니다.

---

## 3. A2A(Agent-to-Agent) 프로토콜 개요

### 3.1 기본 개념

- **Task**: 클라이언트(IDE)가 에이전트(원격 AI)에게 시키는 “작업 요청” 단위.
    
- **Message**: 사람(또는 에이전트)이 주고받는 대화·지시사항·추가 정보.
    
- **Artifact**: 작업 결과물(코드, 이미지, 파일 등)이며, 여러 Part로 스트리밍 전송 가능.
    

### 3.2 주요 기능

1. **비동기 작업**: ‘submitted’→‘working’→‘completed’ 등으로 상태 관리.
    
2. **스트리밍**: SSE(Server-Sent Events)로 중간 진행 상황이나 결과물을 Chunk 단위로 전송.
    
3. **Push 알림**: 클라이언트가 오프라인이어도, 에이전트가 정해둔 URL로 상태 변화를 알릴 수 있음.
    
4. **인증/엔터프라이즈 지원**: Agent Card에서 Bearer Token, OAuth2 등 인증 스키마를 안내.
    

### 3.3 Agent Card

- “어떤 스킬을 지원하는지”, “어떤 인증/인가가 필요한지”, “스트리밍 지원 여부” 등을 JSON 형식으로 제공.
    
- 클라이언트(IDE)는 이 Agent Card를 조회해 **“이 에이전트가 Plan/Act 기능을 제공하는구나”**라고 알 수 있음.
    

---

## 4. Plan/Act Mode + A2A 결합 시 기대효과

### 4.1 다중 에이전트/외부 서비스와의 호환

- 기존 구조가 **IDE ↔ 단일 AI**에 국한되었다면, A2A는 여러 AI 에이전트(보안 검사, 문서화, 번역 등)를 한꺼번에 연결할 수 있도록 표준화된 형식을 제공.
    
- 예:
    
    1. Plan Mode에서 “다른 보안 스캐너 에이전트”를 호출해 취약점 파악,
        
    2. 결과를 Act Mode로 넘겨 자동 수정,
        
    3. IDE가 이를 SSE로 스트리밍 받아 에디터에 즉시 표시.
        

### 4.2 장시간(비동기) 상태 관리

- A2A “TaskState”로 “working → input-required → completed → failed” 등 단계별 상태를 IDE가 명확히 추적 가능.
    
- IDE가 재접속해도 `tasks/resubscribe`를 통해 중단된 스트림을 이어받을 수 있음.
    

### 4.3 인증·보안·엔터프라이즈 기능

- 대규모 팀/기업 환경에서 “요청”마다 인증 토큰을 부착하거나, OAuth2 플로우를 표준으로 적용 가능.
    
- Agent Card로 “이 에이전트는 Bearer scheme을 사용”과 같은 정보를 미리 선언.
    

### 4.4 Plan/Act 규칙(시스템프롬프트)을 더욱 체계적으로 처리

- Plan Mode, Act Mode 등 모듈화된 JSON 파일을 “Message.metadata”에 담아 전송하거나, **“Artifact”**로 저장해 둔 뒤 필요할 때 참조할 수 있음.
    
- **Plan Mode** → “input-required” → 사용자 승인 후 “Act Mode”로 이어지는 식의 시나리오를 A2A Task lifecycle로 표현하면, IDE와의 연계가 매우 깔끔해짐.
    

### 4.5 유지보수·확장성

- 현재 JSON 구조가 잘 모듈화되어 있으므로, A2A에서도 “이 모드는 어떤 규칙·섹션을 사용한다”는 정보를 그대로 Task에 주입하면 됨.
    
- 다른 AI를 추가하거나 프로세스를 변경해도, A2A 표준을 사용하면 작업 관리 로직을 재활용 가능.
    

---

## 5. 구현 전략

### 5.1 Agent Card 설계

- **IDE Assistant**(또는 “Caret AI”)가 제공하는 기능(Plan Mode, Act Mode 등)을 `skills`로 명시.
    
- 예시:
    
    json
    
    복사편집
    
    `{   "name": "Caret IDE Assistant",   "description": "AI assistant for planning and implementing coding tasks",   "url": "https://example.com/caret",   "version": "1.0.0",   "capabilities": {     "streaming": true,     "pushNotifications": false   },   "authentication": {     "schemes": ["Bearer"]   },   "skills": [     {       "id": "plan_mode",       "name": "Planning tasks",       "description": "Gather requirements and outline the solution approach"     },     {       "id": "act_mode",       "name": "Implementing tasks",       "description": "Use file editing tools and finalize solutions"     }   ] }`
    

### 5.2 Task/Message로 기존 Prompt 매핑

1. **Plan Mode**일 때:
    
    - `message.metadata.mode = "plan"`
        
    - `parts` 안에 “plan_mode_rules.json”, “common_rules.json”에서 필요한 텍스트를 가져와 삽입(또는 Server가 이미 내장).
        
    - A2A “tasks/send`”로 전송.
        
2. **Act Mode**일 때:
    
    - `message.metadata.mode = "act"`
        
    - 파일 수정 요청, 빌드 요청 등을 “Message.parts”로 담아 전송.
        
    - 결과물(코드 등)은 A2A “Artifact”로 반환.
        

### 5.3 장시간 작업 및 스트리밍

- IDE가 `tasks/sendSubscribe`로 Task를 생성 + SSE 스트림을 열어두면, AI가 여러 번에 걸쳐 중간 메시지, Artifact를 전송.
    
- 사용자는 SSE로 실시간 결과를 확인 가능(Plan Mode 초안, Act Mode 코드 생성 등).
    

### 5.4 에러 처리 & 모드 전환

- 작업 도중 에러가 발생하면 `TaskState = "failed"`로 전환되거나, `input-required` 상태로 전환해 **Plan Mode**로 복귀를 요청할 수 있음.
    
- IDE는 해당 상태를 감지해, 자동으로 “plan_mode” 프롬프트를 준비하고 사용자에게 “에러 정보를 보여주고 다시 설계하시겠습니까?” 질문.
    

---

## 6. 특허적 관점에서의 아이디어

### 6.1 A2A 자체는 공개 표준

- A2A 프로토콜 자체를 특허화하기는 불가능(이미 공개).
    
- **그러나**, IDE 내부 “Plan/Act 모드 전환 + A2A Task Lifecycle + JSON 모듈형 시스템프롬프트”를 하나의 **새로운 프로세스**로 특허화할 수 있습니다.
    

### 6.2 가능성 높은 특허 포인트

1. **“모드 전환 프로세스”**: Plan Mode로 수집된 정보를 A2A `input-required` 상태로 잡아두고, 사용자 승인 시 Act Mode로 넘어가 작업을 “working”→“completed”로 전환하는 구조.
    
2. **“JSON 분산 관리 프롬프트”의 A2A 자동 직렬화**: 수많은 .json 파일(규칙, 가이드)을 IDE가 동적으로 결합해 AI에게 전송(“Message.metadata” 또는 “Message.parts”).
    
3. **IDE↔A2A의 SSE·Push 알림 결합**: 실제 파일 수정, 빌드, 결과물(Artifact) 스트리밍, 그리고 에러 발생 시 “Plan Mode 재진입”을 수행하는 **오케스트레이션** 로직.
    

### 6.3 특허 확보 시사점

- “AI 코딩생산성 + 협업” 측면에서 독창적인 워크플로우(Plan↔Act, 자동 모드 전환, IDE 통합 SSE, 에러 복구 등)라면, 선행기술 대비 차별화를 만들 수 있습니다.
    
- 명세서에는 가능한 한 **구체적인 단계(Plan 준비→User 승인→Act 모드→Artifact 스트리밍→오류 시 재계획)**를 흐름도, 시나리오로 자세히 기재하는 것이 좋습니다.
    

---

## 7. 결론

1. **A2A 도입 시 장점**
    
    - 멀티 에이전트와 호환되는 통합 프로토콜로, 장시간 작업, 스트리밍, 인증 등 엔터프라이즈 기능을 쉽게 구현 가능.
        
    - 현재 **Plan Mode/Act Mode** 분할 구조도 A2A “Task State”와 잘 맞아떨어지며, IDE가 “Message”와 “Artifact” 구조를 활용해 풍부한 협업 경험을 제공할 수 있음.
        
2. **구현 전략**
    
    - **Agent Card**로 “Caret IDE Assistant”의 기능(Plan, Act)을 정의.
        
    - “Plan/Act” 시스템 프롬프트 JSON들을 **Message.metadata** 등에 담아 A2A 방식으로 주고받음.
        
    - 에러나 중간 확인이 필요한 시점에 A2A의 `input-required` 상태를 활용, “Plan Mode”로 되돌아가는 시나리오를 구현.
        
3. **특허적 가능성**
    
    - A2A 자체는 공개 사양이지만, **IDE + Plan/Act 모드 전환 + A2A Task Lifecycle**을 포함하는 **새로운 프로세스**는 독창적일 수 있음.
        
    - “분산된 Prompt JSON 자동 결합 → A2A Message 전송 → Artifact 스트리밍 → 모드 전환” 흐름이 구체적이고 실효성 있다면, 프로세스 특허로서 의미를 가질 가능성이 높음.
        

**요약하자면**, 현재 시스템(Plan/Act 모드 기반의 모듈식 프롬프트) 위에 A2A를 도입하면,

- 협업·확장성·엔터프라이즈 기능이 크게 향상되고,
    
- 동시에 “오케스트레이션” 전반을 자동화하는 독창적 프로세스를 마련하여,  
    **장기적으로 특허화**나 **시장 선점**을 노릴 수 있는 기술적 우위를 확보할 수 있습니다.