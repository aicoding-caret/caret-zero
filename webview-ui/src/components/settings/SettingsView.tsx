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
import { ExtensionMessage, ModeInfo } from "../../../../src/shared/ExtensionMessage"
import ModeSettingsView from "./ModeSettingsView"
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

// 상단 고정 헤더 스타일 추가
const FixedHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: var(--vscode-editor-background);
	padding: 10px 15px;
	position: sticky;
	top: 0;
	z-index: 100;
	border-bottom: 1px solid var(--vscode-panel-border);
`

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
		availableModes, // availableModes 상태 추가
		// 프로필 이미지 관련 값
		alphaAvatarUri,
		alphaThinkingAvatarUri,
		selectAgentProfileImage,
		resetAgentProfileImage,
		updateAgentProfileImage,
	} = useExtensionState()

	// API 및 모델 관련 상태 관리
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [modelIdErrorMessage, setModelIdErrorMessage] = useState<string | undefined>(undefined)
	const [pendingTabChange, setPendingTabChange] = useState<string | null>(null)
	// Re-introduce activeModeSettingTab state
	const [activeModeSettingTab, setActiveModeSettingTab] = useState("mode-1")

	// 프로필 이미지 관련 상태 관리
	// 기본 프로필 이미지
	const [defaultImage, setDefaultImage] = useState<string | undefined>(alphaAvatarUri)
	// 생각 중 이미지 관련 상태 추가
	const [thinkingImage, setThinkingImage] = useState<string | undefined>(alphaThinkingAvatarUri)

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

		// 기본 이미지 전송
		vscode.postMessage({
			type: "updateSettings",
			planActSeparateModelsSetting,
			customInstructionsSetting: customInstructions,
			telemetrySetting,
			apiConfiguration: apiConfigurationToSubmit,
			profileImage: alphaAvatarUri,
			imageType: "default",
			// TODO: Add mode configurations to the message payload later
		})
		
		// 생각 중 이미지 전송
		vscode.postMessage({
			type: "updateAgentProfileImage",
			profileImage: alphaThinkingAvatarUri,
			imageType: "thinking",
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
							type: "toggleMode",
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

	// 기본 이미지 선택 버튼 클릭 함수
	const handleImageSelect = useCallback(() => {
		vscode.postMessage({ 
			type: "selectAgentProfileImage", 
			imageType: "default" 
		})
	}, [])

	// 생각 중 이미지 선택 버튼 클릭 함수
	const handleThinkingImageSelect = useCallback(() => {
		vscode.postMessage({ 
			type: "selectAgentProfileImage", 
			imageType: "thinking" 
		})
	}, [])

	// 이미지 초기화 버튼 클릭 함수
	const handleImageReset = useCallback(() => {
	vscode.postMessage({ 
			type: "resetAgentProfileImage", 
			imageType: "default" 
		})
	}, [])

	// 생각 중 이미지 초기화 버튼 클릭 함수
	const handleThinkingImageReset = useCallback(() => {
		vscode.postMessage({ 
			type: "resetAgentProfileImage", 
			imageType: "thinking" 
		})
	}, [])

	// 모드타입에 따라 탭 변경 처리
	const handleTabChange = (modeType: "plan" | "act") => {
		// 현재 활성화된 모드의 타입 확인
		const currentModeType = getCurrentModeType()

		// 이미 같은 타입의 모드면 변경 불필요
		if (modeType === currentModeType) {
			return
		}

		// 해당 타입의 첫 번째 모드 찾기
		const targetMode = availableModes?.find((mode: ModeInfo) => mode.modetype === modeType)

		// 대상 모드가 없으면 처리 중단
		if (!targetMode) {
			console.warn(`${modeType} 타입의 모드를 찾을 수 없습니다.`)
			return
		}

		// 모드 전환 요청
		setPendingTabChange(targetMode.id)
		handleSubmit(true)
	}

	// 현재 활성화된 모드의 타입 반환
	const getCurrentModeType = (): "plan" | "act" => {
		// 현재 모드 정보 찾기
		const currentMode = availableModes?.find((mode: ModeInfo) => mode.id === chatSettings.mode)

		// 현재 모드가 plan 타입이면 plan, 그렇지 않으면 act 반환
		return currentMode?.modetype === "plan" ? "plan" : "act"
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
				overflow: "hidden",
			}}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					paddingLeft: "20px",
					paddingRight: "20px",
					borderBottom: "1px solid var(--vscode-settings-sectionBorder)",
					position: "sticky",
					top: 0,
					zIndex: 100,
					background: "var(--vscode-editor-background)",
				}}>
				<h2 style={{ margin: "10px 0" }}>설정</h2>
				<VSCodeButton appearance="primary" onClick={() => handleSubmit()} style={{ margin: 0 }}>
					설정완료
				</VSCodeButton>
			</div>
			<div
				style={{
					height: "calc(100% - 56px)", // Adjust for header height
					overflowY: "auto",
					overflowX: "hidden",
					padding: "20px",
				}}>
				{/* AI 에이전트 프로필 이미지 */}
				<SettingsSection>
					<SectionTitle>AI 에이전트 프로필 이미지 설정</SectionTitle>
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						{/* 기본 이미지 설정 */}
						<div style={{ flex: 1, marginRight: "15px" }}>
							<div style={{ marginBottom: "5px", fontWeight: "500" }}>기본 이미지</div>
							<ProfileImageWrapper>
								<ProfileImagePreview>
									{defaultImage ? (
										<img
											src={defaultImage}
											alt="AI 에이전트 프로필"
											style={{ width: "100%", height: "100%", objectFit: "cover" }}
										/>
									) : (
										<div
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												color: "var(--vscode-descriptionForeground)",
												width: "100%",
												height: "100%",
											}}>
											<i className="codicon codicon-account" style={{ fontSize: "32px" }} />
										</div>
									)}
								</ProfileImagePreview>
								<ProfileImageActions>
									<VSCodeButton onClick={handleImageSelect}>이미지 선택</VSCodeButton>
									<VSCodeButton onClick={handleImageReset}>기본으로 초기화</VSCodeButton>
								</ProfileImageActions>
							</ProfileImageWrapper>
						</div>

						{/* 생각 중 이미지 설정 */}
						<div style={{ flex: 1 }}>
							<div style={{ marginBottom: "5px", fontWeight: "500" }}>생각 중 이미지</div>
							<ProfileImageWrapper>
								<ProfileImagePreview>
									{thinkingImage ? (
										<img
											src={thinkingImage}
											alt="AI 에이전트 생각 중"
											style={{ width: "100%", height: "100%", objectFit: "cover" }}
										/>
									) : (
										<div
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												color: "var(--vscode-descriptionForeground)",
												width: "100%",
												height: "100%",
											}}>
											<i className="codicon codicon-loading" style={{ fontSize: "32px" }} />
										</div>
									)}
								</ProfileImagePreview>
								<ProfileImageActions>
									<VSCodeButton onClick={handleThinkingImageSelect}>이미지 선택</VSCodeButton>
									<VSCodeButton onClick={handleThinkingImageReset}>기본으로 초기화</VSCodeButton>
								</ProfileImageActions>
							</ProfileImageWrapper>
						</div>
					</div>
					<p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)", marginTop: "10px" }}>
						AI 에이전트의 프로필 이미지를 설정합니다. 기본 이미지는 일반 대화에서, 생각 중 이미지는 AI가 응답을 생성할 때 표시됩니다.
					</p>
				</SettingsSection>

				{/* 사용자 기본 규칙 */}
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

				<SettingsSection>
					<ModeSettingsView onDone={() => {}} />
				</SettingsSection>

				{/* 익명 오류 및 사용량 보고 */}
				<SettingsSection>
					<VSCodeCheckbox
						style={{ marginBottom: "5px" }}
						checked={false}
						disabled={true}
						onChange={(e: any) => {
							// 현재 비활성화함
							setTelemetrySetting("disabled")
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

				{/* 상태 초기화 */}
				<SettingsSection>					
					<VSCodeButton onClick={handleResetState} style={{ marginTop: "5px", width: "auto" }}>
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
							<VSCodeLink href="https://github.com/fstory97/cline" style={{ display: "inline" }}>
								https://github.com/fstory97/cline
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
