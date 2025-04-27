# Caret에서 지원하는 모델

Caret은 21개의 서로 다른 제공자에서 제공하는 다양한 AI 모델에 접근할 수 있습니다. 이 문서는 제공자별로 정리된 모든 지원 모델을 나열합니다.

## 제공자 개요

| 제공자 | 모델 수 | 설명 |
|----------|--------------|-------------|
| Anthropic | 5 | 강력한 추론 능력을 갖춘 Claude 모델 |
| AWS Bedrock | 12 | Claude 및 기타 모델을 포함한 AWS 호스팅 모델 |
| OpenRouter | 1+ | 다양한 AI 모델을 위한 라우팅 서비스 |
| Vertex AI | 17 | Claude 및 Gemini 모델을 포함한 Google Cloud의 AI 플랫폼 |
| OpenAI | 다수 | OpenAI의 GPT 모델 |
| Ollama | 3 | 로컬 오픈소스 모델 |
| LM Studio | 1 | 로컬 모델 인터페이스 |
| Google Gemini | 14 | Google의 Gemini 시리즈 |
| OpenAI Native | 13 | GPT-4o를 포함한 직접 OpenAI 모델 |
| Requesty | 1+ | 여러 모델을 위한 API 라우팅 서비스 |
| Together AI | 3+ | 연구 중심 모델 |
| DeepSeek | 2 | DeepSeek의 특수 모델 |
| Qwen International | 20 | 알리바바의 Qwen 모델 (국제 버전) |
| Qwen Mainland | 22 | 알리바바의 Qwen 모델 (중국 본토 버전) |
| Doubao | 4 | 중국어 언어 모델 |
| Mistral AI | 10 | Mistral의 효율적인 모델 |
| VS Code LM | 2 | GitHub Copilot을 통한 VS Code의 언어 모델 |
| LiteLLM | 1+ | 여러 모델을 위한 통합 API |
| AskSage | 3 | 기업용 AI 플랫폼 모델 |
| X AI | 12 | X의 Grok 시리즈 모델 |
| SambaNova | 12 | 기업용 AI 모델 |
| HyperCLOVA X Local | 1 | 네이버 HyperCLOVA X SEED Vision 모델 로컬 실행 |

## 상세 모델 목록

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
- 기본값: anthropic/claude-3.7-sonnet
- 여러 제공자에 걸친 다양한 모델로 라우팅 지원

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
- 모든 표준 OpenAI 모델 지원

### 6. Ollama
- llama3
- mistral
- codellama

### 7. LM Studio
- local-model (로컬로 실행되는 모델을 위한 일반 자리표시자)

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
- anthropic/claude-3-7-sonnet-latest (기본값)
- 동적 모델 로딩 지원

### 11. Together AI
- meta-llama/Llama-3-70b-chat-hf
- mistral/Mistral-7B-Instruct-v0.2
- 동적 모델 로딩 지원

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
- Qwen International의 모든 모델에 추가로:
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
- gpt-3.5-turbo (기본값)
- 동적 모델 로딩 지원

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

## 새 모델 추가하기

Caret은 모델을 위해 JSON 기반 설정 시스템을 사용합니다. 새 모델을 추가하거나 기존 모델을 업데이트하려면 다음 단계를 따르세요:

### 1. JSON 파일 구조

각 제공자는 `src/shared/models/{provider}.json`에 다음 구조를 가진 전용 JSON 파일을 가집니다:

```json
{
  "defaultModel": "기본-모델-아이디",
  "models": {
    "모델-아이디": {
      "id": "모델-아이디",
      "name": "사람이 읽을 수 있는 모델 이름",
      "maxTokens": 8192,
      "contextWindow": 128000,
      "supportsImages": true,
      "supportsComputerUse": false,
      "supportsPromptCache": true,
      "inputPrice": 10.0,
      "outputPrice": 15.0,
      "cacheWritesPrice": 5.0,
      "cacheReadsPrice": 1.0,
      "description": "모델에 대한 선택적 설명"
    },
    "다른-모델-아이디": {
      // 모델 속성
    }
  }
}
```

### 2. 필수 및 선택 필드

필드 요구사항:
- **필수**: `id`, `name`
- **권장**: `maxTokens`, `contextWindow`, `inputPrice`, `outputPrice`
- **선택**: `supportsImages`, `supportsComputerUse`, `supportsPromptCache`, `cacheWritesPrice`, `cacheReadsPrice`, `description`, `thinkingConfig`

### 3. 특수 케이스

#### 계층화된 가격 책정
토큰 볼륨을 기준으로 계층화된 가격 책정이 있는 모델:

```json
"모델-아이디": {
  "id": "모델-아이디",
  "name": "계층화된 가격 책정이 있는 모델",
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

#### OpenAI 호환 모델
OpenAI 호환 모델의 경우, 다음 속성을 추가하세요:

```json
"모델-아이디": {
  // 표준 속성
  "temperature": 0.7,
  "isR1FormatRequired": false
}
```

#### 지역별 모델
Qwen과 같이 지역별 모델이 있는 제공자:
- `{provider}-{region}.json` 파일 생성 (예: `qwen-mainland.json`, `qwen-international.json`)

### 4. 새 제공자 추가하기

완전히 새로운 제공자를 추가하려면:

1. `src/shared/providers/{provider}.json`에 제공자 JSON 파일 생성
2. `src/shared/models/{provider}.json`에 모델 설정 파일 생성
3. `src/shared/api.ts`의 `ApiProvider` 타입을 업데이트하여 새 제공자 포함
4. 제공자별 로직에서 새 제공자가 적절히 처리되는지 확인

### 5. 새 모델 테스트하기

모델 추가 후:
1. JSON 구조가 유효한지 확인
2. UI에서 모델 정보가 올바르게 로드되는지 확인
3. 새 모델로 API 호출 테스트
4. 특수 기능(이미지 지원, 컴퓨터 사용)이 예상대로 작동하는지 확인

## 특수 기능

### 가격 계층
Gemini 2.5와 같은 일부 모델은 다양한 토큰 볼륨에 대해 계층화된 가격 구조를 사용합니다:
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

### 동적 모델 로딩
OpenRouter, Requesty, Together AI, LiteLLM과 같은 제공자는 동적 모델 로딩을 지원하여 설정에 명시적으로 정의되지 않은 모델에 접근할 수 있습니다.

### 특수 속성
일부 모델에는 특수 속성이 있습니다:
- `temperature`: OpenAI 호환 모델에서 사용
- `isR1FormatRequired`: 특정 제공자 모델에서 사용
- `supportsImages`: 모델이 이미지 입력을 처리할 수 있는지 여부
- `supportsComputerUse`: 모델이 컴퓨터 도구에 접근할 수 있는지 여부
