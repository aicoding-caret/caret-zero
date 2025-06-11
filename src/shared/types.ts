export interface Persona {
  id: string;
  name: string; 
  description: string; 
  customInstructions?: string; 
  avatarUri?: string;
  thinkingAvatarUri?: string;
  isDefault?: boolean;
  isEditable?: boolean;
}

export interface TemplateCharacter {
  name: string;
  description: string;
  customInstructions?: string;
  // 필요한 경우 caret과 동일하게 맞춤 (추가 필드 있으면 추가)
}

export enum PlanActMode {
  PLAN = 0,
  ACT = 1,
}

export interface ChatContent {
  message?: string;
  images?: string[];
  files?: string[];
}

export interface ChatSettings {
  mode: PlanActMode;
  preferredLanguage?: string;
  openAiReasoningEffort?: "low" | "medium" | "high"; //  proto와 일치시킬 필요 있음
}
