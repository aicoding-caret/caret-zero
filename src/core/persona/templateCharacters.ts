import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ILogger } from '../../services/logging/ILogger';
import { DEFAULT_LANGUAGE_SETTINGS } from '../../shared/Languages';
import { DEFAULT_LANGUAGE, getCurrentLanguage, getLocalizedData } from '../../../src/utils/i18n';

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
      const jsonFilePath = vscode.Uri.joinPath(
        this.extensionContext.extensionUri,
        "assets",
        "template_characters",
        "template_characters.json"
      );
      
      // 파일 존재 여부 확인
      if (!fs.existsSync(jsonFilePath.fsPath)) {
        this.logger.error("[TemplateCharacterManager] template_characters.json 파일을 찾을 수 없습니다:", jsonFilePath.fsPath);
        return [];
      }
      
      // 파일 읽기
      const jsonStr = fs.readFileSync(jsonFilePath.fsPath, "utf-8");
      this.logger.log("[TemplateCharacterManager] JSON 파일 읽기 성공");
      
      // JSON 파싱
      const rawList = JSON.parse(jsonStr);
      this.logger.log(`[TemplateCharacterManager] 템플릿 캐릭터 ${rawList.length}개 파싱 완료`);
  
      // 언어 우선순위 결정 - i18n 모듈에서 가져오기
      const selectedLanguage = getCurrentLanguage();
      
      this.logger.log(`[TemplateCharacterManager] 언어 설정: ${selectedLanguage} (Fallback: ${DEFAULT_LANGUAGE})`);
  
      // 템플릿 캐릭터 매핑
      const templateCharacters: TemplateCharacter[] = rawList.map((raw: any, index: number) => {
        // 해당 언어 데이터 가져오기 (i18n 모듈에서 가져오기)
        const localeData = getLocalizedData(raw, selectedLanguage);
        
        // 캐릭터 ID 확인 (character 필드 사용)
        const id = raw.character ?? `template-character-${index}`;
        
        // 로그
        this.logger.log(`[TemplateCharacterManager] 캐릭터 처리: ${id}, 이름: ${localeData.name || "이름 없음"}`);
        
        return {
          id: id,
          name: localeData.name ?? "",
          description: localeData.description ?? "",
          avatarUri: raw.avatarUri ?? "",
          thinkingAvatarUri: raw.thinkingAvatarUri ?? "",
          introIllustrationUri: raw.introIllustrationUri ?? "",
          customInstructions: localeData.customInstruction
            ? JSON.stringify(localeData.customInstruction)
            : undefined,
        };
      });
  
      this.logger.log(`[TemplateCharacterManager] 템플릿 캐릭터 ${templateCharacters.length}개 로드 완료`);
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
  public prepareTemplateCharactersForWebview(webview: vscode.Webview, characters: TemplateCharacter[]): any[] {
    this.logger.log("[TemplateCharacterManager] 템플릿 캐릭터 웹뷰용 준비 시작");
    
    // 백엔드 TemplateCharacter 구조를 프론트엔드 구조로 변환
    const preparedCharacters = characters.map(character => {
      // 이미지 경로 변환
      const avatarUri = this.getWebviewUri(webview, character.avatarUri);
      const thinkingAvatarUri = character.thinkingAvatarUri ? this.getWebviewUri(webview, character.thinkingAvatarUri) : "";
      const introIllustrationUri = character.introIllustrationUri ? this.getWebviewUri(webview, character.introIllustrationUri) : "";
      
      // 언어 설정
      const selectedLanguage = getCurrentLanguage();
      
      // 프론트엔드 구조로 변환 (id -> character, name/description -> [lang].name/[lang].description)
      const frontendCharacter: any = {
        // id를 character 필드로 변환
        character: character.id,
        
        // 이미지 경로 설정
        avatarUri,
        thinkingAvatarUri,
        introIllustrationUri
      };
      
      // 사용자 언어 설정으로 데이터 설정
      frontendCharacter[selectedLanguage] = {
        name: character.name,
        description: character.description,
        customInstruction: character.customInstructions ? JSON.parse(character.customInstructions) : ""
      };
      
      // 사용자 언어 설정과 다를 경우 기본 언어 설정으로 데이터 설정
      if (selectedLanguage !== DEFAULT_LANGUAGE) {
        frontendCharacter[DEFAULT_LANGUAGE] = {
          name: character.name,
          description: character.description,
          customInstruction: character.customInstructions ? JSON.parse(character.customInstructions) : ""
        };
      }
      
      this.logger.log(`[TemplateCharacterManager] 캐릭터 변환: ${character.id} -> ${frontendCharacter.character}, 이름: ${character.name}`);
      return frontendCharacter;
    });
    
    this.logger.log("[TemplateCharacterManager] 템플릿 캐릭터 웹뷰용 준비 완료", { count: preparedCharacters.length });
    return preparedCharacters;
  }
}
