import * as vscode from 'vscode';

/**
 * 템플릿 캐릭터 인터페이스 (간소화)
 */
export interface TemplateCharacter {
  id: string;
  name: string;
  description: string;
  avatarUri: string;
  thinkingAvatarUri?: string;
  customInstructions?: string;
}

/**
 * 템플릿 캐릭터 관리자 클래스 (간소화)
 */
export class TemplateCharacterManager {
  private readonly extensionContext: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.extensionContext = context;
  }

  /**
   * 템플릿 캐릭터 데이터를 로드합니다. (임시 더미 데이터)
   */
  public loadTemplateCharacters(): TemplateCharacter[] {
    console.log("[TemplateCharacterManager] 템플릿 캐릭터 로드 시작");
    
    // 임시 더미 데이터 (파일 로딩은 나중에 구현)
    const dummyCharacters: TemplateCharacter[] = [
      {
        id: "alpha",
        name: "알파",
        description: "친근하고 도움이 되는 AI 어시스턴트",
        avatarUri: "asset:/template_characters/alpha/avatar.png",
        thinkingAvatarUri: "asset:/template_characters/alpha/thinking.png",
        customInstructions: "친근하고 도움이 되는 AI 어시스턴트입니다."
      },
      {
        id: "beta",
        name: "베타",
        description: "전문적이고 정확한 AI 어시스턴트",
        avatarUri: "asset:/template_characters/beta/avatar.png",
        customInstructions: "전문적이고 정확한 정보를 제공합니다."
      }
    ];

    console.log(`[TemplateCharacterManager] 템플릿 캐릭터 ${dummyCharacters.length}개 로드 완료`);
    return dummyCharacters;
  }

  /**
   * 이미지 경로를 웹뷰에서 사용 가능한 URI로 변환합니다.
   */
  public getWebviewUri(webview: vscode.Webview, relativePath: string): string {
    if (!relativePath) return "";
    
    const cleanPath = relativePath.replace(/^asset:\//, "");
    const resourceUri = vscode.Uri.joinPath(this.extensionContext.extensionUri, cleanPath);
    return webview.asWebviewUri(resourceUri).toString();
  }

  /**
   * 템플릿 캐릭터 데이터를 웹뷰에서 사용할 수 있도록 준비합니다.
   */
  public prepareTemplateCharactersForWebview(webview: vscode.Webview, characters: TemplateCharacter[]): any[] {
    console.log("[TemplateCharacterManager] 템플릿 캐릭터 웹뷰용 준비 시작");
    
    const preparedCharacters = characters.map(character => ({
      character: character.id,
      avatarUri: this.getWebviewUri(webview, character.avatarUri),
      thinkingAvatarUri: character.thinkingAvatarUri ? this.getWebviewUri(webview, character.thinkingAvatarUri) : "",
      ko: {
        name: character.name,
        description: character.description,
        customInstruction: character.customInstructions || ""
      },
      en: {
        name: character.name,
        description: character.description,
        customInstruction: character.customInstructions || ""
      }
    }));
    
    console.log(`[TemplateCharacterManager] 템플릿 캐릭터 웹뷰용 준비 완료: ${preparedCharacters.length}개`);
    return preparedCharacters;
  }
}
