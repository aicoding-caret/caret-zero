import { Empty } from "@shared/proto/common"
import { openFile as openFileIntegration } from "@integrations/misc/open-file"
import path from "path"
/**
 * Opens a file in the editor
 * @param controller The controller instance
 * @param request The request message containing the file path in the 'value' field
 * @returns Empty response
 */
export const openTaskHistory = async (controller, request) => {
	const globalStoragePath = controller.context.globalStorageUri.fsPath
	const taskHistoryPath = path.join(globalStoragePath, "tasks", request.value, "api_conversation_history.json")
	if (request.value) {
		openFileIntegration(taskHistoryPath)
	}
	return Empty.create()
}
//# sourceMappingURL=openTaskHistory.js.map
