import { Empty } from "../../../shared/proto/common"
/**
 * Command slash command logic
 */
export async function condense(controller, request) {
	await controller.task?.handleWebviewAskResponse("yesButtonClicked")
	return Empty.create()
}
//# sourceMappingURL=condense.js.map
