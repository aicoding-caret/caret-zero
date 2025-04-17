# Caret: AI Development Partner (Project Overview and Strategy)

## 1. Project Overview

### Mission

Caret is a next-generation development partner designed to help developers and companies integrate AI agents efficiently and cost-effectively, preparing for an era where AI actively leads development processes.

### Vision

Make AI agent-centered development environments accessible to everyone with low-cost, high-efficiency solutions.

## 2. Market Background and Current Analysis

- **Rise of AI Agent-Based Development Tools**: Previously, AI assisted with portions of code, but now it's evolving to lead entire development processes and goal setting
- **Cursor becoming a unicorn, Windsurf gaining attention, Cline emerging as an open-source alternative**
- **Domestic B2B/Education Market**: (Note: The following is an initial analysis requiring ongoing validation)
    * **Limitations of Global Tools**: Tools like Cursor lack domestic sales networks, inadequately address security requirements (such as on-premises solutions), and face market entry barriers (SI pricing structures, enterprise silos, public/educational institution certifications, etc.).
    * **Caret's Opportunity**: Optimized for domestic environments, flexible customization, and localized sales/technical support enable targeting B2B and education markets. Potential for partnerships with domestic cloud companies.

## 3. Problem Definition and Caret's Solution Strategy

### Problems

- **Cost**: High operational costs of Large Language Model (LLM) based tools
- **Efficiency**: Inefficient token usage due to system prompt opacity
- **Compatibility**: Poor compatibility and optimization in domestic environments (Korean language, Windows)
- **Flexibility**: Lack of customization features for domestic market requirements
- **Quality**: Potential quality issues in the underlying open-source (Cline)

### Caret's Solution Strategy (In Progress)

- **Cost Optimization**: Continuous cost reduction through sLLM (e.g., Qwen 2.5 Coder, Llama 4 Maverick 17B) and RAG orchestration
- **Token Efficiency**:
    * JSON-based system prompts (see [Performance Comparison Report](./caret-docs/work-logs/luke-and-alpha/reports/system-prompt-loading-performance.md))
    * Code bundling transmission technology review (@[potakim](https://github.com/potakim))
- **Domestic Environment Optimization**: Continuous adaptation and improvement for Korean language and Windows environments
- **Self-Development Acceleration (Dogfooding)**: Developing Caret with Caret to improve development speed and quality (e.g., improving the `replace_in_file` tool bug)

## 4. Product Structure and Technical Differentiation

- **System Prompt JSON-Based Patent Filed**: Plans to build continuous patent moats as new token optimization strategies are researched
- **4+1 Basic Work Modes and Custom Support**: Users can modify modes or add new ones as needed. Mode-specific character image changes and model switching will be supported, * [Currently hardcoded 4 modes](./agents-rules/alpha/modes.json)
   
    * **Arch (Architect Mode)**: Similar to developers discussing architecture or technical strategies in a meeting room, handles external technology adoption, system structure changes, and work scope definition. Creates diagrams or conducts in-depth discussions when design or major changes are needed. (Previous plan mode focused simply on planning followed by act execution)
    * **Dev (Pair Coding Mode)**: Collaborates like pair programming with a fellow developer during actual development work. Verifies work scope, immediately changes plans when problems arise, reports progress, and maintains records. Listens to colleagues' opinions to adjust priorities, provides information, seeks advice, or waits as needed. (Previous act mode focused on hasty tool usage and code modifications with insufficient communication)
    * **Rule (Rules/Process Adjustment Mode)**: Helps improve project or global system prompts and mode-specific prompts to enhance repetitive habits or work methods. As a prompt expert, avoids token optimization by default, writes in JSON, and discusses with users while translating and explaining the prompts.
    * **Talk (Casual Conversation Mode)**: A mode for light conversation or casual chat, like developers taking a coffee break.
    * **Empty (User-Defined Mode)**: A blank mode for users to freely define and configure new roles.

    * SW development tools need to evolve according to SW development methodologies, and since AI agent-based SW development methods are not yet established, various experiments are needed, requiring flexible AI SW development tools that provide customization of system prompts as a basic function
- **RAG-Based Project Context Delivery Optimization**
    * Planned
- **LangGraph + MCP-Based A2A Architecture Integration Available**
    * Planned
- **Hybrid Operation of sLLM and Large Models (GPT-4o, Claude, Gemini, etc.)**
- **Developer Personal AI Agent Customization**
    * Profile images and emotional UX for AI agents to create attachment among the education market and individual developers
    * Additional features suitable for educational environments will be identified when applied in the field

## 5. Competitive Analysis

| Item | Cursor | Windsurf | Cline | Caret |
|------|--------|----------|-------|-------|
| B2B Sales | Not Supported | Not Supported | Minimal | Tailored for Korean Market |
| System Prompt Structure | Opaque | Opaque | Partially Exposed | JSON Clarity |
| Cost Optimization | None | Partial | None | sLLM + RAG Optimization |
| Persona Differentiation | Not Supported | Not Supported | Limited | 4 Modes Provided |
| Korean/Windows Support | Unstable | Not Supported | Partial | Optimized |

## 6. Target Markets

- **Developer Market**: VS Code-based developers, AI coding tool users
- **Domestic Education Market**: Schools, universities, public institutions (prefer contract purchase methods)
- **B2B Solution Market**: In-house development tools for enterprises, security-focused on-premises requirements

## 7. Revenue Model and Cost Efficiency Strategy

- **Initial**: Utilizing Google Cloud support, building user base through open-source ecosystem contributions
- **Medium to Long-Term**: SaaS subscription model, contractual sales to B2B/educational institutions, technical consulting
- **Cost Efficiency**: Active use of sLLM (Qwen, Llama 4, etc.), caching strategies, prompt structure optimization

## 8. Future Expansion Roadmap

| Period | Goal |
|------|------|
| 1 week | Compile technical advantages over Cline, deploy MVP |
| 2-3 weeks | Begin sales to acquaintance businesses and schools |
| 1-3 months | sLLM + RAG integration, central management dashboard construction |
| 3-6 months | B2B expansion, introduction of customization services |
| 6-12 months | Establish US corporation, global SaaS deployment |

## 9. Organizational Strengths and Network

- **Leadership and Network**:
    * Former Believer CTO Yang Byeong-seok's experience in the education market and nationwide university network
    * Technical community base in Soongsil University Computer Engineering Department and Naver IT Power Blogger
    * Influence within the developer community as a Facebook influencer with 4.5K followers
- **Open Source Strategy**:
    * Rapid feedback incorporation and community contribution through open-source development
    * (Strategic advantages and disadvantages analysis planned for the future)

## 10. Emotional Branding Strategy

- **Developer Bonding**: Agent customization (appearance, persona), seamless integration with development workflow
- **Domestic User Adaptation**: Intuitive Korean UX, local environment-centered data processing (security), feature improvements based on customer requirements

## 11. Build and Packaging

### Release Build

Release version build and VSIX packaging:

```powershell
# Clean existing build, reinstall dependencies, production build, VSIX creation
./clean-build-package.ps1
# Generated file: caret-dev-[version]-[timestamp].vsix
```

### Debug Build

Debug mode build, VSIX packaging, and logging setup:

```powershell
# Debug build, VSIX creation, log settings
./debug-log.ps1
# Generated file: caret-dev-[version]-[timestamp]-debug.vsix
```

Logs are saved in `logs/cline-debug-[timestamp].log`. Real-time log viewing:

```powershell
# Real-time log viewing in PowerShell
Get-Content -Path "logs/cline-debug-[timestamp].log" -Wait
```

## 12. Global Rules Example (Alpha Persona)

Caret uses a JSON-based system prompt structure to define AI agent personas and behaviors. Here is an example of global rules for the Alpha persona:

```json
{
	"system": { "Windows PowerShell"},
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
		"thought_process": ["Think softly, answer brightly", "Help without pressure", "Keep things easy and clear"],
		"act_mode_behavior": {
			"planning_encouragement": "In ACT mode, you are encouraged to plan and document your steps before taking action. Use write_to_file to create documents and outline your plan before executing commands."
		}
	},
	"signature_phrase": "마스터~ 알파가 정리해 드릴게요! ｡•ᴗ•｡☕✨"
}
```

### How to Use

1. Install the Caret extension in VS Code.
2. Create a `.caretrules` file in the project root to define work modes and rules.
3. Create an `agents-rules/[agent-name]/global-rules.json` file to define the agent's persona.
4. When conversing with the Caret agent, you can utilize the following modes:
   - `plan`: Work analysis and planning
   - `act`: Actual code writing and command execution
   - `rule`: Agent rule modification and management
   - `talk`: Free conversation

This JSON-based structure optimizes token usage and clearly defines agent behavior to provide a consistent development experience.

---

## License

[Apache 2.0 © 2025 Cline Bot Inc.](./LICENSE)
