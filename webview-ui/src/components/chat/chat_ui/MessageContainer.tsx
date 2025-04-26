import React, { ReactNode } from "react"
import styled from "styled-components"

/**
 * 메시지 행 컨테이너 스타일
 * 아바타와 메시지 내용을 가로로 배치
 */
export const MessageRowContainer = styled.div`
	display: flex;
	align-items: flex-start;
	margin-bottom: 8px;
	position: relative;
`

/**
 * 메시지 내용 래퍼 스타일
 * AI 메시지와 사용자 메시지 구분을 위한 배경색 적용
 */
export const MessageContentWrapper = styled.div<{ $isAiMessage?: boolean }>`
	flex-grow: 1;
	padding: 8px 12px;
	border-radius: 6px;
	background-color: ${({ $isAiMessage }) =>
		$isAiMessage ? "var(--vscode-textBlockQuote-background)" : "transparent"};
	min-width: 0;
	position: relative;
`

/**
 * 도구 결과 컨테이너 스타일
 * 도구 실행 결과 표시를 위한 전용 스타일
 */
export const ToolResultContainer = styled.div`
	margin-top: 8px;
	padding: 12px;
	border-radius: 6px;
	background-color: var(--vscode-editor-background);
	border-left: 3px solid var(--vscode-activityBarBadge-background);
`

/**
 * 사용자 피드백 컨테이너 스타일
 * 사용자 입력과 피드백 표시용 스타일
 */
export const UserFeedbackContainer = styled.div`
	margin: 6px 0;
	padding: 10px;
	border-radius: 6px;
	background-color: var(--vscode-inputOption-activeBackground);
	color: var(--vscode-inputOption-activeForeground);
`

interface MessageContainerProps {
	/** uba54uc2dcuc9c0 ub0b4uc6a9 */
	children: ReactNode;
	/** AI uba54uc2dcuc9c0uc778uc9c0 uc5ecubd80 */
	isAiMessage?: boolean;
	/** uc0acuc6a9uc790 uba54uc2dcuc9c0uc778uc9c0 uc5ecubd80 */
	isUserMessage?: boolean;
	/** uc804uccb4 ud589uc744 uac10uc2f8uc57c ud558ub294uc9c0 uc5ecubd80 (falseuba74 ub0b4uc6a9ub9cc ubc18ud658) */
	wrapRow?: boolean;
	/** ref uc804ub2ecuc744 uc704ud55c ud568uc218 */
	refCallback?: (node: HTMLDivElement) => void;
}

/**
 * ucc44ud305 uba54uc2dcuc9c0 ucef4ud14cuc774ub108 ucef4ud3ecub10cud2b8
 * AI uba54uc2dcuc9c0uc640 uc0acuc6a9uc790 uba54uc2dcuc9c0uc5d0 ub530ub77c ub2e4ub978 uc2a4ud0c0uc77c uc801uc6a9
 */
const MessageContainer: React.FC<MessageContainerProps> = ({ 
	children, 
	isAiMessage = false,
	isUserMessage = false,
	wrapRow = true,
	refCallback
}) => {
	// ucef4ud14cuc774ub108ub9cc ubc18ud658ud558ub294 uacbduc6b0 (uc804uccb4 ud589 ud544uc694 uc5c6uc74c)
	if (!wrapRow) {
		return (
			<MessageContentWrapper $isAiMessage={isAiMessage} ref={refCallback}>
				{children}
			</MessageContentWrapper>
		)
	}

	// uc804uccb4 ud589 uac10uc2f8uc11c ubc18ud658
	return (
		<MessageRowContainer ref={refCallback}>
			<MessageContentWrapper $isAiMessage={isAiMessage}>
				{children}
			</MessageContentWrapper>
		</MessageRowContainer>
	)
}

export default MessageContainer
