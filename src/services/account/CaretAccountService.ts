import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { Controller } from "../../core/controller"
import type { BalanceResponse, PaymentTransaction, UsageTransaction } from "../../shared/CaretAccount"

export class CaretAccountService {
	private readonly baseUrl = "https://api.caret.bot/v1"
	private controllerRef: WeakRef<Controller>

	constructor(controller: Controller) {
		this.controllerRef = new WeakRef(controller)
	}

	/**
	 * Get the user's Caret Account key from the apiConfiguration
	 */
	private async getCaretApiKey(): Promise<string | undefined> {
		const provider = this.controllerRef.deref()
		if (!provider) {
			return undefined
		}

		const { apiConfiguration } = await provider.getStateToPostToWebview()
		return apiConfiguration?.caretApiKey
	}

	/**
	 * Helper function to make authenticated requests to the Caret API
	 * @param endpoint The API endpoint to call (without the base URL)
	 * @param config Additional axios request configuration
	 * @returns The API response data
	 * @throws Error if the API key is not found or the request fails
	 */
	private async authenticatedRequest<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
		const caretApiKey = await this.getCaretApiKey()

		if (!caretApiKey) {
			throw new Error("Caret API key not found")
		}

		const url = `${this.baseUrl}${endpoint}`
		const requestConfig: AxiosRequestConfig = {
			...config,
			headers: {
				Authorization: `Bearer ${caretApiKey}`,
				"Content-Type": "application/json",
				...config.headers,
			},
		}

		const response: AxiosResponse<T> = await axios.get(url, requestConfig)

		if (!response.data) {
			throw new Error(`Invalid response from ${endpoint} API`)
		}

		return response.data
	}

	/**
	 * Fetches the user's current credit balance
	 */
	async fetchBalance(): Promise<BalanceResponse | undefined> {
		try {
			const data = await this.authenticatedRequest<BalanceResponse>("/user/credits/balance")

			// Post to webview
			await this.controllerRef.deref()?.postMessageToWebview({
				type: "userCreditsBalance",
				userCreditsBalance: data,
			})

			return data
		} catch (error) {
			console.error("Failed to fetch balance:", error)
			return undefined
		}
	}

	/**
	 * Fetches the user's usage transactions
	 */
	async fetchUsageTransactions(): Promise<UsageTransaction[] | undefined> {
		try {
			const data = await this.authenticatedRequest<UsageTransaction[]>("/user/credits/usage")

			// Post to webview
			await this.controllerRef.deref()?.postMessageToWebview({
				type: "userCreditsUsage",
				userCreditsUsage: data,
			})

			return data
		} catch (error) {
			console.error("Failed to fetch usage transactions:", error)
			return undefined
		}
	}

	/**
	 * Fetches the user's payment transactions
	 */
	async fetchPaymentTransactions(): Promise<PaymentTransaction[] | undefined> {
		try {
			const data = await this.authenticatedRequest<PaymentTransaction[]>("/user/credits/payments")

			// Post to webview
			await this.controllerRef.deref()?.postMessageToWebview({
				type: "userCreditsPayments",
				userCreditsPayments: data,
			})

			return data
		} catch (error) {
			console.error("Failed to fetch payment transactions:", error)
			return undefined
		}
	}
}
