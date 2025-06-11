import { Empty } from "@shared/proto/common";
import { openFile as openFileIntegration } from "@integrations/misc/open-file";
/**
 * Opens the MCP settings file in the editor
 * @param controller The controller instance
 * @param _request Empty request
 * @returns Empty response
 */
export async function openMcpSettings(controller, _request) {
    const mcpSettingsFilePath = await controller.mcpHub?.getMcpSettingsFilePath();
    if (mcpSettingsFilePath) {
        await openFileIntegration(mcpSettingsFilePath);
    }
    return Empty.create();
}
//# sourceMappingURL=openMcpSettings.js.map