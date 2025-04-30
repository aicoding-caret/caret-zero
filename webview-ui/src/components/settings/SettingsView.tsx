import {
	VSCodeButton,
	VSCodeLink,
	// Unused toolkit components removed:
	// VSCodeCheckbox, VSCodeDivider, VSCodePanels, VSCodePanelTab, VSCodePanelView, VSCodeTextArea, VSCodeTextField
} from "@vscode/webview-ui-toolkit/react"
import { memo, useCallback, useEffect, useState } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { validateApiConfiguration, validateModelId } from "../../utils/validate"
import { vscode } from "../../utils/vscode"
import SettingsButton from "../common/SettingsButton"
// import ApiOptions from "./ApiOptions" // Keep if ApiOptions is added back later
// import { TabButton } from "../mcp/McpView" // Removed
import { useEvent } from "react-use" // Keep for now, might be needed by ModeSettingsView implicitly
import styled from "styled-components" // Keep for SettingsSection
import { ExtensionMessage, ModeInfo } from "../../../../src/shared/ExtensionMessage" // Keep for now
import ModeSettingsView from "./ModeSettingsView"
// Import the new section components
import ProfileImageSettings from "./settings_ui/ProfileImageSettings"
import CustomInstructionsSettings from "./settings_ui/CustomInstructionsSettings"
import PersonaSettingsView from "./PersonaSettingsView"
import TelemetrySettings from "./settings_ui/TelemetrySettings"
import StateResetSettings from "./settings_ui/StateResetSettings"

const { IS_DEV } = process.env

// Keep SettingsSection if ModeSettingsView needs it, otherwise remove
const SettingsSection = styled.div`
	margin-bottom: 20px;
	padding-bottom: 15px;
	border-bottom: 1px solid var(--vscode-settings-headerBorder);
	&:last-of-type {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}
`

// Unused styled components definitions removed.

type SettingsViewProps = {
	onDone: () => void
}

const SettingsView = ({ onDone }: SettingsViewProps) => {
	const {
		apiConfiguration,
		version,
		customInstructions,
		setCustomInstructions,
		openRouterModels,
		telemetrySetting,
		setTelemetrySetting,
		// chatSettings, // Removed (unused after removing legacy mode logic)
		planActSeparateModelsSetting,
		// setPlanActSeparateModelsSetting, // Removed (unused)
		// availableModes, // Removed (unused after removing legacy mode logic)
		// 프로필 이미지 관련 값 (still needed for props)
		alphaAvatarUri,
		alphaThinkingAvatarUri,
		// selectAgentProfileImage, // Handled locally
		// resetAgentProfileImage, // Handled locally
		// updateAgentProfileImage, // Handled locally
	} = useExtensionState()

	// API 및 모델 관련 상태 관리 (Keep for potential future use with ApiOptions)
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [modelIdErrorMessage, setModelIdErrorMessage] = useState<string | undefined>(undefined)
	// Legacy state removed: pendingTabChange, activeModeSettingTab

	// Local state for images to pass down (sync with context)
	const [defaultImage, setDefaultImage] = useState<string | undefined>(alphaAvatarUri)
	const [thinkingImage, setThinkingImage] = useState<string | undefined>(alphaThinkingAvatarUri)

	// Update local state when context values change
	useEffect(() => {
		setDefaultImage(alphaAvatarUri);
	}, [alphaAvatarUri]);

	useEffect(() => {
		setThinkingImage(alphaThinkingAvatarUri);
	}, [alphaThinkingAvatarUri]);

	const handleSubmit = (withoutDone: boolean = false) => {
		// Validation logic can be kept if ApiOptions is used
		const apiValidationResult = validateApiConfiguration(apiConfiguration)
		const modelIdValidationResult = validateModelId(apiConfiguration, openRouterModels)

		let apiConfigurationToSubmit = apiConfiguration
		// Simplified validation check - only submit if valid
		if (apiValidationResult || modelIdValidationResult) {
			console.warn("Invalid API configuration, not saving.")
			setApiErrorMessage(apiValidationResult)
			setModelIdErrorMessage(modelIdValidationResult)
			apiConfigurationToSubmit = undefined;
			// Consider preventing onDone() if validation fails?
		} else {
			// Clear errors if valid
			setApiErrorMessage(undefined)
			setModelIdErrorMessage(undefined)
		}

		// Send general settings update
		// Image updates are handled by specific handlers in ProfileImageSettings via postMessage
		vscode.postMessage({
			type: "updateSettings",
			planActSeparateModelsSetting, // Keep if still relevant
			customInstructionsSetting: customInstructions,
			telemetrySetting,
			apiConfiguration: apiConfigurationToSubmit, // Submit potentially undefined if invalid
		})

		// Image updates are now handled via dedicated messages triggered by buttons

		if (!withoutDone) {
			onDone()
		}
	}

	// Clear API/Model errors when config changes
	useEffect(() => {
		setApiErrorMessage(undefined)
		setModelIdErrorMessage(undefined)
	}, [apiConfiguration])

	// Legacy message handler logic removed.

	// State Reset Handler
	const handleResetState = useCallback(() => {
		vscode.postMessage({ type: "resetState" })
	}, [])

	// Image Handlers (passed to ProfileImageSettings)
	const handleImageSelect = useCallback(() => {
		vscode.postMessage({
			type: "selectAgentProfileImage",
			imageType: "default"
		})
	}, [])

	const handleThinkingImageSelect = useCallback(() => {
		vscode.postMessage({
			type: "selectAgentProfileImage",
			imageType: "thinking"
		})
	}, [])

	const handleImageReset = useCallback(() => {
		vscode.postMessage({
			type: "resetAgentProfileImage",
			imageType: "default"
		})
	}, [])

	const handleThinkingImageReset = useCallback(() => {
		vscode.postMessage({
			type: "resetAgentProfileImage",
			imageType: "thinking"
		})
	}, [])

	// Legacy mode handlers removed.

	return (
		// Outermost container handles scrolling
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
				overflowY: "auto",
				overflowX: "hidden",
			}}>
			{/* Sticky Header */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "10px 20px",
					borderBottom: "1px solid var(--vscode-settings-sectionBorder)",
					position: "sticky",
					top: 0,
					zIndex: 100,
					background: "var(--vscode-editor-background)",
				}}>
				<h2 style={{ margin: "0" }}>설정</h2>
				{/* Pass only onDone to handleSubmit */}
				<VSCodeButton appearance="primary" onClick={() => handleSubmit(false)} style={{ margin: 0 }}>
					설정완료
				</VSCodeButton>
			</div>
			{/* Content container with padding */}
			<div style={{ padding: "20px" }}>
				{/* Persona 관리 섹션 (정책 안내 포함) */}
				<PersonaSettingsView />

				{/* Use the new components */}
				<ProfileImageSettings
					defaultImage={defaultImage}
					thinkingImage={thinkingImage}
					onSelectDefaultImage={handleImageSelect}
					onResetDefaultImage={handleImageReset}
					onSelectThinkingImage={handleThinkingImageSelect}
					onResetThinkingImage={handleThinkingImageReset}
				/>

				<CustomInstructionsSettings
					customInstructions={customInstructions ?? ""} // Provide empty string if undefined
					setCustomInstructions={setCustomInstructions}
				/>

				{/* Keep ModeSettingsView section */}
				{/* Wrap ModeSettingsView in SettingsSection if it doesn't provide its own */}
				<SettingsSection>
					<ModeSettingsView onDone={() => {}} />
				</SettingsSection>

				<TelemetrySettings
					telemetrySetting={telemetrySetting}
					setTelemetrySetting={setTelemetrySetting} // Pass setter even if currently unused in component
				/>

				<StateResetSettings onResetState={handleResetState} />

				{/* TODO: Add ApiOptions back here if needed, passing necessary props */}
				{/* <ApiOptions ... /> */}
				{/* Display API/Model errors if they exist */}
				{apiErrorMessage && <p style={{ color: "var(--vscode-errorForeground)" }}>{apiErrorMessage}</p>}
				{modelIdErrorMessage && <p style={{ color: "var(--vscode-errorForeground)" }}>{modelIdErrorMessage}</p>}

				{/* Footer */}
				<div
					style={{
						marginTop: "auto", // Pushes footer to bottom
						paddingTop: "20px", // Add some space before the footer
						paddingRight: 8, // Keep existing padding
						display: "flex",
						flexDirection: "column", // Stack items vertically
						alignItems: "center", // Center items horizontally
						gap: "15px", // Space between button and text
					}}>
					<SettingsButton
						onClick={() => vscode.postMessage({ type: "openExtensionSettings" })}
						style={{
							margin: 0, // Remove default margins
						}}>
						<i className="codicon codicon-settings-gear" />
						고급 설정
					</SettingsButton>
					<div
						style={{
							textAlign: "center",
							color: "var(--vscode-descriptionForeground)",
							fontSize: "12px",
							lineHeight: "1.2",
							padding: "0 8px 15px 0", // Keep existing padding
						}}>
						<p
							style={{
								wordWrap: "break-word",
								margin: 0,
								padding: 0,
							}}>
							질문이나 피드백이 있으시면 언제든지 문의해 주세요{" "}
							<VSCodeLink href="https://github.com/fstory97/caret" style={{ display: "inline" }}>
								https://github.com/fstory97/caret
							</VSCodeLink>
						</p>
						<p
							style={{
								fontStyle: "italic",
								margin: "10px 0 0 0",
								padding: 0,
							}}>
							v{version}
						</p>
						</div>
					</div>
				</div> {/* Content container closing tag */}
		</div> // Outermost container closing tag
	)
}

export default memo(SettingsView)
