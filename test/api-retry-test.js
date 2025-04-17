// API 재시도 로직 테스트
// 이 테스트는 API 호출 실패 시 재시도 메커니즘이 올바르게 작동하는지 검증합니다.

const assert = require("assert")
const path = require("path")

// 실제 컨트롤러, API 핸들러 등을 가져오는 대신 모의 객체 사용
class MockController {
	constructor() {
		this.messages = []
		this.logger = {
			log: (msg) => console.log(`[LOG] ${msg}`),
			debug: (msg) => console.log(`[DEBUG] ${msg}`),
			error: (msg) => console.log(`[ERROR] ${msg}`),
		}
	}

	postMessageToWebview(message) {
		console.log(`[Controller] 웹뷰로 메시지 전송: ${JSON.stringify(message)}`)
		this.messages.push(message)
		return true
	}

	say(message, options) {
		console.log(`[Controller] say: ${message}`, options || "")
		return true
	}
}

// 재시도 가능한 API 호출을 시뮬레이션하는 함수
async function* simulateApiCallWithRetry(controller, simulateError = true, errorStatus = 429) {
	if (simulateError) {
		// 에러 응답 시뮬레이션
		const errorBody =
			errorStatus === 429
				? JSON.stringify([
						{ "@type": "google.rpc.RetryInfo", retryDelay: "3s" },
						{ "@type": "google.rpc.QuotaFailure", violations: [{ quotaMetric: "Requests" }] },
					])
				: JSON.stringify([{ "@type": "google.rpc.RetryInfo", retryDelay: "2s" }])

		throw {
			status: errorStatus,
			message: `[GoogleGenerativeAI Error]: Error fetching from API with status ${errorStatus}`,
			body: errorBody,
		}
	}

	// 정상 응답 시뮬레이션
	yield "테스트 응답입니다."
}

// 재시도 로직 데코레이터 정의 (실제 retry.ts에서 가져온 코드와 유사하게 구현)
function withRetry(options = {}) {
	const maxRetries = options.maxRetries || 3
	const baseDelay = options.baseDelay || 1000
	const maxDelay = options.maxDelay || 10000
	const retryAllErrors = options.retryAllErrors || false
	const onRetry = options.onRetry

	return function (_target, _propertyKey, descriptor) {
		const originalMethod = descriptor.value

		descriptor.value = async function* (...args) {
			for (let attempt = 0; attempt < maxRetries; attempt++) {
				try {
					yield* originalMethod.apply(this, args)
					return
				} catch (error) {
					// Retryable error status codes
					const retryableErrors = new Set([429, 503, 504, 500])
					const isRetryableError = error?.status && retryableErrors.has(error.status)
					const isLastAttempt = attempt === maxRetries - 1

					if ((!isRetryableError && !retryAllErrors) || isLastAttempt) {
						throw error
					}

					// Parse error body
					const errorBody = error?.body ? JSON.parse(error.body) : null
					const retryInfo = errorBody?.find((item) => item["@type"]?.includes("RetryInfo"))
					const quotaInfo = errorBody?.find((item) => item["@type"]?.includes("QuotaFailure"))

					console.log("[TEST] 에러 정보:", {
						status: error?.status,
						message: error?.message,
						retryDelay: retryInfo?.retryDelay,
						quotaInfo: quotaInfo?.violations,
					})

					// 지연 시간 계산
					let delay = baseDelay * Math.pow(2, attempt)
					let errorType = "API 오류"

					// RetryInfo에서 지연 시간 추출
					if (retryInfo?.retryDelay) {
						const delayPattern = /(\d+(\.\d+)?)([a-z]+)?/i
						const match = retryInfo.retryDelay.match(delayPattern)

						if (match) {
							const value = parseFloat(match[1])
							const unit = match[3] || "s"

							switch (unit.toLowerCase()) {
								case "ms":
									delay = value
									break
								case "m":
									delay = value * 60 * 1000
									break
								case "h":
									delay = value * 60 * 60 * 1000
									break
								default:
									delay = value * 1000
							}
						}

						delay += 1000 // 1초 버퍼 추가
					}

					// 에러 유형 설정
					if (error?.status === 429) {
						errorType = `할당량 초과 ${quotaInfo ? `(${quotaInfo.violations?.[0]?.quotaMetric || ""})` : ""}`
					} else if (error?.status === 503) {
						errorType = "서비스 불가"
					} else if (error?.status === 504) {
						errorType = "시간 초과"
					} else if (error?.status === 500) {
						errorType = "내부 서버 오류"
					}

					// 재시도 상태 정보
					const retryState = {
						status: error?.status,
						errorType,
						attempt: attempt + 1,
						delay,
						quotaViolation: quotaInfo?.violations?.[0]?.quotaMetric,
						retryTimestamp: Date.now() + delay,
					}

					console.log(`[TEST] ${attempt + 1}번째 재시도 예정, ${delay}ms 후`)

					// Controller 메서드 호출 (있는 경우)
					if (this.controller && typeof this.controller.postMessageToWebview === "function") {
						this.controller.postMessageToWebview({
							type: "retryStatus",
							retryState,
						})
					}

					if (this.say) {
						const waitSeconds = Math.round(delay / 1000)
						this.say(`⚠️ ${errorType}. ${attempt + 1}번째 재시도까지 ${waitSeconds}초 대기합니다...`, { retryState })
					}

					// 콜백 호출
					if (onRetry) {
						onRetry(error, attempt + 1, delay)
					}

					// 지연 시간만큼 대기 (테스트에서는 시간을 단축)
					const testDelay = Math.min(300, delay) // 테스트에서는 최대 300ms만 대기
					await new Promise((resolve) => setTimeout(resolve, testDelay))
				}
			}
		}

		return descriptor
	}
}

// API 호출 래퍼 클래스
class ApiClient {
	constructor(controller) {
		this.controller = controller
	}

	async *callApi(simulateError = true, errorStatus = 429) {
		// 데코레이터 대신 withRetry 함수를 직접 적용
		const options = {
			maxRetries: 3,
			baseDelay: 1000,
			onRetry: (error, attempt, delay) => {
				console.log(`[TEST] 재시도 콜백: 시도 ${attempt}, 지연 ${delay}ms`)
			},
		}

		// withRetry 함수 적용
		const descriptor = {
			value: async function* () {
				yield* simulateApiCallWithRetry(this.controller, simulateError, errorStatus)
			},
		}

		// withRetry 함수 호출하여 descriptor 수정
		const wrappedDescriptor = withRetry(options)({}, "callApi", descriptor)

		// 래핑된 함수 호출
		yield* wrappedDescriptor.value.call(this)
	}

	async testApiCall(simulateError = true, errorStatus = 429) {
		let result = ""
		try {
			for await (const chunk of this.callApi(simulateError, errorStatus)) {
				result += chunk
			}
			return { success: true, result }
		} catch (error) {
			return { success: false, error }
		}
	}
}

// 테스트 실행 함수
async function runTests() {
	console.log("==== API 재시도 로직 테스트 시작 ====")

	// 테스트 1: 할당량 초과 에러(429)로 재시도 테스트
	console.log("\n[테스트 1] 할당량 초과 에러(429)로 재시도")
	const controller1 = new MockController()
	const apiClient1 = new ApiClient(controller1)

	const result1 = await apiClient1.testApiCall(true, 429)
	assert(!result1.success, "에러가 발생해야 함")
	assert(controller1.messages.length > 0, "에러 메시지가 웹뷰로 전송되어야 함")
	assert(
		controller1.messages.some((m) => m.type === "retryStatus"),
		"retryStatus 메시지가 있어야 함",
	)
	console.log("[테스트 1] 통과")

	// 테스트 2: 서비스 불가 에러(503)로 재시도 테스트
	console.log("\n[테스트 2] 서비스 불가 에러(503)로 재시도")
	const controller2 = new MockController()
	const apiClient2 = new ApiClient(controller2)

	const result2 = await apiClient2.testApiCall(true, 503)
	assert(!result2.success, "에러가 발생해야 함")
	assert(
		controller2.messages.some((m) => m.type === "retryStatus" && m.retryState.status === 503),
		"503 에러 상태가 전송되어야 함",
	)
	console.log("[테스트 2] 통과")

	// 테스트 3: 성공 케이스
	console.log("\n[테스트 3] 성공 케이스")
	const controller3 = new MockController()
	const apiClient3 = new ApiClient(controller3)

	const result3 = await apiClient3.testApiCall(false)
	assert(result3.success, "성공해야 함")
	assert(result3.result === "테스트 응답입니다.", "올바른 결과가 반환되어야 함")
	console.log("[테스트 3] 통과")

	console.log("\n==== 모든 테스트 통과 ====")
}

// 테스트 실행
runTests().catch((error) => {
	console.error("테스트 실패:", error)
	process.exit(1)
})
