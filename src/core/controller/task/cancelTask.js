import { Empty } from "../../../shared/proto/common";
/**
 * Cancel the currently running task
 * @param controller The controller instance
 * @param _request The empty request
 * @returns Empty response
 */
export async function cancelTask(controller, _request) {
    await controller.cancelTask();
    return Empty.create();
}
//# sourceMappingURL=cancelTask.js.map