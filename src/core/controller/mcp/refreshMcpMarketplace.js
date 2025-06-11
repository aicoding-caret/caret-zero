import { McpMarketplaceCatalog } from "../../../shared/proto/mcp";
/**
 * RPC handler that silently refreshes the MCP marketplace catalog
 * @param controller Controller instance
 * @param _request Empty request
 * @returns MCP marketplace catalog
 */
export async function refreshMcpMarketplace(controller, _request) {
    try {
        // Call the RPC variant which returns the result directly
        const catalog = await controller.silentlyRefreshMcpMarketplaceRPC();
        if (catalog) {
            // Types are structurally identical, use direct type assertion
            return catalog;
        }
        // Return empty catalog if nothing was fetched
        return McpMarketplaceCatalog.create({ items: [] });
    }
    catch (error) {
        console.error("Failed to refresh MCP marketplace:", error);
        return McpMarketplaceCatalog.create({ items: [] });
    }
}
//# sourceMappingURL=refreshMcpMarketplace.js.map