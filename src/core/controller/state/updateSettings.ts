import type { Controller } from "../index"
import type { ApiConfiguration } from "@shared/api"
import { updateApiConfiguration } from "@core/storage/state"

/**
 * Updates the settings
 * @param controller The controller instance
 * @param request The request containing the new API configuration
 */
export async function updateSettings(controller: Controller, request: ApiConfiguration): Promise<void> {
	await updateApiConfiguration(controller.context, request)
}
