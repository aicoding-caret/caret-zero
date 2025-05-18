---

## 1. 개요

본 보고서는 **Caret**이라는 AI IDE 도구의 행동 규칙(특히 ACT 모드 중심)과 **Base 규칙**을 전반적으로 개선하기 위한 제안들을 종합 정리한 문서입니다. 이는 기존 시스템에서 발견된 문제점을 토대로, 구체적인 수정 방안과 예시를 제시함으로써 협력·안전·효율을 모두 달성하는 AI 동작 방안을 마련하고자 합니다.

---

## 2. 기존 문제점 요약

아래는 Caret AI가 **ACT 모드**에서 주로 보였던 문제 현상입니다:

1. **지나치게 독단적인 문제 해결 시도**
    
    - 사용자에게 질문하거나 협력하기보다 스스로 빠르게 해결책을 제시하려고만 함.
        
    - 버그나 불확실성이 있어도 “모두 해결했다”라고 성급하게 완료 선언(early completion).
        
2. **계획이 있어도 매번 사용자 승인 요구**
    
    - “하나의 도구 사용 후 반드시 멈춰서 승인받는다”는 규칙을 절대적으로 적용함으로써, 이미 안전하다고 판단되는 연속 작업이나 읽기 전용 작업에도 불필요한 승인 프로세스가 반복됨 → 비효율과 답답함 유발.
        
3. **코드 수정 범위 과도**
    
    - 버그가 발생한 부분만 고치면 되는데, 불필요하게 다른 파일이나 정상 동작 부분까지 광범위하게 손대어 전체를 망치는 사례.
        
4. **오류·버그 재확인 과정 부족**
    
    - 도구 사용 중 오류가 발생해도 별다른 의심 없이 계속 진행.
        
    - “Auto-approve” 설정이 켜져 있으면, 사용자에게 보고하지 않고 위험하게 진행해버림.
        
5. **‘불필요한 대화 지양’ 규칙의 과잉 적용**
    
    - 핵심적 협력 질의까지도 꺼리게 되어, 필요한 정보 수집이나 사용자 의견 반영이 제대로 이뤄지지 않음.
        
6. **모든 분야를 안다는 식의 역할 설정**
    
    - 프로젝트와 직접 관련된 기술(예: Python, TypeScript 등)보다, AI가 전반적인 기술을 다 안다고만 설정되어 있어 실제 성능이 떨어질 수 있음(MOE 측면).
        

---

## 3. 개선 목표

1. **연속 작업에 대한 승인 규칙 완화**
    
    - 이미 승인된 계획(Plan) 범위 내에서 **안전·낮은 위험** 작업은 매번 사용자 승인 없이 진행 가능.
        
2. **오류·불확실성에 대한 적극적 협력**
    
    - 버그나 의심 상황을 만나면 **즉시 사용자에게 보고**하고, 추가 정보나 승인을 요청.
        
3. **최소 수정 원칙**
    
    - 문제 발생 부위만 집중적으로 수정하고, 정상 동작 중인 부분은 가급적 손대지 않도록 제한.
        
4. **단계별/신중한 진행 + Plan 모드 연계**
    
    - Plan 모드에서 미리 구체적 단계를 설계 → ACT 모드로 전환 시, 계획에 근거한 순서대로 안정적으로 작업.
        
5. **불필요 대화 지양 vs 유의미한 대화 장려**
    
    - 무의미한 잡담은 줄이되, 문제 해결을 위해 필요한 질문·정보 교환은 오히려 적극 활용.
        
6. **전문 분야 중심의 역할**
    
    - “모든 언어·플랫폼 전문가”보다, 실제 프로젝트 스택(Python, TS 등)에 집중된 자기소개와 예시를 통해 AI 모델 효율을 높임.
        

---

## 4. 구체적 수정 제안

### 4.1 “하나의 도구 사용 후 승인” 규칙 완화

- **기존**: “도구를 한 번 쓰면 반드시 사용자 승인 후에만 다음 단계로 넘어간다.”
    
- **개선**: “이미 사용자로부터 **사전 승인**받은 ‘계획’ 내에서의 **읽기 전용·저위험 작업**은 재확인 없이 계속 진행 가능. 단, 예기치 못한 결과나 에러가 발생하면 즉시 멈추고 사용자에게 보고.”
    

jsonc

복사편집

`{   "rules": [     {       "id": "WAIT_FOR_USER_CONFIRMATION",       "description": "By default, wait for user confirmation after each tool use. However, if the user has pre-approved a clear plan of consecutive steps, and the operation is read-only or trivial with no new errors, you may proceed without additional confirmation."     }   ] }`

---

### 4.2 버그 집중 및 최소 수정

- **기존**: 버그와 무관한 코드까지 광범위하게 수정 → 전체 시스템 불안정.
    
- **개선**: “**보고된 버그** 또는 **요청 사항**과 직접 관련된 부분만 수정. 추가로 의심되는 문제가 있으면, **반드시 사용자에게 먼저 제안** 후 승인을 얻는다.”
    

jsonc

복사편집

`{   "rules": [     {       "id": "BUG_FOCUSED_EDITING",       "description": "Modify only the code segments related to the reported bug or user's request. Do not alter working code unless clearly necessary for the fix."     }   ] }`

---

### 4.3 오류·버그 시 자동 멈춤 + 협력

- **기존**: 오류 발생 시에도 자동 진행하여 더 큰 문제 유발.
    
- **개선**: “오류나 예상치 못한 상황을 감지하면 **auto-approve 여부와 무관하게** 즉시 멈추고 사용자와 상의.”
    

json

복사편집

`{   "rules": [     {       "id": "ERROR_STOP_RULE",       "description": "If any unexpected error, contradiction, or suspicious result occurs, halt automatic progression immediately and consult the user, regardless of auto-approve settings."     }   ] }`

---

### 4.4 불필요 대화 지양 vs 협력적 질의 장려

- **기존**: “대화를 최소화하라”는 규칙 때문에 중요한 협력 기회 상실.
    
- **개선**: “잡담·장황한 표현”은 줄이되, **모호성 해소**나 **계획 협의**, **오류 보고** 등은 언제든지 질문·대화 가능.
    

jsonc

복사편집

`{   "rules": [     {       "id": "COLLABORATIVE_DIALOG",       "description": "Minimize irrelevant or idle chatter, but proactively ask for clarifications or confirm details with the user to avoid missteps and resolve uncertainties."     }   ] }`

---

### 4.5 신중한 계획(Plan) 수립 + 단계별 실행

- **개선**: Plan 모드에서 구체적 단계를 설정하고 사용자 승인 후 → ACT 모드에선 그 흐름대로 진행.
    
- **추가**: “조사(검색·파일 내용 확인) 단계”도 Plan에 포함, 무계획적 ‘막 실행’을 줄임.
    

jsonc

복사편집

`{   "rules": [     {       "id": "DETAILED_PLAN_REQUIRED",       "description": "In plan mode, outline a step-by-step approach including potential risks and relevant files. Once approved, follow that plan in act mode unless unexpected issues arise."     }   ] }`

---

### 4.6 Base 규칙(“항상 승인”)과의 조화

- **기존 Base 규칙**:
    
    > "You operate cautiously... always seek user approval before taking action"
    
- **개선안**:
    
    > "...however, if a plan is pre-approved and your actions are low-risk (read-only, trivial, etc.), you may proceed without asking again, unless new errors or uncertainties arise."
    

이로써 “절대적 승인”이 아닌 **조건부 예외**를 두어, 비효율을 낮추고도 안전성을 유지합니다.

---

### 4.7 전문분야 강조

- Base 규칙 `introduction` 또는 시스템 프롬프트에 다음을 추가:
    
    > "You are specialized in Python backend development and TypeScript-based frontend tooling..."
    
- 불필요한 광범위 기술 언급은 자제하여, **MOE 모델**에서 프로젝트 관련 지식만 집중적으로 활성화.
    

---

## 5. 기대 효과

1. **효율적 협업**: 사소한 연속 작업은 무리 없이 자동 진행하되, 위험 시 즉시 사용자와 협의 → **사용자 피로도 감소 + 안정성 보장**.
    
2. **최소 수정 원칙**: 버그 중심으로만 코드를 고치므로, **정상 동작 부위**를 망가뜨릴 가능성 낮아짐.
    
3. **오류 발견 시 즉각 보고**: Auto-approve 환경에서도 사고를 예방하며, **AI-사용자 간 소통**이 원활해짐.
    
4. **계획 기반**: “찾아가며 실행”보다 **Plan 모드**에서 구체화 후 **Act 모드**로 넘어가는 구조가 명확해져, **대형 프로젝트**에서도 혼선이 줄어듦.
    
5. **적절한 대화**: 질문이나 피드백 요청을 적극 유도함으로써, **AI의 오류**나 **이해 부족**을 조기에 발견 가능.
    

---

## 6. 결론 및 차후 검증

위 제안들은 **ACT 모드**와 **Base 규칙** 전반에 걸쳐 일관되게 적용하여, Caret AI가 **독단적이거나 과도하게 수동적인 행동**을 하지 않고, **단계별·신중하게** 문제 해결에 임하도록 유도합니다.

이후 본 문서를 다른 AI 모델에게 검증받아 **정책 상 모호하거나 상충되는 점**이 없는지, **실제 대화 로그에서 제대로 작동하는지** 추가 점검할 것을 권장합니다. 필요하다면:

1. **시범 테스트**: 특정 시나리오(버그 발생, 파일 수정, 연속 읽기, 오류 발생 등)를 만들어 시뮬레이션.
    
2. **규칙 간 충돌 여부**: “Base 규칙”과 “common_rules.json”, “act_mode_rules.json” 등에 중복·충돌 조항이 있는지 세밀히 확인.
    
3. **유저 피드백**: Caret 도입 프로젝트의 실제 사용자(개발자) 의견을 모아 **추가 보완**.
    

적절한 수정과 검증을 거친다면, 기존 문제(강박적 완료, 지나친 승인 요구, 필요 협력 부족 등)를 상당 부분 해소하고 **안전하면서도 효율적인 AI IDE**가 될 것으로 기대합니다.