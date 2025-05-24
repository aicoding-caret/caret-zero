import { ApiConfiguration } from "./api"
import { AutoApprovalSettings } from "./AutoApprovalSettings"
import { BrowserSettings } from "./BrowserSettings"
import { ChatSettings } from "./ChatSettings"
import { UserInfo } from "./UserInfo"
import { ChatContent } from "./ChatContent"
import { TelemetrySetting } from "./TelemetrySetting"
import { Persona } from "./types"
import { McpViewTab } from "./mcp"

export interface WebviewMessage {
	type:
		| "apiConfiguration"
		| "webviewDidLaunch"
		| "newTask"
		| "condense"
		| "reportBug"
		| "didShowAnnouncement"
		| "openInBrowser"
		| "openMention"
		| "showChatView"
		| "refreshCaretRules"
		| "openMcpSettings"
		| "autoApprovalSettings"
		| "browserSettings"
		| "discoverBrowser"
		| "testBrowserConnection"
		| "browserConnectionResult"
		| "browserRelaunchResult"
		| "toggleMode"
		| "checkpointDiff"
		| "checkpointRestore"
		| "taskCompletionViewChanges"
		| "browserRelaunchResult"
		| "openExtensionSettings"
		| "requestVsCodeLmModels"
		| "toggleToolAutoApprove"
		| "showAccountViewClicked"
		| "authStateChanged"
		| "authCallback"
		| "fetchMcpMarketplace"
		| "silentlyRefreshMcpMarketplace"
		| "searchCommits"
		| "fetchLatestMcpServersFromHub"
		| "telemetrySetting"
		| "openSettings"
		| "invoke"
		| "updateSettings"
		| "clearAllTaskHistory"
		| "fetchUserCreditsData"
		| "optionsResponse"
		| "requestTotalTasksSize"
		| "relaunchChromeDebugMode"
		| "taskFeedback"
		| "getBrowserConnectionInfo"
		| "getDetectedChromePath"
		| "detectedChromePath"
		| "scrollToSettings"
		| "getRelativePaths" // Handles single and multiple URI resolution
		| "searchFiles"
		// 모드 설정 관련 메시지 타입
		| "loadModesConfig"
		| "saveModeSettings"
		| "resetModesToDefaults"
		| "showInformationMessage"
		// 프로필 이미지 관련 메시지 타입
		| "selectAgentProfileImage"
		| "resetAgentProfileImage"
		| "updateAgentProfileImage"
		// 모드 전환 관련 메시지 타입
		| "togglePlanActMode"
		| "requestTemplateCharacters"
		| "templateCharactersLoaded"
		// 페르소나 관련 메시지 타입 추가
		| "selectPersona"
		| "updatePersona"
		| "createPersona"
		| "deletePersona"
		| "selectLanguage"
		| "addOrUpdatePersona"
		| "scrollToSettings"
		| "searchFiles"
		| "grpc_request"
		| "grpc_request_cancel"
		| "toggleCaretRule"
		| "toggleCursorRule"
		| "toggleWindsurfRule"
		| "toggleWorkflow"
		| "deleteCaretRule"
		| "updateTerminalConnectionTimeout"
		| "setActiveQuote"

	// | "relaunchChromeDebugMode"
	text?: string
	uris?: string[] // Used for getRelativePaths
	disabled?: boolean
	askResponse?: CaretAskResponse
	apiConfiguration?: ApiConfiguration
	images?: string[]
	bool?: boolean
	number?: number
	autoApprovalSettings?: AutoApprovalSettings
	browserSettings?: BrowserSettings
	chatSettings?: ChatSettings
	chatContent?: ChatContent
	mcpId?: string
	timeout?: number
	tab?: McpViewTab
	// For toggleToolAutoApprove
	serverName?: string
	serverUrl?: string
	toolNames?: string[]
	autoApprove?: boolean

	// For auth
	user?: UserInfo | null
	customToken?: string
	// For openInBrowser
	url?: string
	planActSeparateModelsSetting?: boolean
	enableCheckpointsSetting?: boolean
	mcpMarketplaceEnabled?: boolean
	telemetrySetting?: TelemetrySetting
	customInstructionsSetting?: string
	profileImage?: string
	// 프로필 이미지 타입 (기본/생각 중)
	// imagePath ud544ub4dcub97c uc81cuac70ud558uace0 uae30uc874 ud544ub4dcub97c uc0acuc6a9ud558ub3c4ub85d uc218uc815ud569ub2c8ub2e4.
	imageType?: "default" | "thinking";

	// For task feedback
	feedbackType?: TaskFeedbackType
	// mentionsRequestId?: string
	// query?: string
	// 페르소나 데이터
	persona?: Persona
	personaId?: string
	imagePath?: string;
	mentionsRequestId?: string
	query?: string
	// For toggleFavoriteModel
	modelId?: string
	grpc_request?: {
		service: string
		method: string
		message: any // JSON serialized protobuf message
		request_id: string // For correlating requests and responses
		is_streaming?: boolean // Whether this is a streaming request
	}
	grpc_request_cancel?: {
		request_id: string // ID of the request to cancel
	}
	// For caret rules and workflows
	isGlobal?: boolean
	rulePath?: string
	workflowPath?: string
	enabled?: boolean
	filename?: string

	offset?: number
	shellIntegrationTimeout?: number
}

export type CaretAskResponse = "yesButtonClicked" | "noButtonClicked" | "messageResponse"

export type CaretCheckpointRestore = "task" | "workspace" | "taskAndWorkspace"

export type TaskFeedbackType = "thumbs_up" | "thumbs_down"
