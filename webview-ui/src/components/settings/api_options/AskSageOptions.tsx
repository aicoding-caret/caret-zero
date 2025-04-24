import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { ApiConfiguration } from "../../../../../src/shared/api"

interface AskSageOptionsProps {
	apiConfiguration?: ApiConfiguration
	setApiConfiguration: (config: ApiConfiguration) => void
}

// Default URL for AskSage API
const askSageDefaultURL = "https://api.asksage.ai"

export const AskSageOptions = ({ apiConfiguration, setApiConfiguration }: AskSageOptionsProps) => {
	const handleInputChange = (field: keyof ApiConfiguration) => (event: any) => {
		setApiConfiguration({
			...apiConfiguration,
			[field]: event.target.value,
		})
	}

	return (
		<div>
			<VSCodeTextField
				value={apiConfiguration?.asksageApiKey || ""}
				style={{ width: "100%" }}
				type="password"
				onInput={handleInputChange("asksageApiKey")}
				placeholder="Enter API Key...">
				<span style={{ fontWeight: 500 }}>AskSage API Key</span>
			</VSCodeTextField>
			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				This key is stored locally and only used to make API requests from this extension.
			</p>
			<VSCodeTextField
				value={apiConfiguration?.asksageApiUrl || askSageDefaultURL}
				style={{ width: "100%" }}
				type="url"
				onInput={handleInputChange("asksageApiUrl")}
				placeholder="Enter AskSage API URL...">
				<span style={{ fontWeight: 500 }}>AskSage API URL</span>
			</VSCodeTextField>
		</div>
	)
}
