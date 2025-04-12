// @ts-nocheck /* VSCode UI Toolkit과 React 타입 문제 임시 해결 */
import React, { useState, useEffect } from "react"
import styled from "styled-components"
import {
	VSCodeButton,
	VSCodeTextArea,
	VSCodeTextField,
	VSCodeCheckbox,
	VSCodeDivider,
	VSCodePanels,
	VSCodePanelTab,
	VSCodePanelView,
} from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import { WebviewMessage } from "../../../../src/shared/WebviewMessage"

const Container = styled.div`
	padding: 15px;
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
`

// 기본 모드 설정 (availableModes가 없을 경우 폴백으로 사용)
const defaultModes = [
	{ id: "plan", label: "Plan", description: "Planning and discussion mode" },
	{ id: "do", label: "Do", description: "Task execution mode" },
	{ id: "rule", label: "Rule", description: "AI 시스템 규칙 최적화 및 프롬프트 엔지니어링 모드" },
	{ id: "talk", label: "Talk", description: "Casual conversation mode" },
	{ id: "empty", label: "Empty", description: "Empty mode with no specific behavior" },
]

const ModeSettingsView = ({ onDone }: { onDone: () => void }) => {
	// ExtensionState에서 설정 가져오기
	const { availableModes } = useExtensionState()
	
	// 실제 사용할 모드 목록
	const modes = availableModes.length > 0 
		? availableModes.map((mode: { id: string; label?: string; description?: string }) => ({ 
			id: mode.id, 
			label: mode.label || mode.id,
			description: mode.description || ""
		}))
		: defaultModes

	// Default to the first mode's tab
	const [activeTab, setActiveTab] = useState(modes[0]?.id || "plan")

	// State for managing mode settings
	const [modeSettings, setModeSettings] = useState<{[key: string]: {name: string, description: string, rules: string[]}}>({
		plan: {
			name: "Plan",
			description: "Planning and discussion mode",
			rules: [
				"Act as a project manager analyzing requirements and architecture.", 
				"Systematically decompose complex tasks into manageable components.",
				"Create detailed execution roadmaps with clear milestones."
			]
		},
		do: {
			name: "Do",
			description: "Task execution mode",
			rules: [
				"Act as a full-stack developer implementing solutions.", 
				"Execute planned actions with precision and efficiency.",
				"Test thoroughly and verify implementations work."
			]
		},
		rule: {
			name: "Rule",
			description: "AI 시스템 규칙 최적화 및 프롬프트 엔지니어링 모드",
			rules: [
				"Act as an AI prompt engineering specialist.",
				"Optimize action sequences for efficiency and logical flow.",
				"Monitor and minimize token costs in all interactions."
			]
		},
		talk: {
			name: "Talk",
			description: "Casual conversation mode",
			rules: [
				"Embody the warm, attentive presence of Alpha.",
				"Prioritize light-hearted, stress-relieving interaction.",
				"Use soft, playful language patterns."
			]
		},
		"mode-5": {
			name: "Custom Mode",
			description: "User-defined custom mode",
			rules: ["Define your custom behavior here"]
		}
	});

	// 초기 모드 설정 로드
	useEffect(() => {
		// 로그 추가
		console.log('화면 로드, 모드 설정 요청 준비...');
		
		// modes.json 파일 읽어오기
		const loadConfigMessage: WebviewMessage = { type: "loadModesConfig" };
		console.log('모드 설정 로드 메시지 전송:', loadConfigMessage);
		vscode.postMessage(loadConfigMessage);

		// 모드 설정 로드 응답 리스너 추가
		const handleMessage = (event: MessageEvent) => {
			const message = event.data;
			console.log('메시지 수신:', message.type, message);
			
			// modesConfigLoaded 메시지 처리
			if (message.type === "modesConfigLoaded" && message.text) {
				console.log('모드 설정 로드 응답 받음:', message.type);
				console.log('모드 데이터 내용:', message.text);
				try {
					const modesData = JSON.parse(message.text);
					console.log('모드 설정 로드 성공:', modesData);
					
					// 모드 설정 형식 변환
					if (modesData && modesData.modes && Array.isArray(modesData.modes)) {
						const loadedSettings: {[key: string]: {name: string, description: string, rules: string[]}} = {};
						
						// 각 모드 데이터 변환
						modesData.modes.forEach((mode: any) => {
							if (mode.id) {
								loadedSettings[mode.id] = {
									name: mode.name || mode.id,
									description: mode.description || "",
									rules: Array.isArray(mode.rules) ? mode.rules : []
								};
							}
						});
						
						// 설정 적용
						setModeSettings(loadedSettings);
					}
				} catch (error) {
					console.error('모드 설정 로드 오류:', error);
				}
			}
		};
		
		// 이벤트 리스너 추가
		window.addEventListener('message', handleMessage);
		
		// 제거 함수 반환
		return () => {
			window.removeEventListener('message', handleMessage);
		};
	}, []);

	// 전체 모드 설정 저장
	const saveAllModeSettings = () => {
		const modesConfig = {
			modes: Object.entries(modeSettings).map(entry => {
				const id = entry[0];
				const settings = entry[1] as {name: string, description: string, rules: string[]};
				return {
					id,
					name: settings.name,
					description: settings.description,
					rules: settings.rules
				};
			})
		};

		// 저장 로그 추가
		console.log('모드 설정 저장 시도 중...', modesConfig);

		// 모드 설정 저장 메시지 전송
		const saveMessage: WebviewMessage = {
			type: "saveModeSettings",
			text: JSON.stringify(modesConfig)
		};
		console.log('모드 설정 저장 메시지 전송:', saveMessage);
		vscode.postMessage(saveMessage);

		// 저장 완료 메시지 표시
		const infoMessage: WebviewMessage = {
			type: "showInformationMessage",
			text: "모드 설정이 저장되었습니다. Cline 재시작 후 적용됩니다."
		};
		vscode.postMessage(infoMessage);
	};

	// 기본값으로 초기화
	const resetToDefaults = () => {
		const resetMessage: WebviewMessage = {
			type: "resetModesToDefaults"
		};
		vscode.postMessage(resetMessage);
	};

	// Update a mode's settings
	const updateModeSettings = (modeId: string, field: string, value: any) => {
		setModeSettings((prev: {[key: string]: {name: string, description: string, rules: string[]}}) => ({
			...prev,
			[modeId]: {
				...prev[modeId],
				[field]: value
			}
		}));
	};

	// Function to render content for a given mode ID
	const renderTabContent = (modeId: string) => {
		const mode = modes.find((m: { id: string; label: string; description: string }) => m.id === modeId)
		const settings = modeSettings[modeId] || { name: mode?.label || "Unknown Mode", description: mode?.description || "", rules: [] }

		// Convert rules array to string for textarea
		const rulesText = settings.rules.join("\n");

		// Handle rules text change
		// VSCodeTextArea는 (e: Event) => unknown 타입을 기대함
		const handleRulesChange = (e: Event): unknown => {
			// 이벤트가 발생한 요소에서 value를 추출
			const textarea = (e.target as HTMLTextAreaElement);
			const newRules = (textarea?.value || "").split("\n").filter(rule => rule.trim() !== "");
			updateModeSettings(modeId, "rules", newRules);
			return;
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
							onChange={(e) => updateModeSettings(modeId, "name", (e.target as HTMLInputElement)?.value || "")}
						>
							모드 이름:
						</VSCodeTextField>
					</OptionRow>
					<OptionRow>
						<VSCodeTextField 
							placeholder="Enter Mode Description" 
							value={settings.description} 
							style={{ width: "100%" }}
							onChange={(e) => updateModeSettings(modeId, "description", (e.target as HTMLInputElement)?.value || "")}
						>
							모드 설명:
						</VSCodeTextField>
					</OptionRow>
				</Section>

				<VSCodeDivider></VSCodeDivider>

				<Section>
					<SectionTitle>모드별 규칙 설정</SectionTitle>
					<div>
						<label style={{ display: 'block', marginBottom: '5px' }}>모드별 규칙:</label>
						<textarea
							placeholder={`${settings.name} 모드에 대한 규칙을 한 줄에 하나씩 입력하세요...`}
							value={rulesText}
							rows={8}
							style={{ 
								width: "100%", 
								padding: "5px",
								border: "1px solid var(--vscode-focusBorder)",
								background: "var(--vscode-input-background)",
								color: "var(--vscode-input-foreground)"
							}}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
								const newRules = e.target.value.split("\n").filter((rule: string) => rule.trim() !== "");
								updateModeSettings(modeId, "rules", newRules);
							}}
						/>
					</div>
					<div style={{ fontSize: "12px", opacity: 0.7, marginTop: "5px" }}>
						각 줄은 하나의 규칙으로 처리됩니다. 빈 줄은 무시됩니다.
					</div>
				</Section>

				<VSCodeDivider></VSCodeDivider>


			</ContentArea>
		)
	}

	return (
		<Container>
			<Header>
				<Title>Mode Settings</Title>
				<VSCodeButton appearance="secondary" onClick={onDone}>
					Done
				</VSCodeButton>
			</Header>

			<VSCodePanels activeid={activeTab} onChange={(e: any) => setActiveTab(e.target.activeid)}>
				{/* Generate tabs dynamically */}
				{modes.map((mode: { id: string; label: string; description: string }) => (
					<VSCodePanelTab key={mode.id} id={mode.id}>
						{mode.label}
					</VSCodePanelTab>
				))}

				{/* Generate panel views dynamically */}
				{modes.map((mode: { id: string; label: string; description: string }) => (
					<VSCodePanelView key={`view-${mode.id}`} id={`view-${mode.id}`}>
						{renderTabContent(mode.id)}
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
