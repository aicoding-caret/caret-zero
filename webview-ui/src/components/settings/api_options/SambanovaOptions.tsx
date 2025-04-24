import { VSCodeTextField, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { ApiConfiguration } from "../../../../../src/shared/api"

interface SambanovaOptionsProps {
	apiConfiguration?: ApiConfiguration
	setApiConfiguration: (config: ApiConfiguration) => void
}

export const SambanovaOptions = ({ apiConfiguration, setApiConfiguration }: SambanovaOptionsProps) => {
	const handleInputChange = (field: keyof ApiConfiguration) => (event: any) => {
		setApiConfiguration({
			...apiConfiguration,
			[field]: event.target.value,
		})
	}

	return (
		<div>
			<VSCodeTextField
				value={apiConfiguration?.sambanovaApiKey || ""}
				style={{ width: "100%" }}
				type="password"
				onInput={handleInputChange("sambanovaApiKey")}
				placeholder="Enter API Key...">
				<span style={{ fontWeight: 500 }}>SambaNova API Key</span>
			</VSCodeTextField>
			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				This key is stored locally and only used to make API requests from this extension.
				{!apiConfiguration?.sambanovaApiKey && (
					<VSCodeLink
						href="https://docs.sambanova.ai/cloud/docs/get-started/overview"
						style={{
							display: "inline",
							fontSize: "inherit",
						}}>
						You can get a SambaNova API key by signing up here.
					</VSCodeLink>
				)}
			</p>
		</div>
	)
}
