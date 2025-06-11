import * as vscode from 'vscode';
import { PersonaManager } from '../backend/persona/PersonaManager';
import { PersonaController } from '../backend/controllers/persona-controller';
export class ExtensionEnhancer {
    static async enhance(context, clineAPI) {
        // PersonaManager 초기화
        const personaManager = PersonaManager;
        // PersonaController 초기화
        const postMessage = async (message) => {
            // 웹뷰로 메시지 전송 로직 (나중에 구현)
            console.log('Caret message:', message);
        };
        const personaController = new PersonaController(context, postMessage);
        // 추가 VSCode 명령어 등록
        const loadPersonaCommand = vscode.commands.registerCommand('caret.loadPersona', async () => {
            const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (workspacePath) {
                const persona = PersonaManager.loadPersona(workspacePath);
                vscode.window.showInformationMessage(`Persona loaded: ${persona?.id || 'None'}`);
            }
        });
        const savePersonaCommand = vscode.commands.registerCommand('caret.savePersona', async () => {
            const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (workspacePath) {
                // 기본 페르소나로 저장 (예시)
                const defaultPersona = {
                    id: 'default-sarang',
                    name: { ko: '사랑', en: 'Sarang' },
                    description: { ko: '따뜻한 AI 어시스턴트', en: 'Warm AI Assistant' },
                    customInstructions: 'You are a warm and helpful AI assistant.',
                    isDefault: true,
                    isEditable: true
                };
                PersonaManager.savePersona(workspacePath, defaultPersona);
                vscode.window.showInformationMessage('Persona saved successfully!');
            }
        });
        // 컨텍스트에 명령어 등록
        context.subscriptions.push(loadPersonaCommand, savePersonaCommand);
        // Caret API 반환
        return {
            personaManager,
            personaController,
            // 다른 Caret 기능들...
        };
    }
}
//# sourceMappingURL=extension-enhancer.js.map