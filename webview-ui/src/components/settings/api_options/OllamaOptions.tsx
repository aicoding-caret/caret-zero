import { VSCodeTextField, VSCodeLink, VSCodeRadioGroup, VSCodeRadio } from "@vscode/webview-ui-toolkit/react"
import { ApiConfiguration } from "../../../../../src/shared/api"

interface OllamaOptionsProps {
	apiConfiguration?: ApiConfiguration
	setApiConfiguration: (config: ApiConfiguration) => void
	ollamaModels?: string[]
}

export const OllamaOptions = ({ apiConfiguration, setApiConfiguration, ollamaModels = [] }: OllamaOptionsProps) => {
	const handleInputChange = (field: keyof ApiConfiguration) => (event: any) => {
		setApiConfiguration({
			...apiConfiguration,
			[field]: event.target.value,
		})
	}

	return (
		<div>
			<VSCodeTextField
				value={apiConfiguration?.ollamaBaseUrl || ""}
				style={{ width: "100%" }}
				type="url"
				onInput={handleInputChange("ollamaBaseUrl")}
				placeholder={"Default: http://localhost:11434"}>
				<span style={{ fontWeight: 500 }}>Base URL (optional)</span>
			</VSCodeTextField>
			<VSCodeTextField
				value={apiConfiguration?.ollamaModelId || ""}
				style={{ width: "100%" }}
				onInput={handleInputChange("ollamaModelId")}
				placeholder={"e.g. llama3.1"}>
				<span style={{ fontWeight: 500 }}>Model ID</span>
			</VSCodeTextField>
			<VSCodeTextField
				value={apiConfiguration?.ollamaApiOptionsCtxNum || "32768"}
				style={{ width: "100%" }}
				onInput={handleInputChange("ollamaApiOptionsCtxNum")}
				placeholder={"e.g. 32768"}>
				<span style={{ fontWeight: 500 }}>Model Context Window</span>
			</VSCodeTextField>
			{ollamaModels.length > 0 && (
				<VSCodeRadioGroup
					value={
						ollamaModels.includes(apiConfiguration?.ollamaModelId || "") 
							? apiConfiguration?.ollamaModelId 
							: ""
					}
					onChange={(e) => {
						const value = (e.target as HTMLInputElement)?.value
						// need to check value first since radio group returns empty string sometimes
						if (value) {
							handleInputChange("ollamaModelId")({
								target: { value },
							})
						}
					}}>
					{ollamaModels.map((model) => (
						<VSCodeRadio key={model} value={model} checked={apiConfiguration?.ollamaModelId === model}>
							{model}
						</VSCodeRadio>
					))}
				</VSCodeRadioGroup>
			)}
			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				Ollama allows you to run models locally on your computer. For instructions on how to get started, see
				their
				<VSCodeLink
					href="https://github.com/ollama/ollama/blob/main/README.md"
					style={{ display: "inline", fontSize: "inherit" }}>
					quickstart guide.
				</VSCodeLink>
				<span style={{ color: "var(--vscode-errorForeground)" }}>
					(<span style={{ fontWeight: 500 }}>Note:</span> Caret uses complex prompts and works best with Claude
					models. Less capable models may not work as expected.)
				</span>
			</p>
		</div>
	)
}
