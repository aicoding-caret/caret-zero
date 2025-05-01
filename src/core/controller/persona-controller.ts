import * as vscode from 'vscode';
import { AbstractController } from './base-controller';
import { WebviewMessage } from '../../shared/WebviewMessage';
import { ExtensionMessage } from '../../shared/ExtensionMessage';
import { ILogger } from '../../services/logging/ILogger';
import { TemplateCharacterManager } from '../persona/templateCharacters';
import { WebviewProvider } from '../webview';
import { PersonaManager } from '../persona/PersonaManager';
import { getWorkspacePath } from '../../utils/path';
import { Persona } from '../../shared/types';

/**
 * 페르소나 관련 기능을 처리하는 컨트롤러
 */
export class PersonaController extends AbstractController {
  private templateManager: TemplateCharacterManager;

  /**
   * 페르소나 컨트롤러 생성자
   * @param context VS Code 확장 컨텍스트
   * @param logger 로거 인스턴스
   * @param postMessage 웹뷰로 메시지를 전송하는 함수
   */
  constructor(
    context: vscode.ExtensionContext,
    logger: ILogger,
    postMessage: (message: ExtensionMessage) => Promise<void>
  ) {
    super(context, logger, postMessage);
    this.templateManager = new TemplateCharacterManager(context, logger);
  }

  /**
   * 페르소나 관련 메시지인지 확인합니다.
   * @param messageType 메시지 타입
   * @returns 처리 가능 여부
   */
  canHandle(messageType: string): boolean {
    return [
      'requestTemplateCharacters',
      'selectLanguage',
      'addOrUpdatePersona'
    ].includes(messageType);
  }

  /**
   * 페르소나 관련 메시지를 처리합니다.
   * @param message 웹뷰 메시지
   * @returns 메시지가 처리되었는지 여부
   */
  async handleMessage(message: WebviewMessage): Promise<boolean> {
    switch (message.type as string) {
      case 'requestTemplateCharacters':
        await this.handleRequestTemplateCharacters();
        return true;
        
      case 'selectLanguage':
        await this.handleSelectLanguage(message);
        return true;
        
      case 'addOrUpdatePersona':
        await this.handleAddOrUpdatePersona(message);
        return true;
        
      default:
        return false;
    }
  }

  /**
   * 템플릿 캐릭터 요청을 처리합니다.
   */
  private async handleRequestTemplateCharacters(): Promise<void> {
    this.logger.log("[PersonaSettings] 템플릿 캐릭터 로딩 요청 수신 - template_characters.json 로드 시작");
    try {
      // 템플릿 캐릭터 데이터 로드
      const templateCharacters = this.templateManager.loadTemplateCharacters();
      if (templateCharacters.length === 0) {
        this.logger.warn("[PersonaSettings] 로드된 템플릿 캐릭터가 없습니다.");
        await this.postMessage({
          type: "templateCharactersLoaded",
          text: "[]"
        } as ExtensionMessage);
        return;
      }
      
      // 웹뷰 찾기
      const webviewProvider = WebviewProvider.getSidebarInstance();
      if (!webviewProvider || !webviewProvider.view || !webviewProvider.view.webview) {
        this.logger.error("[PersonaSettings] 웹뷰를 찾을 수 없습니다.");
        await this.postMessage({
          type: "templateCharactersLoaded",
          text: "[]",
          error: "웹뷰를 찾을 수 없습니다."
        } as ExtensionMessage);
        return;
      }
      
      // 이미지 경로 변환
      const preparedCharacters = this.templateManager.prepareTemplateCharactersForWebview(
        webviewProvider.view.webview, 
        templateCharacters
      );
      
      // 변환된 데이터 전송
      await this.postMessage({
        type: "templateCharactersLoaded",
        text: JSON.stringify(preparedCharacters)
      } as ExtensionMessage);
      this.logger.log("[PersonaSettings] template_characters.json 데이터 전송 완료");
    } catch (err) {
      this.logger.error("[PersonaSettings] template_characters.json 로드 실패:", err);
      await this.postMessage({
        type: "templateCharactersLoaded",
        text: "[]",
        error: String(err)
      } as ExtensionMessage);
    }
  }

  /**
   * 언어 선택을 처리합니다.
   * @param message 웹뷰 메시지
   */
  private async handleSelectLanguage(message: WebviewMessage): Promise<void> {
    const language = message.text || '';
    this.logger.log("[PersonaSettings] 언어 선택:", language);
    // 구현...
  }

  /**
   * 퍼소나 추가 또는 업데이트를 처리합니다.
   * @param message 웹뷰 메시지
   */
  private async handleAddOrUpdatePersona(message: WebviewMessage): Promise<void> {
    try {
      const persona = message.persona as Persona;
      if (!persona) {
        this.logger.error("[PersonaSettings] 퍼소나 데이터가 없습니다.");
        return;
      }

      this.logger.log("[PersonaSettings] 퍼소나 업데이트:", persona.id);
      
      // 워크스페이스 경로 가져오기
      const workspacePath = getWorkspacePath();
      if (!workspacePath || workspacePath.trim() === "") {
        this.logger.error("[PersonaSettings] 워크스페이스 경로를 찾을 수 없습니다.");
        return;
      }
      
      this.logger.log("[PersonaSettings] 퍼소나 저장 경로:", workspacePath);
      
      // 퍼소나 저장
      PersonaManager.addOrUpdatePersona(workspacePath, persona);
      
      // 상태 업데이트 메시지 전송
      const updateMessage: ExtensionMessage = {
        type: "personaUpdated",
        personaId: persona.id
      };
      await this.postMessage(updateMessage);
      
      this.logger.log("[PersonaSettings] 퍼소나 저장 완료:", persona.id);
    } catch (err) {
      this.logger.error("[PersonaSettings] 퍼소나 저장 실패:", err);
    }
  }
}
