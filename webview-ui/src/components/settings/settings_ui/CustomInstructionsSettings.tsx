import React from "react";
import styled from "styled-components";
import { VSCodeTextArea } from "@vscode/webview-ui-toolkit/react";

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

interface CustomInstructionsSettingsProps {
  customInstructions: string;
  setCustomInstructions: (value: string) => void;
}

const CustomInstructionsSettings: React.FC<CustomInstructionsSettingsProps> = ({
  customInstructions,
  setCustomInstructions,
}) => {
  return (
    <SettingsSection>
      <SectionTitle>사용자 기본 규칙</SectionTitle>
      <VSCodeTextArea
        value={customInstructions}
        onChange={(e: any) => setCustomInstructions(e.target.value)}
        placeholder="예: '런 유닛 테스트 전체' | 'Use TypeScript with async/await' | 'Speak in Spanish'"
        rows={5}
        style={{ width: "100%", resize: "vertical" }}>
      </VSCodeTextArea>
      <p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)" }}>
        이 규칙들은 모든 요청에 보내는 시스템 프롬프트 끝에 추가됩니다.
      </p>
    </SettingsSection>
  );
};

export default CustomInstructionsSettings;
