import {
	VSCodeButton,
	VSCodeCheckbox,
	VSCodeDivider, // Import VSCodeDivider
	VSCodeLink,
	// Re-import Panels components
	VSCodePanels,
	VSCodePanelTab,
	VSCodePanelView,
	VSCodeTextArea,
	VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react"
import { memo, useCallback, useEffect, useState } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { validateApiConfiguration, validateModelId } from "../../utils/validate"
import { vscode } from "../../utils/vscode"
import SettingsButton from "../common/SettingsButton"
import ApiOptions from "./ApiOptions"
import { TabButton } from "../mcp/McpView"
import { useEvent } from "react-use"
import styled from "styled-components" // Import styled-components
import { ExtensionMessage } from "../../../../src/shared/ExtensionMessage"
const { IS_DEV } = process.env

// Styled components for Mode Settings section (can be adjusted)
const SettingsSection = styled.div`
	margin-bottom: 20px;
	padding-bottom: 15px;
	border-bottom: 1px solid var(--vscode-settings-headerBorder);
	&:last-of-type {
		// Remove border from the last section
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}
`

const SectionTitle = styled.h4`
	margin-top: 0;
	margin-bottom: 10px;
	font-weight: 600; /* Slightly bolder title */
`

const OptionRow = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	gap: 8px; /* Add gap between label and control */
`

// 프로필 이미지 관련 스타일 컴포넌트는 아래에 이미 정의되어 있음

// Keep OptionLabel, but maybe don't use it when stacking

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
`

const ProfileImageWrapper = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 15px;
`

const ProfileImageActions = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`
const OptionLabel = styled.label`
	/* min-width: 150px; */ /* Remove fixed min-width for better stacking */
	display: block; /* Make label block for stacking */
	margin-bottom: 4px; /* Add some space below label when stacked */
`

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
		chatSettings,
		planActSeparateModelsSetting,
		setPlanActSeparateModelsSetting,
		// 프로필 이미지 관련 값
		alphaAvatarUri,
		selectAgentProfileImage,
		resetAgentProfileImage,
		updateAgentProfileImage,
	} = useExtensionState()
	
	// API 및 모델 관련 상태 관리
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [modelIdErrorMessage, setModelIdErrorMessage] = useState<string | undefined>(undefined)
	const [pendingTabChange, setPendingTabChange] = useState<"plan" | "act" | null>(null)
	// Re-introduce activeModeSettingTab state
	const [activeModeSettingTab, setActiveModeSettingTab] = useState("mode-1")

	const handleSubmit = (withoutDone: boolean = false) => {
		const apiValidationResult = validateApiConfiguration(apiConfiguration)
		const modelIdValidationResult = validateModelId(apiConfiguration, openRouterModels)

		// setApiErrorMessage(apiValidationResult) // Keep original comments
		// setModelIdErrorMessage(modelIdValidationResult) // Keep original comments

		let apiConfigurationToSubmit = apiConfiguration
		if (!apiValidationResult && !modelIdValidationResult) {
			// vscode.postMessage({ type: "apiConfiguration", apiConfiguration }) // Keep original comments
			// vscode.postMessage({ // Keep original comments
			// 	type: "customInstructions", // Keep original comments
			// 	text: customInstructions, // Keep original comments
			// }) // Keep original comments
			// vscode.postMessage({ // Keep original comments
			// 	type: "telemetrySetting", // Keep original comments
			// 	text: telemetrySetting, // Keep original comments
			// }) // Keep original comments
			// console.log("handleSubmit", withoutDone) // Keep original comments
			// vscode.postMessage({ // Keep original comments
			// 	type: "separateModeSetting", // Keep original comments
			// 	text: separateModeSetting, // Keep original comments
			// }) // Keep original comments
		} else {
			// if the api configuration is invalid, we don't save it
			apiConfigurationToSubmit = undefined
		}

		vscode.postMessage({
			type: "updateSettings",
			planActSeparateModelsSetting,
			customInstructionsSetting: customInstructions,
			telemetrySetting,
			apiConfiguration: apiConfigurationToSubmit,
			profileImage: alphaAvatarUri,
			// TODO: Add mode configurations to the message payload later
		})

		if (!withoutDone) {
			onDone()
		}
	}

	useEffect(() => {
		setApiErrorMessage(undefined)
		setModelIdErrorMessage(undefined)
	}, [apiConfiguration])

	// validate as soon as the component is mounted
	/* // Keep original multi-line comment
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
						vscode.postMessage({
							type: "togglePlanActMode",
							chatSettings: {
								mode: pendingTabChange,
							},
						})
						setPendingTabChange(null)
					}
					break
			}
		},
		[pendingTabChange],
	)

	useEvent("message", handleMessage)

	const handleResetState = () => {
		vscode.postMessage({ type: "resetState" })
	}

	const handleTabChange = (tab: "plan" | "act") => {
		if (tab === chatSettings.mode) {
			return
		}
		setPendingTabChange(tab)
		handleSubmit(true)
	}

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				padding: "10px 0px 0px 20px",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "13px",
					paddingRight: 17,
				}}>
				<h3 style={{ color: "var(--vscode-foreground)", margin: 0 }}>Settings</h3>
				<VSCodeButton onClick={() => handleSubmit(false)}>Done</VSCodeButton>
			</div>
			<div
				style={{
					flexGrow: 1,
					overflowY: "scroll",
					paddingRight: 8,
					display: "flex",
					flexDirection: "column",
				}}>
				{/* Plan/Act Mode API Options */}
				{planActSeparateModelsSetting ? (
					<SettingsSection>
						{" "}
						{/* Wrap in SettingsSection for consistent styling */}
						<div
							style={{
								display: "flex",
								gap: "1px",
								marginBottom: "10px",
								borderBottom: "1px solid var(--vscode-panel-border)",
							}}>
							<TabButton isActive={chatSettings.mode === "plan"} onClick={() => handleTabChange("plan")}>
								Plan Mode API
							</TabButton>
							<TabButton isActive={chatSettings.mode === "act"} onClick={() => handleTabChange("act")}>
								Act Mode API
							</TabButton>
						</div>
						<ApiOptions
							key={chatSettings.mode}
							showModelOptions={true}
							apiErrorMessage={apiErrorMessage}
							modelIdErrorMessage={modelIdErrorMessage}
						/>
					</SettingsSection>
				) : (
					<SettingsSection>
						{" "}
						{/* Wrap in SettingsSection */}
						<ApiOptions
							key={"single"}
							showModelOptions={true}
							apiErrorMessage={apiErrorMessage}
							modelIdErrorMessage={modelIdErrorMessage}
						/>
					</SettingsSection>
				)}

				{/* Custom Instructions */}
				<SettingsSection>
					<VSCodeTextArea
						value={customInstructions ?? ""}
						style={{ width: "100%" }}
						resize="vertical"
						rows={4}
						placeholder={'e.g. "Run unit tests at the end", "Use TypeScript with async/await", "Speak in Spanish"'}
						onInput={(e: any) => setCustomInstructions(e.target?.value ?? "")}>
						<span style={{ fontWeight: "500" }}>Custom Instructions</span>
					</VSCodeTextArea>
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						These instructions are added to the end of the system prompt sent with every request.
					</p>
				</SettingsSection>

				{/* Separate Models Checkbox */}
				<SettingsSection>
					<VSCodeCheckbox
						style={{ marginBottom: "5px" }}
						checked={planActSeparateModelsSetting}
						onChange={(e: any) => {
							const checked = e.target.checked === true
							setPlanActSeparateModelsSetting(checked)
						}}>
						Use different models for Plan and Act modes
					</VSCodeCheckbox>
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						Switching between Plan and Act mode will persist the API and model used in the previous mode. This may be
						helpful e.g. when using a strong reasoning model to architect a plan for a cheaper coding model to act on.
					</p>
				</SettingsSection>

				{/* AI 에이전트 프로필 이미지 설정 */}
				<SettingsSection>
					<SectionTitle>알파 프로필 이미지</SectionTitle>
					<ProfileImageWrapper>
						<ProfileImagePreview>
							<img 
								src={alphaAvatarUri} 
								alt="Alpha Profile" 
								style={{ width: "100%", height: "100%", objectFit: "cover" }} 
							/>
						</ProfileImagePreview>
						<ProfileImageActions>
							<VSCodeButton 
								appearance="secondary"
								onClick={selectAgentProfileImage}
							>
								이미지 파일 선택
							</VSCodeButton>
							<VSCodeButton 
								appearance="secondary"
								onClick={() => {
									// 이미지 URL 입력 팝업
									const url = prompt("이미지 URL을 입력하세요", alphaAvatarUri);
									if (url && url.trim() !== "") {
										updateAgentProfileImage(url);
									}
								}}
							>
								이미지 URL 입력
							</VSCodeButton>
							<VSCodeButton 
								appearance="secondary"
								onClick={resetAgentProfileImage}
							>
								기본 이미지로 재설정
							</VSCodeButton>
						</ProfileImageActions>
					</ProfileImageWrapper>
					<p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)" }}>
						알파의 프로필 이미지를 원하는 이미지로 변경할 수 있어요. 직사각형 이미지는 자동으로 정사각형으로 크롭됩니다.
					</p>
				</SettingsSection>

				{/* Telemetry Checkbox */}
				<SettingsSection>
					<VSCodeCheckbox
						style={{ marginBottom: "5px" }}
						checked={telemetrySetting === "enabled"}
						onChange={(e: any) => {
							const checked = e.target.checked === true
							setTelemetrySetting(checked ? "enabled" : "disabled")
						}}>
						Allow anonymous error and usage reporting
					</VSCodeCheckbox>
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						Help improve Cline by sending anonymous usage data and error reports. No code, prompts, or personal
						information are ever sent. See our{" "}
						<VSCodeLink href="https://docs.cline.bot/more-info/telemetry" style={{ fontSize: "inherit" }}>
							telemetry overview
						</VSCodeLink>{" "}
						and{" "}
						<VSCodeLink href="https://cline.bot/privacy" style={{ fontSize: "inherit" }}>
							privacy policy
						</VSCodeLink>{" "}
						for more details.
					</p>
				</SettingsSection>

				{/* === Mode Configuration Section with Tabs === */}
				<SettingsSection>
					<SectionTitle>Mode Configuration</SectionTitle>
					{/* Use VSCodePanels for tabs */}
					<VSCodePanels
						activeid={activeModeSettingTab}
						onChange={(e: any) => setActiveModeSettingTab(e.target.activeid)}>
						{/* Generate tabs dynamically */}
						{["mode-1", "mode-2", "mode-3", "mode-4", "mode-5"].map((modeId, index) => (
							<VSCodePanelTab key={modeId} id={modeId}>{`Mode ${index + 1}`}</VSCodePanelTab>
						))}

						{/* Generate panel views dynamically */}
						{["mode-1", "mode-2", "mode-3", "mode-4", "mode-5"].map((modeId, index) => (
							// Use VSCodePanelView for each tab's content
							<VSCodePanelView
								key={`view-${modeId}`}
								id={`view-${modeId}`}
								// Add width: '100%' and ensure proper box-sizing if needed (though likely default)
								style={{ padding: "10px 0", width: "100%", boxSizing: "border-box" }}>
								<div style={{ width: "100%", display: "block", marginTop: "15px" }}>
									{" "}
									{/* New grouping div */}
									{/* Mode Name: Stack label and input vertically */}
									<div style={{ marginBottom: "15px", width: "100%", display: "block" }}>
										<OptionLabel htmlFor={`${modeId}-name`}>Mode Name:</OptionLabel>
										<VSCodeTextField
											id={`${modeId}-name`}
											placeholder={`Enter name for Mode ${index + 1}`}
											defaultValue={`Mode ${index + 1}`}
											style={{ width: "100%" }}
										/>
									</div>																		
									{/* Rule Configuration */}
									<SectionTitle style={{ fontSize: "var(--vscode-font-size)" }}>
										Rule Configuration{" "}
									</SectionTitle>
									<VSCodeTextArea
										id={`${modeId}-rules`}
										placeholder={`Enter specific rules for this mode (one per line) to override global/project settings...`}
										rows={6}
										style={{ width: "100%" }}
										resize="vertical"
									/>
								</div>
							</VSCodePanelView>
						))}
					</VSCodePanels>
				</SettingsSection>
				{/* ===================================== */}

				{/* Debug Section */}
				{IS_DEV && (
					<SettingsSection>
						<SectionTitle>Debug</SectionTitle>
						<VSCodeButton onClick={handleResetState} style={{ marginTop: "5px", width: "auto" }}>
							Reset State
						</VSCodeButton>
						<p
							style={{
								fontSize: "12px",
								marginTop: "5px",
								color: "var(--vscode-descriptionForeground)",
							}}>
							This will reset all global state and secret storage in the extension.
						</p>
					</SettingsSection>
				)}

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
						Advanced Settings
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
							If you have any questions or feedback, feel free to open an issue at{" "}
							<VSCodeLink href="https://github.com/cline/cline" style={{ display: "inline" }}>
								https://github.com/cline/cline
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
			</div>
		</div>
	)
}

export default memo(SettingsView)
