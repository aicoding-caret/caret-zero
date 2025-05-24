import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import debounce from "debounce"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useDeepCompareEffect, useEvent, useMount } from "react-use"
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso"
import styled from "styled-components"
import {
	CaretApiReqInfo,
	CaretAsk,
	CaretMessage,
	CaretSayBrowserAction,
	CaretSayTool,
	ExtensionMessage,
} from "@shared/ExtensionMessage"
import { findLast } from "@shared/array"
import { combineApiRequests } from "@shared/combineApiRequests"
import { combineCommandSequences } from "@shared/combineCommandSequences"
import { getApiMetrics } from "@shared/getApiMetrics"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"
import { TaskServiceClient, SlashServiceClient, FileServiceClient } from "@/services/grpc-client"
import HistoryPreview from "@/components/history/HistoryPreview"
import { normalizeApiConfiguration } from "@/components/settings/ApiOptions"
import Announcement from "@/components/chat/Announcement"
import BrowserSessionRow from "@/components/chat/BrowserSessionRow"
import ChatRow from "@/components/chat/ChatRow"
import ChatTextArea from "@/components/chat/ChatTextArea"
import QuotedMessagePreview from "@/components/chat/QuotedMessagePreview"
import TaskHeader from "@/components/chat/TaskHeader"
import TelemetryBanner from "@/components/common/TelemetryBanner"
import { unified } from "unified"
import remarkStringify from "remark-stringify"
import rehypeRemark from "rehype-remark"
import rehypeParse from "rehype-parse"
import HomeHeader from "../welcome/HomeHeader"
import AutoApproveBar from "./auto-approve-menu/AutoApproveBar"
// 추출한 Hook 임포트
import {
	useMessageState,
	useScrollControl,
	useChatInputState,
	useCaretAskState,
	useBrowserSessionState,
	useModeShortcuts
} from "./chat_hooks"

// import { normalizeApiConfiguration } from "../settings/ApiOptions"
import { WebviewMessage } from "@shared/WebviewMessage"

interface ChatViewProps {
	isHidden: boolean
	showAnnouncement: boolean
	hideAnnouncement: () => void
	showHistoryView: () => void
	onShowSettings: () => void
}

// Function to clean up markdown escape characters
function cleanupMarkdownEscapes(markdown: string): string {
	return (
		markdown
			// Handle underscores and asterisks (single or multiple)
			.replace(/\\([_*]+)/g, "$1")

			// Handle angle brackets (for generics and XML)
			.replace(/\\([<>])/g, "$1")

			// Handle backticks (for code)
			.replace(/\\(`)/g, "$1")

			// Handle other common markdown special characters
			.replace(/\\([[\]()#.!])/g, "$1")

			// Fix multiple consecutive backslashes
			.replace(/\\{2,}([_*`<>[\]()#.!])/g, "$1")
	)
}

async function convertHtmlToMarkdown(html: string) {
	// Process the HTML to Markdown
	const result = await unified()
		.use(rehypeParse as any, { fragment: true }) // Parse HTML fragments
		.use(rehypeRemark as any) // Convert HTML to Markdown AST
		.use(remarkStringify as any, {
			// Convert Markdown AST to text
			bullet: "-", // Use - for unordered lists
			emphasis: "*", // Use * for emphasis
			strong: "_", // Use _ for strong
			listItemIndent: "one", // Use one space for list indentation
			rule: "-", // Use - for horizontal rules
			ruleSpaces: false, // No spaces in horizontal rules
			fences: true,
			escape: false,
			entities: false,
		})
		.process(html)

	const md = String(result)
	// Apply comprehensive cleanup of escape characters
	return cleanupMarkdownEscapes(md)
}

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
	width: ${(props) => props.progress}%;
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

// ModeSelectorContainer와 ModeButton 정의
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

// ScrollToBottomButton 정의
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

interface ChatViewProps {
	isHidden: boolean
	showAnnouncement: boolean
	hideAnnouncement: () => void
	showHistoryView: () => void
	onShowSettings: () => void
}

// 리팩토링 전 코드와의 호환성을 위해 상수 export
export const MAX_IMAGES_PER_MESSAGE = 20 // Anthropic limits to 20 images

const ChatView = ({ isHidden, showAnnouncement, hideAnnouncement, showHistoryView, onShowSettings }: ChatViewProps) => {
	const {
		// 원래대로 필요한 상태 직접 구조 분해 할당
		version,
		caretMessages: messages,
		taskHistory,
		apiConfiguration,
		telemetrySetting,
		availableModes,
		chatSettings,
		retryStatus,
		apiError,
		// currentTaskItem 가져오기
		currentTaskItem,
	} = useExtensionState()

	//const task = messages.length > 0 ? (messages[0].say === "task" ? messages[0] : undefined) : undefined) : undefined
	const task = useMemo(() => messages.at(0), [messages]) // leaving this less safe version here since if the first message is not a task, then the extension is in a bad state and needs to be debugged (see Caret.abort)
	const modifiedMessages = useMemo(() => combineApiRequests(combineCommandSequences(messages.slice(1))), [messages])
	// has to be after api_req_finished are all reduced into api_req_started messages
	const apiMetrics = useMemo(() => getApiMetrics(modifiedMessages), [modifiedMessages])

	const lastApiReqTotalTokens = useMemo(() => {
		const getTotalTokensFromApiReqMessage = (msg: CaretMessage) => {
			if (!msg.text) return 0
			const { tokensIn, tokensOut, cacheWrites, cacheReads }: CaretApiReqInfo = JSON.parse(msg.text)
			return (tokensIn || 0) + (tokensOut || 0) + (cacheWrites || 0) + (cacheReads || 0)
		}
		const lastApiReqMessage = findLast(modifiedMessages, (msg) => {
			if (msg.say !== "api_req_started") return false
			return getTotalTokensFromApiReqMessage(msg) > 0
		})
		if (!lastApiReqMessage) return undefined
		return getTotalTokensFromApiReqMessage(lastApiReqMessage)
	}, [modifiedMessages])

	const [inputValue, setInputValue] = useState("")
	const [activeQuote, setActiveQuote] = useState<string | null>(null)
	const [isTextAreaFocused, setIsTextAreaFocused] = useState(false)
	const textAreaRef = useRef<HTMLTextAreaElement>(null)
	const [sendingDisabled, setSendingDisabled] = useState(false)
	const [selectedImages, setSelectedImages] = useState<string[]>([])

	// we need to hold on to the ask because useEffect > lastMessage will always let us know when an ask comes in and handle it, but by the time handleMessage is called, the last message might not be the ask anymore (it could be a say that followed)
	const [caretAsk, setCaretAsk] = useState<CaretAsk | undefined>(undefined)
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

	useEffect(() => {
		const handleCopy = async (e: ClipboardEvent) => {
			const targetElement = e.target as HTMLElement | null
			// If the copy event originated from an input or textarea,
			// let the default browser behavior handle it.
			if (
				targetElement &&
				(targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA" || targetElement.isContentEditable)
			) {
				return
			}

			if (window.getSelection) {
				const selection = window.getSelection()
				if (selection && selection.rangeCount > 0) {
					const range = selection.getRangeAt(0)
					const commonAncestor = range.commonAncestorContainer
					let textToCopy: string | null = null

					// Check if the selection is inside an element where plain text copy is preferred
					let currentElement =
						commonAncestor.nodeType === Node.ELEMENT_NODE
							? (commonAncestor as HTMLElement)
							: commonAncestor.parentElement
					let preferPlainTextCopy = false
					while (currentElement) {
						if (currentElement.tagName === "PRE" && currentElement.querySelector("code")) {
							preferPlainTextCopy = true
							break
						}
						// Check computed white-space style
						const computedStyle = window.getComputedStyle(currentElement)
						if (
							computedStyle.whiteSpace === "pre" ||
							computedStyle.whiteSpace === "pre-wrap" ||
							computedStyle.whiteSpace === "pre-line"
						) {
							// If the element itself or an ancestor has pre-like white-space,
							// and the selection is likely contained within it, prefer plain text.
							// This helps with elements like the TaskHeader's text display.
							preferPlainTextCopy = true
							break
						}

						// Stop searching if we reach a known chat message boundary or body
						if (
							currentElement.classList.contains("chat-row-assistant-message-container") ||
							currentElement.classList.contains("chat-row-user-message-container") ||
							currentElement.tagName === "BODY"
						) {
							break
						}
						currentElement = currentElement.parentElement
					}

					if (preferPlainTextCopy) {
						// For code blocks or elements with pre-formatted white-space, get plain text.
						textToCopy = selection.toString()
					} else {
						// For other content, use the existing HTML-to-Markdown conversion
						const clonedSelection = range.cloneContents()
						const div = document.createElement("div")
						div.appendChild(clonedSelection)
						const selectedHtml = div.innerHTML
						textToCopy = await convertHtmlToMarkdown(selectedHtml)
					}

					if (textToCopy !== null) {
						vscode.postMessage({ type: "copyToClipboard", text: textToCopy })
						e.preventDefault()
					}
				}
			}
		}
		document.addEventListener("copy", handleCopy)

		return () => {
			document.removeEventListener("copy", handleCopy)
		}
	}, [])

	// UI layout depends on the last 2 messages
	// (since it relies on the content of these messages, we are deep comparing. i.e. the button state after hitting button sets enableButtons to false, and this effect otherwise would have to true again even if messages didn't change
	const lastMessage = useMemo(() => messages.at(-1), [messages])
	const secondLastMessage = useMemo(() => messages.at(-2), [messages])
	useDeepCompareEffect(() => {
		// if last message is an ask, show user ask UI
		// if user finished a task, then start a new task with a new conversation history since in this moment that the extension is waiting for user response, the user could close the extension and the conversation history would be lost.
		// basically as long as a task is active, the conversation history will be persisted
		if (lastMessage) {
			switch (lastMessage.type) {
				case "ask":
					const isPartial = lastMessage.partial === true
					switch (lastMessage.ask) {
						case "api_req_failed":
							setSendingDisabled(true)
							setCaretAsk("api_req_failed")
							setEnableButtons(true)
							setPrimaryButtonText("Retry")
							setSecondaryButtonText("Start New Task")
							break
						case "mistake_limit_reached":
							setSendingDisabled(false)
							setCaretAsk("mistake_limit_reached")
							setEnableButtons(true)
							setPrimaryButtonText("Proceed Anyways")
							setSecondaryButtonText("Start New Task")
							break
						case "auto_approval_max_req_reached":
							setSendingDisabled(true)
							setCaretAsk("auto_approval_max_req_reached")
							setEnableButtons(true)
							setPrimaryButtonText("Proceed")
							setSecondaryButtonText("Start New Task")
							break
						case "followup":
							setSendingDisabled(isPartial)
							setCaretAsk("followup")
							setEnableButtons(false)
							// setPrimaryButtonText(undefined)
							// setSecondaryButtonText(undefined)
							break
						case "plan_mode_respond":
							setSendingDisabled(isPartial)
							setCaretAsk("plan_mode_respond")
							setEnableButtons(false)
							// setPrimaryButtonText(undefined)
							// setSecondaryButtonText(undefined)
							break
						case "tool":
							setSendingDisabled(isPartial)
							setCaretAsk("tool")
							setEnableButtons(!isPartial)
							const tool = JSON.parse(lastMessage.text || "{}") as CaretSayTool
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
							break
						case "browser_action_launch":
							setSendingDisabled(isPartial)
							setCaretAsk("browser_action_launch")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Approve")
							setSecondaryButtonText("Reject")
							break
						case "command":
							setSendingDisabled(isPartial)
							setCaretAsk("command")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Run Command")
							setSecondaryButtonText("Reject")
							break
						case "command_output":
							setSendingDisabled(false)
							setCaretAsk("command_output")
							setEnableButtons(true)
							setPrimaryButtonText("Proceed While Running")
							setSecondaryButtonText(undefined)
							break
						case "use_mcp_server":
							setSendingDisabled(isPartial)
							setCaretAsk("use_mcp_server")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Approve")
							setSecondaryButtonText("Reject")
							break
						case "completion_result":
							// extension waiting for feedback. but we can just present a new task button
							setSendingDisabled(isPartial)
							setCaretAsk("completion_result")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Start New Task")
							setSecondaryButtonText(undefined)
							break
						case "resume_task":
							setSendingDisabled(false)
							setCaretAsk("resume_task")
							setEnableButtons(true)
							setPrimaryButtonText("Resume Task")
							setSecondaryButtonText(undefined)
							setDidClickCancel(false) // special case where we reset the cancel button state
							break
						case "resume_completed_task":
							setSendingDisabled(false)
							setCaretAsk("resume_completed_task")
							setEnableButtons(true)
							setPrimaryButtonText("Start New Task")
							setSecondaryButtonText(undefined)
							setDidClickCancel(false)
							break
						case "new_task":
							setSendingDisabled(isPartial)
							setCaretAsk("new_task")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Start New Task with Context")
							setSecondaryButtonText(undefined)
							break
						case "condense":
							setSendingDisabled(isPartial)
							setCaretAsk("condense")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Condense Conversation")
							setSecondaryButtonText(undefined)
							break
						case "report_bug":
							setSendingDisabled(isPartial)
							setCaretAsk("report_bug")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Report GitHub issue")
							setSecondaryButtonText(undefined)
							break
					}
					break
				case "say":
					// don't want to reset since there could be a "say" after an "ask" while ask is waiting for response
					switch (lastMessage.say) {
						case "api_req_started":
							if (secondLastMessage?.ask === "command_output") {
								// if the last ask is a command_output, and we receive an api_req_started, then that means the command has finished and we don't need input from the user anymore (in every other case, the user has to interact with input field or buttons to continue, which does the following automatically)
								setInputValue("")
								setSendingDisabled(true)
								setSelectedImages([])
								setCaretAsk(undefined)
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
						case "load_mcp_documentation":
							break
					}
					break
			}
		} else {
			// this would get called after sending the first message, so we have to watch messages.length instead
			// No messages, so user has to submit a task
			// setTextAreaDisabled(false)
			// setCaretAsk(undefined)
			// setPrimaryButtonText(undefined)
			// setSecondaryButtonText(undefined)
		}
	}, [lastMessage, secondLastMessage])

	useEffect(() => {
		if (messages.length === 0) {
			setSendingDisabled(false)
			setCaretAsk(undefined)
			setEnableButtons(false)
			setPrimaryButtonText("Approve")
			setSecondaryButtonText("Reject")
		}
	}, [messages.length])

	useEffect(() => {
		setExpandedRows({})
	}, [task?.ts])

	const isStreaming = useMemo(() => {
		const isLastAsk = !!modifiedMessages.at(-1)?.ask // checking caretAsk isn't enough since messages effect may be called again for a tool for example, set caretAsk to its value, and if the next message is not an ask then it doesn't reset. This is likely due to how much more often we're updating messages as compared to before, and should be resolved with optimizations as it's likely a rendering bug. but as a final guard for now, the cancel button will show if the last message is not an ask
		const isToolCurrentlyAsking = isLastAsk && caretAsk !== undefined && enableButtons && primaryButtonText !== undefined
		if (isToolCurrentlyAsking) {
			return false
		}

		const isLastMessagePartial = modifiedMessages.at(-1)?.partial === true
		if (isLastMessagePartial) {
			return true
		} else {
			const lastApiReqStarted = findLast(modifiedMessages, (message) => message.say === "api_req_started")
			if (lastApiReqStarted && lastApiReqStarted.text != null && lastApiReqStarted.say === "api_req_started") {
				const cost = JSON.parse(lastApiReqStarted.text).cost
				if (cost === undefined) {
					// api request has not finished yet
					return true
				}
			}
		}

		return false
	}, [modifiedMessages, caretAsk, enableButtons, primaryButtonText])

	// 안전한 messages 배열 생성
	const safeMessages: CaretMessage[] = messages ?? [];

	// 메시지 상태 관리 Hook
	const { isExpanded, toggleExpand } = useMessageState(
		// safeMessages 사용
		safeMessages
	)

	const handleSendMessage = useCallback(
		async (text: string, images: string[]) => {
			let messageToSend = text.trim()
			const hasContent = messageToSend || images.length > 0

			// Prepend the active quote if it exists
			if (activeQuote && hasContent) {
				const prefix = "[context] \n> "
				const formattedQuote = activeQuote
				const suffix = "\n[/context] \n\n"
				messageToSend = `${prefix} ${formattedQuote} ${suffix} ${messageToSend}`
			}

			if (hasContent) {
				console.log("[ChatView] handleSendMessage - Sending message:", messageToSend)
				if (messages.length === 0) {
					await TaskServiceClient.newTask({ text: messageToSend, images })
				} else if (caretAsk) {
					switch (caretAsk) {
						case "followup":
						case "plan_mode_respond":
						case "tool":
						case "browser_action_launch":
						case "command": // user can provide feedback to a tool or command use
						case "command_output": // user can send input to command stdin
						case "use_mcp_server":
						case "completion_result": // if this happens then the user has feedback for the completion result
						case "resume_task":
						case "resume_completed_task":
						case "mistake_limit_reached":
						case "new_task": // user can provide feedback or reject the new task suggestion
							await TaskServiceClient.askResponse({
								responseType: "messageResponse",
								text: messageToSend,
								images,
							})
							break
						case "condense":
							await TaskServiceClient.askResponse({
								responseType: "messageResponse",
								text: messageToSend,
								images,
							})
							break
						case "report_bug":
							await TaskServiceClient.askResponse({
								responseType: "messageResponse",
								text: messageToSend,
								images,
							})
							break
						// there is no other case that a textfield should be enabled
					}
				}
				setInputValue("")
				setActiveQuote(null) // Clear quote when sending message
				setSendingDisabled(true)
				setSelectedImages([])
				setCaretAsk(undefined)
				setEnableButtons(false)
				// setPrimaryButtonText(undefined)
				// setSecondaryButtonText(undefined)
				disableAutoScrollRef.current = false
			}
		},
		[messages.length, caretAsk, activeQuote],
	)

	const startNewTask = useCallback(async () => {
		setActiveQuote(null) // Clear the active quote state
		await TaskServiceClient.clearTask({})
	}, [])

	/*
	This logic depends on the useEffect[messages] above to set caretAsk, after which buttons are shown and we then send an askResponse to the extension.
	*/
	const handlePrimaryButtonClick = useCallback(
		async (text?: string, images?: string[]) => {
			const trimmedInput = text?.trim()
			switch (caretAsk) {
				case "api_req_failed":
				case "command":
				case "command_output":
				case "tool":
				case "browser_action_launch":
				case "use_mcp_server":
				case "resume_task":
				case "mistake_limit_reached":
				case "auto_approval_max_req_reached":
					if (trimmedInput || (images && images.length > 0)) {
						await TaskServiceClient.askResponse({
							responseType: "yesButtonClicked",
							text: trimmedInput,
							images: images,
						})
					} else {
						await TaskServiceClient.askResponse({
							responseType: "yesButtonClicked",
						})
					}
					// Clear input state after sending
					setInputValue("")
					setActiveQuote(null) // Clear quote when using primary button
					setSelectedImages([])
					break
				case "completion_result":
				case "resume_completed_task":
					// extension waiting for feedback. but we can just present a new task button
					startNewTask()
					break
				case "new_task":
					console.info("new task button clicked!", { lastMessage, messages, caretAsk, text })
					await TaskServiceClient.newTask({
						text: lastMessage?.text,
						images: [],
					})
					break
				case "condense":
					await SlashServiceClient.condense({ value: lastMessage?.text }).catch((err) => console.error(err))
					break
				case "report_bug":
					await SlashServiceClient.reportBug({ value: lastMessage?.text }).catch((err) => console.error(err))
					break
			}
			setSendingDisabled(true)
			setCaretAsk(undefined)
			setEnableButtons(false)
			// setPrimaryButtonText(undefined)
			// setSecondaryButtonText(undefined)
			disableAutoScrollRef.current = false
		},
		[caretAsk, startNewTask, lastMessage],
	)

	const handleSecondaryButtonClick = useCallback(
		async (text?: string, images?: string[]) => {
			const trimmedInput = text?.trim()
			if (isStreaming) {
				await TaskServiceClient.cancelTask({})
				setDidClickCancel(true)
				return
			}

			switch (caretAsk) {
				case "api_req_failed":
				case "mistake_limit_reached":
				case "auto_approval_max_req_reached":
					startNewTask()
					break
				case "command":
				case "tool":
				case "browser_action_launch":
				case "use_mcp_server":
					if (trimmedInput || (images && images.length > 0)) {
						await TaskServiceClient.askResponse({
							responseType: "noButtonClicked",
							text: trimmedInput,
							images: images,
						})
					} else {
						// responds to the API with a "This operation failed" and lets it try again
						await TaskServiceClient.askResponse({
							responseType: "noButtonClicked",
						})
					}
					// Clear input state after sending
					setInputValue("")
					setActiveQuote(null) // Clear quote when using secondary button
					setSelectedImages([])
					break
			}
			setSendingDisabled(true)
			setCaretAsk(undefined)
			setEnableButtons(false)
			// setPrimaryButtonText(undefined)
			// setSecondaryButtonText(undefined)
			disableAutoScrollRef.current = false
		},
		[caretAsk, startNewTask, isStreaming],
	)

	const handleTaskCloseButtonClick = useCallback(() => {
		startNewTask()
	}, [startNewTask])

	const handleFocusChange = useCallback((isFocused: boolean) => {
		setIsTextAreaFocused(isFocused)
	}, [])

	const { selectedModelInfo } = useMemo(() => {
		return normalizeApiConfiguration(apiConfiguration)
	}, [apiConfiguration])


	const selectImages = useCallback(async () => {
		try {
			const response = await FileServiceClient.selectImages({})
			if (response && response.values && response.values.length > 0) {
				setSelectedImages((prevImages) => [...prevImages, ...response.values].slice(0, MAX_IMAGES_PER_MESSAGE))
			}
		} catch (error) {
			console.error("Error selecting images:", error)
		}
	}, [])

	const shouldDisableImages = !selectedModelInfo.supportsImages || selectedImages.length >= MAX_IMAGES_PER_MESSAGE

	const handleMessage = useCallback(
		(e: MessageEvent) => {
			const message: ExtensionMessage = e.data
			switch (message.type) {
				case "action":
					switch (message.action!) {
						case "didBecomeVisible":
							if (!isHidden && !sendingDisabled && !enableButtons) {
								textAreaRef.current?.focus()
							}
							break
						case "focusChatInput":
							textAreaRef.current?.focus()
							if (isHidden) {
								// Send message back to extension to show chat view
								vscode.postMessage({ type: "showChatView" })
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
						const newTextWithNewline = newText + "\n"
						return prevValue ? `${prevValue}\n${newTextWithNewline}` : newTextWithNewline
					})
					// Add scroll to bottom after state update
					// Auto focus the input and start the cursor on a new linefor easy typing
					setTimeout(() => {
						if (textAreaRef.current) {
							textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight
							textAreaRef.current.focus()
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
			// textAreaRef.current is not explicitly required here since react guarantees that ref will be stable across re-renders, and we're not using its value but its reference.
		},
		[isHidden, sendingDisabled, enableButtons, handleSendMessage, handlePrimaryButtonClick, handleSecondaryButtonClick],
	)

	useEvent("message", handleMessage)

	useMount(() => {
		// NOTE: the vscode window needs to be focused for this to work
		textAreaRef.current?.focus()
	})

	useEffect(() => {
		const timer = setTimeout(() => {
			if (!isHidden && !sendingDisabled && !enableButtons) {
				textAreaRef.current?.focus()
			}
		}, 50)
		return () => {
			clearTimeout(timer)
		}
	}, [isHidden, sendingDisabled, enableButtons])

	const visibleMessages = useMemo(() => {
		return modifiedMessages.filter((message) => {
			switch (message.ask) {
				case "completion_result":
					// don't show a chat row for a completion_result ask without text. This specific type of message only occurs if caret wants to execute a command as part of its completion result, in which case we interject the completion_result tool with the execute_command tool.
					if (message.text === "") {
						return false
					}
					break
				case "api_req_failed": // this message is used to update the latest api_req_started that the request failed
				case "resume_task":
				case "resume_completed_task":
					return false
			}
			switch (message.say) {
				case "api_req_finished": // combineApiRequests removes this from modifiedMessages anyways
				case "api_req_retried": // this message is used to update the latest api_req_started that the request was retried
				case "deleted_api_reqs": // aggregated api_req metrics from deleted messages
					return false
				case "text":
					// Sometimes caret returns an empty text message, we don't want to render these. (We also use a say text for user messages, so in case they just sent images we still render that)
					if ((message.text ?? "") === "" && (message.images?.length ?? 0) === 0) {
						return false
					}
					break
				case "mcp_server_request_started":
					return false
			}
			return true
		})
	}, [modifiedMessages])

	const isBrowserSessionMessage = (message: CaretMessage): boolean => {
		// which of visible messages are browser session messages, see above

		// NOTE: any messages we want to make as part of a browser session should be included here
		// There was an issue where we added checkpoints after browser actions, and it resulted in browser sessions being disrupted.
		if (message.type === "ask") {
			return ["browser_action_launch"].includes(message.ask!)
		}
		if (message.type === "say") {
			return [
				"browser_action_launch",
				"api_req_started",
				"text",
				"browser_action",
				"browser_action_result",
				"checkpoint_created",
				"reasoning",
			].includes(message.say!)
		}
		return false
	}

	const SettingsButton = styled(VSCodeButton)`
		flex-shrink: 0;
		&::part(control) {
			padding: 0 6px; /* Adjust padding as needed */
			min-width: auto;
		}
	`
	const groupedMessages = useMemo(() => {
		const result: (CaretMessage | CaretMessage[])[] = []
		let currentGroup: CaretMessage[] = []
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
				// complete existing browser session if any
				endBrowserSession()
				// start new
				isInBrowserSession = true
				currentGroup.push(message)
			} else if (isInBrowserSession) {
				// end session if api_req_started is cancelled

				if (message.say === "api_req_started") {
					// get last api_req_started in currentGroup to check if it's cancelled. If it is then this api req is not part of the current browser session
					const lastApiReqStarted = [...currentGroup].reverse().find((m) => m.say === "api_req_started")
					if (lastApiReqStarted?.text != null) {
						const info = JSON.parse(lastApiReqStarted.text)
						const isCancelled = info.cancelReason != null
						if (isCancelled) {
							endBrowserSession()
							result.push(message)
							return
						}
					}
				}

				if (isBrowserSessionMessage(message)) {
					currentGroup.push(message)

					// Check if this is a close action
					if (message.say === "browser_action") {
						const browserAction = JSON.parse(message.text || "{}") as CaretSayBrowserAction
						if (browserAction.action === "close") {
							endBrowserSession()
						}
					}
				} else {
					// complete existing browser session if any
					endBrowserSession()
					result.push(message)
				}
			} else {
				result.push(message)
			}
		})

		// Handle case where browser session is the last group
		if (currentGroup.length > 0) {
			result.push([...currentGroup])
		}

		return result
	}, [visibleMessages])

	// scrolling

	const scrollToBottomSmooth = useMemo(
		() =>
			debounce(
				() => {
					virtuosoRef.current?.scrollTo({
						top: Number.MAX_SAFE_INTEGER,
						behavior: "smooth",
					})
				},
				10,
				{ immediate: true },
			),
		[],
	)

	const scrollToBottomAuto = useCallback(() => {
		virtuosoRef.current?.scrollTo({
			top: Number.MAX_SAFE_INTEGER,
			behavior: "auto", // instant causes crash
		})
	}, [])

	// scroll when user toggles certain rows
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
				isLast &&
				!Array.isArray(lastGroup) && // Make sure it's not a browser session group
				lastGroup?.say === "api_req_started" &&
				!expandedRows[lastGroup.ts]

			setExpandedRows((prev) => ({
				...prev,
				[ts]: !prev[ts],
			}))

			// disable auto scroll when user expands row
			if (!isCollapsing) {
				disableAutoScrollRef.current = true
			}

			if (isCollapsing && isAtBottom) {
				const timer = setTimeout(() => {
					scrollToBottomAuto()
				}, 0)
				return () => clearTimeout(timer)
			} else if (isLast || isSecondToLast) {
				if (isCollapsing) {
					if (isSecondToLast && !isLastCollapsedApiReq) {
						return
					}
					const timer = setTimeout(() => {
						scrollToBottomAuto()
					}, 0)
					return () => clearTimeout(timer)
				} else {
					const timer = setTimeout(() => {
						virtuosoRef.current?.scrollToIndex({
							index: groupedMessages.length - (isLast ? 1 : 2),
							align: "start",
						})
					}, 0)
					return () => clearTimeout(timer)
				}
			}
		},
		[groupedMessages, expandedRows, scrollToBottomAuto, isAtBottom],
	)

	const handleRowHeightChange = useCallback(
		(isTaller: boolean) => {
			if (!disableAutoScrollRef.current) {
				if (isTaller) {
					scrollToBottomSmooth()
				} else {
					setTimeout(() => {
						scrollToBottomAuto()
					}, 0)
				}
			}
		},
		[scrollToBottomSmooth, scrollToBottomAuto],
	)

	useEffect(() => {
		if (!disableAutoScrollRef.current) {
			setTimeout(() => {
				scrollToBottomSmooth()
			}, 50)
			// return () => clearTimeout(timer) // dont cleanup since if visibleMessages.length changes it cancels.
		}
	}, [groupedMessages.length, scrollToBottomSmooth])

	const handleWheel = useCallback((event: Event) => {
		const wheelEvent = event as WheelEvent
		if (wheelEvent.deltaY && wheelEvent.deltaY < 0) {
			if (scrollContainerRef.current?.contains(wheelEvent.target as Node)) {
				// user scrolled up
				disableAutoScrollRef.current = true
			}
		}
	}, [])
	useEvent("wheel", handleWheel, window, { passive: true }) // passive improves scrolling performance

	const placeholderText = useMemo(() => {
		const text = task ? "Type a message..." : "Type your task here..."
		return text
	}, [task])

	const itemContent = useCallback(
		(index: number, messageOrGroup: CaretMessage | CaretMessage[]) => {
			// browser session group
			if (Array.isArray(messageOrGroup)) {
				return (
					<BrowserSessionRow
						messages={messageOrGroup}
						isLast={index === groupedMessages.length - 1}
						lastModifiedMessage={modifiedMessages.at(-1)}
						onHeightChange={handleRowHeightChange}
						// Pass handlers for each message in the group
						isExpanded={(messageTs: number) => expandedRows[messageTs] ?? false}
						onToggleExpand={(messageTs: number) => {
							setExpandedRows((prev) => ({
								...prev,
								[messageTs]: !prev[messageTs],
							}))
						}}
						onSetQuote={setActiveQuote}
					/>
				)
			}

			// We display certain statuses for the last message only
			// If the last message is a checkpoint, we want to show the status of the previous message
			const nextMessage = index < groupedMessages.length - 1 && groupedMessages[index + 1]
			const isNextCheckpoint = !Array.isArray(nextMessage) && nextMessage && nextMessage?.say === "checkpoint_created"
			const isLastMessageGroup = isNextCheckpoint && index === groupedMessages.length - 2

			const isLast = index === groupedMessages.length - 1 || isLastMessageGroup

			// regular message
			return (
				<ChatRow
					key={messageOrGroup.ts}
					message={messageOrGroup}
					isExpanded={expandedRows[messageOrGroup.ts] || false}
					onToggleExpand={() => toggleRowExpansion(messageOrGroup.ts)}
					lastModifiedMessage={modifiedMessages.at(-1)}
					isLast={isLast}
					onHeightChange={handleRowHeightChange}
					inputValue={inputValue}
					sendMessageFromChatRow={handleSendMessage}
					onSetQuote={setActiveQuote}
				/>
			)
		},
		[
			expandedRows,
			modifiedMessages,
			groupedMessages.length,
			toggleRowExpansion,
			handleRowHeightChange,
			inputValue,
			setActiveQuote,
		],
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
						flex: "1 1 0", // flex-grow: 1, flex-shrink: 1, flex-basis: 0
						minHeight: 0,
						overflowY: "auto",
						display: "flex",
						flexDirection: "column",
						paddingBottom: "10px",
					}}>
					{telemetrySetting === "unset" && <TelemetryBanner />}

					{showAnnouncement && <Announcement version={version} hideAnnouncement={hideAnnouncement} />}

					<HomeHeader />
					{taskHistory.length > 0 && <HistoryPreview showHistoryView={showHistoryView} />}
				</div>
			)}

			{!task && <AutoApproveBar />}

			{task && (
				<>
					<div style={{ flexGrow: 1, display: "flex" }} ref={scrollContainerRef}>
						<Virtuoso
							ref={virtuosoRef}
							key={task.ts} // trick to make sure virtuoso re-renders when task changes, and we use initialTopMostItemIndex to start at the bottom
							className="scrollable"
							style={{
								flexGrow: 1,
								overflowY: "scroll", // always show scrollbar
							}}
							components={{
								Footer: () => <div style={{ height: 5 }} />, // Add empty padding at the bottom
							}}
							// increasing top by 3_000 to prevent jumping around when user collapses a row
							increaseViewportBy={{
								top: 3_000,
								bottom: Number.MAX_SAFE_INTEGER,
							}} // hack to make sure the last message is always rendered to get truly perfect scroll to bottom animation when new messages are added (Number.MAX_SAFE_INTEGER is safe for arithmetic operations, which is all virtuoso uses this value for in src/sizeRangeSystem.ts)
							data={groupedMessages} // messages is the raw format returned by extension, modifiedMessages is the manipulated structure that combines certain messages of related type, and visibleMessages is the filtered structure that removes messages that should not be rendered
							itemContent={itemContent}
							atBottomStateChange={(isAtBottom) => {
								setIsAtBottom(isAtBottom)
								if (isAtBottom) {
									disableAutoScrollRef.current = false
								}
								setShowScrollToBottom(disableAutoScrollRef.current && !isAtBottom)
							}}
							atBottomThreshold={10} // anything lower causes issues with followOutput
							initialTopMostItemIndex={groupedMessages.length - 1}
						/>
					</div>
					<AutoApproveBar />
					{showScrollToBottom ? (
						<div
							style={{
								display: "flex",
								padding: "10px 15px 0px 15px",
							}}>
							<ScrollToBottomButton
								onClick={() => {
									scrollToBottomSmooth()
									disableAutoScrollRef.current = false
								}}>
								<span className="codicon codicon-chevron-down" style={{ fontSize: "18px" }}></span>
							</ScrollToBottomButton>
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
							{primaryButtonText && !isStreaming && (
								<VSCodeButton
									appearance="primary"
									disabled={!enableButtons}
									style={{
										flex: secondaryButtonText ? 1 : 2,
										marginRight: secondaryButtonText ? "6px" : "0",
									}}
									onClick={() => handlePrimaryButtonClick(inputValue, selectedImages)}>
									{primaryButtonText}
								</VSCodeButton>
							)}
							{(secondaryButtonText || isStreaming) && (
								<VSCodeButton
									appearance="secondary"
									disabled={!enableButtons && !(isStreaming && !didClickCancel)}
									style={{
										flex: isStreaming ? 2 : 1,
										marginLeft: isStreaming ? 0 : "6px",
									}}
									onClick={() => handleSecondaryButtonClick(inputValue, selectedImages)}>
									{isStreaming ? "Cancel" : secondaryButtonText}
								</VSCodeButton>
							)}
						</div>
					)}
				</>
			)}
			{(() => {
				return activeQuote ? (
					<div style={{ marginBottom: "-12px", marginTop: "10px" }}>
						<QuotedMessagePreview
							text={activeQuote}
							onDismiss={() => setActiveQuote(null)}
							isFocused={isTextAreaFocused}
						/>
					</div>
				) : null
			})()}

			<ChatTextArea
				ref={textAreaRef}
				onFocusChange={handleFocusChange}
				activeQuote={activeQuote}
				inputValue={inputValue}
				setInputValue={setInputValue}
				sendingDisabled={sendingDisabled}
				placeholderText={placeholderText}
				selectedImages={selectedImages}
				setSelectedImages={setSelectedImages}
				onSend={() => handleSendMessage(inputValue, selectedImages)}
				onSelectImages={selectImages}
				shouldDisableImages={shouldDisableImages}
				onHeightChange={() => {
					if (isAtBottom) {
						scrollToBottomAuto()
					}
				}}
			/>
		</div>
	)

	// // // 스크롤 컨트롤 Hook
	// // const {
	// // 	virtuosoRef,
	// // 	scrollContainerRef,
	// // 	isAtBottom,
	// // 	showScrollToBottom,
	// // 	handleScroll,
	// // 	scrollToBottomAuto,
	// // 	scrollToBottomManual,
	// // 	pauseAutoScroll
	// // } = useScrollControl()
	
	// // // 입력 상태 관리 Hook
	// // const {
	// // 	inputValue,
	// // 	setInputValue,
	// // 	textAreaRef,
	// // 	textAreaDisabled,
	// // 	setTextAreaDisabled,
	// // 	selectedImages,
	// // 	setSelectedImages,
	// // 	resetInput,
	// // 	focusTextArea
	// // } = useChatInputState()
	
	// // 자동 스크롤 비활성화 ref
	// // const disableAutoScrollRef = useRef(false)

	// // API 응답 스트리밍 여부 체크 (훅 호출 전에 선언)
	// // const isStreaming = useRef(false)

	// // // Caret 상태 및 버튼 상태 관리 Hook (올바른 인자와 반환값 사용)
	// // const { 
	// // 	caretAsk, 
	// // 	enableButtons, 
	// // 	primaryButtonText, 
	// // 	secondaryButtonText, 
	// // 	didClickCancel, // 이 값은 필요시 UI에 활용 가능
	// // 	resetButtonsState 
	// // 	// safeMessages 사용
	// // } = useCaretAskState(safeMessages, setTextAreaDisabled, resetInput)

	// // 모드 단축키 Hook
	// // availableModes, chatSettings 사용
	// useModeShortcuts(availableModes, chatSettings)

	// // 브라우저 세션 확장 상태 관리
	// const [expandedSessionIds, setExpandedSessionIds] = useState<Set<string>>(new Set());

	// // 브라우저 세션 토글 함수
	// const handleToggleExpand = useCallback((sessionId: string) => {
	// 	setExpandedSessionIds(prevIds => {
	// 		const newIds = new Set(prevIds);
	// 		if (newIds.has(sessionId)) {
	// 			newIds.delete(sessionId);
	// 		} else {
	// 			newIds.add(sessionId);
	// 		}
	// 		return newIds;
	// 	});
	// }, []);

	// // 브라우저 세션 관리 Hook
	// const { groupedMessages, isBrowserSessionMessage } = useBrowserSessionState(modifiedMessages)

	// // 선택된 모델 정보
	// const { selectedModelInfo, selectedProvider } = useMemo(() => {
	// 	// apiConfiguration 사용
	// 	return normalizeApiConfiguration(apiConfiguration)
	// }, [apiConfiguration])
	
	// // // 이미지 업로드 비활성화 여부
	// // const shouldDisableImages =
	// // 	!selectedModelInfo.supportsImages || textAreaDisabled || selectedImages.length >= MAX_IMAGES_PER_MESSAGE

	// // 보여줄 메시지 처리 (마지막 visible 메시지 이후의 것만)
	// const visibleMessages = useMemo(() => {
	// 	return modifiedMessages.filter((message) => {
	// 		// 내부 정보 필터링 - 환경 세부정보, 시스템 프롬프트, 토큰 정보 등
	// 		if (message.text) {
	// 			// 빈 응답 메시지 필터링
	// 			if (message.text === "" && 
	// 				(message.ask === "completion_result" || message.type === "say" && message.say === "text")) {
	// 				return false;
	// 			}
				
	// 			// environment_details 태그가 있는 메시지 필터링
	// 			if (message.text.includes("<environment_details>")) {
	// 				return false;
	// 			}
				
	// 			// 토큰 사용량 정보 필터링
	// 			if (message.text.includes("tokens used") || message.text.includes("\"tokensIn\":")) {
	// 				return false;
	// 			}
				
	// 			// 시스템 프롬프트나 모델 정보 필터링
	// 			if ((message.text.includes("<") && message.text.includes(">")) || 
	// 				message.text.includes("<custom_instructions>") || 
	// 				message.text.includes("<functions>") ||
	// 				message.text.includes("<additional_data>") ||
	// 				message.text.includes("<user_query>") ||
	// 				message.text.includes("<attached_files>")) {
	// 				return false;
	// 			}
				
	// 			// 모드 설명이나 규칙 필터링
	// 			if (message.text.includes("MODE\n") && 
	// 				(message.text.includes("You are in") || message.text.includes("Focus on"))) {
	// 				return false;
	// 			}
				
	// 			// 내부 분석 메시지 필터링 (추가)
	// 			if (message.text.includes("The user is asking") || 
	// 				message.text.includes("I should") || 
	// 				message.text.includes("Based on the project structure") ||
	// 				message.text.includes("translates to")) {
	// 				return false;
	// 			}
	// 		}

	// 		// 특정 메시지 타입 필터링
	// 		switch (message.type) {
	// 			case "say":
	// 				switch (message.say) {
	// 					case "text":
	// 						return true
	// 					case "reasoning":
	// 						return false // 내부 사고 과정은 ChatRowContent에서 처리함
	// 					case "mcp_server_request_started":
	// 						return false
	// 					case "api_req_started":
	// 						// API 요청 시작 메시지는 토큰 정보가 있으면 숨김
	// 						const text = message.text
	// 						return !text || (!message.text?.includes("tokensIn") && !message.text?.includes("tokensOut"))
	// 					case "deleted_api_reqs":
	// 					case "diff_error":
	// 					case "caretignore_error":
	// 					case "shell_integration_warning":
	// 					case "api_req_finished":
	// 					case "api_req_retried":
	// 						return false
	// 					case "user_feedback":
	// 						// 사용자 피드백 표시 (Question 타입)
	// 						return true
	// 					case "tool":
	// 					case "task":
	// 					case "command":
	// 					case "command_output":
	// 					case "error":
	// 					case "use_mcp_server":
	// 					case "mcp_server_response":
	// 					case "completion_result":
	// 					case "browser_action":
	// 					case "browser_action_result":
	// 					case "browser_action_launch":
	// 						return true
	// 					default:
	// 						return false
	// 				}
	// 			case "ask":
	// 				switch (message.ask) {
	// 					case "followup":
	// 					case "plan_mode_respond":
	// 						// Question 타입 메시지 표시 (원본 caret과 동일하게 처리)
	// 						return true
	// 					case "completion_result":
	// 						// completion_result 메시지는 항상 표시
	// 						return true
	// 					case "api_req_failed":
	// 					case "resume_task":
	// 					case "resume_completed_task":
	// 						// 내부 처리 메시지는 표시하지 않음 (원본 caret과 동일하게 처리)
	// 						return false
	// 					default:
	// 						return true
	// 				}
	// 			default:
	// 				return true
	// 		}
	// 	});
	// }, [modifiedMessages]); // 의존성 배열에 modifiedMessages만 추가하여 필요할 때만 재계산

	// // 메시지 높이 변경 처리 - 시그니처 수정
	// const handleRowHeightChange = useCallback(
	// 	(isTaller: boolean) => { // 변경된 시그니처
	// 		if (!isAtBottom) return
	// 		if (isTaller) { // isTaller가 true일 때만 스크롤 (선택적)
	// 			scrollToBottomAuto()
	// 		}
	// 	},
	// 	[isAtBottom, scrollToBottomAuto]
	// )

	// // 스크롤 이벤트 처리
	// const handleWheel = useCallback((event: Event) => {
	// 	const wheelEvent = event as WheelEvent
	// 	if (wheelEvent.deltaY && wheelEvent.deltaY < 0 && scrollContainerRef.current?.contains(wheelEvent.target as Node))
	// 		pauseAutoScroll()
	// }, [pauseAutoScroll, scrollContainerRef])

	// // 스크롤 이벤트 연결
	// useEvent("wheel", handleWheel, window, { passive: true })

	// // 그룹화된 메시지 길이 변경 시 스크롤 처리
	// useEffect(() => {
	// 	setTimeout(scrollToBottomManual, 50)
	// }, [groupedMessages.length, scrollToBottomManual])

	// // 텍스트 영역 placeholder 텍스트
	// const placeholderText = task ? "Type a message..." : "Type your task here..."

	// // 메시지 렌더링 함수
	// const itemContent = useCallback(
	// 	(index: number, messageOrGroup: any) => {
	// 		if (Array.isArray(messageOrGroup)) {
	// 			// 브라우저 세션 그룹 렌더링
	// 			return (
	// 				<BrowserSessionRow
	// 					key={messageOrGroup[0].ts} // 그룹의 첫 메시지 ts를 key로 사용
	// 					messages={messageOrGroup} // 'group' -> 'messages'
	// 					onHeightChange={handleRowHeightChange}
	// 					// 확장 상태 확인 함수 전달 (ts를 string으로 변환)
	// 					isExpanded={(ts) => expandedSessionIds.has(String(ts))} // 수정: String(ts)
	// 					// 토글 핸들러 호출 시 ts를 string으로 변환
	// 					onToggleExpand={() => handleToggleExpand(String(messageOrGroup[0].ts))} // 수정: String(ts)
	// 					isLast={index === groupedMessages.length - 1}
	// 				/>
	// 			)
	// 		} else {
	// 			// 일반 메시지 렌더링
	// 			const message = messageOrGroup
	// 			return (
	// 				<ChatRow
	// 					key={message.ts}
	// 					message={message}
	// 					onHeightChange={handleRowHeightChange}
	// 					isLast={index === groupedMessages.length - 1}
	// 					isExpanded={isExpanded(message.ts)} // 원래대로 함수 호출 결과 전달
	// 					onToggleExpand={() => toggleExpand(message.ts)}
	// 				/>
	// 			)
	// 		}
	// 	},
	// 	// 의존성 배열에 expandedSessionIds와 handleToggleExpand 추가
	// 	[groupedMessages, handleRowHeightChange, isExpanded, toggleExpand, expandedSessionIds, handleToggleExpand]
	// )

	// // 메시지 전송 핸들러
	// const handleSendMessage = (text: string, images: string[]) => {
	// 	const trimmedText = text.trim(); // Trim text once
	// 	if (!trimmedText && images.length === 0) return

	// 	if (trimmedText === "안녕") {
	// 		vscode.postMessage({
	// 			type: "askResponse",
	// 			askResponse: "messageResponse",
	// 			text: "안녕하세요! 무엇을 도와드릴까요?",
	// 			images: [],
	// 		});
	// 		setInputValue("");
	// 		setSelectedImages([]);
	// 		setTextAreaDisabled(true);
	// 		resetButtonsState();
	// 		return;
	// 	} else if (trimmedText === "뭐해 ?") { // Add condition for "뭐해 ?"
	// 		vscode.postMessage({
	// 			type: "askResponse",
	// 			askResponse: "messageResponse",
	// 			text: "작업을 도와드릴 준비를 하고 있습니다.", // Response for "뭐해 ?"
	// 			images: [],
	// 		});
	// 		setInputValue("");
	// 		setSelectedImages([]);
	// 		setTextAreaDisabled(true);
	// 		resetButtonsState();
	// 		return;
	// 	}

	// 	// Original logic for other messages
	// 	const newTask = !task
	// 	vscode.postMessage({
	// 		type: "askResponse",
	// 		askResponse: "messageResponse",
	// 		text: trimmedText, // Use trimmed text
	// 		images,
	// 	})

	// 	setInputValue("")
	// 	setSelectedImages([])
	// 	setTextAreaDisabled(true)
	// 	resetButtonsState()
	// }

	// // 이미지 선택 핸들러
	// const handleSelectImages = () => {
	// 	vscode.postMessage({
	// 		type: "selectImages",
	// 	})
	// }

	// // 새 태스크 시작 함수
	// const startNewTask = useCallback(() => {
	// 	vscode.postMessage({ type: "clearTask" })
	// 	resetInput(true)
	// 	resetButtonsState() // 훅에서 받은 함수 사용
	// }, [resetInput, resetButtonsState]) // resetButtonsState 추가

	// // 자동 스크롤 일시 중지 함수
	// const handlePauseAutoScroll = useCallback(() => {
	// 	disableAutoScrollRef.current = true
	// }, [])

	// // 메인 버튼 클릭 핸들러
	// const handlePrimaryButtonClick = useCallback(
	// 	(text?: string, images?: string[]) => {
	// 		if (!caretAsk) return

	// 		const trimmedInput = text?.trim()
	// 		const base64Images = images && images.length > 0 ? images : undefined

	// 		// 버튼 타입별 처리 (원본 코드 기반)
	// 		switch (caretAsk) {
	// 			case "api_req_failed":
	// 			case "resume_task":
	// 				vscode.postMessage({
	// 					type: "askResponse",
	// 					askResponse: "yesButtonClicked",
	// 				})
	// 				break
	// 			case "mistake_limit_reached":
	// 			case "auto_approval_max_req_reached":
	// 			case "tool":
	// 			case "command":
	// 			case "browser_action_launch":
	// 			case "use_mcp_server":
	// 				vscode.postMessage({
	// 					type: "askResponse",
	// 					askResponse: "yesButtonClicked",
	// 					text: trimmedInput || base64Images ? trimmedInput : undefined,
	// 					images: base64Images,
	// 				})
	// 				resetInput(true) // Input clear after sending
	// 				break
	// 			case "command_output":
	// 				vscode.postMessage({
	// 					type: "askResponse",
	// 					askResponse: "messageResponse",
	// 					text: trimmedInput || base64Images ? trimmedInput : undefined,
	// 					images: base64Images,
	// 				})
	// 				resetInput(true)
	// 				break
	// 			case "completion_result":
	// 			case "resume_completed_task": // Added based on original logic
	// 				startNewTask() // Use startNewTask as per original
	// 				break
	// 		}
	// 		// 공통 로직 (상태 설정 제거)
	// 		// setTextAreaDisabled(true) // 훅 내부에서 처리
	// 		// setCaretAsk(undefined) // 훅 내부에서 처리
	// 		// setEnableButtons(false) // 훅 내부에서 처리
	// 		disableAutoScrollRef.current = false
	// 	},
	// 	[caretAsk, startNewTask, resetInput, disableAutoScrollRef], // 상태 설정 제거, 의존성 업데이트
	// )

	// // 보조 버튼 클릭 핸들러
	// const handleSecondaryButtonClick = useCallback(
	// 	(text?: string, images?: string[]) => {
	// 		if (isStreaming.current) {
	// 			// 스트리밍 취소 처리
	// 			isStreaming.current = false // 스트리밍 상태 변경
	// 			vscode.postMessage({ type: "cancelTask" })
	// 			setTextAreaDisabled(false) // 입력 활성화
	// 			resetButtonsState() // 버튼 상태 리셋 (훅 함수 사용)
	// 			focusTextArea() // 입력창 포커스
	// 			return
	// 		}

	// 		if (!caretAsk) return

	// 		const trimmedInput = text?.trim()
	// 		const base64Images = images && images.length > 0 ? images : undefined

	// 		// 버튼 타입별 처리 (원본 코드 기반)
	// 		switch (caretAsk) {
	// 			case "api_req_failed":
	// 			case "mistake_limit_reached":
	// 			case "auto_approval_max_req_reached":
	// 				startNewTask() // Use startNewTask as per original
	// 				break
	// 			case "tool":
	// 			case "command":
	// 			case "browser_action_launch":
	// 			case "use_mcp_server":
	// 				vscode.postMessage({
	// 					type: "askResponse",
	// 					askResponse: "noButtonClicked",
	// 					text: trimmedInput || base64Images ? trimmedInput : undefined,
	// 					images: base64Images,
	// 				})
	// 				resetInput(true)
	// 				break
	// 		}
	// 		// 공통 로직 (상태 설정 제거)
	// 		// setTextAreaDisabled(true) // 훅 내부에서 처리
	// 		// setCaretAsk(undefined) // 훅 내부에서 처리
	// 		// setEnableButtons(false) // 훅 내부에서 처리
	// 		disableAutoScrollRef.current = false
	// 	},
	// 	[caretAsk, startNewTask, isStreaming, resetInput, setTextAreaDisabled, resetButtonsState, focusTextArea, disableAutoScrollRef], // 의존성 업데이트
	// )

	// // 태스크 닫기 버튼 핸들러
	// const handleTaskCloseButtonClick = useCallback(() => {
	// 	startNewTask() // Use startNewTask consistent with other logic
	// }, [startNewTask])

	// // 메시지 전송 핸들러
	// const handleSendClick = useCallback(() => {
	// 		if (!inputValue.trim() && selectedImages.length === 0) return // 내용 없으면 전송 안 함
			
	// 		setTextAreaDisabled(true) // 입력 비활성화

	// 		let messageToSend: WebviewMessage;
	// 		if (task) {
	// 			messageToSend = {
	// 				type: "askResponse",
	// 				askResponse: "messageResponse",
	// 				text: inputValue,
	// 				images: selectedImages,
	// 			};
	// 		} else {
	// 			messageToSend = {
	// 				type: "newTask",
	// 				// newTask 타입에는 payload 없음, 필드 직접 사용
	// 				text: inputValue,
	// 				images: selectedImages,
	// 			}
	// 		}
	// 		vscode.postMessage(messageToSend)

	// 		resetInput(true) // 입력 초기화
	// 		resetButtonsState() // 버튼 상태 초기화 (훅 함수 사용)
	// 	}, [inputValue, selectedImages, setTextAreaDisabled, task, resetInput, resetButtonsState, startNewTask])

	// // 작업 종료 핸들러 (삭제로 변경)
	// const handleCloseTask = useCallback(() => {
	// 	// currentTaskItem.id 사용 (옵셔널 체이닝)
	// 	if (currentTaskItem?.id) {
	// 		// payload 없이 메시지 전송
	// 		vscode.postMessage({ type: "deleteTaskWithId" })
	// 	}
	// 	// currentTaskItem 의존성 추가
	// }, [currentTaskItem])

	// // 재시도 진행 상태 관리
	// const [retryProgress, setRetryProgress] = useState(0);

	// // 재시도 진행 상태를 업데이트하는 타이머 참조
	// const retryProgressTimerRef = useRef<NodeJS.Timeout | null>(null);

	// // API 재시도 상태 업데이트 효과
	// useEffect(() => {
	// 	// 기존 타이머 정리
	// 	if (retryProgressTimerRef.current !== null) {
	// 		clearInterval(retryProgressTimerRef.current)
	// 		retryProgressTimerRef.current = null
	// 	}

	// 	// 새로운 retryStatus가 있고, 재시도 시간이 있다면 타이머 설정
	// 	if (retryStatus && retryStatus.retryTimestamp && retryStatus.delay) {
	// 		const totalTime = retryStatus.delay // ms
	// 		const endTime = retryStatus.retryTimestamp // ms
	// 		const startTime = endTime - totalTime

	// 		// 현재 시간과 남은 시간 계산
	// 		const now = Date.now()
	// 		const remainingTime = Math.max(0, endTime - now)
	// 		const initialProgress = Math.min(100, Math.max(0, ((now - startTime) / totalTime) * 100))

	// 		// 초기 진행률 설정
	// 		setRetryProgress(initialProgress)

	// 		// 진행률 업데이트 타이머 설정 (100ms 마다)
	// 		if (remainingTime > 0) {
	// 			const step = 100 / (remainingTime / 100) // 100ms 당 증가 퍼센트

	// 			retryProgressTimerRef.current = setInterval(() => {
	// 				setRetryProgress((prev) => {
	// 					const nextProgress = prev + step

	// 					// 100% 도달 또는 시간 초과 시 타이머 종료
	// 					if (nextProgress >= 100 || Date.now() >= endTime) {
	// 						if (retryProgressTimerRef.current !== null) {
	// 							clearInterval(retryProgressTimerRef.current)
	// 							retryProgressTimerRef.current = null
	// 						}
	// 						return 100
	// 					}
	// 					return nextProgress
	// 				})
	// 			}, 100)
	// 		}
	// 	} else {
	// 		// retryStatus가 null이면 진행률 0으로 초기화
	// 		setRetryProgress(0)
	// 	}

	// 	// 클린업: 컴포넌트 언마운트 또는 retryStatus 변경 시 타이머 제거
	// 	return () => {
	// 		if (retryProgressTimerRef.current !== null) {
	// 			clearInterval(retryProgressTimerRef.current)
	// 			retryProgressTimerRef.current = null
	// 		}
	// 	}
	// }, [retryStatus]) // retryStatus 상태 변경 시 이 useEffect 실행

	// return (
	// 	<div
	// 		style={{
	// 			position: "fixed",
	// 			top: 0,
	// 			left: 0,
	// 			right: 0,
	// 			bottom: 0,
	// 			display: isHidden ? "none" : "flex",
	// 			flexDirection: "column",
	// 			overflow: "hidden",
	// 		}}>
	// 		{/* 헤더 영역 */}
	// 		{task ? (
	// 			<TaskHeader
	// 				task={task}
	// 				tokensIn={apiMetrics.totalTokensIn}
	// 				tokensOut={apiMetrics.totalTokensOut}
	// 				doesModelSupportPromptCache={selectedModelInfo.supportsPromptCache}
	// 				cacheWrites={apiMetrics.totalCacheWrites}
	// 				cacheReads={apiMetrics.totalCacheReads}
	// 				totalCost={apiMetrics.totalCost}
	// 				lastApiReqTotalTokens={lastApiReqTotalTokens}
	// 				onClose={handleCloseTask}
	// 			/>
	// 		) : (
	// 			<div
	// 				style={{
	// 					flex: "1 1 0",
	// 					minHeight: 0,
	// 					overflowY: "auto",
	// 					display: "flex",
	// 					flexDirection: "column",
	// 					paddingBottom: "10px",
	// 				}}>
	// 				{telemetrySetting === "unset" && <TelemetryBanner />}
	// 				{showAnnouncement && <Announcement version={version} hideAnnouncement={hideAnnouncement} />}
	// 				<div style={{ padding: "0 20px", flexShrink: 0 }}>
	// 					<h2>What can I do for you?</h2>
	// 					<p>
	// 						Thanks to{" "}
	// 						<VSCodeLink href="https://www.anthropic.com/claude/sonnet" style={{ display: "inline" }}>
	// 							Claude 3.7 Sonnet's
	// 						</VSCodeLink>{" "}
	// 						agentic coding capabilities, I can handle complex software development tasks step-by-step. With tools
	// 						that let me create & edit files, explore complex projects, use a browser, and execute terminal
	// 						commands (after you grant permission), I can assist you in ways that go beyond code completion or tech
	// 						support. I can even use MCP to create new tools and extend my own capabilities.
	// 					</p>
	// 				</div>
	// 				{taskHistory.length > 0 && <HistoryPreview showHistoryView={showHistoryView} />}
	// 			</div>
	// 		)}

	// 		{/* 메시지 목록 영역 - task가 있을 때만 표시 */}
	// 		{task && (
	// 			<>
	// 				<div
	// 					style={{
	// 						flex: "1 1 auto",
	// 						minHeight: 0,
	// 						position: "relative",
	// 					}}>
	// 					<Virtuoso
	// 						ref={virtuosoRef}
	// 						key={task?.ts}
	// 						className="scrollable"
	// 						style={{ height: "100%" }}
	// 						components={{ Footer: () => <div style={{ height: 5 }} /> }}
	// 						increaseViewportBy={{ top: 3_000, bottom: Number.MAX_SAFE_INTEGER }}
	// 						data={groupedMessages}
	// 						totalCount={groupedMessages.length}
	// 						itemContent={itemContent}
	// 						onScroll={handleScroll}
	// 						initialTopMostItemIndex={groupedMessages.length - 1}
	// 						followOutput={isAtBottom}
	// 					/>

	// 					{/* 스크롤 컨트롤 */}
	// 					{showScrollToBottom && (
	// 						<div style={{ display: "flex", padding: "10px 15px 0px 15px" }}>
	// 							<ScrollToBottomButton
	// 								onClick={() => {
	// 									scrollToBottomManual()
	// 									disableAutoScrollRef.current = false
	// 								}}>
	// 								<span className="codicon codicon-chevron-down" style={{ fontSize: "18px" }}></span>
	// 							</ScrollToBottomButton>
	// 						</div>
	// 					)}
	// 				</div>
					
	// 				{/* API 재시도 상태 UI */}
	// 				{retryStatus && (
	// 					<RetryStatusContainer>
	// 						<RetryStatusHeader>
	// 							<RetryStatusIcon><AlertIcon size={16} /></RetryStatusIcon> {/* Use appropriate icon */}
	// 							API Request Failed - Retrying...
	// 						</RetryStatusHeader>
	// 						<RetryStatusInfo>
	// 							<span>
	// 								Attempt {retryStatus.attempt} of {retryStatus.maxRetries}.
	// 								{/* Check if retryTimestamp exists before calculating remaining time */}
	// 								{retryStatus.retryTimestamp ? ` Retrying in ${Math.ceil(Math.max(0, retryStatus.retryTimestamp - Date.now()) / 1000)}s...` : ' Retrying...'}
	// 							</span>
	// 							{/* Optionally display the last error message */}
	// 							{/* <span>Last Error: {retryStatus.lastError?.message}</span> */}
	// 						</RetryStatusInfo>
	// 						<RetryStatusProgress>
	// 							<RetryStatusProgressBar progress={retryProgress} />
	// 						</RetryStatusProgress>
	// 					</RetryStatusContainer>
	// 				)}

	// 				{/* API 최종 에러 상태 UI */}
	// 				{apiError && (
	// 					<ApiErrorContainer>
	// 						<ApiErrorIcon>
	// 							<AlertIcon size={16} />
	// 						</ApiErrorIcon>
	// 						<ApiErrorInfo>
	// 							<span>{apiError.message}</span>
	// 						</ApiErrorInfo>
	// 					</ApiErrorContainer>
	// 				)}
					
	// 				<AutoApproveMenu />
	// 			</>
	// 		)}

	// 		{/* 하단 입력 영역 */}
	// 		<div style={{ padding: "10px 0" }}>
	// 			{/* 모드 선택 영역 */} 
	// 			<ModeSelectorContainer>
	// 				{availableModes && availableModes.length > 0 ? (
	// 					// 모드 데이터가 있는 경우
	// 					availableModes.map((modeInfo, index) => (
	// 						<ModeButton
	// 							key={modeInfo.id}
	// 							appearance={chatSettings.mode === modeInfo.id ? "primary" : "secondary"}
	// 							data-shortcut={`Alt+${index + 1}`}
	// 							onClick={() => {
	// 								if (chatSettings.mode !== modeInfo.id) {
	// 									vscode.postMessage({
	// 										type: "updateSettings",
	// 										chatSettings: { ...chatSettings, mode: modeInfo.id },
	// 									})
	// 								}
	// 							}}>
	// 							{modeInfo.label || modeInfo.id}
	// 						</ModeButton>
	// 					))
	// 				) : (
	// 					// 모드 데이터가 없는 경우 기본 모드 버튼 표시
	// 					<>
	// 						{[
	// 							{ id: "arch", label: "Arch", shortcut: 1 },
	// 							{ id: "dev", label: "Dev", shortcut: 2 },
	// 							{ id: "rule", label: "Rule", shortcut: 3 },
	// 							{ id: "talk", label: "Talk", shortcut: 4 },
	// 						].map((fallbackMode) => (
	// 							<ModeButton
	// 								key={fallbackMode.id}
	// 								appearance={chatSettings.mode === fallbackMode.id ? "primary" : "secondary"}
	// 								data-shortcut={`Alt+${fallbackMode.shortcut}`}
	// 								onClick={() => {
	// 									if (chatSettings.mode !== fallbackMode.id) {
	// 										vscode.postMessage({
	// 											type: "updateSettings",
	// 											chatSettings: { ...chatSettings, mode: fallbackMode.id },
	// 										})
	// 									}
	// 								}}>
	// 								{fallbackMode.label}
	// 							</ModeButton>
	// 						))}
	// 					</>
	// 				)}
	// 				{/* 설정 버튼 */}
	// 				{onShowSettings && (
	// 					<SettingsButton appearance="icon" aria-label="Settings" onClick={onShowSettings}>
	// 						<span className="codicon codicon-gear" />
	// 					</SettingsButton>
	// 				)}
	// 			</ModeSelectorContainer>

	// 			{/* 버튼 영역 */}
	// 			{showScrollToBottom ? null : (
	// 				<ChatButtons
	// 					enableButtons={enableButtons}
	// 					primaryButtonText={primaryButtonText}
	// 					secondaryButtonText={secondaryButtonText}
	// 					onPrimaryClick={handlePrimaryButtonClick}
	// 					onSecondaryClick={handleSecondaryButtonClick}
	// 					isStreaming={isStreaming.current}
	// 					didClickCancel={didClickCancel}
	// 					inputValue={inputValue}
	// 					selectedImages={selectedImages}
	// 				/>
	// 			)}

	// 			{/* 텍스트 입력 영역 */}
	// 			<ChatTextArea
	// 				ref={textAreaRef}
	// 				inputValue={inputValue}
	// 				setInputValue={setInputValue}
	// 				textAreaDisabled={textAreaDisabled}
	// 				placeholderText={placeholderText}
	// 				selectedImages={selectedImages}
	// 				setSelectedImages={setSelectedImages}
	// 				onSend={handleSendClick}
	// 				onSelectImages={handleSelectImages}
	// 				shouldDisableImages={shouldDisableImages}
	// 				onHeightChange={() => {
	// 					if (isAtBottom) scrollToBottomAuto()
	// 				}}
	// 			/>
	// 		</div>
	// 	</div>
	// )
}

export default ChatView
