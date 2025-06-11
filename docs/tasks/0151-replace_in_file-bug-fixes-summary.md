# 태스크 #015 관련: `replace_in_file` 버그 수정 요약 (2025-04-20)

이 문서는 `replace_in_file` 도구의 멀티 블록 수정 실패 및 파일 덮어쓰기 버그 조사 과정(#015)에서 식별된 문제점과 필요한 수정 사항을 요약합니다. **다른 AI IDE에서 이 내용을 바탕으로 수정 작업을 진행할 수 있도록 구체적인 코드 지침을 포함합니다.**

## 1. `replace_in_file` 도구 자체의 불안정성

*   **문제점:**
    *   멀티 블록 수정 시 예측 불가능하게 실패합니다.
    *   단일 블록 수정 시도 중에도 실패하며, 대상 파일의 전체 내용을 비우거나 `"undefined"` 문자열로 덮어쓰는 치명적인 오류를 발생시킵니다.
    *   VS Code Diff 알고리즘 시간 초과 문제와 연관된 것으로 보입니다.
*   **조치:**
    *   **`replace_in_file` 도구 사용을 완전히 중단합니다.** 안정성이 확보되고 철저히 검증될 때까지 사용하지 않습니다.
    *   파일 수정이 필요할 경우, 안전한 대안인 `write_to_file` 도구를 사용하거나 마스터께 직접 수정을 요청합니다.

## 2. 파서 (`src/core/assistant-message/parse-assistant-message.ts`)

*   **문제점:** API 응답 스트리밍 중, 부분적인 `diff` 파라미터 내용에 모든 마커(`^SEARCH^`, `^======^`, `^REPLACE^`)가 포함되지 않았다는 이유만으로 관련 `tool_use` 정보 전체를 너무 일찍 폐기했습니다.
*   **수정 내용 (마스터 적용 완료):** 파일 끝 부분의 `// Handle stream ending mid-process` 블록 내 `if (currentParamName === 'diff')` 조건문 안의 `if (!hasAllMarkers)` 블록에서 다음 두 라인을 **삭제**했습니다 (대략 176-177 라인):
    ```typescript
    // isValidParam = false; // 삭제됨
    // currentToolUse = undefined; // 삭제됨
    ```
    이제 파서는 부분 `diff` 검증 실패 시에도 도구 사용 정보를 유지합니다.

## 3. Task 실행 로직 (`src/core/task/index.ts`)

*   **문제점:** `presentAssistantMessage` 함수가 파서의 최종 `diff` 파라미터 검증 완료를 기다리지 않고, 단순히 `!block.partial` (닫는 태그 수신) 조건만으로 `replace_in_file` 도구 실행 로직(특히 `constructNewFileContent` 호출)을 트리거합니다. 이로 인해 불완전한 `diff` 데이터가 사용되어 오류가 발생할 수 있는 동기화 문제가 있습니다.
*   **필요한 수정 (마스터 직접 적용 필요):**
    *   **파일 경로:** `src/core/task/index.ts`
    *   **함수:** `presentAssistantMessage`
    *   **위치:** `case "replace_in_file":` 블록 내의 `else { ... }` 블록 시작 부분 (대략 1705 라인 근처, `this.consecutiveMistakeCount = 0` 바로 다음 줄)
    *   **추가할 코드:**
        ```typescript
        // --- START: diff 유효성 검사 로직 추가 ---
        const currentDiff = block.params.diff;
        if (!currentDiff || typeof currentDiff !== 'string' || !currentDiff.includes("^SEARCH^") || !currentDiff.includes("^======^") || !currentDiff.includes("^REPLACE^")) {
            this.logger.error(`[presentAssistantMessage] Invalid or incomplete diff content for replace_in_file even though block.partial is false. Diff: ${currentDiff?.substring(0, 100)}...`);
            // 오류 처리: 사용자에게 알리고, 도구 결과로 오류를 반환하며, diff 뷰 정리
            await this.say("error", "Internal error processing file edit: Incomplete diff data received.");
            pushToolResult(formatResponse.toolError("Internal error: Incomplete or invalid diff data received for replace_in_file."));
            // diffViewProvider가 열려있을 수 있으므로 정리 시도
            if (this.diffViewProvider.isEditing) {
                 await this.diffViewProvider.revertChanges();
                 await this.diffViewProvider.reset();
            }
            break; // 현재 도구 처리 중단
        }
        // --- END: diff 유효성 검사 로직 추가 ---

        // 기존 로직 시작 (파라미터 누락 검사 등)
        if (!relPath) { // 이 줄은 이미 존재하는 코드입니다.
        ```
    *   **설명:** 이 코드는 `block.partial`이 `false`이더라도, 실제 `diff` 파라미터 내용이 존재하고 모든 필수 마커를 포함하는지 다시 한번 확인합니다. 유효하지 않으면 오류를 처리하고 해당 도구 실행을 중단합니다.

## 4. Diff Provider (`src/integrations/editor/DiffViewProvider.ts`)

*   **문제점 1:** `saveChanges` 함수 내에서 `updatedDocument.save()` 호출 실패 시 오류를 로깅만 하고 계속 진행했습니다.
*   **수정 내용 1 (마스터 적용 완료):** `saveChanges` 함수 내 `updatedDocument.save()` 호출을 감싸는 `try...catch` 블록(대략 200라인 근처)의 `catch` 부분을 다음과 같이 수정하여 에러를 다시 던지도록 변경했습니다:
    ```typescript
    catch (error) {
        this.logger.error(`문서 저장 실패`, { error });
        // 에러를 다시 던져서 saveChanges 함수 실행을 중단시키고 호출자에게 알림
        throw new Error(`Failed to save document: ${(error as Error).message}`);
    }
    ```
*   **문제점 2 (가설):** VS Code Diff 알고리즘 시간 초과 발생 시 `TextDocument` 상태가 불안정해지고, `updatedDocument.getText()`가 비정상적인 값(예: `"undefined"`, 빈 문자열)을 반환할 수 있습니다.
*   **수정 내용 2 (마스터 적용 완료):** `saveChanges` 함수에 저장 전/후 내용 유효성 검사 로직(null, undefined, `"undefined"` 문자열 확인 및 저장 후 해시 비교)을 추가했습니다 (대략 190라인 및 220라인 근처).
    ```typescript
    // 저장 전 검사 (Pre-save Validation) 예시
    if (preSaveContent === undefined || preSaveContent === null) { /* ... 에러 처리 ... */ }
    if (preSaveContent === "undefined") { /* ... 에러 처리 ... */ }

    // 저장 후 검사 (Post-save Validation) 예시
    if (fileContentHash !== postSaveHash) { /* ... 에러 처리 ... */ }
    if (fileContent === "undefined") { /* ... 에러 처리 ... */ }
    ```
*   **문제점 3:** `saveChanges` 함수 내에서 저장된 파일 내용을 읽는 `fs.readFile` 호출 실패 시 오류를 로깅만 하고 계속 진행했습니다.
*   **필요한 수정 (마스터 직접 적용 필요):**
    *   **파일 경로:** `src/integrations/editor/DiffViewProvider.ts`
    *   **함수:** `saveChanges`
    *   **위치:** 저장된 파일 내용을 읽는 `try...catch` 블록 (대략 215라인 근처, `// 실제 파일의 내용도 확인` 주석 아래)
    *   **수정할 코드:** `catch` 블록 내부를 다음과 같이 수정하여 에러를 다시 던지도록 변경합니다.
        ```typescript
        catch (error) {
            this.logger.error(`저장된 파일 내용 확인 실패`, { error });
            // 에러를 다시 던져서 saveChanges 함수 실행을 중단시키고 호출자에게 알림
            throw new Error(`Failed to read saved file content: ${(error as Error).message}`);
        }
        ```
    *   **설명:** 파일 읽기 실패 시에도 오류가 상위로 전파되어 더 안전하게 처리할 수 있습니다.
*   **남은 우려 사항:** Diff 시간 초과 시 `getText()`가 반환할 수 있는 모든 비정상적인 상태(예: 빈 문자열)를 현재 검증 로직이 완벽하게 처리하지 못할 수 있습니다. VS Code 내부 동작에 대한 추가 조사가 필요합니다.

## 요약

`replace_in_file` 도구는 현재 사용 불가 상태이며, 파일 덮어쓰기 문제는 `DiffViewProvider`의 오류 처리 강화로 일부 완화되었을 수 있으나 근본적인 해결을 위해서는 VS Code Diff 시간 초과 문제와 Task-Parser 동기화 문제에 대한 추가 분석 및 수정이 필요합니다. **위에 명시된 `src/core/task/index.ts` 및 `src/integrations/editor/DiffViewProvider.ts` 파일 수정이 필요합니다.**
