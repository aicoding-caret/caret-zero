class VSCodeAPIWrapper {
    // private readonly vscodeApi: any
    vscodeApi;
    constructor() {
        // Check if the acquireVsCodeApi function exists in the current development
        // context (i.e. VS Code development window or web browser)
        if (typeof acquireVsCodeApi === "function") {
            this.vscodeApi = acquireVsCodeApi();
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
    postMessage(message) {
        if (this.vscodeApi) {
            this.vscodeApi.postMessage(message);
        }
        else {
            // window.vscode.postMessage(message)
            console.log(message);
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
    getState() {
        if (this.vscodeApi) {
            return this.vscodeApi.getState();
        }
        else {
            const state = localStorage.getItem("vscodeState");
            return state ? JSON.parse(state) : undefined;
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
    setState(newState) {
        if (this.vscodeApi) {
            return this.vscodeApi.setState(newState);
        }
        else {
            localStorage.setItem("vscodeState", JSON.stringify(newState));
            return newState;
        }
    }
}
export const vscode = new VSCodeAPIWrapper();
//# sourceMappingURL=vscode.js.map