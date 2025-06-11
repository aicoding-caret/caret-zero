import * as fs from 'fs';
import * as path from 'path';
const PERSONA_PATH = path.join('.vscode', 'caret', 'personas.json');
export class PersonaManager {
    static AGENT_PROFILE_FILENAME = "agent_profile.png";
    static AGENT_PROFILE_TMP_FILENAME = "agent_profile_tmp.png";
    static AGENT_THINKING_FILENAME = "agent_thinking.png";
    static AGENT_THINKING_TMP_FILENAME = "agent_thinking_tmp.png";
    static DEFAULT_PROFILE_FILENAME = "default_ai_agent_profile.png";
    static DEFAULT_THINKING_FILENAME = "default_ai_agent_thinking.png";
    static getPersonaFilePath(workspaceRoot) {
        return path.join(workspaceRoot, PERSONA_PATH);
    }
    static loadPersona(workspaceRoot) {
        const filePath = this.getPersonaFilePath(workspaceRoot);
        if (!fs.existsSync(filePath)) {
            return null;
        }
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
    }
    static savePersona(workspaceRoot, persona) {
        const filePath = this.getPersonaFilePath(workspaceRoot);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(persona, null, 2), 'utf-8');
    }
    static restoreDefaultPersona(workspaceRoot, defaultPersona) {
        // 기본 퍼소나만 저장 (없으면 삭제)
        if (defaultPersona) {
            this.savePersona(workspaceRoot, defaultPersona);
        }
        else {
            this.deletePersona(workspaceRoot);
        }
    }
    static deletePersona(workspaceRoot) {
        // 퍼소나 삭제 시 파일 제거
        const filePath = this.getPersonaFilePath(workspaceRoot);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
    static addOrUpdatePersona(workspaceRoot, persona) {
        // 단일 퍼소나만 저장 (이전 퍼소나는 모두 덮어쓰기)
        this.savePersona(workspaceRoot, persona);
    }
}
//# sourceMappingURL=PersonaManager.js.map