import * as vscode from "vscode";
import { CaretController } from "./base-controller";
import { PersonaManager } from "../persona/PersonaManager";
import { TemplateCharacterManager } from "../persona/templateCharacters";
/**
 * 페르소나 관련 기능을 처리하는 컨트롤러
 */
export class PersonaController extends CaretController {
    templateManager;
    /**
     * 페르소나 컨트롤러 생성자
     * @param context VS Code 확장 컨텍스트
     * @param postMessage 웹뷰로 메시지를 전송하는 함수
     */
    constructor(context, postMessage) {
        super(context, postMessage);
        this.templateManager = new TemplateCharacterManager(context);
    }
    /**
     * 페르소나 관련 메시지인지 확인합니다.
     * @param messageType 메시지 타입
     * @returns 처리 가능 여부
     */
    canHandle(messageType) {
        return ["addOrUpdatePersona", "loadPersona", "deletePersona", "requestTemplateCharacters"].includes(messageType);
    }
    /**
     * 페르소나 관련 메시지를 처리합니다.
     * @param message 웹뷰 메시지
     * @returns 메시지가 처리되었는지 여부
     */
    async handleMessage(message) {
        switch (message.type) {
            case "addOrUpdatePersona":
                await this.handleAddOrUpdatePersona(message);
                return true;
            case "loadPersona":
                await this.handleLoadPersona();
                return true;
            case "deletePersona":
                await this.handleDeletePersona(message);
                return true;
            case "requestTemplateCharacters":
                await this.handleRequestTemplateCharacters();
                return true;
            default:
                return false;
        }
    }
    /**
     * 퍼소나 로드를 처리합니다.
     */
    async handleLoadPersona() {
        this.log("퍼소나 로드 요청");
        try {
            const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspacePath) {
                this.error("워크스페이스 경로를 찾을 수 없습니다.");
                return;
            }
            const persona = PersonaManager.loadPersona(workspacePath);
            await this.postMessage({
                type: "personaLoaded",
                persona: persona
            });
            this.log("퍼소나 로드 완료");
        }
        catch (err) {
            this.error("퍼소나 로드 실패:", err);
        }
    }
    /**
     * 퍼소나 삭제를 처리합니다.
     * @param message 웹뷰 메시지
     */
    async handleDeletePersona(message) {
        this.log("퍼소나 삭제 요청");
        try {
            const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspacePath) {
                this.error("워크스페이스 경로를 찾을 수 없습니다.");
                return;
            }
            PersonaManager.deletePersona(workspacePath);
            await this.postMessage({
                type: "personaDeleted"
            });
            this.log("퍼소나 삭제 완료");
        }
        catch (err) {
            this.error("퍼소나 삭제 실패:", err);
        }
    }
    /**
     * 퍼소나 추가 또는 업데이트를 처리합니다.
     * @param message 웹뷰 메시지
     */
    async handleAddOrUpdatePersona(message) {
        try {
            const persona = message.persona;
            if (!persona) {
                this.error("퍼소나 데이터가 없습니다.");
                return;
            }
            this.log(`퍼소나 업데이트: ${persona.id}`);
            const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspacePath) {
                this.error("워크스페이스 경로를 찾을 수 없습니다.");
                return;
            }
            this.log(`퍼소나 저장 경로: ${workspacePath}`);
            // 퍼소나 저장
            PersonaManager.addOrUpdatePersona(workspacePath, persona);
            // 상태 업데이트 메시지 전송
            const updateMessage = {
                type: "personaUpdated",
                personaId: persona.id,
            };
            await this.postMessage(updateMessage);
            this.log(`퍼소나 저장 완료: ${persona.id}`);
        }
        catch (err) {
            this.error("퍼소나 저장 실패:", err);
        }
    }
    /**
     * 템플릿 캐릭터 요청을 처리합니다.
     */
    async handleRequestTemplateCharacters() {
        this.log("템플릿 캐릭터 로딩 요청 수신");
        try {
            // 템플릿 캐릭터 데이터 로드
            const templateCharacters = this.templateManager.loadTemplateCharacters();
            if (templateCharacters.length === 0) {
                this.log("로드된 템플릿 캐릭터가 없습니다.");
                await this.postMessage({
                    type: "templateCharactersLoaded",
                    text: "[]",
                });
                return;
            }
            // 데이터 전송 (웹뷰 처리는 나중에 구현)
            await this.postMessage({
                type: "templateCharactersLoaded",
                text: JSON.stringify(templateCharacters),
            });
            this.log("템플릿 캐릭터 데이터 전송 완료");
        }
        catch (err) {
            this.error("템플릿 캐릭터 로드 실패:", err);
            await this.postMessage({
                type: "templateCharactersLoaded",
                text: "[]",
                error: String(err),
            });
        }
    }
}
//# sourceMappingURL=persona-controller.js.map