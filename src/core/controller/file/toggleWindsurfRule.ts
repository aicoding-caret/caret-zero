import type { Controller } from "../index"
import { getWorkspaceState, updateWorkspaceState } from "@core/storage/state"
import type { CaretRulesToggles } from "@shared/caret-rules"

/**
 * Toggles a Windsurf rule (enable or disable)
 * @param controller The controller instance
 * @param request The toggle request
 * @returns The updated Windsurf rule toggles
 */
export async function toggleWindsurfRule(controller: Controller, request: any): Promise<void> {
	try {
		const toggles =
			((await getWorkspaceState(controller.context, "localWindsurfRulesToggles")) as CaretRulesToggles) || {}
		toggles[request.rulePath] = request.enabled
	await updateWorkspaceState(controller.context, "localWindsurfRulesToggles", toggles)
	} catch (error) {
		console.error("Failed to toggle Windsurf rule:", error)
		throw error
	}
}
