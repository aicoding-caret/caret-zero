var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import OpenAI from "openai";
import { openAiModelInfoSaneDefaults } from "@shared/api";
import { convertToOpenAiMessages } from "../transform/openai-format";
import { withRetry } from "../retry";
export class LmStudioHandler {
    options;
    client;
    constructor(options) {
        this.options = options;
        this.client = new OpenAI({
            baseURL: (this.options.lmStudioBaseUrl || "http://localhost:1234") + "/v1",
            apiKey: "noop",
        });
    }
    async *createMessage(systemPrompt, messages) {
        const openAiMessages = [
            { role: "system", content: systemPrompt },
            ...convertToOpenAiMessages(messages),
        ];
        try {
            const stream = await this.client.chat.completions.create({
                model: this.getModel().id,
                messages: openAiMessages,
                stream: true,
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
            }
        }
        catch (error) {
            // LM Studio doesn't return an error code/body for now
            throw new Error("Please check the LM Studio developer logs to debug what went wrong. You may need to load the model with a larger context length to work with Cline's prompts.");
        }
    }
    getModel() {
        return {
            id: this.options.lmStudioModelId || "",
            info: openAiModelInfoSaneDefaults,
        };
    }
}
__decorate([
    withRetry({ retryAllErrors: true })
], LmStudioHandler.prototype, "createMessage", null);
//# sourceMappingURL=lmstudio.js.map