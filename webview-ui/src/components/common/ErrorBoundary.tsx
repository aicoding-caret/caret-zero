import React, { Component, ErrorInfo, ReactNode } from "react"

interface Props {
	children: ReactNode
	fallback?: ReactNode // Optional fallback UI
}

interface State {
	hasError: boolean
	error?: Error
}

class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: undefined,
	}

	public static getDerivedStateFromError(error: Error): State {
		// Update state so the next render will show the fallback UI.
		return { hasError: true, error }
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo)
		// You can also log the error to an error reporting service here
	}

	public render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return (
				this.props.fallback || (
					<div
						style={{
							padding: "10px",
							border: "1px solid var(--vscode-errorForeground)",
							borderRadius: "3px",
							color: "var(--vscode-errorForeground)",
						}}>
						<p>😥 코드 블록을 렌더링하는 중 오류가 발생했어요.</p>
						{/* Optionally display error details for debugging */}
						{/* <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.error?.stack}
          </details> */}
					</div>
				)
			)
		}

		return this.props.children
	}
}

export default ErrorBoundary
