import { getRequestRegistry } from "../grpc-handler"
// Keep track of active subscriptions
const activeMcpMarketplaceSubscriptions = new Set()
/**
 * Subscribe to MCP marketplace catalog updates
 * @param controller The controller instance
 * @param request The empty request
 * @param responseStream The streaming response handler
 * @param requestId The ID of the request (passed by the gRPC handler)
 */
export async function subscribeToMcpMarketplaceCatalog(controller, request, responseStream, requestId) {
	// Add this subscription to the active subscriptions
	activeMcpMarketplaceSubscriptions.add(responseStream)
	// Register cleanup when the connection is closed
	const cleanup = () => {
		activeMcpMarketplaceSubscriptions.delete(responseStream)
	}
	// Register the cleanup function with the request registry if we have a requestId
	if (requestId) {
		getRequestRegistry().registerRequest(requestId, cleanup, { type: "mcp_marketplace_subscription" }, responseStream)
	}
}
/**
 * Send an MCP marketplace catalog event to all active subscribers
 */
export async function sendMcpMarketplaceCatalogEvent(catalog) {
	// Send the event to all active subscribers
	const promises = Array.from(activeMcpMarketplaceSubscriptions).map(async (responseStream) => {
		try {
			await responseStream(catalog, false)
		} catch (error) {
			console.error("Error sending MCP marketplace catalog event:", error)
			// Remove the subscription if there was an error
			activeMcpMarketplaceSubscriptions.delete(responseStream)
		}
	})
	await Promise.all(promises)
}
//# sourceMappingURL=subscribeToMcpMarketplaceCatalog.js.map
