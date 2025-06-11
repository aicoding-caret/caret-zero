var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import OpenAI from "openai";
import { liteLlmDefaultModelId, liteLlmModelInfoSaneDefaults } from "@shared/api";
import { convertToOpenAiMessages } from "../transform/openai-format";
import { withRetry } from "../retry";
export class LiteLlmHandler {
    options;
    client;
    constructor(options) {
        this.options = options;
        this.client = new OpenAI({
            baseURL: this.options.liteLlmBaseUrl || "http://localhost:4000",
            apiKey: this.options.liteLlmApiKey || "noop",
        });
    }
    async calculateCost(prompt_tokens, completion_tokens) {
        // Reference: https://github.com/BerriAI/litellm/blob/122ee634f434014267af104814022af1d9a0882f/litellm/proxy/spend_tracking/spend_management_endpoints.py#L1473
        const modelId = this.options.liteLlmModelId || liteLlmDefaultModelId;
        try {
            const response = await fetch(`${this.client.baseURL}/spend/calculate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.options.liteLlmApiKey}`,
                },
                body: JSON.stringify({
                    completion_response: {
                        model: modelId,
                        usage: {
                            prompt_tokens,
                            completion_tokens,
                        },
                    },
                }),
            });
            if (response.ok) {
                const data = await response.json();
                return data.cost;
            }
            else {
                console.error("Error calculating spend:", response.statusText);
                return undefined;
            }
        }
        catch (error) {
            console.error("Error calculating spend:", error);
            return undefined;
        }
    }
    async *createMessage(systemPrompt, messages) {
        const formattedMessages = convertToOpenAiMessages(messages);
        const systemMessage = {
            role: "system",
            content: systemPrompt,
        };
        const modelId = this.options.liteLlmModelId || liteLlmDefaultModelId;
        const isOminiModel = modelId.includes("o1-mini") || modelId.includes("o3-mini") || modelId.includes("o4-mini");
        // Configuration for extended thinking
        const budgetTokens = this.options.thinkingBudgetTokens || 0;
        const reasoningOn = budgetTokens !== 0 ? true : false;
        const thinkingConfig = reasoningOn ? { type: "enabled", budget_tokens: budgetTokens } : undefined;
        let temperature = this.options.liteLlmModelInfo?.temperature ?? 0;
        if (isOminiModel && reasoningOn) {
            temperature = undefined; // Thinking mode doesn't support temperature
        }
        // Define cache control object if prompt caching is enabled
        const cacheControl = this.options.liteLlmUsePromptCache ? { cache_control: { type: "ephemeral" } } : undefined;
        // Add cache_control to system message if enabled
        const enhancedSystemMessage = {
            ...systemMessage,
            ...(cacheControl && cacheControl),
        };
        // Find the last two user messages to apply caching
        const userMsgIndices = formattedMessages.reduce((acc, msg, index) => (msg.role === "user" ? [...acc, index] : acc), []);
        const lastUserMsgIndex = userMsgIndices[userMsgIndices.length - 1] ?? -1;
        const secondLastUserMsgIndex = userMsgIndices[userMsgIndices.length - 2] ?? -1;
        // Apply cache_control to the last two user messages if enabled
        const enhancedMessages = formattedMessages.map((message, index) => {
            if ((index === lastUserMsgIndex || index === secondLastUserMsgIndex) && cacheControl) {
                return {
                    ...message,
                    ...cacheControl,
                };
            }
            return message;
        });
        const stream = await this.client.chat.completions.create({
            model: this.options.liteLlmModelId || liteLlmDefaultModelId,
            messages: [enhancedSystemMessage, ...enhancedMessages],
            temperature,
            stream: true,
            stream_options: { include_usage: true },
            ...(thinkingConfig && { thinking: thinkingConfig }), // Add thinking configuration when applicable
        });
        const inputCost = (await this.calculateCost(1e6, 0)) || 0;
        const outputCost = (await this.calculateCost(0, 1e6)) || 0;
        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            // Handle normal text content
            if (delta?.content) {
                yield {
                    type: "text",
                    text: delta.content,
                };
            }
            if (delta?.thinking) {
                yield {
                    type: "reasoning",
                    reasoning: delta.thinking || "",
                };
            }
            // Handle token usage information
            if (chunk.usage) {
                const totalCost = (inputCost * chunk.usage.prompt_tokens) / 1e6 + (outputCost * chunk.usage.completion_tokens) / 1e6;
                // Extract cache-related information if available
                // Need to use type assertion since these properties are not in the standard OpenAI types
                const usage = chunk.usage;
                const cacheWriteTokens = usage.cache_creation_input_tokens || usage.prompt_cache_miss_tokens || 0;
                const cacheReadTokens = usage.cache_read_input_tokens || usage.prompt_cache_hit_tokens || 0;
                yield {
                    type: "usage",
                    inputTokens: usage.prompt_tokens || 0,
                    outputTokens: usage.completion_tokens || 0,
                    cacheWriteTokens: cacheWriteTokens > 0 ? cacheWriteTokens : undefined,
                    cacheReadTokens: cacheReadTokens > 0 ? cacheReadTokens : undefined,
                    totalCost,
                };
            }
        }
    }
    getModel() {
        return {
            id: this.options.liteLlmModelId || liteLlmDefaultModelId,
            info: this.options.liteLlmModelInfo || liteLlmModelInfoSaneDefaults,
        };
    }
}
__decorate([
    withRetry()
], LiteLlmHandler.prototype, "createMessage", null);
//# sourceMappingURL=litellm.js.map