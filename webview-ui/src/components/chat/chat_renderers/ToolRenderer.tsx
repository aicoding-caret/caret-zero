import React from "react"
import { CaretMessage } from "../../../../../src/shared/ExtensionMessage"
import CodeBlock from "../../common/CodeBlock"
import { vscode } from "../../../utils/vscode"

interface ToolRendererProps {
	/** ub3c4uad6c uc694uccad uba54uc2dcuc9c0 */
	message: CaretMessage
	/** uc81cubaa9ud574uc11c ud45cuc2dcud560 ud0c0uc774ud2c0 */
	title?: string
	/** ub9c8uc9c0ub9c9 uc218uc815ub41c uba54uc2dcuc9c0 */
	lastModifiedMessage?: CaretMessage
	/** uba54uc2dcuc9c0uac00 ub9c8uc9c0ub9c9uc778uc9c0 uc5ecubd80 */
	isLast?: boolean
}

/**
 * ub3c4uad6c ud638ucd9c uc694uccad uba54uc2dcuc9c0 ub80cub354ub7ec
 */
const ToolRenderer: React.FC<ToolRendererProps> = ({ message, title }) => {
	// uc544uc774ucf58 uc2a4ud0c0uc77c uc124uc815
	const iconStyle = {
		color: "var(--vscode-charts-blue)",
		marginRight: 6,
	}

	// ud5e4ub354 uc2a4ud0c0uc77c uc124uc815
	const headerStyle = {
		display: "flex",
		alignItems: "center",
		marginBottom: 6,
		fontSize: 13,
		color: "var(--vscode-descriptionForeground)",
	}

	// ub3c4uad6c uc774ub984 ud655uc778 (uba54uc2dcuc9c0 ud0c0uc785uc5d0 ub530ub77c ub2e4ub984)
	let toolName = ""
	if (message.type === "say" && message.say === "tool") {
		toolName = message.text || ""
	} else if (message.type === "ask" && message.ask === "tool") {
		toolName = message.text || ""
	}

	// ub3c4uad6c uc694uccad (askuc778 uacbduc6b0)
	if (message.type === "ask" && message.ask === "tool") {
		const requestData = message.text || ""
		return (
			<div>
				<div style={headerStyle}>
					<i className="codicon codicon-tools" style={iconStyle}></i>
					<span>{title || `${toolName} 도구 요청`}</span>
				</div>
				<CodeBlock source={requestData} />
			</div>
		)
	}

	// ub3c4uad6c uc2e4ud589 uacb0uacfc (sayuc778 uacbduc6b0)
	if (message.type === "say" && message.say === "tool") {
		// 도구 결과 출력 데이터 추출
		let output = ""
		
		// text에 도구 결과가 직접 포함됨
		if (message.text) {
			output = message.text
		}

		return (
			<div>
				<div style={headerStyle}>
					<i className="codicon codicon-tools" style={iconStyle}></i>
					<span>{title || `${toolName} 도구 결과`}</span>
				</div>
				{output && (
					<CodeBlock source={output} />
				)}
			</div>
		)
	}

	// uc77cuce58ud558ub294 uba54uc2dcuc9c0 ud0c0uc785uc774 uc5c6ub294 uacbduc6b0
	return <div>Unsupported message type for tool renderer</div>
}

export default ToolRenderer
