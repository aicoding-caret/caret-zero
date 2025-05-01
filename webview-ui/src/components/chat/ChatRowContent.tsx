import React, { memo } from "react"
import { CaretMessage } from "../../../../src/shared/ExtensionMessage"
import { useExtensionState } from "../../context/ExtensionStateContext"
import styled from "styled-components"
import { getMessageTypeText, parseFollowupMessage, parsePlanModeResponse } from "./chat_utils/messageParser"
import MarkdownBlock from "../common/MarkdownBlock"
import { OptionsButtons } from "./OptionsButtons"

// 컴포넌트 props 타입 정의
interface ChatRowContentProps {
	message: CaretMessage;
	isExpanded?: boolean;
	onToggleExpand?: (ts: number) => void;
	lastModifiedMessage?: CaretMessage;
	isLast?: boolean;
}

// 알파 아바타 스타일
const AvatarImage = styled.img`
	width: 48px;
	height: 48px;
	border-radius: 20%;
	margin-right: 10px;
	object-fit: cover;
	flex-shrink: 0;
	border: 1px solid rgba(255, 255, 255, 0.1);
`

// 메시지 행 컨테이너
const MessageRowContainer = styled.div`
	display: flex;
	align-items: flex-start;
	position: relative;
	margin-bottom: 8px;
`

// 메시지 내용 감싸는 컨테이너
const MessageContentWrapper = styled.div<{ $isAiMessage?: boolean; $isThinking?: boolean }>`
	flex-grow: 1;
	padding: 8px 12px;
	border-radius: 6px;
	background-color: ${({ $isAiMessage, $isThinking }) =>
		$isThinking 
			? "var(--vscode-editor-background)" 
			: $isAiMessage 
				? "var(--vscode-textBlockQuote-background)" 
				: "transparent"};
	border-left: ${({ $isThinking }) => $isThinking ? "3px solid var(--vscode-activityBarBadge-background)" : "none"};
	min-width: 0;
	position: relative;
	opacity: ${({ $isThinking }) => $isThinking ? 0.9 : 1};
`

// 사용자 피드백 컨테이너
const UserFeedbackContainer = styled.div`
	margin: 6px 0;
	padding: 10px;
	border-radius: 6px;
	background-color: var(--vscode-inputOption-activeBackground);
	color: var(--vscode-inputOption-activeForeground);
`

// 내부 분석 메시지인지 확인하는 함수
function isInternalAnalysisMessage(text?: string): boolean {
	if (!text) return false;
	
	return (
		// 한글 패턴
		(text.includes("사용자가") && 
		 (text.includes("응답하고 있습니다") || text.includes("요청했습니다"))) ||
		// 영어 패턴
		(text.includes("I need to") && text.includes("response")) ||
		(text.includes("The user has") && text.includes("message")) ||
		(text.includes("In response to") && text.includes("request")) ||
		(text.includes("I should") && text.includes("respond")) ||
		(text.includes("I need to use a tool")) ||
		(text.includes("need to use a tool")) ||
		(text.includes("Looking at the environment") && text.includes("details")) ||
		(text.includes("The most suitable") && text.includes("tool")) ||
		(text.includes("The user is asking for") && text.includes("I should")) ||
		(text.includes("translates to") && text.includes("I'll use")) ||
		(text.includes("Based on the project structure") && text.includes("I can see")) ||
		(text.includes("This appears to be a") && text.includes("I'll provide"))
	);
}

// 내부 환경 메시지인지 확인하는 함수
function isInternalEnvironmentMessage(text?: string): boolean {
	if (!text) return false;
	
	return (
		text.includes("<environment_details>") || 
		(text.includes("<") && text.includes(">")) ||
		text.includes("tokens used") || 
		text.includes("\"tokensIn\":") ||
		text.includes("MODE\n") ||
		text.includes("You are in")
	);
}

// 채팅 행 내용 컴포넌트
function ChatRowContent({ message, isExpanded, onToggleExpand, lastModifiedMessage, isLast }: ChatRowContentProps) {
	// 상태 컨텍스트 가져오기
	const extensionState = useExtensionState();
	
	// 아바타 URL 설정 (기본값 포함)
	const alphaAvatarUri = extensionState.alphaAvatarUri;
	const alphaThinkingAvatarUri = extensionState.alphaThinkingAvatarUri;
	
	// 내부 분석 메시지 또는 환경 메시지 확인
	const isInternal = isInternalEnvironmentMessage(message.text);
	const isThinking = (message.type === "say" && message.say === "reasoning") ||
	                   (message.type === "ask" && message.ask === "completion_result");
	const isAnalysis = isInternalAnalysisMessage(message.text);
	
	// 내부 분석/환경 메시지는 표시하지 않음
	if (isInternal || isAnalysis) {
		return null;
	}
	
	// AI 메시지인지 확인
	const isAiMessage = 
		(message.type === "say" && (message.say === "completion_result" || message.say === "reasoning")) ||
		(message.type === "ask" && message.ask === "completion_result");
	
	// 메시지 유형에 따라 표시할 아바타 이미지 결정
	const getAvatarSrc = () => {
		// 생각 중인 메시지일 경우
		if (isThinking) {
			// 생각 중 이미지 사용
			return alphaThinkingAvatarUri;
		}
		// 기본 아바타 이미지
		return alphaAvatarUri;
	}
	
	// followup 메시지 (질문과 선택 옵션)
	if (message.type === "ask" && message.ask === "followup") {
		const { question, options, selected } = parseFollowupMessage(message);
		
		return (
			<MessageRowContainer>
				<AvatarImage src={getAvatarSrc()} alt="Alpha" />
				<MessageContentWrapper $isAiMessage={true}>
					<div style={{ paddingTop: 6 }}>
						<div style={{
							wordBreak: "break-word",
							overflowWrap: "anywhere",
							marginBottom: -15,
							marginTop: -15,
						}}>
							<MarkdownBlock markdown={question} />
						</div>
						<OptionsButtons
							options={options}
							selected={selected}
							isActive={isLast && lastModifiedMessage?.ask === "followup"}
						/>
					</div>
				</MessageContentWrapper>
			</MessageRowContainer>
		);
	}
	
	// plan_mode_respond 메시지
	if (message.type === "ask" && message.ask === "plan_mode_respond") {
		const { response, options, selected } = parsePlanModeResponse(message);
		
		return (
			<MessageRowContainer>
				<AvatarImage src={getAvatarSrc()} alt="Alpha" />
				<MessageContentWrapper $isAiMessage={true}>
					<div style={{
						wordBreak: "break-word",
						overflowWrap: "anywhere",
						marginBottom: -15,
						marginTop: -15,
					}}>
						<MarkdownBlock markdown={response} />
					</div>
					<OptionsButtons
						options={options}
						selected={selected}
						isActive={isLast && lastModifiedMessage?.ask === "plan_mode_respond"}
					/>
				</MessageContentWrapper>
			</MessageRowContainer>
		);
	}
	
	// user_feedback 메시지
	if (message.type === "say" && message.say === "user_feedback") {
		return (
			<UserFeedbackContainer>
				<div style={{
					wordBreak: "break-word",
					overflowWrap: "anywhere",
				}}>
					<MarkdownBlock markdown={message.text} />
				</div>
			</UserFeedbackContainer>
		);
	}
	
	// AI의 생각 과정 메시지는 표시
	if (isThinking) {
		return (
			<MessageRowContainer>
				<AvatarImage src={alphaThinkingAvatarUri} alt="Thinking" />
				<MessageContentWrapper $isAiMessage={true} $isThinking={true}>
					<div style={{ 
						display: 'flex', 
						alignItems: 'center', 
						color: 'var(--vscode-descriptionForeground)',
						fontSize: '0.9rem'
					}}>
						생각 중...
					</div>
				</MessageContentWrapper>
			</MessageRowContainer>
		);
	}
	
	// AI 메시지인 경우 (completion_result 등)
	if (message.type === "say" && message.say === "completion_result") {
		return (
			<MessageRowContainer>
				<AvatarImage src={alphaAvatarUri} alt="Alpha" />
				<MessageContentWrapper $isAiMessage={true}>
					<MarkdownBlock markdown={message.text} />
				</MessageContentWrapper>
			</MessageRowContainer>
		);
	}
	
	// 도구 호출 메시지
	if ((message.type === "say" && message.say === "tool") || 
		(message.type === "ask" && message.ask === "tool")) {
		const title = getMessageTypeText(message);
		
		return (
			<div>
				{title && (
					<div style={{
						display: "flex",
						alignItems: "center",
						marginBottom: 6,
						fontSize: 13,
						color: "var(--vscode-descriptionForeground)",
					}}>
						<i
							className={"codicon codicon-tools"}
							style={{
								color: "var(--vscode-charts-blue)",
								marginRight: 6,
							}}
						/>
						{title}
					</div>
				)}
				<div style={{
					wordBreak: "break-word",
					overflowWrap: "anywhere",
				}}>
					<MarkdownBlock markdown={message.text} />
				</div>
			</div>
		);
	}
	
	// 명령 실행 메시지
	if ((message.type === "say" && message.say === "command") || 
		(message.type === "ask" && message.ask === "command")) {
		const title = getMessageTypeText(message);
		
		return (
			<div>
				{title && (
					<div style={{
						display: "flex",
						alignItems: "center",
						marginBottom: 6,
						fontSize: 13,
						color: "var(--vscode-descriptionForeground)",
					}}>
						<i
							className={"codicon codicon-terminal"}
							style={{
								color: "var(--vscode-charts-green)",
								marginRight: 6,
							}}
						/>
						{title}
					</div>
				)}
				<div style={{
					wordBreak: "break-word",
					overflowWrap: "anywhere",
				}}>
					<MarkdownBlock markdown={message.text} />
				</div>
			</div>
		);
	}
	
	// 기본 텍스트 메시지
	return (
		<div>
			<div style={{
				wordBreak: "break-word",
				overflowWrap: "anywhere",
			}}>
				<MarkdownBlock markdown={message.text} />
			</div>
		</div>
	);
}

export default memo(ChatRowContent);
