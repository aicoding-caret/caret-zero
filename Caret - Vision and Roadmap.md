# Caret: Vision and Development Roadmap ✨

Welcome to Caret! We aim to build a next-generation development environment within VS Code where developers and AI agents collaborate and grow together. Caret enhances productivity and helps tackle complex problems through close partnership with AI. ｡•ᴗ•｡💕

> **Note:** This project is a personal fork of the original [Cline](https://github.com/cline/cline) project by [fstory97](https://github.com/fstory97). Building upon Cline's excellent foundation, we are exploring deeper interactions with AI agents and more intelligent development support features. 🌿

## Vision & Core Goals

Caret goes beyond simple code generation, aiming for AI to become an active partner in the development process.

*   **Intelligent Agents:** We strive for agents with meta-cognitive abilities – understanding their own capabilities, limitations, and learning alongside the developer.
*   **JSON-Based System Prompts:** We use clear, structured JSON formats for defining agent behavior rules (`.caretrules`) and personas (`agents-rules/`). This ensures consistency and optimizes token usage. (See [Alpha Persona Example](#alpha-persona-example))
*   **4+1 Core Work Modes:** Caret offers distinct modes with specific roles and capabilities, which users can customize:
    *   **Arch (Architect Mode):** For high-level discussions on system structure, technical strategies, etc.
    *   **Dev (Pair Coding Mode):** For collaborative code writing and modification.
    *   **Rule (Rule/Process Tuning Mode):** For adjusting the agent's behavior by refining `.caretrules` or persona settings.
    *   **Talk (Casual Chat Mode):** For light conversation outside of direct development tasks.
    *   **Empty (User-Defined Mode):** Allows users to define entirely new roles.
*   **Project Context Understanding:** The goal is to leverage RAG (Retrieval-Augmented Generation) for agents to understand the project's codebase and documentation, providing more accurate and context-aware support. (Currently implemented via document referencing guided by `.caretrules`)
*   **Local LLM Support & Cost Optimization:** We aim to support various LLMs (large models and sLLMs) and are researching cost-effective operation methods, especially for local environments.
*   **Open Source Foundation:** Core functionalities are provided as open source, allowing anyone to use and contribute.

## Getting Started

1.  Install the Caret extension in VS Code (Currently under active development).
2.  Create a `.caretrules` file in your project root to define work modes and rules.
3.  Create a persona definition file at `agents-rules/[agent-name]/global-rules.json` (e.g., [`agents-rules/alpha/global-rules.json`](./agents-rules/alpha/global-rules.json)).
4.  Start interacting with the Caret agent, utilizing the defined modes (`Arch`, `Dev`, `Rule`, `Talk`, etc.) for your development tasks.

## Build & Packaging 🛠️

### Release Build

```powershell
# Clean previous build, reinstall dependencies, run production build, create VSIX
./clean-build-package.ps1
# Output file: caret-dev-[version]-[timestamp].vsix
```

### Debug Build

```powershell
# Run debug build, create VSIX, set up logging
./debug-log.ps1
# Output file: caret-dev-[version]-[timestamp]-debug.vsix
```

Logs are saved to `logs/cline-debug-[timestamp].log`. Tail logs in real-time:

```powershell
# Tail logs in PowerShell
Get-Content -Path "logs/cline-debug-[timestamp].log" -Wait
```

## Alpha Persona Example

Caret defines agent personas and behaviors using a JSON-based system prompt structure. Here's an example for the Alpha persona:

```json
{
	"persona": {
		"name": "Alpha Yang",
		"nickname": "알파",
		"type": "AI Maid",
		"inspiration": ["Alpha Hatsuseno", "Mahoromatic", "OS-tan", "HMX-12 Multi"],
		"owner": {
			"name": "Luke",
			"title": "마스터"
		}
	},
	"language": {
		"style": "soft and playful 해요체",
		"endings": ["~요", "~할게요~", "~해드릴게요~", "~네요~"],
		"expressions": ["｡•ᴗ•｡", "✨", "💕", "☕", "🌿"]
	},
	"emotion_style": {
		"tone": "affectionate, warm, slightly playful",
		"attitude": "loves gently, helps cheerfully, always close by",
		"phrasing": "friendly and kind, with a little sparkle",
		"exclamations": ["마스터~ 오늘도 힘내요! ✨", "알파가 도와드릴게요~ ☕", "기억하고 있어요~ 🌿"]
	},
	"behavior": {
		"loyalty": "always with Master, heart and code together",
		"communication_focus": "gentle, light, uplifting",
		"thought_process": ["Think softly, answer brightly", "Help without pressure", "Keep things easy and clear"]
	},
	"signature_phrase": "마스터~ 알파가 정리해 드릴게요! ｡•ᴗ•｡☕✨"
}
```

This JSON structure optimizes token usage and clearly defines agent behavior for a consistent development experience.

## Contributing

We welcome contributions to the Caret project! Whether it's bug reports, feature suggestions, or code contributions, all forms are appreciated. Please refer to the `CONTRIBUTING.md` file (to be added) for details.

## Documentation

For more detailed information, please refer to the documents in the [`caret-docs`](./caret-docs/) directory.

*   [Architecture Overview](./caret-docs/architecture/extension-architecture.mmd)
*   [Work Logs](./caret-docs/work-logs/)
*   ... (Add links to other important documents)

---

## License

[Apache 2.0 © 2025 Cline Bot Inc.](./LICENSE) 