import { StringArray } from "../../../shared/proto/common"
import axios from "axios"
/**
 * Fetches available models from the OpenAI API
 * @param controller The controller instance
 * @param request Request containing the base URL and API key
 * @returns Array of model names
 */
export async function refreshOpenAiModels(controller, request) {
	try {
		if (!request.baseUrl) {
			return StringArray.create({ values: [] })
		}
		if (!URL.canParse(request.baseUrl)) {
			return StringArray.create({ values: [] })
		}
		const config = {}
		if (request.apiKey) {
			config["headers"] = { Authorization: `Bearer ${request.apiKey}` }
		}
		const response = await axios.get(`${request.baseUrl}/models`, config)
		const modelsArray = response.data?.data?.map((model) => model.id) || []
		const models = [...new Set(modelsArray)]
		return StringArray.create({ values: models })
	} catch (error) {
		console.error("Error fetching OpenAI models:", error)
		return StringArray.create({ values: [] })
	}
}
//# sourceMappingURL=refreshOpenAiModels.js.map
