import styled from "styled-components"
import { CODE_BLOCK_BG_COLOR } from "../common/CodeBlock"
import { vscode } from "../../utils/vscode"

const OptionButton = styled.button<{ isSelected?: boolean; isNotSelectable?: boolean }>`
	padding: 8px 12px;
	background: ${(props) => (props.isSelected ? "var(--vscode-focusBorder)" : CODE_BLOCK_BG_COLOR)};
	color: ${(props) => (props.isSelected ? "white" : "var(--vscode-input-foreground)")};
	border: 1px solid var(--vscode-editorGroup-border);
	border-radius: 4px;
	cursor: ${(props) => (props.isNotSelectable ? "default" : "pointer")};
	text-align: left;
	font-size: 12px;
	transition: all 0.2s ease;
	width: 100%;
	margin-bottom: 6px;

	${(props) =>
		!props.isNotSelectable &&
		`
		&:hover {
			background: var(--vscode-focusBorder);
			color: white;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		}
		&:active {
			transform: translateY(1px);
		}
	`}
`

const OptionsContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 6px;
	padding-top: 15px;
	width: 100%;
`

const OptionsHeader = styled.div`
	color: var(--vscode-descriptionForeground);
	font-size: 11px;
	margin-bottom: 8px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
`

export const OptionsButtons = ({
	options,
	selected,
	isActive,
	inputValue,
}: {
	options?: string[]
	selected?: string
	isActive?: boolean
	inputValue?: string
}) => {
	if (!options?.length) return null

	const hasSelected = selected !== undefined && options.includes(selected)

	const handleOptionSelect = (option: string) => {
		if (hasSelected) {
			return
		}

		const message = {
			type: "optionsResponse",
			text: option,
		}
		
		console.log("Sending options response:", message)
		
		vscode.postMessage(message)
	}

	return (
		<OptionsContainer>
			<OptionsHeader>
				{hasSelected ? "선택됨:" : "선택하세요:"}
			</OptionsHeader>
			{options.map((option, index) => (
				<OptionButton
					key={index}
					isSelected={option === selected}
					isNotSelectable={hasSelected}
					onClick={() => handleOptionSelect(option)}>
					{option}
				</OptionButton>
			))}
		</OptionsContainer>
	)
}
