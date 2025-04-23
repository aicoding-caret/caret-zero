import * as vscode from "vscode"
import { Logger } from "./Logger"
import { LogEntryExit, LogError, setLoggerInstance } from "./LogDecorators"
import { ILogger } from "./ILogger"

// Mock VSCode ExtensionContext for testing
const mockContext: Partial<vscode.ExtensionContext> = {
	extensionMode: vscode.ExtensionMode.Development, // Set to Development for testing debug logs
	subscriptions: [],
	globalStorageUri: vscode.Uri.file("mock/globalStorage"),
	// Add other properties if needed by Logger or other components
}

// Initialize a logger instance for testing
const testLogger = new Logger("Caret Test", mockContext as vscode.ExtensionContext)
setLoggerInstance(testLogger) // Set the global logger instance for decorators

class TestClass {
	private logger: ILogger

	constructor(logger: ILogger) {
		this.logger = logger
	}

	@LogEntryExit() // Uses global logger set by setLoggerInstance
	@LogError() // Uses global logger set by setLoggerInstance
	syncMethod(a: number, b: string): string {
		this.logger.log("Inside syncMethod") // Direct log call
		if (a === 0) {
			throw new Error("Test sync error")
		}
		return `Result: ${a} - ${b}`
	}

	@LogEntryExit()
	@LogError()
	async asyncMethod(delay: number): Promise<string> {
		this.logger.log("Inside asyncMethod")
		await new Promise((resolve) => setTimeout(resolve, delay))
		if (delay < 0) {
			throw new Error("Test async error")
		}
		return `Async waited for ${delay}ms`
	}

	// Example using injected logger instance in decorator
	@LogEntryExit(testLogger)
	@LogError(testLogger)
	methodWithInjectedLogger(data: object): void {
		this.logger.debug("Inside methodWithInjectedLogger", data)
	}
}

// --- Test Execution ---
export function runLoggingTests() {
	console.log("--- Running Logging Tests ---")
	testLogger.show() // Show the output channel

	const testInstance = new TestClass(testLogger)

	testLogger.log("Starting logging tests...")

	// Test sync method (success)
	try {
		testLogger.log("Testing syncMethod (success)...")
		const syncResult = testInstance.syncMethod(5, "hello")
		testLogger.log("Sync method result:", syncResult)
	} catch (e) {
		testLogger.error("Unexpected error in syncMethod success test", e)
	}

	// Test sync method (error)
	try {
		testLogger.log("Testing syncMethod (error)...")
		testInstance.syncMethod(0, "world") // This should throw
	} catch (e) {
		testLogger.log("Caught expected sync error successfully.")
		// Error is already logged by @LogError decorator
	}

	// Test async method (success)
	testLogger.log("Testing asyncMethod (success)...")
	testInstance
		.asyncMethod(50)
		.then((asyncResult) => {
			testLogger.log("Async method result:", asyncResult)
			// Test async method (error) after success case finishes
			testLogger.log("Testing asyncMethod (error)...")
			return testInstance.asyncMethod(-10) // This should throw
		})
		.catch((e) => {
			testLogger.log("Caught expected async error successfully.")
			// Error is already logged by @LogError decorator
		})
		.finally(() => {
			// Test method with injected logger
			testLogger.log("Testing methodWithInjectedLogger...")
			testInstance.methodWithInjectedLogger({ test: "data", value: 123 })

			testLogger.log("--- Logging Tests Finished ---")
			console.log("--- Logging Tests Finished ---")
			// Note: In a real test suite, you'd use a test runner like Mocha/Jest
			// and assert the output channel content or mock the logger.
			// For manual testing, check the "Caret Test" output channel in VSCode.
		})
}

// To run manually during development:
// 1. Import and call runLoggingTests() from your extension's activate function (conditionally, e.g., based on a command)
// 2. Check the "Caret Test" output channel in VSCode.
