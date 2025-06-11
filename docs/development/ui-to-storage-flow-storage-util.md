# Caret: Storage Utility & API 정리

이 문서는 Caret 확장에서 데이터 저장/불러오기/갱신을 위한 **공통 유틸 함수 및 API**만 따로 정리합니다.

---

## 📁 위치: `src/core/storage/state.ts`

### Global State 저장/불러오기
```ts
// 저장
await updateGlobalState(context, key, value)
// 불러오기
const data = await getGlobalState(context, key)
```

### Workspace State 저장/불러오기
```ts
await updateWorkspaceState(context, key, value)
const data = await getWorkspaceState(context, key)
```

### Secret(민감정보) 저장/불러오기
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

### 확장 전체 상태 한번에 불러오기
```ts
const allState = await getAllExtensionState(context)
```

> 반드시 위 유틸 함수만 사용해 구현하세요. 직접 context.globalState.update/get 등 로우레벨 접근은 금지!
> 민감정보(Secret)는 반드시 secrets API로만 저장/불러오기 하세요!
