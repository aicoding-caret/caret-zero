import React, { useState } from "react"
import { CaretMessage } from "../../../../../src/shared/ExtensionMessage"
import { COMPLETION_RESULT_CHANGES_FLAG } from "../../../../../src/shared/ExtensionMessage"
import MarkdownBlock from "../../common/MarkdownBlock"
import SuccessButton from "../../common/SuccessButton"
import { vscode } from "../../../utils/vscode"
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react"

interface CompletionRendererProps {
	/** AI uacb0uacfc uba54uc2dcuc9c0 */
	message: CaretMessage
	/** uc81cubaa9ud574uc11c ud45cuc2dcud560 ud0c0uc774ud2c0 */
	title?: string
	/** ub9c8uc9c0ub9c9 uc218uc815ub41c uba54uc2dcuc9c0 */
	lastModifiedMessage?: CaretMessage
	/** uba54uc2dcuc9c0uac00 ub9c8uc9c0ub9c9uc778uc9c0 uc5ecubd80 */
	isLast?: boolean
}

/**
 * AI uc751ub2f5 uacb0uacfc uba54uc2dcuc9c0 ub80cub354ub7ec
 */
const CompletionRenderer: React.FC<CompletionRendererProps> = ({ message, title, lastModifiedMessage, isLast }) => {
	// uc0c8 ubcc0uacbduc0acud56d ud655uc778 ubc84ud2bc ube44ud65cuc131ud654 uc0c1ud0dc
	const [seeNewChangesDisabled, setSeeNewChangesDisabled] = useState(false)

	const headerStyle = {
		display: "flex",
		alignItems: "center",
		marginBottom: 6,
		fontSize: 13,
		color: "var(--vscode-descriptionForeground)",
	}

	const icon = (
		<i
			className={"codicon codicon-comment"}
			style={{
				color: "var(--vscode-charts-green)",
				marginRight: 6,
			}}
		/>
	)

	// thinking uc0c1ud0dc ud45cuc2dc
	if (message.type === "ask" && message.ask === "completion_result") {
		if (message.text?.trim()) {
			return (
				<div>
					{title && <div style={headerStyle}>{icon}{title}</div>}
					<div style={{
						wordBreak: "break-word",
						overflowWrap: "anywhere",
						marginBottom: -15,
						marginTop: -15,
					}}>
						<MarkdownBlock markdown={message.text} />
					</div>
				</div>
			)
		} else {
			// thinking uba54uc2dcuc9c0uc778ub370 ud14duc2a4ud2b8uac00 uc5c6ub294 uacbduc6b0
			return (
				<div>
					{title && <div style={headerStyle}>{icon}{title}</div>}
					<div style={{ display: "flex", alignItems: "center" }}>
						<div 
							style={{
								width: "16px",
								height: "16px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								marginRight: "8px"
							}}
						>
							<div style={{ transform: "scale(0.55)", transformOrigin: "center" }}>
								<VSCodeProgressRing />
							</div>
						</div>
						<span style={{ color: "var(--vscode-descriptionForeground)" }}>
							Thinking...
						</span>
					</div>
				</div>
			)
		}
	}

	// uc644ub8cc uacb0uacfc uba54uc2dcuc9c0 (sayuc778 uacbduc6b0)
	if (message.type === "say" && message.say === "completion_result") {
		const text = message.text || ""
		const hasChanges = text.includes(COMPLETION_RESULT_CHANGES_FLAG)

		// uc0c8 ubcc0uacbduc0acud56d ud655uc778 ubc84ud2bc ucc98ub9ac
		const handleSeeNewChanges = () => {
			setSeeNewChangesDisabled(true)
			vscode.postMessage({
				type: "optionsResponse",
				text: "seeNewChanges",
				number: message.ts,
			})
		}

		// ud0c0uc774ud2c0 ucc98ub9ac - ubcc0uacbduc0acud56duc774 uc788ub294 uacbduc6b0 ud45cuc2dc
		const displayTitle = hasChanges 
			? "AI Response (with file changes)" 
			: title

		return (
			<div>
				{displayTitle && <div style={headerStyle}>{icon}{displayTitle}</div>}
				<div style={{ position: "relative" }}>
					<div style={{
						wordBreak: "break-word",
						overflowWrap: "anywhere",
						marginBottom: -15,
						marginTop: -15,
					}}>
						<MarkdownBlock markdown={text.replace(COMPLETION_RESULT_CHANGES_FLAG, "")} />
					</div>

					{/* uc0c8 ubcc0uacbduc0acud56d ud655uc778 ubc84ud2bc */}
					{hasChanges && isLast && (
						<div style={{ marginTop: 10, display: "flex", justifyContent: "flex-start" }}>
							<SuccessButton
								style={{ marginRight: "10px" }}
								onClick={handleSeeNewChanges}
								disabled={seeNewChangesDisabled || isLast !== true}
							>
								<i
									className="codicon codicon-new-file"
									style={{
										marginRight: 6,
										cursor: seeNewChangesDisabled ? "wait" : "pointer",
									}}
								/>
								See new changes
							</SuccessButton>
						</div>
					)}
				</div>
			</div>
		)
	}

	// uc77cuce58ud558ub294 uba54uc2dcuc9c0 ud0c0uc785uc774 uc5c6ub294 uacbduc6b0
	return <div>Unsupported message type for completion renderer</div>
}

export default CompletionRenderer
