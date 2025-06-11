import { Controller } from ".."
import { BooleanRequest, StringArray } from "@shared/proto/common"
import { selectFiles as selectFilesIntegration } from "@integrations/misc/process-files"
import { FileMethodHandler } from "./index"

/**
 * Prompts the user to select images from the file system and returns them as data URLs
 * @param controller The controller instance
 * @param request Boolean request, with the value defining whether this model supports images
 * @returns Two arrays of image data URLs and other file paths
 */
export const selectFiles: FileMethodHandler = async (controller: Controller, request: BooleanRequest): Promise<StringArray> => {
	try {
		const { images, files } = await selectFilesIntegration(request.value)
		// Filter for image files
		const filteredImages = images.filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
		return StringArray.create({ values: files })
	} catch (error) {
		console.error("Error selecting images & files:", error)
		// Return empty array on error
		return StringArray.create({ values: [] })
	}
}

export const getSelectedFilesOrDirectory: FileMethodHandler = async (controller: Controller): Promise<StringArray> => {
	// ...
	// ... (rest of the function remains the same)
	// ...

	return StringArray.create({ values: [] })
}
