# 웹뷰-확장 통신 가이드

이 문서는 VSCode 확장의 백엔드(Extension)와 프론트엔드(Webview) 간의 통신 방법에 대해 설명합니다. Caret에서는 이 통신을 통해 UI 이벤트, 데이터 요청, 상태 업데이트 등이 이루어집니다.

## 통신 아키텍처 개요

```
+------------------+      메시지      +------------------+
|                  |  ------------>  |                  |
|    Extension     |                 |     Webview      |
|    (백엔드)      |  <------------  |    (프론트엔드)   |
|                  |      메시지      |                  |
+------------------+                 +------------------+
```

## 웹뷰에서 확장으로 메시지 보내기

### vscode.ts 유틸리티 사용

웹뷰에서는 `webview-ui/src/utils/vscode.ts`에 정의된 유틸리티를 사용하여 확장으로 메시지를 보냅니다.

```typescript
// webview-ui/src/utils/vscode.ts 파일 구조
export const vscode = acquireVsCodeApi();

// 사용 예시
import { vscode } from '../utils/vscode';

// 메시지 전송
vscode.postMessage({ type: "requestTemplateCharacters" });
```

### 메시지 전송 예시

```typescript
// React 컴포넌트에서 메시지 전송
import { vscode } from '../utils/vscode';
import { WebviewLogger } from '../utils/logger';

const MyComponent: React.FC = () => {
  const logger = new WebviewLogger('MyComponent');
  
  useEffect(() => {
    try {
      // 확장으로 메시지 전송
      vscode.postMessage({ type: "requestData", payload: { id: 123 } });
      logger.log('메시지 전송 완료');
    } catch (err) {
      logger.error('메시지 전송 실패', err);
    }
  }, []);
  
  return <div>컴포넌트 내용</div>;
};
```

## 확장에서 웹뷰로 메시지 보내기

### Controller 클래스 사용

확장에서는 `Controller` 클래스의 `postMessageToWebview` 메서드를 사용하여 웹뷰로 메시지를 보냅니다.

```typescript
// src/core/controller/index.ts
async postMessageToWebview(message: ExtensionMessage) {
  // 웹뷰로 메시지 전송
  const view = WebviewProvider.getSidebarInstance()?.view;
  if (view?.webview) {
    view.webview.postMessage(message);
  }
}
```

### 메시지 전송 예시

```typescript
// 확장에서 웹뷰로 메시지 전송
await this.postMessageToWebview({
  type: "dataLoaded",
  text: JSON.stringify(data)
} as ExtensionMessage);
```

## 메시지 처리

### 웹뷰에서 메시지 수신

웹뷰에서는 `window.addEventListener('message', ...)` 또는 React 컨텍스트를 통해 메시지를 수신합니다.

```typescript
// webview-ui/src/context/ExtensionStateContext.tsx
useEffect(() => {
  const messageHandler = (event: MessageEvent) => {
    const message = event.data as ExtensionMessage;
    switch (message.type) {
      case "dataLoaded":
        // 데이터 처리
        break;
      // 기타 메시지 타입 처리
    }
  };
  
  window.addEventListener('message', messageHandler);
  return () => window.removeEventListener('message', messageHandler);
}, []);
```

### 확장에서 메시지 수신

확장에서는 `Controller` 클래스의 `handleWebviewMessage` 메서드에서 메시지를 처리합니다.

```typescript
// src/core/controller/index.ts
async handleWebviewMessage(message: WebviewMessage) {
  switch (message.type) {
    case "requestData":
      // 데이터 요청 처리
      break;
    // 기타 메시지 타입 처리
  }
}
```

## 메시지 타입 정의

메시지 타입은 `shared` 디렉토리에 정의되어 확장과 웹뷰 모두에서 참조할 수 있습니다.

```typescript
// src/shared/ExtensionMessage.ts (확장 -> 웹뷰)
export interface ExtensionMessage {
  type: string;
  text?: string;
  error?: string;
  // 기타 필요한 필드
}

// src/shared/WebviewMessage.ts (웹뷰 -> 확장)
export interface WebviewMessage {
  type: string;
  payload?: any;
  // 기타 필요한 필드
}
```

## 개발 시 주의사항

1. **타입 안전성**: 메시지 타입을 인터페이스로 정의하여 타입 안전성을 확보하세요.
2. **오류 처리**: 메시지 전송 및 수신 시 오류 처리를 추가하세요.
3. **로깅**: 메시지 전송 및 수신 시 로깅을 추가하여 디버깅을 용이하게 하세요.
4. **비동기 처리**: 확장에서 웹뷰로 메시지를 보낼 때는 웹뷰가 준비되었는지 확인하세요.

## 개발 시나리오별 참고 사항

### 새로운 UI 기능 개발 시

1. 웹뷰에서 필요한 데이터를 요청하는 메시지 타입 정의
2. 확장에서 해당 메시지를 처리하는 핸들러 구현
3. 확장에서 데이터를 웹뷰로 전송하는 메시지 구현
4. 웹뷰에서 받은 데이터를 처리하는 로직 구현

### 기존 기능 수정 시

1. 기존 메시지 타입 및 핸들러 파악
2. 필요한 경우 메시지 타입 확장 또는 수정
3. 웹뷰와 확장 모두에서 관련 핸들러 업데이트

## 예제: 템플릿 캐릭터 로딩

### 웹뷰에서 요청 보내기

```typescript
// PersonaSettingsView.tsx
useEffect(() => {
  console.log('[PersonaSettingsView] mount, template 캐릭터 로딩 요청');
  try {
    vscode.postMessage({ type: "requestTemplateCharacters" });
    console.log('[PersonaSettingsView] requestTemplateCharacters 메시지 전송');
  } catch (err) {
    console.error("[PersonaSettingsView] vscode.postMessage 호출 중 오류:", err);
  }
}, []);
```

### 확장에서 요청 처리 및 응답

```typescript
// src/core/controller/index.ts
case "requestTemplateCharacters": {
  this.logger.log("[PersonaSettings] template 캐릭터 로딩 요청 수신")
  try {
    // 템플릿 캐릭터 관리자 생성
    const templateManager = new TemplateCharacterManager(this.context, this.logger);
    
    // 템플릿 캐릭터 데이터 로드
    const templateCharacters = templateManager.loadTemplateCharacters();
    
    // 웹뷰 찾기
    const view = WebviewProvider.getSidebarInstance()?.view;
    if (view?.webview) {
      // 이미지 경로 변환
      const preparedCharacters = templateManager.prepareTemplateCharactersForWebview(
        view.webview,
        templateCharacters
      );
      
      // 변환된 데이터 전송
      await this.postMessageToWebview({
        type: "templateCharactersLoaded",
        text: JSON.stringify(preparedCharacters)
      } as ExtensionMessage);
    }
  } catch (err) {
    this.logger.error("[PersonaSettings] 템플릿 캐릭터 로드 실패:", err);
    await this.postMessageToWebview({
      type: "templateCharactersLoaded",
      text: "[]",
      error: String(err)
    } as ExtensionMessage);
  }
  break;
}
```
