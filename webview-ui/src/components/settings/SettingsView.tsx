import {
	VSCodeButton,
<<<<<<< HEAD
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

=======
	VSCodeCheckbox,
	VSCodeDropdown,
	VSCodeLink,
	VSCodeOption,
	VSCodeTextArea,
} from "@vscode/webview-ui-toolkit/react"
import { memo, useCallback, useEffect, useState } from "react"
import PreferredLanguageSetting from "./PreferredLanguageSetting" // Added import
import { OpenAIReasoningEffort } from "@shared/ChatSettings"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { validateApiConfiguration, validateModelId } from "@/utils/validate"
import { vscode } from "@/utils/vscode"
import SettingsButton from "@/components/common/SettingsButton"
import ApiOptions from "./ApiOptions"
import { TabButton } from "../mcp/configuration/McpConfigurationView"
import { useEvent } from "react-use"
import { ExtensionMessage } from "@shared/ExtensionMessage"
import { StateServiceClient } from "@/services/grpc-client"
import FeatureSettingsSection from "./FeatureSettingsSection"
import BrowserSettingsSection from "./BrowserSettingsSection"
import TerminalSettingsSection from "./TerminalSettingsSection"
import { FEATURE_FLAGS } from "@shared/services/feature-flags/feature-flags"
>>>>>>> upstream/main
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
<<<<<<< HEAD
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
=======
		chatSettings,
		setChatSettings,
		planActSeparateModelsSetting,
		setPlanActSeparateModelsSetting,
		enableCheckpointsSetting,
		mcpMarketplaceEnabled,
>>>>>>> upstream/main
	} = useExtensionState()

	// API 및 모델 관련 상태 관리 (Keep for potential future use with ApiOptions)
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [modelIdErrorMessage, setModelIdErrorMessage] = useState<string | undefined>(undefined)
	// Legacy state removed: pendingTabChange, activeModeSettingTab

	// Local state for images to pass down (sync with context)
	const [defaultImage, setDefaultImage] = useState<string | undefined>(alphaAvatarUri)
	const [thinkingImage, setThinkingImage] = useState<string | undefined>(alphaThinkingAvatarUri)
	const [defaultImageError, setDefaultImageError] = useState(false)
	const [thinkingImageError, setThinkingImageError] = useState(false)

	// Update local state when context values change
	useEffect(() => {
		setDefaultImage(alphaAvatarUri);
	}, [alphaAvatarUri]);

	useEffect(() => {
		setThinkingImage(alphaThinkingAvatarUri);
	}, [alphaThinkingAvatarUri]);

	// 이미지 변경 시 즉시 로딩 에러 상태 초기화
	useEffect(() => {
		setDefaultImageError(false)
	}, [defaultImage])
	useEffect(() => {
		setThinkingImageError(false)
	}, [thinkingImage])

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
<<<<<<< HEAD
			apiConfiguration: apiConfigurationToSubmit, // Submit potentially undefined if invalid
=======
			enableCheckpointsSetting,
			mcpMarketplaceEnabled,
			apiConfiguration: apiConfigurationToSubmit,
>>>>>>> upstream/main
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

<<<<<<< HEAD
	// Legacy message handler logic removed.

	// State Reset Handler
	const handleResetState = useCallback(() => {
		vscode.postMessage({ type: "resetState" })
	}, [])
=======
	// validate as soon as the component is mounted
	/*
	useEffect will use stale values of variables if they are not included in the dependency array. 
	so trying to use useEffect with a dependency array of only one value for example will use any 
	other variables' old values. In most cases you don't want this, and should opt to use react-use 
	hooks.
    
		// uses someVar and anotherVar
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [someVar])
	If we only want to run code once on mount we can use react-use's useEffectOnce or useMount
	*/

	const handleMessage = useCallback(
		(event: MessageEvent) => {
			const message: ExtensionMessage = event.data
			switch (message.type) {
				case "didUpdateSettings":
					if (pendingTabChange) {
						StateServiceClient.togglePlanActMode({
							chatSettings: {
								mode: pendingTabChange,
							},
						})
						setPendingTabChange(null)
					}
					break
				case "scrollToSettings":
					setTimeout(() => {
						const elementId = message.text
						if (elementId) {
							const element = document.getElementById(elementId)
							if (element) {
								element.scrollIntoView({ behavior: "smooth" })

								element.style.transition = "background-color 0.5s ease"
								element.style.backgroundColor = "var(--vscode-textPreformat-background)"

								setTimeout(() => {
									element.style.backgroundColor = "transparent"
								}, 1200)
							}
						}
					}, 300)
					break
			}
		},
		[pendingTabChange],
	)

	useEvent("message", handleMessage)

	const handleResetState = async () => {
		try {
			await StateServiceClient.resetState({})
		} catch (error) {
			console.error("Failed to reset state:", error)
		}
	}
>>>>>>> upstream/main

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
<<<<<<< HEAD
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
					onSelectThinkingImage={handleThinkingImageSelect}
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
=======
		<div className="fixed top-0 left-0 right-0 bottom-0 pt-[10px] pr-0 pb-0 pl-5 flex flex-col overflow-hidden">
			<div className="flex justify-between items-center mb-[13px] pr-[17px]">
				<h3 className="text-[var(--vscode-foreground)] m-0">Settings</h3>
				<VSCodeButton onClick={() => handleSubmit(false)}>Save</VSCodeButton>
			</div>
			<div className="grow overflow-y-scroll pr-2 flex flex-col">
				{/* Tabs container */}
				{planActSeparateModelsSetting ? (
					<div className="border border-solid border-[var(--vscode-panel-border)] rounded-md p-[10px] mb-5 bg-[var(--vscode-panel-background)]">
						<div className="flex gap-[1px] mb-[10px] -mt-2 border-0 border-b border-solid border-[var(--vscode-panel-border)]">
							<TabButton isActive={chatSettings.mode === "plan"} onClick={() => handleTabChange("plan")}>
								Plan Mode
							</TabButton>
							<TabButton isActive={chatSettings.mode === "act"} onClick={() => handleTabChange("act")}>
								Act Mode
							</TabButton>
						</div>

						{/* Content container */}
						<div className="-mb-3">
							<ApiOptions
								key={chatSettings.mode}
								showModelOptions={true}
								apiErrorMessage={apiErrorMessage}
								modelIdErrorMessage={modelIdErrorMessage}
							/>
						</div>
					</div>
				) : (
					<ApiOptions
						key={"single"}
						showModelOptions={true}
						apiErrorMessage={apiErrorMessage}
						modelIdErrorMessage={modelIdErrorMessage}
					/>
				)}

				<div className="mb-[5px]">
					<VSCodeTextArea
						value={customInstructions ?? ""}
						className="w-full"
						resize="vertical"
						rows={4}
						placeholder={'e.g. "Run unit tests at the end", "Use TypeScript with async/await", "Speak in Spanish"'}
						onInput={(e: any) => setCustomInstructions(e.target?.value ?? "")}>
						<span className="font-medium">Custom Instructions</span>
					</VSCodeTextArea>
					<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
						These instructions are added to the end of the system prompt sent with every request.
					</p>
				</div>

				{chatSettings && <PreferredLanguageSetting chatSettings={chatSettings} setChatSettings={setChatSettings} />}

				<div className="mb-[5px]">
					<VSCodeCheckbox
						className="mb-[5px]"
						checked={planActSeparateModelsSetting}
						onChange={(e: any) => {
							const checked = e.target.checked === true
							setPlanActSeparateModelsSetting(checked)
						}}>
						Use different models for Plan and Act modes
					</VSCodeCheckbox>
					<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
						Switching between Plan and Act mode will persist the API and model used in the previous mode. This may be
						helpful e.g. when using a strong reasoning model to architect a plan for a cheaper coding model to act on.
					</p>
				</div>

				<div className="mb-[5px]">
					<VSCodeCheckbox
						className="mb-[5px]"
						checked={telemetrySetting === "enabled"}
						onChange={(e: any) => {
							const checked = e.target.checked === true
							setTelemetrySetting(checked ? "enabled" : "disabled")
						}}>
						Allow anonymous error and usage reporting
					</VSCodeCheckbox>
					<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
						Help improve Cline by sending anonymous usage data and error reports. No code, prompts, or personal
						information are ever sent. See our{" "}
						<VSCodeLink href="https://docs.cline.bot/more-info/telemetry" className="text-inherit">
							telemetry overview
						</VSCodeLink>{" "}
						and{" "}
						<VSCodeLink href="https://cline.bot/privacy" className="text-inherit">
							privacy policy
						</VSCodeLink>{" "}
						for more details.
					</p>
				</div>

				{/* Feature Settings Section */}
				<FeatureSettingsSection />

				{/* Browser Settings Section */}
				<BrowserSettingsSection />

				{/* Terminal Settings Section */}
				<TerminalSettingsSection />

				{IS_DEV && (
					<>
						<div className="mt-[10px] mb-1">Debug</div>
						<VSCodeButton
							onClick={handleResetState}
							className="mt-[5px] w-auto"
							style={{ backgroundColor: "var(--vscode-errorForeground)", color: "black" }}>
							Reset State
						</VSCodeButton>
						<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
							This will reset all global state and secret storage in the extension.
						</p>
					</>
				)}

				<div className="text-center text-[var(--vscode-descriptionForeground)] text-xs leading-[1.2] px-0 py-0 pr-2 pb-[15px] mt-auto">
					<p className="break-words m-0 p-0">
						If you have any questions or feedback, feel free to open an issue at{" "}
						<VSCodeLink href="https://github.com/cline/cline" className="inline">
							https://github.com/cline/cline
						</VSCodeLink>
					</p>
					<p className="italic mt-[10px] mb-0 p-0">v{version}</p>
				</div>
			</div>
		</div>
>>>>>>> upstream/main
	)
}

export default memo(SettingsView)
