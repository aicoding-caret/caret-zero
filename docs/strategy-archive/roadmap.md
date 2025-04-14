# Project Roadmap: Cline-Alpha (English)

<div align="center"><sub>
🇰🇷 <a href="./roadmap.ko.md">한국어</a> | 🇬🇧 English
</sub></div>

---

This document outlines the development roadmap for the Cline-Alpha project, prioritizing features based on the overall [Project Vision](./project-vision.md).

### Short-Term Goals (Phase 1)

These are the initial steps focused on foundational improvements and enabling core functionalities.

1.  **Mode Enhancements:** Refine agent modes defined in `.clinerules` for better control and clarity.
    *   Define specific file access permissions (Read/Write) per mode:
        *   `plan`: RW access to `/docs/`, improve system prompt for planning.
        *   `rule`: RW access to `/agents-rules/alpha/`.
        *   `act`: Full RW access.
        *   `talk`: No RW access.
    *   Implement mechanisms to enforce these permissions within the agent's operation cycle.

2.  **RAG Integration (Basic):** Implement basic Retrieval-Augmented Generation for project context.
    *   Set up a vector database (e.g., using local embeddings and a library like ChromaDB or LanceDB) for project documentation (`/docs/`).
    *   Integrate a retrieval mechanism that fetches relevant document chunks based on user queries or task context.
    *   Inject retrieved context into the LLM prompt (can be cloud-based LLM initially).

3.  **Conversation Archiving & Basic Fine-tuning Structure:** Establish the groundwork for personalization.
    *   Implement a system to automatically archive conversations (user prompts, agent responses, tool usage, feedback).
    *   Structure the archive format for easy processing (e.g., JSONL).
    *   *Note: Full fine-tuning automation is a longer-term goal, but setting up data collection is the first step.*

### Mid-Term Goals (Phase 2)

Building upon the foundation, these goals focus on more advanced agent capabilities.

4.  **Multi-Agent Architecture:** Introduce the concept of multiple, specialized agents.
    *   **4.1. Role Switching:** Implement a mechanism to switch between different agent "personas" or configurations (defined possibly in `/agents-rules/alpha/`) with distinct system prompts or capabilities.
    *   **4.2. Workflow Orchestration (e.g., LangGraph):** Explore and integrate tools like LangGraph to define and execute multi-step, multi-agent workflows. Allow the user (Master) to act as a review/approval node within these graphs.
    *   **4.3. (Exploratory) Concurrent Agent Architecture:** Investigate architectural changes needed to potentially allow multiple agents to operate concurrently on sub-tasks (might be complex).

5.  **Enhanced RAG:** Improve the RAG system.
    *   Expand indexing to include codebase (e.g., function definitions, comments).
    *   Refine retrieval strategies (e.g., hybrid search, re-ranking).

### Long-Term Goals (Phase 3+)

These goals align with the ultimate vision of a truly personalized, metacognitive AI partner.

6.  **Metacognitive Capabilities:** Develop features that allow the agent to reflect on its performance and learn.
    *   Implement mechanisms for the agent to self-critique its responses or actions.
    *   Explore ways for the agent to identify knowledge gaps and suggest learning strategies (e.g., "Should I read this file for better context?").

7.  **Automated Fine-tuning Pipeline:** Fully automate the process of using archived data to fine-tune local LLMs.
    *   Develop scripts for data preprocessing and formatting.
    *   Integrate with local fine-tuning libraries or platforms.

8.  **Advanced Multi-Agent Collaboration:** Refine multi-agent interactions, potentially including negotiation or more complex coordination patterns.

---
*Last Updated: 2025-03-27*
