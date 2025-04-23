import { ILogger } from "./ILogger"

/**
 * A simple logger implementation that writes to a VSCode OutputChannel.
 */
export class Logger implements ILogger {
	private outputChannel: any
	public readonly isDevelopmentMode: boolean // Made public and readonly

	/**
	 * Creates a new Logger instance.
	 * @param channelName The name of the VSCode OutputChannel to use.
	 * @param context The VSCode extension context to determine the mode.
	 */
	constructor(channelName: string, context: any) {
		this.outputChannel = {
			appendLine: (message: string) => {
				console.log(message)
			},
			show: () => {},
			dispose: () => {},
			clear: () => {},
		}
		this.isDevelopmentMode = true
	}

	private getCallerInfo(): { file: string; function: string; line: number } {
		const stackLines = new Error().stack?.split("\n") || []
		// 첫 번째 줄은 Error 객체 생성, 두 번째 줄은 현재 메서드, 세 번째 줄부터 실제 호출자
		const callerLine = stackLines[3] || ""

		// 스택 트레이스 파싱 (형식: "at FunctionName (FilePath:Line:Column)")
		const match = callerLine.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/) || callerLine.match(/at\s+()(.*):(\d+):(\d+)/) // 익명 함수의 경우

		if (match) {
			const functionName = match[1] || "anonymous"
			const filePath = match[2] || "unknown"
			const lineNumber = parseInt(match[3], 10) || 0

			return {
				file: filePath,
				function: functionName,
				line: lineNumber,
			}
		}

		return {
			file: "unknown",
			function: "unknown",
			line: 0,
		}
	}

	private formatMessage(level: string, message: string, data?: unknown): string {
		const { file, function: functionName, line } = this.getCallerInfo()
		const timestamp = new Date().toISOString()
		let logEntry = `[${timestamp}] [${level.toUpperCase()}] [${file}:${line} ${functionName}] ${message}`

		if (data !== undefined) {
			try {
				// Attempt to stringify data, handling potential circular references
				const dataString = JSON.stringify(data, this.getCircularReplacer(), 2)
				logEntry += `\nData: ${dataString}`
			} catch (error) {
				logEntry += `\nData: [Could not stringify data: ${(error as Error).message}]`
			}
		}
		return logEntry
	}

	// Helper function to handle circular references in JSON.stringify
	private getCircularReplacer = () => {
		const seen = new WeakSet()
		return (key: string, value: unknown) => {
			if (typeof value === "object" && value !== null) {
				if (seen.has(value)) {
					return "[Circular Reference]"
				}
				seen.add(value)
			}
			return value
		}
	}

	log(message: string, data?: unknown): void {
		this.outputChannel.appendLine(this.formatMessage("info", message, data))
	}

	error(message: string | Error, data?: unknown): void {
		if (message instanceof Error) {
			// Include stack trace for Error objects
			const errorMessage = message.stack || message.message
			this.outputChannel.appendLine(this.formatMessage("error", errorMessage, data))
		} else {
			this.outputChannel.appendLine(this.formatMessage("error", message, data))
		}
	}

	warn(message: string, data?: unknown): void {
		this.outputChannel.appendLine(this.formatMessage("warn", message, data))
	}

	debug(message: string | (() => string), data?: unknown | (() => unknown)): void {
		if (this.isDevelopmentMode) {
			const msg = typeof message === "function" ? message() : message
			const d = typeof data === "function" ? data() : data
			this.outputChannel.appendLine(this.formatMessage("debug", msg, d))
		}
	}

	/**
	 * Shows the output channel in the VSCode UI.
	 */
	show(): void {
		this.outputChannel.show()
	}

	/**
	 * Disposes the output channel.
	 */
	dispose(): void {
		this.outputChannel.dispose()
	}
}

// Singleton instance (optional, depends on how it will be used)
// let globalLogger: Logger | undefined;

// export function initializeGlobalLogger(context: vscode.ExtensionContext): Logger {
//   if (!globalLogger) {
//     globalLogger = new Logger("Caret", context); // Use your extension's name
//   }
//   return globalLogger;
// }

// export function getLogger(): Logger {
//   if (!globalLogger) {
//     throw new Error("Logger not initialized. Call initializeGlobalLogger first.");
//   }
//   return globalLogger;
// }
