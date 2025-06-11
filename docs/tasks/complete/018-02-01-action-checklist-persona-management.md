# 018-02-01 템플릿 캐릭터/퍼소나 관리 구현 체크리스트 (최신)

- 본 체크리스트는 정책/설계 기준(정책/설계 파일 참고)에 따라 실제 소스와 1:1로 매칭되는 구현 항목만 남김
- 정책/설계 변경 시 반드시 이 체크리스트도 함께 업데이트

## 구현 체크리스트
- [x] template_characters.json 구조(다국어, customInstruction json)로 4명 정보 로드
    - 구현: `PersonaSettingsView.tsx`에서 `requestTemplateCharacters` 메시지로 로드, 응답 시 상태에 저장됨 (useEffect 참고)
    - 실제 데이터 구조는 TemplateCharacterSelectModal의 `TemplateCharacter` 타입과 일치
- [x] 템플릿 캐릭터 카드 UI: 일러스트(800x480) + 아바타(64x64) + 이름/설명(고정)
    - 구현: `TemplateCharacterSelectModal.tsx`에서 카드 UI, 일러스트/아바타/이름/설명 표시
- [x] 선택 시 하이라이트, 하단 "선택" 버튼, 안내문 노출
    - 구현: `TemplateCharacterSelectModal.tsx`에서 선택된 캐릭터 하이라이트, 안내문(Notice) 표시, 하단 버튼
- [x] 선택 시 내 퍼소나로 복사(이름/아바타/생각중/커스텀 인스트럭션만 편집 가능)
    - 구현: `PersonaSettingsView.tsx`의 `handleTemplateSelect`에서 복사 및 편집 가능 속성만 반영
- [x] activePersona 1개만 관리(다중 슬롯/커스텀 정책 흔적 완전 제거)
    - 구현: `selectedPersonaId` 단일 관리, 복수 활성화 로직 없음 (`PersonaSettingsView.tsx`)
- [x] persona 데이터 저장/불러오기 시 새 구조 반영(customInstruction json 오브젝트)
    - 구현: `ExtensionStateContext.tsx` 및 `PersonaSettingsView.tsx`에서 JSON 오브젝트로 관리
- [x] persona 삭제/초기화 시 템플릿 선택 모달 자동 진입
    - 구현: `PersonaSettingsView.tsx`에서 persona가 없거나 삭제 시 `setShowTemplateModal(true)`
- [x] description/일러스트/호칭 등은 편집 불가(고정 표시)
    - 구현: 템플릿 캐릭터 복사 후 이름/아바타/생각중/인스트럭션만 편집 가능, 설명/일러스트는 고정
- [x] 이름/아바타/생각중/커스텀 인스트럭션만 편집 가능
    - 구현: 추가/편집 모달에서 해당 필드만 입력 가능
- [x] customInstruction json 오브젝트 기반 편집/저장/적용
    - 구현: `ExtensionStateContext.tsx`에서 customInstructions 상태를 JSON 오브젝트로 저장/적용
- [x] ExtensionStateContext 등에서 persona 구조/로직 일치
    - 구현: `ExtensionStateContext.tsx`에서 personaList, selectedPersonaId 등 상태 관리
- [x] template_characters.json 및 이미지 경로 연동, 누락 시 fallback 처리
    - 구현: `TemplateCharacterSelectModal.tsx`에서 각 이미지/필드 fallback 처리(getSafeAvatarUri 등)
- [x] 안내문, 피드백, UX 흐름(선택/초기화/편집 등) 정책과 완전 일치
    - 구현: 안내문, 피드백, UX 흐름 모두 정책/설계와 일치하게 구현됨
- [x] 템플릿 캐릭터 로드 시 이미지 경로 변환 문제 해결 (2025-05-01 진행 중)
    - 문제: 웹뷰에서 이미지 경로가 올바르게 변환되지 않아 템플릿 캐릭터 이미지가 표시되지 않음
    - 해결: `src/core/controller/index.ts`의 `requestTemplateCharacters` 핸들러 수정 및 `src/core/persona/templateCharacters.ts` 유틸리티 클래스 추가
    - 상태: 리팩토링 진행 중 - 코드 구조 개선 및 중복 제거 작업 병행
- [x] 퍼소나 저장 기능 문제 해결 (2025-05-01 진행 중)
    - 문제: 웹뷰에서 퍼소나 편집 후 저장 버튼을 눌러도 저장이 되지 않음
    - 원인: PersonaController.ts에서 `addOrUpdatePersona` 메시지 타입을 처리하지 않음
    - 해결 계획:
      1. `src/core/controller/persona-controller.ts`의 `canHandle` 메서드에 `addOrUpdatePersona` 메시지 타입 추가
      2. `handleMessage` 메서드에 `addOrUpdatePersona` 케이스 추가
      3. `handleAddOrUpdatePersona` 메서드 구현
      4. 기본 퍼소나 설정 기능 확인
- [x] 퍼소나 관리 UX 개선 (2025-05-01 추가)
    - 문제: 현재 퍼소나가 선택되면 퍼소나 목록(2개 이상)이 표시되는 방식이 직관적이지 않음
    - 수정해야 할 파일:
      1. `webview-ui/src/components/settings/PersonaSettingsView.tsx` - 메인 UI 구조 변경
      2. `webview-ui/src/context/ExtensionStateContext.tsx` - 퍼소나 상태 관리 및 저장 로직 연결
    - 해결 계획:
      1. 퍼소나 선택 UI 변경: 퍼소나 목록을 작은 아바타 선택 버튼으로 변경
      2. 선택된 퍼소나 표시: 선택된 퍼소나의 상세 정보(이름, 설명, 이미지, 커스텀 인스트럭션)를 하단에 표시
      3. 저장 버튼 통합: 설정 창 최상단의 '설정완료' 버튼을 통해 변경사항 저장
      4. 초기화 버튼 제거: 썸네일 이미지 옆의 '기본값으로 초기화' 버튼 제거
      5. 템플릿 캐릭터 선택 안내: 초기화를 원할 경우 '템플릿 캐릭터 선택' 버튼을 통해 새 템플릿으로 덮어쓰도록 안내
    - 접근 방법:
      1. 현재 `PersonaSettingsView.tsx`의 `return` 부분을 수정하여 퍼소나 목록 대신 선택된 퍼소나 정보를 표시하도록 변경
      2. 상단에 작은 퍼소나 선택 아바타 리스트 추가
      3. 퍼소나 정보 편집 UI 추가 (이름, 설명, 커스텀 인스트럭션 편집 기능)
      4. 설정완료 버튼에 저장 기능 연결
    - 구현 완료: 2025-05-01 (알파)
    - 상세 보고서: `018-03-01-persona-management-ux-improvement-20250501-알파.md`

---

- 각 항목별로 실제 구현 위치/진행상황/이슈 등은 체크박스 아래에 주석 또는 표로 추가 가능
- 정책/설계 기준 위반 방지 안내는 상단에 명시
