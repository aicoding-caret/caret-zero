import { StringArray } from "@shared/proto/common"
import { selectImages as selectImagesIntegration } from "@integrations/misc/process-images"
/**
 * Prompts the user to select images from the file system and returns them as data URLs
 * @param controller The controller instance
 * @param request Empty request, no parameters needed
 * @returns Array of image data URLs
 */
export const selectImages = async (controller, request) => {
	try {
		const images = await selectImagesIntegration()
		return StringArray.create({ values: images })
	} catch (error) {
		console.error("Error selecting images:", error)
		// Return empty array on error
		return StringArray.create({ values: [] })
	}
}
//# sourceMappingURL=selectImages.js.map
