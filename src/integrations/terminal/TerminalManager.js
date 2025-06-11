import pWaitFor from "p-wait-for";
import * as vscode from "vscode";
import { arePathsEqual } from "@utils/path";
import { mergePromise, TerminalProcess } from "./TerminalProcess";
import { TerminalRegistry } from "./TerminalRegistry";
export class TerminalManager {
    terminalIds = new Set();
    processes = new Map();
    disposables = [];
    shellIntegrationTimeout = 4000;
    terminalReuseEnabled = true;
    constructor() {
        let disposable;
        try {
            disposable = vscode.window.onDidStartTerminalShellExecution?.(async (e) => {
                // Creating a read stream here results in a more consistent output. This is most obvious when running the `date` command.
                e?.execution?.read();
            });
        }
        catch (error) {
            // console.error("Error setting up onDidEndTerminalShellExecution", error)
        }
        if (disposable) {
            this.disposables.push(disposable);
        }
        // Add a listener for terminal state changes to detect CWD updates
        try {
            const stateChangeDisposable = vscode.window.onDidChangeTerminalState((terminal) => {
                const terminalInfo = this.findTerminalInfoByTerminal(terminal);
                if (terminalInfo && terminalInfo.pendingCwdChange && terminalInfo.cwdResolved) {
                    // Check if CWD has been updated to match the expected path
                    if (this.isCwdMatchingExpected(terminalInfo)) {
                        const resolver = terminalInfo.cwdResolved.resolve;
                        terminalInfo.pendingCwdChange = undefined;
                        terminalInfo.cwdResolved = undefined;
                        resolver();
                    }
                }
            });
            this.disposables.push(stateChangeDisposable);
        }
        catch (error) {
            console.error("Error setting up onDidChangeTerminalState", error);
        }
    }
    //Find a TerminalInfo by its VSCode Terminal instance
    findTerminalInfoByTerminal(terminal) {
        const terminals = TerminalRegistry.getAllTerminals();
        return terminals.find((t) => t.terminal === terminal);
    }
    //Check if a terminal's CWD matches its expected pending change
    isCwdMatchingExpected(terminalInfo) {
        if (!terminalInfo.pendingCwdChange) {
            return false;
        }
        const currentCwd = terminalInfo.terminal.shellIntegration?.cwd?.fsPath;
        const targetCwd = vscode.Uri.file(terminalInfo.pendingCwdChange).fsPath;
        if (!currentCwd) {
            return false;
        }
        return arePathsEqual(currentCwd, targetCwd);
    }
    runCommand(terminalInfo, command) {
        terminalInfo.busy = true;
        terminalInfo.lastCommand = command;
        const process = new TerminalProcess();
        this.processes.set(terminalInfo.id, process);
        process.once("completed", () => {
            terminalInfo.busy = false;
        });
        // if shell integration is not available, remove terminal so it does not get reused as it may be running a long-running process
        process.once("no_shell_integration", () => {
            console.log(`no_shell_integration received for terminal ${terminalInfo.id}`);
            // Remove the terminal so we can't reuse it (in case it's running a long-running process)
            TerminalRegistry.removeTerminal(terminalInfo.id);
            this.terminalIds.delete(terminalInfo.id);
            this.processes.delete(terminalInfo.id);
        });
        const promise = new Promise((resolve, reject) => {
            process.once("continue", () => {
                resolve();
            });
            process.once("error", (error) => {
                console.error(`Error in terminal ${terminalInfo.id}:`, error);
                reject(error);
            });
        });
        // if shell integration is already active, run the command immediately
        if (terminalInfo.terminal.shellIntegration) {
            process.waitForShellIntegration = false;
            process.run(terminalInfo.terminal, command);
        }
        else {
            // docs recommend waiting 3s for shell integration to activate
            console.log(`[TerminalManager Test] Waiting for shell integration for terminal ${terminalInfo.id} with timeout ${this.shellIntegrationTimeout}ms`);
            pWaitFor(() => terminalInfo.terminal.shellIntegration !== undefined, {
                timeout: this.shellIntegrationTimeout,
            })
                .then(() => {
                console.log(`[TerminalManager Test] Shell integration activated for terminal ${terminalInfo.id} within timeout.`);
            })
                .catch((err) => {
                console.warn(`[TerminalManager Test] Shell integration timed out or failed for terminal ${terminalInfo.id}: ${err.message}`);
            })
                .finally(() => {
                console.log(`[TerminalManager Test] Proceeding with command execution for terminal ${terminalInfo.id}.`);
                const existingProcess = this.processes.get(terminalInfo.id);
                if (existingProcess && existingProcess.waitForShellIntegration) {
                    existingProcess.waitForShellIntegration = false;
                    existingProcess.run(terminalInfo.terminal, command);
                }
            });
        }
        return mergePromise(process, promise);
    }
    async getOrCreateTerminal(cwd) {
        const terminals = TerminalRegistry.getAllTerminals();
        // Find available terminal from our pool first (created for this task)
        const matchingTerminal = terminals.find((t) => {
            if (t.busy) {
                return false;
            }
            const terminalCwd = t.terminal.shellIntegration?.cwd; // one of cline's commands could have changed the cwd of the terminal
            if (!terminalCwd) {
                return false;
            }
            return arePathsEqual(vscode.Uri.file(cwd).fsPath, terminalCwd.fsPath);
        });
        if (matchingTerminal) {
            this.terminalIds.add(matchingTerminal.id);
            return matchingTerminal;
        }
        // If no non-busy terminal in the current working dir exists and terminal reuse is enabled, try to find any non-busy terminal regardless of CWD
        if (this.terminalReuseEnabled) {
            const availableTerminal = terminals.find((t) => !t.busy);
            if (availableTerminal) {
                // Set up promise and tracking for CWD change
                const cwdPromise = new Promise((resolve, reject) => {
                    availableTerminal.pendingCwdChange = cwd;
                    availableTerminal.cwdResolved = { resolve, reject };
                });
                // Navigate back to the desired directory
                await this.runCommand(availableTerminal, `cd "${cwd}"`);
                // Either resolve immediately if CWD already updated or wait for event/timeout
                if (this.isCwdMatchingExpected(availableTerminal)) {
                    if (availableTerminal.cwdResolved) {
                        availableTerminal.cwdResolved.resolve();
                    }
                    availableTerminal.pendingCwdChange = undefined;
                    availableTerminal.cwdResolved = undefined;
                }
                else {
                    try {
                        // Wait with a timeout for state change event to resolve
                        await Promise.race([
                            cwdPromise,
                            new Promise((_, reject) => setTimeout(() => reject(new Error(`CWD timeout: Failed to update to ${cwd}`)), 1000)),
                        ]);
                    }
                    catch (err) {
                        // Clear pending state on timeout
                        availableTerminal.pendingCwdChange = undefined;
                        availableTerminal.cwdResolved = undefined;
                    }
                }
                this.terminalIds.add(availableTerminal.id);
                return availableTerminal;
            }
        }
        // If all terminals are busy, create a new one
        const newTerminalInfo = TerminalRegistry.createTerminal(cwd);
        this.terminalIds.add(newTerminalInfo.id);
        return newTerminalInfo;
    }
    getTerminals(busy) {
        return Array.from(this.terminalIds)
            .map((id) => TerminalRegistry.getTerminal(id))
            .filter((t) => t !== undefined && t.busy === busy)
            .map((t) => ({ id: t.id, lastCommand: t.lastCommand }));
    }
    getUnretrievedOutput(terminalId) {
        if (!this.terminalIds.has(terminalId)) {
            return "";
        }
        const process = this.processes.get(terminalId);
        return process ? process.getUnretrievedOutput() : "";
    }
    isProcessHot(terminalId) {
        const process = this.processes.get(terminalId);
        return process ? process.isHot : false;
    }
    disposeAll() {
        // for (const info of this.terminals) {
        // 	//info.terminal.dispose() // dont want to dispose terminals when task is aborted
        // }
        this.terminalIds.clear();
        this.processes.clear();
        this.disposables.forEach((disposable) => disposable.dispose());
        this.disposables = [];
    }
    setShellIntegrationTimeout(timeout) {
        this.shellIntegrationTimeout = timeout;
    }
    setTerminalReuseEnabled(enabled) {
        this.terminalReuseEnabled = enabled;
    }
}
//# sourceMappingURL=TerminalManager.js.map