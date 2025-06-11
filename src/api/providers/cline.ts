/*
import { ApiHandler, ApiHandlerOptions, ApiStream, ModelInfo, DefaultApi, defaultApi } from "@shared/api"
import { withRetry } from "../retry"

export class ClineApiHandler implements ApiHandler {
	private options: ApiHandlerOptions

	constructor(options: ApiHandlerOptions) {
		this.options = options
	}

	async *createMessage(systemPrompt: string, messages: any[]): ApiStream {
		const defaultAPI = this.options.defaultAPI || defaultApi
		const isDefaultOrOpenRouter = defaultAPI === DefaultApi.OpenRouter || defaultAPI === DefaultApi.Default
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		}
		if (isDefaultOrOpenRouter) {
			headers["HTTP-Referer"] = "https://caret.io"
			headers["X-Title"] = "Caret"
		}
		if (this.options.customCodyCompletionsUrl) {
			headers["X-Caret-Request-Id"] = this.options.requestId ?? ""
			headers["X-Caret-Session-Id"] = this.options.sessionId ?? ""
			headers["X-Caret-Version"] = this.options.version ?? ""
		} else {
			const token = this.options.customToken
			if (token) {
				headers.Authorization = `Bearer ${token}`
			}
		}

		const requestBody = {
			model: this.options.apiModelId,
			messages: [
				{
					role: "system",
					content: systemPrompt,
				},
				...messages,
			],
			stream: true,
		}

		const url = this.options.customCodyCompletionsUrl ?? "https://api.openai.com/v1/chat/completions"

		try {
			const response = await fetch(url, {
				method: "POST",
				headers,
				body: JSON.stringify(requestBody),
			})

			if (!response.body) {
				throw new Error("Response body is null")
			}

			const reader = response.body.getReader()
			const decoder = new TextDecoder()
			let buffer = ""

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				buffer += decoder.decode(value, { stream: true })
				const lines = buffer.split("\n")
				buffer = lines.pop() ?? ""

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const jsonStr = line.substring(6)
						if (jsonStr === "[DONE]") {
							return
						}
						try {
							const chunk = JSON.parse(jsonStr)
							if (chunk.choices && chunk.choices[0].delta) {
				yield {
					type: "text",
									text: chunk.choices[0].delta.content,
				}
			}
						} catch (e) {
							console.error("Error parsing JSON chunk:", e)
						}
					}
				}
			}
		} catch (error) {
			console.error("Error in createMessage:", error)
			throw error
			}
		}

	@withRetry()
	async getModels(): Promise<ModelInfo[]> {
		const headers: Record<string, string> = {
						Authorization: `Bearer ${this.options.clineApiKey}`,
			"Content-Type": "application/json",
		}
		const response = await fetch("https://api.openai.com/v1/models", { headers })
		const data = await response.json()
		return data.data.map((model: any) => ({ id: model.id, ...model }))
	}

	getModel(): ModelInfo {
		return {
			id: this.options.apiModelId,
		} as ModelInfo
	}
}
*/
