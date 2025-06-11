import type { Controller } from "../index"
import type { AutoApprovalSettings } from "@shared/AutoApprovalSettings"
import { updateGlobalState } from "@core/storage/state"

/**
 * Updates the auto-approval settings
 * @param controller The controller instance
 * @param request The request containing the new settings
 */
export async function updateAutoApprovalSettings(
	controller: Controller,
	request: AutoApprovalSettings,
): Promise<void> {
	await updateGlobalState(controller.context, "autoApprovalSettings", request)

		if (controller.task) {
		controller.task.autoApprovalSettings = request
		}

		await controller.postStateToWebview()
}
