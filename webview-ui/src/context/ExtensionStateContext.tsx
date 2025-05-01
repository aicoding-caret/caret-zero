import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useEvent } from "react-use"
import { DEFAULT_AUTO_APPROVAL_SETTINGS } from "../../../src/shared/AutoApprovalSettings"
import { ExtensionMessage, ExtensionState, DEFAULT_PLATFORM, ModeInfo, ApiErrorInfo, CaretMessage } from "../../../src/shared/ExtensionMessage" // Import ModeInfo, ApiErrorInfo, CaretMessage
import { ApiConfiguration, ModelInfo, openRouterDefaultModelId, openRouterDefaultModelInfo } from "../../../src/shared/api"
import { findLastIndex } from "../../../src/shared/array"
import { McpMarketplaceCatalog, McpServer } from "../../../src/shared/mcp"
import { convertTextMateToHljs } from "../utils/textMateToHljs"
import { vscode } from "../utils/vscode"
import { DEFAULT_BROWSER_SETTINGS } from "../../../src/shared/BrowserSettings"
import { DEFAULT_CHAT_SETTINGS } from "../../../src/shared/ChatSettings"
import { TelemetrySetting } from "../../../src/shared/TelemetrySetting"
import { Persona } from "../../../src/shared/types"

interface ExtensionStateContextType extends ExtensionState {
	didHydrateState: boolean
	showWelcome: boolean
	theme: any
	openRouterModels: Record<string, ModelInfo>
	openAiModels: string[]
	mcpServers: McpServer[]
	mcpMarketplaceCatalog: McpMarketplaceCatalog
	filePaths: string[]
	totalTasksSize: number | null
	apiError: ApiErrorInfo | null
	setApiConfiguration: (config: ApiConfiguration) => void
	setCustomInstructions: (value?: string) => void
	setTelemetrySetting: (value: TelemetrySetting) => void
	setShowAnnouncement: (value: boolean) => void
	setPlanActSeparateModelsSetting: (value: boolean) => void
	availableModes: ModeInfo[] // Add availableModes
	// 프로필 이미지 관련 상태 및 처리기
	alphaAvatarUri: string
	alphaThinkingAvatarUri: string
	caretBanner?: string
	selectAgentProfileImage: () => void
	resetAgentProfileImage: () => void
	updateAgentProfileImage: (imageUrl: string) => void
	// 퍼소나 관련 필드 (단일 퍼소나 시스템)
	persona?: Persona
	selectedLanguage?: string
	supportedLanguages?: string[]
}

const ExtensionStateContext = createContext<ExtensionStateContextType | undefined>(undefined)

export const ExtensionStateContextProvider: React.FC<{
	children: React.ReactNode
}> = ({ children }) => {
	const [state, setState] = useState<ExtensionState>({
		version: "",
		caretMessages: [],
		taskHistory: [],
		shouldShowAnnouncement: false,
		autoApprovalSettings: DEFAULT_AUTO_APPROVAL_SETTINGS,
		browserSettings: DEFAULT_BROWSER_SETTINGS,
		chatSettings: DEFAULT_CHAT_SETTINGS,
		platform: DEFAULT_PLATFORM,
		telemetrySetting: "unset",
		vscMachineId: "",
		planActSeparateModelsSetting: true,
		availableModes: [], // Initialize availableModes
		alphaAvatarUri: "https://raw.githubusercontent.com/fstory97/caret-avatar/main/alpha-maid.png", // 기본 프로필 이미지
		alphaThinkingAvatarUri: "https://raw.githubusercontent.com/fstory97/caret-avatar/main/alpha-maid-thinking.png",
		apiError: null, // API 에러 정보 초기화
		theme: "", // Add theme to initial state
		mode: "", // Add mode to initial state
		historyItems: [], // Add historyItems to initial state
		// Persona 관리 관련 기본값 추가
		persona: undefined,
		selectedLanguage: "ko",
		supportedLanguages: ["ko", "en"],
	})
	const [didHydrateState, setDidHydrateState] = useState(false)
	const [showWelcome, setShowWelcome] = useState(false)
	const [theme, setTheme] = useState<any>(undefined)
	const [filePaths, setFilePaths] = useState<string[]>([])
	const [openRouterModels, setOpenRouterModels] = useState<Record<string, ModelInfo>>({
		[openRouterDefaultModelId]: openRouterDefaultModelInfo,
	})
	const [totalTasksSize, setTotalTasksSize] = useState<number | null>(null)

	const [openAiModels, setOpenAiModels] = useState<string[]>([])
	const [mcpServers, setMcpServers] = useState<McpServer[]>([])
	const [mcpMarketplaceCatalog, setMcpMarketplaceCatalog] = useState<McpMarketplaceCatalog>({ items: [] })

	const handleMessage = useCallback((event: MessageEvent) => {
		const message: ExtensionMessage = event.data
		switch (message.type) {
			case "state": {
				setState(message.state!)
				const config = message.state?.apiConfiguration
				const hasKey = config
					? [
							config.apiKey,
							config.openRouterApiKey,
							config.awsRegion,
							config.vertexProjectId,
							config.openAiApiKey,
							config.ollamaModelId,
							config.lmStudioModelId,
							config.liteLlmApiKey,
							config.geminiApiKey,
							config.openAiNativeApiKey,
							config.deepSeekApiKey,
							config.requestyApiKey,
							config.togetherApiKey,
							config.qwenApiKey,
							config.mistralApiKey,
							config.vsCodeLmModelSelector,
							config.caretApiKey,
							config.asksageApiKey,
							config.xaiApiKey,
							config.sambanovaApiKey,
						].some((key) => key !== undefined)
					: false
				setShowWelcome(!hasKey)
				setDidHydrateState(true)
				break
			}
			case "theme": {
				if (message.text) {
					setTheme(convertTextMateToHljs(JSON.parse(message.text)))
				}
				break
			}
			case "workspaceUpdated": {
				setFilePaths(message.filePaths ?? [])
				break
			}
			case "partialMessage": {
				const partialMessage: CaretMessage = message.partialMessage!
				setState((prevState) => {
					// worth noting it will never be possible for a more up-to-date message to be sent here or in normal messages post since the presentAssistantContent function uses lock
					const lastIndex = findLastIndex(prevState.caretMessages ?? [], (msg) => msg.ts === partialMessage.ts)
					if (lastIndex !== -1) {
						const newCaretMessages = [...(prevState.caretMessages ?? [])]
						newCaretMessages[lastIndex] = partialMessage
						return { ...prevState, caretMessages: newCaretMessages }
					}
					return prevState
				})
				break
			}
			case "openRouterModels": {
				const updatedModels = message.openRouterModels ?? {}
				setOpenRouterModels({
					[openRouterDefaultModelId]: openRouterDefaultModelInfo, // in case the extension sent a model list without the default model
					...updatedModels,
				})
				break
			}
			case "openAiModels": {
				const updatedModels = message.openAiModels ?? []
				setOpenAiModels(updatedModels)
				break
			}
			case "mcpServers": {
				setMcpServers(message.mcpServers ?? [])
				break
			}
			case "mcpMarketplaceCatalog": {
				if (message.mcpMarketplaceCatalog) {
					setMcpMarketplaceCatalog(message.mcpMarketplaceCatalog)
				}
				break
			}
			case "totalTasksSize": {
				setTotalTasksSize(message.totalTasksSize ?? null)
				break
			}
			case "personaUpdated": {
				// personaUpdated 메시지 처리 추가
				console.log("[ExtensionStateContext] personaUpdated 메시지 수신:", message);
				
				// 페르소나 목록 다시 로드 요청
				vscode.postMessage({
					type: "getLatestState"
				});
				break;
			}
			case "agentProfileImageUpdated": {
				console.log("[ExtensionStateContext] agentProfileImageUpdated message:", message);
				if (message.imageType === "default") {
					console.log("[ExtensionStateContext] Updating alphaAvatarUri to:", message.imageUrl);
					setState((prevState) => ({
						...prevState,
						alphaAvatarUri: message.imageUrl,
					}))
				} else if (message.imageType === "thinking") {
					console.log("[ExtensionStateContext] Updating alphaThinkingAvatarUri to:", message.imageUrl);
					setState((prevState) => ({
						...prevState,
						alphaThinkingAvatarUri: message.imageUrl,
					}))
				}
				break
			}
		}
	}, [])

	useEvent("message", handleMessage)

	useEffect(() => {
		vscode.postMessage({ type: "webviewDidLaunch" })
	}, [])

	const contextValue: ExtensionStateContextType = {
		...state,
		didHydrateState,
		showWelcome,
		theme,
		openRouterModels,
		openAiModels,
		mcpServers,
		mcpMarketplaceCatalog,
		filePaths,
		totalTasksSize,
		apiError: state.apiError || null,
		setApiConfiguration: (value) => {
			console.log('[Caret Debug] setApiConfiguration called with:', value)
			setState((prevState) => ({
				...prevState,
				apiConfiguration: {
					...prevState.apiConfiguration,
					...value,
				},
			}))
		},
		setCustomInstructions: (value) =>
			setState((prevState) => ({
				...prevState,
				customInstructions: value,
			})),
		setTelemetrySetting: (value) =>
			setState((prevState) => ({
				...prevState,
				telemetrySetting: value,
			})),
		setPlanActSeparateModelsSetting: (value) =>
			setState((prevState) => ({
				...prevState,
				planActSeparateModelsSetting: value,
			})),
		setShowAnnouncement: (value) =>
			setState((prevState) => ({
				...prevState,
				shouldShowAnnouncement: value,
			})),
		availableModes: state.availableModes, // Add availableModes to context value
		// 프로필 이미지 관련 처리기
		alphaAvatarUri: state.alphaAvatarUri || "https://raw.githubusercontent.com/fstory97/caret-avatar/main/alpha-maid.png",
		alphaThinkingAvatarUri: state.alphaThinkingAvatarUri || "https://raw.githubusercontent.com/fstory97/caret-avatar/main/alpha-maid-thinking.png",
		caretBanner: state.caretBanner,
		selectAgentProfileImage: () => {
			vscode.postMessage({ type: "selectAgentProfileImage" })
		},
		resetAgentProfileImage: () => {
			vscode.postMessage({ type: "resetAgentProfileImage" })
		},
		updateAgentProfileImage: (imageUrl: string) => {
			vscode.postMessage({ type: "updateAgentProfileImage", text: imageUrl })
			setState((prevState) => ({
				...prevState,
				alphaAvatarUri: imageUrl,
			}))
		},
		// 퍼소나 관련 필드 (단일 퍼소나 시스템)
		persona: state.persona,
		selectedLanguage: state.selectedLanguage,
		supportedLanguages: state.supportedLanguages,
	}

	return <ExtensionStateContext.Provider value={contextValue}>{children}</ExtensionStateContext.Provider>
}

export const useExtensionState = () => {
	const context = useContext(ExtensionStateContext)
	if (context === undefined) {
		throw new Error("useExtensionState must be used within an ExtensionStateContextProvider")
	}
	return context
}
