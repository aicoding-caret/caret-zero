# Task 029: Cline Upstream 변경 사항 병합 - 작업 보고서

**날짜:** 2024-05-18 ~ 현재 진행 중

## 1. 사전 분석 및 준비

- 자동화 스크립트 (`scripts/merging-job/run_all_diffs.ps1`) 실행 완료.
- 스크립트 결과 생성 파일:
    - `scripts/merging-job/upstream_only_changes.txt`
    - `scripts/merging-job/both_changed_files.txt`
    - `scripts/merging-job/caret_only_changes.txt`
- **`src/api/providers/` 관련 처리 방침 확정:**
    - `upstream_only_changes.txt` 목록 내 `src/api/providers/` 하위 파일 (신규 Provider 추정): 단순 덮어쓰기 대상에서 제외. 별도 관리하며, 우리 측 리팩토링 상황 고려하여 신중한 통합 검토 예정.
    - `both_changed_files.txt` 목록 내 `src/api/providers/` 하위 파일 (`gemini.ts`, `lmstudio.ts` 등): 양쪽 변경 사항 모두 고려하여 최우선 수동 병합 검토 대상.

## 2. 파일별 병합 진행 (예정)

### 2.1. 1단계: Upstream 단독 변경 파일 우선 적용 (루트 파일 & Docs)

- **준비 사항:**
    - 대상 루트 파일 식별 완료: `.codespellrc`, `.mocharc.json`, `esbuild.js`, `tsconfig.json`.
    - 문서 처리 방침 확정: `caret-zero` 루트에 신규 `cline-docs` 폴더를 생성하고, `cline`의 `docs` 및 `old_docs` 내용을 복사. 기존 `docs`는 유지.
- **진행 예정 작업:**
    - 위 대상 루트 파일들을 `cline` 버전으로 덮어쓰기.
    - 신규 `cline-docs` 폴더 생성 및 `cline` 문서 컨텐츠 복사.
    - `npm run build` (또는 `npm run compile`) 실행하여 빌드 결과 확인.
    - 작업 결과 본 보고서에 상세 기록 예정.

### 1.1. Upstream 단독 변경 파일 목록 (`scripts/merging-job/upstream_only_changes.txt` 내용)

```
.codespellrc
.github/CODEOWNERS
.github/workflows/changeset-converter.yml
.github/workflows/codespell.yml
.github/workflows/test.yml
.mocharc.json
.vscode-test.mjs
.vscode/extensions.json
.vscode/launch.json
docs/assets/robot_panel_dark.png
docs/assets/robot_panel_light.png
docs/custom-model-configs/aws-bedrock-with-credentials-authentication.mdx
docs/custom-model-configs/aws-bedrock-with-profile-authentication.mdx
docs/custom-model-configs/gcp-vertex-ai.mdx
docs/custom-model-configs/litellm-and-cline-using-codestral.mdx
docs/docs.json
docs/enterprise-solutions/cloud-provider-integration.mdx
docs/enterprise-solutions/custom-instructions.mdx
docs/enterprise-solutions/mcp-servers.mdx
docs/enterprise-solutions/security-concerns.mdx
docs/exploring-clines-tools/checkpoints.mdx
docs/exploring-clines-tools/cline-tools-guide.mdx
docs/exploring-clines-tools/new-task-tool.mdx
docs/exploring-clines-tools/plan-and-act-modes-a-guide-to-effective-ai-development.mdx
docs/exploring-clines-tools/remote-browser-support.mdx
docs/exploring-clines-tools/slash-commands.mdx
docs/getting-started/for-new-coders.mdx
docs/getting-started/installing-cline.mdx
docs/getting-started/installing-dev-essentials.mdx
docs/getting-started/model-selection-guide.mdx
docs/getting-started/our-favorite-tech-stack.mdx
docs/getting-started/task-management.mdx
docs/getting-started/understanding-context-management.mdx
docs/getting-started/what-is-cline.mdx
docs/mcp/adding-mcp-servers-from-github.mdx
docs/mcp/configuring-mcp-servers.mdx
docs/mcp/connecting-to-a-remote-server.mdx
docs/mcp/mcp-marketplace.mdx
docs/mcp/mcp-overview.mdx
docs/mcp/mcp-server-development-protocol.mdx
docs/mcp/mcp-transport-mechanisms.mdx
docs/more-info/telemetry.mdx
docs/prompting/cline-memory-bank.mdx
docs/prompting/prompt-engineering-guide.mdx
docs/running-models-locally/lm-studio.mdx
docs/running-models-locally/ollama.mdx
docs/running-models-locally/read-me-first.mdx
esbuild.js
evals/.gitignore
evals/README.md
evals/cli/package-lock.json
evals/cli/package.json
evals/cli/src/adapters/exercism.ts
evals/cli/src/adapters/index.ts
evals/cli/src/adapters/multi-swe.ts
evals/cli/src/adapters/swe-bench.ts
evals/cli/src/adapters/swelancer.ts
evals/cli/src/adapters/types.ts
evals/cli/src/commands/evals-env.ts
evals/cli/src/commands/report.ts
evals/cli/src/commands/run.ts
evals/cli/src/commands/setup.ts
evals/cli/src/db/index.ts
evals/cli/src/db/schema.ts
evals/cli/src/index.ts
evals/cli/src/utils/evals-env.ts
evals/cli/src/utils/extensions.ts
evals/cli/src/utils/markdown.ts
evals/cli/src/utils/results.ts
evals/cli/src/utils/task.ts
evals/cli/src/utils/vscode.ts
evals/cli/tsconfig.json
locales/ar-sa/README.md
locales/de/README.md
locales/es/README.md
locales/ja/CONTRIBUTING.md
locales/ja/README.md
locales/ko/CONTRIBUTING.md
locales/ko/README.md
locales/pt-BR/README.md
locales/zh-cn/README.md
locales/zh-tw/README.md
old_docs/PRIVACY.md
old_docs/README.md
old_docs/architecture/README.md
old_docs/architecture/extension-architecture.mmd
old_docs/cline-customization/clineignore.md
old_docs/getting-started-new-coders/README.md
old_docs/getting-started-new-coders/installing-dev-essentials.md
old_docs/mcp/README.md
old_docs/mcp/mcp-quickstart.md
old_docs/mcp/mcp-server-from-github.md
old_docs/mcp/mcp-server-from-scratch.md
old_docs/prompting/README.md
old_docs/prompting/custom instructions library/README.md
old_docs/prompting/custom instructions library/cline-memory-bank.md
old_docs/prompting/custom instructions library/raw-instructions/cline-memory-bank.md
old_docs/tools/cline-tools-guide.md
old_docs/tools/mentions-guide.md
proto/account.proto
proto/browser.proto
proto/build-proto.js
proto/checkpoints.proto
proto/common.proto
proto/file.proto
proto/mcp.proto
proto/models.proto
proto/package.json
proto/slash.proto
proto/state.proto
proto/task.proto
proto/web.proto
scripts/build-tests.js
scripts/generate-server-setup.mjs
scripts/generate-stubs.js
scripts/get-vscode-usages.sh
scripts/package-standalone.mjs
scripts/report-issue.js
src/api/providers/__tests__/ollama.test.ts
src/api/providers/anthropic.ts
src/api/providers/asksage.ts
src/api/providers/bedrock.ts
src/api/providers/cline.ts
src/api/providers/deepseek.ts
src/api/providers/doubao.ts
src/api/providers/fireworks.ts
src/api/providers/litellm.ts
src/api/providers/mistral.ts
src/api/providers/ollama.ts
src/api/providers/openai-native.ts
src/api/providers/openai.ts
src/api/providers/qwen.ts
src/api/providers/sambanova.ts
src/api/providers/together.ts
src/api/providers/vertex.ts
src/api/providers/xai.ts
src/api/transform/gemini-format.ts
src/api/transform/openrouter-stream.ts
src/api/transform/vscode-lm-format.test.ts
src/core/assistant-message/diff.test.ts
src/core/assistant-message/diff_edge_cases.test.ts
src/core/assistant-message/diff_edge_cases2.test.ts
src/core/assistant-message/index.ts
src/core/assistant-message/parse-assistant-message.ts
src/core/context-management/context-error-handling.ts
src/core/context/context-management/ContextManager-legacy.ts
src/core/context/context-management/ContextManager.ts
src/core/context/context-management/__tests__/ContextManager.test.ts
src/core/context/context-management/context-error-handling.ts
src/core/context/context-management/context-window-utils.ts
src/core/context/context-tracking/ContextTrackerTypes.ts
src/core/context/context-tracking/FileContextTracker.test.ts
src/core/context/context-tracking/FileContextTracker.ts
src/core/context/context-tracking/ModelContextTracker.test.ts
src/core/context/context-tracking/ModelContextTracker.ts
src/core/context/instructions/user-instructions/cline-rules.ts
src/core/context/instructions/user-instructions/external-rules.ts
src/core/context/instructions/user-instructions/rule-helpers.ts
src/core/context/instructions/user-instructions/workflows.ts
src/core/controller/account/accountLoginClicked.ts
src/core/controller/account/index.ts
src/core/controller/account/methods.ts
src/core/controller/browser/discoverBrowser.ts
src/core/controller/browser/getBrowserConnectionInfo.ts
src/core/controller/browser/getDetectedChromePath.ts
src/core/controller/browser/index.ts
src/core/controller/browser/methods.ts
src/core/controller/browser/testBrowserConnection.ts
src/core/controller/browser/updateBrowserSettings.ts
src/core/controller/checkpoints/checkpointDiff.ts
src/core/controller/checkpoints/checkpointRestore.ts
src/core/controller/checkpoints/index.ts
src/core/controller/checkpoints/methods.ts
src/core/controller/file/createRuleFile.ts
src/core/controller/file/deleteRuleFile.ts
src/core/controller/file/getRelativePaths.ts
src/core/controller/file/index.ts
src/core/controller/file/methods.ts
src/core/controller/file/openFile.ts
src/core/controller/file/openImage.ts
src/core/controller/file/searchCommits.ts
src/core/controller/file/searchFiles.ts
src/core/controller/file/selectImages.ts
src/core/controller/grpc-handler.ts
src/core/controller/grpc-request-registry.ts
src/core/controller/grpc-service-config.ts
src/core/controller/grpc-service.ts
src/core/controller/mcp/addRemoteMcpServer.ts
src/core/controller/mcp/downloadMcp.ts
src/core/controller/mcp/index.ts
src/core/controller/mcp/methods.ts
src/core/controller/mcp/toggleMcpServer.ts
src/core/controller/mcp/updateMcpTimeout.ts
src/core/controller/models/getLmStudioModels.ts
src/core/controller/models/getOllamaModels.ts
src/core/controller/models/getVsCodeLmModels.ts
src/core/controller/models/index.ts
src/core/controller/models/methods.ts
src/core/controller/models/refreshOpenAiModels.ts
src/core/controller/models/refreshOpenRouterModels.ts
src/core/controller/models/refreshRequestyModels.ts
src/core/controller/slash/condense.ts
src/core/controller/slash/index.ts
src/core/controller/slash/methods.ts
src/core/controller/slash/reportBug.ts
src/core/controller/state/getLatestState.ts
src/core/controller/state/index.ts
src/core/controller/state/methods.ts
src/core/controller/state/resetState.ts
src/core/controller/state/subscribeToState.ts
src/core/controller/state/toggleFavoriteModel.ts
src/core/controller/task/askResponse.ts
src/core/controller/task/cancelTask.ts
src/core/controller/task/clearTask.ts
src/core/controller/task/deleteNonFavoritedTasks.ts
src/core/controller/task/deleteTasksWithIds.ts
src/core/controller/task/exportTaskWithId.ts
src/core/controller/task/getTaskHistory.ts
src/core/controller/task/index.ts
src/core/controller/task/methods.ts
src/core/controller/task/newTask.ts
src/core/controller/task/showTaskWithId.ts
src/core/controller/task/taskFeedback.ts
src/core/controller/task/toggleTaskFavorite.ts
src/core/controller/web/checkIsImageUrl.ts
src/core/controller/web/fetchOpenGraphData.ts
src/core/controller/web/index.ts
src/core/controller/web/methods.ts
src/core/ignore/ClineIgnoreController.test.ts
src/core/ignore/ClineIgnoreController.ts
src/core/mentions/index.ts
src/core/prompts/commands.ts
src/core/prompts/loadMcpDocumentation.ts
src/core/slash-commands/index.ts
src/integrations/checkpoints/CheckpointMigration.ts
src/integrations/git/commit-message-generator.ts
src/integrations/misc/extract-text.ts
src/integrations/misc/open-file.ts
src/integrations/misc/process-images.ts
src/integrations/terminal/TerminalProcess.test.ts
src/packages/execa.ts
src/services/account/ClineAccountService.ts
src/services/browser/UrlContentFetcher.ts
src/services/error/ErrorService.ts
src/services/posthog/PostHogClientProvider.ts
src/services/posthog/feature-flags/FeatureFlagsService.ts
src/services/posthog/telemetry/TelemetryService.ts
src/services/search/file-search.ts
src/services/test/GitHelper.ts
src/services/test/TestMode.ts
src/shared/constants.ts
src/shared/crypto.ts
src/shared/fs-extra.test.ts
src/shared/fs-extra.ts
src/shared/ide.ts
src/shared/llm-provider-utils.ts
src/shared/logger/ILogger.ts
src/shared/logger/Logger.ts
src/shared/logger/console-transport.ts
src/shared/logger/create-output-channel-transport.ts
src/shared/logger/create-posthog-transport.ts
src/shared/logger/create-sentry-transport.ts
src/shared/logger/index.ts
src/shared/logger/sensitive-value.ts
src/shared/model-config/index.ts
src/shared/model-config/modelAccounts.ts
src/shared/model-config/modelConfigUtils.ts
src/shared/model-config/modelProviderInfo.ts
src/shared/model-config/modelRegionInfo.ts
src/shared/model-config/modelTypeUtils.ts
src/shared/models/type-guards.ts
src/shared/models/types.ts
src/shared/models/types.vscode.ts
src/shared/platform.ts
src/shared/proto-conversions/checkpoint.ts
src/shared/proto-conversions/common.ts
src/shared/proto-conversions/file.ts
src/shared/proto-conversions/mcp.ts
src/shared/proto-conversions/models.ts
src/shared/proto-conversions/slash.ts
src/shared/proto-conversions/state.ts
src/shared/proto-conversions/task.ts
src/shared/proto/generated/account_pb.d.ts
src/shared/proto/generated/account_pb.js
src/shared/proto/generated/browser_pb.d.ts
src/shared/proto/generated/browser_pb.js
src/shared/proto/generated/checkpoints_pb.d.ts
src/shared/proto/generated/checkpoints_pb.js
src/shared/proto/generated/common_pb.d.ts
src/shared/proto/generated/common_pb.js
src/shared/proto/generated/file_pb.d.ts
src/shared/proto/generated/file_pb.js
src/shared/proto/generated/mcp_pb.d.ts
src/shared/proto/generated/mcp_pb.js
src/shared/proto/generated/models_pb.d.ts
src/shared/proto/generated/models_pb.js
src/shared/proto/generated/slash_pb.d.ts
src/shared/proto/generated/slash_pb.js
src/shared/proto/generated/state_pb.d.ts
src/shared/proto/generated/state_pb.js
src/shared/proto/generated/task_pb.d.ts
src/shared/proto/generated/task_pb.js
src/shared/proto/generated/web_pb.d.ts
src/shared/proto/generated/web_pb.js
src/shared/proto/index.ts
src/shared/services/BaseBrowserService.ts
src/shared/services/BaseMcpService.ts
src/shared/services/BaseModelService.ts
src/shared/services/IBrowserService.ts
src/shared/services/IMcpService.ts
src/shared/services/IModelService.ts
src/shared/services/initializeBrowserService.ts
src/shared/services/initializeMcpService.ts
src/shared/services/initializeModelService.ts
src/shared/services/remote-mcp-service.ts
src/shared/string-utils.test.ts
src/shared/string-utils.ts
src/shared/task/TaskInputContext.ts
src/shared/task/TaskInputOptions.ts
src/shared/task/TaskManagerObserver.ts
src/shared/task/TaskType.ts
src/shared/task/index.ts
src/shared/telemetry-events.ts
src/shared/time.ts
src/shared/time/TimeProvider.ts
src/shared/time/Timer.ts
src/shared/time/index.ts
src/shared/types.ts
src/shared/uri.ts
src/shared/user-input-utils.ts
src/shared/utils/array-utils.test.ts
src/shared/utils/array-utils.ts
src/shared/utils/assert-never.ts
src/shared/utils/assert.ts
src/shared/utils/async-utils.ts
src/shared/utils/cancellation.ts
src/shared/utils/channel.ts
src/shared/utils/child-process.ts
src/shared/utils/data-uri.ts
src/shared/utils/decorator-utils.ts
src/shared/utils/disposable.test.ts
src/shared/utils/disposable.ts
src/shared/utils/enum-utils.ts
src/shared/utils/env-utils.ts
src/shared/utils/errors.ts
src/shared/utils/event-emitter.ts
src/shared/utils/file-icon-provider.ts
src/shared/utils/file-system-utils.ts
src/shared/utils/guard.ts
src/shared/utils/image-utils.ts
src/shared/utils/json-schema-utils.ts
src/shared/utils/json-utils.test.ts
src/shared/utils/json-utils.ts
src/shared/utils/lazy.ts
src/shared/utils/linkify.ts
src/shared/utils/map-utils.ts
src/shared/utils/migration-utils.ts
src/shared/utils/model-utils.ts
src/shared/utils/network-utils.ts
src/shared/utils/object-utils.ts
src/shared/utils/path-utils.ts
src/shared/utils/performance.ts
src/shared/utils/record-utils.ts
src/shared/utils/service-utils.ts
src/shared/utils/singleton.ts
src/shared/utils/stream-utils.test.ts
src/shared/utils/stream-utils.ts
src/shared/utils/string-utils.test.ts
src/shared/utils/string-utils.ts
src/shared/utils/task-utils.ts
src/shared/utils/type-utils.ts
src/shared/utils/uri-utils.ts
src/shared/utils/version-utils.test.ts
src/shared/utils/version-utils.ts
src/shared/utils/vscode-scheme.ts
src/shared/utils/vscode-utils.ts
src/shared/utils/web-utils.ts
src/shared/vscode-extensions.ts
src/shared/vscode-shim.ts
src/standalone/.eslintrc.js
src/standalone/app.ts
src/standalone/main.ts
src/standalone/preload.ts
src/test/core-e2e/command.test.ts
src/test/core-e2e/diff.test.ts
src/test/core-e2e/new-task.test.ts
src/test/e2e/utils/setup-tests.ts
src/test/e2e/webview/chat.test.ts
src/test/run-tests-integration.ts
src/test/run-tests-unit.ts
src/test/run-tests.js
src/test/run-vscode-integration-tests.ts
src/test/suite/index.ts
src/test/webview/index.html
src/test/webview/main.tsx
src/test/webview/vite.config.ts
src/types.ts
tsconfig.json
```

## 3. 전역 문자열 치환 (Branding Alignment - Plan 2단계)

- **진행 상황:** (기록 예정)

## 4. `package.json` 의존성 관리 (Plan 3단계)

- **진행 상황:** (기록 예정)

## 5. 양쪽 모두 변경된 파일 및 기타 핵심 모듈 병합 (Plan 4단계)

### 5.1. `src/api/providers/` (both_changed 및 신규 Provider 통합 검토)

- **대상 (both_changed):** `gemini.ts`, `lmstudio.ts`, `openrouter.ts`, `requesty.ts`, `types.ts`, `vscode-lm.ts`
- **대상 (신규 Provider 통합 검토):** (`upstream_only_changes.txt` 중 `src/api/providers/` 하위 파일 목록)
- **진행 상황:** (파일별 기록 예정)

### 5.2. 기타 `src/core`, `src/services` 등 핵심 파일

- **진행 상황:** (파일별 또는 모듈별 기록 예정)

---
*(이하 내용은 기존 보고서 내용 유지 또는 추가)*

## 작업 요약

(작업 완료 후 작성)

## 주요 변경 사항

(병합된 주요 기능, 수정된 파일 목록 등)

## 발생했던 문제 및 해결 과정

(문제점, 오류 메시지, 해결 방법 등 상세 기록)

## 커스텀 로직 유지/변경 사항

(어떤 커스텀 로직이 유지되었고, 어떤 부분이 Upstream 코드로 대체되었는지 명시)

## 테스트 결과

- 컴파일 결과: (성공/실패 및 오류 내역)
- 기능 테스트 결과: (마스터 확인 사항)

## 후속 조치 (필요시)

## 작업 소요 시간

(예상 및 실제 소요 시간) 