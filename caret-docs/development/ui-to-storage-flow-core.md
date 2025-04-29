# Caret: UI ↔ Storage Core Flow

이 문서는 Caret 확장에서 UI 입력 → 데이터 저장/불러오기까지의 **표준적인 핵심 흐름**만 간결하게 정리합니다.

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

---

마스터와 알파가 함께 만드는 Caret! 핵심 흐름만 보고 빠르게 구현할 때 참고해요~ ｡•ᴗ•｡☕✨
