export interface ChatSettings {
	mode: string // Allow any string for flexibility with custom modes
}

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
	mode: "do", // Default to 'Do' mode (previously 'act')
}
