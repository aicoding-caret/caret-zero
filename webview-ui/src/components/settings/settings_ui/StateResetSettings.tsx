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

interface StateResetSettingsProps {
  onResetState: () => void;
}

const StateResetSettings: React.FC<StateResetSettingsProps> = ({
  onResetState,
}) => {
  return (
    <SettingsSection>
      <VSCodeButton onClick={onResetState} style={{ marginTop: "5px", width: "auto" }}>
        상태 초기화
      </VSCodeButton>
      <p
        style={{
          fontSize: "12px",
          marginTop: "5px",
          color: "var(--vscode-descriptionForeground)",
        }}>
        확장 프로그램의 모든 상태와 비밀 저장소를 초기화합니다.
      </p>
    </SettingsSection>
  );
};

export default StateResetSettings;
