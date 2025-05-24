import axios from "axios";
import type { ApiHandlerOptions, ModelInfo, ApiStreamChunk, HyperClovaXVisionMessage } from "../../shared/api";
import type { ApiHandler } from "../index";
import type { ApiStream } from "../transform/stream";
import { hyperClovaXLocalModels, HyperClovaXLocalModelId, hyperClovaXLocalDefaultModelId } from "../../shared/api";
import type { Anthropic } from "@anthropic-ai/sdk";

// 어댑터 패턴: Anthropic.Messages.MessageParam[] → {prompt, image_base64}
// (context, 환경정보 등은 제외, user 메시지와 이미지 파일만 처리)
// HyperClovaX Vision: 마지막 user 대화 태그만 추출, 나머지(피드백/툴/환경 등)는 제외
function extractOnlyLastUserDialogue(text: string): string[] {
  const userTags = ['usermessage', 'user_message', 'task'];
  let last = '';
  for (const tag of userTags) {
    const regex = new RegExp(`<${tag}>([\s\S]*?)<\/${tag}>`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      last = match[1].trim();
    }
  }
  if (last) {return [last];}
  // 태그/피드백/툴/에러/시스템 안내 등은 제외
  if (/<environment_details>|<tool>|<error>|<feedback>|\[ERROR\]|\[Reminder\]|system|assistant/i.test(text)){return [];}
  if (text.trim().length > 1) {return [text.trim()];}
  return [];
}

function toHyperClovaXVisionPrompt(messages: Anthropic.Messages.MessageParam[]): { prompt: string; image_base64: string } {
  let promptArr: string[] = [];
  for (const msg of messages) {
    if (msg.role === 'user') {
      if (Array.isArray(msg.content)) {
        for (const c of msg.content) {
          if (typeof c === 'object' && c !== null && c.type === 'text' && 'text' in c) {
            promptArr.push(...extractOnlyLastUserDialogue(String((c as any).text ?? '')));
          } else if (typeof c === 'string') {
            promptArr.push(...extractOnlyLastUserDialogue(c));
          }
        }
      } else if (typeof msg.content === 'string') {
        promptArr.push(...extractOnlyLastUserDialogue(msg.content));
      }
    }
  }
  // 마지막 user 대화만 남기고 나머지 제거
  const prompt = promptArr.filter(Boolean).slice(-1).join('\n').trim();
  console.debug('[HyperClovaX][Vision] (대화 전용/최신 user만) 최종 전송 payload:', JSON.stringify({ prompt }, null, 2));
  return { prompt, image_base64: '' };
}

// HyperClovaX Vision 응답 파서: 마지막 assistant 블록만 추출
function parseClovaResponse(raw: string): string {
  // 여러 assistant 블록이 있으면 마지막 것만 추출
  const matches = [...raw.matchAll(/assistant\s*([\s\S]*?)(?=\n(?:user|assistant|$))/gi)];
  let result = '';
  if (matches.length) {
    result = matches[matches.length - 1][1].trim();
  } else {
    // assistant로 시작해서 끝까지 추출 (보완)
    const assistantIdx = raw.lastIndexOf('assistant');
    if (assistantIdx !== -1) {
      result = raw.slice(assistantIdx + 'assistant'.length).trim();
    }
  }
  // <task>...</task>만 있으면 그 부분
  if (!result) {
    const taskMatch = raw.match(/<task>([\s\S]*?)<\/task>/i);
    if (taskMatch) {result = taskMatch[1].trim();}
  }
  // 그 외엔 마지막 줄
  if (!result) {
    const lines = raw.trim().split(/\r?\n/);
    result = lines[lines.length - 1].trim();
  }
  // "클로바 : {메시지}" 형태로 반환
  if (result) {
    return `클로바 : ${result}`;
  }
  return '';
}

export class HyperClovaXHandler implements ApiHandler {
  private options: ApiHandlerOptions;
  private modelInfo: ModelInfo | undefined;

  constructor(options: ApiHandlerOptions) {
    this.options = options;
    this.modelInfo = this.options.apiModelId ? hyperClovaXLocalModels[this.options.apiModelId as keyof typeof hyperClovaXLocalModels] : undefined;
    if (!(this.options as any).hyperclovaxUrl) {
      throw new Error("HyperCLOVA X SLLM 서버 URL (hyperclovaxUrl)이 설정되지 않았습니다.");
    }
  }

  createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
    const sllmUrl = (this.options as any).hyperclovaxUrl;
    // 어댑터로 변환 (샘플과 완벽히 동일)
    const visionPayload = toHyperClovaXVisionPrompt(messages);
    const endpoint = `${sllmUrl.replace(/\/$/, "")}/tool/generate_hyperclovax_vision`;
    console.debug('[HyperClovaX][Vision] POST', endpoint, visionPayload);
    return (async function* (): AsyncGenerator<ApiStreamChunk> {
      try {
        const response = await axios.post(endpoint, visionPayload, { timeout: 60000 });
        console.debug('[HyperClovaX][Vision] RESPONSE', response.data);
        const textRaw = response.data.text ?? response.data.result;
        if (textRaw) {
          const text = parseClovaResponse(textRaw);
          yield { type: "text", text };
        } else {
          throw new Error("SLLM 서버 응답에 text/result 필드가 없습니다.");
        }
      } catch (error: any) {
        console.error('[HyperClovaX][Vision] ERROR', error, error?.response?.data);
        const msg = error?.response?.data?.error || error.message;
        throw new Error(`HyperCLOVAX SLLM 호출 실패: ${msg}`);
      }
    })();
  }

  getModel(): { id: string; info: ModelInfo } {
    const modelId = this.options.apiModelId as HyperClovaXLocalModelId | undefined;
    const defaultModelId = hyperClovaXLocalDefaultModelId;
    const currentModelId = modelId && modelId in hyperClovaXLocalModels ? modelId : defaultModelId;
    const modelInfo = hyperClovaXLocalModels[currentModelId];
    if (!modelInfo) {
      throw new Error(`Model info not found for ${currentModelId}`);
    }
    return {
      id: currentModelId,
      info: modelInfo,
    };
  }
}
