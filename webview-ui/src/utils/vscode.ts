import { WebviewMessage } from "@shared/WebviewMessage"
// import type { WebviewApi } from "vscode-webview"

/**
 * A utility wrapper around the acquireVsCodeApi() function, which enables
 * message passing and state management between the webview and extension
 * contexts.
 *
 * This utility also enables webview code to be run in a web browser-based
 * dev server by using native web browser features that mock the functionality
 * enabled by acquireVsCodeApi.
 */
// declare global {
// 	interface Window {
// 		vscode: {
// 			postMessage: (message: any) => void
// 		}
// 	}
// }
// 타입 직접 정의
declare function acquireVsCodeApi<T = unknown>(): {
  postMessage: (message: any) => void
  getState: () => T | undefined
  setState: (newState: T) => T
}

type WebviewApi<T = unknown> = ReturnType<typeof acquireVsCodeApi<T>>

class VSCodeAPIWrapper {
	// private readonly vscodeApi: any
	private readonly vscodeApi: WebviewApi | undefined

	constructor() {
		// Check if the acquireVsCodeApi function exists in the current development
		// context (i.e. VS Code development window or web browser)
		if (typeof acquireVsCodeApi === "function") {
			this.vscodeApi = acquireVsCodeApi()
		}
	}

	/**
	 * Post a message (i.e. send arbitrary data) to the owner of the webview.
	 *
	 * @remarks When running webview code inside a web browser, postMessage will instead
	 * log the given message to the console.
	 *
	 * @param message Arbitrary data (must be JSON serializable) to send to the extension context.
	 */
	public postMessage(message: any) {
		if (this.vscodeApi) {
			this.vscodeApi.postMessage(message)
		} else {
			// window.vscode.postMessage(message)
			console.log(message)
		}
	}

	/**
	 * Get the persistent state stored for this webview.
	 *
	 * @remarks When running webview source code inside a web browser, getState will retrieve state
	 * from local storage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
	 *
	 * @return The current state or `undefined` if no state has been set.
	 */
	public getState(): unknown | undefined {
		if (this.vscodeApi) {
			return this.vscodeApi.getState()
		} else {
			const state = localStorage.getItem("vscodeState")
			return state ? JSON.parse(state) : undefined
		}
	}

	/**
	 * Set the persistent state stored for this webview.
	 *
	 * @remarks When running webview source code inside a web browser, setState will set the given
	 * state using local storage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
	 *
	 * @param newState New persisted state. This must be a JSON serializable object. Can be retrieved
	 * using {@link getState}.
	 *
	 * @return The new state.
	 */
	public setState<T extends unknown | undefined>(newState: T): T {
		if (this.vscodeApi) {
			return this.vscodeApi.setState(newState) as T
		} else {
			localStorage.setItem("vscodeState", JSON.stringify(newState))
			return newState
		}
	}
}

export const vscode = new VSCodeAPIWrapper()
