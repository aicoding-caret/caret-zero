import {
	VSCodeCheckbox,
	VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react"
import { ApiConfiguration, ModelInfo, openAiModelInfoSaneDefaults } from "../../../../../src/shared/api"

interface OpenAiCompatOptionsProps {
	apiConfiguration?: ApiConfiguration
	setApiConfiguration: (config: ApiConfiguration) => void
	modelConfigurationSelected: boolean
	setModelConfigurationSelected: (selected: boolean) => void
}

export const OpenAiCompatOptions = ({
	apiConfiguration,
	setApiConfiguration,
	modelConfigurationSelected,
	setModelConfigurationSelected,
}: OpenAiCompatOptionsProps) => {
	const handleInputChange = (field: keyof ApiConfiguration) => (event: any) => {
		setApiConfiguration({
			...apiConfiguration,
			[field]: event.target.value,
		})
	}

	return (
		<div>
			<VSCodeTextField
				value={apiConfiguration?.openAiBaseUrl || ""}
				style={{ width: "100%" }}
				type="url"
				onInput={handleInputChange("openAiBaseUrl")}
				placeholder={"Enter base URL..."}>
				<span style={{ fontWeight: 500 }}>Base URL</span>
			</VSCodeTextField>
			<VSCodeTextField
				value={apiConfiguration?.openAiApiKey || ""}
				style={{ width: "100%" }}
				type="password"
				onInput={handleInputChange("openAiApiKey")}
				placeholder="Enter API Key...">
				<span style={{ fontWeight: 500 }}>API Key</span>
			</VSCodeTextField>
			<VSCodeTextField
				value={apiConfiguration?.openAiModelId || ""}
				style={{ width: "100%" }}
				onInput={handleInputChange("openAiModelId")}
				placeholder={"e.g. llama2-70b-4096"}>
				<span style={{ fontWeight: 500 }}>Model ID</span>
			</VSCodeTextField>
			<VSCodeTextField
				value={apiConfiguration?.azureApiVersion || ""}
				style={{ width: "100%" }}
				onInput={handleInputChange("azureApiVersion")}
				placeholder={"e.g. 2023-03-15-preview"}>
				<span style={{ fontWeight: 500 }}>API Version (optional)</span>
			</VSCodeTextField>
			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				This key is stored locally and only used to make API requests from this extension.{" "}
			</p>
			<div className="horizontal-rule" style={{ margin: "15px 0" }}></div>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "6px",
					marginBottom: modelConfigurationSelected ? "16px" : "8px",
					cursor: "pointer",
				}}
				onClick={() => {
					setModelConfigurationSelected(!modelConfigurationSelected)
				}}>
				<span
					className={`codicon codicon-${modelConfigurationSelected ? "chevron-down" : "chevron-right"}`}
					style={{
						marginRight: "4px",
					}}></span>
				<span
					style={{
						fontWeight: 700,
						textTransform: "uppercase",
					}}>
					Model Configuration
				</span>
			</div>
			{modelConfigurationSelected && (
				<>
					<VSCodeCheckbox
						checked={!!apiConfiguration?.openAiModelInfo?.supportsImages}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							const modelInfo = apiConfiguration?.openAiModelInfo
								? apiConfiguration.openAiModelInfo
								: { ...openAiModelInfoSaneDefaults }
							modelInfo.supportsImages = isChecked
							setApiConfiguration({
								...apiConfiguration,
								openAiModelInfo: modelInfo,
							})
						}}>
						Supports Images
					</VSCodeCheckbox>
					<VSCodeCheckbox
						checked={!!apiConfiguration?.openAiModelInfo?.supportsComputerUse}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							let modelInfo = apiConfiguration?.openAiModelInfo
								? apiConfiguration.openAiModelInfo
								: { ...openAiModelInfoSaneDefaults }
							modelInfo = { ...modelInfo, supportsComputerUse: isChecked }
							setApiConfiguration({
								...apiConfiguration,
								openAiModelInfo: modelInfo,
							})
						}}>
						Supports Computer Use
					</VSCodeCheckbox>
					<VSCodeCheckbox
						checked={!!apiConfiguration?.openAiModelInfo?.isR1FormatRequired}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							let modelInfo = apiConfiguration?.openAiModelInfo
								? apiConfiguration.openAiModelInfo
								: { ...openAiModelInfoSaneDefaults }
							modelInfo = { ...modelInfo, isR1FormatRequired: isChecked }

							setApiConfiguration({
								...apiConfiguration,
								openAiModelInfo: modelInfo,
							})
						}}>
						Enable R1 messages format
					</VSCodeCheckbox>
					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<VSCodeTextField
							value={
								apiConfiguration?.openAiModelInfo?.contextWindow
									? apiConfiguration.openAiModelInfo.contextWindow.toString()
									: openAiModelInfoSaneDefaults.contextWindow?.toString()
							}
							style={{ flex: 1 }}
							onInput={(input: any) => {
								const modelInfo = apiConfiguration?.openAiModelInfo
									? apiConfiguration.openAiModelInfo
									: { ...openAiModelInfoSaneDefaults }
								modelInfo.contextWindow = Number(input.target.value)
								setApiConfiguration({
									...apiConfiguration,
									openAiModelInfo: modelInfo,
								})
							}}>
							<span style={{ fontWeight: 500 }}>Context Window Size</span>
						</VSCodeTextField>
						<VSCodeTextField
							value={
								apiConfiguration?.openAiModelInfo?.maxTokens
									? apiConfiguration.openAiModelInfo.maxTokens.toString()
									: openAiModelInfoSaneDefaults.maxTokens?.toString()
							}
							style={{ flex: 1 }}
							onInput={(input: any) => {
								const modelInfo = apiConfiguration?.openAiModelInfo
									? apiConfiguration.openAiModelInfo
									: { ...openAiModelInfoSaneDefaults }
								modelInfo.maxTokens = input.target.value
								setApiConfiguration({
									...apiConfiguration,
									openAiModelInfo: modelInfo,
								})
							}}>
							<span style={{ fontWeight: 500 }}>Max Output Tokens</span>
						</VSCodeTextField>
					</div>
					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<VSCodeTextField
							value={
								apiConfiguration?.openAiModelInfo?.inputPrice
									? apiConfiguration.openAiModelInfo.inputPrice.toString()
									: openAiModelInfoSaneDefaults.inputPrice?.toString()
							}
							style={{ flex: 1 }}
							onInput={(input: any) => {
								const modelInfo = apiConfiguration?.openAiModelInfo
									? apiConfiguration.openAiModelInfo
									: { ...openAiModelInfoSaneDefaults }
								modelInfo.inputPrice = input.target.value
								setApiConfiguration({
									...apiConfiguration,
									openAiModelInfo: modelInfo,
								})
							}}>
							<span style={{ fontWeight: 500 }}>Input Price / 1M tokens</span>
						</VSCodeTextField>
						<VSCodeTextField
							value={
								apiConfiguration?.openAiModelInfo?.outputPrice
									? apiConfiguration.openAiModelInfo.outputPrice.toString()
									: openAiModelInfoSaneDefaults.outputPrice?.toString()
							}
							style={{ flex: 1 }}
							onInput={(input: any) => {
								const modelInfo = apiConfiguration?.openAiModelInfo
									? apiConfiguration.openAiModelInfo
									: { ...openAiModelInfoSaneDefaults }
								modelInfo.outputPrice = input.target.value
								setApiConfiguration({
									...apiConfiguration,
									openAiModelInfo: modelInfo,
								})
							}}>
							<span style={{ fontWeight: 500 }}>Output Price / 1M tokens</span>
						</VSCodeTextField>
					</div>
					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<VSCodeTextField
							value={
								apiConfiguration?.openAiModelInfo?.temperature
									? apiConfiguration.openAiModelInfo.temperature.toString()
									: openAiModelInfoSaneDefaults.temperature?.toString()
							}
							onInput={(input: any) => {
								const modelInfo = apiConfiguration?.openAiModelInfo
									? apiConfiguration.openAiModelInfo
									: { ...openAiModelInfoSaneDefaults }

								// Check if the input ends with a decimal point or has trailing zeros after decimal
								const value = input.target.value
								const shouldPreserveFormat =
									value.endsWith(".") || (value.includes(".") && value.endsWith("0"))

								modelInfo.temperature =
									value === ""
										? openAiModelInfoSaneDefaults.temperature
										: shouldPreserveFormat
											? value // Keep as string to preserve decimal format
											: parseFloat(value)

								setApiConfiguration({
									...apiConfiguration,
									openAiModelInfo: modelInfo,
								})
							}}>
							<span style={{ fontWeight: 500 }}>Temperature</span>
						</VSCodeTextField>
					</div>
				</>
			)}
			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				<span style={{ color: "var(--vscode-errorForeground)" }}>
					(<span style={{ fontWeight: 500 }}>Note:</span> Caret uses complex prompts and works best with Claude
					models. Less capable models may not work as expected.)
				</span>
			</p>
		</div>
	)
}
