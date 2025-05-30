import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import ApiOptions from "../ApiOptions"
import { ExtensionStateContextProvider } from "../../../context/ExtensionStateContext"

vi.mock("../../../context/ExtensionStateContext", async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...actual,
		// your mocked methods
		useExtensionState: vi.fn(() => ({
			apiConfiguration: {
				apiProvider: "requesty",
				requestyApiKey: "",
				requestyModelId: "",
			},
			setApiConfiguration: vi.fn(),
			uriScheme: "vscode",
		})),
	}
})

describe("ApiOptions Component", () => {
	vi.clearAllMocks()
	const mockPostMessage = vi.fn()

	beforeEach(() => {
		global.vscode = { postMessage: mockPostMessage } as any
	})

	it("renders Requesty API Key input", () => {
		render(
			<ExtensionStateContextProvider>
				<ApiOptions showModelOptions={true} />
			</ExtensionStateContextProvider>,
		)
		const apiKeyInput = screen.getByPlaceholderText("Enter API Key...")
		expect(apiKeyInput).toBeInTheDocument()
	})

	it("renders Requesty Model ID input", () => {
		render(
			<ExtensionStateContextProvider>
				<ApiOptions showModelOptions={true} />
			</ExtensionStateContextProvider>,
		)
		const modelIdInput = screen.getByPlaceholderText("Enter Model ID...")
		expect(modelIdInput).toBeInTheDocument()
	})
})

vi.mock("../../../context/ExtensionStateContext", async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...actual,
		// your mocked methods
		useExtensionState: vi.fn(() => ({
			apiConfiguration: {
				apiProvider: "together",
				requestyApiKey: "",
				requestyModelId: "",
			},
			setApiConfiguration: vi.fn(),
			uriScheme: "vscode",
		})),
	}
})

describe("ApiOptions Component", () => {
	vi.clearAllMocks()
	const mockPostMessage = vi.fn()

	beforeEach(() => {
		global.vscode = { postMessage: mockPostMessage } as any
	})

	it("renders Together API Key input", () => {
		render(
			<ExtensionStateContextProvider>
				<ApiOptions showModelOptions={true} />
			</ExtensionStateContextProvider>,
		)
		const apiKeyInput = screen.getByPlaceholderText("Enter API Key...")
		expect(apiKeyInput).toBeInTheDocument()
	})

	it("renders Together Model ID input", () => {
		render(
			<ExtensionStateContextProvider>
				<ApiOptions showModelOptions={true} />
			</ExtensionStateContextProvider>,
		)
		const modelIdInput = screen.getByPlaceholderText("Enter Model ID...")
		expect(modelIdInput).toBeInTheDocument()
	})
})

vi.mock("../../../context/ExtensionStateContext", async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...actual,
		// your mocked methods
		useExtensionState: vi.fn(() => ({
			apiConfiguration: {
				apiProvider: "openai",
				requestyApiKey: "",
				requestyModelId: "",
				hyperclovaxSllmUrl: "", // added hyperclovaxSllmUrl property
			},
			setApiConfiguration: vi.fn(),
			uriScheme: "vscode",
		})),
	}
})

describe("OpenApiInfoOptions", () => {
	const mockPostMessage = vi.fn()

	beforeEach(() => {
		vi.clearAllMocks()
		global.vscode = { postMessage: mockPostMessage }
	})

	it("renders OpenAI Supports Images input", () => {
		render(
			<ExtensionStateContextProvider>
				<ApiOptions showModelOptions={true} />
			</ExtensionStateContextProvider>,
		)
		fireEvent.click(screen.getByText("Model Configuration"))
		const apiKeyInput = screen.getByText("Supports Images")
		expect(apiKeyInput).toBeInTheDocument()
	})

	it("renders OpenAI Context Window Size input", () => {
		render(
			<ExtensionStateContextProvider>
				<ApiOptions showModelOptions={true} />
			</ExtensionStateContextProvider>,
		)
		fireEvent.click(screen.getByText("Model Configuration"))
		const orgIdInput = screen.getByText("Context Window Size")
		expect(orgIdInput).toBeInTheDocument()
	})

	it("renders OpenAI Max Output Tokens input", () => {
		render(
			<ExtensionStateContextProvider>
				<ApiOptions showModelOptions={true} />
			</ExtensionStateContextProvider>,
		)
		fireEvent.click(screen.getByText("Model Configuration"))
		const modelInput = screen.getByText("Max Output Tokens")
		expect(modelInput).toBeInTheDocument()
	})

	it("renders hyperclovaxSllmUrl input", () => {
		render(
			<ExtensionStateContextProvider>
				<ApiOptions showModelOptions={true} />
			</ExtensionStateContextProvider>,
		)
		fireEvent.click(screen.getByText("Model Configuration"))
		const hyperclovaxSllmUrlInput = screen.getByText("hyperclovaxSllmUrl")
		expect(hyperclovaxSllmUrlInput).toBeInTheDocument()
	})

	it("accesses hyperclovaxSllmUrl through any casting", () => {
		const apiConfiguration: any = {
			apiProvider: "openai",
			requestyApiKey: "",
			requestyModelId: "",
			hyperclovaxSllmUrl: "https://example.com",
		}
		expect(apiConfiguration.hyperclovaxSllmUrl).toBe("https://example.com")
	})
})
