import { VSCodeTextField, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { ApiConfiguration } from "../../../../../src/shared/api"
import ThinkingBudgetSlider from "../ThinkingBudgetSlider"

interface LiteLLMOptionsProps {
	apiConfiguration?: ApiConfiguration
	setApiConfiguration: (config: ApiConfiguration) => void
}

export const LiteLLMOptions = ({ apiConfiguration, setApiConfiguration }: LiteLLMOptionsProps) => {
	const handleInputChange = (field: keyof ApiConfiguration) => (event: any) => {
		setApiConfiguration({
			...apiConfiguration,
			[field]: event.target.value,
		})
	}

	return (
		<div>
			<VSCodeTextField
				value={apiConfiguration?.liteLlmApiKey || ""}
				style={{ width: "100%" }}
				type="password"
				onInput={handleInputChange("liteLlmApiKey")}
				placeholder="Default: noop">
				<span style={{ fontWeight: 500 }}>API Key</span>
			</VSCodeTextField>
			<VSCodeTextField
				value={apiConfiguration?.liteLlmBaseUrl || ""}
				style={{ width: "100%" }}
				type="url"
				onInput={handleInputChange("liteLlmBaseUrl")}
				placeholder={"Default: http://localhost:4000"}>
				<span style={{ fontWeight: 500 }}>Base URL (optional)</span>
			</VSCodeTextField>
			<VSCodeTextField
				value={apiConfiguration?.liteLlmModelId || ""}
				style={{ width: "100%" }}
				onInput={handleInputChange("liteLlmModelId")}
				placeholder={"e.g. gpt-4"}>
				<span style={{ fontWeight: 500 }}>Model ID</span>
			</VSCodeTextField>

			<>
				<ThinkingBudgetSlider apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
				<p
					style={{
						fontSize: "12px",
						marginTop: "5px",
						color: "var(--vscode-descriptionForeground)",
					}}>
					Extended thinking is available for models as Sonnet-3-7, o3-mini, Deepseek R1, etc. More info on{" "}
					<VSCodeLink
						href="https://docs.litellm.ai/docs/reasoning_content"
						style={{ display: "inline", fontSize: "inherit" }}>
						thinking mode configuration
					</VSCodeLink>
				</p>
			</>

			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				LiteLLM provides a unified interface to access various LLM providers' models. See their{" "}
				<VSCodeLink href="https://docs.litellm.ai/docs/" style={{ display: "inline", fontSize: "inherit" }}>
					quickstart guide
				</VSCodeLink>{" "}
				for more information.
			</p>
		</div>
	)
}
