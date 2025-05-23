import requests
import base64
import time

API_URL = "http://localhost:8000/tool/generate_hyperclovax_vision"
API_URL_STREAM = "http://localhost:8000/tool/generate_hyperclovax_vision_stream"

def calc_tps(token_count, elapsed):
    if elapsed > 0:
        return token_count / elapsed
    return 0

# (1) 이미지 없는 프롬프트 (텍스트만)
def test_no_image(stream=False):
    data = {
        "prompt": "이 모델의 주요 특징을 요약해줘.",
        "image_base64": ""
    }
    url = API_URL + ("?stream=true" if stream else "")
    start = time.time()
    resp = requests.post(url, json=data, stream=stream)
    elapsed = None
    if stream:
        print("--- 스트리밍(이미지X) ---")
        received = 0
        token_count = 0
        for chunk in resp.iter_content(chunk_size=None):
            text = chunk.decode("utf-8")
            print(text, end="", flush=True)
            received += len(chunk)
            token_count += len(text.split())  # 단순 공백 기준 토큰 수 추정
        print()
        elapsed = time.time() - start
        tps = calc_tps(token_count, elapsed)
        print(f"[스트리밍(이미지X) TPS] 전체 소요: {elapsed:.2f}s, 총 바이트: {received}, 토큰 수: {token_count}, TPS: {tps:.2f}")
    else:
        print("--- 일반(이미지X) ---")
        result = resp.json()
        print(result)
        elapsed = time.time() - start
        token_field = result.get("text") or result.get("result") or ""
        token_count = len(token_field.split()) if isinstance(token_field, str) else 0
        tps = calc_tps(token_count, elapsed)
        print(f"[일반(이미지X) TPS] 전체 소요: {elapsed:.2f}s, 토큰 수: {token_count}, TPS: {tps:.2f}")

# (2) 이미지 포함 (base64 인코딩)
def test_with_image(stream=False):
    with open("caret_feature.png", "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")
    data = {
        "prompt": "이 이미지를 설명해줘.",
        "image_base64": img_b64
    }
    url = API_URL + ("?stream=true" if stream else "")
    start = time.time()
    resp = requests.post(url, json=data, stream=stream)
    elapsed = None
    if stream:
        print("--- 스트리밍(이미지O) ---")
        received = 0
        token_count = 0
        for chunk in resp.iter_content(chunk_size=None):
            text = chunk.decode("utf-8")
            print(text, end="", flush=True)
            received += len(chunk)
            token_count += len(text.split())
        print()
        elapsed = time.time() - start
        tps = calc_tps(token_count, elapsed)
        print(f"[스트리밍(이미지O) TPS] 전체 소요: {elapsed:.2f}s, 총 바이트: {received}, 토큰 수: {token_count}, TPS: {tps:.2f}")
    else:
        print("--- 일반(이미지O) ---")
        result = resp.json()
        print(result)
        elapsed = time.time() - start
        token_field = result.get("text") or result.get("result") or ""
        token_count = len(token_field.split()) if isinstance(token_field, str) else 0
        tps = calc_tps(token_count, elapsed)
        print(f"[일반(이미지O) TPS] 전체 소요: {elapsed:.2f}s, 토큰 수: {token_count}, TPS: {tps:.2f}")

# (3) 별도 스트리밍 엔드포인트 (이미지/텍스트)
def test_stream_endpoint(with_image=False):
    if with_image:
        with open("caret_feature.png", "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode("utf-8")
        data = {"prompt": "이 이미지를 설명해줘.", "image_base64": img_b64}
        print("--- 별도 스트림 엔드포인트(이미지O) ---")
    else:
        data = {"prompt": "텍스트만 설명해줘.", "image_base64": ""}
        print("--- 별도 스트림 엔드포인트(이미지X) ---")
    start = time.time()
    resp = requests.post(API_URL_STREAM, json=data, stream=True)
    received = 0
    token_count = 0
    for chunk in resp.iter_content(chunk_size=None):
        text = chunk.decode("utf-8")
        print(text, end="", flush=True)
        received += len(chunk)
        token_count += len(text.split())
    print()
    elapsed = time.time() - start
    tps = calc_tps(token_count, elapsed)
    print(f"[별도 스트림 엔드포인트{'(이미지O)' if with_image else '(이미지X)'} TPS] 전체 소요: {elapsed:.2f}s, 총 바이트: {received}, 토큰 수: {token_count}, TPS: {tps:.2f}")

# (4) Caret 스타일: 매우 긴 prompt, 파일리스트 등 context 포함
def test_caret_style_payload():
    caret_payload = {
        "prompt": "<task>\n안녕 알파 ?\n</task>\n<environment_details>\n# VSCode Visible Files\n../caret/docs/work-logs/luke-and-alpha/tasks/008-caret-project-analysis.md\n\n# VSCode Open Tabs\nC:/Users/luke/AppData/Local/Programs/Microsoft VS Code/Untitled-1\ndocs/workingLog/workingLog-20250313.md\nagents-rules/alpha/project-rules.json\n../caret/docs/work-logs/luke-and-alpha/tasks/008-caret-project-analysis.md\n\n# Current Time\n4/29/2025, 2:10:53 AM (Asia/Seoul, UTC+9:00)\n\n# Current Working Directory (d:/dev/desktopfairy) Files\n.caretrules\n.cursorrules\n.eslintrc.js\n.gitignore\n.windsurfrules\nbody.json\nchat.html\ncomponents.json\ncontributing.md\ndev-start.sh\nfairy.html\nindex.html\njest.config.js\njest.setup.js\nLICENSE\npackage.json\npnpm-lock.yaml\npostcss.config.js\nreadme.md\nreplace_in_file_test_log.md\nreplace_test_very_fresh.txt\nsettings.html\ntailwind.config.js\ntemp_medium_article.html\ntest-output.json\ntest-output.txt\ntest-results.json\ntestollama.py\ntsconfig.json\ntsconfig.node.json\nvite.config.ts\nagents-rules/\nagents-rules/alpha/\nagents-rules/alpha/global-rules.json\nagents-rules/alpha/project-rules.json\nagents-rules/alpha/project-rules.ko.json\nagents-rules/alpha/project-rules.md\nagents-rules/alpha/backups/\ndocs/\ndocs/00.contents.md\ndocs/01.overview.md\ndocs/02.backend-architecture.md\ndocs/03.frontend-architecture.md\ndocs/04.development-workflow.md\ndocs/05.resource-management.md\ndocs/06.reference.md\ndocs/07.ai-assistant-guide.ko.md\ndocs/07.ai-assistant-guide.md\ndocs/alpha-experiment-detailed-design.md\ndocs/alpha-experiment-evaluation.md\ndocs/alpha-experiment-paper-outline.md\ndocs/alpha-experiment-progress.md\ndocs/alpha-to-alpha-guide.md\ndocs/en.00.contents.md\ndocs/en.01.overview.md\ndocs/en.02.backend-architecture.md\ndocs/en.03.frontend-architecture.md\ndocs/en.04.development-workflow.md\ndocs/en.05.resource-management .md\ndocs/en.06.reference.md\ndocs/project-rules-for-alpha.en.md\ndocs/project-rules-for-alpha.ko bak.md\ndocs/project-rules-for-alpha.ko.md\ndocs/summary-for-ai-memory.md\ndocs/alpha-experiment/\ndocs/alpha-experiment/conversation.md\ndocs/alpha-experiment/Cursor 대화.md\ndocs/alpha-experiment/IS-193_SW 개발자 채용시장의 변화와 생성형 AI의 영향v2.pdf\ndocs/alpha-experiment/memo.md\ndocs/alpha-experiment/paper_new.md\ndocs/alpha-experiment/paper.md\ndocs/alpha-experiment/posting.md\ndocs/alpha-experiment/posting.txt\ndocs/alpha-experiment/효과적인 AI룰 작성.md\ndocs/alpha-experiment/design/\ndocs/alpha-experiment/evaluations/\ndocs/alpha-experiment/guides/\ndocs/alpha-experiment/paper/\ndocs/alpha-experiment/progress/\ndocs/backup-docs/\ndocs/backup-docs/architecture.md\ndocs/backup-docs/asset-examples.md\ndocs/backup-docs/asset-guide-for-saebom.md\ndocs/backup-docs/asset-guide.md\ndocs/backup-docs/asset-structure.md\ndocs/backup-docs/coding-guide.md\ndocs/backup-docs/development-guide.md\ndocs/backup-docs/i18n-guide.md\ndocs/backup-docs/logging-guide.md\ndocs/backup-docs/overview.md\ndocs/backup-docs/platform-specific-issues.md\ndocs/backup-docs/requirements.md\ndocs/backup-docs/roadmap.md\ndocs/backup-docs/setting-window-requirements.md\ndocs/backup-docs/sprite-sheet-guide.md\ndocs/backup-docs/test-guide.md\ndocs/backup-docs/utils-reference.md\ndocs/cursor/\ndocs/cursor/claude_code_analysis_detailed_info_exchange.md\ndocs/cursor/claude_code_analysis_process_part2.md\ndocs/cursor/claude_code_analysis_process.md\ndocs/cursor/claude_info_exchange_part1.md\ndocs/cursor/claude_info_exchange_part2.md\ndocs/cursor/claude_info_exchange_part3.md\ndocs/cursor/cursor_ai_data_exchange.md\ndocs/cursor/cursor_ai_internal_processing.md\ndocs/cursor/vscode_ai_agent_feature1_ollama.md\ndocs/cursor/vscode_ai_agent_implementation_guide.md\ndocs/cursor/vscode_ai_agent_part1_architecture.md\ndocs/cursor/vscode_ai_agent_part2_ui.md\ndocs/cursor/vscode_ai_agent_part3_model.md\ndocs/cursor/vscode_ai_code_modifier.md\ndocs/cursor/vscode_ai_context_manager.md\ndocs/cursor/vscode_ai_core_architecture.md\ndocs/cursor/vscode_ai_model_connectors.md\ndocs/cursor/vscode_ai_orchestration_part1.md\ndocs/cursor/vscode_ai_orchestration_part2.md\ndocs/cursor/vscode_ai_orchestration_part3.md\ndocs/cursor/vscode_ai_orchestration_part4_team_collaboration.md\ndocs/cursor/vscode_ai_orchestration_part5_deployment.md\ndocs/cursor/vscode_ai_orchestration_system_overview.md\ndocs/cursor/vscode_api_cursor_usage.md\ndocs/work-logs/\ndocs/work-logs/luke-and-alpha/\ndocs/workingLog/\ndocs/workingLog/20250318.md\ndocs/workingLog/workingLog-20250303.md\ndocs/workingLog/workingLog-20250304.md\ndocs/workingLog/workingLog-20250308.md\ndocs/workingLog/workingLog-20250309.md\ndocs/workingLog/workingLog-20250311.md\ndocs/workingLog/workingLog-20250312.md\ndocs/workingLog/workingLog-20250313.md\ndocs/workingLog/workingLog-20250314.md\ndocs/workingLog/workingLog-20250316.md\ndocs/workingLog/workingLog-20250317.md\ndocs/workingLog/workingLog-20250318.md\ndocs/workingLog/daily/\ndocs/workingLog/tasks/\nscripts/\nscripts/doc-watcher.cjs\nsrc/\nsrc/App.css\nsrc/App.tsx\nsrc/chat.tsx\nsrc/fairy.tsx\nsrc/home.tsx\nsrc/index.js\nsrc/settings.tsx\nsrc/styles.css\nsrc/vite-env.d.ts\nsrc/__mocks__/\nsrc/__tests__/\nsrc/assets/\nsrc/assets/app-metadata.json\nsrc/assets/index.ts\nsrc/assets/ui/\nsrc/components/\nsrc/components/ChatWindow.tsx\nsrc/components/FairyWindow.tsx\nsrc/components/HomeWindow.tsx\nsrc/components/SettingsWindow.tsx\nsrc/components/base/\nsrc/components/Chat/\nsrc/components/Fairy/\nsrc/components/ui/\nsrc/config/\nsrc/config/user-preferences.json\nsrc/i18n/\nsrc/i18n/en.json\nsrc/i18n/index.ts\nsrc/i18n/ja.json\nsrc/i18n/ko.json\nsrc/i18n/zh.json\nsrc/lib/\nsrc/lib/utils.ts\nsrc/services/\nsrc/services/fairyUserDataManager.ts\nsrc/services/settings.ts\nsrc/services/ai/\nsrc/styles/\nsrc/tests/\nsrc/types/\nsrc/utils/\nsrc-tauri/\nsrc-tauri/build.rs\nsrc-tauri/Cargo.toml\nsrc-tauri/tauri.conf.json\nsrc-tauri/assets/\nsrc-tauri/desktopfairy/\nsrc-tauri/docs/\nsrc-tauri/icons/\nsrc-tauri/src/\nsrc-tauri/target/\nsrc-tauri/user-data/\ntest_app_dir/\ntest_app_dir/fairies/\ntest_app_dir/homes/\ntest_app_dir/settings/\n\n(File list truncated. Use list_files on specific subdirectories if you need to explore further.)\n# Context Window Usage\n0 / 16.384K tokens used (0%)\n\n# Current Mode\nMODE4 MODE\nYou are in MODE4 mode.\n</environment_details>\n[ERROR] You did not use a tool in your previous response! Please retry with a tool use.\n\n# Reminder: Instructions for Tool Use\n\nTool uses are formatted using XML-style tags. The tool name is enclosed in opening and closing tags, and each parameter is similarly enclosed within its own set of tags. Here's the structure:\n\n<tool_name>\n<parameter1_name>value1</parameter1_name>\n<parameter2_name>value2</parameter2_name>\n...\n</tool_name>\n\nFor example:\n\n<attempt_completion>\n<result>\nI have completed the task...\n</result>\n</attempt_completion>\n\nAlways adhere to this format for all tool uses to ensure proper parsing and execution.\n\n# Next Steps\n\nIf you have completed the user's task, use the attempt_completion tool. \nIf you require additional information from the user, use the ask_followup_question tool. \nOtherwise, if you have not completed the task and do not need additional information, then proceed with the next step of the task. \n(This is an automated message, so do not respond to it conversationally.)\n<environment_details>\n# VSCode Visible Files\n../caret/docs/work-logs/luke-and-alpha/tasks/008-caret-project-analysis.md\n\n# VSCode Open Tabs\nC:/Users/luke/AppData/Local/Programs/Microsoft VS Code/Untitled-1\ndocs/workingLog/workingLog-20250313.md\nagents-rules/alpha/project-rules.json\n../caret/docs/work-logs/luke-and-alpha/tasks/008-caret-project-analysis.md\n\n# Current Time\n4/29/2025, 2:11:12 AM (Asia/Seoul, UTC+9:00)\n# Context Window Usage\n0 / 16.384K tokens used (0%)\n\n# Current Mode\nMODE4 MODE\nYou are in MODE4 mode.\n</environment_details>",
        "image_base64": ""
    }
    url = API_URL
    print("--- Caret 스타일 (매우 긴 prompt, context 포함) ---")
    start = time.time()
    resp = requests.post(url, json=caret_payload)
    result = resp.json()
    print(result)
    elapsed = time.time() - start
    token_field = result.get("text") or result.get("result") or ""
    token_count = len(token_field.split()) if isinstance(token_field, str) else 0
    tps = calc_tps(token_count, elapsed)
    print(f"[Caret 스타일] 전체 소요: {elapsed:.2f}s, 토큰 수: {token_count}, TPS: {tps:.2f}")

if __name__ == "__main__":
    
    # 1. 일반 응답 (이미지X)
    test_no_image(stream=False)
    # 2. 일반 응답 (이미지O)
    test_with_image(stream=False)
    # 3. 스트리밍 응답 (이미지X)
    test_no_image(stream=True)
    # 4. 스트리밍 응답 (이미지O)
    test_with_image(stream=True)
    # 5. 별도 스트림 엔드포인트 (이미지X)
    test_stream_endpoint(with_image=False)
    # 6. 별도 스트림 엔드포인트 (이미지O)
    test_stream_endpoint(with_image=True)
    exit()
    # 7. Caret 스타일 (매우 긴 prompt, context 포함)
    test_caret_style_payload()
    exit()