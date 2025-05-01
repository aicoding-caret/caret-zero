import {
	VSCodeCheckbox,
	VSCodeDropdown,
	VSCodeLink,
	VSCodeOption,
	VSCodeRadio,
	VSCodeRadioGroup,
	VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react"
import React from "react"
import { Fragment, memo, useCallback, useEffect, useMemo, useState } from "react"
import ThinkingBudgetSlider from "./ThinkingBudgetSlider"
import { useEvent, useInterval } from "react-use"
import styled from "styled-components"
import * as vscodemodels from "vscode"
import {
	anthropicDefaultModelId,
	anthropicModels,
	ApiConfiguration,
	ApiProvider,
	azureOpenAiDefaultApiVersion,
	bedrockDefaultModelId,
	bedrockModels,
	deepSeekDefaultModelId,
	deepSeekModels,
	geminiDefaultModelId,
	geminiModels,
	mistralDefaultModelId,
	mistralModels,
	ModelInfo,
	openAiModelInfoSaneDefaults,
	openAiNativeDefaultModelId,
	openAiNativeModels,
	openRouterDefaultModelId,
	openRouterDefaultModelInfo,
	mainlandQwenModels,
	internationalQwenModels,
	mainlandQwenDefaultModelId,
	internationalQwenDefaultModelId,
	vertexDefaultModelId,
	vertexModels,
	askSageModels,
	askSageDefaultModelId,
	askSageDefaultURL,
	xaiDefaultModelId,
	xaiModels,
	sambanovaModels,
	sambanovaDefaultModelId,
} from "../../../../src/shared/api"
import { ExtensionMessage } from "../../../../src/shared/ExtensionMessage"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND } from "../../utils/vscStyles"
import VSCodeButtonLink from "../common/VSCodeButtonLink"
import OpenRouterModelPicker, { ModelDescriptionMarkdown, OPENROUTER_MODEL_PICKER_Z_INDEX } from "./OpenRouterModelPicker"
import { CaretAccountInfoCard } from "./CaretAccountInfoCard"
import { AnthropicOptions } from "./api_options/AnthropicOptions"
import { OpenAiNativeOptions } from "./api_options/OpenAiNativeOptions"
import { DeepSeekOptions } from "./api_options/DeepSeekOptions"
import { QwenOptions } from "./api_options/QwenOptions"
import { MistralOptions } from "./api_options/MistralOptions"
import { OpenRouterOptions } from "./api_options/OpenRouterOptions"
import { BedrockOptions } from "./api_options/BedrockOptions"
import { VertexOptions } from "./api_options/VertexOptions"
import { GeminiOptions } from "./api_options/GeminiOptions"
import { OpenAiCompatOptions } from "./api_options/OpenAiCompatOptions"
import { RequestyOptions } from "./api_options/RequestyOptions"
import { TogetherOptions } from "./api_options/TogetherOptions"
import { OllamaOptions } from "./api_options/OllamaOptions"
import { LmStudioOptions } from "./api_options/LmStudioOptions"
import { VSCodeLmOptions } from "./api_options/VSCodeLmOptions"
import { LiteLLMOptions } from "./api_options/LiteLLMOptions"
import { XAIOptions } from "./api_options/XAIOptions"
import { SambanovaOptions } from "./api_options/SambanovaOptions"
import { CaretOptions } from "./api_options/CaretOptions"
import { AskSageOptions } from "./api_options/AskSageOptions"
import HyperClovaXOptions from "./api_options/HyperClovaXOptions"

interface ApiOptionsProps {
	showModelOptions: boolean
	apiErrorMessage?: string
	modelIdErrorMessage?: string
	isPopup?: boolean
}

// This is necessary to ensure dropdown opens downward, important for when this is used in popup
const DROPDOWN_Z_INDEX = OPENROUTER_MODEL_PICKER_Z_INDEX + 2 // Higher than the OpenRouterModelPicker's and ModelSelectorTooltip's z-index

export const DropdownContainer = styled.div<{ zIndex?: number }>`
	position: relative;
	z-index: ${(props) => props.zIndex || DROPDOWN_Z_INDEX};

	// Force dropdowns to open downward
	& vscode-dropdown::part(listbox) {
		position: absolute !important;
		top: 100% !important;
		bottom: auto !important;
	}
`

declare module "vscode" {
	interface LanguageModelChatSelector {
		vendor?: string
		family?: string
		version?: string
		id?: string
	}
}

const ApiOptions = ({ showModelOptions, apiErrorMessage, modelIdErrorMessage, isPopup }: ApiOptionsProps) => {
	const { apiConfiguration, setApiConfiguration } = useExtensionState()
	const [ollamaModels, setOllamaModels] = useState<string[]>([])
	const [lmStudioModels, setLmStudioModels] = useState<string[]>([])
	const [vsCodeLmModels, setVsCodeLmModels] = useState<vscodemodels.LanguageModelChatSelector[]>([])
	const [azureApiVersionSelected, setAzureApiVersionSelected] = useState(!!apiConfiguration?.azureApiVersion)
	const [awsEndpointSelected, setAwsEndpointSelected] = useState(!!apiConfiguration?.awsBedrockEndpoint)
	const [modelConfigurationSelected, setModelConfigurationSelected] = useState(false)
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
	const [providerSortingSelected, setProviderSortingSelected] = useState(!!apiConfiguration?.openRouterProviderSorting)

	// 기존 handleInputChange 대체: 입력 변경 시 설정 저장 + extension에 메시지 전송
	const handleInputChange = (field: keyof ApiConfiguration) => (event: any) => {
		const newConfig = {
			...apiConfiguration,
			[field]: event.target.value,
		}
		setApiConfiguration(newConfig)
		// 설정 변경사항을 extension backend로 전달
		vscode.postMessage({ type: "didUpdateSettings", apiConfiguration: newConfig })
	}

	const { selectedProvider, selectedModelId, selectedModelInfo } = useMemo(() => {
		return normalizeApiConfiguration(apiConfiguration)
	}, [apiConfiguration])

	// Poll ollama/lmstudio models
	const requestLocalModels = useCallback(() => {
		if (selectedProvider === "ollama") {
			vscode.postMessage({
				type: "requestOllamaModels",
				text: apiConfiguration?.ollamaBaseUrl,
			})
		} else if (selectedProvider === "lmstudio") {
			vscode.postMessage({
				type: "requestLmStudioModels",
				text: apiConfiguration?.lmStudioBaseUrl,
			})
		} else if (selectedProvider === "vscode-lm") {
			vscode.postMessage({ type: "requestVsCodeLmModels" })
		}
	}, [selectedProvider, apiConfiguration?.ollamaBaseUrl, apiConfiguration?.lmStudioBaseUrl])
	useEffect(() => {
		if (selectedProvider === "ollama" || selectedProvider === "lmstudio" || selectedProvider === "vscode-lm") {
			requestLocalModels()
		}
	}, [selectedProvider, requestLocalModels])
	useInterval(
		requestLocalModels,
		selectedProvider === "ollama" || selectedProvider === "lmstudio" || selectedProvider === "vscode-lm" ? 2000 : null,
	)

	const handleMessage = useCallback((event: MessageEvent) => {
		const message: ExtensionMessage = event.data
		if (message.type === "ollamaModels" && message.ollamaModels) {
			setOllamaModels(message.ollamaModels)
		} else if (message.type === "lmStudioModels" && message.lmStudioModels) {
			setLmStudioModels(message.lmStudioModels)
		} else if (message.type === "vsCodeLmModels" && message.vsCodeLmModels) {
			setVsCodeLmModels(message.vsCodeLmModels)
		}
	}, [])
	useEvent("message", handleMessage)

	/*
	VSCodeDropdown has an open bug where dynamically rendered options don't auto select the provided value prop. You can see this for yourself by comparing  it with normal select/option elements, which work as expected.
	https://github.com/microsoft/vscode-webview-ui-toolkit/issues/433

	In our case, when the user switches between providers, we recalculate the selectedModelId depending on the provider, the default model for that provider, and a modelId that the user may have selected. Unfortunately, the VSCodeDropdown component wouldn't select this calculated value, and would default to the first "Select a model..." option instead, which makes it seem like the model was cleared out when it wasn't.

	As a workaround, we create separate instances of the dropdown for each provider, and then conditionally render the one that matches the current provider.
	*/
	const createDropdown = (models: Record<string, ModelInfo>) => {
		return (
			<VSCodeDropdown
				id="model-id"
				value={selectedModelId}
				onChange={handleInputChange("apiModelId")}
				style={{ width: "100%" }}>
				<VSCodeOption value="">Select a model...</VSCodeOption>
				{Object.keys(models).map((modelId) => (
					<VSCodeOption
						key={modelId}
						value={modelId}
						style={{
							whiteSpace: "normal",
							wordWrap: "break-word",
							maxWidth: "100%",
						}}>
						{modelId}
					</VSCodeOption>
				))}
			</VSCodeDropdown>
		)
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: isPopup ? -10 : 0 }}>
			<DropdownContainer className="dropdown-container">
				<label htmlFor="api-provider">
					<span style={{ fontWeight: 500 }}>API Provider</span>
				</label>
				<VSCodeDropdown
					id="api-provider"
					value={selectedProvider}
					onChange={handleInputChange("apiProvider")}
					style={{
						minWidth: 130,
						position: "relative",
					}}>
					<VSCodeOption value="caret">Caret</VSCodeOption>
					<VSCodeOption value="hyperclovax-local">HyperCLOVA X Vision(sLLM)</VSCodeOption>
					<VSCodeOption value="gemini">Google Gemini</VSCodeOption>
					<VSCodeOption value="anthropic">Anthropic</VSCodeOption>
					<VSCodeOption value="openai">OpenAI Compatible</VSCodeOption>
					<VSCodeOption value="openrouter">OpenRouter</VSCodeOption>
					<VSCodeOption value="bedrock">AWS Bedrock</VSCodeOption>					
					<VSCodeOption value="vertex">GCP Vertex AI</VSCodeOption>
					<VSCodeOption value="deepseek">DeepSeek</VSCodeOption>
					<VSCodeOption value="mistral">Mistral</VSCodeOption>
					<VSCodeOption value="openai-native">OpenAI</VSCodeOption>
					<VSCodeOption value="vscode-lm">VS Code LM API</VSCodeOption>
					<VSCodeOption value="requesty">Requesty</VSCodeOption>
					<VSCodeOption value="together">Together</VSCodeOption>
					<VSCodeOption value="qwen">Alibaba Qwen</VSCodeOption>
					<VSCodeOption value="lmstudio">LM Studio</VSCodeOption>
					<VSCodeOption value="ollama">Ollama</VSCodeOption>
					<VSCodeOption value="litellm">LiteLLM</VSCodeOption>
					<VSCodeOption value="asksage">AskSage</VSCodeOption>
					<VSCodeOption value="xai">X AI</VSCodeOption>
					<VSCodeOption value="sambanova">SambaNova</VSCodeOption>
				</VSCodeDropdown>
			</DropdownContainer>

			{selectedProvider === "caret" && (
				<div style={{ marginBottom: 14, marginTop: 4 }}>
					<CaretAccountInfoCard />
					<CaretOptions apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
				</div>
			)}

			{selectedProvider === "asksage" && (
				<AskSageOptions apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
			)}

			{selectedProvider === "anthropic" && (
				<AnthropicOptions apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
			)}

			{selectedProvider === "openai-native" && (
				<OpenAiNativeOptions apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
			)}

			{selectedProvider === "deepseek" && (
				<DeepSeekOptions apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
			)}

			{selectedProvider === "qwen" && (
				<QwenOptions apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
			)}

			{selectedProvider === "mistral" && (
				<MistralOptions apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
			)}

			{selectedProvider === "openrouter" && (
				<OpenRouterOptions apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
			)}

			{selectedProvider === "bedrock" && (
				<BedrockOptions 
					apiConfiguration={apiConfiguration} 
					setApiConfiguration={setApiConfiguration} 
					awsEndpointSelected={awsEndpointSelected}
					setAwsEndpointSelected={setAwsEndpointSelected}
					selectedModelInfo={selectedModelInfo}
					DROPDOWN_Z_INDEX={DROPDOWN_Z_INDEX}
				/>
			)}

			{selectedProvider === "vertex" && (
				<VertexOptions 
					apiConfiguration={apiConfiguration} 
					setApiConfiguration={setApiConfiguration} 
					DROPDOWN_Z_INDEX={DROPDOWN_Z_INDEX}
				/>
			)}

			{selectedProvider === "gemini" && (
				<GeminiOptions 
					apiConfiguration={apiConfiguration} 
					setApiConfiguration={setApiConfiguration} 
					DROPDOWN_Z_INDEX={DROPDOWN_Z_INDEX}
				/>
			)}

			{selectedProvider === "openai" && (
				<OpenAiCompatOptions
					apiConfiguration={apiConfiguration}
					setApiConfiguration={setApiConfiguration}
					modelConfigurationSelected={modelConfigurationSelected}
					setModelConfigurationSelected={setModelConfigurationSelected}
				/>
			)}

			{selectedProvider === "requesty" && (
				<RequestyOptions apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
			)}

			{selectedProvider === "together" && (
				<TogetherOptions apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
			)}

			{selectedProvider === "vscode-lm" && (
				<VSCodeLmOptions 
					apiConfiguration={apiConfiguration} 
					setApiConfiguration={setApiConfiguration}
					DROPDOWN_Z_INDEX={DROPDOWN_Z_INDEX}
				/>
			)}

			{selectedProvider === "lmstudio" && (
				<LmStudioOptions apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
			)}

			{selectedProvider === "litellm" && (
				<LiteLLMOptions apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
			)}

			{selectedProvider === "ollama" && (
				<OllamaOptions 
					apiConfiguration={apiConfiguration} 
					setApiConfiguration={setApiConfiguration} 
					ollamaModels={ollamaModels}
				/>
			)}

			{selectedProvider === "xai" && (
				<XAIOptions apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
			)}

			{selectedProvider === "sambanova" && (
				<SambanovaOptions apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
			)}

			{selectedProvider === "hyperclovax-local" && apiConfiguration && (
				<div style={{ marginBottom: 14, marginTop: 4 }}>
					<React.Suspense fallback={<div>옵션 로딩 중...</div>}>
						<HyperClovaXOptions apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
					</React.Suspense>
				</div>
			)}

			{apiErrorMessage && (
				<p
					style={{
						margin: "-10px 0 4px 0",
						fontSize: 12,
						color: "var(--vscode-errorForeground)",
					}}>
					{apiErrorMessage}
				</p>
			)}

			{(selectedProvider === "openrouter" || selectedProvider === "caret") && showModelOptions && (
				<>
					<VSCodeCheckbox
						style={{ marginTop: -10 }}
						checked={providerSortingSelected}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							setProviderSortingSelected(isChecked)
							if (!isChecked) {
								setApiConfiguration({
									...apiConfiguration,
									openRouterProviderSorting: "",
								})
							}
						}}>
						Sort underlying provider routing
					</VSCodeCheckbox>

					{providerSortingSelected && (
						<div style={{ marginBottom: -6 }}>
							<DropdownContainer className="dropdown-container" zIndex={OPENROUTER_MODEL_PICKER_Z_INDEX + 1}>
								<VSCodeDropdown
									style={{ width: "100%", marginTop: 3 }}
									value={apiConfiguration?.openRouterProviderSorting}
									onChange={(e: any) => {
										setApiConfiguration({
											...apiConfiguration,
											openRouterProviderSorting: e.target.value,
										})
									}}>
									<VSCodeOption value="">Default</VSCodeOption>
									<VSCodeOption value="price">Price</VSCodeOption>
									<VSCodeOption value="throughput">Throughput</VSCodeOption>
									<VSCodeOption value="latency">Latency</VSCodeOption>
								</VSCodeDropdown>
							</DropdownContainer>
							<p style={{ fontSize: "12px", marginTop: 3, color: "var(--vscode-descriptionForeground)" }}>
								{!apiConfiguration?.openRouterProviderSorting &&
									"Default behavior is to load balance requests across providers (like AWS, Google Vertex, Anthropic), prioritizing price while considering provider uptime"}
								{apiConfiguration?.openRouterProviderSorting === "price" &&
									"Sort providers by price, prioritizing the lowest cost provider"}
								{apiConfiguration?.openRouterProviderSorting === "throughput" &&
									"Sort providers by throughput, prioritizing the provider with the highest throughput (may increase cost)"}
								{apiConfiguration?.openRouterProviderSorting === "latency" &&
									"Sort providers by response time, prioritizing the provider with the lowest latency"}
							</p>
						</div>
					)}
				</>
			)}

			{selectedProvider !== "openrouter" &&
				selectedProvider !== "caret" &&
				selectedProvider !== "openai" &&
				selectedProvider !== "ollama" &&
				selectedProvider !== "lmstudio" &&
				selectedProvider !== "vscode-lm" &&
				selectedProvider !== "litellm" &&
				selectedProvider !== "requesty" &&
				showModelOptions && (
					<>
						<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 2} className="dropdown-container">
							<label htmlFor="model-id">
								<span style={{ fontWeight: 500 }}>Model</span>
							</label>
							{selectedProvider === "anthropic" && createDropdown(anthropicModels)}
							{selectedProvider === "bedrock" && createDropdown(bedrockModels)}
							{selectedProvider === "vertex" && createDropdown(vertexModels)}
							{selectedProvider === "gemini" && createDropdown(geminiModels)}
							{selectedProvider === "openai-native" && createDropdown(openAiNativeModels)}
							{selectedProvider === "deepseek" && createDropdown(deepSeekModels)}
							{selectedProvider === "qwen" &&
								createDropdown(
									apiConfiguration?.qwenApiLine === "china" ? mainlandQwenModels : internationalQwenModels,
								)}
							{selectedProvider === "mistral" && createDropdown(mistralModels)}
							{selectedProvider === "asksage" && createDropdown(askSageModels)}
							{selectedProvider === "xai" && createDropdown(xaiModels)}
							{selectedProvider === "sambanova" && createDropdown(sambanovaModels)}
						</DropdownContainer>

						{((selectedProvider === "anthropic" && selectedModelId === "claude-3-7-sonnet-20250219") ||
							(selectedProvider === "bedrock" && selectedModelId === "anthropic.claude-3-7-sonnet-20250219-v1:0") ||
							(selectedProvider === "vertex" && selectedModelId === "claude-3-7-sonnet@20250219")) && (
							<ThinkingBudgetSlider apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
						)}

						<ModelInfoView
							selectedModelId={selectedModelId}
							modelInfo={selectedModelInfo}
							isDescriptionExpanded={isDescriptionExpanded}
							setIsDescriptionExpanded={setIsDescriptionExpanded}
							isPopup={isPopup}
						/>
					</>
				)}

			{(selectedProvider === "openrouter" || selectedProvider === "caret") && showModelOptions && (
				<OpenRouterModelPicker isPopup={isPopup} />
			)}

			{modelIdErrorMessage && (
				<p
					style={{
						margin: "-10px 0 4px 0",
						fontSize: 12,
						color: "var(--vscode-errorForeground)",
					}}>
					{modelIdErrorMessage}
				</p>
			)}
		</div>
	)
}

export function getOpenRouterAuthUrl(uriScheme?: string) {
	return `https://openrouter.ai/auth?callback_url=${uriScheme || "vscode"}://saoudrizwan.claude-dev/openrouter`
}

export const formatPrice = (price: number) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(price)
}

export const ModelInfoView = ({
	selectedModelId,
	modelInfo,
	isDescriptionExpanded,
	setIsDescriptionExpanded,
	isPopup,
}: {
	selectedModelId: string
	modelInfo: ModelInfo
	isDescriptionExpanded: boolean
	setIsDescriptionExpanded: (isExpanded: boolean) => void
	isPopup?: boolean
}) => {
	const isGemini = Object.keys(geminiModels).includes(selectedModelId)

	const infoItems = [
		modelInfo.description && (
			<ModelDescriptionMarkdown
				key="description"
				markdown={modelInfo.description}
				isExpanded={isDescriptionExpanded}
				setIsExpanded={setIsDescriptionExpanded}
				isPopup={isPopup}
			/>
		),
		<ModelInfoSupportsItem
			key="supportsImages"
			isSupported={modelInfo.supportsImages ?? false}
			supportsLabel="Supports images"
			doesNotSupportLabel="Does not support images"
		/>,
		<ModelInfoSupportsItem
			key="supportsComputerUse"
			isSupported={modelInfo.supportsComputerUse ?? false}
			supportsLabel="Supports computer use"
			doesNotSupportLabel="Does not support computer use"
		/>,
		!isGemini && (
			<ModelInfoSupportsItem
				key="supportsPromptCache"
				isSupported={modelInfo.supportsPromptCache}
				supportsLabel="Supports prompt caching"
				doesNotSupportLabel="Does not support prompt caching"
			/>
		),
		modelInfo.maxTokens !== undefined && modelInfo.maxTokens > 0 && (
			<span key="maxTokens">
				<span style={{ fontWeight: 500 }}>Max output:</span> {modelInfo.maxTokens?.toLocaleString()} tokens
			</span>
		),
		// 
		modelInfo.inputPrice !== undefined && modelInfo.inputPrice > 0 ? (
			<span key="inputPrice">
				<span style={{ fontWeight: 500 }}>Input price:</span> {formatPrice(modelInfo.inputPrice)}/million tokens
			</span>
		) : (
			modelInfo.inputPriceTiers &&
			modelInfo.inputPriceTiers.length > 0 && (
				<span key="inputPriceTiers">
					<span style={{ fontWeight: 500 }}>Input price:</span> {formatPrice(modelInfo.inputPriceTiers[0].price)}
					/million tokens
					{modelInfo.inputPriceTiers.length > 1 && " (tiered pricing)"}
				</span>
			)
		),
		modelInfo.supportsPromptCache && modelInfo.cacheWritesPrice && (
			<span key="cacheWritesPrice">
				<span style={{ fontWeight: 500 }}>Cache writes price:</span> {formatPrice(modelInfo.cacheWritesPrice || 0)}
				/million tokens
			</span>
		),
		modelInfo.supportsPromptCache && modelInfo.cacheReadsPrice && (
			<span key="cacheReadsPrice">
				<span style={{ fontWeight: 500 }}>Cache reads price:</span> {formatPrice(modelInfo.cacheReadsPrice || 0)}/million
				tokens
			</span>
		),
		// 
		modelInfo.outputPrice !== undefined && modelInfo.outputPrice > 0 ? (
			<span key="outputPrice">
				<span style={{ fontWeight: 500 }}>Output price:</span> {formatPrice(modelInfo.outputPrice)}/million tokens
			</span>
		) : (
			modelInfo.outputPriceTiers &&
			modelInfo.outputPriceTiers.length > 0 && (
				<span key="outputPriceTiers">
					<span style={{ fontWeight: 500 }}>Output price:</span> {formatPrice(modelInfo.outputPriceTiers[0].price)}
					/million tokens
					{modelInfo.outputPriceTiers.length > 1 && " (tiered pricing)"}
				</span>
			)
		),
		isGemini && (
			<span key="geminiInfo" style={{ fontStyle: "italic" }}>
				* Free up to {selectedModelId && selectedModelId.includes("flash") ? "15" : "2"} requests per minute. After that,
				billing depends on prompt size.{" "}
				<VSCodeLink href="https://ai.google.dev/pricing" style={{ display: "inline", fontSize: "inherit" }}>
					For more info, see pricing details.
				</VSCodeLink>
			</span>
		),
	].filter(Boolean)

	return (
		<p
			style={{
				fontSize: "12px",
				marginTop: "2px",
				color: "var(--vscode-descriptionForeground)",
			}}>
			{infoItems.map((item, index) => (
				<Fragment key={index}>
					{item}
					{index < infoItems.length - 1 && <br />}
				</Fragment>
			))}
		</p>
	)
}

const ModelInfoSupportsItem = ({
	isSupported,
	supportsLabel,
	doesNotSupportLabel,
}: {
	isSupported: boolean
	supportsLabel: string
	doesNotSupportLabel: string
}) => (
	<span
		style={{
			fontWeight: 500,
			color: isSupported ? "var(--vscode-charts-green)" : "var(--vscode-errorForeground)",
		}}>
		<i
			className={`codicon codicon-${isSupported ? "check" : "x"}`}
			style={{
				marginRight: 4,
				marginBottom: isSupported ? 1 : -1,
				fontSize: isSupported ? 11 : 13,
				fontWeight: 700,
				display: "inline-block",
				verticalAlign: "bottom",
			}}></i>
		{isSupported ? supportsLabel : doesNotSupportLabel}
	</span>
)

export function normalizeApiConfiguration(apiConfiguration?: ApiConfiguration): {
	selectedProvider: ApiProvider
	selectedModelId: string
	selectedModelInfo: ModelInfo
} {
	const provider = apiConfiguration?.apiProvider || "anthropic"
	const modelId = apiConfiguration?.apiModelId

	const getProviderData = (models: Record<string, ModelInfo>, defaultId: string) => {
		let selectedModelId: string
		let selectedModelInfo: ModelInfo
		if (modelId && modelId in models) {
			selectedModelId = modelId
			selectedModelInfo = models[modelId]
		} else {
			selectedModelId = defaultId
			selectedModelInfo = models[defaultId]
		}
		return {
			selectedProvider: provider,
			selectedModelId,
			selectedModelInfo,
		}
	}
	switch (provider) {
		case "anthropic":
			return getProviderData(anthropicModels, anthropicDefaultModelId)
		case "bedrock":
			return getProviderData(bedrockModels, bedrockDefaultModelId)
		case "vertex":
			return getProviderData(vertexModels, vertexDefaultModelId)
		case "gemini":
			return getProviderData(geminiModels, geminiDefaultModelId)
		case "openai-native":
			return getProviderData(openAiNativeModels, openAiNativeDefaultModelId)
		case "deepseek":
			return getProviderData(deepSeekModels, deepSeekDefaultModelId)
		case "qwen":
			const qwenModels = apiConfiguration?.qwenApiLine === "china" ? mainlandQwenModels : internationalQwenModels
			const qwenDefaultId =
				apiConfiguration?.qwenApiLine === "china" ? mainlandQwenDefaultModelId : internationalQwenDefaultModelId
			return getProviderData(qwenModels, qwenDefaultId)
		case "mistral":
			return getProviderData(mistralModels, mistralDefaultModelId)
		case "asksage":
			return getProviderData(askSageModels, askSageDefaultModelId)
		case "openrouter":
			return {
				selectedProvider: provider,
				selectedModelId: apiConfiguration?.openRouterModelId || openRouterDefaultModelId,
				selectedModelInfo: apiConfiguration?.openRouterModelInfo || openRouterDefaultModelInfo,
			}
		case "caret":
			return {
				selectedProvider: provider,
				selectedModelId: apiConfiguration?.openRouterModelId || openRouterDefaultModelId,
				selectedModelInfo: apiConfiguration?.openRouterModelInfo || openRouterDefaultModelInfo,
			}
		case "openai":
			return {
				selectedProvider: provider,
				selectedModelId: apiConfiguration?.openAiModelId || "",
				selectedModelInfo: apiConfiguration?.openAiModelInfo || openAiModelInfoSaneDefaults,
			}
		case "ollama":
			return {
				selectedProvider: provider,
				selectedModelId: apiConfiguration?.ollamaModelId || "",
				selectedModelInfo: openAiModelInfoSaneDefaults,
			}
		case "lmstudio":
			return {
				selectedProvider: provider,
				selectedModelId: apiConfiguration?.lmStudioModelId || "",
				selectedModelInfo: openAiModelInfoSaneDefaults,
			}
		case "requesty":
			return {
				selectedProvider: provider,
				selectedModelId: apiConfiguration?.requestyModelId || "",
				selectedModelInfo: openAiModelInfoSaneDefaults,
			}
		case "vscode-lm":
			return {
				selectedProvider: provider,
				selectedModelId: apiConfiguration?.vsCodeLmModelSelector
					? `${apiConfiguration.vsCodeLmModelSelector.vendor ?? ""}/${apiConfiguration.vsCodeLmModelSelector.family ?? ""}`
					: "",
				selectedModelInfo: {
					...openAiModelInfoSaneDefaults,
					supportsImages: false, // VSCode LM API currently doesn't support images
				},
			}
		case "litellm":
			return {
				selectedProvider: provider,
				selectedModelId: apiConfiguration?.liteLlmModelId || "",
				selectedModelInfo: openAiModelInfoSaneDefaults,
			}
		case "xai":
			return getProviderData(xaiModels, xaiDefaultModelId)
		case "sambanova":
			return getProviderData(sambanovaModels, sambanovaDefaultModelId)
		case "hyperclovax-local":
			return {
				selectedProvider: provider,
				selectedModelId: "",
				selectedModelInfo: openAiModelInfoSaneDefaults,
			}
		default:
			return getProviderData(anthropicModels, anthropicDefaultModelId)
	}
}

export default memo(ApiOptions)
