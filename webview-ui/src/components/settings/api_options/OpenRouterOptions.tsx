import {
	VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react"
import { ApiConfiguration } from "../../../../../src/shared/api"
import VSCodeButtonLink from "../../common/VSCodeButtonLink"
import { getOpenRouterAuthUrl } from "../ApiOptions"

interface OpenRouterOptionsProps {
	apiConfiguration?: ApiConfiguration
	setApiConfiguration: (config: ApiConfiguration) => void
	uriScheme?: string
}

export const OpenRouterOptions = ({ apiConfiguration, setApiConfiguration, uriScheme }: OpenRouterOptionsProps) => {
	const handleInputChange = (field: keyof ApiConfiguration) => (event: any) => {
		setApiConfiguration({
			...apiConfiguration,
			[field]: event.target.value,
		})
	}

	return (
		<div>
			<VSCodeTextField
				value={apiConfiguration?.openRouterApiKey || ""}
				style={{ width: "100%" }}
				type="password"
				onInput={handleInputChange("openRouterApiKey")}
				placeholder="Enter API Key...">
				<span style={{ fontWeight: 500 }}>OpenRouter API Key</span>
			</VSCodeTextField>
			{!apiConfiguration?.openRouterApiKey && (
				<VSCodeButtonLink
					href={getOpenRouterAuthUrl(uriScheme)}
					style={{ margin: "5px 0 0 0" }}
					appearance="secondary">
					Get OpenRouter API Key
				</VSCodeButtonLink>
			)}
			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				This key is stored locally and only used to make API requests from this extension.{" "}
				{/* {!apiConfiguration?.openRouterApiKey && (
					<span style={{ color: "var(--vscode-charts-green)" }}>
						(<span style={{ fontWeight: 500 }}>Note:</span> OpenRouter is recommended for high rate
						limits, prompt caching, and wider selection of models.)
					</span>
				)} */}
			</p>
		</div>
	)
}
