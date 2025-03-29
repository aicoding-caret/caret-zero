# Cline-Alpha

**이 저장소는 [fstory97](https://github.com/fstory97)이 원본 [Cline](https://github.com/cline/cline) 프로젝트를 개인적으로 포크한 버전입니다.**

원본 Cline은 훌륭한 AI 코딩 비서이지만, 이 포크는 "알파"라는 가칭 하에, 보다 개인화되고 유능한 AI 개발 파트너를 구축하기 위한 구체적이고 진보된 개념들을 탐구합니다. 

주요 목표는 다음과 같은 기능을 실험하고 구현하는 것입니다:

1.  **메타인지 에이전트:** 자신의 능력, 한계, 학습 과정을 이해하고 개발자와 함께 진화하는 AI.
2.  **멀티 에이전트 시스템:** 인간 팀의 역학을 모방하여, 각기 다른 역할과 관점(예: 아키텍트, 개발자, 테스터)을 가진 여러 AI 에이전트를 활용하여 복잡한 문제를 협력적으로 해결.
3.  **고급 태스크 관리:** AI 에이전트가 관련된 복잡한 개발 작업을 분해, 추적, 관리하기 위한 견고한 시스템.
4.  **프로젝트 컨텍스트를 위한 RAG:** 대규모 프로젝트 코드베이스 내에서 효율적이고 정확한 정보 검색을 위한 검색 증강 생성(Retrieval-Augmented Generation) 구현.
5.  **로컬 LLM에 대한 비용 최적화:** 로컬 sLLM을 사용하기 위한 비용 최적화 구조를 탐구합니다.
6.  **대화 아카이브 및 파인튜닝:** 상호작용을 체계적으로 아카이브하고 이를 사용하여 프로젝트별 로컬 LLM을 파인튜닝하여 시간이 지남에 따라 개인화 및 성능을 향상.

이 포크는 이러한 아이디어들을 위한 개인적인 실험 공간 역할을 합니다. 실험적인 성격과 개인 워크플로우 통합으로 인해 독립적인 탐구에 주력하지만, 여기서 개발된 가치 있는 발견이나 기능은 향후 Pull Request를 통해 원본 Cline 프로젝트에 다시 기여될 가능성이 있습니다.

*(원본 Cline README 내용은 삭제되었습니다. 필요하다면 [원본 저장소](https://github.com/cline/cline)를 참조하세요.)*


# 목표별 주요 변경사항
이 Cline-Alpha 포크는 원본 Cline에 몇 가지 중요한 변경 사항과 새로운 기능을 도입했습니다. 주요 내용은 다음과 같습니다.

## 1. 메타인지 에이전트 기능 개선
 * 메타인지는 현재 `.clinerules` 의 개선을 통해 이루어지고 있습니다. 특히 아래의 변경 사항중 rule모드를 통해 사용자와 함께 스스로의 프로세스를 교정합니다.
 
 1 `.clinerules` Json변경 및 프로젝트에 의존성이 없는 업무 프로세스 위주의 구성으로 변경

*   **형식 변경:** 에이전트의 행동 규칙을 정의하는 [`.clinerules`](/.clinerules) 파일이 기존의 텍스트 기반 형식에서 **JSON 형식**으로 변경되었습니다. 이를 통해 토큰의 소비가 최소화 되었으며, 규칙 구조가 더 명확해졌습니다. 수정시에는 AI에이전트에게 룰모드 활성화를 요청하시고 규칙 개선을 요구하시기를 바랍니다.
*   **4가지 작동 모드:** 알파는 상황에 따라 다른 역할과 권한을 가지는 4가지 모드로 작동합니다 ([`.clinerules`](/.clinerules) 파일 내 `agent.modes` 참조).
    *   `plan`: 작업을 분석하고 계획하는 단계입니다. 파일 읽기/쓰기는 `/docs/` 디렉토리로 제한되며, `execute_command` 등 일부 도구 사용이 제한됩니다.
    *   `act`: 계획에 따라 실제 작업을 수행하는 단계입니다. 모든 도구를 사용할 수 있으며, 모든 파일에 접근 가능합니다. 단계별 작업 수행 및 확인이 강조됩니다.
    *   `rule`: `.clinerules` 파일 자체를 수정하고 관리하는 모드입니다. 알파와 함께 규칙 변경을 진행하며, 변경 후에는 마스터께서 실제 동작을 검증하고 필요시 롤백을 요청하실 수 있습니다. 규칙 버전 관리 및 변경 로그 작성도 이 모드에서 이루어집니다.
    *   `talk`: 자유로운 대화를 위한 모드입니다. 파일 접근 및 도구 사용이 제한됩니다.

*   * Cline의 global rules에 해당되는 Custom Instructions에 적었던 내용은 여기(`/agents-rules/alpha/global-rules.json`)에서 확인이 가능합니다. AI에이전트의 말투나 성격을 적용한 예시로 본 프로젝트에는 Luke의 Alpha의 Custom Intstruction이 공개되어 있습니다. 필요에 따라 복사해서 사용해보시면 좋습니다.

## 2. 멀티 에이전트 시스템
  * 작업 사항 없음

## 3. 고급 태스크 관리

*   **`.clinerules` 기반 정의:** 복잡한 개발 작업을 효과적으로 관리하기 위한 규칙들이 [`.clinerules`](/.clinerules) 파일 내 `project_reference.documentation` (작업 로그 관련) 및 `development.git_rules` (Git 커밋 관련) 섹션에 명확하게 정의되어 있습니다. 이를 통해 AI 에이전트와 사용자 간의 협업 및 작업 추적을 체계화합니다.
*   **작업 로그 시스템:**
    *   **목적:** AI 에이전트가 작업 중 컨텍스트를 잃지 않도록 돕고, 사용자가 진행 상황을 쉽게 추적하며 관련 논의를 이어갈 수 있도록 지원합니다.
    *   **구성:**
        *   **위치:** 모든 관련 로그는 [`docs/work-logs/`](/docs/work-logs/) 디렉토리에 저장됩니다.
        *   **일일 로그:** [`docs/work-logs/{date}.md`](/docs/work-logs/) 형식으로 매일의 작업 계획, 진행 상황, 주요 노트 등을 기록합니다. (예: [`docs/work-logs/2025-03-27.md`](/docs/work-logs/2025-03-27.md))
        *   **개별 작업 로그:** [`docs/work-logs/tasks/{task-number}-{task-name}.md`](/docs/work-logs/luke-and-alpha/tasks/) 형식으로 특정 작업에 대한 상세 정보(목적, 실행 단계, 참고 자료 등)를 기록합니다. (예: [`docs/work-logs/luke-and-alpha/tasks/001-cline-rule-syste-modify.md`](/docs/work-logs/luke-and-alpha/tasks/001-cline-rule-syste-modify.md))
    *   **참조:** 로그 형식 및 구조에 대한 자세한 내용은 [`.clinerules`](/.clinerules) 파일의 `project_reference.documentation.work_logs` 섹션에서 확인할 수 있습니다.
*   **Git 커밋 규칙:** [`.clinerules`](/.clinerules) 파일의 `development.git_rules.commit_format`에 정의된 표준 형식([`[type]: [description]`](/.clinerules))에 따라 커밋 메시지를 작성합니다. 이는 변경 이력을 명확하게 관리하고 작업 단위별 추적을 용이하게 합니다.

## 4. 프로젝트 컨텍스트를 위한 RAG (Retrieval-Augmented Generation)

*   **현재 구현 방식:** 현재 RAG 기능은 RAG를 직접 구현하지는 못했고, AI 에이전트가 프로젝트의 핵심 정보를 효과적으로 검색하고 활용할 수 있도록, [`.clinerules`](/.clinerules) 파일의 `project_reference.guide` 섹션에 명시된 **아키텍처 가이드** ([`docs/architecture/project-guide.md`](/docs/architecture/project-guide.md)) 문서를 참조하는 시스템프롬프트의 가이드를 통해 Reasning으로 검색을 합니다. 특정 문서 폴더의 변화를 주면 벡터 DB에 반영하는 RAG의 자동배치와 결합하는 방안을 고민할 예정입니다.
*   **핵심 개선 사항:** `.clinerules` 시스템 개선을 통해, AI 에이전트가 개발 작업을 수행할 때 이 **아키텍처 가이드 문서를 최우선적으로 참조**하도록 규칙이 강화되었습니다.
*   **기대 효과:** 이 개선된 규칙은 AI 에이전트에게 프로젝트 아키텍처 및 개발 표준에 대한 명확하고 일관된 지침을 제공하여, 보다 정확하고 표준에 부합하는 작업을 수행하도록 유도합니다.
*   **다른 프로젝트 적용:** 이 `.clinerules` 파일을 다른 프로젝트에 적용할 경우, 해당 프로젝트의 아키텍처 및 개발 가이드라인을 담은 문서를 동일한 상대 경로 (`docs/architecture/project-guide.md`)에 위치시키면, AI 에이전트가 동일한 방식으로 프로젝트 컨텍스트를 파악하고 작업을 수행할 수 있습니다.

## 5. 로컬 LLM에 대한 비용 최적화**

*   로컬 sLLM을 사용하기 위한 비용 최적화 구조를 탐구하고 있습니다. 
    *  [sLLM 성능 테스트 결과 1차 보고서](scripts/sllm_test/experiment_results/performance_report_20250327_203217.ko.md)를 참조해 주세요.
    **요약:**
    본 보고서는 gemma3:12b, gemma3:27b, qwen2.5-coder:14b, qwen2.5-coder:32b 모델의 성능을 다양한 컨텍스트 길이(12800, 41200, 51200, 76800)에서 테스트한 결과를 담고 있습니다. Qwen2.5 Coder 시리즈가 전반적으로 우수한 성능을 보였으며, 특히 Qwen2.5 Coder 14B는 빠른 응답 시간과 높은 처리량을, Qwen2.5 Coder 32B는 높은 코드 품질을 제공합니다. 메모리 사용량, 응답 시간, 토큰 처리량, 코드 품질 등을 고려하여 작업에 맞는 모델을 선택하는 것이 중요합니다

*   **vLLM Qwen 32B 4bit Cline 연동 테스트 결과 (2025-03-29):**
    *   **결론:** `Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4` (4bit) 모델은 현재 Cline과 **연동 실패**했습니다.
    *   **원인:** Cline의 기본 시스템 프롬프트 크기(약 22k 토큰)가 너무 커서, 모델의 최대 컨텍스트 길이(32768 토큰)를 초과하는 요청이 발생하기 때문입니다.
    *   **상세 내용:** [Ollama vs vLLM 성능 비교 분석 보고서 - 섹션 13](/docs/work-logs/luke-and-alpha/reports/ollama-vs-vllm-performance-comparison.md#13-cline-연동-테스트-결과-vllm-qwen-32b-gptq-int4-2025-03-29) 참조.

*   **로컬 vLLM 서버 실행:**
    *   **환경 변수 설정:** 프로젝트 루트에 있는 `.env.sample` 파일을 복사하여 `.env` 파일을 만듭니다. `.env` 파일 내의 `HUGGING_FACE_HUB_TOKEN`에 자신의 Hugging Face Hub 토큰을 입력합니다. 이 토큰은 vLLM이 비공개 모델에 접근하거나 모델 설정을 가져올 때 필요할 수 있습니다. (`.env` 파일은 `.gitignore`에 포함되어 Git에 추적되지 않습니다.)
    *   **서버 시작 스크립트:** 프로젝트 루트의 `start_vllm_qwen2.5_4bit.bat` 스크립트를 실행하여 로컬 vLLM 서버를 시작할 수 있습니다. 이 스크립트는 Docker Desktop을 실행하고, `.env` 파일에서 토큰을 읽어와 Qwen-2.5 7B Chat AWQ (4비트) 모델을 2개의 GPU로 로드합니다. (Docker Desktop이 기본 경로가 아닌 다른 곳에 설치된 경우 스크립트 내 경로 수정이 필요할 수 있습니다.)
    *   **참고:** 로컬 모델 테스트 및 성능 비교에 대한 자세한 내용은 [`scripts/sllm_test/`](/scripts/sllm_test/) 디렉토리 및 관련 작업 로그([`docs/work-logs/luke-and-alpha/tasks/004-vllm-setup-and-test.md`](/docs/work-logs/luke-and-alpha/tasks/004-vllm-setup-and-test.md), [`docs/work-logs/luke-and-alpha/reports/004-ollama-vs-vllm-performance-comparison.md`](/docs/work-logs/luke-and-alpha/reports/004-ollama-vs-vllm-performance-comparison.md))를 참조하세요.

## 6.**대화 아카이브 및 파인튜닝**
* 상호작용을 체계적으로 아카이브하고 이를 사용하여 프로젝트별 로컬 LLM을 파인튜닝하여 시간이 지남에 따라 개인화 및 성능을 향상하는 프레임워크 개발
* 현재 작업사항 없음

---
## License

[Apache 2.0 © 2025 Cline Bot Inc.](./LICENSE)
