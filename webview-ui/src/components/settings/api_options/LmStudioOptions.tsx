import { VSCodeTextField, VSCodeLink, VSCodeRadioGroup, VSCodeRadio } from "@vscode/webview-ui-toolkit/react"
import { ApiConfiguration } from "../../../../../src/shared/api"

interface LmStudioOptionsProps {
	apiConfiguration?: ApiConfiguration
	setApiConfiguration: (config: ApiConfiguration) => void
	lmStudioModels?: string[]
}

export const LmStudioOptions = ({ apiConfiguration, setApiConfiguration, lmStudioModels = [] }: LmStudioOptionsProps) => {
	const handleInputChange = (field: keyof ApiConfiguration) => (event: any) => {
		setApiConfiguration({
			...apiConfiguration,
			[field]: event.target.value,
		})
	}

	return (
		<div>
			<VSCodeTextField
				value={apiConfiguration?.lmStudioBaseUrl || ""}
				style={{ width: "100%" }}
				type="url"
				onInput={handleInputChange("lmStudioBaseUrl")}
				placeholder={"Default: http://localhost:1234"}>
				<span style={{ fontWeight: 500 }}>Base URL (optional)</span>
			</VSCodeTextField>
			<VSCodeTextField
				value={apiConfiguration?.lmStudioModelId || ""}
				style={{ width: "100%" }}
				onInput={handleInputChange("lmStudioModelId")}
				placeholder={"e.g. meta-llama-3.1-8b-instruct"}>
				<span style={{ fontWeight: 500 }}>Model ID</span>
			</VSCodeTextField>
			{lmStudioModels.length > 0 && (
				<VSCodeRadioGroup
					value={
						lmStudioModels.includes(apiConfiguration?.lmStudioModelId || "") 
							? apiConfiguration?.lmStudioModelId 
							: ""
					}
					onChange={(e) => {
						const value = (e.target as HTMLInputElement)?.value
						// need to check value first since radio group returns empty string sometimes
						if (value) {
							handleInputChange("lmStudioModelId")({
								target: { value },
							})
						}
					}}>
					{lmStudioModels.map((model) => (
						<VSCodeRadio key={model} value={model} checked={apiConfiguration?.lmStudioModelId === model}>
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
				LM Studio allows you to run models locally on your computer. For instructions on how to get started, see
				their
				<VSCodeLink href="https://lmstudio.ai/docs" style={{ display: "inline", fontSize: "inherit" }}>
					quickstart guide.
				</VSCodeLink>
				You will also need to start LM Studio's{" "}
				<VSCodeLink
					href="https://lmstudio.ai/docs/basics/server"
					style={{ display: "inline", fontSize: "inherit" }}>
					local server
				</VSCodeLink>{" "}
				feature to use it with this extension.{" "}
				<span style={{ color: "var(--vscode-errorForeground)" }}>
					(<span style={{ fontWeight: 500 }}>Note:</span> Caret uses complex prompts and works best with Claude
					models. Less capable models may not work as expected.)
				</span>
			</p>
		</div>
	)
}
