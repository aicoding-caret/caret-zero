interface RetryOptions {
	maxRetries?: number
	baseDelay?: number
	maxDelay?: number
	retryAllErrors?: boolean
	onRetry?: (error: any, attempt: number, delay: number) => void
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, "onRetry">> = {
	maxRetries: 5, // 3에서 5로 증가: 더 많은 재시도 기회 제공
	baseDelay: 1_000,
	maxDelay: 10_000,
	retryAllErrors: false,
}

/**
 * 재시도 상태 정보를 위한 인터페이스
 */
interface RetryState {
	status: number
	errorType: string
	attempt: number
	delay: number
	quotaViolation?: string
	retryTimestamp?: number
}

/**
 * 웹뷰에 표시할 재시도 상태 메시지 인터페이스
 */
interface RetryStatusMessage {
	errorType: string
	quotaViolation?: string
	delayMs: number
	startTime: number
	attempt: number
	maxRetries: number
}

/**
 * 지수 백오프 지연 시간을 계산하는 함수
 */
function calcBackoff(attempt: number, baseDelay: number, maxDelay: number): number {
	// 2^attempt 형태의 지수 백오프 (첫 시도는 0부터 시작하므로 attempt + 1)
	const exponentialDelay = baseDelay * Math.pow(2, attempt)
	// 최대 지연 시간을 초과하지 않도록 제한
	return Math.min(exponentialDelay, maxDelay)
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
					// 더 강력한 오류 처리로 errorBody 파싱
					let errorBody = null
					let retryInfo = null
					let quotaInfo = null
					
					try {
						// 메시지에서 retryDelay 탐색 (body 파싱이 실패할 경우를 대비)
						if (error?.message && typeof error.message === 'string') {
							const retryDelayRegex = /"retryDelay":"([^"]+)"/
							const retryMatch = error.message.match(retryDelayRegex)
							if (retryMatch && retryMatch[1]) {
								retryInfo = { retryDelay: retryMatch[1] }
								console.debug("[Retry Debug] Found retryDelay in message:", retryInfo.retryDelay)
							}
						}
						
						// body가 있는 경우 JSON 파싱 시도
						if (error?.body) {
							console.debug("[Retry Debug] Raw error body:", error.body)
							
							// JSON 배열로 파싱 시도
							try {
								errorBody = JSON.parse(error.body)
								if (Array.isArray(errorBody)) {
									retryInfo = errorBody.find((item: any) => item["@type"]?.includes("RetryInfo"))
									quotaInfo = errorBody.find((item: any) => item["@type"]?.includes("QuotaFailure"))
								} else if (typeof errorBody === 'object' && errorBody !== null) {
									// 단일 객체인 경우
									if (errorBody.error?.details) {
										retryInfo = errorBody.error.details.find((item: any) => item["@type"]?.includes("RetryInfo"))
										quotaInfo = errorBody.error.details.find((item: any) => item["@type"]?.includes("QuotaFailure"))
									}
								}
							} catch (parseError) {
								console.debug("[Retry Debug] Error parsing body as JSON:", parseError)
							}
						}
					} catch (parseError) {
						console.debug("[Retry Debug] Error during response parsing:", parseError)
					}

					console.debug("[Retry Debug] Error details:", {
						status: error?.status,
						headers: error?.headers,
						message: error?.message,
						retryDelay: retryInfo?.retryDelay,
						quotaInfo: quotaInfo?.violations,
						rawBody: error?.body,
						parsedBody: errorBody,
					})

					// Get retry delay from error body, headers, or calculate exponential backoff
					let delay: number

					// Declare errorType at the beginning of the catch block
					let errorType: string = "API 오류"
					let quotaViolation: string | undefined = undefined
					
					// 오류 유형 판별
					if (error?.status === 429) {
						errorType = "할당량 초과"
						
						// 위반된 할당량 정보 추출
						if (quotaInfo?.violations && quotaInfo.violations.length > 0) {
							quotaViolation = quotaInfo.violations[0].subject || quotaInfo.violations[0].description || '알 수 없는 할당량'
						}
					} else if (error?.status === 503) {
						errorType = "서비스 사용 불가"
					}

					// Try to get delay from RetryInfo in error body
					if (retryInfo?.retryDelay) {
						console.debug("[Retry Debug] Found retryDelay:", retryInfo.retryDelay, "type:", typeof retryInfo.retryDelay)
						
						// 패턴을 사용하여 숫자와 단위를 추출
						const delayPattern = /(\d+(\.\d+)?)([a-z]+)?/i
						const match = retryInfo.retryDelay.match(delayPattern)
						
						if (match) {
							const value = parseFloat(match[1])
							const unit = match[3] || 's' // 기본값은 초(s)
							console.debug("[Retry Debug] Parsed delay value:", value, "unit:", unit)
							
							// 단위에 따라 밀리초로 변환
							switch(unit.toLowerCase()) {
								case 'ms': 
									delay = value
									break
								case 'm': 
									delay = value * 60 * 1000 // 분을 밀리초로
									break
								case 'h': 
									delay = value * 60 * 60 * 1000 // 시간을 밀리초로
									break
								default: // 's' 또는 다른 단위
									delay = value * 1000 // 초를 밀리초로
							}
						} else {
							// 패턴 매칭에 실패했을 경우 기존 방식으로 처리
							try {
								// 'XXs' 형식에서 s 제거 시도
								const delayStr = retryInfo.retryDelay.toString().replace(/s$/i, "")
								const recommendedDelay = parseFloat(delayStr) * 1000
								if (!isNaN(recommendedDelay)) {
									delay = recommendedDelay
									console.debug("[Retry Debug] Parsed simple delay:", recommendedDelay)
								} else {
									// 숫자 파싱 실패 시 기본값 사용
									delay = calcBackoff(attempt, baseDelay, maxDelay)
									console.debug("[Retry Debug] Failed to parse delay, using backoff:", delay)
								}
							} catch (parseError) {
								// 파싱 자체가 실패한 경우 기본값 사용
								delay = calcBackoff(attempt, baseDelay, maxDelay)
								console.debug("[Retry Debug] Parsing error, using backoff:", delay, parseError)
							}
						}
						
						// API에서 제공한 지연 시간에 약간의 버퍼 추가 (1초)
						delay += 1000
						
						// 결정된 지연 시간 로깅
						console.debug("[Retry Debug] Final retry details:", {
							status: error?.status,
							message: error?.message,
							quotaInfo: quotaInfo?.violations,
							errorType,
							attempt: attempt + 1,
							delayMs: delay,
							delaySeconds: delay / 1000
						})
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
							quotaViolation = quotaInfo.violations?.[0]?.quotaMetric || ""
							errorType = `할당량 초과 (${quotaViolation})`
						} else if (error?.status) {
							switch (error.status) {
								case 429:
									errorType = "할당량 초과"
									break
								case 503:
									errorType = "서비스 불가"
									break
								case 504:
									errorType = "시간 초과"
									break
								case 500:
									errorType = "내부 서버 오류"
									break
							}
						}

						// Log retry details
						console.debug("[Retry Debug] Attempting retry:", {
							status: error?.status,
							errorType,
							attempt: attempt + 1,
							delay,
							quotaInfo: quotaInfo?.violations,
						})

						// Notify retry callback
						if (options.onRetry) {
							options.onRetry(error, attempt + 1, delay)
						}
					} // Closing the retry logic block

					// 재시도 상태 정보 생성
					const retryState: RetryState = {
						status: error?.status,
						errorType,
						attempt: attempt + 1,
						delay,
						quotaViolation,
						retryTimestamp: Date.now() + delay // 언제 재시도가 발생할지 타임스탬프 저장
					}
					
					// 웹뷰에 표시할 재시도 상태 메시지 생성
					const retryStatusMessage: RetryStatusMessage = {
						errorType,
						quotaViolation,
						delayMs: delay,
						startTime: Date.now(),
						attempt: attempt + 1,
						maxRetries
					}
					
					console.debug("[Retry Debug] Created retry status message:", retryStatusMessage)

					// Chat 메시지 표시를 위한 시간 계산
					const waitSeconds = Math.round(delay / 1000)
					const retryMessage = `⚠️ ${errorType}. ${attempt + 1}번째 재시도까지 ${waitSeconds}초 대기합니다...`
					
					// 웹뷰에 메시지 표시 - Controller의 say 메서드 사용
					if ((this as any).say) {
						;(this as any).say(retryMessage, { retryState, retryStatusMessage })
					}
					
					// WebView 상태 업데이트 - Controller의 postMessageToWebview 메서드 사용
					if ((this as any).controller && typeof (this as any).controller.postMessageToWebview === 'function') {
						try {
							(this as any).controller.postMessageToWebview({
								type: 'retryStatus',
								retryState,
								retryStatusMessage // 추가: 디테일한 상태 정보 전송
							})
							console.log("[Retry] 웹뷰로 재시도 상태 전송 성공")
						} catch (err) {
							console.error("[Retry] 웹뷰로 재시도 상태 전송 실패:", err)
						}
					}

					// API에서 권장하는 시간만큼 정확히 대기
					console.log(`[Retry] ${waitSeconds}초 동안 대기 중...`)
					await new Promise((resolve) => setTimeout(resolve, delay))
				}
			}
		}
		return descriptor
	}
}
