import { convertMcpServersToProtoMcpServers } from "@/shared/proto-conversions/mcp/mcp-server-conversion"
import { McpServers } from "../../../shared/proto/mcp"
/**
 * Adds a new remote MCP server via gRPC
 * @param controller The controller instance
 * @param request The request containing server name and URL
 * @returns An array of McpServer objects
 */
export async function addRemoteMcpServer(controller, request) {
	try {
		// Validate required fields
		if (!request.serverName) {
			throw new Error("Server name is required")
		}
		if (!request.serverUrl) {
			throw new Error("Server URL is required")
		}
		// Call the McpHub method to add the remote server
		const servers = await controller.mcpHub?.addRemoteServer(request.serverName, request.serverUrl)
		const protoServers = convertMcpServersToProtoMcpServers(servers)
		return McpServers.create({ mcpServers: protoServers })
	} catch (error) {
		console.error(`Failed to add remote MCP server ${request.serverName}:`, error)
		throw error
	}
}
//# sourceMappingURL=addRemoteMcpServer.js.map
