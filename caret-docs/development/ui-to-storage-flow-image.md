# Caret: 이미지 파일 저장/불러오기 가이드

이 문서는 Caret 확장에서 **이미지(아바타, 썸네일 등) 파일**을 저장/불러오는 방법을 집중적으로 정리합니다.

---

## 1. UI → 이미지 입력
- `<input type="file" accept="image/*" />` 또는 드래그앤드롭 등으로 이미지 선택

## 2. Webview(UI)에서 처리
- FileReader 등으로 이미지를 base64 string으로 변환
- 예시:
  ```js
  const reader = new FileReader();
  reader.onload = (e) => {
    setImageBase64(e.target.result);
  };
  reader.readAsDataURL(file);
  ```

## 3. Webview → Extension 메시지 전송
- base64 string 또는 파일 경로를 payload로 전달
- 예시:
  ```js
  vscode.postMessage({ type: 'savePersonaImage', payload: { id, image: imageBase64 } })
  ```

## 4. Extension(Backend)에서 저장
- 작은 이미지는 base64 string 그대로 globalState/workspaceState에 저장하거나,
- 큰 파일(용량이 클 경우)은 `globalStoragePath` 등 파일 시스템에 저장 후 경로만 저장
- 예시:
  ```ts
  // base64 string 저장 (작은 이미지)
  await updateGlobalState(context, "personaImages", { ... })

  // 파일 시스템 저장 (큰 이미지)
  const imagePath = path.join(context.globalStoragePath, `${personaId}.png`)
  await fs.promises.writeFile(imagePath, imageBuffer)
  await updateGlobalState(context, "personaImages", { [personaId]: imagePath })
  ```

## 5. 불러오기
- base64 string은 바로 `<img src={imageBase64} />`로 사용
- 파일 경로는 fs.readFile 등으로 읽어와서 다시 base64로 변환 후 UI에 전달
- 예시:
  ```ts
  // 파일 경로 → base64 변환 후 전달
  const buffer = await fs.promises.readFile(imagePath)
  const base64 = buffer.toString('base64')
  panel.webview.postMessage({ type: 'personaImage', payload: { id, image: `data:image/png;base64,${base64}` } })
  ```

---

> 작은 이미지는 base64, 큰 파일은 파일 시스템 저장 패턴을 권장합니다. 보안/성능/토큰 최적화 모두 고려해 설계하세요!
