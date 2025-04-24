import React from "react"
import { CaretMessage } from "../../../../../src/shared/ExtensionMessage"
import MarkdownBlock from "../../common/MarkdownBlock"

interface BaseRendererProps {
	/** uba54uc2dcuc9c0 */
	message: CaretMessage
	/** uc81cubaa9ud574uc11c ud45cuc2dcud560 ud0c0uc774ud2c0 */
	title?: string
	/** ub9c8ud06cub2e4uc6b4uc73cub85c ud45cuc2dc (falseuc778 uacbduc6b0 uadfcuc808ud14duc2a4ud2b8) */
	usesMarkdown?: boolean
}

/**
 * uae30ubcf8 ud14duc2a4ud2b8 ubc0f ub9c8ud06cub2e4uc6b4 ub80cub354ub7ec
 * ub2e4ub978 ud2b9ubcc4ud55c ub80cub354ub7ecub85c ucc98ub9acub418uc9c0 uc54aucb4c uae30ubcf8 uc5d0 ub300ud55c uc5f0uc2ecub9dduc774
 */
const BaseRenderer: React.FC<BaseRendererProps> = ({ message, title, usesMarkdown = true }) => {
	const headerStyle = {
		display: "flex",
		alignItems: "center",
		marginBottom: 6,
		fontSize: 13,
		color: "var(--vscode-descriptionForeground)",
	}

	const icon = (
		<i
			className={"codicon codicon-comment-discussion"}
			style={{
				color: "var(--vscode-foreground)",
				marginRight: 6,
			}}
		/>
	)

	const content = message.text || ""

	return (
		<div>
			{title && <div style={headerStyle}>{icon}{title}</div>}
			{usesMarkdown ? (
				<div style={{
					wordBreak: "break-word",
					overflowWrap: "anywhere",
					marginBottom: -15,
					marginTop: -15,
				}}>
					<MarkdownBlock markdown={content} />
				</div>
			) : (
				<div style={{
					whiteSpace: "pre-wrap",
					wordBreak: "break-word",
					overflowWrap: "anywhere",
				}}>
					{content}
				</div>
			)}
		</div>
	)
}

export default BaseRenderer
