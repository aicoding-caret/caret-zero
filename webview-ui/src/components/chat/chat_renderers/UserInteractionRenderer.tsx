import React from "react"
import { CaretMessage } from "../../../../../src/shared/ExtensionMessage"
import { parseFollowupMessage, parsePlanModeResponse } from "../chat_utils/messageParser"
import MarkdownBlock from "../../common/MarkdownBlock"
import { OptionsButtons } from "../OptionsButtons"

interface UserInteractionRendererProps {
	/** 사용자 상호작용 메시지 */
	message: CaretMessage
	/** 제목해서 표시할 타이틀 */
	title?: string
	/** 마지막 수정된 메시지 */
	lastModifiedMessage?: CaretMessage
	/** 메시지가 마지막인지 여부 */
	isLast?: boolean
}

/**
 * followup, plan_mode_respond, user_feedback 등 사용자 상호작용 메시지 렌더러
 */
const UserInteractionRenderer: React.FC<UserInteractionRendererProps> = ({ message, title, lastModifiedMessage, isLast }) => {
	// followup 메시지 (질문과 선택 옵션)
	if (message.type === "ask" && message.ask === "followup") {
		const { question, options, selected } = parseFollowupMessage(message)
		
		return (
			<>
				<div style={{ paddingTop: 6 }}>
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
	
	// plan_mode_respond 메시지
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
	
	// user_feedback 메시지
	if (message.type === "say" && message.say === "user_feedback") {
		return (
			<div>
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

	// 일치하는 메시지 타입이 없는 경우
	return null;
}

export default UserInteractionRenderer
