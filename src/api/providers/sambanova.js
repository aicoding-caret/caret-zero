var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import OpenAI from "openai";
import { withRetry } from "../retry";
import { sambanovaDefaultModelId, sambanovaModels } from "@shared/api";
import { convertToOpenAiMessages } from "@/api/transform/openai-format";
import { convertToR1Format } from "@api/transform/r1-format";
export class SambanovaHandler {
    options;
    client;
    constructor(options) {
        this.options = options;
        this.client = new OpenAI({
            baseURL: "https://api.sambanova.ai/v1",
            apiKey: this.options.sambanovaApiKey,
        });
    }
    async *createMessage(systemPrompt, messages) {
        const model = this.getModel();
        let openAiMessages = [
            { role: "system", content: systemPrompt },
            ...convertToOpenAiMessages(messages),
        ];
        const modelId = model.id.toLowerCase();
        if (modelId.includes("deepseek") || modelId.includes("qwen") || modelId.includes("qwq")) {
            openAiMessages = convertToR1Format([{ role: "user", content: systemPrompt }, ...messages]);
        }
        const stream = await this.client.chat.completions.create({
            model: this.getModel().id,
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
        const modelId = this.options.apiModelId;
        if (modelId && modelId in sambanovaModels) {
            const id = modelId;
            return { id, info: sambanovaModels[id] };
        }
        return {
            id: sambanovaDefaultModelId,
            info: sambanovaModels[sambanovaDefaultModelId],
        };
    }
}
__decorate([
    withRetry()
], SambanovaHandler.prototype, "createMessage", null);
//# sourceMappingURL=sambanova.js.map