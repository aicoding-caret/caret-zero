import { Empty } from "../../../shared/proto/common"
import { openMention as coreOpenMention } from "../../mentions"
/**
 * Opens a mention (file path, problem, terminal, or URL)
 * @param controller The controller instance
 * @param request The string request containing the mention text
 * @returns Empty response
 */
export async function openMention(controller, request) {
	coreOpenMention(request.value)
	return Empty.create()
}
//# sourceMappingURL=openMention.js.map
