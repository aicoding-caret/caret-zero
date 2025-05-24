/**
 * 프론트엔드용 로거 인터페이스
 */
export interface IWebviewLogger {
  /**
   * 정보 메시지를 로깅합니다.
   * @param message 로깅할 메시지
   * @param data 추가 데이터 (선택사항)
   */
  log(message: string, data?: unknown): void;

  /**
   * 에러 메시지를 로깅합니다.
   * @param message 에러 메시지 또는 Error 객체
   * @param data 추가 데이터 (선택사항)
   */
  error(message: string | Error, data?: unknown): void;

  /**
   * 경고 메시지를 로깅합니다.
   * @param message 경고 메시지
   * @param data 추가 데이터 (선택사항)
   */
  warn(message: string, data?: unknown): void;

  /**
   * 디버그 메시지를 로깅합니다. 개발 모드에서만 로깅됩니다.
   * @param message 디버그 메시지
   * @param data 추가 데이터 (선택사항)
   */
  debug(message: string, data?: unknown): void;
}

/**
 * 콘솔 기반 웹뷰 로거 구현체
 */
export class WebviewLogger implements IWebviewLogger {
  private readonly prefix: string;
  private readonly isDev: boolean;

  /**
   * 웹뷰 로거를 생성합니다.
   * @param componentName 로그 접두사로 사용할 컴포넌트 이름
   */
  constructor(componentName: string) {
    this.prefix = `[${componentName}]`;
    // 개발 모드 여부 확인 (process.env.NODE_ENV가 없으면 개발 모드로 간주)
    this.isDev = process.env.NODE_ENV !== 'production';
  }

  /**
   * 정보 메시지를 로깅합니다.
   */
  log(message: string, data?: unknown): void {
    if (data) {
      console.log(`${this.prefix} ${message}`, data);
    } else {
      console.log(`${this.prefix} ${message}`);
    }
  }

  /**
   * 에러 메시지를 로깅합니다.
   */
  error(message: string | Error, data?: unknown): void {
    const errorMessage = message instanceof Error ? message.message : message;
    if (data) {
      console.error(`${this.prefix} ${errorMessage}`, data);
    } else {
      console.error(`${this.prefix} ${errorMessage}`);
    }
  }

  /**
   * 경고 메시지를 로깅합니다.
   */
  warn(message: string, data?: unknown): void {
    if (data) {
      console.warn(`${this.prefix} ${message}`, data);
    } else {
      console.warn(`${this.prefix} ${message}`);
    }
  }

  /**
   * 디버그 메시지를 로깅합니다. 개발 모드에서만 로깅됩니다.
   */
  debug(message: string, data?: unknown): void {
    if (!this.isDev) {return;}
    
    if (data) {
      console.debug(`${this.prefix} ${message}`, data);
    } else {
      console.debug(`${this.prefix} ${message}`);
    }
  }
}
