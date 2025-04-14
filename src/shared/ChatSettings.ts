export interface ChatSettings {
	mode: string // Allow any string for flexibility with custom modes
}

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
	mode: "strategy", // Default to 'Strategy' mode (previously 'plan')
}
