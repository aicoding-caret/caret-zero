import { Empty } from "@shared/proto/common"
import { getRequestRegistry } from "../grpc-handler"
// Track subscriptions by controller ID
const activeSubscriptions = new Map()
/**
 * Subscribe to account button clicked events
 * @param controller The controller instance
 * @param request The empty request
 * @param responseStream The streaming response handler
 * @param requestId The request ID for cleanup
 */
export async function subscribeToAccountButtonClicked(controller, _request, responseStream, requestId) {
	const controllerId = controller.id
	// Store subscription with controller ID
	activeSubscriptions.set(controllerId, responseStream)
	// Register cleanup
	const cleanup = () => {
		activeSubscriptions.delete(controllerId)
	}
	if (requestId) {
		getRequestRegistry().registerRequest(requestId, cleanup, { type: "account_button_subscription" }, responseStream)
	}
}
/**
 * Send account button clicked event to a specific controller
 * @param controllerId The ID of the controller to send the event to
 */
export async function sendAccountButtonClickedEvent(controllerId) {
	const responseStream = activeSubscriptions.get(controllerId)
	if (!responseStream) {
		console.log(`No active subscription for controller ${controllerId}`)
		return
	}
	try {
		const event = Empty.create({})
		await responseStream(event, false)
	} catch (error) {
		console.error(`Error sending account button clicked event to controller ${controllerId}:`, error)
		activeSubscriptions.delete(controllerId)
	}
}
//# sourceMappingURL=subscribeToAccountButtonClicked.js.map
