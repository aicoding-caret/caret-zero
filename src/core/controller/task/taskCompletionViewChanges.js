import { Empty } from "../../../shared/proto/common";
/**
 * Shows task completion changes in a diff view
 * @param controller The controller instance
 * @param request The request containing the timestamp of the message
 * @returns Empty response
 */
export async function taskCompletionViewChanges(controller, request) {
    try {
        if (request.value && controller.task) {
            await controller.task.presentMultifileDiff(request.value, true);
        }
        return Empty.create();
    }
    catch (error) {
        console.error("Error in taskCompletionViewChanges handler:", error);
        throw error;
    }
}
//# sourceMappingURL=taskCompletionViewChanges.js.map