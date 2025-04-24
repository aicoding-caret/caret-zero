import {
	VSCodeLink,
	VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react"
import { ApiConfiguration } from "../../../../../src/shared/api"

interface DeepSeekOptionsProps {
	apiConfiguration?: ApiConfiguration
	setApiConfiguration: (config: ApiConfiguration) => void
}

export const DeepSeekOptions = ({ apiConfiguration, setApiConfiguration }: DeepSeekOptionsProps) => {
	const handleInputChange = (field: keyof ApiConfiguration) => (event: any) => {
		setApiConfiguration({
			...apiConfiguration,
			[field]: event.target.value,
		})
	}

	return (
		<div>
			<VSCodeTextField
				value={apiConfiguration?.deepSeekApiKey || ""}
				style={{ width: "100%" }}
				type="password"
				onInput={handleInputChange("deepSeekApiKey")}
				placeholder="Enter API Key...">
				<span style={{ fontWeight: 500 }}>DeepSeek API Key</span>
			</VSCodeTextField>
			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				This key is stored locally and only used to make API requests from this extension.
				{!apiConfiguration?.deepSeekApiKey && (
					<VSCodeLink
						href="https://www.deepseek.com/"
						style={{
							display: "inline",
							fontSize: "inherit",
						}}>
						You can get a DeepSeek API key by signing up here.
					</VSCodeLink>
				)}
			</p>
		</div>
	)
} 