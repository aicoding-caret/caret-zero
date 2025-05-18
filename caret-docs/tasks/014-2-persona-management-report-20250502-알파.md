# 퍼소나 템플릿 로딩 문제 해결 보고서

**작성자**: 알파
**날짜**: 2025-05-02
**작업**: 퍼소나 템플릿 캐릭터 로딩 문제 해결

## 문제 상황

템플릿 캐릭터 선택 모달에서 캐릭터 이름이 "이름 없음"으로 표시되는 문제가 발생했습니다. 이는 백엔드와 프론트엔드 간의 데이터 구조 불일치로 인한 것으로 확인되었습니다.

## 원인 분석

1. **백엔드 인터페이스 (templateCharacters.ts)**:
   ```typescript
   interface TemplateCharacter {
     id: string;
     name: string;
     description: string;
     avatarUri: string;
     // ...
   }
   ```

2. **프론트엔드 인터페이스 (TemplateCharacterSelectModal.tsx)**:
   ```typescript
   interface TemplateCharacter {
     character: string; // id 대신 character 필드 사용
     [lang: string]: TemplateCharacterLocale | string | boolean | undefined;
     avatarUri: string;
     // ...
   }
   ```

3. **PersonaSettingsView.tsx**에서는 프론트엔드 인터페이스를 사용하여 데이터를 처리하고 있으나, 백엔드에서 변환된 데이터는 다른 구조를 가지고 있습니다.

## 해결 방안

다음 두 가지 접근 방식 중 하나를 선택할 수 있습니다:

1. **백엔드 데이터 구조 유지, 프론트엔드에서 변환**:
   - 백엔드에서는 현재의 `id`, `name`, `description` 구조를 유지
   - 프론트엔드에서 데이터를 받을 때 필요한 변환 로직 추가

2. **백엔드에서 프론트엔드 구조에 맞게 변환**:
   - 백엔드의 `prepareTemplateCharactersForWebview` 함수에서 프론트엔드 구조에 맞게 데이터 변환
   - `id`를 `character`로 변환하고, `name`과 `description`을 언어별 객체로 구성

## 선택한 접근 방식

두 번째 접근 방식을 선택하여 백엔드에서 프론트엔드 구조에 맞게 데이터를 변환하도록 하겠습니다. 이는 다음과 같은 이유로 더 적합합니다:

1. 프론트엔드 코드 변경을 최소화할 수 있습니다.
2. 기존 UI 컴포넌트의 동작 방식을 유지할 수 있습니다.
3. 데이터 변환 로직을 한 곳(백엔드)에 집중시켜 유지보수가 용이합니다.

## 구현 계획

1. `templateCharacters.ts`의 `prepareTemplateCharactersForWebview` 함수 수정
   - 프론트엔드 구조에 맞게 데이터 변환 로직 추가
   - `id`를 `character`로 변환
   - `name`과 `description`을 언어별 객체로 구성

2. 로깅 추가
   - 변환 전/후 데이터 구조 로깅
   - 디버깅에 도움이 되는 상세 정보 추가

## 작업 진행 상황

현재 문제 분석 완료 및 해결 방안 수립 단계입니다. 다음 단계로 코드 수정을 진행할 예정입니다.
