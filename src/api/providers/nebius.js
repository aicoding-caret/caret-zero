var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import OpenAI from "openai";
import { withRetry } from "../retry";
import { convertToOpenAiMessages } from "../transform/openai-format";
import { convertToR1Format } from "../transform/r1-format";
import { nebiusDefaultModelId, nebiusModels } from "../../shared/api";
export class NebiusHandler {
    options;
    client;
    constructor(options) {
        this.options = options;
        this.client = new OpenAI({
            baseURL: "https://api.studio.nebius.ai/v1",
            apiKey: this.options.nebiusApiKey,
        });
    }
    async *createMessage(systemPrompt, messages) {
        const model = this.getModel();
        const openAiMessages = model.id.includes("DeepSeek-R1")
            ? convertToR1Format([{ role: "user", content: systemPrompt }, ...messages])
            : [{ role: "system", content: systemPrompt }, ...convertToOpenAiMessages(messages)];
        const stream = await this.client.chat.completions.create({
            model: model.id,
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
        const modelId = this.options.apiModelId;
        if (modelId !== undefined && modelId in nebiusModels) {
            return { id: modelId, info: nebiusModels[modelId] };
        }
        return { id: nebiusDefaultModelId, info: nebiusModels[nebiusDefaultModelId] };
    }
}
__decorate([
    withRetry()
], NebiusHandler.prototype, "createMessage", null);
//# sourceMappingURL=nebius.js.map