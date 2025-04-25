import React from "react";
import styled from "styled-components";
import {
  VSCodeTextField,
  VSCodeDivider,
} from "@vscode/webview-ui-toolkit/react";

// Define the structure for a single mode's settings
export interface ModeSettingsData {
  name: string;
  description: string;
  rules: string[];
}

// Props for the ModeTabContent component
interface ModeTabContentProps {
  modeId: string;
  settings: ModeSettingsData;
  updateModeSettings: (modeId: string, field: keyof ModeSettingsData, value: any) => void;
}

// Styled components (Copied from ModeSettingsView.tsx for now)
// Consider moving these to a shared location if used elsewhere
const ContentArea = styled.div`
  flex-grow: 1;
  overflow-y: auto; /* Allow content scrolling */
  padding-right: 5px; /* Add padding for scrollbar */
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 10px;
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const ModeTabContent: React.FC<ModeTabContentProps> = ({
  modeId,
  settings,
  updateModeSettings,
}) => {
  // Convert rules array to string for textarea
  const rulesText = settings.rules.join("\n");

  // Handle rules text change for the native textarea
  const handleRulesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newRules = e.target.value.split("\n").filter((rule: string) => rule.trim() !== "");
    updateModeSettings(modeId, "rules", newRules);
  };

  return (
    <ContentArea>
      <Section>
        <SectionTitle>{settings.name} 설정</SectionTitle>
        <OptionRow>
          <VSCodeTextField
            placeholder="Enter Mode Name"
            value={settings.name}
            style={{ width: "100%" }}
            onChange={(e) => updateModeSettings(modeId, "name", (e.target as HTMLInputElement)?.value || "")}>
            모드 이름:
          </VSCodeTextField>
        </OptionRow>
        <OptionRow>
          <VSCodeTextField
            placeholder="Enter Mode Description"
            value={settings.description}
            style={{ width: "100%" }}
            onChange={(e) =>
              updateModeSettings(modeId, "description", (e.target as HTMLInputElement)?.value || "")
            }>
            모드 설명:
          </VSCodeTextField>
        </OptionRow>
      </Section>

      <VSCodeDivider></VSCodeDivider>

      <Section>
        <SectionTitle>모드별 규칙 설정</SectionTitle>
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>모드별 규칙:</label>
          <textarea
            placeholder={`${settings.name} 모드에 대한 규칙을 한 줄에 하나씩 입력하세요...`}
            value={rulesText}
            rows={8}
            style={{
              width: "100%",
              padding: "5px",
              border: "1px solid var(--vscode-focusBorder)",
              background: "var(--vscode-input-background)",
              color: "var(--vscode-input-foreground)",
              resize: "vertical", // Allow vertical resize
            }}
            onChange={handleRulesChange}
          />
        </div>
        <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "5px" }}>
          각 줄은 하나의 규칙으로 처리됩니다. 빈 줄은 무시됩니다.
        </div>
      </Section>

      {/* Removed the extra divider from the original renderTabContent */}
      {/* <VSCodeDivider></VSCodeDivider> */}
    </ContentArea>
  );
};

export default ModeTabContent;
