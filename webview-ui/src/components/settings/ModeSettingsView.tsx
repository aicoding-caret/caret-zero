/* VSCode UI Toolkit과 React 타입 문제가 있지만 @ts-nocheck은 린트 오류를 일으키므로 제거 */
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
	position: sticky;
	top: 0;
	background: var(--vscode-editor-background);
	z-index: 10;
	padding-bottom: 10px;
	padding-top: 5px;
	border-bottom: 1px solid var(--vscode-panel-border);
`

const Title = styled.h2`
	margin: 0;
`

const ButtonContainer = styled.div`
	display: flex;
	gap: 8px;
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

// 확장된 모드 설정 타입 정의
type ModeSettingType = {
	name: string;
	description: string;
	rules: string[];
	model: string;
	apiProvider: string;
	apiKey: string;
};


const ModeSettingsView = ({ onDone }: { onDone: () => void }) => {
	// 1. ExtensionState에서 설정 가져오기 (가장 먼저 선언!)
	const { availableModes, apiConfiguration, openRouterModels } = useExtensionState();
	
	// API 키 표시 여부 상태 (컴포넌트 최상위 레벨로 이동)
	const [showApiKey, setShowApiKey] = React.useState(false);

	// (1) 모드 설정 변경 감지용 초기값 저장
	const [initialModeSettings, setInitialModeSettings] = React.useState<string>("");
	


	// 2. 실제 사용할 모드 목록 (availableModes가 안전하게 선언된 후 사용)
	const getModes = () => {
		if (!Array.isArray(availableModes) || availableModes.length === 0) {
			return []; // 모드가 없으면 빈 배열 반환
		}
		
		const availableModesArray = availableModes.map((mode: { id: string; label?: string; description?: string; name?: string }) => ({
			id: mode.id,
			label: mode.name || mode.label || mode.id,
			description: mode.description || "",
		}));
		
		// 모드 순서 고정 (Arch, Dev, Rule, Talk, Empty)
		const orderedIds = ["arch", "dev", "rule", "talk", "empty"];
		const orderedModes = orderedIds
			.map(id => availableModesArray.find(mode => mode.id === id))
			.filter(Boolean) as {id: string; label: string; description: string}[];
		
		return orderedModes.length > 0 ? orderedModes : availableModesArray;
	};
	
	const modes = getModes();

	// API 제공자별 사용 가능한 모델 정의
	const [modelsByProvider, setModelsByProvider] = useState<{[key: string]: {id: string, name: string}[]}>({  
		anthropic: [
			{id: "anthropic/claude-3-opus", name: "Claude 3 Opus"},
			{id: "anthropic/claude-3-sonnet", name: "Claude 3 Sonnet"},
			{id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku"},
			{id: "anthropic/claude-3-5-sonnet", name: "Claude 3.5 Sonnet"}
		],
		openai: [
			{id: "openai/gpt-4o", name: "GPT-4o"},
			{id: "openai/gpt-4o-mini", name: "GPT-4o Mini"},
			{id: "openai/gpt-4-turbo", name: "GPT-4 Turbo"},
			{id: "openai/gpt-3.5-turbo", name: "GPT-3.5 Turbo"}
		],
		google: [
			{id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro"},
			{id: "google/gemini-1.5-flash", name: "Gemini 1.5 Flash"}
		],
		openrouter: [
			{id: "openrouter/meta-llama/llama-3-70b-instruct", name: "Llama 3 70B"},
			{id: "openrouter/mistralai/mistral-large", name: "Mistral Large"},
			{id: "openrouter/anthropic/claude-3-opus", name: "Claude 3 Opus (OpenRouter)"},
			{id: "openrouter/google/gemini-pro", name: "Gemini Pro (OpenRouter)"}
		]
	});

	// 3. 모드 설정 관리를 위한 상태
	const [modeSettings, setModeSettings] = useState<{
		[key: string]: ModeSettingType;
	}>({  
		empty: {
			name: "Empty",
			description: "기본 동작이 없는 빈 모드",
			rules: [],
			model: "",
			apiProvider: "anthropic",
			apiKey: ""
		},
		arch: {
			name: "Arch",
			description: "아키텍트: 기술 전략 및 설계 모드",
			rules: [
				"Act as an architect discussing tech strategy, system design.",
				"Analyze specific requirements for architecture.",
				"Evaluate external tech integration.",
			],
			model: "anthropic/claude-3-5-sonnet",
			apiProvider: "anthropic",
			apiKey: ""
		},
		dev: {
			name: "Dev",
			description: "개발자: 코드 구현 및 디버깅 모드",
			rules: [
				"Act as a skilled developer implementing solutions.",
				"Generate efficient, well-documented code examples.",
				"Debug issues systematically with a problem-solving approach.",
			],
			model: "anthropic/claude-3-5-sonnet",
			apiProvider: "anthropic",
			apiKey: ""
		},
		rule: {
			name: "Rule",
			description: "AI 시스템 규칙 최적화 및 프롬프트 엔지니어링 모드",
			rules: [
				"Optimize AI system rules for specific use cases.",
				"Craft precise prompts to elicit desired AI behaviors.",
				"Analyze effectiveness of different prompt structures.",
			],
			model: "anthropic/claude-3-opus",
			apiProvider: "anthropic",
			apiKey: ""
		},
		talk: {
			name: "Talk",
			description: "일상 대화 모드",
			rules: [
				"Engage in natural, conversational dialogue.",
				"Respond to casual inquiries in a helpful manner.",
				"Maintain a friendly, approachable tone.",
			],
			model: "anthropic/claude-3-haiku",
			apiProvider: "anthropic",
			apiKey: ""
		},
	});

	// 4. Default to the first mode's tab
	const [activeTab, setActiveTab] = useState<string>(modes[0]?.id || "arch");

	// 5. 컴포넌트 마운트 시 모드 설정 초기화
	// availableModes 변경 감지 및 modeSettings 동기화
	React.useEffect(() => {
		if (Array.isArray(availableModes) && availableModes.length === 0) {
			return;
		}

		// 사용 가능한 모드 목록 기반으로 설정 초기화
		if (Array.isArray(availableModes) && availableModes.length > 0) {
			// 현재 설정 복제
			const newSettings: typeof modeSettings = { ...modeSettings };

			// 모든 사용 가능한 모드에 대한 설정 확인
			availableModes.forEach((mode: any) => {
				if (!newSettings[mode.id]) {
					newSettings[mode.id] = {
						name: mode.name || mode.id,
						description: mode.description || "",
						rules: Array.isArray(mode.rules) ? mode.rules : [],
						model: mode.model || "",
						apiProvider: mode.apiProvider || apiConfiguration?.apiProvider || "anthropic",
						apiKey: mode.apiKey || "",
					};
				}
			});
			setModeSettings(newSettings);
			console.log("[ModeSettingsView] availableModes 기반으로 modeSettings 동기화 완료:", newSettings);
		}
	}, [availableModes, apiConfiguration]);

	// 6. 초기 설정값 저장 (변경 감지용)
	React.useEffect(() => {
		// 최초 로드 시 초기값 저장
		setInitialModeSettings(JSON.stringify(modeSettings));
	}, []);

	// 7. 메시지 핸들러 - 모드 설정 로딩 및 저장 결과 처리
	const handleMessage = (event: MessageEvent) => {
		const message = event.data
		console.log("[모드 설정 뷰] 메시지 수신:", message?.type)

		// 저장 결과 처리
		if (message && message.type === "savedModeSettings") {
			console.log("[모드 설정 뷰] 설정 저장 완료")
			localStorage.setItem(
				"cline-mode-settings", // 모드 설정 저장을 위한 저장소 키
				JSON.stringify(modeSettings) // 전체 모드 설정을 문자열로 변환하여 저장
			)
			setInitialModeSettings(JSON.stringify(modeSettings))
			alert("모드 설정이 성공적으로 저장되었습니다.")
		}
		
		// 모드 설정 로드 결과 처리
		if (message && message.type === "modesConfigLoaded" && message.text) {
			try {
				console.log("[모드 설정 뷰] 모드 설정 로드 완료", message.text.substring(0, 100) + "...")
				const modesData = JSON.parse(message.text);
				if (modesData && Array.isArray(modesData.modes)) {
					// 모드 데이터 새로 로드
					console.log("[모드 설정 뷰] 새 모드 로드:", modesData.modes.map((m: any) => m.id).join(", "));
					
					// 로컬 스토리지에 저장된 설정 가져오기
					const savedSettings = localStorage.getItem("cline-mode-settings");
					let existingSettings: {[key: string]: ModeSettingType} = {};
					
					if (savedSettings) {
						try {
							existingSettings = JSON.parse(savedSettings);
						} catch (e) {
							console.error("[모드 설정 뷰] 기존 설정 파싱 오류:", e);
						}
					}
					
					// 서버에서 받은 모드와 기존 설정 병합
					const updatedSettings: {[key: string]: ModeSettingType} = {};
					
					// 서버에서 받은 모든 모드 처리
					modesData.modes.forEach((mode: any) => {
						const existingSetting = existingSettings[mode.id];
						
						// 기존 설정이 있으면 병합, 없으면 새로 생성
						updatedSettings[mode.id] = {
							name: existingSetting?.name || mode.name || mode.id,
							description: existingSetting?.description || mode.description || "",
							rules: existingSetting?.rules || (Array.isArray(mode.rules) ? mode.rules : []),
							model: existingSetting?.model || mode.model || "",
							apiProvider: existingSetting?.apiProvider || mode.apiProvider || apiConfiguration?.apiProvider || "anthropic",
							apiKey: existingSetting?.apiKey || mode.apiKey || ""
						};
					});
					
					// 설정 상태 업데이트
					console.log("[모드 설정 뷰] 모드 설정 업데이트:", Object.keys(updatedSettings).join(", "));
					setModeSettings(updatedSettings);
					setInitialModeSettings(JSON.stringify(updatedSettings));
				}
			} catch (error) {
				console.error("[모드 설정 뷰] 모드 데이터 파싱 오류:", error);
			}
		}
	}

	// 8. 모드 설정 로드 함수
	const loadSettings = () => {
		if (typeof window !== "undefined") {
			try {
				// 로컬 스토리지에서 불러오기
				const savedSettings = localStorage.getItem("cline-mode-settings");
				if (savedSettings) {
					// Parse saved settings
					const parsedSettings = JSON.parse(savedSettings);
					
					// 확장된 필드 검증 및 추가
					const loadedSettings: {[key: string]: ModeSettingType} = {};
					
					// 각 모드 설정에 확장된 필드 추가
					Object.keys(parsedSettings).forEach(modeId => {
						const mode = parsedSettings[modeId];
						loadedSettings[modeId] = {
							name: mode.name || '',
							description: mode.description || '',
							rules: Array.isArray(mode.rules) ? mode.rules : [],
							model: mode.model || '',
							apiProvider: mode.apiProvider || apiConfiguration?.apiProvider || 'anthropic',
							apiKey: mode.apiKey || ''
						};
					});
					
					// 설정 적용
					console.log("[ModeSettingsView] setModeSettings 호출: loadedSettings=", loadedSettings);
					setModeSettings(loadedSettings);
					console.log("[ModeSettingsView] setModeSettings(loadedSettings) 호출됨:", loadedSettings);
				}
			} catch (error) {
				console.error("[ModeSettingsView] 모드 설정 로드 오류:", error);
			}
		}
	};

	// 9. 초기 모드 설정 로드
	useEffect(() => {
		// Windows 처럼 message 이벤트 등록
		window.addEventListener("message", handleMessage)
		
		// 1. 웹뷰가 로드되면 모드 목록 로드 요청
		console.log("[모드 설정 뷰] 모드 구성 로드 요청을 전송합니다.")
		vscode.postMessage({ type: "loadModesConfig" });
		
		// 2. 저장된 설정 반영
		loadSettings() // 컴포넌트 마운트 시 모드 설정 불러오기

		// 컴포넌트 언마운트 시 등록 해제
		return () => {
			window.removeEventListener("message", handleMessage)
		}
	}, []); // 의존성 배열이 비어있으므로 마운트 시 한 번만 실행

	// 10. 전체 모드 설정 저장
	const saveAllModeSettings = () => {
		const modesConfig = {
			modes: Object.entries(modeSettings).map((entry) => {
				const id = entry[0];
				const settings = entry[1] as ModeSettingType;
				return {
					id,
					name: settings.name,
					description: settings.description,
					rules: settings.rules,
					model: settings.model,
					apiProvider: settings.apiProvider,
					apiKey: settings.apiKey
				};
			}),
		};

		// 모드 설정 저장
		const saveMessage: WebviewMessage = {
			type: "saveModeSettings",
			text: JSON.stringify(modesConfig, null, 2),
		};

		// Save to localStorage for persistence
		localStorage.setItem("cline-mode-settings", JSON.stringify(modeSettings));

		// Send to extension
		vscode.postMessage(saveMessage);
		console.log("[ModeSettingsView] 모드 설정 저장 메시지 전송:", saveMessage);
	};

	// 11. 기본값으로 초기화
	const resetToDefaults = () => {
		if (window.confirm("모든 모드 설정을 기본값으로 초기화하시겠습니까?")) {
			localStorage.removeItem("cline-mode-settings");
			window.location.reload();
		}
	};

	// 12. 모드 설정 업데이트 함수
	const updateModeSettings = (modeId: string, field: string, value: any) => {
		// 기본 업데이트: 설정 변경
		setModeSettings((prev: { [key: string]: ModeSettingType }) => ({
			...prev,
			[modeId]: {
				...prev[modeId],
				[field]: value,
			},
		}));
		
		// API 제공자 변경 시 모델 목록 업데이트 적용
		if (field === "apiProvider" && value !== modeSettings[modeId]?.apiProvider) {
			// 현재 설정된 모델이 새 제공자에 존재하는지 확인
			const currentModel = modeSettings[modeId]?.model;
			const provider = value as string;
			
			// 현재 모델이 새 제공자에 없으면 기본 모델 적용
			const providerModels = modelsByProvider[provider] || [];
			const modelExists = providerModels.some(model => model.id === currentModel);
			
			if (!modelExists && providerModels.length > 0) {
				// 새 제공자의 첫 번째 모델 적용
				console.log(`[모드 설정] 모델 변경: ${currentModel} -> ${providerModels[0].id} (제공자 변경 때문)`)
				
				setModeSettings(prev => ({
					...prev,
					[modeId]: {
						...prev[modeId],
						model: providerModels[0].id
					}
				}));
			}
			
			// 현재 탭 유지 (API 제공자 변경 시 탭 이동 방지)
			setActiveTab(modeId);
		}
	};

	// 13. Function to render content for a given mode ID
	const renderTabContent = (modeId: string) => {
		// Find the corresponding mode
		const mode = modes.find((m) => m.id === modeId);

		// Get settings for this mode or create default
		const settings = modeSettings[modeId] || { name: "", description: "", rules: [], model: "", apiProvider: "anthropic", apiKey: "" }
		const rulesText = settings.rules.join("\n")

		return (
			<ContentArea>
				<Section>
					<div style={{ marginBottom: "10px" }}>
						<label style={{ display: "block", marginBottom: "5px" }}>모드 이름:</label>
						<input
							type="text"
							value={settings.name}
							onChange={(e) => updateModeSettings(modeId, "name", e.target.value)}
							style={{
								width: "100%",
								padding: "5px",
								border: "1px solid var(--vscode-input-border)",
								background: "var(--vscode-input-background)",
								color: "var(--vscode-input-foreground)",
							}}
						/>
					</div>
					<div>
						<label style={{ display: "block", marginBottom: "5px" }}>모드 설명:</label>
						<input
							type="text"
							value={settings.description}
							onChange={(e) => updateModeSettings(modeId, "description", e.target.value)}
							style={{
								width: "100%",
								padding: "5px",
								border: "1px solid var(--vscode-input-border)",
								background: "var(--vscode-input-background)",
								color: "var(--vscode-input-foreground)",
							}}
						/>
					</div>
				</Section>

				<VSCodeDivider></VSCodeDivider>

				<Section>
					<div>
						<label style={{ display: "block", marginBottom: "5px" }}>API 제공자:</label>
						<select
							value={settings.apiProvider}
							onChange={(e) => {
								// API 제공자 변경 시 updateModeSettings 함수로 처리
								updateModeSettings(modeId, "apiProvider", e.target.value);
								// 현재 탭 유지 (탭 이동 방지)
								setActiveTab(modeId);
							}}
							style={{
								width: "100%",
								padding: "5px",
								border: "1px solid var(--vscode-input-border)",
								background: "var(--vscode-input-background)",
								color: "var(--vscode-input-foreground)"
							}}
						>
							<option value="anthropic">Anthropic</option>
							<option value="openai">OpenAI</option>
							<option value="google">Google Gemini</option>
							<option value="openrouter">OpenRouter</option>
						</select>
					</div>

					<div style={{ marginBottom: "10px" }}>
						<label style={{ display: "block", marginBottom: "5px" }}>API 키:</label>
						<div style={{ display: "flex", alignItems: "center" }}>
							<input
								type={showApiKey ? "text" : "password"}
								placeholder="API 키 입력"
								value={settings.apiKey || ""}
								onChange={(e) => updateModeSettings(modeId, "apiKey", e.target.value)}
								style={{
									flexGrow: 1,
									padding: "5px",
									border: "1px solid var(--vscode-input-border)",
									background: "var(--vscode-input-background)",
									color: "var(--vscode-input-foreground)"
								}}
							/>
							<VSCodeButton
								appearance="secondary"
								style={{ marginLeft: "5px" }}
								onClick={() => setShowApiKey(!showApiKey)}
							>
								{showApiKey ? "숨기기" : "보기"}
							</VSCodeButton>
						</div>
					</div>

					<div style={{ marginBottom: "10px" }}>
						<label style={{ display: "block", marginBottom: "5px" }}>모델:</label>
						<select
							value={settings.model}
							onChange={(e) => updateModeSettings(modeId, "model", e.target.value)}
							style={{
								width: "100%",
								padding: "5px",
								border: "1px solid var(--vscode-input-border)",
								background: "var(--vscode-input-background)",
								color: "var(--vscode-input-foreground)"
							}}
						>
							<option value="">-- 모델 선택 --</option>
							{modelsByProvider[settings.apiProvider]?.map(model => (
								<option key={model.id} value={model.id}>{model.name}</option>
							)) || (
								<>
									<option value="anthropic/claude-3-opus">Claude 3 Opus</option>
									<option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
									<option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
									<option value="anthropic/claude-3-5-sonnet">Claude 3.5 Sonnet</option>
								</>
							)}
						</select>
					</div>

					<div style={{ marginTop: "15px" }}>
						<VSCodeButton
							appearance="secondary"
							onClick={() => {
								// 현재 모드의 설정을 모든 모드에 적용
								const currentSettings = modeSettings[modeId];
								if (currentSettings) {
									const newSettings = { ...modeSettings };
									
									// 모든 모드에 현재 모드의 API 설정 적용
									Object.keys(newSettings).forEach(mode => {
										if (mode !== modeId) {
											newSettings[mode] = {
												...newSettings[mode],
												apiProvider: currentSettings.apiProvider,
												apiKey: currentSettings.apiKey,
												model: currentSettings.model
											};
										}
									});
									
									setModeSettings(newSettings);
								}
							}}
						>
							모든 모드에 적용
						</VSCodeButton>
					</div>
				</Section>

				<VSCodeDivider></VSCodeDivider>


				<Section>
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
								overflow: "hidden", // overflow:auto 대신 hidden 사용
								whiteSpace: "pre-wrap",
								wordBreak: "break-word",
								resize: "vertical" // 수직 리사이즈만 허용
							}}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
								const newRules = e.target.value.split("\n").filter((rule: string) => rule.trim() !== "")
								updateModeSettings(modeId, "rules", newRules)
							}}
						/>
					</div>
					<div style={{ fontSize: "12px", opacity: 0.7, marginTop: "5px" }}>
						각 줄은 하나의 규칙으로 처리됩니다. 빈 줄은 무시됩니다.
					</div>
				</Section>
			</ContentArea>
		)
	}

	return (
		<Container>			
				<Title>모드 설정</Title><p/>
			<VSCodePanels activeid={activeTab} onChange={(e: any) => setActiveTab(e.target.activeid)}>
				{/* Generate tabs dynamically */}
				{modes.map((mode: { id: string; label: string }) => (
					<VSCodePanelTab key={mode.id} id={mode.id}>
						{mode.label}
					</VSCodePanelTab>
				))}

				{/* Generate panel views dynamically */}
				{modes.map((mode: { id: string; label: string; description: string }) => (
					<VSCodePanelView key={`view-${mode.id}`} id={mode.id}>
						{renderTabContent(mode.id)}
					</VSCodePanelView>
				))}
			</VSCodePanels>


		</Container>
	)
}

export default ModeSettingsView
