import { McpServers } from "@shared/proto/mcp"
import { getRequestRegistry } from "../grpc-handler"
import { convertMcpServersToProtoMcpServers } from "@shared/proto-conversions/mcp/mcp-server-conversion"
// Keep track of active subscriptions
const activeMcpServersSubscriptions = new Set()
/**
 * Subscribe to MCP servers events
 * @param controller The controller instance
 * @param request The empty request
 * @param responseStream The streaming response handler
 * @param requestId The ID of the request (passed by the gRPC handler)
 */
export async function subscribeToMcpServers(controller, request, responseStream, requestId) {
	// Add this subscription to the active subscriptions
	activeMcpServersSubscriptions.add(responseStream)
	// Register cleanup when the connection is closed
	const cleanup = () => {
		activeMcpServersSubscriptions.delete(responseStream)
	}
	// Register the cleanup function with the request registry if we have a requestId
	if (requestId) {
		getRequestRegistry().registerRequest(requestId, cleanup, { type: "mcpServers_subscription" }, responseStream)
	}
	// Send initial state if available
	if (controller.mcpHub) {
		const mcpServers = controller.mcpHub.getServers()
		if (mcpServers.length > 0) {
			try {
				const protoServers = McpServers.create({
					mcpServers: convertMcpServersToProtoMcpServers(mcpServers),
				})
				await responseStream(protoServers, false)
			} catch (error) {
				console.error("Error sending initial MCP servers:", error)
				activeMcpServersSubscriptions.delete(responseStream)
			}
		}
	}
}
/**
 * Send an MCP servers update to all active subscribers
 * @param mcpServers The MCP servers to send
 */
export async function sendMcpServersUpdate(mcpServers) {
	// Send the event to all active subscribers
	const promises = Array.from(activeMcpServersSubscriptions).map(async (responseStream) => {
		try {
			await responseStream(mcpServers, false)
		} catch (error) {
			console.error("Error sending MCP servers update:", error)
			// Remove the subscription if there was an error
			activeMcpServersSubscriptions.delete(responseStream)
		}
	})
	await Promise.all(promises)
}
//# sourceMappingURL=subscribeToMcpServers.js.map
