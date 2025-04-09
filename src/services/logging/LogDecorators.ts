import { ILogger } from "./ILogger"
import { Logger } from "./Logger" // Import the Logger class itself
// Assuming a way to get a logger instance, e.g., a singleton or dependency injection
// For simplicity, let's assume a global getLogger function exists for now,
// managed by the setLoggerInstance and getLogger functions below.
// In a real app, you'd likely inject the logger.

/**
 * Decorator to log method entry and exit, including arguments and return value.
 * Only logs in development mode.
 * @param loggerInstance Optional logger instance to use. If not provided, uses the global logger.
 */
export function LogEntryExit(loggerInstance?: ILogger) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value
		// Use the internal getLogger or the provided instance
		const logger = loggerInstance || getLogger()

		// Check if the logger is an instance of our Logger class and if it's in development mode
		let isDevelopment = false
		if (logger instanceof Logger) {
			isDevelopment = logger.isDevelopmentMode
		} else {
			// If it's not our Logger instance (e.g., console fallback), assume not development mode for safety
			// Or, you could try checking a property if the fallback logger has one, but console doesn't.
		}

		// Ensure logger is available and in development mode before wrapping
		if (!isDevelopment) {
			return descriptor // Return original descriptor if not in dev mode or logger is not our Logger type
		}

		descriptor.value = function (...args: any[]) {
			const className = target.constructor.name
			const methodName = propertyKey

			logger.debug(`Entering ${className}.${methodName}`, { arguments: args })

			let result: any
			try {
				result = originalMethod.apply(this, args)

				// Handle potential promises
				if (result instanceof Promise) {
					return result
						.then((resolvedResult: any) => {
							logger.debug(`Exiting ${className}.${methodName}`, { returnValue: resolvedResult })
							return resolvedResult
						})
						.catch((error: any) => {
							// Error logging for async methods is handled by @LogError if applied
							// If @LogError is not used, you might want to log the error here too.
							// logger.error(`Error in async ${className}.${methodName}`, { error });
							throw error // Re-throw error to maintain original behavior
						})
				} else {
					logger.debug(`Exiting ${className}.${methodName}`, { returnValue: result })
					return result
				}
			} catch (error) {
				// Error logging for sync methods is handled by @LogError if applied
				// logger.error(`Error in sync ${className}.${methodName}`, { error });
				throw error // Re-throw error
			}
		}

		return descriptor
	}
}

/**
 * Decorator to automatically log errors thrown by a method.
 * @param loggerInstance Optional logger instance to use. If not provided, uses the global logger.
 */
export function LogError(loggerInstance?: ILogger) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value
		// Use the internal getLogger or the provided instance
		const logger = loggerInstance || getLogger()

		if (!logger) {
			// Use console.error directly if logger is somehow unavailable
			console.error(
				`Logger instance not available for @LogError on ${target?.constructor?.name || "UnknownTarget"}.${propertyKey}`,
			)
			return descriptor // Return original descriptor if no logger
		}

		descriptor.value = function (...args: any[]) {
			const className = target.constructor.name
			const methodName = propertyKey

			try {
				const result = originalMethod.apply(this, args)

				// Handle potential promises
				if (result instanceof Promise) {
					return result.catch((error: any) => {
						logger.error(`Error in async ${className}.${methodName}`, {
							error: error instanceof Error ? error.stack || error.message : error,
							arguments: args,
						})
						throw error // Re-throw error after logging
					})
				} else {
					return result
				}
			} catch (error) {
				logger.error(`Error in sync ${className}.${methodName}`, {
					error: error instanceof Error ? error.stack || error.message : error,
					arguments: args,
				})
				throw error // Re-throw error after logging
			}
		}

		return descriptor
	}
}

// --- Placeholder for getLogger ---
// This needs to be implemented based on how the logger is managed in the extension.
// Example: If using a singleton initialized in extension.ts
let _logger: ILogger | null = null
export function setLoggerInstance(logger: ILogger) {
	_logger = logger
}
function getLogger(): ILogger {
	if (!_logger) {
		// Fallback or throw error if logger not set
		console.warn("Global logger accessed before initialization. Using console.")
		return console // Basic fallback
		// Or: throw new Error("Logger not initialized. Call setLoggerInstance first.");
	}
	return _logger
}
// ---------------------------------
