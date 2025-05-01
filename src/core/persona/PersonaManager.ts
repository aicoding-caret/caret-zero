import { Persona } from '../../shared/types';
import * as fs from 'fs';
import * as path from 'path';

const PERSONA_PATH = path.join('.vscode', 'caret', 'personas.json');

export class PersonaManager {
  static getPersonaFilePath(workspaceRoot: string): string {
    return path.join(workspaceRoot, PERSONA_PATH);
  }

  static loadPersonas(workspaceRoot: string): Persona[] {
    const filePath = this.getPersonaFilePath(workspaceRoot);
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  }

  static savePersonas(workspaceRoot: string, personas: Persona[]): void {
    const filePath = this.getPersonaFilePath(workspaceRoot);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(personas, null, 2), 'utf-8');
  }

  static restoreDefaultPersonas(workspaceRoot: string, defaultPersonas: Persona[]): void {
    // 기본 퍼소나만 저장 (단일 퍼소나)
    if (defaultPersonas.length > 0) {
      this.savePersonas(workspaceRoot, [defaultPersonas[0]]);
    }
  }

  static deletePersona(workspaceRoot: string, personaId: string): void {
    // 퍼소나 삭제 시 빈 배열 저장 (단일 퍼소나 시스템에서는 삭제 = 비우기)
    this.savePersonas(workspaceRoot, []);
  }

  static addOrUpdatePersona(workspaceRoot: string, persona: Persona): void {
    // 단일 퍼소나만 저장 (이전 퍼소나는 모두 덮어쓰기)
    this.savePersonas(workspaceRoot, [persona]);
  }
}
