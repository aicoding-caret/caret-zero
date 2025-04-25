[한국어로 읽기](./README.ko.md)

# Caret: Your AI Development Partner 

Caret is a VS Code extension that aims to create a next-generation development environment where developers and AI agents grow together to build software. Through close collaboration with AI, it helps increase development productivity and solve complex problems. ｡•ᴗ•｡💕

> **Note:** This project is a fork of the [Cline](https://github.com/cline/cline) project. Building on the excellent foundation of the original project, we are exploring deeper interactions with AI agents and intelligent development support features. 🌿

## Key Goals and Features

**Why Caret?** Frustrated with the "black box" of existing AI coding tools? Want to control AI agents your way, connect the models you want, and truly customize your development workflow? Caret aims to provide **an experience where developers and AI work together as trusted colleagues**. Understand AI transparently, extend it freely, and grow together like the best teammates.

* **Developer-Driven AI Orchestration:** Instead of opaque internal logic, define and control AI behavior directly with **clear JSON rules (`.caretrules`, persona)**. Understand how AI works and train it to match your project and style.
* **Customizable Workflow (4+1 Modes):** Beyond fixed templates, **design AI roles and interaction methods yourself**. Modify the provided modes (Arch, Dev, Rule, Talk, Empty) or create entirely new ones to build your own AI development partner.
* **Freedom of Model Choice (Local LLM & Privacy):** **Connect any LLM freely** without vendor lock-in. Meet cost, security, and performance requirements while **ensuring data privacy** by utilizing commercial APIs or **local sLLMs**.
* **Practical AI Collaboration:** Beyond simple code generation, aim for an **intelligent partner** that **understands project context (RAG goal)** and solves problems together with developers. Caret will be a platform for exploring AI possibilities and **learning how to collaborate effectively with AI**.
* **Open Source Together (Apache 2.0):** Caret is an **open source project** where we think about and create the future of development in the AI era together. Let's share transparently, contribute freely, and grow together!

## Why Aren't Cursor / Windsurf Enough?
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

### Release Build

```powershell
# Clean existing build, reinstall dependencies, production build, generate VSIX
./clean-build-package.ps1
# Generated file: caret-dev-[version]-[timestamp].vsix
```

### Debug Build

```powershell
# Debug build, generate VSIX, setup logging
./debug-log.ps1
# Generated file: caret-dev-[version]-[timestamp]-debug.vsix
```

Logs are saved to `logs/cline-debug-[timestamp].log`. To view logs in real-time:

```powershell
# View real-time logs in PowerShell
Get-Content -Path "logs/cline-debug-[timestamp].log" -Wait
```

## Contributing

The Caret project welcomes your contributions! Whether it's bug reports, feature suggestions, or code contributions, all forms are welcome. Please refer to the `CONTRIBUTING.md` (coming soon) file for details.

## Documentation

For more detailed information, please refer to the documents in the [`caret-docs`](./caret-docs/) directory.

* [Architecture Overview](./caret-docs/architecture/extension-architecture.mmd)
* [Work Logs](./caret-docs/work-logs/)
* ... (additional important document links to be added)

## License

[Apache 2.0 © 2025 Cline Bot Inc.](./LICENSE) 
