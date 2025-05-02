// 타입 문제는 나중에 해결하도록 하고, 지금은 @ts-nocheck 제거
import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import styled from "styled-components";
import {
	VSCodeButton,
	// VSCodeTextArea, // Removed (now in ModeTabContent)
	// VSCodeTextField, // Removed (now in ModeTabContent)
	// VSCodeCheckbox, // Removed (unused)
	// VSCodeDivider, // Removed (now in ModeTabContent)
	VSCodePanels,
	VSCodePanelTab,
	VSCodePanelView,
} from "@vscode/webview-ui-toolkit/react";
import { useExtensionState } from "../../context/ExtensionStateContext";
// import { vscode } from "../../utils/vscode"; // Removed (now handled by hook)
// import { WebviewMessage } from "../../../../src/shared/WebviewMessage"; // Removed (now handled by hook)
import ModeTabContent from "./mode_settings_ui/ModeTabContent"; // Import the new tab content component
import { useModeSettingsManagement } from "./hooks/useModeSettingsManagement"; // Import the new hook

const Container = styled.div`
	padding: 15px; // Keep container padding? Or remove if SettingsView provides enough
	height: 100%;
	display: flex;
	flex-direction: column;
`

const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15px;
`

const Title = styled.h2`
	margin: 0;
`

const ContentArea = styled.div`
	flex-grow: 1;
	overflow-y: auto; /* Allow content scrolling */
	padding-right: 5px; /* Add padding for scrollbar */
`

const Section = styled.div`
	margin-bottom: 20px;
`

const SectionTitle = styled.h3`
	margin-top: 0;
	margin-bottom: 10px;
`

const OptionRow = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
`

const JsonInputArea = styled.div`
	margin-top: 10px;
`;

// 기본 모드 설정 (availableModes가 없을 경우 폴백으로 사용) - 이 로직은 이제 availableModes 기반으로 처리됨
const defaultModes = [
	{ id: "arch", label: "Arch", description: "Caret Architect: Technical strategy & design" },
	{ id: "dev", label: "Dev", description: "Caret Developer: Implementation & debugging" },
	{ id: "rule", label: "Rule", description: "AI 시스템 규칙 최적화 및 프롬프트 엔지니어링 모드" },
	{ id: "talk", label: "Talk", description: "Casual conversation mode" },
	{ id: "custom", label: "Custom", description: "Custom mode with user-defined behavior" },
];

const ModeSettingsView = ({ onDone }: { onDone: () => void }) => {
	// Get available modes from context
	const { availableModes } = useExtensionState();

	// Use the custom hook for managing mode settings logic
	const {
		modeSettings,
		isLoading,
		isDirty,
		updateModeSettings,
		saveAllModeSettings,
		resetToDefaults,
	} = useModeSettingsManagement();

	// 모드 설정 로그 출력
	console.log("[ModeSettingsView] modeSettings:", modeSettings);
	console.log("[ModeSettingsView] isLoading:", isLoading);
	console.log("[ModeSettingsView] availableModes:", availableModes);

	// Determine the list of modes to display based on availableModes or defaults
	const modes =
		Array.isArray(availableModes) && availableModes.length > 0
			? availableModes.map((mode: any) => ({ // Use 'any' for now, refine if possible
					id: mode.id,
					label: mode.label || mode.id,
					description: mode.description || "",
				}))
			: defaultModes;

	// State for the active tab in VSCodePanels
	const [activeTab, setActiveTab] = useState(modes[0]?.id || "arch");

	// Update activeTab if the available modes change and the current tab is no longer valid
	useEffect(() => {
		if (modes.length > 0 && !modes.some(m => m.id === activeTab)) {
			setActiveTab(modes[0].id);
		}
	}, [modes, activeTab]);

	// Handle the "Done" button click
	const handleDoneClick = useCallback(() => {
		if (isDirty) {
			// Consider using a VSCode dialog instead of alert
			alert("모드 설정이 변경되었습니다. 저장하지 않은 변경 사항은 유실됩니다. 계속하시겠습니까?");
			// If user confirms, proceed. For now, just call onDone.
			// In a real scenario, you might want a confirmation dialog before calling onDone.
			onDone();
		} else {
			onDone();
		}
		// Original logic reloaded the window on change, which might not be ideal UX.
		// Keeping the simpler onDone call for now.
		/*
		if (initialModeSettings && JSON.stringify(modeSettings) !== initialModeSettings) {
			alert("모드 설정이 변경되어 새로고침합니다! (변경 사항이 즉시 반영됩니다)");
			window.location.reload();
		} else {
			onDone();
		}
		*/
	}, [isDirty, onDone]);

	// Removed local state management and effects for loading/saving/updating settings (now in hook)
	// Removed renderTabContent function (now handled by ModeTabContent component)

	return (
		<Container>
			<Header>
				<Title>Mode Settings</Title>
				<VSCodeButton appearance="secondary" onClick={handleDoneClick}>
					Done
				</VSCodeButton>
			</Header>

			{isLoading && (
				<div style={{ padding: "10px 0", fontStyle: "italic" }}>
					Loading mode settings...
				</div>
			)}

			<VSCodePanels activeid={activeTab} onChange={(e: any) => setActiveTab(e.target.activeid)}>
				{/* Generate tabs dynamically */}
				{modes.map((mode) => (
					<VSCodePanelTab key={mode.id} id={mode.id}>
						{mode.label}
					</VSCodePanelTab>
				))}

				{/* Generate panel views dynamically using ModeTabContent */}
				{modes.map((mode) => (
					<VSCodePanelView key={`view-${mode.id}`} id={`view-${mode.id}`}>
						{/* Show loading indicator or content */}
						{isLoading ? (
							<ContentArea>
								<Section>
									<SectionTitle>{mode.label} 설정</SectionTitle>
									<div style={{ fontStyle: "italic", padding: "10px 0" }}>
										모드 설정을 불러오는 중입니다...
									</div>
								</Section>
							</ContentArea>
						) : (
							/* Pass necessary props to ModeTabContent */
							/* Ensure modeSettings[mode.id] exists or provide a default */
							<ModeTabContent
								modeId={mode.id}
								settings={modeSettings[mode.id] || { name: mode.label, description: mode.description, rules: [] }}
								updateModeSettings={updateModeSettings}
							/>
						)}
					</VSCodePanelView>
				))}
			</VSCodePanels>

			{/* Save/Reset buttons */}
			<div
				style={{
					marginTop: "auto",
					paddingTop: "15px",
					borderTop: "1px solid var(--vscode-editorGroup-border)",
					display: "flex",
					justifyContent: "flex-end",
				}}>
				<VSCodeButton appearance="secondary" style={{ marginRight: "5px" }} onClick={resetToDefaults}>
					기본값으로 초기화
				</VSCodeButton>
				<VSCodeButton appearance="primary" style={{ marginRight: "5px" }} onClick={saveAllModeSettings}>
					모든 모드 설정 저장
				</VSCodeButton>
			</div>
		</Container>
	)
}

export default ModeSettingsView
