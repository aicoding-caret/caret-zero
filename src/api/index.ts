import { Anthropic } from "@anthropic-ai/sdk"
import { ApiConfiguration, ModelInfo } from "../shared/api"
import { AnthropicHandler } from "./providers/anthropic"
import { AwsBedrockHandler } from "./providers/bedrock"
import { OpenRouterHandler } from "./providers/openrouter"
import { VertexHandler } from "./providers/vertex"
import { OpenAiHandler } from "./providers/openai"
import { OllamaHandler } from "./providers/ollama"
import { LmStudioHandler } from "./providers/lmstudio"
import { GeminiHandler } from "./providers/gemini"
import { OpenAiNativeHandler } from "./providers/openai-native"
import { ApiStream, ApiStreamUsageChunk } from "./transform/stream"
import { DeepSeekHandler } from "./providers/deepseek"
import { RequestyHandler } from "./providers/requesty"
import { TogetherHandler } from "./providers/together"
import { QwenHandler } from "./providers/qwen"
import { MistralHandler } from "./providers/mistral"
import { DoubaoHandler } from "./providers/doubao"
import { VsCodeLmHandler } from "./providers/vscode-lm"
import { CaretHandler } from "./providers/caret"
import { LiteLlmHandler } from "./providers/litellm"
import { FireworksHandler } from "./providers/fireworks"
import { AskSageHandler } from "./providers/asksage"
import { XAIHandler } from "./providers/xai"
import { SambanovaHandler } from "./providers/sambanova"
import { HyperClovaXHandler } from "./providers/hyperclovax" // Import the new handler
import { ExtensionState } from "../shared/ExtensionMessage"

export interface ApiHandler {
	createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream
	getModel(): { id: string; info: ModelInfo }
	getApiStreamUsage?(): Promise<ApiStreamUsageChunk | undefined>
}

export interface SingleCompletionHandler {
	completePrompt(prompt: string): Promise<string>
}

export interface ApiHandlerOptions {
	provider: string
	[options: string]: any
}

export function buildApiHandler(
	options: ApiHandlerOptions,
	updateStateCallback: (state: Partial<ExtensionState>) => void,
): ApiHandler {
	const { provider, ...optionsWithoutProvider } = options
	switch (provider) {
		case "anthropic":
			return new AnthropicHandler(optionsWithoutProvider)
		case "openrouter":
			return new OpenRouterHandler(optionsWithoutProvider)
		case "bedrock":
			return new AwsBedrockHandler(optionsWithoutProvider)
		case "vertex":
			return new VertexHandler(optionsWithoutProvider)
		case "openai":
			return new OpenAiHandler(optionsWithoutProvider)
		case "ollama":
			return new OllamaHandler(optionsWithoutProvider)
		case "lmstudio":
			return new LmStudioHandler(optionsWithoutProvider)
		case "gemini":
			return new GeminiHandler(optionsWithoutProvider, updateStateCallback)
		case "openai-native":
			return new OpenAiNativeHandler(optionsWithoutProvider)
		case "deepseek":
			return new DeepSeekHandler(optionsWithoutProvider)
		case "requesty":
			return new RequestyHandler(optionsWithoutProvider)
		case "fireworks":
			return new FireworksHandler(optionsWithoutProvider)
		case "together":
			return new TogetherHandler(optionsWithoutProvider)
		case "qwen":
			return new QwenHandler(optionsWithoutProvider)
		case "doubao":
			return new DoubaoHandler(optionsWithoutProvider)
		case "mistral":
			return new MistralHandler(optionsWithoutProvider)
		case "vscode-lm":
			return new VsCodeLmHandler(optionsWithoutProvider)
		case "caret":
			return new CaretHandler(optionsWithoutProvider)
		case "litellm":
			return new LiteLlmHandler(optionsWithoutProvider)
		case "asksage":
			return new AskSageHandler(optionsWithoutProvider)
		case "xai":
			return new XAIHandler(optionsWithoutProvider)
		case "sambanova":
			return new SambanovaHandler(optionsWithoutProvider)
		case "hyperclovax-local": // Add case for the new provider
			return new HyperClovaXHandler(optionsWithoutProvider)
		default:
			return new AnthropicHandler(optionsWithoutProvider)
	}
}
