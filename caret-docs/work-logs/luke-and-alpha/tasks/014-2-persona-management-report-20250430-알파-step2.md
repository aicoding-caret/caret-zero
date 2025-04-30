# 014-2 Persona Management - Step2 (ExtensionState/상태 동기화 설계)

- 일시: 2025-04-30
- 작업자: 알파

## 1. 백업 대상 파일
- src/shared/types.ts → backup/20250430-types-step2.ts
- src/core/storage/state.ts → backup/20250430-state-step2.ts
- src/extension.ts → backup/20250430-extension-step2.ts

## 2. 작업 의도/계획
- ExtensionState에 personaList, selectedPersonaId, selectedLanguage, supportedLanguages 등 상태 필드 추가
- 퍼소나 목록/선택/언어 상태를 PersonaManager 및 파일(personas.json)과 동기화하는 구조 설계
- 초기 로드시 personas.json에서 목록을 읽어 ExtensionState에 반영, 변경시 저장/동기화 구현
- 이후 Webview 연동 및 UI 상태 반영 예정

## 3. 변경점/문제/의문
- 기존 ExtensionState 구조와의 호환성 고려 필요
- 상태 저장/로드/초기화/복원 등 동작 시나리오 설계 필요
- 추후 Webview, UI 연동 시 추가 설계/변경 가능성 있음

---

다음 단계: ExtensionState 타입/상태 구조 확장 및 동기화 코드 추가 예정입니다.
