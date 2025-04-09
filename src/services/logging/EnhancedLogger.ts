import * as vscode from "vscode"
import * as path from "path"
import { ILogger } from "./ILogger"

/**
 * 향상된 로깅 기능을 제공하는 로거 클래스
 * 기존 Logger 클래스를 확장하여 더 자세한 로깅 정보와 컨텍스트를 제공합니다.
 */
export class EnhancedLogger implements ILogger {
	private outputChannel: vscode.OutputChannel
	public readonly isDevelopmentMode: boolean
	private readonly logFilePath?: string
	private readonly logToFile: boolean
	private fs: typeof import("fs/promises") | null = null

	/**
	 * EnhancedLogger 생성자
	 * @param channelName VSCode OutputChannel 이름
	 * @param context VSCode 확장 컨텍스트
	 * @param options 로거 옵션
	 */
	constructor(
		channelName: string,
		context: vscode.ExtensionContext,
		options: {
			logToFile?: boolean
			logFileName?: string
		} = {},
	) {
		this.outputChannel = vscode.window.createOutputChannel(channelName)
		this.isDevelopmentMode = context.extensionMode === vscode.ExtensionMode.Development
		this.logToFile = options.logToFile || false

		if (this.logToFile) {
			// 로그 파일 경로 설정
			const logFileName = options.logFileName || `${channelName.toLowerCase().replace(/\s+/g, "-")}.log`
			this.logFilePath = path.join(context.globalStorageUri.fsPath, logFileName)

			// fs/promises 모듈 동적 로드
			import("fs/promises")
				.then((fs) => {
					this.fs = fs
					// 로그 디렉토리 생성
					this.fs.mkdir(path.dirname(this.logFilePath!), { recursive: true }).catch((err) => {
						console.error(`로그 디렉토리 생성 실패: ${err.message}`)
					})
				})
				.catch((err) => {
					console.error(`fs/promises 모듈 로드 실패: ${err.message}`)
				})
		}
	}

	/**
	 * 호출 스택에서 호출자 정보를 추출합니다.
	 * @returns 호출자 정보 (파일명, 함수명, 라인 번호)
	 */
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
				file: path.basename(filePath),
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

	/**
	 * 메시지와 데이터를 포맷팅합니다.
	 * @param level 로그 레벨
	 * @param message 로그 메시지
	 * @param data 추가 데이터
	 * @returns 포맷팅된 로그 메시지
	 */
	private formatMessage(level: string, message: string | Error, data?: unknown): string {
		const timestamp = new Date().toISOString()
		const caller = this.isDevelopmentMode ? this.getCallerInfo() : null // 개발 모드에서만 호출자 정보 가져오기

		let messageText: string
		let errorStack: string | undefined

		if (message instanceof Error) {
			messageText = message.message
			errorStack = message.stack
		} else {
			messageText = message
		}

		// 로그 항목 포맷팅 (개발 모드 여부에 따라 호출자 정보 포함)
		let logEntry = `[${timestamp}] [${level.toUpperCase()}]`
		if (caller) {
			logEntry += ` [${caller.file}:${caller.line} ${caller.function}]`
		}
		logEntry += ` ${messageText}`

		if (errorStack) {
			logEntry += `\nStack: ${errorStack}`
		}

		if (data !== undefined) {
			try {
				// 순환 참조 처리를 위한 replacer 함수 사용
				const dataString = JSON.stringify(data, this.getCircularReplacer(), 2)
				logEntry += `\nData: ${dataString}`
			} catch (error) {
				logEntry += `\nData: [데이터 직렬화 실패: ${(error as Error).message}]`
			}
		}

		return logEntry
	}

	/**
	 * JSON.stringify에서 순환 참조를 처리하기 위한 replacer 함수
	 */
	private getCircularReplacer = () => {
		const seen = new WeakSet()
		return (key: string, value: unknown) => {
			if (typeof value === "object" && value !== null) {
				if (seen.has(value)) {
					return "[순환 참조]"
				}
				seen.add(value)
			}
			return value
		}
	}

	/**
	 * 로그 메시지를 출력 채널과 파일에 기록합니다.
	 * @param level 로그 레벨
	 * @param message 로그 메시지
	 * @param data 추가 데이터
	 */
	private async writeLog(level: string, message: string | Error, data?: unknown): Promise<void> {
		const formattedMessage = this.formatMessage(level, message, data)

		// OutputChannel에 로그 기록
		this.outputChannel.appendLine(formattedMessage)

		// 파일에 로그 기록 (설정된 경우)
		if (this.logToFile && this.logFilePath && this.fs) {
			try {
				await this.fs.appendFile(this.logFilePath, formattedMessage + "\n", "utf8")
			} catch (error) {
				console.error(`로그 파일 기록 실패: ${(error as Error).message}`)
				// 파일 기록 실패 시 OutputChannel에 오류 메시지 추가
				this.outputChannel.appendLine(`[ERROR] 로그 파일 기록 실패: ${(error as Error).message}`)
			}
		}
	}

	/**
	 * 정보 로그 메시지를 기록합니다.
	 * @param message 로그 메시지
	 * @param data 추가 데이터
	 */
	log(message: string, data?: unknown): void {
		this.writeLog("info", message, data)
	}

	/**
	 * 오류 로그 메시지를 기록합니다.
	 * @param message 오류 메시지 또는 Error 객체
	 * @param data 추가 데이터
	 */
	error(message: string | Error, data?: unknown): void {
		this.writeLog("error", message, data)
	}

	/**
	 * 경고 로그 메시지를 기록합니다.
	 * @param message 경고 메시지
	 * @param data 추가 데이터
	 */
	warn(message: string, data?: unknown): void {
		this.writeLog("warn", message, data)
	}

	/**
	 * 디버그 로그 메시지를 기록합니다. 개발 모드에서만 기록됩니다.
	 * @param message 디버그 메시지 또는 메시지를 반환하는 함수
	 * @param data 추가 데이터 또는 데이터를 반환하는 함수
	 */
	debug(message: string | (() => string), data?: unknown | (() => unknown)): void {
		if (this.isDevelopmentMode) {
			const msg = typeof message === "function" ? message() : message
			const d = typeof data === "function" ? data() : data
			this.writeLog("debug", msg, d)
		}
	}

	/**
	 * 출력 채널을 VSCode UI에 표시합니다.
	 */
	show(): void {
		this.outputChannel.show()
	}

	/**
	 * 출력 채널을 정리합니다.
	 */
	clear(): void {
		this.outputChannel.clear()
	}

	/**
	 * 출력 채널을 해제합니다.
	 */
	dispose(): void {
		this.outputChannel.dispose()
	}
}
