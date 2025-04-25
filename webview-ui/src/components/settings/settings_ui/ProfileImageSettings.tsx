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
	width: 100px;
	height: 100px;
	border-radius: 50%;
	background-color: var(--vscode-editor-background);
	border: 2px solid var(--vscode-button-background);
	overflow: hidden;
	margin-right: 15px;
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

interface ProfileImageSettingsProps {
  defaultImage: string | undefined;
  thinkingImage: string | undefined;
  onSelectDefaultImage: () => void;
  onResetDefaultImage: () => void;
  onSelectThinkingImage: () => void;
  onResetThinkingImage: () => void;
}

const ProfileImageSettings: React.FC<ProfileImageSettingsProps> = ({
  defaultImage,
  thinkingImage,
  onSelectDefaultImage,
  onResetDefaultImage,
  onSelectThinkingImage,
  onResetThinkingImage,
}) => {
  return (
    <SettingsSection>
      <SectionTitle>AI 에이전트 프로필 이미지 설정</SectionTitle>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {/* 기본 이미지 설정 */}
        <div style={{ flex: 1, marginRight: "15px" }}>
          <div style={{ marginBottom: "5px", fontWeight: "500" }}>기본 이미지</div>
          <ProfileImageWrapper>
            <ProfileImagePreview>
              {defaultImage ? (
                <img
                  src={defaultImage}
                  alt="AI 에이전트 프로필"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--vscode-descriptionForeground)",
                    width: "100%",
                    height: "100%",
                  }}>
                  <i className="codicon codicon-account" style={{ fontSize: "32px" }} />
                </div>
              )}
            </ProfileImagePreview>
            <ProfileImageActions>
              <VSCodeButton onClick={onSelectDefaultImage}>이미지 선택</VSCodeButton>
              <VSCodeButton onClick={onResetDefaultImage}>기본으로 초기화</VSCodeButton>
            </ProfileImageActions>
          </ProfileImageWrapper>
        </div>

        {/* 생각 중 이미지 설정 */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: "5px", fontWeight: "500" }}>생각 중 이미지</div>
          <ProfileImageWrapper>
            <ProfileImagePreview>
              {thinkingImage ? (
                <img
                  src={thinkingImage}
                  alt="AI 에이전트 생각 중"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--vscode-descriptionForeground)",
                    width: "100%",
                    height: "100%",
                  }}>
                  <i className="codicon codicon-loading" style={{ fontSize: "32px" }} />
                </div>
              )}
            </ProfileImagePreview>
            <ProfileImageActions>
              <VSCodeButton onClick={onSelectThinkingImage}>이미지 선택</VSCodeButton>
              <VSCodeButton onClick={onResetThinkingImage}>기본으로 초기화</VSCodeButton>
            </ProfileImageActions>
          </ProfileImageWrapper>
        </div>
      </div>
      <p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)", marginTop: "10px" }}>
        AI 에이전트의 프로필 이미지를 설정합니다. 기본 이미지는 일반 대화에서, 생각 중 이미지는 AI가 응답을 생성할 때 표시됩니다.
      </p>
    </SettingsSection>
  );
};

export default ProfileImageSettings;
