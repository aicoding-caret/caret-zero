# Caret Overlay Layer

This directory contains the Caret-specific overlay layer that extends Cline functionality.

## Architecture

The overlay architecture allows Caret to add its unique features on top of Cline without modifying the original Cline codebase:

```
caret/
├── backend/     # Caret-specific backend logic
│   ├── persona/       # PersonaManager and template characters
│   ├── prompts/       # JSON-based prompt system
│   ├── controllers/   # Message controllers
│   └── storage/       # Caret-specific storage
├── frontend/    # Caret-specific UI components
│   ├── components/    # React components
│   ├── context/       # State management
│   └── utils/         # Utility functions
├── assets/      # Templates, icons, rules
└── config/      # Integration logic
```

## Key Components

- **PersonaManager**: Manages user personas and template characters
- **Prompt System**: JSON-based system prompt management
- **UI Components**: PersonaSettingsView and related components
- **Integration Layer**: ExtensionEnhancer and WebviewEnhancer

## Development

This layer is designed to be completely independent from the Cline upstream, allowing for easy merging and maintenance. 