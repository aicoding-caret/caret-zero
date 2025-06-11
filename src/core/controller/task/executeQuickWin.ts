import type { Controller } from "../index"

/**
 * Executes a quick win task
 * @param controller The controller instance
 * @param request The request containing the title for the quick win
 */
export async function executeQuickWin(controller: Controller, request: { title: string }): Promise<void> {
	const { title } = request

	if (!title) {
		console.error("executeQuickWin: Missing title")
		throw new Error("Missing title for executeQuickWin")
	}

	// Initialize the task using the controller's method
	await controller.initCaretWithTask(title)
}
