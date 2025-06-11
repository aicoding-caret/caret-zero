import axios from "axios";
export class ClineAccountService {
    baseUrl = "https://api.cline.bot/v1";
    postMessageToWebview;
    getClineApiKey;
    constructor(postMessageToWebview, getClineApiKey) {
        this.postMessageToWebview = postMessageToWebview;
        this.getClineApiKey = getClineApiKey;
    }
    /**
     * Helper function to make authenticated requests to the Cline API
     * @param endpoint The API endpoint to call (without the base URL)
     * @param config Additional axios request configuration
     * @returns The API response data
     * @throws Error if the API key is not found or the request fails
     */
    async authenticatedRequest(endpoint, config = {}) {
        const clineApiKey = await this.getClineApiKey();
        if (!clineApiKey) {
            throw new Error("Cline API key not found");
        }
        const url = `${this.baseUrl}${endpoint}`;
        const requestConfig = {
            ...config,
            headers: {
                Authorization: `Bearer ${clineApiKey}`,
                "Content-Type": "application/json",
                ...config.headers,
            },
        };
        const response = await axios.get(url, requestConfig);
        if (!response.data) {
            throw new Error(`Invalid response from ${endpoint} API`);
        }
        return response.data;
    }
    /**
     * Fetches the user's current credit balance
     */
    async fetchBalance() {
        try {
            const data = await this.authenticatedRequest("/user/credits/balance");
            // Post to webview
            await this.postMessageToWebview({
                type: "userCreditsBalance",
                userCreditsBalance: data,
            });
            return data;
        }
        catch (error) {
            console.error("Failed to fetch balance:", error);
            return undefined;
        }
    }
    /**
     * Fetches the user's usage transactions
     */
    async fetchUsageTransactions() {
        try {
            const data = await this.authenticatedRequest("/user/credits/usage");
            // Post to webview
            await this.postMessageToWebview({
                type: "userCreditsUsage",
                userCreditsUsage: data,
            });
            return data;
        }
        catch (error) {
            console.error("Failed to fetch usage transactions:", error);
            return undefined;
        }
    }
    /**
     * Fetches the user's payment transactions
     */
    async fetchPaymentTransactions() {
        try {
            const data = await this.authenticatedRequest("/user/credits/payments");
            // Post to webview
            await this.postMessageToWebview({
                type: "userCreditsPayments",
                userCreditsPayments: data,
            });
            return data;
        }
        catch (error) {
            console.error("Failed to fetch payment transactions:", error);
            return undefined;
        }
    }
}
//# sourceMappingURL=ClineAccountService.js.map