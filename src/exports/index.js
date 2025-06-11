import { getGlobalState } from "@core/storage/state";
import { sendChatButtonClickedEvent } from "@core/controller/ui/subscribeToChatButtonClicked";
export function createClineAPI(outputChannel, sidebarController) {
    const api = {
        setCustomInstructions: async (value) => {
            await sidebarController.updateCustomInstructions(value);
            outputChannel.appendLine("Custom instructions set");
        },
        getCustomInstructions: async () => {
            return (await getGlobalState(sidebarController.context, "customInstructions"));
        },
        startNewTask: async (task, images) => {
            outputChannel.appendLine("Starting new task");
            await sidebarController.clearTask();
            await sidebarController.postStateToWebview();
            await sendChatButtonClickedEvent(sidebarController.id);
            await sidebarController.initTask(task, images);
            outputChannel.appendLine(`Task started with message: ${task ? `"${task}"` : "undefined"} and ${images?.length || 0} image(s)`);
        },
        sendMessage: async (message, images) => {
            outputChannel.appendLine(`Sending message: ${message ? `"${message}"` : "undefined"} with ${images?.length || 0} image(s)`);
            if (sidebarController.task) {
                await sidebarController.task.handleWebviewAskResponse("messageResponse", message || "", images || []);
            }
            else {
                outputChannel.appendLine("No active task to send message to");
            }
        },
        pressPrimaryButton: async () => {
            outputChannel.appendLine("Pressing primary button");
            if (sidebarController.task) {
                await sidebarController.task.handleWebviewAskResponse("yesButtonClicked", "", []);
            }
            else {
                outputChannel.appendLine("No active task to press button for");
            }
        },
        pressSecondaryButton: async () => {
            outputChannel.appendLine("Pressing secondary button");
            if (sidebarController.task) {
                await sidebarController.task.handleWebviewAskResponse("noButtonClicked", "", []);
            }
            else {
                outputChannel.appendLine("No active task to press button for");
            }
        },
    };
    return api;
}
//# sourceMappingURL=index.js.map