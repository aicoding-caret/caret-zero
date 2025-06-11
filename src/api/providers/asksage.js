var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { askSageModels, askSageDefaultModelId, askSageDefaultURL, } from "@shared/api";
import { withRetry } from "../retry";
export class AskSageHandler {
    options;
    apiUrl;
    apiKey;
    constructor(options) {
        console.log("init api url", options.asksageApiUrl, askSageDefaultURL);
        this.options = options;
        this.apiKey = options.asksageApiKey || "";
        this.apiUrl = options.asksageApiUrl || askSageDefaultURL;
        if (!this.apiKey) {
            throw new Error("AskSage API key is required");
        }
    }
    async *createMessage(systemPrompt, messages) {
        try {
            const model = this.getModel();
            // Transform messages into AskSageRequest format
            const formattedMessages = messages.map((msg) => {
                const content = Array.isArray(msg.content)
                    ? msg.content.map((block) => ("text" in block ? block.text : "")).join("")
                    : msg.content;
                return {
                    user: msg.role === "assistant" ? "gpt" : "me",
                    message: content,
                };
            });
            const request = {
                system_prompt: systemPrompt,
                message: formattedMessages,
                model: model.id,
                dataset: "none",
            };
            // Make request to AskSage API
            const response = await fetch(`${this.apiUrl}/query`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-tokens": this.apiKey,
                },
                body: JSON.stringify(request),
            });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`AskSage API error: ${error}`);
            }
            const result = (await response.json());
            if (!result.message) {
                throw new Error("No content in AskSage response");
            }
            // Return entire response as a single chunk since streaming is not supported
            yield {
                type: "text",
                text: result.message,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`AskSage request failed: ${error.message}`);
            }
        }
    }
    getModel() {
        const modelId = this.options.apiModelId;
        if (modelId && modelId in askSageModels) {
            const id = modelId;
            return { id, info: askSageModels[id] };
        }
        return {
            id: askSageDefaultModelId,
            info: askSageModels[askSageDefaultModelId],
        };
    }
}
__decorate([
    withRetry()
], AskSageHandler.prototype, "createMessage", null);
//# sourceMappingURL=asksage.js.map