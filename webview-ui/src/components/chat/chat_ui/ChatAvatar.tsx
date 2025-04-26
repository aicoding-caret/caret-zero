import React from "react"
import styled from "styled-components"

// 아바타 이미지 컨테이너 스타일링
const AvatarContainer = styled.div`
	margin-right: 10px;
	flex-shrink: 0;
`

// 아바타 이미지 스타일링
const AvatarImage = styled.img`
	width: 48px;
	height: 48px;
	border-radius: 20%;
	object-fit: cover;
	border: 1px solid rgba(255, 255, 255, 0.1);
`

interface ChatAvatarProps {
	/** 아바타 이미지 URL */
	src: string;
	/** 아바타 대체 텍스트 */
	alt: string;
}

/**
 * 채팅에서 사용하는 아바타 컴포넌트
 */
const ChatAvatar: React.FC<ChatAvatarProps> = ({ src, alt }) => {
	// 이미지 로드 실패 시 기본 이미지로 대체
	const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		e.currentTarget.src = 'assets/default_ai_agent_profile.png';
	};

	return (
		<AvatarContainer>
			<AvatarImage 
				src={src} 
				alt={alt} 
				onError={handleImageError}
			/>
		</AvatarContainer>
	);
}

export default ChatAvatar
