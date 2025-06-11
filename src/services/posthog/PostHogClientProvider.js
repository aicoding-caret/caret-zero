import { PostHog } from "posthog-node";
import { posthogConfig } from "@/shared/services/config/posthog-config";
class PostHogClientProvider {
    static instance;
    client;
    constructor() {
        this.client = new PostHog(posthogConfig.apiKey, {
            host: posthogConfig.host,
            enableExceptionAutocapture: false,
        });
    }
    static getInstance() {
        if (!PostHogClientProvider.instance) {
            PostHogClientProvider.instance = new PostHogClientProvider();
        }
        return PostHogClientProvider.instance;
    }
    getClient() {
        return this.client;
    }
    async shutdown() {
        await this.client.shutdown();
    }
}
export const posthogClientProvider = PostHogClientProvider.getInstance();
//# sourceMappingURL=PostHogClientProvider.js.map