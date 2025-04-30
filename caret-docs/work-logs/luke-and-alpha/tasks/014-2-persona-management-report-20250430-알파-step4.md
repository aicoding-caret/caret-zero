# 014-2 Persona Management - Step4 (퍼소나 선택 UI/상태 미구현 현황 및 후속 계획)

- 일시: 2025-04-30
- 작업자: 알파

## 1. 현황 및 문제점
- 설계 문서(`014-2-persona-management-design.md`)에는 "퍼소나 선택/관리 UI(드롭다운 등)" 및 ExtensionState/스토리지/동기화 연동이 명확히 명시되어 있음.
- 실제 코드(2025-04-30 기준)에는 "퍼소나 선택 리스트(드롭다운/선택 UI)" 및 관련 상태 연동/동기화 로직이 구현되어 있지 않음.
- 즉, 사용자가 퍼소나를 선택하거나 관리할 수 있는 UI/기능이 미구현 상태임.

## 2. 후속 실무 제안
- SettingsView(또는 해당 설정 화면)에 퍼소나 선택 드롭다운 및 관리 UI를 신규 구현해야 함.
- 선택 시 ExtensionState, personas.json 연동 및 동기화 로직 추가 필요.
- 선택된 퍼소나에 따라 AI 응답/아바타 등 동작 연동 필요.

## 3. 다음 단계
- webview-ui/src/App.tsx 및 SettingsView 등 UI 컴포넌트 구조 확인
- 퍼소나 선택 드롭다운/리스트 UI 및 상태 연동 로직 신규 구현 계획 수립
- 구현 시 실무 가이드(백업, 단계별 보고서 작성 등) 준수

---

## 4. 퍼소나 선택 드롭다운/상태 연동 설계안 (2025-04-30)

### (1) UI 구조 및 위치
- SettingsView.tsx에서 PersonaSettingsView를 이미 포함하고 있음.
- PersonaSettingsView 내에서 퍼소나 목록을 리스트 형태로 보여주고 있으나, "선택" UI(드롭다운 또는 라디오/버튼 등)는 없음.
- 설계상, 각 퍼소나 항목에 "선택" 버튼 또는 라디오버튼을 추가해 사용자가 활성 퍼소나를 명확히 선택할 수 있도록 개선 필요.

### (2) 상태 연동
- 선택된 퍼소나는 selectedPersonaId로 관리됨 (useExtensionState에서 제공).
- 선택 시 ExtensionState 및 personas.json과 동기화 필요.
- 선택 이벤트 발생 시 vscode.postMessage({ type: "selectPersona", personaId }) 구조로 확장 예정.

### (3) 구현 방안
- PersonaSettingsView의 각 PersonaItem에 "선택" 버튼 또는 라디오버튼 추가:
  - 현재 선택된 퍼소나는 시각적으로 강조(예: 체크, 테두리, 색상 등)
  - 선택 시 selectedPersonaId를 변경하고, 상태/스토리지 동기화
- 선택 로직은 useExtensionState context와 연동
- UI/UX: 한 번에 하나의 퍼소나만 선택 가능, 기본/커스텀 구분 없이 모두 동일하게 취급

### (4) 후속 구현 계획
1. PersonaSettingsView에 선택 UI/로직 추가
2. ExtensionState 및 personas.json 동기화 구조 구현/점검
3. 선택 결과가 AI 응답/아바타 등에 즉시 반영되는지 테스트
4. 모든 변경점 및 테스트 결과를 보고서에 즉시 기록

---

(이후 각 단계별로 보고서에 즉시 기록 예정)
