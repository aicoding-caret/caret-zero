import { Controller } from ".."
import { Empty } from "../../../shared/proto/common"
import { TogglePlanActModeRequest } from "../../../shared/proto/state"
import {
	convertProtoChatContentToChatContent,
	convertProtoChatSettingsToChatSettings,
} from "../../../shared/proto-conversions/state/chat-settings-conversion"

/**
 * Toggles the plan/act mode and updates chat settings.
 *
 * @param controller The main controller instance.
 * @param request The request containing new chat settings and content.
 * @returns An empty response
 */
export async function updateChatMode(controller: Controller, request: TogglePlanActModeRequest): Promise<Empty> {
	try {
		if (!request.chatSettings) {
			throw new Error("Chat settings are required")
		}

		const chatSettings = convertProtoChatSettingsToChatSettings(request.chatSettings)
		const chatContent = request.chatContent ? convertProtoChatContentToChatContent(request.chatContent) : undefined

		// Call the existing controller implementation
		await controller.toggleModeWithChatSettings(chatSettings, chatContent)

		return Empty.create()
	} catch (error) {
		console.error("Failed to update chat mode:", error)
		throw error
	}
}
