import { Empty } from "../../../shared/proto/common"
import { telemetryService } from "@/services/posthog/telemetry/TelemetryService"
/**
 * Handles task feedback submission (thumbs up/down)
 * @param controller The controller instance
 * @param request The StringRequest containing the feedback type ("thumbs_up" or "thumbs_down") in the value field
 * @returns Empty response
 */
export async function taskFeedback(controller, request) {
	if (!request.value) {
		console.warn("taskFeedback: Missing feedback type value")
		return Empty.create()
	}
	try {
		if (controller.task?.taskId) {
			telemetryService.captureTaskFeedback(controller.task.taskId, request.value)
		} else {
			console.warn("taskFeedback: No active task to receive feedback")
		}
	} catch (error) {
		console.error("Error in taskFeedback handler:", error)
	}
	return Empty.create()
}
//# sourceMappingURL=taskFeedback.js.map
