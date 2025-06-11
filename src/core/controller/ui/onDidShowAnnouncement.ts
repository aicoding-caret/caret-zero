import type { Controller } from "../index"
import { updateGlobalState } from "@core/storage/state"

/**
 * Handles the logic for when an announcement is shown
 * @param controller The controller instance
 */
export async function onDidShowAnnouncement(controller: Controller): Promise<void> {
	await controller.handleDidShowAnnouncement()
}
