import { Empty } from "@shared/proto/common"
import type { Controller } from "../index"
import { McpMarketplaceCatalog } from "@shared/mcp"
import { getGlobalState } from "@core/storage/state"

/**
 * RPC handler for refreshing the MCP marketplace
 * @param controller The controller instance
 * @param _request Empty request
 * @returns Catalog response
 */
export async function refreshMcpMarketplace(controller: Controller, _request: Empty): Promise<McpMarketplaceCatalog> {
	await controller.silentlyRefreshMcpMarketplace()
	const catalog = (await getGlobalState(controller.context, "mcpMarketplaceCatalog")) as
		| McpMarketplaceCatalog
		| undefined
	return catalog || { items: [] }
}
