var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import OpenAI from "openai";
import { requestyDefaultModelId, requestyDefaultModelInfo } from "@shared/api";
import { withRetry } from "../retry";
import { convertToOpenAiMessages } from "@api/transform/openai-format";
import { calculateApiCostOpenAI } from "@utils/cost";
export class RequestyHandler {
    options;
    client;
    constructor(options) {
        this.options = options;
        this.client = new OpenAI({
            baseURL: "https://router.requesty.ai/v1",
            apiKey: this.options.requestyApiKey,
            defaultHeaders: {
                "HTTP-Referer": "https://cline.bot",
                "X-Title": "Cline",
            },
        });
    }
    async *createMessage(systemPrompt, messages) {
        const model = this.getModel();
        const openAiMessages = [
            { role: "system", content: systemPrompt },
            ...convertToOpenAiMessages(messages),
        ];
        const reasoningEffort = this.options.reasoningEffort || "medium";
        const reasoning = { reasoning_effort: reasoningEffort };
        const reasoningArgs = model.id.startsWith("openai/o") ? reasoning : {};
        const thinkingBudget = this.options.thinkingBudgetTokens || 0;
        const thinking = thinkingBudget > 0
            ? { thinking: { type: "enabled", budget_tokens: thinkingBudget } }
            : { thinking: { type: "disabled" } };
        const thinkingArgs = model.id.includes("claude-3-7-sonnet") || model.id.includes("claude-sonnet-4") || model.id.includes("claude-opus-4")
            ? thinking
            : {};
        // @ts-ignore-next-line
        const stream = await this.client.chat.completions.create({
            model: model.id,
            max_tokens: model.info.maxTokens || undefined,
            messages: openAiMessages,
            temperature: 0,
            stream: true,
            stream_options: { include_usage: true },
            ...reasoningArgs,
            ...thinkingArgs,
        });
        let lastUsage = undefined;
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
                lastUsage = chunk.usage;
            }
        }
        if (lastUsage) {
            const usage = lastUsage;
            const inputTokens = usage.prompt_tokens || 0;
            const outputTokens = usage.completion_tokens || 0;
            const cacheWriteTokens = usage.prompt_tokens_details?.caching_tokens || undefined;
            const cacheReadTokens = usage.prompt_tokens_details?.cached_tokens || undefined;
            const totalCost = calculateApiCostOpenAI(model.info, inputTokens, outputTokens, cacheWriteTokens, cacheReadTokens);
            yield {
                type: "usage",
                inputTokens: inputTokens,
                outputTokens: outputTokens,
                cacheWriteTokens: cacheWriteTokens,
                cacheReadTokens: cacheReadTokens,
                totalCost: totalCost,
            };
        }
    }
    getModel() {
        const modelId = this.options.requestyModelId;
        const modelInfo = this.options.requestyModelInfo;
        if (modelId && modelInfo) {
            return { id: modelId, info: modelInfo };
        }
        return { id: requestyDefaultModelId, info: requestyDefaultModelInfo };
    }
}
__decorate([
    withRetry()
], RequestyHandler.prototype, "createMessage", null);
//# sourceMappingURL=requesty.js.map