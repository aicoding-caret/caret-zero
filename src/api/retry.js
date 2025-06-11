const DEFAULT_OPTIONS = {
    maxRetries: 3,
    baseDelay: 1_000,
    maxDelay: 10_000,
    retryAllErrors: false,
};
export function withRetry(options = {}) {
    const { maxRetries, baseDelay, maxDelay, retryAllErrors } = { ...DEFAULT_OPTIONS, ...options };
    return function (_target, _propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function* (...args) {
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    yield* originalMethod.apply(this, args);
                    return;
                }
                catch (error) {
                    const isRateLimit = error?.status === 429;
                    const isLastAttempt = attempt === maxRetries - 1;
                    if ((!isRateLimit && !retryAllErrors) || isLastAttempt) {
                        throw error;
                    }
                    // Get retry delay from header or calculate exponential backoff
                    // Check various rate limit headers
                    const retryAfter = error.headers?.["retry-after"] ||
                        error.headers?.["x-ratelimit-reset"] ||
                        error.headers?.["ratelimit-reset"];
                    let delay;
                    if (retryAfter) {
                        // Handle both delta-seconds and Unix timestamp formats
                        const retryValue = parseInt(retryAfter, 10);
                        if (retryValue > Date.now() / 1000) {
                            // Unix timestamp
                            delay = retryValue * 1000 - Date.now();
                        }
                        else {
                            // Delta seconds
                            delay = retryValue * 1000;
                        }
                    }
                    else {
                        // Use exponential backoff if no header
                        delay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
                    }
                    const handlerInstance = this;
                    if (handlerInstance.options?.onRetryAttempt) {
                        try {
                            handlerInstance.options.onRetryAttempt(attempt + 1, maxRetries, delay, error);
                        }
                        catch (e) {
                            console.error("Error in onRetryAttempt callback:", e);
                        }
                    }
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        };
        return descriptor;
    };
}
//# sourceMappingURL=retry.js.map