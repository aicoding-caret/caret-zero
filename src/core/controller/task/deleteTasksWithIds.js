import { Empty } from "../../../shared/proto/common"
/**
 * Deletes tasks with the specified IDs
 * @param controller The controller instance
 * @param request The request containing an array of task IDs to delete
 * @returns Empty response
 * @throws Error if operation fails
 */
export const deleteTasksWithIds = async (controller, request) => {
	if (!request.value || request.value.length === 0) {
		throw new Error("Missing task IDs")
	}
	await Promise.all(request.value.map((value) => controller.deleteTaskWithId(value)))
	return Empty.create()
}
//# sourceMappingURL=deleteTasksWithIds.js.map
