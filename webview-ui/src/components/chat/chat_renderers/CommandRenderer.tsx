import React from "react"
import { CaretMessage } from "../../../../../src/shared/ExtensionMessage"
import { COMMAND_OUTPUT_STRING, COMMAND_REQ_APP_STRING } from "../../../../../src/shared/combineCommandSequences"
import CodeBlock from "../../common/CodeBlock"
import SuccessButton from "../../common/SuccessButton"
import { vscode } from "../../../utils/vscode"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

interface CommandRendererProps {
	/** uba85ub839 ud638ucd9c ubc0f uacb0uacfc uba54uc2dcuc9c0 */
	message: CaretMessage
	/** uc81cubaa9ud574uc11c ud45cuc2dcud560 ud0c0uc774ud2c0 */
	title?: string
	/** ub9c8uc9c0ub9c9 uc218uc815ub41c uba54uc2dcuc9c0 */
	lastModifiedMessage?: CaretMessage
	/** uba54uc2dcuc9c0uac00 ub9c8uc9c0ub9c9uc778uc9c0 uc5ecubd80 */
	isLast?: boolean
}

/**
 * uba85ub839 ud638ucd9c ubc0f uacb0uacfc uba54uc2dcuc9c0 ub80cub354ub7ec
 */
const CommandRenderer: React.FC<CommandRendererProps> = ({ message, title, lastModifiedMessage, isLast }) => {
	// 아이콘 설정
	const iconStyle = {
		color: "var(--vscode-charts-blue)",
		marginRight: 6,
	}

	// 헤더 스타일 설정
	const headerStyle = {
		display: "flex",
		alignItems: "center",
		marginBottom: 6,
		fontSize: 13,
		color: "var(--vscode-descriptionForeground)",
	}

	// 실행 가능한 명령 요청인지 여부 확인
	const isEnabled =
		!message.text?.startsWith(COMMAND_REQ_APP_STRING) ||
		(message.text.startsWith(COMMAND_REQ_APP_STRING) && isLast && lastModifiedMessage?.ts === message.ts)

	// 명령 요청과 출력을 구분하여 렌더링
	if (message.text?.startsWith(COMMAND_OUTPUT_STRING)) {
		return (
			<div>
				<div style={headerStyle}>
					<i className="codicon codicon-terminal" style={iconStyle}></i>
					<span>{title || "명령 출력"}</span>
				</div>
				<CodeBlock source={message.text?.replace(COMMAND_OUTPUT_STRING, "")} />
			</div>
		)
	} else {
		// 승인/거부 버튼 렌더링 (활성화된 경우만)
		const showButtons = isEnabled && isLast && message.text?.startsWith(COMMAND_REQ_APP_STRING)

		return (
			<div>
				<div style={headerStyle}>
					<i className="codicon codicon-terminal" style={iconStyle}></i>
					<span>{title || "명령 실행"}</span>
				</div>

				<CodeBlock source={message.text?.replace(COMMAND_REQ_APP_STRING, "")} />

				{showButtons && (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							marginTop: "10px",
							justifyContent: "flex-end",
						}}
					>
						<SuccessButton
							appearance="secondary"
							onClick={() => {
								vscode.postMessage({
									type: "optionsResponse",
									text: "reject",
									number: message.ts,
								})
							}}
						>
							<i
								className="codicon codicon-close"
								style={{
									marginRight: 6,
								}}
							/>
							취소
						</SuccessButton>
						<SuccessButton
							onClick={() => {
								vscode.postMessage({
									type: "optionsResponse",
									text: "approve",
									number: message.ts,
								})
							}}
						>
							<i
								className="codicon codicon-check"
								style={{
									marginRight: 6,
								}}
							/>
							실행
						</SuccessButton>
					</div>
				)}
			</div>
		)
	}
}

export default CommandRenderer
