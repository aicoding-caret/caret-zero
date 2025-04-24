import React, { ReactNode } from "react"
import styled from "styled-components"

// uba54uc2dcuc9c0 ub0b4uc6a9 uac10uc2f8ub294 ucef4ud14cuc774ub108
const MessageContentWrapper = styled.div<{ $isAiMessage?: boolean }>`
	flex-grow: 1; // ub0a8uc740 uacf5uac04 ucc44uc6b0uae30
	padding: 8px 12px;
	border-radius: 6px;
	background-color: ${({ $isAiMessage }) =>
		$isAiMessage ? "var(--vscode-textBlockQuote-background)" : "transparent"}; // AI uba54uc2dcuc9c0 ubc30uacbduc0c9 uad6cubd84
	min-width: 0; // flex item ub0b4uc6a9 ub118uce68 ubc29uc9c0
`

// uc804uccb4 ucc44ud305 ud589 ucef4ud14cuc774ub108
const ChatRowContainer = styled.div`
	padding: 10px 6px 10px 15px;
	position: relative;
`

// uba54uc2dcuc9c0 ud589 ucef4ud14cuc774ub108
const MessageRowContainer = styled.div`
	display: flex;
	align-items: flex-start;
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
		<ChatRowContainer ref={refCallback}>
			<MessageContentWrapper $isAiMessage={isAiMessage}>
				{children}
			</MessageContentWrapper>
		</ChatRowContainer>
	)
}

export default MessageContainer
export { MessageContentWrapper, ChatRowContainer, MessageRowContainer }
