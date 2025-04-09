/**
 * Defines the interface for a common logger service.
 */
export interface ILogger {
	/**
	 * Logs an informational message.
	 * @param message The message to log.
	 * @param data Optional additional data to include in the log.
	 */
	log(message: string, data?: unknown): void

	/**
	 * Logs an error message.
	 * @param message The error message or Error object.
	 * @param data Optional additional data to include in the log.
	 */
	error(message: string | Error, data?: unknown): void

	/**
	 * Logs a warning message.
	 * @param message The warning message to log.
	 * @param data Optional additional data to include in the log.
	 */
	warn(message: string, data?: unknown): void

	/**
	 * Logs a debug message. Only logged in development mode.
	 * @param message The debug message to log.
	 *   Can be a function that returns the message, evaluated only if debugging is enabled.
	 * @param data Optional additional data to include in the log.
	 *   Can be a function that returns the data, evaluated only if debugging is enabled.
	 */
	debug(message: string | (() => string), data?: unknown | (() => unknown)): void
}
