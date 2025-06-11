/*
import { withRetry } from "../retry"
import { nebiusDefaultModelId, nebiusModels, type ModelInfo, type ApiHandlerOptions, type NebiusModelId } from "../../shared/api"
import type { ApiHandler, ApiStream } from "@shared/api"

export class NebiusApiHandler implements ApiHandler {
	private options: ApiHandlerOptions
	private apiKey: string
	private iamToken?: string
	private iamTokenExpiresAt?: Date

	constructor(options: ApiHandlerOptions) {
		this.options = options
		this.apiKey = this.options.nebiusApiKey
	}
	private async getIamToken(): Promise<string> {
		if (this.iamToken && this.iamTokenExpiresAt && this.iamTokenExpiresAt > new Date()) {
			return this.iamToken
		}

		const response = await fetch("https://iam.api.cloud.yandex.net/iam/v1/tokens", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				yandexPassportOauthToken: this.apiKey,
			}),
		})

		const data = await response.json()
		if (!response.ok) {
			throw new Error(`Failed to get IAM token: ${data.message}`)
		}

		this.iamToken = data.iamToken
		this.iamTokenExpiresAt = new Date(data.expiresAt)

		return this.iamToken
	}

	@withRetry()
	async *createMessage(systemPrompt: string, messages: any[]): ApiStream {
		const iamToken = await this.getIamToken()
		const modelId = this.options.apiModelId || nebiusDefaultModelId
		const modelUri = `gpt://${this.options.nebiusFolderId}/${modelId}`

		const response = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${iamToken}`,
				"x-folder-id": this.options.nebiusFolderId,
			},
			body: JSON.stringify({
				modelUri,
				completionOptions: {
					stream: false,
					temperature: this.options.temperature,
					maxTokens: this.options.maxTokens,
				},
				messages: [
					{
						role: "system",
						text: systemPrompt,
					},
					...messages,
				],
			}),
		})

		const data = await response.json()
		if (!response.ok) {
			throw new Error(`Nebius API Error: ${data.message}`)
		}

		const alternatives = data.result.alternatives
		if (alternatives && alternatives.length > 0) {
			const content = alternatives[0].message.text
			yield { type: "text", text: content }
				}
			}

	async getModels(): Promise<ModelInfo[]> {
		return Object.values(nebiusModels)
	}

	getModel(): ModelInfo {
		const modelId = this.options.apiModelId as NebiusModelId
		if (modelId && nebiusModels[modelId]) {
			return nebiusModels[modelId]
		}
		return nebiusModels[nebiusDefaultModelId]
	}
}
*/
