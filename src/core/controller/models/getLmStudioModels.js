import { StringArray } from "../../../shared/proto/common";
import axios from "axios";
/**
 * Fetches available models from LM Studio
 * @param controller The controller instance
 * @param request The request containing the base URL (optional)
 * @returns Array of model names
 */
export async function getLmStudioModels(controller, request) {
    try {
        let baseUrl = request.value || "http://localhost:1234";
        if (!URL.canParse(baseUrl)) {
            return StringArray.create({ values: [] });
        }
        const response = await axios.get(`${baseUrl}/v1/models`);
        const modelsArray = response.data?.data?.map((model) => model.id) || [];
        const models = [...new Set(modelsArray)];
        return StringArray.create({ values: models });
    }
    catch (error) {
        return StringArray.create({ values: [] });
    }
}
//# sourceMappingURL=getLmStudioModels.js.map