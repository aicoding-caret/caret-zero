import { ChatContent as ProtoChatContent, ChatSettings as ProtoChatSettings, PlanActMode } from "../../../shared/proto/state";
/**
 * Converts domain ChatSettings objects to proto ChatSettings objects
 */
export function convertChatSettingsToProtoChatSettings(chatSettings) {
    return ProtoChatSettings.create({
        mode: chatSettings.mode === "plan" ? PlanActMode.PLAN : PlanActMode.ACT,
        preferredLanguage: chatSettings.preferredLanguage,
        openAiReasoningEffort: chatSettings.openAIReasoningEffort,
    });
}
/**
 * Converts proto ChatSettings objects to domain ChatSettings objects
 */
export function convertProtoChatSettingsToChatSettings(protoChatSettings) {
    // eslint-disable-next-line eslint-rules/no-protobuf-object-literals
    return {
        mode: protoChatSettings.mode === PlanActMode.PLAN ? "plan" : "act",
        preferredLanguage: protoChatSettings.preferredLanguage,
        openAIReasoningEffort: protoChatSettings.openAiReasoningEffort,
    };
}
/**
 * Converts domain ChatContent objects to proto ChatContent objects
 */
export function convertChatContentToProtoChatContent(chatContent) {
    if (!chatContent) {
        return undefined;
    }
    return ProtoChatContent.create({
        message: chatContent.message,
        images: chatContent.images || [],
        files: chatContent.files || [],
    });
}
/**
 * Converts proto ChatContent objects to domain ChatContent objects
 */
export function convertProtoChatContentToChatContent(protoChatContent) {
    if (!protoChatContent) {
        return undefined;
    }
    // eslint-disable-next-line eslint-rules/no-protobuf-object-literals
    return {
        message: protoChatContent.message,
        images: protoChatContent.images || [],
        files: protoChatContent.files || [],
    };
}
//# sourceMappingURL=chat-settings-conversion.js.map