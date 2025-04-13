import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import debounce from "debounce"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useDeepCompareEffect, useEvent, useMount } from "react-use"
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso"
import styled from "styled-components" // Ensure styled-components is imported
import {
	ClineApiReqInfo,
	ClineAsk,
	ClineMessage,
	ClineSayBrowserAction,
	ClineSayTool,
	ExtensionMessage,
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
		font-size: 0.4rem; /* 글자 크기 더더더더 축소 */
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
	} = useExtensionState()

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
	useDeepCompareEffect(() => {
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
			switch (clineAsk) {
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
					availableModes.map((modeInfo) => (
						<ModeButton
							key={modeInfo.id}
							appearance={chatSettings.mode === modeInfo.id ? "primary" : "secondary"}
							onClick={() => {
								if (chatSettings.mode !== modeInfo.id) {
									vscode.postMessage({
										type: "togglePlanActMode", // 모드 전환 메시지 타입
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
						<ModeButton
							key="plan"
							appearance={chatSettings.mode === "plan" ? "primary" : "secondary"}
							onClick={() => {
								if (chatSettings.mode !== "plan") {
									vscode.postMessage({
										type: "togglePlanActMode",
										chatSettings: { ...chatSettings, mode: "plan" },
									})
								}
							}}>
							Plan
						</ModeButton>
						<ModeButton
							key="do"
							appearance={chatSettings.mode === "do" ? "primary" : "secondary"}
							onClick={() => {
								if (chatSettings.mode !== "do") {
									vscode.postMessage({
										type: "togglePlanActMode",
										chatSettings: { ...chatSettings, mode: "do" },
									})
								}
							}}>
							Do
						</ModeButton>
						<ModeButton
							key="rule"
							appearance={chatSettings.mode === "rule" ? "primary" : "secondary"}
							onClick={() => {
								if (chatSettings.mode !== "rule") {
									vscode.postMessage({
										type: "togglePlanActMode",
										chatSettings: { ...chatSettings, mode: "rule" },
									})
								}
							}}>
							Rule
						</ModeButton>
						<ModeButton
							key="talk"
							appearance={chatSettings.mode === "talk" ? "primary" : "secondary"}
							onClick={() => {
								if (chatSettings.mode !== "talk") {
									vscode.postMessage({
										type: "togglePlanActMode",
										chatSettings: { ...chatSettings, mode: "talk" },
									})
								}
							}}>
							Talk
						</ModeButton>
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
