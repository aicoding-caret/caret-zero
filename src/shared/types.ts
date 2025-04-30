export interface Persona {
  id: string;
  name: Record<string, string>; // 언어별 이름
  description: Record<string, string>; // 언어별 설명
  customInstructions: string; // 영문 권장
  avatarUri?: string;
  thinkingAvatarUri?: string;
  isDefault?: boolean;
  isEditable?: boolean;
}
