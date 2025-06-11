import { EmptyRequest } from "@shared/proto/common"
import type { Controller } from "../index"
import { refreshCaretRulesToggles } from "@core/context/instructions/user-instructions/caret-rules"
import { refreshExternalRulesToggles } from "@core/context/instructions/user-instructions/external-rules"
import { refreshWorkflowToggles } from "@core/context/instructions/user-instructions/workflows"
import { cwd } from "@core/task"

/**
 * Refreshes all rule toggles (Caret, External, and Workflows)
 * @param controller The controller instance
 * @param _request The empty request
 * @returns An object containing updated toggles for all rule types
 */
export async function refreshRules(controller: Controller, _request: EmptyRequest): Promise<any> {
	try {
		const { globalToggles, localToggles } = await refreshCaretRulesToggles(controller.context, cwd)
		const { cursorLocalToggles, windsurfLocalToggles } = await refreshExternalRulesToggles(controller.context, cwd)
		const { localWorkflowToggles, globalWorkflowToggles } = await refreshWorkflowToggles(controller.context, cwd)

		return {
			globalCaretRulesToggles: { toggles: globalToggles },
			localCaretRulesToggles: { toggles: localToggles },
			localCursorRulesToggles: { toggles: cursorLocalToggles },
			localWindsurfRulesToggles: { toggles: windsurfLocalToggles },
			localWorkflowToggles: { toggles: localWorkflowToggles },
			globalWorkflowToggles: { toggles: globalWorkflowToggles },
		}
	} catch (error) {
		console.error("Failed to refresh rules:", error)
		throw error
	}
}
