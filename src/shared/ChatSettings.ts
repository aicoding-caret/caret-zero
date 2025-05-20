export type OpenAIReasoningEffort = "low" | "medium" | "high"

export interface ChatSettings {
<<<<<<< HEAD
	mode: string // Allow any string for flexibility with custom modes
=======
	mode: "plan" | "act"
	preferredLanguage?: string
	openAIReasoningEffort?: OpenAIReasoningEffort
>>>>>>> upstream/main
}

export type PartialChatSettings = Partial<ChatSettings>

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
<<<<<<< HEAD
	mode: "strategy", // Default to 'Strategy' mode (previously 'plan')
=======
	mode: "act",
	preferredLanguage: "English",
	openAIReasoningEffort: "medium",
>>>>>>> upstream/main
}
