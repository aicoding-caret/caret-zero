/**
 * Converts Anthropic messages to OpenAI format and merges consecutive messages with the same role.
 * This is required for DeepSeek Reasoner which does not support successive messages with the same role.
 * DeepSeek highly recommends using 'user' role instead of 'system' role for optimal performance.
 *
 * @param messages Array of Anthropic messages
 * @returns Array of OpenAI messages where consecutive messages with the same role are merged together
 */
export function convertToR1Format(messages) {
    return messages.reduce((merged, message) => {
        const lastMessage = merged[merged.length - 1];
        let messageContent = "";
        let hasImages = false;
        if (Array.isArray(message.content)) {
            const textParts = [];
            const imageParts = [];
            message.content.forEach((part) => {
                if (part.type === "text") {
                    textParts.push(part.text);
                }
                if (part.type === "image") {
                    hasImages = true;
                    imageParts.push({
                        type: "image_url",
                        image_url: { url: `data:${part.source.media_type};base64,${part.source.data}` },
                    });
                }
            });
            if (hasImages) {
                const parts = [];
                if (textParts.length > 0) {
                    parts.push({ type: "text", text: textParts.join("\n") });
                }
                parts.push(...imageParts);
                messageContent = parts;
            }
            else {
                messageContent = textParts.join("\n");
            }
        }
        else {
            messageContent = message.content;
        }
        // If the last message has the same role, merge the content
        if (lastMessage?.role === message.role) {
            if (typeof lastMessage.content === "string" && typeof messageContent === "string") {
                lastMessage.content += `\n${messageContent}`;
            }
            else {
                const lastContent = Array.isArray(lastMessage.content)
                    ? lastMessage.content
                    : [{ type: "text", text: lastMessage.content || "" }];
                const newContent = Array.isArray(messageContent)
                    ? messageContent
                    : [{ type: "text", text: messageContent }];
                if (message.role === "assistant") {
                    const mergedContent = [
                        ...lastContent,
                        ...newContent,
                    ];
                    lastMessage.content = mergedContent;
                }
                else {
                    const mergedContent = [...lastContent, ...newContent];
                    lastMessage.content = mergedContent;
                }
            }
        }
        else {
            // Adds new message with the correct type based on role
            if (message.role === "assistant") {
                const newMessage = {
                    role: "assistant",
                    content: messageContent,
                };
                merged.push(newMessage);
            }
            else {
                const newMessage = {
                    role: "user",
                    content: messageContent,
                };
                merged.push(newMessage);
            }
        }
        return merged;
    }, []);
}
//# sourceMappingURL=r1-format.js.map