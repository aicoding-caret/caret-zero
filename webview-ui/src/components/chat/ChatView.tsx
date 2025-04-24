import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React, { useState, useRef, useCallback, useEffect, useMemo, UIEventHandler } from "react"
import { Virtuoso, VirtuosoHandle } from "react-virtuoso"
import styled from "styled-components"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import { useEvent } from "react-use"
import BrowserSessionRow from "./BrowserSessionRow"
import ChatRow from "./ChatRow"
import ChatTextArea from "./ChatTextArea"
import TaskHeader from "./TaskHeader"
import { ApiProvider, ModelInfo } from "../../../../src/shared/api"
import { CaretMessage } from "../../../../src/shared/ExtensionMessage"
import { WebviewMessage } from "../../../../src/shared/WebviewMessage"

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

import { normalizeApiConfiguration } from "../settings/ApiOptions"

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

	// 메시지 상태 관리 Hook
	const { task, modifiedMessages, apiMetrics, lastApiReqTotalTokens, isExpanded, toggleExpand } = useMessageState(
		// messages 사용
		messages
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
		// messages 사용
	} = useCaretAskState(messages, setTextAreaDisabled, resetInput)

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
		if (!text.trim() && images.length === 0) return

		const newTask = !task
		vscode.postMessage({
			type: "askResponse",
			askResponse: "messageResponse",
			text,
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
		resetInput()
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
					resetInput() // Input clear after sending
					break
				case "command_output":
					vscode.postMessage({
						type: "askResponse",
						askResponse: "messageResponse",
						text: trimmedInput || base64Images ? trimmedInput : undefined,
						images: base64Images,
					})
					resetInput()
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
					resetInput()
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

			resetInput() // 입력 초기화
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
				// telemetrySetting 사용
				telemetrySetting={telemetrySetting}
				showAnnouncement={showAnnouncement}
				// version 사용
				version={version}
				hideAnnouncement={hideAnnouncement}
				handleTaskCloseButtonClick={handleCloseTask}
				apiMetrics={apiMetrics}
				lastApiReqTotalTokens={lastApiReqTotalTokens}
				selectedProvider={selectedProvider}
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
					// ref 직접 전달
					// scrollerRef={scrollContainerRef} // 수정: ref 객체 직접 전달 -> 제거
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
				// availableModes, chatSettings 사용
				<ModeSelector availableModes={availableModes} chatSettings={chatSettings} />

				{/* 버튼 영역 */}
				{showScrollToBottom ? null : (
					<ChatButtons
						enableButtons={enableButtons}
						primaryButtonText={primaryButtonText} // 훅에서 받은 텍스트 사용
						secondaryButtonText={secondaryButtonText} // 훅에서 받은 텍스트 사용
						onPrimaryClick={handlePrimaryButtonClick}
						onSecondaryClick={handleSecondaryButtonClick}
						isStreaming={isStreaming.current} // 현재 스트리밍 상태 전달
						didClickCancel={didClickCancel} // 취소 버튼 클릭 여부 전달
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
					onSend={handleSendClick} // Use the correct handler
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
