import styled from "styled-components"

export const ChatContainer = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	overflow: hidden;
`

export const MessageListContainer = styled.div`
	flex: 1 1 auto;
	min-height: 0;
	position: relative;
`

export const ScrollToBottomButton = styled.button`
	background: var(--vscode-button-background);
	color: var(--vscode-button-foreground);
	border: none;
	border-radius: 4px;
	padding: 8px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.2s;

	&:hover {
		background: var(--vscode-button-hoverBackground);
	}
`

export const RetryStatusContainer = styled.div`
	background: var(--vscode-editor-background);
	border: 1px solid var(--vscode-errorForeground);
	border-radius: 4px;
	margin: 10px;
	padding: 10px;
`

export const RetryStatusHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	color: var(--vscode-errorForeground);
	font-weight: bold;
`

export const RetryStatusInfo = styled.div`
	margin-top: 8px;
	color: var(--vscode-foreground);
`

export const RetryStatusProgress = styled.div`
	margin-top: 8px;
	height: 4px;
	background: var(--vscode-progressBar-background);
	border-radius: 2px;
	overflow: hidden;
`

export const RetryStatusProgressBar = styled.div<{ progress: number }>`
	height: 100%;
	width: ${(props) => props.progress}%;
	background: var(--vscode-progressBar-foreground);
	transition: width 0.1s linear;
`

export const ApiErrorContainer = styled.div`
	background: var(--vscode-editor-background);
	border: 1px solid var(--vscode-errorForeground);
	border-radius: 4px;
	margin: 10px;
	padding: 10px;
	display: flex;
	align-items: center;
	gap: 8px;
`

export const ApiErrorIcon = styled.div`
	color: var(--vscode-errorForeground);
`

export const ApiErrorInfo = styled.div`
	color: var(--vscode-foreground);
`

export const ModeSelectorContainer = styled.div`
	display: flex;
	gap: 8px;
	padding: 0 10px;
	margin-bottom: 10px;
`

export const ModeButton = styled.button<{ appearance: "primary" | "secondary" | "icon" }>`
	background: ${(props) =>
		props.appearance === "primary"
			? "var(--vscode-button-background)"
			: props.appearance === "icon"
			? "transparent"
			: "var(--vscode-button-secondaryBackground)"};
	color: ${(props) =>
		props.appearance === "primary"
			? "var(--vscode-button-foreground)"
			: props.appearance === "icon"
			? "var(--vscode-foreground)"
			: "var(--vscode-button-secondaryForeground)"};
	border: none;
	border-radius: 4px;
	padding: ${(props) => (props.appearance === "icon" ? "4px" : "6px 12px")};
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.2s;

	&:hover {
		background: ${(props) =>
			props.appearance === "primary"
				? "var(--vscode-button-hoverBackground)"
				: props.appearance === "icon"
				? "var(--vscode-toolbar-hoverBackground)"
				: "var(--vscode-button-secondaryHoverBackground)"};
	}
`

export const SettingsButton = styled(ModeButton)`
	padding: 4px;
` 