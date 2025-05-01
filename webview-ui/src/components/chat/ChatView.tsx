import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { Virtuoso } from "react-virtuoso"
import styled from "styled-components"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import { useEvent } from "react-use"
import BrowserSessionRow from "./BrowserSessionRow"
import ChatRow from "./ChatRow"
import ChatTextArea from "./ChatTextArea"
import TaskHeader from "./TaskHeader"
import AutoApproveMenu from "./AutoApproveMenu"
import HistoryPreview from "../history/HistoryPreview"
import TelemetryBanner from "../common/TelemetryBanner"
import { AlertIcon } from "@primer/octicons-react"
import { CaretMessage } from "../../../../src/shared/ExtensionMessage";
import Announcement from "./Announcement"

// 추출한 Hook 임포트
import {
	useMessageState,
	useScrollControl,
	useChatInputState,
	useCaretAskState,
	useBrowserSessionState,
	useModeShortcuts
} from "./chat_hooks"

// 분리한 UI 컴포넌트 임포트
import 	ChatButtons from "./chat_ui/ChatButtons"

import { normalizeApiConfiguration } from "../settings/ApiOptions"
import { WebviewMessage } from "@shared/WebviewMessage"

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

const SettingsButton = styled(VSCodeButton)`
	flex-shrink: 0;
	&::part(control) {
		padding: 0 6px; /* Adjust padding as needed */
		min-width: auto;
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

	// 안전한 messages 배열 생성
	const safeMessages: CaretMessage[] = messages ?? [];

	// 메시지 상태 관리 Hook
	const { task, modifiedMessages, apiMetrics, lastApiReqTotalTokens, isExpanded, toggleExpand } = useMessageState(
		// safeMessages 사용
		safeMessages
	)
	
	// 스크롤 컨트롤 Hook
	const {
		virtuosoRef,
		scrollContainerRef,
		isAtBottom,
		showScrollToBottom,
		handleScroll,
		scrollToBottomAuto,
		scrollToBottomManual,
		pauseAutoScroll
	} = useScrollControl()
	
	// 입력 상태 관리 Hook
	const {
		inputValue,
		setInputValue,
		textAreaRef,
		textAreaDisabled,
		setTextAreaDisabled,
		selectedImages,
		setSelectedImages,
		resetInput,
		focusTextArea
	} = useChatInputState()

	// 자동 스크롤 비활성화 ref
	const disableAutoScrollRef = useRef(false)

	// API 응답 스트리밍 여부 체크 (훅 호출 전에 선언)
	const isStreaming = useRef(false)

	// Caret 상태 및 버튼 상태 관리 Hook (올바른 인자와 반환값 사용)
	const { 
		caretAsk, 
		enableButtons, 
		primaryButtonText, 
		secondaryButtonText, 
		didClickCancel, // 이 값은 필요시 UI에 활용 가능
		resetButtonsState 
		// safeMessages 사용
	} = useCaretAskState(safeMessages, setTextAreaDisabled, resetInput)

	// 모드 단축키 Hook
	// availableModes, chatSettings 사용
	useModeShortcuts(availableModes, chatSettings)

	// 브라우저 세션 확장 상태 관리
	const [expandedSessionIds, setExpandedSessionIds] = useState<Set<string>>(new Set());

	// 브라우저 세션 토글 함수
	const handleToggleExpand = useCallback((sessionId: string) => {
		setExpandedSessionIds(prevIds => {
			const newIds = new Set(prevIds);
			if (newIds.has(sessionId)) {
				newIds.delete(sessionId);
			} else {
				newIds.add(sessionId);
			}
			return newIds;
		});
	}, []);

	// 브라우저 세션 관리 Hook
	const { groupedMessages, isBrowserSessionMessage } = useBrowserSessionState(modifiedMessages)

	// 선택된 모델 정보
	const { selectedModelInfo, selectedProvider } = useMemo(() => {
		// apiConfiguration 사용
		return normalizeApiConfiguration(apiConfiguration)
	}, [apiConfiguration])
	
	// 이미지 업로드 비활성화 여부
	const shouldDisableImages =
		!selectedModelInfo.supportsImages || textAreaDisabled || selectedImages.length >= MAX_IMAGES_PER_MESSAGE

	// 보여줄 메시지 처리 (마지막 visible 메시지 이후의 것만)
	const visibleMessages = useMemo(() => {
		return modifiedMessages.filter((message) => {
			// 내부 정보 필터링 - 환경 세부정보, 시스템 프롬프트, 토큰 정보 등
			if (message.text) {
				// 빈 응답 메시지 필터링
				if (message.text === "" && 
					(message.ask === "completion_result" || message.type === "say" && message.say === "text")) {
					return false;
				}
				
				// environment_details 태그가 있는 메시지 필터링
				if (message.text.includes("<environment_details>")) {
					return false;
				}
				
				// 토큰 사용량 정보 필터링
				if (message.text.includes("tokens used") || message.text.includes("\"tokensIn\":")) {
					return false;
				}
				
				// 시스템 프롬프트나 모델 정보 필터링
				if ((message.text.includes("<") && message.text.includes(">")) || 
					message.text.includes("<custom_instructions>") || 
					message.text.includes("<functions>") ||
					message.text.includes("<additional_data>") ||
					message.text.includes("<user_query>") ||
					message.text.includes("<attached_files>")) {
					return false;
				}
				
				// 모드 설명이나 규칙 필터링
				if (message.text.includes("MODE\n") && 
					(message.text.includes("You are in") || message.text.includes("Focus on"))) {
					return false;
				}
				
				// 내부 분석 메시지 필터링 (추가)
				if (message.text.includes("The user is asking") || 
					message.text.includes("I should") || 
					message.text.includes("Based on the project structure") ||
					message.text.includes("translates to")) {
					return false;
				}
			}

			// 특정 메시지 타입 필터링
			switch (message.type) {
				case "say":
					switch (message.say) {
						case "text":
							return true
						case "reasoning":
							return false // 내부 사고 과정은 ChatRowContent에서 처리함
						case "mcp_server_request_started":
							return false
						case "api_req_started":
							// API 요청 시작 메시지는 토큰 정보가 있으면 숨김
							const text = message.text
							return !text || (!message.text?.includes("tokensIn") && !message.text?.includes("tokensOut"))
						case "deleted_api_reqs":
						case "diff_error":
						case "caretignore_error":
						case "shell_integration_warning":
						case "api_req_finished":
						case "api_req_retried":
							return false
						case "user_feedback":
							// 사용자 피드백 표시 (Question 타입)
							return true
						case "tool":
						case "task":
						case "command":
						case "command_output":
						case "error":
						case "use_mcp_server":
						case "mcp_server_response":
						case "completion_result":
						case "browser_action":
						case "browser_action_result":
						case "browser_action_launch":
							return true
						default:
							return false
					}
				case "ask":
					switch (message.ask) {
						case "followup":
						case "plan_mode_respond":
							// Question 타입 메시지 표시 (원본 cline과 동일하게 처리)
							return true
						case "completion_result":
							// completion_result 메시지는 항상 표시
							return true
						case "api_req_failed":
						case "resume_task":
						case "resume_completed_task":
							// 내부 처리 메시지는 표시하지 않음 (원본 cline과 동일하게 처리)
							return false
						default:
							return true
					}
				default:
					return true
			}
		});
	}, [modifiedMessages]); // 의존성 배열에 modifiedMessages만 추가하여 필요할 때만 재계산

	// 메시지 높이 변경 처리 - 시그니처 수정
	const handleRowHeightChange = useCallback(
		(isTaller: boolean) => { // 변경된 시그니처
			if (!isAtBottom) return
			if (isTaller) { // isTaller가 true일 때만 스크롤 (선택적)
				scrollToBottomAuto()
			}
		},
		[isAtBottom, scrollToBottomAuto]
	)

	// 스크롤 이벤트 처리
	const handleWheel = useCallback((event: Event) => {
		const wheelEvent = event as WheelEvent
		if (wheelEvent.deltaY && wheelEvent.deltaY < 0 && scrollContainerRef.current?.contains(wheelEvent.target as Node))
			pauseAutoScroll()
	}, [pauseAutoScroll, scrollContainerRef])

	// 스크롤 이벤트 연결
	useEvent("wheel", handleWheel, window, { passive: true })

	// 그룹화된 메시지 길이 변경 시 스크롤 처리
	useEffect(() => {
		setTimeout(scrollToBottomManual, 50)
	}, [groupedMessages.length, scrollToBottomManual])

	// 텍스트 영역 placeholder 텍스트
	const placeholderText = task ? "Type a message..." : "Type your task here..."

	// 메시지 렌더링 함수
	const itemContent = useCallback(
		(index: number, messageOrGroup: any) => {
			if (Array.isArray(messageOrGroup)) {
				// 브라우저 세션 그룹 렌더링
				return (
					<BrowserSessionRow
						key={messageOrGroup[0].ts} // 그룹의 첫 메시지 ts를 key로 사용
						messages={messageOrGroup} // 'group' -> 'messages'
						onHeightChange={handleRowHeightChange}
						// 확장 상태 확인 함수 전달 (ts를 string으로 변환)
						isExpanded={(ts) => expandedSessionIds.has(String(ts))} // 수정: String(ts)
						// 토글 핸들러 호출 시 ts를 string으로 변환
						onToggleExpand={() => handleToggleExpand(String(messageOrGroup[0].ts))} // 수정: String(ts)
						isLast={index === groupedMessages.length - 1}
					/>
				)
			} else {
				// 일반 메시지 렌더링
				const message = messageOrGroup
				return (
					<ChatRow
						key={message.ts}
						message={message}
						onHeightChange={handleRowHeightChange}
						isLast={index === groupedMessages.length - 1}
						isExpanded={isExpanded(message.ts)} // 원래대로 함수 호출 결과 전달
						onToggleExpand={() => toggleExpand(message.ts)}
					/>
				)
			}
		},
		// 의존성 배열에 expandedSessionIds와 handleToggleExpand 추가
		[groupedMessages, handleRowHeightChange, isExpanded, toggleExpand, expandedSessionIds, handleToggleExpand]
	)

	// 메시지 전송 핸들러
	const handleSendMessage = (text: string, images: string[]) => {
		const trimmedText = text.trim(); // Trim text once
		if (!trimmedText && images.length === 0) return

		if (trimmedText === "안녕") {
			vscode.postMessage({
				type: "askResponse",
				askResponse: "messageResponse",
				text: "안녕하세요! 무엇을 도와드릴까요?",
				images: [],
			});
			setInputValue("");
			setSelectedImages([]);
			setTextAreaDisabled(true);
			resetButtonsState();
			return;
		} else if (trimmedText === "뭐해 ?") { // Add condition for "뭐해 ?"
			vscode.postMessage({
				type: "askResponse",
				askResponse: "messageResponse",
				text: "작업을 도와드릴 준비를 하고 있습니다.", // Response for "뭐해 ?"
				images: [],
			});
			setInputValue("");
			setSelectedImages([]);
			setTextAreaDisabled(true);
			resetButtonsState();
			return;
		}

		// Original logic for other messages
		const newTask = !task
		vscode.postMessage({
			type: "askResponse",
			askResponse: "messageResponse",
			text: trimmedText, // Use trimmed text
			images,
		})

		setInputValue("")
		setSelectedImages([])
		setTextAreaDisabled(true)
		resetButtonsState()
	}

	// 이미지 선택 핸들러
	const handleSelectImages = () => {
		vscode.postMessage({
			type: "selectImages",
		})
	}

	// 새 태스크 시작 함수
	const startNewTask = useCallback(() => {
		vscode.postMessage({ type: "clearTask" })
		resetInput(true)
		resetButtonsState() // 훅에서 받은 함수 사용
	}, [resetInput, resetButtonsState]) // resetButtonsState 추가

	// 자동 스크롤 일시 중지 함수
	const handlePauseAutoScroll = useCallback(() => {
		disableAutoScrollRef.current = true
	}, [])

	// 메인 버튼 클릭 핸들러
	const handlePrimaryButtonClick = useCallback(
		(text?: string, images?: string[]) => {
			if (!caretAsk) return

			const trimmedInput = text?.trim()
			const base64Images = images && images.length > 0 ? images : undefined

			// 버튼 타입별 처리 (원본 코드 기반)
			switch (caretAsk) {
				case "api_req_failed":
				case "resume_task":
					vscode.postMessage({
						type: "askResponse",
						askResponse: "yesButtonClicked",
					})
					break
				case "mistake_limit_reached":
				case "auto_approval_max_req_reached":
				case "tool":
				case "command":
				case "browser_action_launch":
				case "use_mcp_server":
					vscode.postMessage({
						type: "askResponse",
						askResponse: "yesButtonClicked",
						text: trimmedInput || base64Images ? trimmedInput : undefined,
						images: base64Images,
					})
					resetInput(true) // Input clear after sending
					break
				case "command_output":
					vscode.postMessage({
						type: "askResponse",
						askResponse: "messageResponse",
						text: trimmedInput || base64Images ? trimmedInput : undefined,
						images: base64Images,
					})
					resetInput(true)
					break
				case "completion_result":
				case "resume_completed_task": // Added based on original logic
					startNewTask() // Use startNewTask as per original
					break
			}
			// 공통 로직 (상태 설정 제거)
			// setTextAreaDisabled(true) // 훅 내부에서 처리
			// setCaretAsk(undefined) // 훅 내부에서 처리
			// setEnableButtons(false) // 훅 내부에서 처리
			disableAutoScrollRef.current = false
		},
		[caretAsk, startNewTask, resetInput, disableAutoScrollRef], // 상태 설정 제거, 의존성 업데이트
	)

	// 보조 버튼 클릭 핸들러
	const handleSecondaryButtonClick = useCallback(
		(text?: string, images?: string[]) => {
			if (isStreaming.current) {
				// 스트리밍 취소 처리
				isStreaming.current = false // 스트리밍 상태 변경
				vscode.postMessage({ type: "cancelTask" })
				setTextAreaDisabled(false) // 입력 활성화
				resetButtonsState() // 버튼 상태 리셋 (훅 함수 사용)
				focusTextArea() // 입력창 포커스
				return
			}

			if (!caretAsk) return

			const trimmedInput = text?.trim()
			const base64Images = images && images.length > 0 ? images : undefined

			// 버튼 타입별 처리 (원본 코드 기반)
			switch (caretAsk) {
				case "api_req_failed":
				case "mistake_limit_reached":
				case "auto_approval_max_req_reached":
					startNewTask() // Use startNewTask as per original
					break
				case "tool":
				case "command":
				case "browser_action_launch":
				case "use_mcp_server":
					vscode.postMessage({
						type: "askResponse",
						askResponse: "noButtonClicked",
						text: trimmedInput || base64Images ? trimmedInput : undefined,
						images: base64Images,
					})
					resetInput(true)
					break
			}
			// 공통 로직 (상태 설정 제거)
			// setTextAreaDisabled(true) // 훅 내부에서 처리
			// setCaretAsk(undefined) // 훅 내부에서 처리
			// setEnableButtons(false) // 훅 내부에서 처리
			disableAutoScrollRef.current = false
		},
		[caretAsk, startNewTask, isStreaming, resetInput, setTextAreaDisabled, resetButtonsState, focusTextArea, disableAutoScrollRef], // 의존성 업데이트
	)

	// 태스크 닫기 버튼 핸들러
	const handleTaskCloseButtonClick = useCallback(() => {
		startNewTask() // Use startNewTask consistent with other logic
	}, [startNewTask])

	// 메시지 전송 핸들러
	const handleSendClick = useCallback(() => {
			if (!inputValue.trim() && selectedImages.length === 0) return // 내용 없으면 전송 안 함
			
			setTextAreaDisabled(true) // 입력 비활성화

			let messageToSend: WebviewMessage;
			if (task) {
				messageToSend = {
					type: "askResponse",
					askResponse: "messageResponse",
					text: inputValue,
					images: selectedImages,
				};
			} else {
				messageToSend = {
					type: "newTask",
					// newTask 타입에는 payload 없음, 필드 직접 사용
					text: inputValue,
					images: selectedImages,
				}
			}
			vscode.postMessage(messageToSend)

			resetInput(true) // 입력 초기화
			resetButtonsState() // 버튼 상태 초기화 (훅 함수 사용)
		}, [inputValue, selectedImages, setTextAreaDisabled, task, resetInput, resetButtonsState, startNewTask])

	// 작업 종료 핸들러 (삭제로 변경)
	const handleCloseTask = useCallback(() => {
		// currentTaskItem.id 사용 (옵셔널 체이닝)
		if (currentTaskItem?.id) {
			// payload 없이 메시지 전송
			vscode.postMessage({ type: "deleteTaskWithId" })
		}
		// currentTaskItem 의존성 추가
	}, [currentTaskItem])

	// 재시도 진행 상태 관리
	const [retryProgress, setRetryProgress] = useState(0);

	// 재시도 진행 상태를 업데이트하는 타이머 참조
	const retryProgressTimerRef = useRef<NodeJS.Timeout | null>(null);

	// API 재시도 상태 업데이트 효과
	useEffect(() => {
		// 기존 타이머 정리
		if (retryProgressTimerRef.current !== null) {
			clearInterval(retryProgressTimerRef.current)
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

				retryProgressTimerRef.current = setInterval(() => {
					setRetryProgress((prev) => {
						const nextProgress = prev + step

						// 100% 도달 또는 시간 초과 시 타이머 종료
						if (nextProgress >= 100 || Date.now() >= endTime) {
							if (retryProgressTimerRef.current !== null) {
								clearInterval(retryProgressTimerRef.current)
								retryProgressTimerRef.current = null
							}
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
				clearInterval(retryProgressTimerRef.current)
				retryProgressTimerRef.current = null
			}
		}
	}, [retryStatus]) // retryStatus 상태 변경 시 이 useEffect 실행

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
			{/* 헤더 영역 */}
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
					onClose={handleCloseTask}
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
					{telemetrySetting === "unset" && <TelemetryBanner />}
					{showAnnouncement && <Announcement version={version} hideAnnouncement={hideAnnouncement} />}
					<div style={{ padding: "0 20px", flexShrink: 0 }}>
						<h2>What can I do for you?</h2>
						<p>
							Thanks to{" "}
							<VSCodeLink href="https://www.anthropic.com/claude/sonnet" style={{ display: "inline" }}>
								Claude 3.7 Sonnet's
							</VSCodeLink>{" "}
							agentic coding capabilities, I can handle complex software development tasks step-by-step. With tools
							that let me create & edit files, explore complex projects, use a browser, and execute terminal
							commands (after you grant permission), I can assist you in ways that go beyond code completion or tech
							support. I can even use MCP to create new tools and extend my own capabilities.
						</p>
					</div>
					{taskHistory.length > 0 && <HistoryPreview showHistoryView={showHistoryView} />}
				</div>
			)}

			{/* 메시지 목록 영역 - task가 있을 때만 표시 */}
			{task && (
				<>
					<div
						style={{
							flex: "1 1 auto",
							minHeight: 0,
							position: "relative",
						}}>
						<Virtuoso
							ref={virtuosoRef}
							key={task?.ts}
							className="scrollable"
							style={{ height: "100%" }}
							components={{ Footer: () => <div style={{ height: 5 }} /> }}
							increaseViewportBy={{ top: 3_000, bottom: Number.MAX_SAFE_INTEGER }}
							data={groupedMessages}
							totalCount={groupedMessages.length}
							itemContent={itemContent}
							onScroll={handleScroll}
							initialTopMostItemIndex={groupedMessages.length - 1}
							followOutput={isAtBottom}
						/>

						{/* 스크롤 컨트롤 */}
						{showScrollToBottom && (
							<div style={{ display: "flex", padding: "10px 15px 0px 15px" }}>
								<ScrollToBottomButton
									onClick={() => {
										scrollToBottomManual()
										disableAutoScrollRef.current = false
									}}>
									<span className="codicon codicon-chevron-down" style={{ fontSize: "18px" }}></span>
								</ScrollToBottomButton>
							</div>
						)}
					</div>
					
					{/* API 재시도 상태 UI */}
					{retryStatus && (
						<RetryStatusContainer>
							<RetryStatusHeader>
								<RetryStatusIcon><AlertIcon size={16} /></RetryStatusIcon> {/* Use appropriate icon */}
								API Request Failed - Retrying...
							</RetryStatusHeader>
							<RetryStatusInfo>
								<span>
									Attempt {retryStatus.attempt} of {retryStatus.maxRetries}.
									{/* Check if retryTimestamp exists before calculating remaining time */}
									{retryStatus.retryTimestamp ? ` Retrying in ${Math.ceil(Math.max(0, retryStatus.retryTimestamp - Date.now()) / 1000)}s...` : ' Retrying...'}
								</span>
								{/* Optionally display the last error message */}
								{/* <span>Last Error: {retryStatus.lastError?.message}</span> */}
							</RetryStatusInfo>
							<RetryStatusProgress>
								<RetryStatusProgressBar progress={retryProgress} />
							</RetryStatusProgress>
						</RetryStatusContainer>
					)}

					{/* API 최종 에러 상태 UI */}
					{apiError && (
						<ApiErrorContainer>
							<ApiErrorIcon>
								<AlertIcon size={16} />
							</ApiErrorIcon>
							<ApiErrorInfo>
								<span>{apiError.message}</span>
							</ApiErrorInfo>
						</ApiErrorContainer>
					)}
					
					<AutoApproveMenu />
				</>
			)}

			{/* 하단 입력 영역 */}
			<div style={{ padding: "10px 0" }}>
				{/* 모드 선택 영역 */} 
				<ModeSelectorContainer>
					{availableModes && availableModes.length > 0 ? (
						// 모드 데이터가 있는 경우
						availableModes.map((modeInfo, index) => (
							<ModeButton
								key={modeInfo.id}
								appearance={chatSettings.mode === modeInfo.id ? "primary" : "secondary"}
								data-shortcut={`Alt+${index + 1}`}
								onClick={() => {
									if (chatSettings.mode !== modeInfo.id) {
										vscode.postMessage({
											type: "updateSettings",
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
								{ id: "talk", label: "Talk", shortcut: 4 },
							].map((fallbackMode) => (
								<ModeButton
									key={fallbackMode.id}
									appearance={chatSettings.mode === fallbackMode.id ? "primary" : "secondary"}
									data-shortcut={`Alt+${fallbackMode.shortcut}`}
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
					{/* 설정 버튼 */}
					{onShowSettings && (
						<SettingsButton appearance="icon" aria-label="Settings" onClick={onShowSettings}>
							<span className="codicon codicon-gear" />
						</SettingsButton>
					)}
				</ModeSelectorContainer>

				{/* 버튼 영역 */}
				{showScrollToBottom ? null : (
					<ChatButtons
						enableButtons={enableButtons}
						primaryButtonText={primaryButtonText}
						secondaryButtonText={secondaryButtonText}
						onPrimaryClick={handlePrimaryButtonClick}
						onSecondaryClick={handleSecondaryButtonClick}
						isStreaming={isStreaming.current}
						didClickCancel={didClickCancel}
						inputValue={inputValue}
						selectedImages={selectedImages}
					/>
				)}

				{/* 텍스트 입력 영역 */}
				<ChatTextArea
					ref={textAreaRef}
					inputValue={inputValue}
					setInputValue={setInputValue}
					textAreaDisabled={textAreaDisabled}
					placeholderText={placeholderText}
					selectedImages={selectedImages}
					setSelectedImages={setSelectedImages}
					onSend={handleSendClick}
					onSelectImages={handleSelectImages}
					shouldDisableImages={shouldDisableImages}
					onHeightChange={() => {
						if (isAtBottom) scrollToBottomAuto()
					}}
				/>
			</div>
		</div>
	)
}

export default ChatView
