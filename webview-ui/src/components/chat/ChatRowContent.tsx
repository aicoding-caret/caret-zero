import React from "react"
import { CaretMessage } from "../../../../src/shared/ExtensionMessage"
import { useExtensionState } from "../../context/ExtensionStateContext"
import ChatAvatar from "./chat_ui/ChatAvatar"
import { MessageRowContainer, MessageContentWrapper } from "./chat_ui/MessageContainer"
import { ChatRowContentProps } from "./chat_utils/chatRowTypes"
import { getMessageTypeText, isAiMessage, isUserMessage } from "./chat_utils/messageParser"

// 렌더러 컴포넌트들 import
import BaseRenderer from "./chat_renderers/BaseRenderer"
import CommandRenderer from "./chat_renderers/CommandRenderer"
import CompletionRenderer from "./chat_renderers/CompletionRenderer"
import McpRenderer from "./chat_renderers/McpRenderer"
import ToolRenderer from "./chat_renderers/ToolRenderer"
import UserInteractionRenderer from "./chat_renderers/UserInteractionRenderer"

/**
 * 채팅 행의 내용 렌더링 담당 컴포넌트
 * 메시지 타입에 따라 적절한 렌더러 선택
 */
const ChatRowContent: React.FC<ChatRowContentProps> = ({ message, isExpanded, onToggleExpand, lastModifiedMessage, isLast }) => {
	// 상태 컨텍스트 가져오기
	const extensionState = useExtensionState()

	// 아바타 URL 추출
	const alphaAvatarUri = extensionState.alphaAvatarUri || "assets/default_ai_agent_profile.png"
	// settings uc811uadecud560 uc218 uc5c6uc73cub2c8 uae30ubcf8uac12ub9cc uc0acuc6a9
	const alphaThinkingAvatarUri = "assets/default_ai_agent_thinking.png"

	// AI 응답인지 여부 확인
	const aiMessage = isAiMessage(message)
	// 사용자 메시지인지 여부 확인
	const userMessage = isUserMessage(message)

	// 메시지 타입에 따른 제목 생성
	const title = getMessageTypeText(message)

	// 메시지 타입에 따라 적절한 렌더러 선택
	const renderMessageContent = () => {
		// 도구 호출 메시지
		if ((message.type === "say" && message.say === "tool") || 
			(message.type === "ask" && message.ask === "tool")) {
			return <ToolRenderer message={message} title={title} />
		}

		// 명령 실행 메시지
		if ((message.type === "say" && message.say === "command") || 
			(message.type === "ask" && message.ask === "command")) {
			return <CommandRenderer message={message} title={title} lastModifiedMessage={lastModifiedMessage} isLast={isLast} />
		}

		// AI 응답 메시지
		if ((message.type === "say" && message.say === "completion_result") || 
			(message.type === "ask" && message.ask === "completion_result")) {
			return <CompletionRenderer message={message} title={title} lastModifiedMessage={lastModifiedMessage} isLast={isLast} />
		}

		// 내부 생각 과정 메시지
		if (message.type === "say" && message.say === "reasoning") {
			return <BaseRenderer message={message} title="AI's Internal Analysis" />
		}

		// MCP 서버 관련 메시지
		if ((message.type === "say" && message.say === "use_mcp_server") || 
			(message.type === "ask" && message.ask === "use_mcp_server")) {
			return <McpRenderer message={message} title={title} />
		}

		// 사용자 상호작용 메시지
		if ((message.type === "ask" && (message.ask === "followup" || message.ask === "plan_mode_respond")) ||
			(message.type === "say" && message.say === "user_feedback")) {
			return <UserInteractionRenderer message={message} title={title} lastModifiedMessage={lastModifiedMessage} isLast={isLast} />
		}

		// 기타 기본 텍스트 메시지
		return <BaseRenderer message={message} title={title} />
	}

	// 메시지 유형에 따라 표시할 아바타 이미지 결정
	const getAvatarSrc = () => {
		// 생각 중인 메시지일 경우
		if (message.type === "say" && message.say === "reasoning") {
			// 생각 중 이미지 사용 (없으면 기본 이미지)
			return alphaThinkingAvatarUri;
		}

		// 기본 아바타 이미지
		return alphaAvatarUri;
	}

	// AI 메시지인 경우 아바타와 함께 표시
	if (aiMessage) {
		return (
			<MessageRowContainer>
				<ChatAvatar src={getAvatarSrc()} alt="Alpha Avatar" />
				<MessageContentWrapper $isAiMessage={true}>
					{renderMessageContent()}
				</MessageContentWrapper>
			</MessageRowContainer>
		)
	} 
	// 사용자 피드백 메시지 (아바타 없음, 배경색 다름)
	else if (message.type === "say" && message.say === "user_feedback") {
		return renderMessageContent()
	} 
	// 사용자 메시지 또는 기타 시스템 메시지 (아바타 없음, 기본 배경)
	else {
		return renderMessageContent()
	}
}

export default ChatRowContent
