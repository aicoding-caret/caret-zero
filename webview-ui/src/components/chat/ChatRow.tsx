import React, { useRef, useLayoutEffect, useState, memo, useEffect } from "react"
import { CaretMessage } from "../../../../src/shared/ExtensionMessage"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { isAiMessage, isUserMessage, getMessageTypeText } from "./chat_utils/messageParser"
import ChatRowContent from "./ChatRowContent"
import { MessageRowContainer, ChatRowContainer } from "./chat_ui/MessageContainer"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { vscode } from "../../utils/vscode"

/**
 * ucc44ud305 ud589 ucef4ud3ecub10cud2b8 - uba54uc2dcuc9c0 ud45cuc2dc ubc0f ub192uc774 uace0ucd94
 */
const ChatRow = memo((props: { 
	message: CaretMessage; 
	isExpanded: boolean; 
	onToggleExpand: () => void; 
	lastModifiedMessage?: CaretMessage; 
	isLast?: boolean;
	onHeightChange: (isTaller: boolean) => void;
}) => {
	const { message, isExpanded, onHeightChange } = props
	const messageRef = useRef<HTMLDivElement>(null)
	const [height, setHeight] = useState<number | null>(null)
	const [node, setNode] = useState<HTMLDivElement | null>(null)
	// 이전 높이를 기록하기 위한 ref
	const prevHeightRef = useRef<number | null>(null)

	// ucc98ube60uc2dcube0cuacfcuc778ud2b8 ud45cuac10 uac00ubd80 uacc0uc0ac
	const shouldShowCheckpoints = message.lastCheckpointHash != null &&
		(message.say === "tool" ||
			message.ask === "tool" ||
			message.say === "command" ||
			message.ask === "command" ||
			message.say === "use_mcp_server" ||
			message.ask === "use_mcp_server")

	useLayoutEffect(() => {
		if (node !== messageRef.current) {
			setNode(messageRef.current)
		}
	}, [messageRef.current])

	useLayoutEffect(() => {
		if (node) {
			// getScrollHeight ub300uc2e0 getBoundingClientRect uc0acuc6a9
			const newHeight = node.getBoundingClientRect().height
			setHeight(newHeight || null)
		}
	}, [node, message, isExpanded])

	// 높이 변경 감지 및 이벤트 발생
	useEffect(() => {
		if (height !== null && prevHeightRef.current !== null && height !== prevHeightRef.current) {
			const isTaller = height > prevHeightRef.current
			onHeightChange(isTaller)
		}
		prevHeightRef.current = height

		// 마지막 메시지 변경 이벤트 발생
		if (props.isLast) {
			window.dispatchEvent(new CustomEvent("last-message-changed", { detail: { message } }))
		}
	}, [height, props.isLast, onHeightChange, message])

	const chatrow = (
		<ChatRowContainer>
			{shouldShowCheckpoints && message.lastCheckpointHash && (
				<div style={{ 
					position: 'absolute', 
					top: '3px', 
					right: '6px', 
					display: 'flex',
					gap: '6px'
				}}>
					<VSCodeButton
						title="Compare"
						appearance="secondary"
						style={{ cursor: "pointer", width: '24px', height: '24px' }}
						onClick={() => {
							vscode.postMessage({
								type: "checkpointDiff",
								text: message.lastCheckpointHash
							})
						}}>
						<i className="codicon codicon-diff-multiple" style={{ position: "absolute" }} />
					</VSCodeButton>
				</div>
			)}
			<ChatRowContent message={message} isExpanded={isExpanded} onToggleExpand={props.onToggleExpand} 
				lastModifiedMessage={props.lastModifiedMessage} isLast={props.isLast || false} />
		</ChatRowContainer>
	)

	return (
		<div
			ref={messageRef}
			data-testid="chat-row"
			style={{ height: !node || !height || isExpanded ? "auto" : `${height}px` }}
		>
			{chatrow}
		</div>
	)
}, (prevProps, nextProps) => {
	// uba54uc2dcuc9c0 uac1duccb4uac00 ub3d9uc77cud558uace0 ud655uc7a5 uc0c1ud0dcuac00 ubcc0uacbdub418uc9c0 uc54auC58ub2e4uba74 ub9acub80cub354ub9c1 ubc29uc9c0
	return (
		prevProps.message === nextProps.message &&
		prevProps.isExpanded === nextProps.isExpanded &&
		prevProps.lastModifiedMessage === nextProps.lastModifiedMessage
	)
})

export default ChatRow
