import { ErrorService } from "../error/ErrorService";
/**
 * Simple logging utility for the extension's backend code.
 * Uses VS Code's OutputChannel which must be initialized from extension.ts
 * to ensure proper registration with the extension context.
 */
export class Logger {
    static outputChannel;
    static initialize(outputChannel) {
        Logger.outputChannel = outputChannel;
    }
    static error(message, exception) {
        Logger.outputChannel.appendLine(`ERROR: ${message}`);
        ErrorService.logMessage(message, "error");
        exception && ErrorService.logException(exception);
    }
    static warn(message) {
        Logger.outputChannel.appendLine(`WARN: ${message}`);
        ErrorService.logMessage(message, "warning");
    }
    static log(message) {
        Logger.outputChannel.appendLine(`LOG: ${message}`);
    }
    static debug(message) {
        Logger.outputChannel.appendLine(`DEBUG: ${message}`);
    }
    static info(message) {
        Logger.outputChannel.appendLine(`INFO: ${message}`);
    }
    static trace(message) {
        Logger.outputChannel.appendLine(`TRACE: ${message}`);
    }
}
//# sourceMappingURL=Logger.js.map