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
    let personas = this.loadPersonas(workspaceRoot);
    // 커스텀 퍼소나는 남기고, 기본 퍼소나만 교체
    const custom = personas.filter(p => !p.isDefault);
    this.savePersonas(workspaceRoot, [...defaultPersonas, ...custom]);
  }

  static deletePersona(workspaceRoot: string, personaId: string): void {
    let personas = this.loadPersonas(workspaceRoot);
    personas = personas.filter(p => p.id !== personaId);
    this.savePersonas(workspaceRoot, personas);
  }

  static addOrUpdatePersona(workspaceRoot: string, persona: Persona): void {
    let personas = this.loadPersonas(workspaceRoot);
    const idx = personas.findIndex(p => p.id === persona.id);
    if (idx >= 0) personas[idx] = persona;
    else personas.push(persona);
    this.savePersonas(workspaceRoot, personas);
  }
}
