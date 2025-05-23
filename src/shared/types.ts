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
