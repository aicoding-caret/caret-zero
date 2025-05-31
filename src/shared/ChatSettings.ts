export type OpenAIReasoningEffort = "low" | "medium" | "high"

export type ChatMode = "arch" | "dev" | "rule" | "talk" | "custom"

export interface ChatSettings {
	mode: ChatMode
	preferredLanguage?: string
	openAIReasoningEffort?: OpenAIReasoningEffort
	customInstructions?: string
}

export type PartialChatSettings = Partial<ChatSettings>

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
	mode: "arch", // Default to 'Arch' mode
	preferredLanguage: "English",
	openAIReasoningEffort: "medium",
}
