import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useFirebaseAuth } from "../../context/FirebaseAuthContext"
import { vscode } from "../../utils/vscode"
import { useExtensionState } from "../../context/ExtensionStateContext"
import styled from "styled-components"

const Card = styled.div`
	padding: 8px;
	background-color: var(--vscode-editor-background);
	border: 1px solid var(--vscode-panel-border);
	border-radius: 4px;
`

const Title = styled.h3`
	margin: 0;
	font-size: 14px;
	font-weight: 500;
`

const Description = styled.p`
	margin: 8px 0;
	font-size: 12px;
	color: var(--vscode-descriptionForeground);
`

export const CaretAccountInfoCard = () => {
	const { user: firebaseUser, handleSignOut } = useFirebaseAuth()
	const { userInfo, apiConfiguration } = useExtensionState()

	let user = apiConfiguration?.caretApiKey ? firebaseUser || userInfo : undefined

	const handleLogin = () => {
		vscode.postMessage({ type: "accountLoginClicked" })
	}

	const handleLogout = () => {
		// First notify extension to clear API keys and state
		vscode.postMessage({ type: "accountLogoutClicked" })
		// Then sign out of Firebase
		handleSignOut()
	}

	const handleShowAccount = () => {
		vscode.postMessage({ type: "showAccountViewClicked" })
	}

	return (
		<Card>
			<Title>Caret Account</Title>
			<Description>
				Caret is a powerful AI coding assistant that helps you write better code faster.{" "}
				<VSCodeLink href="https://caret.team" target="_blank">
					Learn more
				</VSCodeLink>
			</Description>
			{user ? (
				<VSCodeButton appearance="secondary" onClick={handleShowAccount}>
					View Billing & Usage
				</VSCodeButton>
			) : (
				<div>
					<VSCodeButton onClick={handleLogin} className="mt-0">
						Sign Up with Caret
					</VSCodeButton>
				</div>
			)}
		</Card>
	)
}
