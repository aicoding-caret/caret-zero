import * as vscode from "vscode"
import { Empty } from "../../../shared/proto/common"
/**
 * Copies text to the system clipboard
 * @param controller The controller instance
 * @param request The request containing the text to copy
 * @returns Empty response
 */
export async function copyToClipboard(controller, request) {
	try {
		if (request.value) {
			await vscode.env.clipboard.writeText(request.value)
		}
	} catch (error) {
		console.error("Error copying to clipboard:", error)
	}
	return Empty.create()
}
//# sourceMappingURL=copyToClipboard.js.map
