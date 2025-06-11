import type { Controller } from "../index"

/**
 * Scrolls to a specific setting in the webview
 * @param controller The controller instance
 * @param request The request containing the setting key to scroll to
 */
export async function scrollToSettings(controller: Controller, request: { key: string }): Promise<void> {
	await controller.postMessageToWebview({
		type: "scrollToSettings",
		text: request.key,
	})
}
