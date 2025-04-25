import React from "react";
import styled from "styled-components";
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";

// Define the correct type for telemetry setting based on error messages
type TelemetrySettingValue = 'enabled' | 'disabled' | 'unset';

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

interface TelemetrySettingsProps {
  telemetrySetting: TelemetrySettingValue; // Use the defined type
  setTelemetrySetting: (value: TelemetrySettingValue) => void; // Use the defined type
}

const TelemetrySettings: React.FC<TelemetrySettingsProps> = ({
  telemetrySetting, // Prop received from parent
  setTelemetrySetting, // Prop received from parent
}) => {
  return (
    <SettingsSection>
      <VSCodeCheckbox
        style={{ marginBottom: "5px" }}
        checked={false} // Currently hardcoded to false and disabled
        disabled={true} // Currently hardcoded to disabled
        onChange={(e: any) => {
          // 현재 비활성화함
          // If enabled in the future, this would use setTelemetrySetting
          // Pass the correct type, although it's currently hardcoded/disabled
          setTelemetrySetting("disabled");
        }}>
        익명 오류 및 사용량 보고 허용 (현재 비활성화됨)
      </VSCodeCheckbox>
      <p
        style={{
          fontSize: "12px",
          marginTop: "5px",
          color: "var(--vscode-descriptionForeground)",
        }}>
        Caret의 데이터 수집 정책이 재검토 중이며, 현재는 어떠한 데이터도 수집하지 않습니다.
        여기에 표시되는 문서는 업데이트 중입니다.
      </p>
    </SettingsSection>
  );
};

export default TelemetrySettings;
