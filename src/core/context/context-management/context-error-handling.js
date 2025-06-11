export function checkIsOpenRouterContextWindowError(error) {
    try {
        return error.code === 400 && error.message?.includes("context length");
    }
    catch (e) {
        return false;
    }
}
export function checkIsAnthropicContextWindowError(response) {
    try {
        return (response?.error?.error?.type === "invalid_request_error" &&
            response?.error?.error?.message?.includes("prompt is too long"));
    }
    catch (e) {
        return false;
    }
}
//# sourceMappingURL=context-error-handling.js.map