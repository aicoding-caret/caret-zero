# 014-2 Persona Management - Step3 (상태 타입/스토리지 확장)

- 일시: 2025-04-30
- 작업자: 알파

## 1. 주요 변경 파일
- src/shared/ExtensionMessage.ts
- src/core/storage/state.ts
- src/core/storage/state-keys.ts

## 2. 작업 의도/계획
- ExtensionState 타입에 personaList, selectedPersonaId, selectedLanguage, supportedLanguages 필드 추가
- getAllExtensionState, resetExtensionState에서 persona 관련 상태를 읽고 초기화하는 코드 반영
- GlobalStateKey에 persona 관련 키를 추가하여 타입 에러 해결

## 3. 변경점/문제/의문
- ExtensionState 및 상태 관리 함수에서 persona 관리가 가능해짐
- 타입 불일치 에러(GlobalStateKey 미정의) 발생 → state-keys.ts에 키 추가로 해결
- 기타 기존 상태 관리와의 충돌 없음 확인

---

다음 단계: extension.ts 진입점에서 persona 상태 동기화/초기화/저장 로직 구현 예정입니다.
