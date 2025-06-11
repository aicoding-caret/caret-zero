import type { Controller } from "../index"

/**
 * Toggles auto-approval for a tool
 * @param controller The controller instance
 * @param request The request containing the server name, tool names, and auto-approve state
 */
export async function toggleToolAutoApprove(controller: Controller, request: any): Promise<void> {
	try {
		await controller.mcpHub?.toggleToolAutoApprove(request.serverName, request.toolNames, request.autoApprove)
	} catch (error) {
		console.error("Failed to toggle tool auto-approve:", error)
		// Don't rethrow, as this is not a critical failure
	}
}
