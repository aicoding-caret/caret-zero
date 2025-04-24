import React from "react"
import { CaretMessage } from "../../../../../src/shared/ExtensionMessage"

interface McpRendererProps {
	/** MCP uba54uc2dcuc9c0 */
	message: CaretMessage
	/** uc81cubaa9ud574uc11c ud45cuc2dcud560 ud0c0uc774ud2c0 */
	title?: string
	/** ub9c8uc9c0ub9c9 uc218uc815ub41c uba54uc2dcuc9c0 */
	lastModifiedMessage?: CaretMessage
	/** uba54uc2dcuc9c0uac00 ub9c8uc9c0ub9c9uc778uc9c0 uc5ecubd80 */
	isLast?: boolean
}

/**
 * MCP(Media Content Processing) uba54uc2dcuc9c0 ub80cub354ub7ec
 * ud604uc7acb uc791uc5c5 uc911 - ucc44uac00 ub9acud329ud1a0ub9c1 uc911uc784
 */
const McpRenderer: React.FC<McpRendererProps> = ({ message, title }) => {
	const headerStyle = {
		display: "flex",
		alignItems: "center",
		marginBottom: 6,
		fontSize: 13,
		color: "var(--vscode-descriptionForeground)",
	}

	const iconStyle = {
		color: "var(--vscode-charts-purple)",
		marginRight: 6,
	}

	// MCP uba54uc2dcuc9c0 ud0c0uc785uc5d0 ub530ub978 uac04ub2e8ud55c ub80cub354ub9c1
	if (message.type === "ask" && message.ask === "use_mcp_server") {
		return (
			<div>
				{title && (
					<div style={headerStyle}>
						<i className="codicon codicon-server-process" style={iconStyle}></i>
						<span>{title}</span>
					</div>
				)}
				<div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
					MCP 요청
				</div>
				<pre style={{ backgroundColor: "var(--vscode-editor-background)", padding: "8px", borderRadius: "4px", overflow: "auto" }}>
					{message.text}
				</pre>
			</div>
		)
	}

	if (message.type === "say" && message.say === "use_mcp_server") {
		return (
			<div>
				{title && (
					<div style={headerStyle}>
						<i className="codicon codicon-server-process" style={iconStyle}></i>
						<span>{title}</span>
					</div>
				)}
				<div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
					MCP 응답
				</div>
				<pre style={{ backgroundColor: "var(--vscode-editor-background)", padding: "8px", borderRadius: "4px", overflow: "auto" }}>
					{message.text}
				</pre>
			</div>
		)
	}

	// uc77cuce58ud558ub294 uba54uc2dcuc9c0 ud0c0uc785uc774 uc5c6ub294 uacbduc6b0
	return <div>Unsupported message type for MCP renderer</div>
}

export default McpRenderer
