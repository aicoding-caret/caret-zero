import { Empty } from "@shared/proto/common"
import { WebviewProviderType } from "@shared/proto/ui"
import { getRequestRegistry } from "../grpc-handler"
// Track subscriptions with their provider type
const subscriptions = new Map()
/**
 * Subscribe to settings button clicked events
 * @param controller The controller instance
 * @param request The request with provider type
 * @param responseStream The streaming response handler
 * @param requestId The ID of the request (passed by the gRPC handler)
 */
export async function subscribeToSettingsButtonClicked(controller, request, responseStream, requestId) {
	const providerType = request.providerType
	console.log(`[DEBUG] set up settings button subscription for ${WebviewProviderType[providerType]} webview`)
	// Store the subscription with its provider type
	subscriptions.set(responseStream, providerType)
	// Register cleanup when the connection is closed
	const cleanup = () => {
		subscriptions.delete(responseStream)
	}
	// Register the cleanup function with the request registry if we have a requestId
	if (requestId) {
		getRequestRegistry().registerRequest(requestId, cleanup, { type: "settings_button_clicked_subscription" }, responseStream)
	}
}
/**
 * Send a settings button clicked event to active subscribers of matching provider type
 * @param webviewType The type of webview that triggered the event
 */
export async function sendSettingsButtonClickedEvent(webviewType) {
	// Process all subscriptions, filtering based on the source
	const promises = Array.from(subscriptions.entries()).map(async ([responseStream, providerType]) => {
		// If webviewType is provided, only send to subscribers of the same type
		if (webviewType !== undefined && webviewType !== providerType) {
			return // Skip subscribers of different types
		}
		try {
			const event = Empty.create({})
			await responseStream(event, false) // Not the last message
		} catch (error) {
			console.error(`Error sending settings button clicked event to ${WebviewProviderType[providerType]}:`, error)
			subscriptions.delete(responseStream)
		}
	})
	await Promise.all(promises)
}
//# sourceMappingURL=subscribeToSettingsButtonClicked.js.map
