import * as vscode from 'vscode';
import { WebviewMessage } from '../../shared/WebviewMessage';
import { ExtensionMessage } from '../../shared/ExtensionMessage';
import { ILogger } from '../../services/logging/ILogger';

/**
 * 모든 서브 컨트롤러가 구현해야 하는 기본 인터페이스
 */
export interface BaseController {
  /**
   * 컨트롤러가 특정 메시지 타입을 처리할 수 있는지 확인합니다.
   * @param messageType 메시지 타입
   * @returns 처리 가능 여부
   */
  canHandle(messageType: string): boolean;
  
  /**
   * 웹뷰에서 받은 메시지를 처리합니다.
   * @param message 웹뷰 메시지
   * @returns 메시지가 처리되었는지 여부
   */
  handleMessage(message: WebviewMessage): Promise<boolean>;
}

/**
 * 서브 컨트롤러 구현을 위한 추상 클래스
 */
export abstract class AbstractController implements BaseController {
  /**
   * 추상 컨트롤러 생성자
   * @param context VS Code 확장 컨텍스트
   * @param logger 로거 인스턴스
   * @param postMessage 웹뷰로 메시지를 전송하는 함수
   */
  constructor(
    protected context: vscode.ExtensionContext,
    protected logger: ILogger,
    protected postMessage: (message: ExtensionMessage) => Promise<void>
  ) {}

  /**
   * 컨트롤러가 특정 메시지 타입을 처리할 수 있는지 확인합니다.
   * @param messageType 메시지 타입
   */
  abstract canHandle(messageType: string): boolean;
  
  /**
   * 웹뷰에서 받은 메시지를 처리합니다.
   * @param message 웹뷰 메시지
   */
  abstract handleMessage(message: WebviewMessage): Promise<boolean>;
}
