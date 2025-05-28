import { ChatContent } from "@shared/ChatContent"
import { ChatSettings, ChatMode } from "@shared/ChatSettings"
import { ChatContent as ProtoChatContent, ChatSettings as ProtoChatSettings, ChatMode as ProtoChatMode } from "../../../shared/proto/state"

/**
 * Converts domain ChatSettings objects to proto ChatSettings objects
 */
export function convertChatSettingsToProtoChatSettings(chatSettings: ChatSettings): ProtoChatSettings {
	return {
		mode: convertModeToProtoMode(chatSettings.mode),
		preferredLanguage: chatSettings.preferredLanguage,
		openAiReasoningEffort: chatSettings.openAIReasoningEffort,
	}
}

/**
 * Converts proto ChatSettings objects to domain ChatSettings objects
 */
export function convertProtoChatSettingsToChatSettings(protoChatSettings: ProtoChatSettings): ChatSettings {
	return {
		mode: convertProtoModeToMode(protoChatSettings.mode),
		preferredLanguage: protoChatSettings.preferredLanguage,
		openAIReasoningEffort: protoChatSettings.openAiReasoningEffort as "low" | "medium" | "high" | undefined,
	}
}

/**
 * Converts domain mode to proto mode
 */
function convertModeToProtoMode(mode: ChatMode): ProtoChatMode {
	switch (mode) {
		case 'arch': return ProtoChatMode.ARCH;
		case 'dev': return ProtoChatMode.DEV;
		case 'rule': return ProtoChatMode.RULE;
		case 'talk': return ProtoChatMode.TALK;
		case 'custom': return ProtoChatMode.CUSTOM;
		default: return ProtoChatMode.ARCH;
	}
}

/**
 * Converts proto mode to domain mode
 */
function convertProtoModeToMode(mode: ProtoChatMode): ChatMode {
	switch (mode) {
		case ProtoChatMode.ARCH: return 'arch';
		case ProtoChatMode.DEV: return 'dev';
		case ProtoChatMode.RULE: return 'rule';
		case ProtoChatMode.TALK: return 'talk';
		case ProtoChatMode.CUSTOM: return 'custom';
		default: return 'arch';
	}
}

/**
 * Converts domain ChatContent objects to proto ChatContent objects
 */
export function convertChatContentToProtoChatContent(chatContent?: ChatContent): ProtoChatContent | undefined {
	if (!chatContent) {
		return undefined
	}

	return {
		message: chatContent.message,
		images: chatContent.images || [],
	}
}

/**
 * Converts proto ChatContent objects to domain ChatContent objects
 */
export function convertProtoChatContentToChatContent(protoChatContent?: ProtoChatContent): ChatContent | undefined {
	if (!protoChatContent) {
		return undefined
	}

	return {
		message: protoChatContent.message,
		images: protoChatContent.images || [],
	}
}
