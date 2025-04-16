import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import debounce from "debounce"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useEvent, useMount } from "react-use"
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso"
import styled from "styled-components" // Ensure styled-components is imported
import {
	ClineApiReqInfo,
	ClineAsk,
	ClineMessage,
	ClineSayBrowserAction,
	ClineSayTool,
	ExtensionMessage,
	RetryStatusMessage, // 추가: 재시도 상태 메시지 타입
} from "../../../../src/shared/ExtensionMessage"
import { findLast } from "../../../../src/shared/array"
import { combineApiRequests } from "../../../../src/shared/combineApiRequests"
import { combineCommandSequences } from "../../../../src/shared/combineCommandSequences"
import { getApiMetrics } from "../../../../src/shared/getApiMetrics"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import HistoryPreview from "../history/HistoryPreview"
import { normalizeApiConfiguration } from "../settings/ApiOptions"
import Announcement from "./Announcement"
import AutoApproveMenu from "./AutoApproveMenu"
import BrowserSessionRow from "./BrowserSessionRow"
import ChatRow from "./ChatRow"
import ChatTextArea from "./ChatTextArea"
import TaskHeader from "./TaskHeader"
import TelemetryBanner from "../common/TelemetryBanner"
import { AlertIcon } from '@primer/octicons-react'; // WarningIcon 임포트 추가 -> AlertIcon으로 수정

// Define styled components for the new mode buttons (Adjust styles for bottom-right placement)
// Ensure these are defined only ONCE at the top level of the module
const ModeSelectorContainer = styled.div`
	display: flex;
	gap: 3px;
	padding: 3px 5px;
	position: fixed;
	bottom: 8px;
	right: 8px;
	z-index: 100;
	background-color: var(--vscode-editor-background);
	border-radius: 4px;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`

const ModeButton = styled(VSCodeButton)`
	min-width: 32px; /* 너비 축소 */
	height: 18px; /* 높이 설정 */
	&::part(control) {
		padding: 1px 4px;
		font-size: 0.8rem; /* 글자 크기 축소 */
		line-height: 1;
	}
	/* Add tooltip for keyboard shortcuts */
	&::after {
		content: attr(data-shortcut);
		position: absolute;
		top: -18px;
		left: 50%;
		transform: translateX(-50%);
		background-color: var(--vscode-editor-background);
		color: var(--vscode-foreground);
		font-size: 9px;
		padding: 1px 3px;
		border-radius: 2px;
		opacity: 0;
		transition: opacity 0.2s;
	}

	&:hover::after {
		opacity: 1;
	}
`

const SettingsButton = styled(VSCodeButton)`
	flex-shrink: 0;
	&::part(control) {
		padding: 0 6px; /* Adjust padding as needed */
		min-width: auto;
	}
`

// API 재시도 상태 UI 컴포넌트
const RetryStatusContainer = styled.div`
	margin: 8px 0;
	padding: 10px;
	border-radius: 4px;
	background-color: var(--vscode-notifications-background);
	border-left: 3px solid var(--vscode-notifications-foreground);
	color: var(--vscode-notifications-foreground);
	font-size: 0.9rem;
	position: relative;
`

const RetryStatusHeader = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	font-weight: 500;
`

const RetryStatusIcon = styled.span`
	margin-right: 8px;
	color: var(--vscode-notifications-foreground);
`

const RetryStatusInfo = styled.div`
	margin-left: 24px;
	display: flex;
	flex-direction: column;
	gap: 4px;
`

const RetryStatusProgress = styled.div`
	margin-top: 8px;
	height: 4px;
	background-color: var(--vscode-progressBar-background);
	border-radius: 2px;
	overflow: hidden;
`

const RetryStatusProgressBar = styled.div<{ progress: number }>`
	height: 100%;
	width: ${props => props.progress}%;
	background-color: var(--vscode-notifications-foreground);
	transition: width 1s linear;
`

// API 에러 상태 UI 컴포넌트
const ApiErrorContainer = styled.div`
	margin: 8px 0;
	padding: 10px;
	border-radius: 4px;
	background-color: var(--vscode-notificationsErrorIcon-foreground, #f85149);
	color: var(--vscode-foreground);
	font-size: 0.9rem;
	position: relative;
	display: flex;
	align-items: center;
`

const ApiErrorIcon = styled.span`
	margin-right: 8px;
	color: var(--vscode-foreground);
`

const ApiErrorInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`

interface ChatViewProps {
	isHidden: boolean
	showAnnouncement: boolean
	hideAnnouncement: () => void
	showHistoryView: () => void
	onShowSettings?: () => void // Add the new prop type
}

export const MAX_IMAGES_PER_MESSAGE = 20 // Anthropic limits to 20 images

const ChatView = ({ isHidden, showAnnouncement, hideAnnouncement, showHistoryView, onShowSettings }: ChatViewProps) => {
	// Destructure onShowSettings
	const {
		version,
		clineMessages: messages,
		taskHistory,
		apiConfiguration,
		telemetrySetting,
		availableModes, // Get available modes from context
		chatSettings, // Get chat settings from context
		retryStatus, // Get retryStatus from context state
		apiError    // <<< 새로 추가된 API 에러 상태 가져오기
	} = useExtensionState()
	
	// ALT+1~5 단축키 처리 함수
	const handleKeydown = useCallback(
		(e: Event) => {
			const kbEvent = e as KeyboardEvent;
			// ALT 키와 숫자 키가 함께 눌렸을 때 처리
			if (!kbEvent.ctrlKey && kbEvent.altKey && !kbEvent.shiftKey && !kbEvent.metaKey) {
				// 숫자 키 체크 - 숫자 키보드 (1-9)
				const keyNum = parseInt(kbEvent.key);
				
				if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 9) {
					// 모드 인덱스 계산 (0부터 시작)
					const modeIndex = keyNum - 1;
					
					// 사용 가능한 모드 확인 및 범위 체크
					if (availableModes && modeIndex < availableModes.length) {
						const targetMode = availableModes[modeIndex].id;
						
						// 현재 모드와 다른 경우에만 변경
						if (chatSettings.mode !== targetMode) {
							vscode.postMessage({
								type: "updateSettings",
								chatSettings: { ...chatSettings, mode: targetMode },
							});
							kbEvent.preventDefault(); // 기본 동작 방지
							return true; // 이벤트 처리 완료
						}
					}
				}
			}
			return false; // 이벤트 처리 안함
		},
		[availableModes, chatSettings]
	);
	
	// 키보드 이벤트 리스너 등록 (전역 및 입력창 모두에 적용)
	useEvent("keydown", handleKeydown, window)
	

	
	// API 재시도 상태 관리 (진행률 표시용 로컬 상태)
	// const [retryStatus, setRetryStatus] = useState<RetryStatusMessage | null>(null) // Context state 사용으로 변경
	const [retryProgress, setRetryProgress] = useState<number>(0)
	// 재시도 진행 상태를 업데이트하는 타이머 참조
	const retryProgressTimerRef = useRef<number | null>(null)

	const task = useMemo(() => messages.at(0), [messages])
	const modifiedMessages = useMemo(() => combineApiRequests(combineCommandSequences(messages.slice(1))), [messages])
	const apiMetrics = useMemo(() => getApiMetrics(modifiedMessages), [modifiedMessages])

	const lastApiReqTotalTokens = useMemo(() => {
		const getTotalTokensFromApiReqMessage = (msg: ClineMessage) => {
			if (!msg.text) return 0
			try {
				const { tokensIn, tokensOut, cacheWrites, cacheReads }: ClineApiReqInfo = JSON.parse(msg.text)
				return (tokensIn || 0) + (tokensOut || 0) + (cacheWrites || 0) + (cacheReads || 0)
			} catch (e) {
				console.error("Failed to parse API Req Info:", msg.text, e)
				return 0
			}
		}
		const lastApiReqMessage = findLast(modifiedMessages, (msg) => {
			if (msg.say !== "api_req_started") return false
			return getTotalTokensFromApiReqMessage(msg) > 0
		})
		if (!lastApiReqMessage) return undefined
		return getTotalTokensFromApiReqMessage(lastApiReqMessage)
	}, [modifiedMessages])

	const [inputValue, setInputValue] = useState("")
	const textAreaRef = useRef<HTMLTextAreaElement>(null)
	const [textAreaDisabled, setTextAreaDisabled] = useState(false)
	const [selectedImages, setSelectedImages] = useState<string[]>([])
	const [clineAsk, setClineAsk] = useState<ClineAsk | undefined>(undefined)
	const [enableButtons, setEnableButtons] = useState<boolean>(false)
	const [primaryButtonText, setPrimaryButtonText] = useState<string | undefined>("Approve")
	const [secondaryButtonText, setSecondaryButtonText] = useState<string | undefined>("Reject")
	const [didClickCancel, setDidClickCancel] = useState(false)
	const virtuosoRef = useRef<VirtuosoHandle>(null)
	const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const disableAutoScrollRef = useRef(false)
	const [showScrollToBottom, setShowScrollToBottom] = useState(false)
	const [isAtBottom, setIsAtBottom] = useState(false)

	const lastMessage = useMemo(() => messages.at(-1), [messages])
	const secondLastMessage = useMemo(() => messages.at(-2), [messages])
	useEffect(() => {
		if (lastMessage) {
			switch (lastMessage.type) {
				case "ask":
					const isPartial = lastMessage.partial === true
					switch (lastMessage.ask) {
						case "api_req_failed":
							setTextAreaDisabled(true)
							setClineAsk("api_req_failed")
							setEnableButtons(true)
							setPrimaryButtonText("Retry")
							setSecondaryButtonText("Start New Task")
							break
						case "mistake_limit_reached":
							setTextAreaDisabled(false)
							setClineAsk("mistake_limit_reached")
							setEnableButtons(true)
							setPrimaryButtonText("Proceed Anyways")
							setSecondaryButtonText("Start New Task")
							break
						case "auto_approval_max_req_reached":
							setTextAreaDisabled(true)
							setClineAsk("auto_approval_max_req_reached")
							setEnableButtons(true)
							setPrimaryButtonText("Proceed")
							setSecondaryButtonText("Start New Task")
							break
						case "followup":
							setTextAreaDisabled(isPartial)
							setClineAsk("followup")
							setEnableButtons(false)
							break
						case "plan_mode_respond":
							setTextAreaDisabled(isPartial)
							setClineAsk("plan_mode_respond")
							setEnableButtons(false)
							break
						case "tool":
							setTextAreaDisabled(isPartial)
							setClineAsk("tool")
							setEnableButtons(!isPartial)
							try {
								const tool = JSON.parse(lastMessage.text || "{}") as ClineSayTool
								switch (tool.tool) {
									case "editedExistingFile":
									case "newFileCreated":
										setPrimaryButtonText("Save")
										setSecondaryButtonText("Reject")
										break
									default:
										setPrimaryButtonText("Approve")
										setSecondaryButtonText("Reject")
										break
								}
							} catch (e) {
								console.error("Failed to parse tool ask:", lastMessage.text, e)
								setPrimaryButtonText("Approve")
								setSecondaryButtonText("Reject")
							}
							break
						case "browser_action_launch":
							setTextAreaDisabled(isPartial)
							setClineAsk("browser_action_launch")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Approve")
							setSecondaryButtonText("Reject")
							break
						case "command":
							setTextAreaDisabled(isPartial)
							setClineAsk("command")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Run Command")
							setSecondaryButtonText("Reject")
							break
						case "command_output":
							setTextAreaDisabled(false)
							setClineAsk("command_output")
							setEnableButtons(true)
							setPrimaryButtonText("Proceed While Running")
							setSecondaryButtonText(undefined)
							break
						case "use_mcp_server":
							setTextAreaDisabled(isPartial)
							setClineAsk("use_mcp_server")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Approve")
							setSecondaryButtonText("Reject")
							break
						case "completion_result":
							setTextAreaDisabled(isPartial)
							setClineAsk("completion_result")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Start New Task")
							setSecondaryButtonText(undefined)
							break
						case "resume_task":
							setTextAreaDisabled(false)
							setClineAsk("resume_task")
							setEnableButtons(true)
							setPrimaryButtonText("Resume Task")
							setSecondaryButtonText(undefined)
							setDidClickCancel(false)
							break
						case "resume_completed_task":
							setTextAreaDisabled(false)
							setClineAsk("resume_completed_task")
							setEnableButtons(true)
							setPrimaryButtonText("Start New Task")
							setSecondaryButtonText(undefined)
							setDidClickCancel(false)
							break
					}
					break
				case "say":
					switch (lastMessage.say) {
						case "api_req_started":
							if (secondLastMessage?.ask === "command_output") {
								setInputValue("")
								setTextAreaDisabled(true)
								setSelectedImages([])
								setClineAsk(undefined)
								setEnableButtons(false)
							}
							break
						case "task":
						case "error":
						case "api_req_finished":
						case "text":
						case "browser_action":
						case "browser_action_result":
						case "browser_action_launch":
						case "command":
						case "use_mcp_server":
						case "command_output":
						case "mcp_server_request_started":
						case "mcp_server_response":
						case "completion_result":
						case "tool":
							break
					}
					break
			}
		} else {
			setTextAreaDisabled(false)
			setClineAsk(undefined)
			setEnableButtons(false)
			setPrimaryButtonText("Approve")
			setSecondaryButtonText("Reject")
		}
	}, [lastMessage, secondLastMessage])

	useEffect(() => {
		if (messages.length === 0) {
			setTextAreaDisabled(false)
			setClineAsk(undefined)
			setEnableButtons(false)
			setPrimaryButtonText("Approve")
			setSecondaryButtonText("Reject")
		}
	}, [messages.length])

	useEffect(() => {
		setExpandedRows({})
	}, [task?.ts])
	
	// 새로운 useEffect: ExtensionState의 retryStatus 변경 감지 및 UI 업데이트
	useEffect(() => {
		// 기존 타이머 정리
		if (retryProgressTimerRef.current !== null) {
			window.clearInterval(retryProgressTimerRef.current)
			retryProgressTimerRef.current = null
		}

		// 새로운 retryStatus가 있고, 재시도 시간이 있다면 타이머 설정
		if (retryStatus && retryStatus.retryTimestamp && retryStatus.delay) {
			const totalTime = retryStatus.delay // ms
			const endTime = retryStatus.retryTimestamp // ms
			const startTime = endTime - totalTime

			// 현재 시간과 남은 시간 계산
			const now = Date.now()
			const remainingTime = Math.max(0, endTime - now)
			const initialProgress = Math.min(100, Math.max(0, ((now - startTime) / totalTime) * 100))

			// 초기 진행률 설정
			setRetryProgress(initialProgress)

			// 진행률 업데이트 타이머 설정 (100ms 마다)
			if (remainingTime > 0) {
				const step = 100 / (remainingTime / 100) // 100ms 당 증가 퍼센트

				retryProgressTimerRef.current = window.setInterval(() => {
					setRetryProgress(prev => {
						const nextProgress = prev + step

						// 100% 도달 또는 시간 초과 시 타이머 종료
						if (nextProgress >= 100 || Date.now() >= endTime) {
							if (retryProgressTimerRef.current !== null) {
								window.clearInterval(retryProgressTimerRef.current)
								retryProgressTimerRef.current = null
							}

							// 재시도 시간이 지나면 UI에서 상태 표시 제거는 ExtensionState가 null이 될 때 처리됨
							// 따라서 여기서 setRetryStatus(null) 호출 불필요

							return 100
						}
						return nextProgress
					})
				}, 100)
			}
		} else {
			// retryStatus가 null이면 진행률 0으로 초기화
			setRetryProgress(0)
		}

		// 클린업: 컴포넌트 언마운트 또는 retryStatus 변경 시 타이머 제거
		return () => {
			if (retryProgressTimerRef.current !== null) {
				window.clearInterval(retryProgressTimerRef.current)
				retryProgressTimerRef.current = null
			}
		}
	}, [retryStatus]) // retryStatus 상태 변경 시 이 useEffect 실행

	const isStreaming = useMemo(() => {
		const isLastAsk = !!modifiedMessages.at(-1)?.ask
		const isToolCurrentlyAsking = isLastAsk && clineAsk !== undefined && enableButtons && primaryButtonText !== undefined
		if (isToolCurrentlyAsking) return false

		const isLastMessagePartial = modifiedMessages.at(-1)?.partial === true
		if (isLastMessagePartial) return true

		const lastApiReqStarted = findLast(modifiedMessages, (message) => message.say === "api_req_started")
		if (lastApiReqStarted?.text != null && lastApiReqStarted.say === "api_req_started") {
			try {
				const info = JSON.parse(lastApiReqStarted.text)
				if (info.cost === undefined) return true
			} catch (e) {
				console.error("Failed to parse API Req Info for streaming check:", lastApiReqStarted.text, e)
			}
		}
		return false
	}, [modifiedMessages, clineAsk, enableButtons, primaryButtonText])

	const handleSendMessage = useCallback(
		(text: string, images: string[]) => {
			text = text.trim()
			if (text || images.length > 0) {
				if (messages.length === 0) {
					vscode.postMessage({ type: "newTask", text, images })
				} else if (clineAsk) {
					switch (clineAsk) {
						case "followup":
						case "plan_mode_respond":
						case "tool":
						case "browser_action_launch":
						case "command":
						case "command_output":
						case "use_mcp_server":
						case "completion_result":
						case "resume_task":
						case "resume_completed_task":
						case "mistake_limit_reached":
							vscode.postMessage({ type: "askResponse", askResponse: "messageResponse", text, images })
							break
					}
				}
				setInputValue("")
				setTextAreaDisabled(true)
				setSelectedImages([])
				setClineAsk(undefined)
				setEnableButtons(false)
				disableAutoScrollRef.current = false
			}
		},
		[messages.length, clineAsk],
	)

	const startNewTask = useCallback(() => {
		vscode.postMessage({ type: "clearTask" })
	}, [])

	const handlePrimaryButtonClick = useCallback(
		(text?: string, images?: string[]) => {
			const trimmedInput = text?.trim()
			switch (clineAsk) {  // API 오류에서도 재시도 지원
				case "api_req_failed":
				case "command":
				case "command_output":
				case "tool":
				case "browser_action_launch":
				case "use_mcp_server":
				case "resume_task":
				case "mistake_limit_reached":
				case "auto_approval_max_req_reached":				
					vscode.postMessage({
						type: "askResponse",
						askResponse: "yesButtonClicked",
						text: trimmedInput || (images && images.length > 0) ? trimmedInput : undefined,
						images: images && images.length > 0 ? images : undefined,
					})
					setInputValue("")
					setSelectedImages([])
					break
				case "completion_result":
				case "resume_completed_task":
					startNewTask()
					break
			}
			setTextAreaDisabled(true)
			setClineAsk(undefined)
			setEnableButtons(false)
			disableAutoScrollRef.current = false
		},
		[clineAsk, startNewTask],
	)

	const handleSecondaryButtonClick = useCallback(
		(text?: string, images?: string[]) => {
			const trimmedInput = text?.trim()
			if (isStreaming) {
				vscode.postMessage({ type: "cancelTask" })
				setDidClickCancel(true)
				return
			}

			switch (clineAsk) {
				case "api_req_failed":
				case "mistake_limit_reached":
				case "auto_approval_max_req_reached":
					startNewTask()
					break
				case "command":
				case "tool":
				case "browser_action_launch":
				case "use_mcp_server":
					vscode.postMessage({
						type: "askResponse",
						askResponse: "noButtonClicked",
						text: trimmedInput || (images && images.length > 0) ? trimmedInput : undefined,
						images: images && images.length > 0 ? images : undefined,
					})
					setInputValue("")
					setSelectedImages([])
					break
			}
			setTextAreaDisabled(true)
			setClineAsk(undefined)
			setEnableButtons(false)
			disableAutoScrollRef.current = false
		},
		[clineAsk, startNewTask, isStreaming],
	)

	const handleTaskCloseButtonClick = useCallback(() => {
		startNewTask()
	}, [startNewTask])

	const { selectedModelInfo } = useMemo(() => {
		return normalizeApiConfiguration(apiConfiguration)
	}, [apiConfiguration])

	const selectImages = useCallback(() => {
		vscode.postMessage({ type: "selectImages" })
	}, [])

	const shouldDisableImages =
		!selectedModelInfo.supportsImages || textAreaDisabled || selectedImages.length >= MAX_IMAGES_PER_MESSAGE

	const handleMessage = useCallback(
		(e: MessageEvent) => {
			const message: ExtensionMessage = e.data
			switch (message.type) {
				case "action":
					switch (message.action!) {
						case "didBecomeVisible":
							if (!isHidden && !textAreaDisabled && !enableButtons) {
								textAreaRef.current?.focus()
							}
							break
					}
					break
				case "selectedImages":
					const newImages = message.images ?? []
					if (newImages.length > 0) {
						setSelectedImages((prevImages) => [...prevImages, ...newImages].slice(0, MAX_IMAGES_PER_MESSAGE))
					}
					break
				case "addToInput":
					setInputValue((prevValue) => {
						const newText = message.text ?? ""
						return prevValue ? `${prevValue}\n${newText}` : newText
					})
					setTimeout(() => {
						if (textAreaRef.current) {
							textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight
						}
					}, 0)
					break
				case "invoke":
					switch (message.invoke!) {
						case "sendMessage":
							handleSendMessage(message.text ?? "", message.images ?? [])
							break
						case "primaryButtonClick":
							handlePrimaryButtonClick(message.text ?? "", message.images ?? [])
							break
						case "secondaryButtonClick":
							handleSecondaryButtonClick(message.text ?? "", message.images ?? [])
							break
					}
			}
		},
		[isHidden, textAreaDisabled, enableButtons, handleSendMessage, handlePrimaryButtonClick, handleSecondaryButtonClick],
	)

	useEvent("message", handleMessage)

	useMount(() => {
		textAreaRef.current?.focus()
	})

	useEffect(() => {
		const timer = setTimeout(() => {
			if (!isHidden && !textAreaDisabled && !enableButtons) {
				textAreaRef.current?.focus()
			}
		}, 50)
		return () => {
			clearTimeout(timer)
		}
	}, [isHidden, textAreaDisabled, enableButtons])

	const visibleMessages = useMemo(() => {
		return modifiedMessages.filter((message) => {
			switch (message.ask) {
				case "completion_result":
					if (message.text === "") return false
					break
				case "api_req_failed":
				case "resume_task":
				case "resume_completed_task":
					return false
			}
			switch (message.say) {
				case "api_req_finished":
				case "api_req_retried":
				case "deleted_api_reqs":
					return false
				case "text":
					if ((message.text ?? "") === "" && (message.images?.length ?? 0) === 0) return false
					break
				case "mcp_server_request_started":
					return false
			}
			return true
		})
	}, [modifiedMessages])

	const isBrowserSessionMessage = (message: ClineMessage): boolean => {
		if (message.type === "ask") return ["browser_action_launch"].includes(message.ask!)
		if (message.type === "say")
			return ["browser_action_launch", "api_req_started", "text", "browser_action", "browser_action_result"].includes(
				message.say!,
			)
		return false
	}

	const groupedMessages = useMemo(() => {
		const result: (ClineMessage | ClineMessage[])[] = []
		let currentGroup: ClineMessage[] = []
		let isInBrowserSession = false
		const endBrowserSession = () => {
			if (currentGroup.length > 0) {
				result.push([...currentGroup])
				currentGroup = []
				isInBrowserSession = false
			}
		}
		visibleMessages.forEach((message) => {
			if (message.ask === "browser_action_launch" || message.say === "browser_action_launch") {
				endBrowserSession()
				isInBrowserSession = true
				currentGroup.push(message)
			} else if (isInBrowserSession) {
				if (message.say === "api_req_started") {
					const lastApiReqStarted = [...currentGroup].reverse().find((m) => m.say === "api_req_started")
					if (lastApiReqStarted?.text != null) {
						try {
							const info = JSON.parse(lastApiReqStarted.text)
							if (info.cancelReason != null) {
								endBrowserSession()
								result.push(message)
								return
							}
						} catch (e) {
							console.error("Failed to parse API Req Info for grouping:", lastApiReqStarted.text, e)
						}
					}
				}
				if (isBrowserSessionMessage(message)) {
					currentGroup.push(message)
					if (message.say === "browser_action") {
						try {
							const browserAction = JSON.parse(message.text || "{}") as ClineSayBrowserAction
							if (browserAction.action === "close") endBrowserSession()
						} catch (e) {
							console.error("Failed to parse browser action:", message.text, e)
						}
					}
				} else {
					endBrowserSession()
					result.push(message)
				}
			} else {
				result.push(message)
			}
		})
		if (currentGroup.length > 0) result.push([...currentGroup])
		return result
	}, [visibleMessages])

	// scrolling
	const scrollToBottomSmooth = useMemo(
		() =>
			debounce(
				() => {
					virtuosoRef.current?.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior: "smooth" })
				},
				10,
				{ immediate: true },
			),
		[],
	)
	const scrollToBottomAuto = useCallback(() => {
		virtuosoRef.current?.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior: "auto" })
	}, [])

	const toggleRowExpansion = useCallback(
		(ts: number) => {
			const isCollapsing = expandedRows[ts] ?? false
			const lastGroup = groupedMessages.at(-1)
			const isLast = Array.isArray(lastGroup) ? lastGroup[0].ts === ts : lastGroup?.ts === ts
			const secondToLastGroup = groupedMessages.at(-2)
			const isSecondToLast = Array.isArray(secondToLastGroup)
				? secondToLastGroup[0].ts === ts
				: secondToLastGroup?.ts === ts
			const isLastCollapsedApiReq =
				isLast && !Array.isArray(lastGroup) && lastGroup?.say === "api_req_started" && !expandedRows[lastGroup.ts]
			setExpandedRows((prev) => ({ ...prev, [ts]: !prev[ts] }))
			if (!isCollapsing) disableAutoScrollRef.current = true
			if (isCollapsing && isAtBottom) {
				setTimeout(scrollToBottomAuto, 0)
			} else if (isLast || isSecondToLast) {
				if (isCollapsing) {
					if (isSecondToLast && !isLastCollapsedApiReq) return
					setTimeout(scrollToBottomAuto, 0)
				} else {
					setTimeout(
						() =>
							virtuosoRef.current?.scrollToIndex({
								index: groupedMessages.length - (isLast ? 1 : 2),
								align: "start",
							}),
						0,
					)
				}
			}
		},
		[groupedMessages, expandedRows, scrollToBottomAuto, isAtBottom],
	)

	const handleRowHeightChange = useCallback(
		(isTaller: boolean) => {
			if (!disableAutoScrollRef.current) {
				if (isTaller) scrollToBottomSmooth()
				else setTimeout(scrollToBottomAuto, 0)
			}
		},
		[scrollToBottomSmooth, scrollToBottomAuto],
	)
	useEffect(() => {
		if (!disableAutoScrollRef.current) setTimeout(scrollToBottomSmooth, 50)
	}, [groupedMessages.length, scrollToBottomSmooth])
	const handleWheel = useCallback((event: Event) => {
		const wheelEvent = event as WheelEvent
		if (wheelEvent.deltaY && wheelEvent.deltaY < 0 && scrollContainerRef.current?.contains(wheelEvent.target as Node))
			disableAutoScrollRef.current = true
	}, [])
	useEvent("wheel", handleWheel, window, { passive: true })

	const placeholderText = useMemo(() => (task ? "Type a message..." : "Type your task here..."), [task])

	const itemContent = useCallback(
		(index: number, messageOrGroup: ClineMessage | ClineMessage[]) => {
			if (Array.isArray(messageOrGroup)) {
				return (
					<BrowserSessionRow
						messages={messageOrGroup}
						isLast={index === groupedMessages.length - 1}
						lastModifiedMessage={modifiedMessages.at(-1)}
						onHeightChange={handleRowHeightChange}
						isExpanded={(ts) => expandedRows[ts] ?? false}
						onToggleExpand={(ts) => setExpandedRows((prev) => ({ ...prev, [ts]: !prev[ts] }))}
					/>
				)
			}
			return (
				<ChatRow
					key={messageOrGroup.ts}
					message={messageOrGroup}
					isExpanded={expandedRows[messageOrGroup.ts] || false}
					onToggleExpand={() => toggleRowExpansion(messageOrGroup.ts)}
					lastModifiedMessage={modifiedMessages.at(-1)}
					isLast={index === groupedMessages.length - 1}
					onHeightChange={handleRowHeightChange}
				/>
			)
		},
		[expandedRows, modifiedMessages, groupedMessages.length, toggleRowExpansion, handleRowHeightChange],
	)

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: isHidden ? "none" : "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}>
			{task ? (
				<TaskHeader
					task={task}
					tokensIn={apiMetrics.totalTokensIn}
					tokensOut={apiMetrics.totalTokensOut}
					doesModelSupportPromptCache={selectedModelInfo.supportsPromptCache}
					cacheWrites={apiMetrics.totalCacheWrites}
					cacheReads={apiMetrics.totalCacheReads}
					totalCost={apiMetrics.totalCost}
					lastApiReqTotalTokens={lastApiReqTotalTokens}
					onClose={handleTaskCloseButtonClick}
				/>
			) : (
				<div
					style={{
						flex: "1 1 0",
						minHeight: 0,
						overflowY: "auto",
						display: "flex",
						flexDirection: "column",
						paddingBottom: "10px",
					}}>
					{" "}
					{telemetrySetting === "unset" && <TelemetryBanner />}{" "}
					{showAnnouncement && <Announcement version={version} hideAnnouncement={hideAnnouncement} />}{" "}
					<div style={{ padding: "0 20px", flexShrink: 0 }}>
						{" "}
						<h2>What can I do for you?</h2>{" "}
						<p>
							{" "}
							Thanks to{" "}
							<VSCodeLink href="https://www.anthropic.com/claude/sonnet" style={{ display: "inline" }}>
								{" "}
								Claude 3.7 Sonnet's{" "}
							</VSCodeLink>{" "}
							agentic coding capabilities, I can handle complex software development tasks step-by-step. With tools
							that let me create & edit files, explore complex projects, use a browser, and execute terminal
							commands (after you grant permission), I can assist you in ways that go beyond code completion or tech
							support. I can even use MCP to create new tools and extend my own capabilities.{" "}
						</p>{" "}
					</div>{" "}
					{taskHistory.length > 0 && <HistoryPreview showHistoryView={showHistoryView} />}{" "}
				</div>
			)}

			{!task && <AutoApproveMenu style={{ marginBottom: -2, flex: "0 1 auto", minHeight: 0 }} />}

			{task && (
				<>
					<div style={{ flexGrow: 1, display: "flex" }} ref={scrollContainerRef}>
						<Virtuoso
							ref={virtuosoRef}
							key={task.ts}
							className="scrollable"
							style={{ flexGrow: 1, overflowY: "scroll" }}
							components={{ Footer: () => <div style={{ height: 5 }} /> }}
							increaseViewportBy={{ top: 3_000, bottom: Number.MAX_SAFE_INTEGER }}
							data={groupedMessages}
							itemContent={itemContent}
							atBottomStateChange={(atBottom) => {
								setIsAtBottom(atBottom)
								if (atBottom) disableAutoScrollRef.current = false
								setShowScrollToBottom(disableAutoScrollRef.current && !atBottom)
							}}
							atBottomThreshold={10}
							initialTopMostItemIndex={groupedMessages.length - 1}
						/>
					</div>
					{/* API 재시도 상태 UI */}
					{retryStatus && (
						<RetryStatusContainer>
							<RetryStatusIcon>
								<AlertIcon size={16} />
							</RetryStatusIcon>
							<RetryStatusInfo>
								<span>
									{retryStatus.attempt}/{retryStatus.maxRetries}회, {Math.round(retryStatus.delay / 1000)}초 후 재시도
								</span>
								{retryStatus.retryTimestamp && retryStatus.delay && (
									<RetryStatusProgress>
										<RetryStatusProgressBar progress={retryProgress} />
									</RetryStatusProgress>
								)}
							</RetryStatusInfo>
						</RetryStatusContainer>
					)}

					{/* API 최종 에러 상태 UI */}
					{apiError && (
						<ApiErrorContainer> {/* 새 Styled Component 또는 기존 컴포넌트 재활용 */}
							<ApiErrorIcon> {/* 아이콘 스타일 */}
								<AlertIcon size={16} />
							</ApiErrorIcon>
							<ApiErrorInfo> {/* 메시지 스타일 */}
								<span>{apiError.message}</span>
							</ApiErrorInfo>
						</ApiErrorContainer>
					)}

					<AutoApproveMenu />
					{showScrollToBottom ? (
						<div style={{ display: "flex", padding: "10px 15px 0px 15px" }}>
							{" "}
							<ScrollToBottomButton
								onClick={() => {
									scrollToBottomSmooth()
									disableAutoScrollRef.current = false
								}}>
								{" "}
								<span className="codicon codicon-chevron-down" style={{ fontSize: "18px" }}></span>{" "}
							</ScrollToBottomButton>{" "}
						</div>
					) : (
						<div
							style={{
								opacity:
									primaryButtonText || secondaryButtonText || isStreaming
										? enableButtons || (isStreaming && !didClickCancel)
											? 1
											: 0.5
										: 0,
								display: "flex",
								padding: `${primaryButtonText || secondaryButtonText || isStreaming ? "10" : "0"}px 15px 0px 15px`,
							}}>
							{" "}
							{primaryButtonText && !isStreaming && (
								<VSCodeButton
									appearance="primary"
									disabled={!enableButtons}
									style={{ flex: secondaryButtonText ? 1 : 2, marginRight: secondaryButtonText ? "6px" : "0" }}
									onClick={() => handlePrimaryButtonClick(inputValue, selectedImages)}>
									{" "}
									{primaryButtonText}{" "}
								</VSCodeButton>
							)}{" "}
							{(secondaryButtonText || isStreaming) && (
								<VSCodeButton
									appearance="secondary"
									disabled={!enableButtons && !(isStreaming && !didClickCancel)}
									style={{ flex: isStreaming ? 2 : 1, marginLeft: isStreaming ? 0 : "6px" }}
									onClick={() => handleSecondaryButtonClick(inputValue, selectedImages)}>
									{" "}
									{isStreaming ? "Cancel" : secondaryButtonText}{" "}
								</VSCodeButton>
							)}{" "}
						</div>
					)}
				</>
			)}

			{/* Mode Selector Buttons - 항상 표시 */}
			<ModeSelectorContainer>
				{availableModes && availableModes.length > 0 ? (
					// 모드 데이터가 있는 경우
					availableModes.map((modeInfo, index) => (
						<ModeButton
							key={modeInfo.id}
							appearance={chatSettings.mode === modeInfo.id ? "primary" : "secondary"}
							data-shortcut={`Ctrl+${index + 1}`}
							onClick={() => {
								if (chatSettings.mode !== modeInfo.id) {
									vscode.postMessage({
										type: "updateSettings", // 컨트롤러에서 처리하는 메시지 타입
										chatSettings: { ...chatSettings, mode: modeInfo.id },
									})
								}
							}}>
							{modeInfo.label || modeInfo.id}
						</ModeButton>
					))
				) : (
					// 모드 데이터가 없는 경우 기본 모드 버튼 표시
					<>
						{[
							{ id: "arch", label: "Arch", shortcut: 1 },
							{ id: "dev", label: "Dev", shortcut: 2 },
							{ id: "rule", label: "Rule", shortcut: 3 },
							{ id: "talk", label: "Talk", shortcut: 4 }
						].map((fallbackMode, index) => (
							<ModeButton
								key={fallbackMode.id}
								appearance={chatSettings.mode === fallbackMode.id ? "primary" : "secondary"}
								data-shortcut={`Ctrl+${fallbackMode.shortcut}`}
								onClick={() => {
									if (chatSettings.mode !== fallbackMode.id) {
										vscode.postMessage({
											type: "updateSettings",
											chatSettings: { ...chatSettings, mode: fallbackMode.id },
										})
									}
								}}>
								{fallbackMode.label}
							</ModeButton>
						))}
					</>
				)}
				{/* 설정 버튼 추가 (필요한 경우) */}
				{/* <SettingsButton appearance="icon" aria-label="Settings" onClick={onShowSettings}>
					<span className="codicon codicon-gear" />
				</SettingsButton> */}
			</ModeSelectorContainer>

			<ChatTextArea
				ref={textAreaRef}
				inputValue={inputValue}
				setInputValue={setInputValue}
				textAreaDisabled={textAreaDisabled}
				placeholderText={placeholderText}
				selectedImages={selectedImages}
				setSelectedImages={setSelectedImages}
				onSend={() => handleSendMessage(inputValue, selectedImages)}
				onSelectImages={selectImages}
				shouldDisableImages={shouldDisableImages}
				onHeightChange={() => {
					if (isAtBottom) scrollToBottomAuto()
				}}
			/>
		</div>
	)
}

const ScrollToBottomButton = styled.div`
	background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 55%, transparent);
	border-radius: 3px;
	overflow: hidden;
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
	flex: 1;
	height: 25px;

	&:hover {
		background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 90%, transparent);
	}

	&:active {
		background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 70%, transparent);
	}
`

export default ChatView // Ensure default export exists
