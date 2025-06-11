export interface CaretPersona {
  id: string;
  name: { ko: string; en: string };
  description: { ko: string; en: string };
  customInstructions?: string;
  avatarUri?: string;
  thinkingAvatarUri?: string;
  isDefault?: boolean;
  isEditable?: boolean;
} 