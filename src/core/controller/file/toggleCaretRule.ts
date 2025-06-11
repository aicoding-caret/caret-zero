import type { Controller } from "../index"
import { getGlobalState, getWorkspaceState, updateGlobalState, updateWorkspaceState } from "@core/storage/state"
import type { CaretRulesToggles } from "@shared/caret-rules"

/**
 * Toggles a Caret rule (enable or disable)
 * @param controller The controller instance
 * @param request The toggle request
 * @returns The updated Caret rule toggles
 */
export async function toggleCaretRule(controller: Controller, request: any): Promise<void> {
	try {
		if (request.isGlobal) {
			const toggles = ((await getGlobalState(controller.context, "globalCaretRulesToggles")) as CaretRulesToggles) || {}
			toggles[request.rulePath] = request.enabled
			await updateGlobalState(controller.context, "globalCaretRulesToggles", toggles)
		} else {
			const toggles = ((await getWorkspaceState(controller.context, "localCaretRulesToggles")) as CaretRulesToggles) || {}
			toggles[request.rulePath] = request.enabled
			await updateWorkspaceState(controller.context, "localCaretRulesToggles", toggles)
		}

		// After toggling, we might want to inform the webview or other parts of the extension.
		// For now, we just update the state.
	} catch (error) {
		console.error("Failed to toggle Caret rule:", error)
		throw error // Propagate the error to be handled by the service layer
	}
}
