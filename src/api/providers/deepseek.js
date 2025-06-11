var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import OpenAI from "openai";
import { withRetry } from "../retry";
import { deepSeekDefaultModelId, deepSeekModels } from "@shared/api";
import { calculateApiCostOpenAI } from "../../utils/cost";
import { convertToOpenAiMessages } from "../transform/openai-format";
import { convertToR1Format } from "../transform/r1-format";
export class DeepSeekHandler {
    options;
    client;
    constructor(options) {
        this.options = options;
        this.client = new OpenAI({
            baseURL: "https://api.deepseek.com/v1",
            apiKey: this.options.deepSeekApiKey,
        });
    }
    async *yieldUsage(info, usage) {
        // Deepseek reports total input AND cache reads/writes,
        // see context caching: https://api-docs.deepseek.com/guides/kv_cache)
        // where the input tokens is the sum of the cache hits/misses, just like OpenAI.
        // This affects:
        // 1) context management truncation algorithm, and
        // 2) cost calculation
        const deepUsage = usage;
        const inputTokens = deepUsage?.prompt_tokens || 0; // sum of cache hits and misses
        const outputTokens = deepUsage?.completion_tokens || 0;
        const cacheReadTokens = deepUsage?.prompt_cache_hit_tokens || 0;
        const cacheWriteTokens = deepUsage?.prompt_cache_miss_tokens || 0;
        const totalCost = calculateApiCostOpenAI(info, inputTokens, outputTokens, cacheWriteTokens, cacheReadTokens);
        const nonCachedInputTokens = Math.max(0, inputTokens - cacheReadTokens - cacheWriteTokens); // this will always be 0
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
        const isDeepseekReasoner = model.id.includes("deepseek-reasoner");
        let openAiMessages = [
            { role: "system", content: systemPrompt },
            ...convertToOpenAiMessages(messages),
        ];
        if (isDeepseekReasoner) {
            openAiMessages = convertToR1Format([{ role: "user", content: systemPrompt }, ...messages]);
        }
        const stream = await this.client.chat.completions.create({
            model: model.id,
            max_completion_tokens: model.info.maxTokens,
            messages: openAiMessages,
            stream: true,
            stream_options: { include_usage: true },
            // Only set temperature for non-reasoner models
            ...(model.id === "deepseek-reasoner" ? {} : { temperature: 0 }),
        });
        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            if (delta?.content) {
                yield {
                    type: "text",
                    text: delta.content,
                };
            }
            if (delta && "reasoning_content" in delta && delta.reasoning_content) {
                yield {
                    type: "reasoning",
                    reasoning: delta.reasoning_content || "",
                };
            }
            if (chunk.usage) {
                yield* this.yieldUsage(model.info, chunk.usage);
            }
        }
    }
    getModel() {
        const modelId = this.options.apiModelId;
        if (modelId && modelId in deepSeekModels) {
            const id = modelId;
            return { id, info: deepSeekModels[id] };
        }
        return {
            id: deepSeekDefaultModelId,
            info: deepSeekModels[deepSeekDefaultModelId],
        };
    }
}
__decorate([
    withRetry()
], DeepSeekHandler.prototype, "createMessage", null);
//# sourceMappingURL=deepseek.js.map