import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { ApiConfiguration } from "../../../../../src/shared/api"

interface VSCodeLmOptionsProps {
	apiConfiguration?: ApiConfiguration
	setApiConfiguration: (config: ApiConfiguration) => void
	DROPDOWN_Z_INDEX: number
}

interface VSCodeLmModel {
	vendor: string
	family: string
}

export const VSCodeLmOptions = ({ 
	apiConfiguration, 
	setApiConfiguration,
	DROPDOWN_Z_INDEX
}: VSCodeLmOptionsProps) => {
	return (
		<div>
			<div className="dropdown-container" style={{position: "relative", zIndex: DROPDOWN_Z_INDEX - 2}}>
				<label htmlFor="vscode-lm-model">
					<span style={{ fontWeight: 500 }}>Language Model</span>
				</label>
				<p
					style={{
						fontSize: "12px",
						marginTop: "5px",
						color: "var(--vscode-descriptionForeground)",
					}}>
					The VS Code Language Model API allows you to run models provided by other VS Code extensions
					(including but not limited to GitHub Copilot). The easiest way to get started is to install the
					Copilot extension from the VS Marketplace and enabling Claude 3.7 Sonnet.
				</p>
				<p
					style={{
						fontSize: "12px",
						marginTop: "5px",
						color: "var(--vscode-descriptionForeground)",
						fontWeight: 500,
					}}>
					Note: This is a very experimental integration and may not work as expected.
				</p>
			</div>
		</div>
	)
}
