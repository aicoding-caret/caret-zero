import React, { useState } from 'react';
import styled from 'styled-components';
import { VSCodeButton, VSCodeTextArea, VSCodeTextField, VSCodeCheckbox, VSCodeDivider, VSCodePanels, VSCodePanelTab, VSCodePanelView } from '@vscode/webview-ui-toolkit/react';

const Container = styled.div`
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const Title = styled.h2`
  margin: 0;
`;

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

const JsonInputArea = styled.div`
    margin-top: 10px;
`;

// Placeholder for mode data - replace with actual data fetching later
const modes = [
    { id: 'mode-1', name: 'Mode 1 (e.g., Plan)' },
    { id: 'mode-2', name: 'Mode 2 (e.g., Act)' },
    { id: 'mode-3', name: 'Mode 3' },
    { id: 'mode-4', name: 'Mode 4' },
    { id: 'mode-5', name: 'Mode 5' },
];

const ModeSettingsView = ({ onDone }: { onDone: () => void }) => {
    // Default to the first mode's tab
    const [activeTab, setActiveTab] = useState(modes[0]?.id || 'mode-1');

    // Function to render content for a given mode ID
    const renderTabContent = (modeId: string) => {
        const mode = modes.find(m => m.id === modeId);
        const modeName = mode ? mode.name : 'Unknown Mode'; // Use actual name later

        return (
            <ContentArea>
                <Section>
                    <SectionTitle>{modeName} Options</SectionTitle>
                    {/* Placeholder for mode-specific options */}
                    <OptionRow>
                         <VSCodeTextField placeholder="Enter Mode Name" value={modeName} style={{ width: '100%' }}>Mode Name:</VSCodeTextField>
                    </OptionRow>
                    <OptionRow>
                        <VSCodeCheckbox>Enable File Editing</VSCodeCheckbox>
                    </OptionRow>
                    <OptionRow>
                        <VSCodeCheckbox>Allow Command Execution</VSCodeCheckbox>
                    </OptionRow>
                    <OptionRow>
                        <VSCodeTextField placeholder="/path/to/allowed" style={{ width: '100%' }}>Allowed File Paths (comma-separated):</VSCodeTextField>
                    </OptionRow>
                    {/* Add more options as needed */}
                </Section>

                <VSCodeDivider></VSCodeDivider>

                <Section>
                    <SectionTitle>Rule Configuration (Overrides)</SectionTitle>
                    {/* Placeholder for rule settings */}
                    <VSCodeTextArea
                        placeholder={`Enter specific rules to override global/project settings for ${modeName}, one per line...`}
                        rows={8}
                        style={{ width: '100%' }}
                    >
                        Mode-Specific Rules:
                    </VSCodeTextArea>
                </Section>

                 <VSCodeDivider></VSCodeDivider>

                <Section>
                    <SectionTitle>Raw JSON Prompt Input (Advanced)</SectionTitle>
                    <JsonInputArea>
                         <VSCodeTextArea
                            placeholder={`Optionally, paste the full JSON prompt configuration for ${modeName} here. This will override individual settings above.`}
                            rows={15}
                            style={{ width: '100%' }}
                        >
                            Full JSON Input:
                        </VSCodeTextArea>
                    </JsonInputArea>
                </Section>
            </ContentArea>
        );
    }

    return (
        <Container>
            <Header>
                <Title>Mode Settings</Title>
                <VSCodeButton appearance="secondary" onClick={onDone}>Done</VSCodeButton>
            </Header>

            <VSCodePanels activeid={activeTab} onChange={(e: any) => setActiveTab(e.target.activeid)}>
                {/* Generate tabs dynamically */}
                {modes.map(mode => (
                    <VSCodePanelTab key={mode.id} id={mode.id}>{mode.name}</VSCodePanelTab>
                ))}

                {/* Generate panel views dynamically */}
                 {modes.map(mode => (
                    <VSCodePanelView key={`view-${mode.id}`} id={`view-${mode.id}`}>
                        {renderTabContent(mode.id)}
                    </VSCodePanelView>
                ))}
            </VSCodePanels>

             {/* Add Save/Reset buttons if needed */}
             <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid var(--vscode-editorGroup-border)', display: 'flex', justifyContent: 'flex-end' }}>
                 <VSCodeButton appearance="primary" style={{ marginRight: '5px' }}>Save All Mode Settings</VSCodeButton>
                 {/* <VSCodeButton appearance="secondary">Reset Current Tab</VSCodeButton> */}
             </div>
        </Container>
    );
};

export default ModeSettingsView;
