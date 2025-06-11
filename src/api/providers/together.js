var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import OpenAI from "openai";
import { withRetry } from "../retry";
import { openAiModelInfoSaneDefaults } from "@shared/api";
import { convertToOpenAiMessages } from "@api/transform/openai-format";
import { convertToR1Format } from "@api/transform/r1-format";
export class TogetherHandler {
    options;
    client;
    constructor(options) {
        this.options = options;
        this.client = new OpenAI({
            baseURL: "https://api.together.xyz/v1",
            apiKey: this.options.togetherApiKey,
        });
    }
    async *createMessage(systemPrompt, messages) {
        const modelId = this.options.togetherModelId ?? "";
        const isDeepseekReasoner = modelId.includes("deepseek-reasoner");
        let openAiMessages = [
            { role: "system", content: systemPrompt },
            ...convertToOpenAiMessages(messages),
        ];
        if (isDeepseekReasoner) {
            openAiMessages = convertToR1Format([{ role: "user", content: systemPrompt }, ...messages]);
        }
        const stream = await this.client.chat.completions.create({
            model: modelId,
            messages: openAiMessages,
            temperature: 0,
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
                };
            }
        }
    }
    getModel() {
        return {
            id: this.options.togetherModelId ?? "",
            info: openAiModelInfoSaneDefaults,
        };
    }
}
__decorate([
    withRetry()
], TogetherHandler.prototype, "createMessage", null);
//# sourceMappingURL=together.js.map