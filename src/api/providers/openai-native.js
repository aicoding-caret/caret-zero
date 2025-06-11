var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import OpenAI from "openai";
import { withRetry } from "../retry";
import { openAiNativeDefaultModelId, openAiNativeModels } from "@shared/api";
import { convertToOpenAiMessages } from "../transform/openai-format";
import { calculateApiCostOpenAI } from "../../utils/cost";
export class OpenAiNativeHandler {
    options;
    client;
    constructor(options) {
        this.options = options;
        this.client = new OpenAI({
            apiKey: this.options.openAiNativeApiKey,
        });
    }
    async *yieldUsage(info, usage) {
        const inputTokens = usage?.prompt_tokens || 0; // sum of cache hits and misses
        const outputTokens = usage?.completion_tokens || 0;
        const cacheReadTokens = usage?.prompt_tokens_details?.cached_tokens || 0;
        const cacheWriteTokens = 0;
        const totalCost = calculateApiCostOpenAI(info, inputTokens, outputTokens, cacheWriteTokens, cacheReadTokens);
        const nonCachedInputTokens = Math.max(0, inputTokens - cacheReadTokens - cacheWriteTokens);
        yield {
            type: "usage",
            inputTokens: nonCachedInputTokens,
            outputTokens: outputTokens,
            cacheWriteTokens: cacheWriteTokens,
            cacheReadTokens: cacheReadTokens,
            totalCost: totalCost,
        };
    }
    async *createMessage(systemPrompt, messages) {
        const model = this.getModel();
        switch (model.id) {
            case "o1":
            case "o1-preview":
            case "o1-mini": {
                // o1 doesn't support streaming, non-1 temp, or system prompt
                const response = await this.client.chat.completions.create({
                    model: model.id,
                    messages: [{ role: "user", content: systemPrompt }, ...convertToOpenAiMessages(messages)],
                });
                yield {
                    type: "text",
                    text: response.choices[0]?.message.content || "",
                };
                yield* this.yieldUsage(model.info, response.usage);
                break;
            }
            case "o4-mini":
            case "o3":
            case "o3-mini": {
                const stream = await this.client.chat.completions.create({
                    model: model.id,
                    messages: [{ role: "developer", content: systemPrompt }, ...convertToOpenAiMessages(messages)],
                    stream: true,
                    stream_options: { include_usage: true },
                    reasoning_effort: this.options.reasoningEffort || "medium",
                });
                for await (const chunk of stream) {
                    const delta = chunk.choices[0]?.delta;
                    if (delta?.content) {
                        yield {
                            type: "text",
                            text: delta.content,
                        };
                    }
                    if (chunk.usage) {
                        // Only last chunk contains usage
                        yield* this.yieldUsage(model.info, chunk.usage);
                    }
                }
                break;
            }
            default: {
                const stream = await this.client.chat.completions.create({
                    model: model.id,
                    // max_completion_tokens: this.getModel().info.maxTokens,
                    temperature: 0,
                    messages: [{ role: "system", content: systemPrompt }, ...convertToOpenAiMessages(messages)],
                    stream: true,
                    stream_options: { include_usage: true },
                });
                for await (const chunk of stream) {
                    const delta = chunk.choices[0]?.delta;
                    if (delta?.content) {
                        yield {
                            type: "text",
                            text: delta.content,
                        };
                    }
                    if (chunk.usage) {
                        // Only last chunk contains usage
                        yield* this.yieldUsage(model.info, chunk.usage);
                    }
                }
            }
        }
    }
    getModel() {
        const modelId = this.options.apiModelId;
        if (modelId && modelId in openAiNativeModels) {
            const id = modelId;
            return { id, info: openAiNativeModels[id] };
        }
        return {
            id: openAiNativeDefaultModelId,
            info: openAiNativeModels[openAiNativeDefaultModelId],
        };
    }
}
__decorate([
    withRetry()
], OpenAiNativeHandler.prototype, "createMessage", null);
//# sourceMappingURL=openai-native.js.map