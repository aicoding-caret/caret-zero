import { ApiConfiguration } from "./api"
import { AutoApprovalSettings } from "./AutoApprovalSettings"
import { BrowserSettings } from "./BrowserSettings"
import { ChatSettings } from "./ChatSettings"
import { UserInfo } from "./UserInfo"
import { ChatContent } from "./ChatContent"
import { TelemetrySetting } from "./TelemetrySetting"
import { Persona } from "./types"

export interface WebviewMessage {
	type:
		| "addRemoteServer"
		| "apiConfiguration"
		| "webviewDidLaunch"
		| "newTask"
		| "askResponse"
		| "clearTask"
		| "didShowAnnouncement"
		| "selectImages"
		| "exportCurrentTask"
		| "showTaskWithId"
		| "deleteTaskWithId"
		| "exportTaskWithId"
		| "resetState"
		| "requestOllamaModels"
		| "requestLmStudioModels"
		| "openImage"
		| "openInBrowser"
		| "openFile"
		| "openMention"
		| "cancelTask"
		| "refreshOpenRouterModels"
		| "refreshOpenAiModels"
		| "openMcpSettings"
		| "restartMcpServer"
		| "deleteMcpServer"
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
		| "openExtensionSettings"
		| "requestVsCodeLmModels"
		| "toggleToolAutoApprove"
		| "toggleMcpServer"
		| "getLatestState"
		| "accountLoginClicked"
		| "accountLogoutClicked"
		| "showAccountViewClicked"
		| "authStateChanged"
		| "authCallback"
		| "fetchMcpMarketplace"
		| "downloadMcp"
		| "silentlyRefreshMcpMarketplace"
		| "searchCommits"
		| "showMcpView"
		| "fetchLatestMcpServersFromHub"
		| "telemetrySetting"
		| "openSettings"
		| "updateMcpTimeout"
		| "fetchOpenGraphData"
		| "checkIsImageUrl"
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
	telemetrySetting?: TelemetrySetting
	customInstructionsSetting?: string
	profileImage?: string
	// 프로필 이미지 타입 (기본/생각 중)
	// imagePath ud544ub4dcub97c uc81cuac70ud558uace0 uae30uc874 ud544ub4dcub97c uc0acuc6a9ud558ub3c4ub85d uc218uc815ud569ub2c8ub2e4.
	imageType?: "default" | "thinking";

	// For task feedback
	feedbackType?: TaskFeedbackType
	mentionsRequestId?: string
	query?: string
	// 페르소나 데이터
	persona?: Persona
	personaId?: string
	imagePath?: string;
}

export type CaretAskResponse = "yesButtonClicked" | "noButtonClicked" | "messageResponse"

export type CaretCheckpointRestore = "task" | "workspace" | "taskAndWorkspace"

export type TaskFeedbackType = "thumbs_up" | "thumbs_down"
