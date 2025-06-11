import type { Controller } from "../index"

/**
 * Subscribes to the account button clicked event
 * @param controller The controller instance
 */
export function subscribeToAccountButtonClicked(controller: Controller) {
	controller.postMessageToWebview({
		type: "action",
		action: "accountButtonClicked",
	})
}
