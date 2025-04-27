import { expect } from "chai";
import * as sinon from "sinon";
import { spawn } from "child_process";
import { HyperClovaXLocalHandler } from "../../api/providers/hyperclovax-local";
import type { ApiHandlerOptions } from "../../shared/api";
import type { ChildProcessWithoutNullStreams } from "child_process";
import { PassThrough } from "stream";
import type { Anthropic } from "@anthropic-ai/sdk"; // For message types

// Mock child_process
// We need a more robust way to mock spawn, potentially using sinon stubs
// This is a simplified placeholder
let mockSpawn: sinon.SinonStub;
let mockChildProcess: Partial<ChildProcessWithoutNullStreams>;
let mockStdin: PassThrough;
let mockStdout: PassThrough;
let mockStderr: PassThrough;

describe("HyperClovaXLocalHandler", () => {
	const defaultOptions: ApiHandlerOptions = {
		// apiProvider is not part of ApiHandlerOptions
		apiModelId: "naver-hyperclovax/HyperCLOVAX-SEED-Vision-Instruct-3B",
		hyperclovaxModelPath: "/fake/path/to/model",
		hyperclovaxDevice: "cpu",
	};

	beforeEach(() => {
		// Reset mocks before each test
		mockStdin = new PassThrough();
		mockStdout = new PassThrough();
		mockStderr = new PassThrough();

		// Create a stub object for the 'on' method to handle different events
		const onStub = sinon.stub();
		// Default behavior for any 'on' call (can be overridden with .withArgs)
		onStub.returnsThis(); // Make 'on' chainable like the real method

		mockChildProcess = {
			stdin: mockStdin,
			stdout: mockStdout,
			stderr: mockStderr,
			on: onStub, // Use the multi-functional stub
			kill: sinon.stub(),
		};

		// Stub spawn to return our mock process
		// Need to properly type the stub if using @types/node
		mockSpawn = sinon.stub(require("child_process"), "spawn").returns(mockChildProcess as ChildProcessWithoutNullStreams);
	});

	afterEach(() => {
		// Restore original functions after each test
		mockSpawn.restore();
	});

	it("should construct successfully with valid options", () => {
		const handler = new HyperClovaXLocalHandler(defaultOptions);
		expect(handler).to.be.instanceOf(HyperClovaXLocalHandler);
	});

	it("should throw error if model path is missing", () => {
		const options = { ...defaultOptions, hyperclovaxModelPath: undefined };
		expect(() => new HyperClovaXLocalHandler(options)).to.throw("HyperCLOVA X model path (hyperclovaxModelPath) is not configured.");
	});

	it("should list the correct model", async () => {
		const handler = new HyperClovaXLocalHandler(defaultOptions);
		const models = await handler.listModels();
		expect(models).to.deep.equal(["naver-hyperclovax/HyperCLOVAX-SEED-Vision-Instruct-3B"]);
	});

	it("should return the correct model info", () => {
		const handler = new HyperClovaXLocalHandler(defaultOptions);
		const model = handler.getModel();
		expect(model.id).to.equal("naver-hyperclovax/HyperCLOVAX-SEED-Vision-Instruct-3B");
		expect(model.info).to.have.property("contextWindow", 16384);
	});

	describe("createMessage", () => {
		const systemPrompt = "System prompt";
		const userMessages: Anthropic.Messages.MessageParam[] = [
			{ role: "user", content: "Hello, world!" },
		];

		it("should spawn python script with correct arguments and input", async () => {
			const handler = new HyperClovaXLocalHandler(defaultOptions);
			const stream = handler.createMessage(systemPrompt, userMessages);

			// Consume the stream to trigger execution
			const chunks = [];
			// Simulate successful script execution
			mockStdout.write(JSON.stringify({ response: "Mock response" }));
			mockStdout.end();
			// Simulate process closing successfully AFTER stdout ends
			// Use the correctly stubbed 'on' method
			setImmediate(() => (mockChildProcess.on as sinon.SinonStub).withArgs("close").callArgWith(1, 0));

			for await (const chunk of stream) {
				chunks.push(chunk);
			}

			// Verify spawn arguments
			expect(mockSpawn.calledOnce).to.be.true;
			const spawnArgs = mockSpawn.firstCall.args;
			expect(spawnArgs[0]).to.equal("python"); // Assuming 'python' is the executable
			expect(spawnArgs[1]).to.be.an('array').that.includes("--model_path");
			expect(spawnArgs[1]).to.be.an('array').that.includes(defaultOptions.hyperclovaxModelPath);
			expect(spawnArgs[1]).to.be.an('array').that.includes("--device");
			expect(spawnArgs[1]).to.be.an('array').that.includes(defaultOptions.hyperclovaxDevice);

			// Verify stdin content (need to capture it)
			// This requires a more sophisticated mock or spying on mockStdin.write
			// For now, we assume it's called correctly based on the implementation.

			// Verify output chunk
			expect(chunks).to.have.lengthOf(1);
			expect(chunks[0]).to.deep.equal({ type: "text", text: "Mock response" });
		});

		it("should handle python script error JSON", async () => {
			const handler = new HyperClovaXLocalHandler(defaultOptions);
			const stream = handler.createMessage(systemPrompt, userMessages);

			// Simulate script outputting an error JSON
			const errorPayload = { error: "Model loading failed", traceback: "Traceback..." };
			mockStdout.write(JSON.stringify(errorPayload));
			mockStdout.end();
			// Simulate process closing successfully (as the script itself didn't crash)
			setImmediate(() => (mockChildProcess.on as sinon.SinonStub).withArgs("close").callArgWith(1, 0));

			try {
				// Consume the stream
				for await (const _ of stream) { /* consume */ }
				// Should not reach here
				expect.fail("Stream consumption should have thrown an error");
			} catch (error: any) {
				expect(error).to.be.instanceOf(Error);
				expect(error.message).to.contain("Python script error: Model loading failed");
			}
		});

		it("should handle python script non-zero exit code", async () => {
			const handler = new HyperClovaXLocalHandler(defaultOptions);
			const stream = handler.createMessage(systemPrompt, userMessages);

			// Simulate script exiting with an error code
			mockStderr.write("Something went wrong!");
			mockStderr.end();
			mockStdout.end(); // No stdout output
			// Simulate process closing with error code
			setImmediate(() => (mockChildProcess.on as sinon.SinonStub).withArgs("close").callArgWith(1, 1));

			try {
				for await (const _ of stream) { /* consume */ }
				expect.fail("Stream consumption should have thrown an error");
			} catch (error: any) {
				expect(error).to.be.instanceOf(Error);
				expect(error.message).to.contain("Python script execution failed (Code: 1)");
				expect(error.message).to.contain("Something went wrong!");
			}
		});

		// TODO: Add tests for image input processing
		// TODO: Add tests for abort signal handling
	});
});
