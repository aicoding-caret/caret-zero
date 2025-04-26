import React, { memo, useEffect, useRef } from "react"
import { CaretMessage } from "../../../../src/shared/ExtensionMessage"
import deepEqual from "fast-deep-equal"
import ChatRowContent from "./ChatRowContent"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { vscode } from "../../utils/vscode"
import styled from "styled-components"

// 채팅 행 컨테이너
const ChatRowContainer = styled.div`
	position: relative;
	padding: 10px 15px;
	transition: background-color 0.2s ease;
	
	&:hover {
		background-color: rgba(128, 128, 128, 0.05);
	}
`

interface ChatRowProps {
	message: CaretMessage
	isLast: boolean
	isExpanded: boolean
	onToggleExpand: () => void
	lastModifiedMessage?: CaretMessage
	onHeightChange: (isTaller: boolean) => void
}

const ChatRow = memo(
	({ message, isLast, isExpanded, onToggleExpand, lastModifiedMessage, onHeightChange }: ChatRowProps) => {
		const heightRef = useRef<HTMLDivElement>(null);
		const prevHeightRef = useRef(0);

		// 높이 변화 감지
		useEffect(() => {
			if (heightRef.current && isLast) {
				const safeHeight = heightRef.current.getBoundingClientRect().height;
				const isInitialRender = prevHeightRef.current === 0;

				if (safeHeight > 0 && safeHeight !== Infinity && safeHeight !== prevHeightRef.current) {
					if (!isInitialRender) {
						onHeightChange(safeHeight > prevHeightRef.current);
					}
					prevHeightRef.current = safeHeight;
				}
			}
		}, [isLast, message, onHeightChange]);

		// 체크포인트 표시 여부 검사
		const shouldAddCheckpointControls =
			message.type === "ask" &&
			(message.ask === "command" ||
				message.ask === "command_output" ||
				message.ask === "tool" ||
				message.ask === "browser_action_launch" ||
				message.ask === "use_mcp_server")

		// 메인 렌더링 내용
		return (
			<div ref={heightRef} data-testid="chat-row">
				<ChatRowContainer>
					{shouldAddCheckpointControls && (
						<div
							style={{
								position: "absolute",
								top: 0,
								right: "10px",
								display: "flex",
								flexDirection: "row",
								gap: "5px",
								zIndex: 100,
							}}>
							<VSCodeButton
								appearance="icon"
								onClick={() => {
									vscode.postMessage({
										type: "takeCheckpoint",
										messageTs: message.ts,
									})
								}}>
								<span className="codicon codicon-symbol-field"></span>
							</VSCodeButton>
						</div>
					)}
					<ChatRowContent
						message={message}
						isExpanded={isExpanded}
						onToggleExpand={onToggleExpand}
						lastModifiedMessage={lastModifiedMessage}
						isLast={isLast}
					/>
				</ChatRowContainer>
			</div>
		)
	},
	deepEqual
)

export default ChatRow
