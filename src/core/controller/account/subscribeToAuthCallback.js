import { getRequestRegistry } from "../grpc-handler";
// Keep track of active authCallback subscriptions
const activeAuthCallbackSubscriptions = new Set();
/**
 * Subscribe to authCallback events
 * @param controller The controller instance
 * @param request The empty request
 * @param responseStream The streaming response handler
 * @param requestId The ID of the request (passed by the gRPC handler)
 */
export async function subscribeToAuthCallback(controller, request, responseStream, requestId) {
    // Add this subscription to the active subscriptions
    activeAuthCallbackSubscriptions.add(responseStream);
    // Register cleanup when the connection is closed
    const cleanup = () => {
        activeAuthCallbackSubscriptions.delete(responseStream);
    };
    // Register the cleanup function with the request registry if we have a requestId
    if (requestId) {
        getRequestRegistry().registerRequest(requestId, cleanup, { type: "authCallback_subscription" }, responseStream);
    }
}
/**
 * Send an authCallback event to all active subscribers
 * @param customToken The custom token for authentication
 */
export async function sendAuthCallbackEvent(customToken) {
    // Send the event to all active subscribers
    const promises = Array.from(activeAuthCallbackSubscriptions).map(async (responseStream) => {
        try {
            const event = {
                value: customToken,
            };
            await responseStream(event, false);
        }
        catch (error) {
            console.error("Error sending authCallback event:", error);
            // Remove the subscription if there was an error
            activeAuthCallbackSubscriptions.delete(responseStream);
        }
    });
    await Promise.all(promises);
}
//# sourceMappingURL=subscribeToAuthCallback.js.map