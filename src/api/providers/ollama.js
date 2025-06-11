var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Ollama } from "ollama";
import { openAiModelInfoSaneDefaults } from "../../shared/api";
import { convertToOllamaMessages } from "../transform/ollama-format";
import { withRetry } from "../retry";
export class OllamaHandler {
    options;
    client;
    constructor(options) {
        this.options = options;
        this.client = new Ollama({ host: this.options.ollamaBaseUrl || "http://localhost:11434" });
    }
    async *createMessage(systemPrompt, messages) {
        const ollamaMessages = [{ role: "system", content: systemPrompt }, ...convertToOllamaMessages(messages)];
        try {
            // Create a promise that rejects after timeout
            const timeoutMs = this.options.requestTimeoutMs || 30000;
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Ollama request timed out after ${timeoutMs / 1000} seconds`)), timeoutMs);
            });
            // Create the actual API request promise
            const apiPromise = this.client.chat({
                model: this.getModel().id,
                messages: ollamaMessages,
                stream: true,
                options: {
                    num_ctx: Number(this.options.ollamaApiOptionsCtxNum) || 32768,
                },
            });
            // Race the API request against the timeout
            const stream = (await Promise.race([apiPromise, timeoutPromise]));
            try {
                for await (const chunk of stream) {
                    if (typeof chunk.message.content === "string") {
                        yield {
                            type: "text",
                            text: chunk.message.content,
                        };
                    }
                    // Handle token usage if available
                    if (chunk.eval_count !== undefined || chunk.prompt_eval_count !== undefined) {
                        yield {
                            type: "usage",
                            inputTokens: chunk.prompt_eval_count || 0,
                            outputTokens: chunk.eval_count || 0,
                        };
                    }
                }
            }
            catch (streamError) {
                console.error("Error processing Ollama stream:", streamError);
                throw new Error(`Ollama stream processing error: ${streamError.message || "Unknown error"}`);
            }
        }
        catch (error) {
            // Check if it's a timeout error
            if (error.message && error.message.includes("timed out")) {
                const timeoutMs = this.options.requestTimeoutMs || 30000;
                throw new Error(`Ollama request timed out after ${timeoutMs / 1000} seconds`);
            }
            // Enhance error reporting
            const statusCode = error.status || error.statusCode;
            const errorMessage = error.message || "Unknown error";
            console.error(`Ollama API error (${statusCode || "unknown"}): ${errorMessage}`);
            throw error;
        }
    }
    getModel() {
        return {
            id: this.options.ollamaModelId || "",
            info: this.options.ollamaApiOptionsCtxNum
                ? { ...openAiModelInfoSaneDefaults, contextWindow: Number(this.options.ollamaApiOptionsCtxNum) || 32768 }
                : openAiModelInfoSaneDefaults,
        };
    }
}
__decorate([
    withRetry({ retryAllErrors: true })
], OllamaHandler.prototype, "createMessage", null);
//# sourceMappingURL=ollama.js.map