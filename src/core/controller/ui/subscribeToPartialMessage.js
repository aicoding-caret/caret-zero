import { getRequestRegistry } from "../grpc-handler"
// Keep track of active partial message subscriptions
const activePartialMessageSubscriptions = new Set()
/**
 * Subscribe to partial message events
 * @param controller The controller instance
 * @param request The empty request
 * @param responseStream The streaming response handler
 * @param requestId The ID of the request (passed by the gRPC handler)
 */
export async function subscribeToPartialMessage(controller, request, responseStream, requestId) {
	// Add this subscription to the active subscriptions
	activePartialMessageSubscriptions.add(responseStream)
	// Register cleanup when the connection is closed
	const cleanup = () => {
		activePartialMessageSubscriptions.delete(responseStream)
	}
	// Register the cleanup function with the request registry if we have a requestId
	if (requestId) {
		getRequestRegistry().registerRequest(requestId, cleanup, { type: "partial_message_subscription" }, responseStream)
	}
}
/**
 * Send a partial message event to all active subscribers
 * @param partialMessage The ClineMessage to send
 */
export async function sendPartialMessageEvent(partialMessage) {
	// Send the event to all active subscribers
	const promises = Array.from(activePartialMessageSubscriptions).map(async (responseStream) => {
		try {
			await responseStream(partialMessage, false)
		} catch (error) {
			console.error("Error sending partial message event:", error)
			// Remove the subscription if there was an error
			activePartialMessageSubscriptions.delete(responseStream)
		}
	})
	await Promise.all(promises)
}
//# sourceMappingURL=subscribeToPartialMessage.js.map
