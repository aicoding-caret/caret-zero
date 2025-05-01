import React from "react";
import styled from "styled-components";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

// Styled components (Copied from SettingsView.tsx for now)
const SettingsSection = styled.div`
	margin-bottom: 20px;
	padding-bottom: 15px;
	border-bottom: 1px solid var(--vscode-settings-headerBorder);
	&:last-of-type {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}
`;

const SectionTitle = styled.h4`
	margin-top: 0;
	margin-bottom: 10px;
	font-weight: 600; /* Slightly bolder title */
`;

const ProfileImagePreview = styled.div`
	width: 64px;
	height: 64px;
	border-radius: 50%;
	background-color: var(--vscode-editor-background);
	overflow: hidden;
	margin-bottom: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const ProfileImageWrapper = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 15px;
`;

const ProfileImageActions = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const ImagesContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 28px;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
`;

const SingleImageSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 120px;
`;

interface ProfileImageSettingsProps {
  defaultImage: string | undefined;
  thinkingImage: string | undefined;
  onSelectDefaultImage: () => void;
  onSelectThinkingImage: () => void;
}

const ProfileImageSettings: React.FC<ProfileImageSettingsProps> = ({
  defaultImage,
  thinkingImage,
  onSelectDefaultImage,
  onSelectThinkingImage,
}) => {
  // 이미지 로딩 실패 상태
  const [defaultImageError, setDefaultImageError] = React.useState(false);
  const [thinkingImageError, setThinkingImageError] = React.useState(false);

  return (
    <SettingsSection>
      <ImagesContainer>
        {/* 기본 이미지 */}
        <SingleImageSection>
          <div style={{ marginBottom: "4px", fontWeight: 500, textAlign: "center", fontSize: 13 }}>기본 이미지</div>
          <ProfileImagePreview>
            {!defaultImageError && defaultImage ? (
              <img
                src={defaultImage}
                alt="AI 에이전트 프로필"
                style={{ width: "64px", height: "64px", objectFit: "cover" }}
                onError={() => setDefaultImageError(true)}
              />
            ) : (
              <span style={{ fontSize: 12, color: "var(--vscode-descriptionForeground)", textAlign: "center" }}>이미지 없음</span>
            )}
          </ProfileImagePreview>
          <ProfileImageActions>
            <VSCodeButton onClick={onSelectDefaultImage}>이미지 선택</VSCodeButton>
          </ProfileImageActions>
        </SingleImageSection>

        {/* 생각 중 이미지 */}
        <SingleImageSection>
          <div style={{ marginBottom: "4px", fontWeight: 500, textAlign: "center", fontSize: 13 }}>생각 중 이미지</div>
          <ProfileImagePreview>
            {!thinkingImageError && thinkingImage ? (
              <img
                src={thinkingImage}
                alt="AI 에이전트 생각 중"
                style={{ width: "64px", height: "64px", objectFit: "cover" }}
                onError={() => setThinkingImageError(true)}
              />
            ) : (
              <span style={{ fontSize: 12, color: "var(--vscode-descriptionForeground)", textAlign: "center" }}>이미지 없음</span>
            )}
          </ProfileImagePreview>
          <ProfileImageActions>
            <VSCodeButton onClick={onSelectThinkingImage}>이미지 선택</VSCodeButton>
          </ProfileImageActions>
        </SingleImageSection>
      </ImagesContainer>
      <p style={{ fontSize: "13px", color: "var(--vscode-descriptionForeground)", marginTop: "12px", textAlign: "center" }}>
        AI 에이전트의 프로필 이미지를 설정합니다. 기본 이미지는 일반 대화에서, 생각 중 이미지는 AI가 응답을 생성할 때 표시됩니다.
      </p>
    </SettingsSection>
  );
};

export default ProfileImageSettings;
