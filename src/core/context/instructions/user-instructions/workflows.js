import path from "path";
import { GlobalFileNames, ensureWorkflowsDirectoryExists } from "@core/storage/disk";
import { getWorkspaceState, updateWorkspaceState, getGlobalState, updateGlobalState } from "@core/storage/state";
import { synchronizeRuleToggles } from "@core/context/instructions/user-instructions/rule-helpers";
/**
 * Refresh the workflow toggles
 */
export async function refreshWorkflowToggles(context, workingDirectory) {
    // Global workflows
    const globalWorkflowToggles = (await getGlobalState(context, "globalWorkflowToggles")) || {};
    const globalClineWorkflowsFilePath = await ensureWorkflowsDirectoryExists();
    const updatedGlobalWorkflowToggles = await synchronizeRuleToggles(globalClineWorkflowsFilePath, globalWorkflowToggles);
    await updateGlobalState(context, "globalWorkflowToggles", updatedGlobalWorkflowToggles);
    const workflowRulesToggles = (await getWorkspaceState(context, "workflowToggles")) || {};
    const workflowsDirPath = path.resolve(workingDirectory, GlobalFileNames.workflows);
    const updatedWorkflowToggles = await synchronizeRuleToggles(workflowsDirPath, workflowRulesToggles);
    await updateWorkspaceState(context, "workflowToggles", updatedWorkflowToggles);
    return {
        globalWorkflowToggles: updatedGlobalWorkflowToggles,
        localWorkflowToggles: updatedWorkflowToggles,
    };
}
//# sourceMappingURL=workflows.js.map