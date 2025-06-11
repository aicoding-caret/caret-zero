import { McpServers } from "@shared/proto/mcp";
import { convertMcpServersToProtoMcpServers } from "@shared/proto-conversions/mcp/mcp-server-conversion";
/**
 * Restarts an MCP server connection
 * @param controller The controller instance
 * @param request The request containing the server name
 * @returns The updated list of MCP servers
 */
export async function restartMcpServer(controller, request) {
    try {
        const mcpServers = await controller.mcpHub?.restartConnectionRPC(request.value);
        // Convert from McpServer[] to ProtoMcpServer[] ensuring all required fields are set
        const protoServers = convertMcpServersToProtoMcpServers(mcpServers);
        return McpServers.create({ mcpServers: protoServers });
    }
    catch (error) {
        console.error(`Failed to restart MCP server ${request.value}:`, error);
        throw error;
    }
}
//# sourceMappingURL=restartMcpServer.js.map