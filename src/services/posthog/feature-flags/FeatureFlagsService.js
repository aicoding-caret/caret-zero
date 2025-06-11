import { posthogClientProvider } from "../PostHogClientProvider";
class FeatureFlagsService {
    static instance;
    client;
    constructor() {
        // Get the shared client
        this.client = posthogClientProvider.getClient();
    }
    static getInstance() {
        if (!FeatureFlagsService.instance) {
            FeatureFlagsService.instance = new FeatureFlagsService();
        }
        return FeatureFlagsService.instance;
    }
    /**
     * Check if a feature flag is enabled
     * @param flagName The feature flag key
     * @returns Boolean indicating if the feature is enabled
     */
    async isFeatureFlagEnabled(flagName) {
        try {
            const payload = await this.client.getFeatureFlagPayload(flagName, "_irrelevant_" /* optional params */);
            if (payload && typeof payload === "object" && "enabled" in payload) {
                return Boolean(payload.enabled);
            }
            console.warn(`Feature flag ${flagName} not found or missing enabled property.`);
            return false;
        }
        catch (error) {
            console.error(`Error checking if feature flag ${flagName} is enabled:`, error);
            return false;
        }
    }
}
export const featureFlagsService = FeatureFlagsService.getInstance();
//# sourceMappingURL=FeatureFlagsService.js.map