/**
 * VS Code Webview API type declarations
 */

declare module 'vscode-webview' {
  /**
   * VS Code Webview API
   */
  export interface WebviewApi<T> {
    /**
     * Post a message to the extension context
     */
    postMessage(message: T): void;
    
    /**
     * Set VS Code state
     * @return The same state that was set
     */
    setState<S>(state: S): S;
    
    /**
     * Get VS Code state
     */
    getState(): T | undefined;
  }
}

/**
 * Global VS Code API
 */
declare function acquireVsCodeApi<T = any>(): import('vscode-webview').WebviewApi<T>;
