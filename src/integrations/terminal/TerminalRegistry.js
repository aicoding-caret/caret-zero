import * as vscode from "vscode";
// Although vscode.window.terminals provides a list of all open terminals, there's no way to know whether they're busy or not (exitStatus does not provide useful information for most commands). In order to prevent creating too many terminals, we need to keep track of terminals through the life of the extension, as well as session specific terminals for the life of a task (to get latest unretrieved output).
// Since we have promises keeping track of terminal processes, we get the added benefit of keep track of busy terminals even after a task is closed.
export class TerminalRegistry {
    static terminals = [];
    static nextTerminalId = 1;
    static createTerminal(cwd) {
        const terminal = vscode.window.createTerminal({
            cwd,
            name: "Cline",
            iconPath: new vscode.ThemeIcon("robot"),
        });
        const newInfo = {
            terminal,
            busy: false,
            lastCommand: "",
            id: this.nextTerminalId++,
        };
        this.terminals.push(newInfo);
        return newInfo;
    }
    static getTerminal(id) {
        const terminalInfo = this.terminals.find((t) => t.id === id);
        if (terminalInfo && this.isTerminalClosed(terminalInfo.terminal)) {
            this.removeTerminal(id);
            return undefined;
        }
        return terminalInfo;
    }
    static updateTerminal(id, updates) {
        const terminal = this.getTerminal(id);
        if (terminal) {
            Object.assign(terminal, updates);
        }
    }
    static removeTerminal(id) {
        this.terminals = this.terminals.filter((t) => t.id !== id);
    }
    static getAllTerminals() {
        this.terminals = this.terminals.filter((t) => !this.isTerminalClosed(t.terminal));
        return this.terminals;
    }
    // The exit status of the terminal will be undefined while the terminal is active. (This value is set when onDidCloseTerminal is fired.)
    static isTerminalClosed(terminal) {
        return terminal.exitStatus !== undefined;
    }
}
//# sourceMappingURL=TerminalRegistry.js.map