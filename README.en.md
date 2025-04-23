[이 문서를 한국어로 읽기](./README.md)

# Caret: Your AI Development Partner ✨

Welcome to Caret! We aim to build a next-generation development environment within VS Code where developers and AI agents collaborate and grow together. Caret enhances productivity and helps tackle complex problems through close partnership with AI. ｡•ᴗ•｡💕

> **Note:** This project is a personal fork of the original [Cline](https://github.com/cline/cline) project by [fstory97](https://github.com/fstory97). Building upon Cline's excellent foundation, we are exploring deeper interactions with AI agents and more intelligent development support features. 🌿

## Vision & Core Goals

**Why Caret?** Feeling constrained by the "black box" nature of existing AI coding tools? Do you wish you could control your AI agent your way, connect the models you want, and truly customize your development workflow? Caret aims for an experience where **developers and AI collaborate as trusted colleagues**. We provide an environment where you can understand AI transparently, extend it freely, and grow together like the best teammates.

*   **Developer-Led AI Orchestration:** Instead of opaque internal logic, **define and control AI behavior directly** using clear **JSON rules (`.caretrules`, personas)**. Understand how your AI works and tailor it to fit your project and style.
*   **Customizable Workflows (4+1 Modes):** Go beyond predefined settings and **design the AI's roles and interaction methods yourself**. Modify the provided modes (Arch, Dev, Rule, Talk, Empty) or build entirely new ones to create your unique AI development partner.
*   **Freedom of Model Choice (Local LLMs & Privacy):** Connect **any LLM you desire**, free from vendor lock-in. Utilize commercial APIs or leverage **local sLLMs** to meet your needs for cost, security, and performance, while **ensuring data privacy**.
*   **Genuine AI Collaboration:** More than just code generation, we aim for an **intelligent partner** that **understands project context (RAG goal)** and works with you to solve problems. Caret will be a platform to explore AI's potential and **learn how to collaborate effectively with AI**.
*   **Open Source Collaboration (Apache 2.0):** Caret is an **open-source project** built together to explore the future of AI-driven development. Share transparently, contribute freely, and let's evolve together!

## Getting Started

**Caret is currently under active development, and many features are still in the works.** We are a project built with your interest and participation! Please watch our progress! ☕

1.  **Code Repository:** Track our development progress at the [aicoding-caret/caret-zero](https://github.com/aicoding-caret/caret-zero) repository (currently in initial setup!). Star ⭐ the repository to follow along if you're interested in building and using the code directly.
2.  **Installation (Future):** Once officially released, you'll be able to install "Caret" by searching in the VS Code Marketplace. (Coming soon!)
3.  **Configuration (Post-Installation):**
    *   Create a `.caretrules` file in your project root to define work modes and rules.
    *   Create a persona file at `agents-rules/[agent-name]/global-rules.json` to set up your agent's personality (e.g., [`agents-rules/alpha/global-rules.json`](./agents-rules/alpha/global-rules.json)).
4.  **Participation & Contribution:** Star ⭐ the repository or leave your feedback via Issues to contribute or stay updated!
5.  **Community (Planned):** Updates and discussions will also happen in the [AICoding-Caret Facebook Group](https://facebook.com/aicoding-caret). We plan to offer **various educational materials and programs** through the community in the future.
6.  **Easy Access (Future Plan):** We envision a future where you can create an account on the Caret website (planned for caret.team) to **use Caret's core features more easily**, without the hassle of configuring individual LLM API keys.

## Future Roadmap (Brief)

Caret will continue to evolve. Our key directions include: More detailed plans can be found [here](<path_to_detailed_plan_document>).

*   **Advanced RAG:** Enhancing project context understanding (Vector DB integration, auto-sync, etc.).
*   **Multi-Agent Collaboration:** Implementing seamless cooperation between specialized agents (Tester, Doc Writer, etc.).
*   **Vibe Coding UX Improvements:** Optimizing real-time interaction and development flow between developers and AI.
*   **Expanded LLM Support:** Providing more options and optimizations for various local/cloud models.
*   **Plugin System (Long-term Goal):** Establishing a structure for users to extend Caret's functionality.

Your feedback and contributions will enrich Caret's roadmap!

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

## Contributing

We welcome contributions to the Caret project! Whether it's bug reports, feature suggestions, or code contributions, all forms are appreciated. Please refer to the `CONTRIBUTING.md` file (to be added) for details.

## Community & Communication Channels (Planned)
*   **GitHub Issues:** For technical discussions, bug reports, feature suggestions.
*   **Facebook Group:** [AICoding-Caret](https://facebook.com/aicoding-caret) (Latest news, user discussions).

---

## License

[Apache 2.0 © 2025 Cline Bot Inc.](./LICENSE) 