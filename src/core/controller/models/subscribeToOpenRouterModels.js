import { getRequestRegistry } from "../grpc-handler";
// Keep track of active OpenRouter models subscriptions
const activeOpenRouterModelsSubscriptions = new Set();
/**
 * Subscribe to OpenRouter models events
 * @param controller The controller instance
 * @param request The empty request
 * @param responseStream The streaming response handler
 * @param requestId The ID of the request (passed by the gRPC handler)
 */
export async function subscribeToOpenRouterModels(controller, request, responseStream, requestId) {
    console.log("[DEBUG] set up OpenRouter models subscription");
    // Add this subscription to the active subscriptions
    activeOpenRouterModelsSubscriptions.add(responseStream);
    // Register cleanup when the connection is closed
    const cleanup = () => {
        activeOpenRouterModelsSubscriptions.delete(responseStream);
        console.log("[DEBUG] Cleaned up OpenRouter models subscription");
    };
    // Register the cleanup function with the request registry if we have a requestId
    if (requestId) {
        getRequestRegistry().registerRequest(requestId, cleanup, { type: "openRouterModels_subscription" }, responseStream);
    }
}
/**
 * Send an OpenRouter models event to all active subscribers
 * @param models The OpenRouter models to send
 */
export async function sendOpenRouterModelsEvent(models) {
    // Send the event to all active subscribers
    const promises = Array.from(activeOpenRouterModelsSubscriptions).map(async (responseStream) => {
        try {
            await responseStream(models, false);
            console.log("[DEBUG] sending OpenRouter models event");
        }
        catch (error) {
            console.error("Error sending OpenRouter models event:", error);
            // Remove the subscription if there was an error
            activeOpenRouterModelsSubscriptions.delete(responseStream);
        }
    });
    await Promise.all(promises);
}
//# sourceMappingURL=subscribeToOpenRouterModels.js.map