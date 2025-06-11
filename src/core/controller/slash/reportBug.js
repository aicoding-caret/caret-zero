import { Empty } from "../../../shared/proto/common"
/**
 * Report bug slash command logic
 */
export async function reportBug(controller, request) {
	await controller.task?.handleWebviewAskResponse("yesButtonClicked")
	return Empty.create()
}
//# sourceMappingURL=reportBug.js.map
