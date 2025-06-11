import type { Controller } from "../index"

/**
 * Subscribes to the chat button clicked event
 * @param controller The controller instance
 */
export function subscribeToChatButtonClicked(controller: Controller) {
	controller.postMessageToWebview({
		type: "action",
		action: "chatButtonClicked",
	})
}
