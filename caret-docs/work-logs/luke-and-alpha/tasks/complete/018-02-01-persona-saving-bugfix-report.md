# 페르소나 저장 기능 버그 수정 보고서

**작성일**: 2025-05-01
**작업자**: 알파
**작업 내용**: 페르소나 저장 기능 버그 수정

## 문제 상황

페르소나 설정에서 페르소나를 편집하고 저장 버튼을 클릭했을 때, 변경사항이 저장되지 않는 문제가 발생했습니다.

## 원인 분석

코드 흐름을 추적한 결과, 두 가지 주요 문제를 발견했습니다:

1. **워크스페이스 경로 처리 문제**: `PersonaController.ts`의 `handleAddOrUpdatePersona` 함수에서 워크스페이스 경로가 빈 문자열(`""`)인 경우를 제대로 처리하지 않고 있었습니다. 빈 문자열은 JavaScript에서 falsy 값이 아니기 때문에 `if (!workspacePath)` 조건문을 통과해버려서, 빈 경로로 저장을 시도하고 있었습니다.

2. **메시지 처리 누락**: 웹뷰에서 `personaUpdated` 메시지를 처리하는 로직이 `ExtensionStateContext.tsx`에 구현되어 있지 않았습니다. 이로 인해 서버에서는 페르소나가 저장되더라도 웹뷰에서는 업데이트된 상태를 반영하지 못하고 있었습니다.

## 수정 내용

### 1. 워크스페이스 경로 처리 개선

`PersonaController.ts`의 `handleAddOrUpdatePersona` 함수에서 빈 문자열 체크를 추가했습니다:

```typescript
// 수정 전
if (!workspacePath) {
  this.logger.error("[PersonaSettings] 워크스페이스 경로를 찾을 수 없습니다.");
  return;
}

// 수정 후
if (!workspacePath || workspacePath.trim() === "") {
  this.logger.error("[PersonaSettings] 워크스페이스 경로를 찾을 수 없습니다.");
  return;
}

// 로그 추가
this.logger.log("[PersonaSettings] 퍼소나 저장 경로:", workspacePath);
```

### 2. personaUpdated 메시지 처리 추가

`ExtensionStateContext.tsx`에 `personaUpdated` 메시지 처리 로직을 추가했습니다:

```typescript
case "personaUpdated": {
  // personaUpdated 메시지 처리 추가
  console.log("[ExtensionStateContext] personaUpdated 메시지 수신:", message.personaId);
  
  // 페르소나 목록 다시 로드 요청
  vscode.postMessage({
    type: "getLatestState"
  });
  break;
}
```

## 전체 데이터 흐름

페르소나 저장 기능의 전체 데이터 흐름은 다음과 같습니다:

1. **웹뷰에서 시작**: `PersonaSettingsView.tsx`의 `handleSave` 함수에서 `addOrUpdatePersona` 메시지를 보냅니다.

2. **메시지 전달**: `WebviewProvider`의 `setWebviewMessageListener`가 메시지를 받아서 `Controller.handleWebviewMessage`로 전달합니다.

3. **컨트롤러 처리**: `PersonaController`의 `canHandle` 메서드가 `addOrUpdatePersona` 메시지를 인식하고, `handleMessage`에서 `handleAddOrUpdatePersona` 함수를 호출합니다.

4. **저장 로직**: `handleAddOrUpdatePersona`에서 워크스페이스 경로를 확인하고 `PersonaManager.addOrUpdatePersona`를 호출합니다.

5. **파일 저장**: `PersonaManager`에서 페르소나 목록을 로드하고, 새 페르소나를 추가하거나 기존 페르소나를 업데이트한 후 `savePersonas` 함수로 파일에 저장합니다.

6. **상태 업데이트**: 저장 후 `personaUpdated` 메시지를 웹뷰로 보냅니다.

7. **웹뷰 업데이트**: `ExtensionStateContext`에서 `personaUpdated` 메시지를 받으면 `getLatestState`를 요청해서 최신 상태를 가져옵니다.

## 추가 개선 사항

향후 개선할 수 있는 사항:

1. `getWorkspacePath()` 함수를 개선하여 빈 문자열 대신 더 명확한 기본 경로를 반환하도록 수정
2. 에러 처리 및 사용자 피드백 개선 (저장 실패 시 알림 등)
3. 페르소나 데이터 검증 로직 강화

## 테스트 결과

수정 후 페르소나 저장 기능이 정상적으로 작동하는 것을 확인했습니다. 페르소나를 편집하고 저장 버튼을 클릭하면 변경사항이 저장되고 UI에 반영됩니다.
