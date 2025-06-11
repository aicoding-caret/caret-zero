import {
	ChatContent as ProtoChatContent,
	ChatSettings as ProtoChatSettings,
	PlanActMode as ProtoPlanActMode,
} from "../../../shared/proto/state"
import { ChatContent, PlanActMode } from "../../../shared/types"
import {
	ChatSettings as DomainClientChatSettings,
	ChatMode as DomainClientChatMode,
	OpenAIReasoningEffort as DomainClientOpenAIReasoningEffort,
} from "../../../shared/ChatSettings"

/**
 * Converts domain chat settings to proto chat settings
 */
export function convertChatSettingsToProtoChatSettings(
	domainSettings: DomainClientChatSettings,
): ProtoChatSettings {
	return {
		mode: convertDomainClientChatModeToProtoPlanActMode(domainSettings.mode),
		preferredLanguage: domainSettings.preferredLanguage,
		openAiReasoningEffort: domainSettings.openAIReasoningEffort,
	}
}

/**
 * Converts proto chat settings to domain chat settings
 */
export function convertProtoChatSettingsToChatSettings(
	protoChatSettings: ProtoChatSettings,
): DomainClientChatSettings {
	return {
		mode: convertProtoPlanActModeToDomainClientChatMode(protoChatSettings.mode),
		preferredLanguage: protoChatSettings.preferredLanguage,
		openAIReasoningEffort: protoChatSettings.openAiReasoningEffort as DomainClientOpenAIReasoningEffort | undefined,
	}
}

/**
 * Converts domain PlanActMode to proto PlanActMode
 */
function convertPlanActModeToProtoPlanActMode(
	mode: PlanActMode,
): ProtoPlanActMode {
	switch (mode) {
		case PlanActMode.PLAN:
			return ProtoPlanActMode.PLAN
		case PlanActMode.ACT:
			return ProtoPlanActMode.ACT
		default:
			// This case should ideally not be reached if PlanActMode is a strict enum.
			// Handling as per proto enum generation which includes UNRECOGNIZED.
			return ProtoPlanActMode.UNRECOGNIZED
	}
}

/**
 * Converts proto PlanActMode to domain PlanActMode
 */
function convertProtoPlanActModeToPlanActMode(
	protoMode: ProtoPlanActMode,
): PlanActMode {
	switch (protoMode) {
		case ProtoPlanActMode.PLAN:
			return PlanActMode.PLAN
		case ProtoPlanActMode.ACT:
			return PlanActMode.ACT
		case ProtoPlanActMode.UNRECOGNIZED:
		default:
			// Decide on a default or throw an error for UNRECOGNIZED cases
			// For now, throwing an error might be safer to highlight issues.
			throw new Error(`Unrecognized proto chat mode: ${protoMode}`)
	}
}

/**
 * Converts domain chat content to proto chat content
 */
export function convertChatContentToProtoChatContent(
	chatContent: ChatContent,
): ProtoChatContent {
	return {
		message: chatContent.message,
		images: chatContent.images || [],
		files: chatContent.files || [],
	}
}

/**
 * Converts proto chat content to domain chat content
 */
export function convertProtoChatContentToChatContent(
	protoChatContent: ProtoChatContent,
): ChatContent {
	return {
		message: protoChatContent.message,
		images: protoChatContent.images || [],
		files: protoChatContent.files || [],
	}
}

// --- Helper functions for mode conversion --- START ---
function convertProtoPlanActModeToDomainClientChatMode(
	protoMode: ProtoPlanActMode,
): DomainClientChatMode {
	// Temporary mapping to allow compilation
	switch (protoMode) {
		case ProtoPlanActMode.PLAN:
			return "arch" // Or any other default ChatMode string
		case ProtoPlanActMode.ACT:
			return "dev" // Or any other default ChatMode string
		case ProtoPlanActMode.UNRECOGNIZED:
		default:
			return "arch" // Default fallback
	}
}

function convertDomainClientChatModeToProtoPlanActMode(
	domainMode: DomainClientChatMode,
): ProtoPlanActMode {
	// Temporary mapping to allow compilation
	// This mapping might need to be more nuanced based on actual feature requirements.
	switch (domainMode) {
		case "arch":
		case "dev":
		case "rule":
		case "talk":
		case "custom":
			return ProtoPlanActMode.PLAN // Or map specific modes if logic requires
		default:
			return ProtoPlanActMode.UNRECOGNIZED
	}
}
// --- Helper functions for mode conversion --- END ---
