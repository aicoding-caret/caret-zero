export type OpenAIReasoningEffort = "low" | "medium" | "high"

export interface ChatSettings {
	mode: string // Allow any string for flexibility with custom modes
	// mode: "plan" | "act"
	preferredLanguage?: string
	openAIReasoningEffort?: OpenAIReasoningEffort
}

export type PartialChatSettings = Partial<ChatSettings>

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
	mode: "strategy", // Default to 'Strategy' mode (previously 'plan')
	// mode: "act",
	preferredLanguage: "English",
	openAIReasoningEffort: "medium",
}
