# Caret 로깅 시스템 가이드

## 백엔드(Extension) 로깅

백엔드에서는 `ILogger` 인터페이스를 구현한 로거를 사용합니다. 이 로거는 `src/services/logging/ILogger.ts`에 정의되어 있습니다.

```typescript
export interface ILogger {
  log(message: string, data?: unknown): void;
  error(message: string | Error, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  debug(message: string | (() => string), data?: unknown | (() => unknown)): void;
}
```

### 사용 방법

```typescript
// 클래스 내에서 로거 사용
class MyClass {
  private logger: ILogger;
  
  constructor(logger: ILogger) {
    this.logger = logger;
  }
  
  public doSomething(): void {
    this.logger.log("작업 시작");
    try {
      // 작업 수행
      this.logger.log("작업 완료");
    } catch (err) {
      this.logger.error("작업 실패", err);
    }
  }
}
```

## 프론트엔드(Webview) 로깅

프론트엔드에서는 `WebviewLogger` 클래스를 사용합니다. 이 로거는 `webview-ui/src/utils/logger.ts`에 정의되어 있습니다.

```typescript
export class WebviewLogger implements IWebviewLogger {
  constructor(componentName: string) {
    // 컴포넌트 이름을 접두사로 사용
  }
  
  log(message: string, data?: unknown): void;
  error(message: string | Error, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  debug(message: string, data?: unknown): void;
}
```

### 사용 방법

```typescript
// React 컴포넌트에서 로거 사용
import { WebviewLogger } from '../utils/logger';

const MyComponent: React.FC = () => {
  const logger = new WebviewLogger('MyComponent');
  
  useEffect(() => {
    logger.log('컴포넌트 마운트');
    
    return () => {
      logger.log('컴포넌트 언마운트');
    };
  }, []);
  
  const handleClick = () => {
    try {
      // 작업 수행
      logger.log('작업 완료');
    } catch (err) {
      logger.error('작업 실패', err);
    }
  };
  
  return <button onClick={handleClick}>클릭</button>;
};
```

## 로깅 원칙

1. **적절한 로그 레벨 사용**:
   - `log`: 일반 정보 메시지
   - `error`: 오류 메시지
   - `warn`: 경고 메시지
   - `debug`: 디버깅용 메시지(개발 환경에서만 출력)

2. **컨텍스트 포함**:
   - 로그 메시지에 충분한 컨텍스트 정보를 포함하세요.
   - 예: `"[PersonaSettings] template_characters.json 파일 읽기 성공"`

3. **구조화된 데이터**:
   - 복잡한 객체는 두 번째 매개변수로 전달하여 구조화된 형태로 로깅하세요.

4. **민감 정보 제외**:
   - API 키, 비밀번호 등 민감한 정보는 로그에 포함하지 마세요.

## 웹뷰 URI 변환

웹뷰에서 확장 리소스에 접근할 때는 다음과 같이 URI를 변환해야 합니다:

```typescript
// 백엔드에서
const resourceUri = vscode.Uri.joinPath(context.extensionUri, 'assets/image.png');
const webviewUri = webview.asWebviewUri(resourceUri).toString();

// 프론트엔드에서 사용
<img src={webviewUri} alt="이미지" />
