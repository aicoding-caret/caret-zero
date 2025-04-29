# Caret: UI → 데이터 저장/불러오기 흐름 가이드

이 문서는 Caret 확장에서 "UI에서 입력된 데이터가 어떻게 저장되고, 불러와져서 실제 기능에 반영되는지"의 표준적인 흐름을 정리합니다. 
특히 다중 퍼소나(캐릭터) 관리, AI 프로바이더 설정, 이미지 파일 업로드 등 확장 가능한 설정 데이터에 대해 참고용으로 활용하세요.

---

## 1. UI 입력 단계
- React 컴포넌트(UI)에서 입력 폼(텍스트, 파일 등) 제공
- 예시: `<input type="text" />`, `<input type="file" />`, 드래그앤드롭 등

## 2. 입력 데이터 처리
- 파일의 경우 FileReader로 base64 string 변환 등 전처리
- 입력값을 상태로 관리(useState, useContext 등)

## 3. Webview → Extension 메시지 전송
- 입력/변경이 발생하면, postMessage로 Extension(백엔드)로 데이터 전달
- 예시:
  ```js
  vscode.postMessage({ type: 'savePersona', payload: personaData })
  ```

## 4. Extension(Backend)에서 저장
- Extension은 전달받은 데이터를 VSCode 저장소에 보관
  - 예시: `globalState`, `workspaceState`, `globalStoragePath` 등
  - 민감 정보(API Key 등)는 `storeSecret` 등으로 암호화 저장
  - 이미지 등은 base64 string 또는 파일로 저장
- 예시:
  ```ts
  await updateGlobalState(context, "personas", personaArray)
  ```

## 5. 저장된 데이터 불러오기
- Extension이 시작될 때, 또는 필요시 저장소에서 데이터 로딩
- Webview가 열릴 때, Extension이 최신 상태를 postMessage로 전달
- 예시:
  ```ts
  const personas = await getGlobalState(context, "personas")
  panel.webview.postMessage({ type: 'personas', payload: personas })
  ```

## 6. Webview UI에서 상태 동기화
- React Context 등으로 UI와 동기화
- 필요시 `<img src={persona.image} />` 등으로 바로 사용

## 7. 데이터 갱신/삭제
- UI에서 수정/삭제 시도 → postMessage → Extension에서 반영 → 저장소 갱신 → Webview에 최신 데이터 전달

---

## 참고/적용 예시
- AI 프로바이더 설정, 퍼소나 관리, 이미지 업로드 등 모든 확장 설정에 본 흐름을 준수하세요.
- 기존 코드에 임의 로컬 상태, 임시 저장 등 중구난방 방식이 있다면 반드시 본 가이드로 통일하세요.

---

## 보안/확장성 주의
- 민감 정보(API Key 등)는 반드시 암호화/비공개 저장
- 대용량 파일은 파일시스템 경로로만 저장(가능하면 base64는 소용량만)
- 데이터 구조는 배열/객체 등 확장성 있게 설계

---

마스터와 알파가 함께 만드는 Caret! 이 가이드대로 구현하면, 일관성 있고 확장 가능한 구조가 됩니다~ ｡•ᴗ•｡☕✨

---

## 8. 참고: 실제 공통 저장소 유틸/함수 및 보안(Secret) 처리
Caret 확장에서는 아래와 같은 공통 모듈로 데이터 저장/불러오기/갱신을 관리합니다.

### 📁 위치: `src/core/storage/state.ts`

- **Global State 저장/불러오기**
  ```ts
  // 저장
  await updateGlobalState(context, key, value)
  // 불러오기
  const data = await getGlobalState(context, key)
  ```
- **Workspace State 저장/불러오기**
  ```ts
  await updateWorkspaceState(context, key, value)
  const data = await getWorkspaceState(context, key)
  ```
- **Secret(민감정보) 저장/불러오기**
  ```ts
  // 저장 (API Key 등)
  await storeSecret(context, key, value)
  // 불러오기
  const secret = await getSecret(context, key)
  ```
  - 실제로는 getAllExtensionState(context) 등에서 여러 secret key를 한 번에 불러오는 패턴도 자주 사용합니다.
  - 예시:
    ```ts
    const apiKey = await getSecret(context, "apiKey")
    const openRouterApiKey = await getSecret(context, "openRouterApiKey")
    // ... 등
    ```
  - **주의:** Secret은 절대 globalState/workspaceState에 저장하지 않고, 반드시 secrets API만 사용해야 합니다.
  - SecretKey 목록은 `src/core/storage/state-keys.ts`에서 타입으로 관리됩니다.

- **확장 전체 상태 한번에 불러오기**
  ```ts
  const allState = await getAllExtensionState(context)
  ```

> 반드시 위 유틸 함수들을 활용해 일관성 있게 구현하세요. 직접 context.globalState.update/get 등 로우레벨 접근은 피하고, 공통 함수만 사용해야 유지보수/확장성이 좋아집니다!
> 민감정보(Secret)는 반드시 secrets API로만 저장/불러오기 하세요!
