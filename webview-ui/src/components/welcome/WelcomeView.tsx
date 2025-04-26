import { VSCodeButton, VSCodeDivider, VSCodeLink, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useCallback, useEffect, useState } from "react"
import { useEvent } from "react-use"
import { ExtensionMessage } from "../../../../src/shared/ExtensionMessage"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { validateApiConfiguration } from "../../utils/validate"
import { vscode } from "../../utils/vscode"
import ApiOptions from "../settings/ApiOptions"

const WelcomeView = () => {
	const { apiConfiguration, caretBanner } = useExtensionState()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [showApiOptions, setShowApiOptions] = useState(false)

	const disableLetsGoButton = apiErrorMessage != null

	const handleLogin = () => {
		vscode.postMessage({ type: "accountLoginClicked" })
	}

	const handleSubmit = () => {
		vscode.postMessage({ type: "apiConfiguration", apiConfiguration })
	}

	useEffect(() => {
		setApiErrorMessage(validateApiConfiguration(apiConfiguration))
	}, [apiConfiguration])

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				padding: "0 0px",
				display: "flex",
				flexDirection: "column",
			}}>
			<div
				style={{
					height: "100%",
					padding: "0 20px",
					overflow: "auto",
				}}>
				<center>
					<h2>안녕하세요. 당신의 SW개발을 돕는 AI파트너 Caret입니다</h2>
					<div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
						<img src={caretBanner} alt="Caret Banner" />
					</div>
				</center>
				<p>
					<VSCodeLink href="https://www.anthropic.com/claude/sonnet" style={{ display: "inline" }}>
						Claude 3.7 Sonnet
					</VSCodeLink>
					의 에이전트 코딩 능력과 파일 생성/수정, 복잡한 프로젝트 탐색, 브라우저 사용, 터미널 명령 실행
					<i>(물론 마스터의 허락이 필요해요)</i>과 같은 도구들을 사용할 수 있어요. MCP를 사용하여 새로운 도구를 만들고
					제 능력을 확장할 수도 있답니다.
				</p>

				<p style={{ color: "var(--vscode-descriptionForeground)" }}>
					무료로 시작하려면 계정을 만들거나, Claude 3.7 Sonnet과 같은 모델에 접근할 수 있는 API 키를 사용하세요.
				</p>

				<VSCodeButton appearance="primary" onClick={handleLogin} style={{ width: "100%", marginTop: 4 }}>
					무료로 시작하기
				</VSCodeButton>

				{!showApiOptions && (
					<VSCodeButton
						appearance="secondary"
						onClick={() => setShowApiOptions(true)}
						style={{ marginTop: 10, width: "100%" }}>
						자신의 API 키 사용하기
					</VSCodeButton>
				)}

				<div style={{ marginTop: "18px" }}>
					{showApiOptions && (
						<div>
							<ApiOptions showModelOptions={false} />
							<VSCodeButton onClick={handleSubmit} disabled={disableLetsGoButton} style={{ marginTop: "3px" }}>
								시작하기!
							</VSCodeButton>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default WelcomeView
