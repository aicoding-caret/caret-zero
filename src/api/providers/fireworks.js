var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import OpenAI from "openai";
import { withRetry } from "../retry";
import { openAiModelInfoSaneDefaults, } from "../../shared/api";
import { convertToOpenAiMessages } from "../transform/openai-format";
export class FireworksHandler {
    options;
    client;
    constructor(options) {
        this.options = options;
        this.client = new OpenAI({
            baseURL: "https://api.fireworks.ai/inference/v1",
            apiKey: this.options.fireworksApiKey,
        });
    }
    async *createMessage(systemPrompt, messages) {
        const modelId = this.options.fireworksModelId ?? "";
        const openAiMessages = [
            { role: "system", content: systemPrompt },
            ...convertToOpenAiMessages(messages),
        ];
        const stream = await this.client.chat.completions.create({
            model: modelId,
            ...(this.options.fireworksModelMaxCompletionTokens
                ? { max_completion_tokens: this.options.fireworksModelMaxCompletionTokens }
                : {}),
            ...(this.options.fireworksModelMaxTokens ? { max_tokens: this.options.fireworksModelMaxTokens } : {}),
            messages: openAiMessages,
            stream: true,
            stream_options: { include_usage: true },
            temperature: 0,
        });
        let reasoning = null;
        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            if (reasoning || delta?.content?.includes("<think>")) {
                reasoning = (reasoning || "") + (delta.content ?? "");
            }
            if (delta?.content && !reasoning) {
                yield {
                    type: "text",
                    text: delta.content,
                };
            }
            if (reasoning || ("reasoning_content" in delta && delta.reasoning_content)) {
                yield {
                    type: "reasoning",
                    reasoning: delta.content || delta.reasoning_content || "",
                };
                if (reasoning?.includes("</think>")) {
                    // Reset so the next chunk is regular content
                    reasoning = null;
                }
            }
            if (chunk.usage) {
                yield {
                    type: "usage",
                    inputTokens: chunk.usage.prompt_tokens || 0, // (deepseek reports total input AND cache reads/writes, see context caching: https://api-docs.deepseek.com/guides/kv_cache) where the input tokens is the sum of the cache hits/misses, while anthropic reports them as separate tokens. This is important to know for 1) context management truncation algorithm, and 2) cost calculation (NOTE: we report both input and cache stats but for now set input price to 0 since all the cost calculation will be done using cache hits/misses)
                    outputTokens: chunk.usage.completion_tokens || 0,
                    // @ts-ignore-next-line
                    cacheReadTokens: chunk.usage.prompt_cache_hit_tokens || 0,
                    // @ts-ignore-next-line
                    cacheWriteTokens: chunk.usage.prompt_cache_miss_tokens || 0,
                };
            }
        }
    }
    getModel() {
        return {
            id: this.options.fireworksModelId ?? "",
            info: openAiModelInfoSaneDefaults,
        };
    }
}
__decorate([
    withRetry()
], FireworksHandler.prototype, "createMessage", null);
//# sourceMappingURL=fireworks.js.map