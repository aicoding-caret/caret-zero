/*
import Cerebras from "@cerebras/cerebras_cloud_sdk"
import { CompletionParams } from "@cerebras/cerebras_cloud_sdk/types"
import { ApiHandlerOptions, ModelInfo, CerebrasModelId, cerebrasDefaultModelId, cerebrasModels } from "@shared/api"

export class CerebrasApiHandler {
	private options: ApiHandlerOptions
	constructor(options: ApiHandlerOptions) {
		this.options = options
	}
	private getApiKey(): string {
		if (this.options.cerebrasApiKey && this.options.cerebrasApiKey.length > 0) {
			return this.options.cerebrasApiKey
		}
		return ""
	}
	private get a() {
		const cleanApiKey = this.options.cerebrasApiKey?.trim()

		if (!cleanApiKey || !cleanApiKey.length) {
			throw new Error("Cerebras API key is not set.")
		}
		return new Cerebras({
			apiKey: cleanApiKey,
		})
	}
	public async getModels(): Promise<ModelInfo[]> {
		return cerebrasModels
	}
	public async *execute(task: any, modelId?: CerebrasModelId): AsyncGenerator<any> {
		const model = modelId || cerebrasDefaultModelId
		const params: CompletionParams = {
			prompt: task.prompt,
			model,
		}


		const stream = await this.a.completions.create(params)

		for await (const chunk of stream) {
			if (chunk.choices && chunk.choices.length > 0) {
				const content = chunk.choices[0].text
				yield { type: "text", text: content }
					}
				}
			}
}
*/
