import type { Controller } from "../index"
import { WebviewProvider } from "@core/webview"

/**
 * Initializes the webview with the necessary data
 * @param controller The controller instance
 * @param webview The webview provider instance
 */
export async function initializeWebview(controller: Controller, _webview: WebviewProvider): Promise<void> {
	// Post the initial state to the webview
	await controller.postStateToWebview()

	// Asynchronously refresh OpenRouter models without waiting
	controller.refreshOpenRouterModels().catch((error) => {
		console.error("Failed to refresh OpenRouter models on initialization:", error)
	})
}
