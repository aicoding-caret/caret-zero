import {
	VSCodeButton,
	VSCodeCheckbox,
	VSCodeDropdown,
	VSCodeLink,
	VSCodeOption,
	VSCodeTextArea,
} from "@vscode/webview-ui-toolkit/react"
import { memo, useCallback, useEffect, useState } from "react"
import { useEvent } from "react-use"
import styled from "styled-components"

import { useExtensionState } from "@/context/ExtensionStateContext"
import { validateApiConfiguration, validateModelId } from "@/utils/validate"
import { vscode } from "@/utils/vscode"
import { ExtensionMessage } from "@shared/ExtensionMessage"
import { StateServiceClient } from "@/services/grpc-client"
import { FEATURE_FLAGS } from "@shared/services/feature-flags/feature-flags"

import SettingsButton from "@/components/common/SettingsButton"
import ModeSettingsView from "./ModeSettingsView"
import PersonaSettingsView from "./PersonaSettingsView"
import ApiOptions from "./ApiOptions"
import ProfileImageSettings from "./settings_ui/ProfileImageSettings"
import CustomInstructionsSettings from "./settings_ui/CustomInstructionsSettings"
import TelemetrySettings from "./settings_ui/TelemetrySettings"
import StateResetSettings from "./settings_ui/StateResetSettings"
import PreferredLanguageSetting from "./PreferredLanguageSetting"
import FeatureSettingsSection from "./FeatureSettingsSection"
import BrowserSettingsSection from "./BrowserSettingsSection"
import TerminalSettingsSection from "./TerminalSettingsSection"
import { TabButton } from "../mcp/configuration/McpConfigurationView"
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
		// planActSeparateModelsSetting,
		// setPlanActSeparateModelsSetting, // Removed (unused)
		// availableModes, // Removed (unused after removing legacy mode logic)
		// 프로필 이미지 관련 값 (still needed for props)
		alphaAvatarUri,
		alphaThinkingAvatarUri,
		// selectAgentProfileImage, // Handled locally
		// resetAgentProfileImage, // Handled locally
		// updateAgentProfileImage, // Handled locally
		chatSettings,
		setChatSettings,
		planActSeparateModelsSetting,
		setPlanActSeparateModelsSetting,
		enableCheckpointsSetting,
		mcpMarketplaceEnabled,
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
			apiConfiguration: apiConfigurationToSubmit, // Submit potentially undefined if invalid
			enableCheckpointsSetting,
			mcpMarketplaceEnabled,
			apiConfiguration: apiConfigurationToSubmit,
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
		<div className="fixed top-0 left-0 right-0 bottom-0 pt-[10px] pr-0 pb-0 pl-5 flex flex-col overflow-hidden">
			<div className="flex justify-between items-center mb-[13px] pr-[17px]">
				<h3 className="text-[var(--vscode-foreground)] m-0">설정</h3>
				<VSCodeButton onClick={() => handleSubmit(false)}>설정완료</VSCodeButton>
			</div>
			<div className="grow overflow-y-scroll pr-2 flex flex-col">
				
				{/* Persona 설정 */}
				<PersonaSettingsView />

				{/* 프로필 이미지 설정 */}
				<ProfileImageSettings
					defaultImage={defaultImage}
					thinkingImage={thinkingImage}
					onSelectDefaultImage={handleImageSelect}
					onSelectThinkingImage={handleThinkingImageSelect}
				/>

				{/* 사용자 지침 */}
				<CustomInstructionsSettings
					customInstructions={customInstructions ?? ""}
					setCustomInstructions={setCustomInstructions}
				/>

				{/* API 설정 */}
				{planActSeparateModelsSetting ? (
					<div className="border border-solid border-[var(--vscode-panel-border)] rounded-md p-[10px] mb-5 bg-[var(--vscode-panel-background)]">
						<div className="flex gap-[1px] mb-[10px] -mt-2 border-0 border-b border-solid border-[var(--vscode-panel-border)]">
							<TabButton isActive={chatSettings.mode === "plan"} onClick={() => handleTabChange("plan")}>Plan Mode</TabButton>
							<TabButton isActive={chatSettings.mode === "act"} onClick={() => handleTabChange("act")}>Act Mode</TabButton>
						</div>
						<div className="-mb-3">
							<ApiOptions key={chatSettings.mode} showModelOptions={true} apiErrorMessage={apiErrorMessage} modelIdErrorMessage={modelIdErrorMessage} />
						</div>
					</div>
				) : (
					<ApiOptions key="single" showModelOptions={true} apiErrorMessage={apiErrorMessage} modelIdErrorMessage={modelIdErrorMessage} />
				)}

				{/* 언어 설정 */}
				{chatSettings && <PreferredLanguageSetting chatSettings={chatSettings} setChatSettings={setChatSettings} />}

				{/* 모드 설정 */}
				<SettingsSection>
					<ModeSettingsView onDone={() => {}} />
				</SettingsSection>

				{/* 텔레메트리 */}
				<TelemetrySettings telemetrySetting={telemetrySetting} setTelemetrySetting={setTelemetrySetting} />

				{/* 기능별 설정 */}
				<FeatureSettingsSection />
				<BrowserSettingsSection />
				<TerminalSettingsSection />

				{/* 상태 초기화 */}
				<StateResetSettings onResetState={handleResetState} />

				{/* 푸터 */}
				<div className="text-center text-[var(--vscode-descriptionForeground)] text-xs leading-[1.2] px-0 py-0 pr-2 pb-[15px] mt-auto">
					<p className="break-words m-0 p-0">
						질문이나 피드백이 있으시면{" "}
						<VSCodeLink href="https://github.com/fstory97/caret" className="inline">
							https://github.com/fstory97/caret
						</VSCodeLink>{" "}로 문의 주세요.
					</p>
					<p className="italic mt-[10px] mb-0 p-0">v{version}</p>
				</div>
			</div>
		</div>
	)
}

export default memo(SettingsView)
