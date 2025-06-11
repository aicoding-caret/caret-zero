[한국어로 읽기](./README.ko.md)

# Caret: Your AI Development Partner 
<img src="./assets/icons/icon.png" alt="Caret icon">

Caret is a VS Code extension that aims to create a next-generation development environment where developers and AI agents grow together to build software. Through close collaboration with AI, it helps increase development productivity and solve complex problems. ｡•ᴗ•｡💕

<<<<<<< HEAD
> **Note:** This project is a fork of the [Cline](https://github.com/cline/cline) project. Building on the excellent foundation of the original project, we are exploring deeper interactions with AI agents and intelligent development support features. 🌿
=======
<div align="center">
<table>
<tbody>
<td align="center">
<a href="https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev" target="_blank"><strong>Download on VS Marketplace</strong></a>
</td>
<td align="center">
<a href="https://discord.gg/cline" target="_blank"><strong>Discord</strong></a>
</td>
<td align="center">
<a href="https://www.reddit.com/r/cline/" target="_blank"><strong>r/cline</strong></a>
</td>
<td align="center">
<a href="https://github.com/cline/cline/discussions/categories/feature-requests?discussions_q=is%3Aopen+category%3A%22Feature+Requests%22+sort%3Atop" target="_blank"><strong>Feature Requests</strong></a>
</td>
<td align="center">
<a href="https://docs.cline.bot/getting-started/for-new-coders" target="_blank"><strong>Getting Started</strong></a>
</td>
</tbody>
</table>
</div>
>>>>>>> upstream/main

## Key Goals and Features

**Why Caret?** Frustrated with the "black box" of existing AI coding tools? Want to control AI agents your way, connect the models you want, and truly customize your development workflow? Caret aims to provide **an experience where developers and AI work together as trusted colleagues**. Understand AI transparently, extend it freely, and grow together like the best teammates.

* **Developer-Driven AI Orchestration:** Instead of opaque internal logic, define and control AI behavior directly with **clear JSON rules (`.caretrules`, persona)**. Understand how AI works and train it to match your project and style.
* **Customizable Workflow (4+1 Modes):** Beyond fixed templates, **design AI roles and interaction methods yourself**. Modify the provided modes (Arch, Dev, Rule, Talk, Empty) or create entirely new ones to build your own AI development partner.
* **Freedom of Model Choice (Local LLM & Privacy):** **Connect any LLM freely** without vendor lock-in. Meet cost, security, and performance requirements while **ensuring data privacy** by utilizing commercial APIs or **local sLLMs**.
* **Practical AI Collaboration:** Beyond simple code generation, aim for an **intelligent partner** that **understands project context (RAG goal)** and solves problems together with developers. Caret will be a platform for exploring AI possibilities and **learning how to collaborate effectively with AI**.
* **Open Source Together (Apache 2.0):** Caret is an **open source project** where we think about and create the future of development in the AI era together. Let's share transparently, contribute freely, and grow together!

## Why Aren't Cursor / Windsurf Enough?
<img src="./caret-docs/caret_feature.png" alt="Caret Features" width="600" height="400">

| SaaS AI IDE Limitations | Why Control is Critical in Production Development |
|------------------------|--------------------------------------------------|
| **Black Box Context & Model Versions** | Cannot reproduce, debug, or regression test |
| **Plan & Quota Changes** | Budget prediction failure, cost explosion for large teams |
| **Code & Logs on External Servers** | Potential security & regulation (PII, trade secrets) violations |
| **Fixed VS Code Dependent Endpoints** | Difficult to integrate with CLI, CI, other IDEs |
| **Limited Rules & Workflow Customization** | Cannot enforce team coding rules, domain regulations |
| **No Local sLLM Support** | Cannot build air-gapped, low-latency, low-cost environments |
| **File Safety (Text Patches)** | Structure damage, no rollback possible |

> **Caret** provides *complete control* by declaring models, infrastructure, and policies **all as code**.

## Core Features (✓ = Implemented, 🚧 = In Development, 🗓 = Planned)

| Category | Feature | Status |
|----------|---------|--------|
| **Transparent Rule Engine** | Define AI behavior with `.caretrules` JSON → Git version control | ✓ |
| **4 + 1 Modes** | Architect · Developer · Rule · Talk · (Empty) *instant switching* | ✓ |
| **AI Colleague UI** | Customize agent thumbnails, names, chat colors | ✓ |
| **LLM Router** | Hot-swap Local (Llama 3, Mistral etc) ↔ Cloud (OpenAI, Gemini) | 🚧 |
| **CRDT Real-time Collaboration** | Yjs-based sync, shared cursors & presence | 🚧 |
| **Vector RAG + AST Chunking** | Code semantics-based context injection | 🚧 |
| **AST & Validation Based Safe Edits** | ts-morph, automatic test & lint execution | 🗓 |
| **Semantic Caching / Prompt Compression** | 50-80% token & cost reduction | 🗓 |

## Supported AI Models and Providers

Caret supports a wide range of AI models and providers to give you the freedom to choose the best tools for your needs:

| Provider | Models | Total Models |
|----------|--------|--------------|
| Anthropic | Claude 3.7 Sonnet, Claude 3.5 Sonnet v2, Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus | 5 |
| AWS Bedrock | Amazon Nova Pro v1, Amazon Nova Lite v1, Amazon Nova Micro v1, Claude 3.7 Sonnet, Claude 3.5 Sonnet v2, Claude 3.5 Haiku, Claude 3.5 Sonnet, Claude 3 Opus and more | 12 |
| Gemini | Gemini 2.5 Pro, Gemini 2.5 Pro Preview, Gemini 2.0 Flash, Gemini 1.5 Flash, Gemini 1.5 Flash 8B, Gemini 1.5 Pro and more | 14 |
| OpenAI | GPT-4 Turbo, GPT-4 and more | 7 |
| Vertex AI | Claude 3.7 Sonnet, Claude 3.5 Sonnet v2, Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus, Claude 3 Haiku and more | 17 |
| Ollama | Llama 3, Mistral, CodeLlama | 3 |
| LM Studio | Local Model | 1 |
| OpenAI Native | O3, O4 Mini, GPT-4.1, GPT-4.1 Mini, GPT-4.1 Nano, O3 Mini, O1, O1 Preview, O1 Mini, GPT-4O, GPT-4O Mini, ChatGPT-4O Latest, GPT-4.5 Preview | 13 |
| Requesty | Claude 3.7 Sonnet (Latest) | 1 |
| Together | Llama 3 70B Chat, Mistral 7B Instruct v0.2, Llama 3 8B Chat | 3 |
| DeepSeek | DeepSeek Chat, DeepSeek Coder | 2 |
| Qwen | Qwen 2.5 Coder (32B, 14B, 7B, 3B, 1.5B), Qwen Coder Plus, Qwen Plus, Qwen Turbo, Qwen Max, Qwen VL Max, Qwen VL Plus | 11 |
| Doubao | Doubao 1.5 Pro (256K, 32K), DeepSeek V3, DeepSeek R1 | 4 |
| Mistral | Pixtral Large, Ministral 3B, Ministral 8B, Mistral Small, Pixtral 12B, Open Mistral Nemo, Open Codestral Mamba, Codestral and more | 10 |
| XAI | Grok-3 Beta, Grok-3 Fast Beta, Grok-3 Mini Beta, Grok-3 Mini Fast Beta, Grok-2 models and more | 12 |
| SambaNova | Meta-Llama-3.3-70B-Instruct, DeepSeek-R1-Distill-Llama-70B, Meta-Llama-3.1-405B-Instruct and more | 12 |
| OpenRouter | Various models via API | 1 |

**Total: 17 Providers, 128 Models**

Each model is configured with detailed specifications including:
- ID and name
- Description
- Supported features (images, computer use, prompt cache)
- Token limits
- Pricing information

## Supported Models

Caret provides support for over 150 AI models across 20 different providers including:

- **Anthropic Claude** (Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3 Opus, etc.)
- **OpenAI** (GPT-4o, GPT-4.1, etc.)
- **Google Gemini** (Gemini 2.5, Gemini 2.0, etc.)
- **Mistral AI** (Mistral Large, Codestral, etc.)
- **AWS Bedrock** (Amazon Nova, Claude on AWS, etc.)
- **Vertex AI** (Google Cloud's AI platform)
- And many others including local models via Ollama and LM Studio

For a complete list of supported models, see our [Supported Models documentation](caret-docs/supported-models.md).

## Getting Started

Caret is actively under development, with many features still in preparation. It's a project we're building together with your interest and participation! Keep watching as we steadily progress! ☕

1. **Code Repository:** Check development progress at [aicoding-caret/caret-zero](https://github.com/aicoding-caret/caret-zero) repository. (Currently in initial setup!) Star ⭐ and watch the repository if you want to build and use the code directly.
2. **Installation (Future):** Once officially released, you can install "Caret" from the VS Code marketplace. (Coming soon!)
3. **Setup (After Installation):**
   * Customize the provided AI agent personas. Templates include Pulse9's Sarangi, Ichika Madobe, Cyan, and Ubuntu-tan.
   * Create a `.caretrules` file in your project root to define work modes and rules.
   * Four modes (ARCH, DEV, RULE, TALK) with customizable AI models and system prompts are provided by default, allowing you to optimize for desired tasks using these four plus one additional mode.
4. **Participation & Contribution:** Star ⭐ the repository or leave feedback through Issues to contribute or receive updates!
5. **Community (Coming Soon):** Latest news and discussions will be available in the [AICoding-Caret Facebook group](https://facebook.com/groups/aicoding-caret). Future plans include providing **various educational materials and training programs** through the community.
6. **Easy Access (Future Plan):** In the future, we plan to make **core Caret features more accessible** through account creation on the Caret website (official website: caret.team planned) without complex individual LLM API key setup.

## Future Roadmap (Brief)

Caret will continue to evolve. Main directions are as follows. For more detailed plans, check the [Caret Project Vision and Development Roadmap document](./caret-docs/plan/Caret%20프로젝트%20비전%20및%20개발%20로드맵.md).

* **RAG Enhancement:** Strengthen project context understanding (vector DB integration, automatic synchronization, etc.)
* **Multi-Agent Collaboration:** Implement organic cooperation between various specialist agents (testers, documentation writers, etc.)
* **Vibe Coding UX Improvement:** Optimize real-time interaction and development flow between developers and AI
* **Expanded LLM Support:** Provide and optimize more local/cloud model connection options
* **Plugin System (Long-term Goal):** Establish structure for users to extend Caret's functionality directly

Your feedback and contributions will make Caret's roadmap even richer!

## Community & Communication Channels (Coming Soon)
* **GitHub Issues:** Technical discussions, bug reports, feature requests
* **Facebook Group:** [AICoding-Caret](https://facebook.com/groups/aicoding-caret) (latest news, user discussions)

## Build & Packaging 🛠️

Follow these steps to set up your local development environment and build the extension.

### 1. Clone the Repository

Clone the `caret-zero` repository to your local machine.

```bash
git clone https://github.com/aicoding-caret/caret-zero.git
cd caret-zero
```

### 2. Install Dependencies

Install all necessary npm packages from the project root. This single command installs dependencies for the entire project, including the `cline` and `webview-ui` workspaces.

```bash
npm install
```

### 3. Development Build

Compile the TypeScript code for the extension. This generates the necessary JavaScript files in the `dist` folder.

```bash
npm run compile
```

### 4. Run for Development

Once the development build is complete, you can run the extension in a new VS Code window for testing and debugging.

-   Press `F5` in VS Code.

### 5. Create a Release Package (.vsix)

To create a shareable `.vsix` installation file, run the release build script. This script will handle versioning, packaging, and place the final file in the `/release` directory.

```powershell
# (From the root directory)
./build-release.ps1
```
The output file will be named `release/caret-vVERSION-DATE.vsix`.

## Contributing

The Caret project welcomes your contributions! Whether it's bug reports, feature suggestions, or code contributions, all forms are welcome. Please refer to the `CONTRIBUTING.md` (coming soon) file for details.

## Documentation

For more detailed information, please refer to the documents in the [`docs`](./docs/) directory.

* [Architecture Overview](./docs/architecture/extension-architecture.mmd)
* [New Developer Onboarding Guide](./docs/development/new-developer-onboarding-guide.md)
* [Work Logs](./docs/work-logs/)
* ... (additional important document links to be added)

## License

[Apache 2.0](./LICENSE) © 2024 [Caretive INC.](https://caretive.ai/) 
