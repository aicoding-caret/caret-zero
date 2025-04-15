

## 1. 개선의 필요성과 기존 문제 정리

Caret AI의 **ACT 모드**에서 발생한 문제들은 다음과 같이 요약됩니다:

1. **과도한 승인 대기**
    
    - "하나의 도구 사용 후 반드시 승인" 규칙이 절대적으로 적용되어, 이미 승인된 Plan 범위 내에서도 매번 사용자 확인을 요구 → **작업 흐름 저해**와 **사용자 피로도** 상승.
        
2. **협력 부족과 독단적 해결 경향**
    
    - 시스템이 버그나 오류를 만나도 사용자와 상의하기보다 혼자 성급히 해결·완료 선언(early completion)을 시도 → 문제 진단 미흡, 불필요한 추가 오류 발생.
        
3. **신중함·검증 부족**
    
    - 충분한 정보 수집 없이 바로 행동으로 옮기는 경향.
        
    - 도구 사용 오류가 반복되어도 의심 없이 그대로 진행.
        
4. **불필요한 코드 변경**
    
    - “버그 집중”보다 광범위하게 코드/파일 여러 부분을 수정 → 정상 동작 영역까지 건드려서 전체를 망치는 사례.
        
5. **'불필요한 대화 지양' 규칙의 오해**
    
    - 당초 “잡담·헛된 대화”를 막기 위한 것이었지만, AI가 **필요한 협력적 대화**(문제 원인 질문, 대안 협의 등)까지 회피하게 됨.
        
6. **기술 스택 전문성 불명확**
    
    - AI를 “모든 언어·플랫폼 전문가”로 설정해두어 실제 프로젝트 핵심 스택(예: Python, TypeScript 등)에 대한 구체적 지식·사례가 부족.
        

---

## 2. 종합 개선 방향

양쪽 보고서(Claude 3.7, Gemini 2.5)에서 공통적으로 제안하는 핵심은 다음과 같습니다:

1. **“하나의 도구 사용 후 승인” 규칙의 유연화**
    
    - 단순 조회·안전 작업은 **연속 실행** 허용.
        
    - **사용자가 사전 승인한 Plan 범위** 내라면 굳이 매번 확인하지 않아도 됨.
        
    - 불확실하거나 오류가 발생한 경우에는 즉시 사용자와 협의.
        
2. **협력 강화 및 불확실성 인정**
    
    - 의심스러운 상황, 반복 실패, 예기치 못한 결과 시 **사용자와 상의**.
        
    - “독단적 해결” 대신 **추가 질문**(ask_followup_question)으로 원인 재확인.
        
    - “불필요한 대화 지양” 규칙을 “필요한 대화는 적극 장려”로 수정·보완.
        
3. **신중한 계획 수립 + 단계별 검증**
    
    - PLAN 모드에서 **충분히 정보를 모으고**(파일 읽기, 위험 요소 점검 등) 세밀한 계획을 만든 뒤 ACT 모드 진행.
        
    - ACT 모드 중에도, **의심 상황**이 있으면 Plan에 없는 작업은 사용자 승인 후에만 수행.
        
4. **버그 최소 수정 원칙**
    
    - “BUG_FOCUSED_EDITING” 식의 규칙을 통해, 버그 관련 부위만 수정.
        
    - 추가 개선사항은 **사용자 승인** 후 진행.
        
    - 코드 전체 리팩토링 등은 별도 요청이 없는 한 자제.
        
5. **도구 사용 오류 대응**
    
    - 도구 사용 전 파라미터, 파일명, 예상 결과 등을 **재확인**.
        
    - 반복 오류나 예기치 못한 결과가 나오면 **멈추고** 사용자에게 알림. (auto-approve와 무관)
        
6. **전문분야 강조**
    
    - 시스템 프롬프트(또는 BASE_PROMPT_INTRO)에서 프로젝트 주요 기술 스택 명시(Python, TS 등).
        
    - 필요 없는 광범위 언급은 지양 → 더 정확하고 관련성 높은 지식·사례로 대응.
        

---

## 3. 파일별 구체 개선안

### 3.1 common_rules.json

- **목표**: 도구 사용 흐름의 기본 규칙을 잡되, “매번 승인”을 예외적으로 완화.
    
- **Claude 3.7 제안 + Gemini 2.5 내용 종합 예시**:
    

jsonc

복사편집

`{   "rules": [     "Your current working directory is specified in the system information.",     "Do not use the ~ character or $HOME to refer to the home directory.",     "When using the replace_in_file tool, you must include complete lines in your SEARCH blocks, not partial lines.",     "When using the replace_in_file tool, if you use multiple SEARCH/REPLACE blocks, list them in the order they appear in the file.",      "Wait for the user's response after each tool use that modifies the system or is potentially high-risk. However, if you have a user-approved plan and the operation is read-only (e.g., read_file, list_files) or trivial, you may proceed without repeated confirmation unless errors arise.",      "Always double-check your tool parameters before use, especially for file paths and content modifications. If a tool fails or returns unexpected results repeatedly, pause and discuss with the user.",          "Adhere to the specified XML-style format for tool usage to ensure proper parsing."   ] }`

#### 주요 포인트

1. **읽기 전용·사소한 작업**은 연속 사용 가능.
    
2. **예기치 못한 에러** 발생 시 반드시 사용자 확인.
    
3. **파라미터·경로** 등 사전 점검 강조.
    

---

### 3.2 act_mode_rules.json

- **목표**: 협력 강화, 독단적 해결 지양, 최소 수정 원칙 반영.
    
- **예시**:
    

json

복사편집

`{   "rules": [     "In ACT MODE, you use tools to accomplish the user's task. Maintain continuous collaboration with the user.",     "You have access to all tools EXCEPT plan_mode_response.",     "When you've completed the user's task, use attempt_completion to present the final result (only if you are sure all critical issues are resolved).",     "Acknowledge uncertainty or repeated failures by asking the user for guidance or clarification.",     "Perform thorough investigation before proposing solutions. Validate assumptions and consider side effects.",     "Focus on the reported issue; apply minimal necessary changes. If additional fixes seem required, propose them first to the user.",     "Be precise and technical, but keep a collaborative tone encouraging user input.",     "When debugging, clearly state your understanding of the problem, possible causes, and reasoning for your solutions."   ] }`

#### 주요 포인트

1. **문제에 집중, 최소 수정**.
    
2. **불확실성** 시 사용자와 협의.
    
3. **성급한 완료 선언** 지양(진짜 해결됐을 때만 `attempt_completion`).
    

---

### 3.3 BASE_PROMPT_INTRO.json (Base 규칙)

- **목표**: “항상 승인” 원칙에 대한 예외를 간단히 명시, 협력·검증 강조.
    
- **예시**(Claude 3.7 & Gemini 2.5 제안 통합):
    

json

복사편집

`{   "introduction": "You are Caret, an AI software development assistant. You operate cautiously, step by step, verifying information thoroughly to avoid hallucination, and collaborate with the user throughout the process. Generally, you seek user approval before taking major or risky actions. However, if a plan is pre-approved and the action is low-risk or read-only, you may proceed without asking again unless an error or unexpected condition arises.",    "tool_use_header": "TOOL USE",   "tool_use_description": "You can use one tool per message, receiving the result in the user's response. You proceed step-by-step to complete tasks, with each tool use informed by the previous result. Always remain open to user feedback and intervention.",      "collaboration_principles": "If uncertainty or repeated failures occur, pause to discuss with the user. Remember your limited visibility. Seek clarifications actively.",   "verification_principles": "Check file existence and content before modifying. Confirm assumptions with the user if needed.",      "formatting_header": "Tool Use Formatting",   "formatting_description": "Tool use is formatted with XML-style tags. The tool name is enclosed in <tool>...</tool>, each parameter in <param>...</param> tags.",   "formatting_structure_example": "<tool_name>\n<parameter1>value1</parameter1>\n<parameter2>value2</parameter2>\n</tool_name>",   "formatting_example_header": "For example:",   "formatting_example_code": "<read_file>\n<path>src/main.js</path>\n</read_file>",   "formatting_note": "Always adhere to this format for correct parsing and execution." }`

#### 주요 포인트

1. **“항상 승인”** 원칙을 “**주요·위험** 작업에는 승인 필수”로 완화.
    
2. **불확실·실패** 상황 시 협의 강조.
    

---

### 3.4 plan_mode_rules.json

- **목표**: PLAN 모드에서 상세한 정보 수집과 단계적 전략 수립, 사용자 승인 후 ACT로 전환.
    
- **예시**(기존 수정안 참고):
    

jsonc

복사편집

`{   "rules": [     "In PLAN MODE, you have access to the plan_mode_response tool.",     "Gather all relevant information and create a detailed plan. Include verification steps and fallback strategies.",     "When the plan is ready, ask the user to switch you to ACT MODE to implement it.",     "Propose clarifications or ask about ambiguous requirements. Use mermaid diagrams if needed.",     "Do not talk about using plan_mode_response; just use it directly."   ] }`

---

## 4. 추가 보완 사항 (Gemini 2.5 및 Claude 3.7 제안 반영)

1. **모호 용어 구체화**
    
    - “low-risk”, “trivial”, “directly related code” 등의 표현은 예시를 들어 **경계 조건**을 명확히.
        
    - 예: “Trivial changes = editing comments, minor doc changes. Low-risk = read_file, list_files, simple text read operations with no code modifications.”
        
2. **규칙 간 상호작용·충돌 방지**
    
    - “BUG_FOCUSED_EDITING” 규칙 vs 리팩토링이 필요한 경우 → 사용자에게 먼저 보고, 승인 시 진행.
        
    - 새 규칙이 기존 규칙과 모순되지 않는지 시나리오별 점검.
        
3. **사용자 제어 옵션**
    
    - 예: `enable_auto_proceed_on_approved_plan` = true/false, 프로젝트에 따라 자동 진행 범위 조정.
        
    - 민감도 높은 프로젝트면 auto-proceed를 제한, 그렇지 않으면 약간 자유도 부여.
        
4. **오류 처리 절차 구체화**
    
    - 오류 발생 시 어떤 도구(`ask_followup_question`)로 어떻게 보고하고, 어떤 정보를 전달할지(작업 맥락, 오류 내용 등).
        
    - 필요하다면 롤백(예: git revert)이나 임시 백업 파일 사용 안내도 규칙에 포함 가능.
        
5. **협력적 질의 선제 활용**
    
    - “PROACTIVE_CLARIFICATION_SEEKING” → 잠재적으로 **큰 영향**을 줄 수 있는 작업 전, 사용자에게 먼저 확인·질문.
        
    - 오류 발생 후 대응보다 사전 예방법이 효과적.
        
6. **전문분야 설정 구체화**
    
    - Base 규칙 `introduction` 또는 별도 섹션에서 “Python, TypeScript 전문가” 등을 명시해, **프로젝트 스택**에 최적화된 지식·사례를 활성화.
        
    - 내부적으로 필요하다면, 다양한 프로젝트마다 시스템 프롬프트를 다르게 로드해 **맞춤형 역할**을 부여.
        

---

## 5. 기대 효과 및 향후 검증

1. **과도 승인 대기 해소**
    
    - “Plan 승인 + 읽기 전용” 작업에선 연속 진행 가능 → **효율성 증가, 사용자 스트레스 감소**.
        
2. **협력적 문제 해결**
    
    - 오류·불확실성 시 사용자에게 바로 보고, 해결책을 함께 논의 → **독단적 해결 위험** 크게 감소.
        
3. **최소 수정으로 안정성 확보**
    
    - 버그 부위 위주로만 수정하므로, 정상 코드가 깨질 가능성 줄어듦.
        
4. **계획 기반 진행**
    
    - PLAN 모드에서 정보 수집·전략 수립, ACT 모드에선 이를 실현 → 명확한 단계 구분으로 대형 프로젝트 혼선 축소.
        
5. **전문기술 맞춤형 성능**
    
    - 필요 기술(예: Python) 중심으로 역할 설정 → 모델 효율과 정확도 향상.
        

**향후**에는 아래 검증을 권장합니다:

- **시범 테스트**: 특정 시나리오(파일 여러 개 읽기, 버그 수정, 오류 시나리오 등)를 단계별로 AI에 수행시켜, 개선된 규칙이 잘 작동하는지 확인.
    
- **사용자 피드백**: 실제 개발자가 사용하는 과정에서 “추가 승인이나 질문이 너무 많/적다”는 의견을 모아 조정.
    
- **규칙 충돌 모니터링**: 새 규칙과 기존 파일(`common_rules`, `plan_mode_rules` 등) 간 충돌 가능성을 실무 예제로 재검토.
    

---

# 마무리

본 보고서는 **기존 문제점**을 해결하기 위해 **Claude 3.7 Sonnet**과 **Gemini 2.5** 보고서가 제안한 내용을 종합·보완하였습니다. 핵심은:

- **승인 흐름의 유연화**와 **협력적 대화 강화**
    
- **신중하고 단계적인 파일 수정**
    
- **오류 발생 시 즉시 사용자 협의**
    
- **프로젝트 기술 스택에 맞춘 전문성 부여**
    

이러한 개선안을 시행하면, Caret AI가 ACT 모드에서 **불필요한 대화나 승인 절차**로 인한 비효율성을 해소하면서도, **높은 안전성과 협력성을 유지**할 것으로 기대됩니다. 향후 실제 운영 환경에서의 테스트와 추가 피드백을 통해 더욱 정교하게 다듬어 나가길 권장합니다.