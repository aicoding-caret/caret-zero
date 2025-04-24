import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React, { useCallback, useEffect, useRef } from "react"
import { Virtuoso, VirtuosoHandle } from "react-virtuoso"
import styled from "styled-components"
import { useEvent } from "react-use"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import BrowserSessionRow from "./BrowserSessionRow"
import ChatRow from "./ChatRow"
import ChatTextArea from "./ChatTextArea"
import TaskHeader from "./TaskHeader"

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
import ModeSelector from "./chat_ui/ModeSelector"
import ChatHeader from "./chat_ui/ChatHeader"
import ChatButtons from "./chat_ui/ChatButtons"
import ScrollControls from "./chat_ui/ScrollControls"

interface ChatViewProps {
	isHidden: boolean
	showAnnouncement: boolean
	hideAnnouncement: () => void
	showHistoryView: () => void
	onShowSettings: () => void
}

const ChatView = ({ isHidden, showAnnouncement, hideAnnouncement, showHistoryView, onShowSettings }: ChatViewProps) => {
	const {
		version,
		caretMessages: messages,
		taskHistory,
		apiConfiguration,
		telemetrySetting,
		availableModes,
		chatSettings,
		retryStatus,
		apiError,
		currentTaskItem,
	} = useExtensionState()

	// 메시지 상태 관리 Hook
	const {
		task,
		modifiedMessages,
		apiMetrics,
		lastApiReqTotalTokens,
		isExpanded,
		toggleExpand
	} = useMessageState(messages)
	
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

	// 모드 단축키 Hook
	useModeShortcuts(availableModes, chatSettings)

	// API 응답 스트리밍 여부 체크
	const isStreaming = useRef(false)

	// 재시도 진행 상태를 업데이트하는 타이머 참조
	const retryProgressTimerRef = useRef<number | null>(null)

	// 버튼 상태 관리 Hook
	const {
		caretAsk,
		enableButtons,
		primaryButtonText,
		secondaryButtonText,
		didClickCancel,
		handleCancel,
		resetButtonsState
	} = useCaretAskState(messages, setTextAreaDisabled, resetInput)

	// 브라우저 세션 관리 Hook
	const { groupedMessages, isBrowserSessionMessage } = useBrowserSessionState(modifiedMessages)

	// 선택된 모델 정보
	const selectedModelInfo = apiConfiguration?.apiProvider
		? { provider: apiConfiguration?.apiProvider || "", supportsPromptCache: false, supportsImages: false } 
		: { provider: "", supportsPromptCache: false, supportsImages: false }
	
	// 이미지 업로드 비활성화 여부
	const shouldDisableImages =
		// TODO: Azure OpenAI 사용 시 이미지 비활성화 로직 추가 필요
		!selectedModelInfo?.supportsImages ||
		caretAsk === "mistake_limit_reached" ||
		caretAsk === "api_req_failed" ||
		caretAsk === "auto_approval_max_req_reached"

	// 보여줄 메시지 처리 (마지막 visible 메시지 이후의 것만)
	const visibleMessages = modifiedMessages.filter((message) => {
		// 메시지 필터링 로직 (기존과 동일)
		// 특정 메시지 타입 숨기기 등
		switch (message.type) {
			case "say":
				switch (message.say) {
					case "text":
						return true
					case "mcp_server_request_started":
						return false
					case "api_req_started":
						const text = message.text
						return !text || !message.text?.includes("tokensIn") || !message.text?.includes("tokensOut")
					case "tool":
					case "task":
					case "command":
					case "command_output":
					case "error":
					case "use_mcp_server":
					case "mcp_server_response":
					case "completion_result":
					case "api_req_finished":
					case "browser_action":
					case "browser_action_result":
					case "browser_action_launch":
						return true
					default:
						return false
				}
			case "ask":
				return true
		}
		return true
	})

	// 메시지 높이 변경 처리
	const handleRowHeightChange = useCallback(
		(isTaller: boolean) => {
			if (!isAtBottom && isTaller) {
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
						key={messageOrGroup[0].ts}
						messages={messageOrGroup}
						// 1. 함수 자체를 전달하도록 수정
						isExpanded={isExpanded} 
						onToggleExpand={toggleExpand} 
						isLast={index === groupedMessages.length - 1}
						// messageIndex={index} 
						onHeightChange={handleRowHeightChange}
					/>
				)
			} else {
				// 일반 메시지 렌더링
				return (
					<ChatRow
						key={messageOrGroup.ts}
						message={messageOrGroup}
						isExpanded={isExpanded(messageOrGroup.ts)}
						onToggleExpand={() => toggleExpand(messageOrGroup.ts)}
						onHeightChange={handleRowHeightChange}
					/>
				)
			}
		},
		[handleRowHeightChange, isExpanded, toggleExpand]
	)

	// 사용자 입력 전송
	const handleSendMessage = useCallback(() => {
		if (!inputValue.trim() && selectedImages.length === 0) return

		vscode.postMessage({
			// 2. type을 'invoke'로 수정
			type: "invoke", 
			// type: "sendMessage", 
			// invoke: "sendMessage",
			text: inputValue,
			images: selectedImages,
		})

		resetInput()
	}, [inputValue, selectedImages, resetInput])

	// 이미지 선택 핸들러
	const selectImages = () => {
		vscode.postMessage({
			type: "selectImages",
		})
	}

	// 기본 버튼(예: '예', '재시도') 클릭 처리
	const handlePrimaryButtonClick = useCallback(() => {
		vscode.postMessage({
			type: "askResponse",
			askResponse: "yesButtonClicked",
		})
		resetButtonsState()
	}, [resetButtonsState])

	// 보조 버튼(예: '아니요', '취소') 클릭 처리
	const handleSecondaryButtonClick = useCallback(() => {
		if (didClickCancel || secondaryButtonText === "Cancel") {
			// 스트리밍 취소
			vscode.postMessage({ type: "cancelTask" })
		} else {
			// '아니요' 버튼 응답
			vscode.postMessage({
				type: "askResponse",
				askResponse: "noButtonClicked",
			})
		}
		resetButtonsState()
	}, [didClickCancel, secondaryButtonText, resetButtonsState])

	// 태스크 닫기 버튼 핸들러
	const handleCloseTask = useCallback(() => {
		if (currentTaskItem?.id) {
			vscode.postMessage({ type: "deleteTaskWithId" })
		}
	}, [currentTaskItem])

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
			<ChatHeader
				task={task}
				telemetrySetting={telemetrySetting}
				showAnnouncement={showAnnouncement}
				version={version}
				hideAnnouncement={hideAnnouncement}
				handleTaskCloseButtonClick={handleCloseTask}
				apiMetrics={apiMetrics}
				lastApiReqTotalTokens={lastApiReqTotalTokens}
				selectedModelInfo={selectedModelInfo}
			/>

			{/* 메시지 목록 영역 */}
			<div
				style={{
					flex: "1 1 auto",
					minHeight: 0,
					position: "relative",
				}}>
				<Virtuoso
					ref={virtuosoRef}
					style={{ height: "100%" }}
					data={groupedMessages}
					totalCount={groupedMessages.length}
					itemContent={itemContent}
					onScroll={handleScroll}
					initialTopMostItemIndex={groupedMessages.length - 1}
					followOutput={isAtBottom}
				/>

				{/* 스크롤 컨트롤 */}
				<ScrollControls 
					showScrollToBottom={showScrollToBottom} 
					onScrollToBottom={scrollToBottomManual} 
				/>
			</div>

			{/* 하단 입력 영역 */}
			<div style={{ padding: "10px 0" }}>
				{/* 모드 선택 영역 */}
				<ModeSelector availableModes={availableModes} chatSettings={chatSettings} />

				{/* 버튼 영역 */}
				{showScrollToBottom ? null : (
					<ChatButtons
						primaryButtonText={primaryButtonText}
						secondaryButtonText={secondaryButtonText}
						enableButtons={enableButtons}
						isStreaming={isStreaming.current}
						didClickCancel={didClickCancel}
						onPrimaryClick={handlePrimaryButtonClick}
						onSecondaryClick={handleSecondaryButtonClick}
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
					onSend={handleSendMessage}
					onSelectImages={selectImages}
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
