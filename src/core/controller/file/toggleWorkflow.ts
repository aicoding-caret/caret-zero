import type { Controller } from "../index"
import { getWorkspaceState, updateWorkspaceState } from "@core/storage/state"
import type { CaretRulesToggles } from "@shared/caret-rules"

/**
 * Toggles a workflow on or off
 * @param controller The controller instance
 * @param request The request containing the workflow path and enabled state
 */
export async function toggleWorkflow(controller: Controller, request: any): Promise<void> {
	try {
		const toggles = ((await getWorkspaceState(controller.context, "workflowToggles")) as CaretRulesToggles) || {}
		toggles[request.workflowPath] = request.enabled
		await updateWorkspaceState(controller.context, "workflowToggles", toggles)
	} catch (error) {
		console.error("Failed to toggle Workflow:", error)
		throw error
	}
}
