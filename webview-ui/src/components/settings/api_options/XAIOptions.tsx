import { VSCodeTextField, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { ApiConfiguration } from "../../../../../src/shared/api"

interface XAIOptionsProps {
	apiConfiguration?: ApiConfiguration
	setApiConfiguration: (config: ApiConfiguration) => void
}

export const XAIOptions = ({ apiConfiguration, setApiConfiguration }: XAIOptionsProps) => {
	const handleInputChange = (field: keyof ApiConfiguration) => (event: any) => {
		setApiConfiguration({
			...apiConfiguration,
			[field]: event.target.value,
		})
	}

	return (
		<div>
			<VSCodeTextField
				value={apiConfiguration?.xaiApiKey || ""}
				style={{ width: "100%" }}
				type="password"
				onInput={handleInputChange("xaiApiKey")}
				placeholder="Enter API Key...">
				<span style={{ fontWeight: 500 }}>X AI API Key</span>
			</VSCodeTextField>
			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				This key is stored locally and only used to make API requests from this extension.
				{!apiConfiguration?.xaiApiKey && (
					<VSCodeLink href="https://x.ai" style={{ display: "inline", fontSize: "inherit" }}>
						You can get an X AI API key by signing up here.
					</VSCodeLink>
				)}
			</p>
			{/* Note: To fully implement this, you would need to add a handler in CaretProvider.ts */}
			{/* {apiConfiguration?.xaiApiKey && (
				<button
					onClick={() => {
						vscode.postMessage({
							type: "requestXAIModels",
							text: apiConfiguration?.xaiApiKey,
						})
					}}
					style={{ margin: "5px 0 0 0" }}
					className="vscode-button">
					Fetch Available Models
				</button>
			)} */}
		</div>
	)
}
