var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import OpenAI from "openai";
import { mainlandQwenModels, internationalQwenModels, mainlandQwenDefaultModelId, internationalQwenDefaultModelId, } from "@shared/api";
import { convertToOpenAiMessages } from "../transform/openai-format";
import { convertToR1Format } from "../transform/r1-format";
import { withRetry } from "../retry";
export class QwenHandler {
    options;
    client;
    constructor(options) {
        this.options = options;
        this.client = new OpenAI({
            baseURL: this.options.qwenApiLine === "china"
                ? "https://dashscope.aliyuncs.com/compatible-mode/v1"
                : "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
            apiKey: this.options.qwenApiKey,
        });
    }
    getModel() {
        const modelId = this.options.apiModelId;
        // Branch based on API line to let poor typescript know what to do
        if (this.options.qwenApiLine === "china") {
            return {
                id: modelId ?? mainlandQwenDefaultModelId,
                info: mainlandQwenModels[modelId] ?? mainlandQwenModels[mainlandQwenDefaultModelId],
            };
        }
        else {
            return {
                id: modelId ?? internationalQwenDefaultModelId,
                info: internationalQwenModels[modelId] ??
                    internationalQwenModels[internationalQwenDefaultModelId],
            };
        }
    }
    async *createMessage(systemPrompt, messages) {
        const model = this.getModel();
        const isDeepseekReasoner = model.id.includes("deepseek-r1");
        const isReasoningModelFamily = model.id.includes("qwen3") || ["qwen-plus-latest", "qwen-turbo-latest"].includes(model.id);
        let openAiMessages = [
            { role: "system", content: systemPrompt },
            ...convertToOpenAiMessages(messages),
        ];
        let temperature = 0;
        // Configuration for extended thinking
        const budgetTokens = this.options.thinkingBudgetTokens || 0;
        const reasoningOn = budgetTokens !== 0 ? true : false;
        const thinkingArgs = isReasoningModelFamily
            ? {
                enable_thinking: reasoningOn,
                thinking_budget: reasoningOn ? budgetTokens : undefined,
            }
            : undefined;
        if (isDeepseekReasoner || (reasoningOn && isReasoningModelFamily)) {
            openAiMessages = convertToR1Format([{ role: "user", content: systemPrompt }, ...messages]);
            temperature = undefined;
        }
        const stream = await this.client.chat.completions.create({
            model: model.id,
            max_completion_tokens: model.info.maxTokens,
            messages: openAiMessages,
            stream: true,
            stream_options: { include_usage: true },
            temperature,
            ...thinkingArgs,
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
                yield {
                    type: "usage",
                    inputTokens: chunk.usage.prompt_tokens || 0,
                    outputTokens: chunk.usage.completion_tokens || 0,
                    // @ts-ignore-next-line
                    cacheReadTokens: chunk.usage.prompt_cache_hit_tokens || 0,
                    // @ts-ignore-next-line
                    cacheWriteTokens: chunk.usage.prompt_cache_miss_tokens || 0,
                };
            }
        }
    }
}
__decorate([
    withRetry()
], QwenHandler.prototype, "createMessage", null);
//# sourceMappingURL=qwen.js.map