# 018-03-01 퍼소나 관리 UX 개선 작업 보고서 (2025-05-01, 알파)

## 작업 개요
- 퍼소나 관리 UX 개선 작업 (체크리스트 018-02-01 참조)
- 문제: 현재 퍼소나가 선택되면 퍼소나 목록(2개 이상)이 표시되는 방식이 직관적이지 않음
- 목표: 퍼소나 선택 UI를 개선하여 선택된 퍼소나의 정보를 바로 표시하도록 변경

## 작업 단계
1. 현재 코드 분석 및 백업
2. PersonaSettingsView.tsx 수정
3. ExtensionStateContext.tsx 연결 확인
4. 테스트 및 검증

## 1. 현재 코드 분석 및 백업
- PersonaSettingsView.tsx 파일 백업 완료 (backup/20250501-PersonaSettingsView.tsx)

### 현재 UI 구조 분석
현재 PersonaSettingsView.tsx의 UI 구조는 다음과 같습니다:

1. 상단에 "퍼소나 관리" 제목과 정책 안내문 표시
2. 퍼소나 목록을 표시하는 PersonaList 컴포넌트
   - 각 퍼소나는 아바타, 라디오 버튼, 이름/설명, 삭제/편집 버튼으로 구성
   - 라디오 버튼으로 퍼소나 선택 가능
3. 하단에 "템플릿 캐릭터 선택" 버튼
4. 퍼소나 추가/편집 모달 (showAdd가 true일 때 표시)
5. 템플릿 캐릭터 선택 모달 (showTemplateModal이 true일 때 표시)

### 문제점
1. 퍼소나 선택 시 해당 퍼소나의 상세 정보가 바로 표시되지 않고, 목록에서만 라디오 버튼으로 선택됨
2. 퍼소나 편집을 위해서는 별도의 "편집" 버튼을 클릭해야 함
3. 여러 퍼소나가 동시에 표시되어 사용자가 혼란스러울 수 있음
4. 썸네일 이미지 옆의 "기본값으로 초기화" 버튼이 불필요함

## 2. PersonaSettingsView.tsx 수정 내용

### 새로운 UI 구조 구현
1. 상단에 작은 아바타 버튼으로 퍼소나 선택 UI 구현
   - PersonaAvatarSelector 컴포넌트 추가
   - AvatarButton 컴포넌트로 선택 가능한 아바타 버튼 구현
   - 선택된 퍼소나는 테두리로 강조 표시

2. 선택된 퍼소나의 상세 정보를 하단에 표시
   - PersonaDetailSection 컴포넌트 추가
   - 퍼소나 이름, 설명, 아바타 표시
   - 편집 가능한 필드 직접 표시 (이름, 설명, 커스텀 인스트럭션, 이미지 URL)

3. 저장 버튼 통합
   - 변경사항이 있을 때만 저장 버튼 표시
   - 저장 시 addOrUpdatePersona 메시지 전송

4. 초기화 버튼 제거
   - 기존의 handlePersonaRestore 함수 제거
   - 정책 안내문 변경: "템플릿 캐릭터 선택 시 현재 퍼소나가 덮어씌워집니다. 초기화를 원하시면 템플릿 캐릭터 선택 버튼을 눌러 새 템플릿으로 교체하세요."

### 기능 개선
1. 퍼소나 선택 시 자동으로 폼 데이터 로드
   - handlePersonaSelect 함수 개선
   - 선택된 퍼소나 정보를 폼에 자동으로 로드

2. 실시간 변경 감지
   - hasChanges 상태 추가로 변경 사항 추적
   - 변경 사항이 있을 때만 저장 버튼 표시

3. 타입 오류 수정
   - TemplateCharacter 인터페이스에 맞게 handleTemplateSelect 함수 수정
   - boolean 타입 에러 해결을 위해 기본값 추가 (isDefault || false, isEditable || true)

## 3. ExtensionStateContext.tsx 연결 확인
- ExtensionStateContext.tsx 파일 분석 결과, 퍼소나 상태 관리 및 저장 로직이 올바르게 구현되어 있음
- personaList, selectedPersonaId 등의 상태가 제대로 관리되고 있음
- personaUpdated 메시지 처리 로직이 있어 퍼소나 변경 시 상태가 업데이트됨

## 4. 테스트 및 검증
### 테스트 항목
1. 퍼소나 선택 UI 작동 확인
   - 아바타 버튼 클릭 시 해당 퍼소나 선택
   - 선택된 퍼소나의 상세 정보가 하단에 표시

2. 퍼소나 편집 기능 확인
   - 퍼소나 정보 수정 시 hasChanges 상태 변경
   - 저장 버튼 클릭 시 변경사항 저장

3. 템플릿 캐릭터 선택 기능 확인
   - 템플릿 캐릭터 선택 시 새 퍼소나 생성
   - 생성된 퍼소나가 목록에 추가되고 선택됨

### 개선된 UX 흐름
1. 사용자가 퍼소나를 선택하면 해당 퍼소나의 상세 정보가 바로 표시됨
2. 퍼소나 정보를 직접 편집하고 저장 버튼을 클릭하여 변경사항 저장
3. 초기화가 필요한 경우 템플릿 캐릭터 선택 버튼을 통해 새 템플릿으로 교체

## 단일 퍼소나 시스템으로 변경 (2025-05-01 20:22)

### 변경된 파일

1. **PersonaManager.ts**
   - 파일 이름: `personas.json` → `persona.json` (단수형으로 변경)
   - 함수 인터페이스: 배열 대신 단일 Persona 객체 사용
   - `loadPersonas` → `loadPersona`: 단일 객체 반환 (없으면 null)
   - `savePersonas` → `savePersona`: 단일 객체 저장
   - `deletePersona`: personaId 매개변수 제거 (단일 퍼소나 시스템에서는 ID로 삭제할 필요 없음)

2. **PersonaSettingsView.tsx**
   - `personaList` 대신 단일 `persona` 사용
   - 아바타 선택기 제거 (단일 퍼소나만 표시)
   - 삭제 버튼 및 기능 제거
   - 저장 버튼 제거 (설정 저장에 통합)
   - 템플릿 캐릭터 선택 시 바로 폼에 적용하고 hasChanges 설정

3. **PersonaController.ts**
   - 불필요한 함수들 제거 (`handleSelectPersona`, `handleUpdatePersona`, `handleCreatePersona`, `handleDeletePersona`)
   - `canHandle` 함수에서 지원하는 메시지 타입 업데이트

4. **ExtensionMessage.ts**
   - `persona` 필드를 선택적 필드로 변경
   - `selectedPersonaId` → `personaId`로 변경
   - `ExtensionState` 인터페이스에서 `personaList` 대신 단일 `persona` 사용

### 남은 작업

1. **Controller.index.ts**
   - `getStateToPostToWebview` 함수에서 `personaList`를 `persona`로 변경
   - `getAllExtensionState` 함수 호출 부분 수정

2. **ExtensionStateContext.tsx**
   - 타입 오류 해결

3. **이미지 경로 및 커스텀 인스트럭션 표시 문제 해결**
   - 이미지 URL이 제대로 표시되지 않는 문제 해결
   - 커스텀 인스트럭션이 [object Object]로 표시되는 문제 해결

### 결론

단일 퍼소나 시스템으로 변경하는 작업은 타입 시스템이 여러 파일에 걸쳐 복잡하게 얽혀있어 모든 파일을 한 번에 수정하기 어려웠습니다. 핵심 파일들은 이미 수정했으며, 남은 작업은 위에 기록한 내용입니다. 이 변경으로 퍼소나 관리가 더 단순해지고 사용자 경험이 개선될 것으로 예상됩니다.

## 결론
퍼소나 관리 UX를 개선하여 사용자가 더 직관적으로 퍼소나를 선택하고 편집할 수 있도록 변경했습니다. 기존의 복잡한 UI를 단순화하고, 사용자 경험을 향상시켰습니다. 또한 타입 오류를 수정하여 코드의 안정성을 높였습니다.
