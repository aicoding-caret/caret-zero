export function convertAnthropicContentToGemini(content) {
    if (typeof content === "string") {
        return [{ text: content }];
    }
    return content.flatMap((block) => {
        switch (block.type) {
            case "text":
                return { text: block.text };
            case "image":
                if (block.source.type !== "base64") {
                    throw new Error("Unsupported image source type");
                }
                return {
                    inlineData: {
                        data: block.source.data,
                        mimeType: block.source.media_type,
                    },
                };
            default:
                throw new Error(`Unsupported content block type: ${block.type}`);
        }
    });
}
export function convertAnthropicMessageToGemini(message) {
    return {
        role: message.role === "assistant" ? "model" : "user",
        parts: convertAnthropicContentToGemini(message.content),
    };
}
/*
It looks like gemini likes to double escape certain characters when writing file contents: https://discuss.ai.google.dev/t/function-call-string-property-is-double-escaped/37867
*/
export function unescapeGeminiContent(content) {
    return content.replace(/\\n/g, "\n").replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\r/g, "\r").replace(/\\t/g, "\t");
}
export function convertGeminiResponseToAnthropic(response) {
    const content = [];
    const text = response.text;
    if (text) {
        content.push({ type: "text", text, citations: null });
    }
    let stop_reason = null;
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason) {
        switch (finishReason) {
            case "STOP":
                stop_reason = "end_turn";
                break;
            case "MAX_TOKENS":
                stop_reason = "max_tokens";
                break;
            case "SAFETY":
            case "RECITATION":
            case "OTHER":
                stop_reason = "stop_sequence";
                break;
        }
    }
    return {
        id: `msg_${Date.now()}`,
        type: "message",
        role: "assistant",
        content,
        model: "",
        stop_reason,
        stop_sequence: null, // Gemini doesn't provide this information
        usage: {
            input_tokens: response.usageMetadata?.promptTokenCount ?? 0,
            output_tokens: response.usageMetadata?.candidatesTokenCount ?? 0,
            cache_creation_input_tokens: null,
            cache_read_input_tokens: null,
        },
    };
}
//# sourceMappingURL=gemini-format.js.map