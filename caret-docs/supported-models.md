# Supported Models in Caret

Caret provides access to a wide range of AI models across 21 different providers. This document lists all supported models organized by provider.

## Provider Overview

| Provider | Models Count | Description |
|----------|--------------|-------------|
| Anthropic | 5 | Claude models with strong reasoning capabilities |
| AWS Bedrock | 12 | AWS-hosted models including Claude and others |
| OpenRouter | 1+ | Routing service for many AI models |
| Vertex AI | 17 | Google Cloud's AI platform with Claude and Gemini models |
| OpenAI | Multiple | OpenAI's GPT models |
| Ollama | 3 | Local open-source models |
| LM Studio | 1 | Local model interface |
| Google Gemini | 14 | Google's Gemini series |
| OpenAI Native | 13 | Direct OpenAI models including GPT-4o |
| Requesty | 1+ | API routing service for multiple models |
| Together AI | 3+ | Research-focused models |
| DeepSeek | 2 | DeepSeek's specialized models |
| Qwen International | 20 | Alibaba's Qwen models (international version) |
| Qwen Mainland | 22 | Alibaba's Qwen models (mainland version) |
| Doubao | 4 | Chinese language models |
| Mistral AI | 10 | Mistral's efficient models |
| VS Code LM | 2 | VS Code's language models via GitHub Copilot |
| LiteLLM | 1+ | Unified API for multiple models |
| AskSage | 3 | Enterprise AI platform models |
| X AI | 12 | X's Grok series models |
| SambaNova | 12 | Enterprise AI models |
| HyperCLOVA X Local | 1 | Local execution of Naver's HyperCLOVA X SEED Vision model |

## Detailed Model List

### 1. Anthropic
- claude-3-7-sonnet-20250219
- claude-3-5-sonnet-20241022
- claude-3-5-haiku-20241022
- claude-3-opus-20240229
- claude-3-haiku-20240307

### 2. AWS Bedrock
- amazon.nova-pro-v1:0
- amazon.nova-lite-v1:0
- amazon.nova-micro-v1:0
- anthropic.claude-3-7-sonnet-20250219-v1:0
- anthropic.claude-3-5-sonnet-20241022-v2:0
- anthropic.claude-3-5-haiku-20241022-v1:0
- anthropic.claude-3-5-sonnet-20240620-v1:0
- anthropic.claude-3-opus-20240229-v1:0
- anthropic.claude-3-sonnet-20240229-v1:0
- anthropic.claude-3-haiku-20240307-v1:0
- anthropic.claude-v2:1
- deepseek.r1-v1:0

### 3. OpenRouter
- Default: anthropic/claude-3.7-sonnet
- Supports routing to many models across providers

### 4. Vertex AI
- claude-3-7-sonnet@20250219
- claude-3-5-sonnet-v2@20241022
- claude-3-5-sonnet@20240620
- claude-3-5-haiku@20241022
- claude-3-opus@20240229
- claude-3-haiku@20240307
- gemini-2.0-flash-001
- gemini-2.0-flash-thinking-exp-1219
- gemini-2.0-flash-exp
- gemini-2.5-pro-exp-03-25
- gemini-2.5-pro-preview-03-25
- gemini-2.0-flash-thinking-exp-01-21
- gemini-1.5-flash-002
- gemini-1.5-flash-exp-0827
- gemini-1.5-flash-8b-exp-0827
- gemini-1.5-pro-002
- gemini-1.5-pro-exp-0827

### 5. OpenAI
- Supports all standard OpenAI models

### 6. Ollama
- llama3
- mistral
- codellama

### 7. LM Studio
- local-model (generic placeholder for locally running models)

### 8. Google Gemini
- gemini-2.5-pro-exp-03-25
- gemini-2.5-pro-preview-03-25
- gemini-2.0-flash-001
- gemini-2.0-flash-lite-preview-02-05
- gemini-2.0-pro-exp-02-05
- gemini-2.0-flash-thinking-exp-01-21
- gemini-2.0-flash-thinking-exp-1219
- gemini-2.0-flash-exp
- gemini-1.5-flash-002
- gemini-1.5-flash-exp-0827
- gemini-1.5-flash-8b-exp-0827
- gemini-1.5-pro-002
- gemini-1.5-pro-exp-0827
- gemini-exp-1206

### 9. OpenAI Native
- o3
- o4-mini
- gpt-4.1
- gpt-4.1-mini
- gpt-4.1-nano
- o3-mini
- o1
- o1-preview
- o1-mini
- gpt-4o
- gpt-4o-mini
- chatgpt-4o-latest
- gpt-4.5-preview

### 10. Requesty
- anthropic/claude-3-7-sonnet-latest (default)
- Supports dynamic model loading

### 11. Together AI
- meta-llama/Llama-3-70b-chat-hf
- mistral/Mistral-7B-Instruct-v0.2
- Supports dynamic model loading

### 12. DeepSeek
- deepseek-chat
- deepseek-reasoner

### 13. Qwen International
- qwen2.5-coder-32b-instruct
- qwen2.5-coder-14b-instruct
- qwen2.5-coder-7b-instruct
- qwen2.5-coder-3b-instruct
- qwen2.5-coder-1.5b-instruct
- qwen2.5-coder-0.5b-instruct
- qwen-coder-plus-latest
- qwen-plus-latest
- qwen-turbo-latest
- qwen-max-latest
- qwen-coder-plus
- qwen-plus
- qwen-turbo
- qwen-max
- deepseek-v3
- deepseek-r1
- qwen-vl-max
- qwen-vl-max-latest
- qwen-vl-plus
- qwen-vl-plus-latest

### 14. Qwen Mainland
- All models from Qwen International plus:
- qwq-plus-latest
- qwq-plus

### 15. Doubao
- doubao-1-5-pro-256k-250115
- doubao-1-5-pro-32k-250115
- deepseek-v3-250324
- deepseek-r1-250120

### 16. Mistral AI
- mistral-large-2411
- pixtral-large-2411
- ministral-3b-2410
- ministral-8b-2410
- mistral-small-latest
- mistral-small-2501
- pixtral-12b-2409
- open-mistral-nemo-2407
- open-codestral-mamba
- codestral-2501

### 17. VS Code LM
- copilot-gpt-4
- copilot-gpt-3.5

### 18. LiteLLM
- gpt-3.5-turbo (default)
- Supports dynamic model loading

### 19. AskSage
- gpt-4o
- claude-35-sonnet
- claude-37-sonnet

### 20. X AI
- grok-3-beta
- grok-3-fast-beta
- grok-3-mini-beta
- grok-3-mini-fast-beta
- grok-2-latest
- grok-2
- grok-2-1212
- grok-2-vision-latest
- grok-2-vision
- grok-2-vision-1212
- grok-vision-beta
- grok-beta

### 21. SambaNova
- Meta-Llama-3.3-70B-Instruct
- DeepSeek-R1-Distill-Llama-70B
- Llama-3.1-Swallow-70B-Instruct-v0.3
- Llama-3.1-Swallow-8B-Instruct-v0.3
- Meta-Llama-3.1-405B-Instruct
- Meta-Llama-3.1-8B-Instruct
- Meta-Llama-3.2-1B-Instruct
- Qwen2.5-72B-Instruct
- Qwen2.5-Coder-32B-Instruct
- QwQ-32B-Preview
- QwQ-32B
- DeepSeek-V3-0324

### 22. HyperCLOVA X Local
- naver-hyperclovax/HyperCLOVAX-SEED-Vision-Instruct-3B

## Adding New Models

Caret uses a JSON-based configuration system for models. To add new models or update existing ones, follow these steps:

### 1. JSON File Structure

Each provider has a dedicated JSON file in `src/shared/models/{provider}.json` with the following structure:

```json
{
  "defaultModel": "model-id-of-default-model",
  "models": {
    "model-id": {
      "id": "model-id",
      "name": "Human-readable Model Name",
      "maxTokens": 8192,
      "contextWindow": 128000,
      "supportsImages": true,
      "supportsComputerUse": false,
      "supportsPromptCache": true,
      "inputPrice": 10.0,
      "outputPrice": 15.0,
      "cacheWritesPrice": 5.0,
      "cacheReadsPrice": 1.0,
      "description": "Optional description of the model"
    },
    "another-model-id": {
      // model properties
    }
  }
}
```

### 2. Required and Optional Fields

Field requirements:
- **Required**: `id`, `name`
- **Recommended**: `maxTokens`, `contextWindow`, `inputPrice`, `outputPrice`
- **Optional**: `supportsImages`, `supportsComputerUse`, `supportsPromptCache`, `cacheWritesPrice`, `cacheReadsPrice`, `description`, `thinkingConfig`

### 3. Special Cases

#### Tiered Pricing
For models with tiered pricing based on token volume:

```json
"model-id": {
  "id": "model-id",
  "name": "Model with Tiered Pricing",
  "inputPriceTiers": [
    { "tokenLimit": 200000, "price": 1.25 },
    { "tokenLimit": 9999999999, "price": 2.5 }
  ],
  "outputPriceTiers": [
    { "tokenLimit": 200000, "price": 10.0 },
    { "tokenLimit": 9999999999, "price": 15.0 }
  ]
}
```

#### OpenAI Compatible Models
For OpenAI-compatible models, add these properties:

```json
"model-id": {
  // standard properties
  "temperature": 0.7,
  "isR1FormatRequired": false
}
```

#### Region-Specific Models
For providers like Qwen with region-specific models:
- Create `{provider}-{region}.json` files (e.g., `qwen-mainland.json`, `qwen-international.json`)

### 4. Adding a New Provider

To add a completely new provider:

1. Create a provider JSON file in `src/shared/providers/{provider}.json`
2. Create a model configuration file in `src/shared/models/{provider}.json`
3. Update the `ApiProvider` type in `src/shared/api.ts` to include the new provider
4. Ensure the provider is properly handled in any provider-specific logic

### 5. Testing New Models

After adding models:
1. Verify the JSON structure is valid
2. Check that the model information loads correctly in the UI
3. Test API calls with the new model
4. Verify any special features (image support, computer use) work as expected

## Special Features

### Pricing Tiers
Some models like Gemini 2.5 use tiered pricing structures for different token volumes:
```json
"pricing": {
  "inputTiers": [
    { "tokenLimit": 200000, "price": 1.25 },
    { "tokenLimit": 9999999999, "price": 2.5 }
  ],
  "outputTiers": [
    { "tokenLimit": 200000, "price": 10.0 },
    { "tokenLimit": 9999999999, "price": 15.0 }
  ]
}
```

### Dynamic Model Loading
Providers like OpenRouter, Requesty, Together AI, and LiteLLM support dynamic model loading, allowing access to models not explicitly defined in the configuration.

### Special Properties
Some models have special properties:
- `temperature`: Used by OpenAI compatible models
- `isR1FormatRequired`: Used by certain provider models
- `supportsImages`: Indicates if the model can process image inputs
- `supportsComputerUse`: Indicates if the model can access computer tools
