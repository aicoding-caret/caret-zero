import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ILogger } from '../../services/logging/ILogger';

/**
 * 템플릿 캐릭터 인터페이스
 */
export interface TemplateCharacter {
  id: string;
  name: string;
  description: string;
  avatarUri: string;
  thinkingAvatarUri?: string;
  introIllustrationUri?: string;
  customInstructions?: string;
}

/**
 * 템플릿 캐릭터 관리자 클래스
 */
export class TemplateCharacterManager {
  private readonly logger: ILogger;
  private readonly extensionContext: vscode.ExtensionContext;

  /**
   * 템플릿 캐릭터 관리자를 생성합니다.
   * @param context VS Code 확장 컨텍스트
   * @param logger 로거 인스턴스
   */
  constructor(context: vscode.ExtensionContext, logger: ILogger) {
    this.extensionContext = context;
    this.logger = logger;
  }

  /**
   * 템플릿 캐릭터 데이터를 로드합니다.
   * @returns 템플릿 캐릭터 배열 또는 오류 발생 시 빈 배열
   */
  public loadTemplateCharacters(): TemplateCharacter[] {
    this.logger.log("[TemplateCharacterManager] 템플릿 캐릭터 로드 시작");
    try {
      const jsonFilePath = vscode.Uri.joinPath(this.extensionContext.extensionUri, "assets", "template_characters", "template_characters.json");
      
      // 파일 존재 확인
      if (!fs.existsSync(jsonFilePath.fsPath)) {
        this.logger.error("[TemplateCharacterManager] template_characters.json 파일이 존재하지 않음:", jsonFilePath.fsPath);
        return [];
      }
      
      // JSON 파일 읽기
      const jsonStr = fs.readFileSync(jsonFilePath.fsPath, "utf-8");
      this.logger.log("[TemplateCharacterManager] template_characters.json 파일 읽기 성공");
      
      // JSON 파싱
      const templateCharacters = JSON.parse(jsonStr);
      this.logger.log("[TemplateCharacterManager] 템플릿 캐릭터 데이터 파싱 성공", { count: templateCharacters.length });
      
      return templateCharacters;
    } catch (err) {
      this.logger.error("[TemplateCharacterManager] 템플릿 캐릭터 로드 실패:", err);
      return [];
    }
  }

  /**
   * 이미지 경로를 웹뷰에서 사용 가능한 URI로 변환합니다.
   * @param webview 웹뷰 인스턴스
   * @param relativePath 상대 경로
   * @returns 웹뷰에서 사용 가능한 URI 문자열
   */
  public getWebviewUri(webview: vscode.Webview, relativePath: string): string {
    if (!relativePath) return "";
    
    // asset:/ 경로 처리
    const cleanPath = relativePath.replace(/^asset:\//, "");
    const resourceUri = vscode.Uri.joinPath(this.extensionContext.extensionUri, cleanPath);
    
    // 웹뷰에서 사용 가능한 URI로 변환
    return webview.asWebviewUri(resourceUri).toString();
  }

  /**
   * 템플릿 캐릭터 데이터를 웹뷰에서 사용할 수 있도록 준비합니다.
   * 이미지 경로를 웹뷰에서 접근 가능한 URI로 변환합니다.
   * @param webview 웹뷰 인스턴스
   * @param characters 템플릿 캐릭터 배열
   * @returns 웹뷰용으로 준비된 템플릿 캐릭터 배열
   */
  public prepareTemplateCharactersForWebview(webview: vscode.Webview, characters: TemplateCharacter[]): TemplateCharacter[] {
    this.logger.log("[TemplateCharacterManager] 템플릿 캐릭터 웹뷰용 준비 시작");
    
    // 각 캐릭터의 이미지 경로 변환
    const preparedCharacters = characters.map(character => ({
      ...character,
      avatarUri: this.getWebviewUri(webview, character.avatarUri),
      thinkingAvatarUri: character.thinkingAvatarUri ? this.getWebviewUri(webview, character.thinkingAvatarUri) : undefined,
      introIllustrationUri: character.introIllustrationUri ? this.getWebviewUri(webview, character.introIllustrationUri) : undefined
    }));
    
    this.logger.log("[TemplateCharacterManager] 템플릿 캐릭터 웹뷰용 준비 완료", { count: preparedCharacters.length });
    return preparedCharacters;
  }
}
