import type { Controller } from "../index"
import { getWorkspaceState, updateWorkspaceState } from "@core/storage/state"
import type { CaretRulesToggles } from "@shared/caret-rules"

/**
 * Toggles a Cursor rule (enable or disable)
 * @param controller The controller instance
 * @param request The toggle request
 * @returns The updated Cursor rule toggles
 */
export async function toggleCursorRule(controller: Controller, request: any): Promise<void> {
	try {
		const toggles = ((await getWorkspaceState(controller.context, "localCursorRulesToggles")) as CaretRulesToggles) || {}
		toggles[request.rulePath] = request.enabled
		await updateWorkspaceState(controller.context, "localCursorRulesToggles", toggles)
	} catch (error) {
		console.error("Failed to toggle Cursor rule:", error)
		throw error
	}
}
