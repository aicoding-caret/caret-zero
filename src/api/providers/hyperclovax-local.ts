import { spawn } from "child_process";
import * as path from "path"; // Import path module
import type { Anthropic } from "@anthropic-ai/sdk"; // Keep for MessageParam
import type { ApiHandlerOptions, ModelInfo, ApiStreamChunk } from "../../shared/api"; // Add ApiStreamChunk
import type { ApiHandler } from "../index";
import type { ApiStream } from "../transform/stream";
import { hyperClovaXLocalModels, HyperClovaXLocalModelId, hyperClovaXLocalDefaultModelId } from "../../shared/api"; // Import all needed types

// Resolve the absolute path to the Python script relative to the extension's root
// Assuming this file is in src/api/providers/ and the script is in scripts/
const PYTHON_SCRIPT_PATH = path.resolve(__dirname, "../../../../scripts/run_hyperclovax.py");

export class HyperClovaXLocalHandler implements ApiHandler {
	private options: ApiHandlerOptions;
	private modelInfo: ModelInfo | undefined;

	constructor(options: ApiHandlerOptions) {
		this.options = options;
		this.modelInfo = options.apiModelId ? hyperClovaXLocalModels[options.apiModelId as keyof typeof hyperClovaXLocalModels] : undefined;

		// Validate required options
		if (!this.options.hyperclovaxModelPath) {
			throw new Error("HyperCLOVA X model path (hyperclovaxModelPath) is not configured.");
		}
		// TODO: Add check if python executable exists? Or rely on spawn error.
		// TODO: Check if PYTHON_SCRIPT_PATH exists?
	}

	createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[], abortSignal?: AbortSignal): ApiStream {
		const modelPath = this.options.hyperclovaxModelPath;

		// Prepare input for the Python script's stdin
		// Extract the last user message and potentially an image
		let userPrompt = "";
		let imageBase64: string | undefined = undefined;

		const lastMessage = messages[messages.length - 1];
		if (lastMessage && lastMessage.role === "user") {
			if (Array.isArray(lastMessage.content)) {
				for (const contentBlock of lastMessage.content) {
					if (contentBlock.type === "text") {
						userPrompt = contentBlock.text;
					} else if (contentBlock.type === "image" && contentBlock.source.type === "base64") {
						// Assuming the input format matches Anthropic's image block
						imageBase64 = contentBlock.source.data;
						// TODO: Handle different media types if necessary? Python script expects png/jpg/etc.
					}
				}
			} else {
				userPrompt = lastMessage.content; // Simple string content
			}
		}

		// Combine system prompt and user prompt for the Python script
		// The Python script expects a single 'prompt' field. We can prepend the system prompt.
		const combinedPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${userPrompt}` : `User: ${userPrompt}`;

		const scriptInput = JSON.stringify({
			prompt: combinedPrompt,
			image_base64: imageBase64,
			// Add other generation parameters if needed, e.g., from this.modelInfo or options
			// max_new_tokens: this.modelInfo?.maxTokens || 1024, // Example
		});

		// Non-streaming implementation: Spawn Python, send input, wait for full output, parse JSON.
		return (async function* (): AsyncGenerator<ApiStreamChunk> {
			let stdoutData = "";
			let stderrOutput = "";
			let pythonProcess;

			try {
				console.log(`Spawning HyperCLOVAX script: python ${PYTHON_SCRIPT_PATH} --model_path "${modelPath}"`);
				
				pythonProcess = spawn("python", [
					PYTHON_SCRIPT_PATH,
					"--model_path", modelPath! // Already checked in constructor
				], { signal: abortSignal });

				pythonProcess.stderr.on("data", (data) => {
					stderrOutput += data.toString();
					console.error(`HyperCLOVAX Python STDERR: ${data.toString().trim()}`);
				});

				pythonProcess.stdout.on("data", (data) => {
					stdoutData += data.toString();
				});

				// Handle potential spawn errors
				pythonProcess.on('error', (err) => {
					console.error("Failed to start HyperCLOVAX Python script:", err);
					// Reject the promise or handle error appropriately
					// Note: This error might occur before the promise below resolves
					throw new Error(`Failed to start Python script: ${err.message}`);
				});

				// Write input to stdin
				pythonProcess.stdin.write(scriptInput);
				pythonProcess.stdin.end();

				const exitCode = await new Promise<number | null>((resolve, reject) => {
					pythonProcess!.on("close", resolve);
					// Add error listener specifically for the promise context
					pythonProcess!.on('error', reject);
				});

				if (exitCode !== 0) {
					console.error(`HyperCLOVAX Python script exited with code ${exitCode}. Stderr: ${stderrOutput}`);
					throw new Error(`Python script execution failed (Code: ${exitCode}). Stderr: ${stderrOutput || "No stderr output."}`);
				}

				// Process the complete stdout data
				try {
					const resultJson = JSON.parse(stdoutData);
					if (resultJson.error) {
						console.error(`HyperCLOVAX Python script returned error: ${resultJson.error}`);
						console.error(`Traceback: ${resultJson.traceback}`);
						throw new Error(`Python script error: ${resultJson.error}`);
					}
					if (resultJson.response) {
						yield { type: "text", text: resultJson.response };
					} else {
						throw new Error("Python script did not return a 'response' field in JSON output.");
					}
				} catch (parseError: any) {
					console.error(`Failed to parse JSON output from Python script. Raw output: ${stdoutData}`);
					console.error(`Stderr: ${stderrOutput}`);
					throw new Error(`Failed to parse Python script output: ${parseError.message}`);
				}

			} catch (error: any) {
				if (error.name === 'AbortError') {
					console.log("HyperCLOVAX request aborted by user.");
					// Kill the process if it's still running
					if (pythonProcess && !pythonProcess.killed) {
						pythonProcess.kill();
						console.log("Sent kill signal to HyperCLOVAX Python script.");
					}
					// No need to yield anything or throw further, just stop generation.
					return; // Stop the generator
				} else {
					console.error("Error during HyperCLOVAX local execution:", error);
					// Re-throw the error to be caught by the caller (Task)
					throw new Error(`HyperCLOVAX local execution failed: ${error.message}`);
				}
			}
		})();
	}

	async isModelAvailable(modelId: string): Promise<boolean> {
		// Basic check: model path configured and modelId is known
		return !!this.options.hyperclovaxModelPath && modelId in hyperClovaXLocalModels;
		// TODO: Could add fs.existsSync check for model path if needed, but might be slow.
	}

	async listModels(): Promise<string[]> {
		return Object.keys(hyperClovaXLocalModels);
	}

	getModel(): { id: string; info: ModelInfo } {
		const modelId = this.options.apiModelId as HyperClovaXLocalModelId | undefined;
		const defaultModelId = hyperClovaXLocalDefaultModelId;
		const currentModelId = modelId && modelId in hyperClovaXLocalModels ? modelId : defaultModelId;
		const modelInfo = hyperClovaXLocalModels[currentModelId];

		if (!modelInfo) {
			throw new Error(`Model info not found for ${currentModelId}`);
		}

		return {
			id: currentModelId,
			info: modelInfo,
		};
	}

	// Optional: Implement usage tracking if possible
	// async getApiStreamUsage?(): Promise<ApiStreamUsageChunk | undefined> {
	// return undefined; // Local models might not track token usage easily
	// }
}
