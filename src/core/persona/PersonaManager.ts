import { Persona } from '../../shared/types';
import * as fs from 'fs';
import * as path from 'path';

const PERSONA_PATH = path.join('.vscode', 'caret', 'personas.json');

export class PersonaManager {
  static readonly AGENT_PROFILE_FILENAME = "agent_profile.png";
  static readonly AGENT_PROFILE_TMP_FILENAME = "agent_profile_tmp.png";
  static readonly AGENT_THINKING_FILENAME = "agent_thinking.png";
  static readonly AGENT_THINKING_TMP_FILENAME = "agent_thinking_tmp.png";
  static readonly DEFAULT_PROFILE_FILENAME = "default_ai_agent_profile.png";
  static readonly DEFAULT_THINKING_FILENAME = "default_ai_agent_thinking.png";

  static getPersonaFilePath(workspaceRoot: string): string {
    return path.join(workspaceRoot, PERSONA_PATH);
  }

  static loadPersona(workspaceRoot: string): Persona | null {
    const filePath = this.getPersonaFilePath(workspaceRoot);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  }

  static savePersona(workspaceRoot: string, persona: Persona): void {
    const filePath = this.getPersonaFilePath(workspaceRoot);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(persona, null, 2), 'utf-8');
  }

  static restoreDefaultPersona(workspaceRoot: string, defaultPersona: Persona | null): void {
    // 기본 퍼소나만 저장 (없으면 삭제)
    if (defaultPersona) {
      this.savePersona(workspaceRoot, defaultPersona);
    } else {
      this.deletePersona(workspaceRoot);
    }
  }

  static deletePersona(workspaceRoot: string): void {
    // 퍼소나 삭제 시 파일 제거
    const filePath = this.getPersonaFilePath(workspaceRoot);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  static addOrUpdatePersona(workspaceRoot: string, persona: Persona): void {
    // 단일 퍼소나만 저장 (이전 퍼소나는 모두 덮어쓰기)
    this.savePersona(workspaceRoot, persona);
  }
}
