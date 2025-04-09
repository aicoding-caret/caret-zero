# Llama 4 로컬 실행 테스트 결과 보고서 (RTX 3090 x 2 환경)

## 1. 테스트 환경

*   **운영체제:** Windows
*   **GPU:** NVIDIA RTX 3090 x 2 (총 48GB VRAM)
*   **실행 도구:** vLLM (Docker), Ollama
*   **테스트 목표:** Llama 4 모델을 로컬 환경에서 실행하고 Cline에 연결

## 2. 시도 과정 및 결과 요약

### 시도 1: vLLM + Llama 4 Maverick Instruct (원본)

*   **모델:** `meta-llama/Llama-4-Maverick-17B-128E-Instruct`
*   **도구:** vLLM (Docker, `:latest` 이미지)
*   **과정:**
    *   초기 Docker 명령어 생성 (PowerShell 호환성 문제 발생)
    *   Windows 배치 파일(`.bat`) 생성 방식으로 변경
    *   배치 파일 실행
*   **결과:** **실패**
*   **실패 원인:**
    *   Hugging Face 모델 접근 권한 필요 (Gated Repo) - 접근 요청 후 승인 대기 상태 확인.
    *   (근본적) Reddit 및 apxml.com 정보 확인 결과, 원본 Maverick 모델은 **788GB 이상의 VRAM**을 요구하여 현재 하드웨어로 실행 불가능.

### 시도 2: vLLM + Llama 4 Scout Instruct (원본)

*   **모델:** `meta-llama/Llama-4-Scout-17B-16E-Instruct`
*   **도구:** vLLM (Docker, `:latest` 이미지)
*   **과정:**
    *   배치 파일 생성
    *   실행 시도
    *   `--gpu-memory-utilization 0.85` 옵션 추가 후 재시도
*   **결과:** **실패**
*   **실패 원인:**
    *   **CUDA 메모리 부족 오류 (`torch.OutOfMemoryError`)** 발생.
    *   apxml.com 정보 확인 결과, Scout 모델은 INT4 양자화 시에도 4K 컨텍스트에 **약 76.2GB VRAM**을 요구하여 현재 하드웨어(48GB VRAM)로 실행 불가능.

### 시도 3: vLLM + Llama 4 Maverick Instruct FP8

*   **모델:** `meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8`
*   **도구:** vLLM (Docker)
*   **과정:**
    *   배치 파일 생성 (초기 `v0.5.1` 이미지 사용) -> 실행 시 `KeyError: 'llama4'` (Transformers 버전 오류) 발생.
    *   Docker 이미지를 `:latest`로 변경 후 재시도 -> `EOFError` (작업자 프로세스 충돌) 발생.
    *   `:latest` 이미지 + `--gpu-memory-utilization 0.85` 옵션 추가 후 재시도 -> `EOFError` (작업자 프로세스 충돌) 발생.
*   **결과:** **실패**
*   **실패 원인:** vLLM 이미지 버전과 Llama 4 FP8 모델 간의 **호환성 문제** 또는 **FP8 모델 로딩 불안정성** 추정. 커뮤니티 토론에서도 FP8 형식(w8a16 vs w8a8)과 vLLM 호환성 문제가 언급됨.

### 시도 4: Ollama + Llama 4 Scout GGUF (johanteekens)

*   **모델:** `johanteekens/Llama-4-Scout-17B-16E-Instruct` (Ollama 라이브러리)
*   **도구:** Ollama
*   **과정:** `ollama run` 명령어 실행
*   **결과:** **실패**
*   **실패 원인:** 모델 다운로드(53GB) 후 로딩 실패 (`Error: unable to load model`). **VRAM 부족** 추정 (53GB > 48GB).

### 시도 5: Ollama + Llama 4 Scout GGUF (unsloth/IQ1_S)

*   **모델:** `unsloth/Llama-4-Scout-17B-16E-Instruct-UD-IQ1_S.gguf` (가장 작은 GGUF)
*   **도구:** Ollama (Modelfile 사용)
*   **과정:**
    *   GGUF 파일 다운로드 (33.8GB)
    *   `Modelfile` 생성
    *   `ollama create` 명령어로 모델 등록 (성공)
    *   `ollama run` 명령어로 실행 시도
*   **결과:** **실패**
*   **실패 원인:** 모델 로딩 실패 (`Error: unable to load model`). 가장 낮은 양자화 버전임에도 불구하고 실제 로딩에 필요한 **VRAM 부족** 추정.

## 3. 참고: 성공적인 실행 환경 사례 (dev.to 게시물 기반)

*   **게시물:** [A Step-By-Step Guide to Install Llama-4 Maverick 17B 128E Instruct](https://dev.to/nodeshiftcloud/a-step-by-step-guide-to-install-llama-4-maverick-17b-128e-instruct-4e5l) (AI 도구 접근 불가, 링크 자체는 유효할 수 있음)
*   **실행 모델:** `meta-llama/Llama-4-Maverick-17B-128E-Instruct` (원본 Instruct 모델)
*   **실행 환경:** NodeShift 클라우드 VM
    *   **GPU:** 2 x NVIDIA H200 (각 140GB, 총 **280GB VRAM**)
    *   **CPU:** 192 cores (XEON® PLATINUM 8568Y+)
    *   **RAM:** 504 GB
    *   **Disk:** 2 TB SSD
*   **실행 방법:** Hugging Face `transformers` 라이브러리 직접 사용 (vLLM/Ollama 아님)
*   **비용:** **$8.155/시간 (약 12,126원/시간)** (환율: 1 USD = 1487.13 KRW 기준)
*   **시사점:** Llama 4 Maverick 원본 모델을 실행하기 위해서는 **최소 200GB 이상의 VRAM**이 필요하며, 이는 현재 테스트 환경(48GB VRAM)보다 훨씬 높은 사양임.

## 4. 최종 결론

### 4.1. 코딩을 위한 sLLM추천
현재 사용자의 하드웨어 환경(RTX 3090 x 2, 48GB VRAM)과 테스트 시점의 vLLM 및 Ollama 공식 도구 버전으로는 **Llama 4 모델(Scout, Maverick 원본/FP8/GGUF 포함)을 로컬에서 안정적으로 실행하는 것이 매우 어렵습니다.** 주요 원인은 Llama 4 모델의 **매우 높은 VRAM 요구량**과 최신 모델/기술(FP8, MoE)과 로컬 실행 도구 간의 **호환성 또는 최적화 부족**으로 판단됩니다. 
 로컬에서 코딩의 목적이라면 이전에 성공적으로 실행했던 **Qwen 모델** (`start_vllm_qwen2.5_4bit.bat` 또는 Ollama의 `qwen2.5-coder:32b`)을 사용하는 것을
 권장합니다.Llama 4 모델을 꼭 사용해야 한다면, 향후 커뮤니티에서 더 최적화된 양자화 버전(예: vLLM 호환 4-bit)이 나오거나, vLLM/Ollama 등 로컬 실행 도구의 Llama 4 지원이 개선될 때까지 기다리는 것이 좋습니다.

### 4.2. 파인튜닝을 통한 LLAMA4의 활용 가능성
 Llama 4 모델의 성능을 경험하고 싶다면, 위 참고 사례처럼 고사양 GPU를 제공하는 클라우드 서비스나 API를 이용하는 것도 대안이 될 수 있습니다. 
 높은 비용이지만 파인튜닝을 통해 자체 모델을 소유할 수 있다는 장점이 있으며 필요에 따라 시장이 있을것으로 판단됩니다. 
 
  **파인튜닝 비용 고려 (PEFT 방식 중심):**
    *   **기본 가정:** Llama 4 Maverick 모델 추론에 사용된 고사양 환경(예: 2x H200, 280GB VRAM)이 PEFT 파인튜닝에도 필요하다고 가정합니다 (PEFT는 추론과 비슷하거나 약간 더 많은 VRAM 요구). 해당 하드웨어의 시간당 비용은 **$8.155 (약 12,126원)**입니다.
    *   **비용 계산:** PEFT 파인튜닝의 총 하드웨어 비용은 **(시간당 하드웨어 비용) x (총 학습 시간)**으로 추산할 수 있습니다.
    *   **학습 시간 변수:** 총 학습 시간은 예측하기 어려우며, 다음 요인에 따라 크게 달라집니다:
        *   데이터셋 크기 및 품질
        *   학습 에포크(Epochs) 수
        *   PEFT 설정 (LoRA rank 등)
        *   목표 성능 수준
    *   **예시 시나리오별 비용 추론 (하드웨어 비용만):**
        *   짧은 학습 (예: 10시간): $8.155/시간 * 10시간 = **$81.55 (약 121,260원)**
        *   중간 학습 (예: 50시간): $8.155/시간 * 50시간 = **$407.75 (약 606,300원)**
        *   긴 학습 (예: 100시간): $8.155/시간 * 100시간 = **$815.50 (약 1,212,600원)**
    *   **중요 참고 사항:**
        *   위 비용은 순수 **하드웨어 사용 비용**이며, 데이터 준비/정제 및 실험 비용은 포함되지 않았습니다.
        *   **전체 파인튜닝**은 추론보다 훨씬 많은 VRAM(4배 이상)과 비용이 필요하여 현실적으로 매우 어렵습니다.
        *   파인튜닝된 모델을 **실제로 사용할 때(추론)**도 **동일한 시간당 하드웨어 비용**($8.155/시간)이 계속 발생합니다.
    *   **결론:** PEFT 방식은 전체 파인튜닝보다 훨씬 비용 효율적이지만, Llama 4 같은 거대 모델은 여전히 상당한 비용이 발생합니다. 특수한 목적을 위해 **클라우드 크레딧 지원 등을 받을 수 있다면**, 높은 비용에도 불구하고 PEFT 파인튜닝을 시도해볼 가치는 있습니다.

---
*보고서 작성일: 2025-04-09*
*작성자: 알파*
