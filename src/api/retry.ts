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
	maxRetries?: number
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
			const instance = this // <-- 원래 메서드의 'this' 컨텍스트를 캡처합니다.
			let lastError: any = null
			for (let attempt = 0; attempt < maxRetries; attempt++) {
				try {
					const result = yield* originalMethod.apply(this, args)
					// 성공 시 retryStatus 초기화
					console.log(`[Retry] API call successful after ${attempt} retries. Resetting retryStatus.`)
					if ((instance as any)._updateState) {
						;(instance as any)._updateState({ retryStatus: null }) // <-- 성공 시 여기서 초기화
					} else {
						console.warn("[Retry] _updateState function not provided to the handler instance for reset.")
					}
					return result // 성공 시 결과 반환
				} catch (error: any) {
					lastError = error // 에러 저장
					console.warn(`[Retry] Attempt ${attempt} failed:`, error?.message || error)

					// Retryable error status codes based on Google Vertex AI documentation
					const retryableErrors = new Set([429, 503, 504, 500])
					const isRetryableError = error?.status && retryableErrors.has(error.status)

					const isLastAttempt = attempt === maxRetries - 1

					// Log error details for debugging
					// 더 강력한 오류 처리로 errorBody 파싱
					let errorBody = null
					let retryInfo = null
					let quotaInfo = null

					try {
						// 메시지에서 retryDelay 탐색 (body 파싱이 실패할 경우를 대비)
						if (error?.message && typeof error.message === "string") {
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
								} else if (typeof errorBody === "object" && errorBody !== null) {
									// 단일 객체인 경우
									if (errorBody.error?.details) {
										retryInfo = errorBody.error.details.find((item: any) =>
											item["@type"]?.includes("RetryInfo"),
										)
										quotaInfo = errorBody.error.details.find((item: any) =>
											item["@type"]?.includes("QuotaFailure"),
										)
									}
								}
							} catch (parseError) {
								console.debug("[Retry Debug] Error parsing body as JSON:", parseError)
							}
						}
					} catch (parseError) {
						console.debug("[Retry Debug] Error during response parsing:", parseError)
					}
					const isDailyQuotaError =
						error?.status === 429 &&
						quotaInfo?.violations?.[0]?.quotaMetric ===
							"generativelanguage.googleapis.com/generate_requests_per_model_per_day"

					if (isDailyQuotaError || (!isRetryableError && !retryAllErrors) || isLastAttempt) {
						// 상태 업데이트 로직 추가/수정
						if ((instance as any)._updateState) {
							let apiErrorPayload: { type: string; message: string; status?: number } | null = null
							let sayMessage: string | null = null

							if (isDailyQuotaError) {
								// 일일 할당량 초과 시
								const dailyQuotaErrorMessage =
									"오늘의 구글 무료 할당량을 모두 사용하였습니다. 다른 모델로 변경하거나 유료 결제를 진행 바랍니다."
								apiErrorPayload = {
									type: "dailyQuotaExceeded",
									message: dailyQuotaErrorMessage,
									status: error?.status,
								}
								sayMessage = `🛑 ${dailyQuotaErrorMessage}`
							} else if (isLastAttempt) {
								// 다른 이유로 최종 실패 시 (isLastAttempt가 true일 때)
								const finalErrorMessage = `API 호출 최종 실패 (시도 ${attempt + 1}/${maxRetries}): ${error?.message || "알 수 없는 오류"}`
								apiErrorPayload = {
									type: "finalFailure",
									message: finalErrorMessage,
									status: error?.status,
								}
								sayMessage = `🛑 ${finalErrorMessage}`
							}

							// _updateState 호출 (apiErrorPayload가 설정된 경우)
							if (apiErrorPayload) {
								;(instance as any)._updateState({
									retryStatus: null, // 재시도 상태 초기화
									apiError: apiErrorPayload, // 계산된 에러 정보 전달
								})
							} else {
								// apiErrorPayload가 없는 경우 (예: Non-retryable 에러로 즉시 중단 시 별도 처리가 없다면)
								// 기존처럼 retryStatus만 초기화할 수 있음
								;(instance as any)._updateState({ retryStatus: null })
							}

							// .say() 호출 (sayMessage가 설정된 경우)
							if (sayMessage && (instance as any).say) {
								;(instance as any).say(sayMessage)
							}
						} else {
							console.warn("[Retry] _updateState function not provided to the handler instance on final failure.")
						}
						// 기존 throw error는 그대로 유지하여 재시도 루프를 빠져나감
						throw error
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
							quotaViolation =
								quotaInfo.violations[0].subject || quotaInfo.violations[0].description || "알 수 없는 할당량"
						}
					} else if (error?.status === 503) {
						errorType = "서비스 사용 불가"
					}

<<<<<<< HEAD
					// Try to get delay from RetryInfo in error body
					if (retryInfo?.retryDelay) {
						console.debug(
							"[Retry Debug] Found retryDelay:",
							retryInfo.retryDelay,
							"type:",
							typeof retryInfo.retryDelay,
						)

						// 패턴을 사용하여 숫자와 단위를 추출
						const delayPattern = /(\d+(\.\d+)?)([a-z]+)?/i
						const match = retryInfo.retryDelay.match(delayPattern)

						if (match) {
							const value = parseFloat(match[1])
							const unit = match[3] || "s" // 기본값은 초(s)
							console.debug("[Retry Debug] Parsed delay value:", value, "unit:", unit)

							// 단위에 따라 밀리초로 변환
							switch (unit.toLowerCase()) {
								case "ms":
									delay = value
									break
								case "m":
									delay = value * 60 * 1000 // 분을 밀리초로
									break
								case "h":
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
							delaySeconds: delay / 1000,
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
						retryTimestamp: Date.now() + delay, // 언제 재시도가 발생할지 타임스탬프 저장
						maxRetries, // maxRetries 추가
					}

					// 웹뷰에 표시할 재시도 상태 메시지 생성
					const retryStatusMessage = {
						errorType,
						quotaViolation,
						delayMs: delay,
						startTime: Date.now(),
						attempt: attempt + 1,
						maxRetries,
					}

					console.debug("[Retry Debug] Created retry status message:", retryStatusMessage)

					// Chat 메시지 표시를 위한 시간 계산
					const waitSeconds = Math.round(delay / 1000)
					const retryMessage = `⚠️ ${errorType}. ${attempt + 1}번째 재시도까지 ${waitSeconds}초 대기합니다...`

					// 웹뷰에 메시지 표시 - Controller의 say 메서드 사용
					if ((this as any).say) {
						;(this as any).say(retryMessage, { retryState, retryStatusMessage })
					}

					// ExtensionState의 retryStatus 업데이트
					console.log(`[Retry] Updating state with retryStatus:`, retryState)
					if ((instance as any)._updateState) {
						;(instance as any)._updateState({ retryStatus: retryState }) // <-- 저장된 _updateState 사용
					} else {
						console.warn("[Retry] _updateState function not provided to the handler instance.")
					}

					// API에서 권장하는 시간만큼 정확히 대기
					console.log(`[Retry] ${waitSeconds}초 동안 대기 중...`)
=======
					const handlerInstance = this as any
					if (handlerInstance.options?.onRetryAttempt) {
						try {
							handlerInstance.options.onRetryAttempt(attempt + 1, maxRetries, delay, error)
						} catch (e) {
							console.error("Error in onRetryAttempt callback:", e)
						}
					}

>>>>>>> upstream/main
					await new Promise((resolve) => setTimeout(resolve, delay))
				}
			}
			// 모든 재시도 실패 시 에러 throw 및 retryStatus 초기화
			if (lastError) {
				console.error(`[Retry] API call failed after ${maxRetries} retries. Last error:`, lastError)
				if ((instance as any)._updateState) {
					;(instance as any)._updateState({ retryStatus: null }) // <-- 최종 실패 시 여기서 초기화
				} else {
					console.warn("[Retry] _updateState function not provided to the handler instance on final failure.")
				}
				throw lastError // 최종 에러 throw
			}
		}
	}
}
