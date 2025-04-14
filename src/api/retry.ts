interface RetryOptions {
	maxRetries?: number
	baseDelay?: number
	maxDelay?: number
	retryAllErrors?: boolean
	onRetry?: (error: any, attempt: number, delay: number) => void
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
	maxRetries: 3,
	baseDelay: 1_000,
	maxDelay: 10_000,
	retryAllErrors: false,
}

export function withRetry(options: RetryOptions = {}) {
	const { maxRetries, baseDelay, maxDelay, retryAllErrors } = { ...DEFAULT_OPTIONS, ...options }

	return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value

		descriptor.value = async function* (...args: any[]) {
			for (let attempt = 0; attempt < maxRetries; attempt++) {
				try {
					yield* originalMethod.apply(this, args)
					return
				} catch (error: any) {
					// Retryable error status codes based on Google Vertex AI documentation
					const retryableErrors = new Set([429, 503, 504, 500])
					const isRetryableError = error?.status && retryableErrors.has(error.status)
					
					
					const isLastAttempt = attempt === maxRetries - 1

					if ((!isRetryableError && !retryAllErrors) || isLastAttempt) {
						throw error
					}

					// Log error details for debugging
					const errorBody = error?.body ? JSON.parse(error.body) : null
					const retryInfo = errorBody?.find((item: any) => item['@type']?.includes('RetryInfo'))
					const quotaInfo = errorBody?.find((item: any) => item['@type']?.includes('QuotaFailure'))

					console.debug('[Retry Debug] Error details:', {
						status: error?.status,
						headers: error?.headers,
						message: error?.message,
						retryDelay: retryInfo?.retryDelay,
						quotaInfo: quotaInfo?.violations,
						rawBody: error?.body,
						parsedBody: errorBody
					})

					// Get retry delay from error body, headers, or calculate exponential backoff
					let delay: number

					 // Declare errorType at the beginning of the catch block
					let errorType: string = 'API 오류';

					// Try to get delay from RetryInfo in error body
					if (retryInfo?.retryDelay) {
						const recommendedDelay = parseFloat(retryInfo.retryDelay.replace('s', '')) * 1000
						delay = recommendedDelay + 1000 // Add 1 second buffer
						console.debug('[Retry Debug] Using retry delay from API:', { recommended: recommendedDelay, actual: delay })
					} else {
						// Fallback to headers or exponential backoff
						const retryAfter =
							error.headers?.["retry-after"] ||
							error.headers?.["x-ratelimit-reset"] ||
							error.headers?.["ratelimit-reset"]

						if (retryAfter) {
							// Handle both delta-seconds and Unix timestamp formats
							const retryValue = parseInt(retryAfter, 10)
							if (retryValue > Date.now() / 1000) {
								// Unix timestamp
								delay = retryValue * 1000 - Date.now()
							} else {
								// Delta seconds
								delay = retryValue * 1000
							}
						} else {
							// Use exponential backoff if no header
							delay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt))
						}

						// Get error type for user message
						if (error?.status === 429 && quotaInfo) {
							errorType = `할당량 초과 (${quotaInfo.violations?.[0]?.quotaMetric || ''})`
						} else if (error?.status) {
							switch(error.status) {
								case 429: errorType = '할당량 초과'; break
								case 503: errorType = '서비스 불가'; break
								case 504: errorType = '시간 초과'; break
								case 500: errorType = '내부 서버 오류'; break
							}
						}

						// Log retry details
						console.debug('[Retry Debug] Attempting retry:', {
							status: error?.status,
							errorType,
							attempt: attempt + 1,
							delay,
							quotaInfo: quotaInfo?.violations
						})

						// Notify retry callback
						if (options.onRetry) {
							options.onRetry(error, attempt + 1, delay)
						}
					} // Closing the retry logic block

					// Add message to chat if available
					if ((this as any).say) {
						const waitSeconds = Math.round(delay / 1000)
						;(this as any).say(`⚠️ ${errorType}. ${attempt + 1}번째 재시도까지 ${waitSeconds}초 대기합니다...`)
					}

					// Wait for the calculated delay
					await new Promise((resolve) => setTimeout(resolve, delay))
				}
			}
		}
		return descriptor
	}
}