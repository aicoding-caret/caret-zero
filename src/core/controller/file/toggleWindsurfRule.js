import { ClineRulesToggles } from "../../../shared/proto/file";
import { getWorkspaceState, updateWorkspaceState } from "../../../core/storage/state";
/**
 * Toggles a Windsurf rule (enable or disable)
 * @param controller The controller instance
 * @param request The toggle request
 * @returns The updated Windsurf rule toggles
 */
export async function toggleWindsurfRule(controller, request) {
    const { rulePath, enabled } = request;
    if (!rulePath || typeof enabled !== "boolean") {
        console.error("toggleWindsurfRule: Missing or invalid parameters", {
            rulePath,
            enabled: typeof enabled === "boolean" ? enabled : `Invalid: ${typeof enabled}`,
        });
        throw new Error("Missing or invalid parameters for toggleWindsurfRule");
    }
    // Update the toggles
    const toggles = (await getWorkspaceState(controller.context, "localWindsurfRulesToggles")) || {};
    toggles[rulePath] = enabled;
    await updateWorkspaceState(controller.context, "localWindsurfRulesToggles", toggles);
    // Return the toggles directly
    return ClineRulesToggles.create({ toggles: toggles });
}
//# sourceMappingURL=toggleWindsurfRule.js.map