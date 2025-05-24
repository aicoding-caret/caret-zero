import { useCallback, useEffect, useState } from "react"
import { useEvent } from "react-use"
import { ExtensionMessage } from "@shared/ExtensionMessage"
import ChatView from "./components/chat/ChatView"
import HistoryView from "./components/history/HistoryView"
import SettingsView from "./components/settings/SettingsView"
import WelcomeView from "./components/welcome/WelcomeView"
import AccountView from "./components/account/AccountView"
import { useExtensionState } from "./context/ExtensionStateContext"
import { vscode } from "./utils/vscode"
import McpView from "./components/mcp/McpView"
import VisionInferencePanel from "./components/VisionInferencePanel"
import { Providers } from "./Providers"
import { ExtensionStateContextProvider } from "./context/ExtensionStateContext"
import { FirebaseAuthProvider } from "./context/FirebaseAuthContext"


// [ALPHA] VSCode API 브릿지 전역 할당 (VSCode Webview 환경에서만 1회)
// const isVSCodeWebview = typeof window !== "undefined"
//   && typeof window.acquireVsCodeApi === "function"
//   && window.navigator.userAgent.includes("vscode");

// if (isVSCodeWebview && !window.vscode) {
//   window.vscode = window.acquireVsCodeApi();
// }

const AppContent = () => {
	const { didHydrateState, showWelcome, shouldShowAnnouncement, telemetrySetting, vscMachineId, alphaAvatarUri, alphaThinkingAvatarUri , showMcp, mcpTab} = useExtensionState()
	const [showSettings, setShowSettings] = useState(false)
	const hideSettings = useCallback(() => setShowSettings(false), [])
	const [showHistory, setShowHistory] = useState(false)
	const [showAccount, setShowAccount] = useState(false)
	const [showAnnouncement, setShowAnnouncement] = useState(false)
	const [showVision, setShowVision] = useState(false)
	
	// Handler to show the settings view
	const handleShowSettings = useCallback(() => {
		setShowSettings(true)
		setShowHistory(false)
		setShowMcp(false)
		setShowAccount(false)
	}, []) // Dependencies: none, as it only uses setters

	const handleShowVision = useCallback(() => {
		setShowVision(true)
		setShowSettings(false)
		setShowHistory(false)
		setShowMcp(false)
		setShowAccount(false)
	}, [])

	const { setShowMcp, setMcpTab } = useExtensionState()

	const closeMcpView = useCallback(() => {
		setShowMcp(false)
		setMcpTab(undefined)
	}, [setShowMcp, setMcpTab])

	const handleMessage = useCallback((e: MessageEvent) => {
		const message: ExtensionMessage = e.data
		switch (message.type) {
			case "action":
				switch (message.action!) {
					case "settingsButtonClicked":
						setShowSettings(true)
						// Use the new handler for settings button click action
						handleShowSettings()
						setShowHistory(false)
						closeMcpView()
						setShowAccount(false)
						break
					case "historyButtonClicked":
						setShowSettings(false)
						setShowHistory(true)
						setShowMcp(false)
						closeMcpView()
						setShowAccount(false)
						break
					case "mcpButtonClicked":
						setShowSettings(false)
						setShowHistory(false)
						if (message.tab) {
							setMcpTab(message.tab)
						}
						setShowMcp(true)
						setShowAccount(false)
						break
					case "accountButtonClicked":
						setShowSettings(false)
						setShowHistory(false)
						setShowMcp(false)
						closeMcpView()
						setShowAccount(true)
						break
					case "chatButtonClicked": // Brings back to chat view
						setShowSettings(false)
						setShowHistory(false)
						setShowMcp(false)
						closeMcpView()
						setShowAccount(false)
						break
				}
				break
		}
	}, [])

	useEvent("message", handleMessage)

	useEvent("caret-show-vision-panel", () => {
		setShowVision(true)
		setShowSettings(false)
		setShowHistory(false)
		setShowMcp(false)
		setShowAccount(false)
	})

	// 확장 상태 확인 로깅
	useEffect(() => {
		if (didHydrateState) {
			console.log("Extension state hydrated", { alphaAvatarUri });
			
			// 캐릭터 이미지 URL이 없으면 초기화
			if (!alphaAvatarUri) {
				vscode.postMessage({ 
					type: "updateAgentProfileImage", 
					text: "https://raw.githubusercontent.com/fstory97/caret-avatar/main/alpha-maid.png" 
				});
			}
			
			// 생각중 이미지 URL이 없으면 초기화
			if (!alphaThinkingAvatarUri) {
				vscode.postMessage({
					type: "updateAgentThinkingImage",
					text: "https://raw.githubusercontent.com/fstory97/caret-avatar/main/alpha-maid-thinking.png"
				});
			}
		}
	}, [didHydrateState, alphaAvatarUri, alphaThinkingAvatarUri]);

	useEffect(() => {
		if (shouldShowAnnouncement) {
			setShowAnnouncement(true)
			vscode.postMessage({ type: "didShowAnnouncement" })
		}
	}, [shouldShowAnnouncement])

	if (!didHydrateState) {
		return null
	}

	return (
		<>
			{showWelcome ? (
				<WelcomeView />
			) : (
				<>
					{showSettings && <SettingsView onDone={hideSettings} />}
					{showHistory && <HistoryView onDone={() => setShowHistory(false)} />}
					{showMcp && <McpView initialTab={mcpTab} onDone={closeMcpView} />}
					{showAccount && <AccountView onDone={() => setShowAccount(false)} />}
					{showVision && <VisionInferencePanel />}
					{/* Do not conditionally load ChatView, it's expensive and there's state we don't want to lose (user input, disableInput, askResponse promise, etc.) */}
					<ChatView
						showHistoryView={() => {
							setShowSettings(false)
							closeMcpView()
							setShowAccount(false)
							setShowHistory(true)
						}}
						onShowSettings={handleShowSettings} // Pass the handler down
						isHidden={showSettings || showHistory || showMcp || showAccount || showVision}
						showAnnouncement={showAnnouncement}
						hideAnnouncement={() => {
							setShowAnnouncement(false)
						}}
					/>
				</>
			)}
		</>
	)
}

// const App = () => {
// 	return (
// 		<Providers>
// 			<AppContent />
// 		</Providers>
// 	)
// }

const App = () => {
	return (
		<ExtensionStateContextProvider>
			<FirebaseAuthProvider>
				<AppContent />
			</FirebaseAuthProvider>
		</ExtensionStateContextProvider>
	)
}

export default App
