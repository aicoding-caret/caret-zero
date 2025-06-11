var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Mistral } from "@mistralai/mistralai";
import { withRetry } from "../retry";
import { mistralDefaultModelId, mistralModels } from "@shared/api";
import { convertToMistralMessages } from "../transform/mistral-format";
export class MistralHandler {
    options;
    client;
    constructor(options) {
        this.options = options;
        this.client = new Mistral({
            apiKey: this.options.mistralApiKey,
        });
    }
    async *createMessage(systemPrompt, messages) {
        const stream = await this.client.chat
            .stream({
            model: this.getModel().id,
            // max_completion_tokens: this.getModel().info.maxTokens,
            temperature: 0,
            messages: [{ role: "system", content: systemPrompt }, ...convertToMistralMessages(messages)],
            stream: true,
        })
            .catch((err) => {
            // The Mistal SDK uses statusCode instead of status
            // However, if they introduce status for something, I don't want to override it
            if ("statusCode" in err && !("status" in err)) {
                err.status = err.statusCode;
            }
            throw err;
        });
        for await (const chunk of stream) {
            const delta = chunk.data.choices[0]?.delta;
            if (delta?.content) {
                let content = "";
                if (typeof delta.content === "string") {
                    content = delta.content;
                }
                else if (Array.isArray(delta.content)) {
                    content = delta.content.map((c) => (c.type === "text" ? c.text : "")).join("");
                }
                yield {
                    type: "text",
                    text: content,
                };
            }
            if (chunk.data.usage) {
                yield {
                    type: "usage",
                    inputTokens: chunk.data.usage.promptTokens || 0,
                    outputTokens: chunk.data.usage.completionTokens || 0,
                };
            }
        }
    }
    getModel() {
        const modelId = this.options.apiModelId;
        if (modelId && modelId in mistralModels) {
            const id = modelId;
            return { id, info: mistralModels[id] };
        }
        return {
            id: mistralDefaultModelId,
            info: mistralModels[mistralDefaultModelId],
        };
    }
}
__decorate([
    withRetry()
], MistralHandler.prototype, "createMessage", null);
//# sourceMappingURL=mistral.js.map