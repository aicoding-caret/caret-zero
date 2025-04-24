import React from "react"
import { CaretMessage } from "../../../../../src/shared/ExtensionMessage"
import { parseFollowupMessage, parsePlanModeResponse } from "../chat_utils/messageParser"
import MarkdownBlock from "../../common/MarkdownBlock"
import { OptionsButtons } from "../OptionsButtons"

interface UserInteractionRendererProps {
	/** uc0acuc6a9uc790 uc0c1ud638uc791uc6a9 uba54uc2dcuc9c0 */
	message: CaretMessage
	/** uc81cubaa9ud574uc11c ud45cuc2dcud560 ud0c0uc774ud2c0 */
	title?: string
	/** ub9c8uc9c0ub9c9 uc218uc815ub41c uba54uc2dcuc9c0 */
	lastModifiedMessage?: CaretMessage
	/** uba54uc2dcuc9c0uac00 ub9c8uc9c0ub9c9uc778uc9c0 uc5ecubd80 */
	isLast?: boolean
}

/**
 * followup, plan_mode_respond, user_feedback ub4f1 uc0acuc6a9uc790 uc0c1ud638uc791uc6a9 uba54uc2dcuc9c0 ub80cub354ub7ec
 */
const UserInteractionRenderer: React.FC<UserInteractionRendererProps> = ({ message, title, lastModifiedMessage, isLast }) => {
	const headerStyle = {
		display: "flex",
		alignItems: "center",
		marginBottom: 6,
		fontSize: 13,
		color: "var(--vscode-descriptionForeground)",
	}

	const icon = (
		<i
			className={"codicon codicon-account"}
			style={{
				color: "var(--vscode-charts-orange)",
				marginRight: 6,
			}}
		/>
	)

	// followup uba54uc2dcuc9c0 (uc9c8ubb38uacfc uc120ud0dd uc635uc158)
	if (message.type === "ask" && message.ask === "followup") {
		const { question, options, selected } = parseFollowupMessage(message)
		
		return (
			<>
				{title && (
					<div style={headerStyle}>
						{icon}
						{title}
					</div>
				)}
				<div style={{ paddingTop: 10 }}>
					<div style={{
						wordBreak: "break-word",
						overflowWrap: "anywhere",
						marginBottom: -15,
						marginTop: -15,
					}}>
						<MarkdownBlock markdown={question} />
					</div>
					<OptionsButtons
						options={options}
						selected={selected}
						isActive={isLast && lastModifiedMessage?.ask === "followup"}
					/>
				</div>
			</>
		)
	}
	
	// plan_mode_respond uba54uc2dcuc9c0
	if (message.type === "ask" && message.ask === "plan_mode_respond") {
		const { response, options, selected } = parsePlanModeResponse(message)
		
		return (
			<div>
				<div style={{
					wordBreak: "break-word",
					overflowWrap: "anywhere",
					marginBottom: -15,
					marginTop: -15,
				}}>
					<MarkdownBlock markdown={response} />
				</div>
				<OptionsButtons
					options={options}
					selected={selected}
					isActive={isLast && lastModifiedMessage?.ask === "plan_mode_respond"}
				/>
			</div>
		)
	}
	
	// user_feedback uba54uc2dcuc9c0
	if (message.type === "say" && message.say === "user_feedback") {
		return (
			<div>
				{title && <div style={headerStyle}>{icon}{title}</div>}
				<div style={{
					wordBreak: "break-word",
					overflowWrap: "anywhere",
					backgroundColor: "var(--vscode-editor-inactiveSelectionBackground)",
					padding: "8px 12px",
					borderRadius: "6px",
					marginBottom: 4,
				}}>
					<div style={{
						wordBreak: "break-word",
						overflowWrap: "anywhere",
						marginBottom: -15,
						marginTop: -15,
					}}>
						<MarkdownBlock markdown={message.text} />
					</div>
				</div>
			</div>
		)
	}

	// uc77cuce58ud558ub294 uba54uc2dcuc9c0 ud0c0uc785uc774 uc5c6ub294 uacbduc6b0
	return <div>Unsupported message type for user interaction renderer</div>
}

export default UserInteractionRenderer
