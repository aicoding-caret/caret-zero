import { GoogleGenerativeAI } from "@google/generative-ai"
import { withRetry } from "../retry"
import { ApiHandler } from "../"
import { ApiHandlerOptions, geminiDefaultModelId, GeminiModelId, geminiModels, ModelInfo } from "../../shared/api"
import { convertAnthropicMessageToGemini } from "../transform/gemini-format"
import { ApiStream } from "../transform/stream"
import { ExtensionState } from "../../shared/ExtensionMessage"

export class GeminiHandler implements ApiHandler {
	private options: ApiHandlerOptions
	private client: GoogleGenerativeAI
	private _updateState?: (state: Partial<ExtensionState>) => void

	constructor(options: ApiHandlerOptions, updateState?: (state: Partial<ExtensionState>) => void) {
		if (!options.geminiApiKey) {
			throw new Error("API key is required for Google Gemini")
		}
		this.options = options
		this.client = new GoogleGenerativeAI(options.geminiApiKey)
		this._updateState = updateState
	}

	@withRetry({
		baseDelay: 2_000, // 초기 대기 시간을 2초로 설정
		onRetry: (error: any, attempt: number, delay: number) => {
			// 에러 본문 파싱
			let errorBody
			try {
				errorBody = error?.body ? JSON.parse(error.body) : null
			} catch (e) {
				console.debug("[Gemini Debug] Failed to parse error body:", error?.body)
				errorBody = null
			}

			// 할당량 정보 확인
			const quotaInfo = errorBody?.find((item: any) => item["@type"]?.includes("QuotaFailure"))
			const quotaViolation = quotaInfo?.violations?.[0]

			// 에러 타입 결정
			const getErrorMessage = (error: any) => {
				if (error?.status === 429 && quotaViolation) {
					return `할당량 초과 (${quotaViolation.quotaMetric})`
				}

				switch (error?.status) {
					case 429:
						return "할당량 초과"
					case 503:
						return "서비스 불가"
					case 504:
						return "시간 초과"
					case 500:
						return "내부 서버 오류"
					default:
						return "API 오류"
				}
			}

			// 디버그 정보 로깅
			console.debug("[Gemini Debug] Retry details:", {
				status: error?.status,
				message: error?.message,
				quotaInfo: quotaViolation,
				attempt,
				delay,
			})

			// 사용자 메시지 출력
			const errorType = getErrorMessage(error)
			const message = `${errorType}. ${attempt}번째 재시도 중... (${Math.round(delay / 1000)}초 후)`
			console.warn(message)
		},
	})
	async *createMessage(systemPrompt: string, messages: any[]): ApiStream {
		const model = this.client.getGenerativeModel({
			model: this.getModel().id,
			systemInstruction: systemPrompt,
		})
		const result = await model.generateContentStream({
			contents: messages.map(convertAnthropicMessageToGemini),
			generationConfig: {
				// maxOutputTokens: this.getModel().info.maxTokens,
				temperature: 0,
			},
		})

		for await (const chunk of result.stream) {
			yield {
				type: "text",
				text: chunk.text(),
			}
		}

		const response = await result.response
		yield {
			type: "usage",
			inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
			outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
		}
	}

	getModel(): { id: GeminiModelId; info: ModelInfo } {
		const modelId = this.options.apiModelId
		if (modelId && modelId in geminiModels) {
			const id = modelId as GeminiModelId
			return { id, info: geminiModels[id] }
		}
		return {
			id: geminiDefaultModelId,
			info: geminiModels[geminiDefaultModelId],
		}
	}
}
