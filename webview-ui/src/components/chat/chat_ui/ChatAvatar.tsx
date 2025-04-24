import React from "react"
import styled from "styled-components"

// 아바타 이미지 스타일
const AvatarImage = styled.img`
	width: 48px;
	height: 48px;
	border-radius: 20%;
	margin-right: 10px;
	flex-shrink: 0; // 크기 고정
`

interface ChatAvatarProps {
	/** 아바타 이미지 URL */
	src: string;
	/** 아바타 대체 텍스트 */
	alt?: string;
}

/**
 * 채팅에서 사용하는 아바타 컴포넌트
 */
const ChatAvatar: React.FC<ChatAvatarProps> = ({ src, alt = "AI Avatar" }) => {
	return <AvatarImage src={src} alt={alt} />
}

export default ChatAvatar
