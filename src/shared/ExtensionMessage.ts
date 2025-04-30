// type that represents json data that is sent from extension to webview, called ExtensionMessage and has 'type' enum which can be 'plusButtonClicked' or 'settingsButtonClicked' or 'hello'

import { GitCommit } from "../utils/git"
import { ApiConfiguration, ModelInfo } from "./api"
import { AutoApprovalSettings } from "./AutoApprovalSettings"
import { BrowserSettings } from "./BrowserSettings"
import { ChatSettings } from "./ChatSettings"
import { HistoryItem } from "./HistoryItem"
import { McpServer, McpMarketplaceCatalog, McpMarketplaceItem, McpDownloadResponse } from "./mcp"
import { TelemetrySetting } from "./TelemetrySetting"
import type { BalanceResponse, UsageTransaction, PaymentTransaction } from "../shared/CaretAccount"

// Define ModeInfo interface
export interface ModeInfo {
	id: string
	label?: string
	description?: string
	modetype?: "plan" | "act"
	rules?: string[]
	model?: string  // 모드별 사용할 모델 ID
	apiProvider?: string // API 제공자 (e.g. 'anthropic', 'openai', 'openrouter')
	apiKey?: string // 모드별 API 키 (선택사항)
}

// webview will hold state
/**
 * API 재시도 상태를 위한 인터페이스
 */
export interface RetryStatusMessage {
	status: number // HTTP 상태 코드 (429, 503 등)
	errorType: string // 에러 유형 (한글 메시지)
	attempt: number // 현재 시도 횟수
	maxRetries: number // 최대 재시도 횟수
	delay: number // 대기 시간 (ms)
	quotaViolation?: string // 할당량 위반 정보
	retryTimestamp?: number // 재시도 예정 시간(ms 타임스탬프)
}

/**
 * API 에러 정보를 위한 인터페이스
 */
export interface ApiErrorInfo {
	status: number // HTTP 상태 코드
	message: string // 에러 메시지
	code?: string // 에러 코드
	modelId?: string // 관련 모델 ID
	quotaViolation?: string // 할당량 위반 정보
	provider?: string // API 제공자 (예: 'gemini', 'openai')
}

export interface ExtensionMessage {
	type:
		| "action"
		| "state"
		| "selectedImages"
		| "ollamaModels"
		| "lmStudioModels"
		| "theme"
		| "workspaceUpdated"
		| "invoke"
		| "partialMessage"
		| "openRouterModels"
		| "openAiModels"
		| "mcpServers"
		| "relinquishControl"
		| "vsCodeLmModels"
		| "requestVsCodeLmModels"
		| "authCallback"
		| "mcpMarketplaceCatalog"
		| "mcpDownloadDetails"
		| "commitSearchResults"
		| "openGraphData"
		| "isImageUrlResult"
		| "didUpdateSettings"
		| "addRemoteServerResult"
		| "userCreditsBalance"
		| "userCreditsUsage"
		| "userCreditsPayments"
		| "totalTasksSize"
		| "addToInput"
		| "browserConnectionResult"
		| "browserConnectionInfo"
		| "detectedChromePath"
		| "scrollToSettings"
		| "browserRelaunchResult"
		| "relativePathsResponse" // Handles single and multiple path responses
		| "fileSearchResults"
		| "modesConfigLoaded"
		| "templateCharactersJsonUri" // [ALPHA] Added for persona/character support
		| "requestTemplateCharactersJsonUri" // [ALPHA] Added for persona/character support
		| "templateCharactersLoaded" // [ALPHA] Persona template character response
		| "requestTemplateCharacters" // [ALPHA] Persona template character request
	text?: string
	uri?: string // [ALPHA] Added for persona/character support, templateCharactersJsonUri
	paths?: (string | null)[] // Used for relativePathsResponse
	action?:
		| "chatButtonClicked"
		| "mcpButtonClicked"
		| "settingsButtonClicked"
		| "historyButtonClicked"
		| "didBecomeVisible"
		| "accountLoginClicked"
		| "accountLogoutClicked"
		| "accountButtonClicked"
	invoke?: Invoke
	state?: ExtensionState
	images?: string[]
	ollamaModels?: string[]
	lmStudioModels?: string[]
	vsCodeLmModels?: { vendor?: string; family?: string; version?: string; id?: string }[]
	filePaths?: string[]
	partialMessage?: CaretMessage
	openRouterModels?: Record<string, ModelInfo>
	openAiModels?: string[]
	mcpServers?: McpServer[]
	customToken?: string
	mcpMarketplaceCatalog?: McpMarketplaceCatalog
	error?: string
	mcpDownloadDetails?: McpDownloadResponse
	commits?: GitCommit[]
	success?: boolean // Added for browserConnectionResult
	endpoint?: string // Added for browserConnectionResult
	isBundled?: boolean // Added for detectedChromePath
	isConnected?: boolean // Added for browserConnectionInfo
	isRemote?: boolean // Added for browserConnectionInfo
	host?: string // Added for browserConnectionInfo
	mentionsRequestId?: string // Added for fileSearchResults
	results?: Array<{
		// Added for fileSearchResults
		path: string
		type: "file" | "folder"
		label?: string
	}>
	openGraphData?: {
		title?: string
		description?: string
		image?: string
		url?: string
		siteName?: string
		type?: string
	}
	url?: string
	isImage?: boolean
	userCreditsBalance?: BalanceResponse
	userCreditsUsage?: UsageTransaction[]
	userCreditsPayments?: PaymentTransaction[]
	totalTasksSize?: number | null
	addRemoteServerResult?: {
		success: boolean
		serverName: string
		error?: string
	}
}

export type Invoke = "sendMessage" | "primaryButtonClick" | "secondaryButtonClick"

export type Platform = "aix" | "darwin" | "freebsd" | "linux" | "openbsd" | "sunos" | "win32" | "unknown"

export const DEFAULT_PLATFORM = "unknown"

export interface ExtensionState {
	apiConfiguration?: ApiConfiguration
	autoApprovalSettings: AutoApprovalSettings
	browserSettings: BrowserSettings
	remoteBrowserHost?: string // Added
	chatSettings: ChatSettings
	checkpointTrackerErrorMessage?: string
	caretMessages: CaretMessage[]
	currentTaskItem?: HistoryItem
	customInstructions?: string
	mcpMarketplaceEnabled?: boolean
	planActSeparateModelsSetting: boolean
	platform: Platform
	shouldShowAnnouncement: boolean
	taskHistory: HistoryItem[]
	telemetrySetting: TelemetrySetting
	uriScheme?: string
	userInfo?: {
		displayName: string | null
		email: string | null
		photoURL: string | null
	}
	version: string
	vscMachineId: string
	alphaAvatarUri?: string // 알파 기본 아바타 URI
	alphaThinkingAvatarUri?: string // 알파 생각 중 아바타 URI
	caretBanner?: string // 캐럿 배너 이미지 URI
	availableModes: ModeInfo[] // 사용 가능한 모드 목록
	retryStatus?: RetryStatusMessage // 재시도 상태 정보
	apiError: ApiErrorInfo | null // API 에러 정보

	// --- Persona Management 확장 ---
	/**
	 * 현재 등록된 모든 페르소나 목록
	 */
	personaList: import("./types").Persona[]
	/**
	 * 현재 선택된 페르소나 ID
	 */
	selectedPersonaId: string
	/**
	 * 현재 선택된 언어
	 */
	selectedLanguage: string
	/**
	 * 지원하는 언어 목록 (선택)
	 */
	supportedLanguages?: string[]
}

export interface CaretMessage {
	ts: number
	type: "ask" | "say"
	ask?: CaretAsk
	say?: CaretSay
	text?: string
	reasoning?: string
	images?: string[]
	partial?: boolean
	lastCheckpointHash?: string
	isCheckpointCheckedOut?: boolean
	conversationHistoryIndex?: number
	conversationHistoryDeletedRange?: [number, number] // for when conversation history is truncated for API requests
}

export type CaretAsk =
	| "followup"
	| "plan_mode_respond"
	| "command"
	| "command_output"
	| "completion_result"
	| "tool"
	| "api_req_failed"
	| "resume_task"
	| "resume_completed_task"
	| "mistake_limit_reached"
	| "auto_approval_max_req_reached"
	| "browser_action_launch"
	| "use_mcp_server"
	| "new_task" // Added

export type CaretSay =
	| "task"
	| "error"
	| "api_req_started"
	| "api_req_finished"
	| "text"
	| "reasoning"
	| "completion_result"
	| "user_feedback"
	| "user_feedback_diff"
	| "api_req_retried"
	| "command"
	| "command_output"
	| "tool"
	| "shell_integration_warning"
	| "browser_action_launch"
	| "browser_action"
	| "browser_action_result"
	| "mcp_server_request_started"
	| "mcp_server_response"
	| "use_mcp_server"
	| "diff_error"
	| "deleted_api_reqs"
	| "caretignore_error"
	| "checkpoint_created"

export interface CaretSayTool {
	tool:
		| "editedExistingFile"
		| "newFileCreated"
		| "readFile"
		| "listFilesTopLevel"
		| "listFilesRecursive"
		| "listCodeDefinitionNames"
		| "searchFiles"
	path?: string
	diff?: string
	content?: string
	regex?: string
	filePattern?: string
}

// must keep in sync with system prompt
export const browserActions = ["launch", "click", "type", "scroll_down", "scroll_up", "close"] as const
export type BrowserAction = (typeof browserActions)[number]

export interface CaretSayBrowserAction {
	action: BrowserAction
	coordinate?: string
	text?: string
}

export interface BrowserConnectionInfo {
	// Added
	isConnected: boolean
	isRemote: boolean
	host?: string
}

export type BrowserActionResult = {
	screenshot?: string
	logs?: string
	currentUrl?: string
	currentMousePosition?: string
}

export interface CaretAskUseMcpServer {
	serverName: string
	type: "use_mcp_tool" | "access_mcp_resource"
	toolName?: string
	arguments?: string
	uri?: string
}

export interface CaretPlanModeResponse {
	response: string
	options?: string[]
	selected?: string
}

export interface CaretAskQuestion {
	question: string
	options?: string[]
	selected?: string
}

export interface CaretAskNewTask {
	// Added
	context: string
}

/**
 * API 요청 정보 인터페이스 - 재시도 관련 필드 추가
 */
export interface CaretApiReqInfo {
	request?: string
	tokensIn?: number
	tokensOut?: number
	cacheWrites?: number
	cacheReads?: number
	cost?: number
	cancelReason?: CaretApiReqCancelReason
	streamingFailedMessage?: string
	// 재시도 관련 필드 추가
	retryAttempt?: number // 현재 재시도 횟수
	maxRetries?: number // 최대 재시도 횟수
	errorType?: string // 오류 유형 (한글 메시지)
	quotaViolation?: string // 할당량 위반 정보
	index?: number // API 요청 인덱스
	model?: string // 사용된 모델
}

export type CaretApiReqCancelReason = "streaming_failed" | "user_cancelled"

export const COMPLETION_RESULT_CHANGES_FLAG = "HAS_CHANGES"
