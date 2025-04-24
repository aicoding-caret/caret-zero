import { VSCodeTextField, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { ApiConfiguration } from "../../../../../src/shared/api"

interface CaretOptionsProps {
	apiConfiguration?: ApiConfiguration
	setApiConfiguration: (config: ApiConfiguration) => void
}

export const CaretOptions = ({ apiConfiguration, setApiConfiguration }: CaretOptionsProps) => {
	const handleInputChange = (field: keyof ApiConfiguration) => (event: any) => {
		setApiConfiguration({
			...apiConfiguration,
			[field]: event.target.value,
		})
	}

	return (
		<div>
			<VSCodeTextField
				value={apiConfiguration?.caretApiKey || ""}
				style={{ width: "100%" }}
				type="password"
				onInput={handleInputChange("caretApiKey")}
				placeholder="Enter API Key...">
				<span style={{ fontWeight: 500 }}>Caret API Key</span>
			</VSCodeTextField>
			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				This key is stored locally and only used to make API requests from this extension.
				{!apiConfiguration?.caretApiKey && (
					<VSCodeLink href="https://caret.dev" style={{ display: "inline", fontSize: "inherit" }}>
						You can get a Caret API key by signing up here.
					</VSCodeLink>
				)}
			</p>
		</div>
	)
}
