# 태스크 #015: `replace_in_file` 도구 버그 조사 및 해결

## 담당자
*   루크 (마스터)
*   알파 (AI)

## 목표
`replace_in_file` 도구가 특정 조건(특히 여러 줄로 구성된 복잡한 블록 삭제 시)에서 성공 메시지를 반환함에도 불구하고 실제 파일 내용을 수정하지 못하는 버그의 원인을 파악하고 해결합니다. 또한, 도구 실패 시 파일 내용을 덮어쓰는 심각한 문제를 해결합니다.

## 배경
2025-04-08 시스템 프롬프트 개선 보고서 작업 중, `replace_in_file` 도구를 사용하여 보고서 내 특정 섹션(여러 줄 JSON 블록 및 관련 설명)을 삭제하려고 시도했으나, 도구는 성공 메시지를 반환했음에도 불구하고 실제 파일 내용은 변경되지 않는 현상이 반복적으로 관찰되었습니다. 간단한 한 줄 텍스트 교체는 성공하는 것으로 보아, 복잡한 멀티라인 `SEARCH/REPLACE` 작업에서 문제가 발생하는 것으로 추정됩니다. 이후 디버깅 과정에서 도구가 실패하며 대상 파일 내용을 비우거나 `"undefined"` 문자열로 덮어쓰는 더 심각한 문제가 발견되었습니다.

## 세부 작업
1.  **재현 테스트:** 다양한 종류의 멀티라인 `SEARCH/REPLACE` 시나리오(삭제, 수정 등)를 통해 `replace_in_file` 도구의 버그를 안정적으로 재현합니다. (현재 도구 불안정성 및 위험성으로 완전 중단)
2.  **원인 분석:**
    *   `replace_in_file` 도구의 내부 로직 검토 (관련 소스 코드 확인 필요).
    *   파서(`parseAssistantMessage`)와 Task 실행 로직(`presentAssistantMessage`) 간의 동기화 문제 분석.
    *   `DiffViewProvider` 및 `saveChanges` 로직 분석 (Diff 시간 초과 문제 연관성 확인).
    *   `SEARCH` 블록의 정확성, 공백/개행 문자 처리 방식 등 확인.
    *   파일 인코딩 또는 운영체제별 차이점 가능성 검토.
    *   도구 실행 환경 또는 의존성 문제 가능성 검토.
3.  **버그 수정:** 분석된 원인을 바탕으로 관련 코드를 수정합니다. (현재 `replace_in_file` 사용 불가로 마스터 직접 수정 또는 `write_to_file` 사용 필요)
4.  **검증:** 수정된 도구를 사용하여 이전에 실패했던 시나리오 및 다양한 테스트 케이스를 실행하여 버그가 해결되었는지 확인합니다.

## 진행 상황

### 1. 문제 파악 및 재현 (초기)

(기존 내용은 생략 - 이전 파일 내용 참조)

### ... (기존 2~5번 항목 생략) ...

### 6. 멀티 블록 수정 재시도 및 동기화 문제 확인 (2025-04-20)

*   **파서 수정:** `parseAssistantMessage.ts`에서 스트림 중간 종료 시 부분 `diff` 검증 로직을 수정하여, 마커 부족 시 도구 사용 정보를 폐기하지 않도록 변경 (`isValidParam = false;` 및 `currentToolUse = undefined;` 라인 제거).
*   **Task 로직 수정:** `task/index.ts`의 `presentAssistantMessage` 함수 내 `replace_in_file` 처리 시, `block.partial`이 `true`일 때 불완전한 데이터로 `constructNewFileContent` 및 `diffViewProvider.update`를 호출하는 로직 주석 처리.
*   **테스트 결과:** 수정 후에도 멀티 블록 `replace_in_file` 테스트는 실패. 로그 분석 결과, 파서는 최종적으로 완전한 `diff`를 파싱했지만, `Task` 클래스(`task/index.ts`)가 파서의 최종 검증 완료 전에 불완전한 `diff` 데이터로 `constructNewFileContent`를 호출하는 **동기화 문제**가 여전히 발생함을 확인.
*   **추가 문제:** `replace_in_file` 도구가 실패 시 대상 파일 내용을 비우는 심각한 버그 추가 발견.

### 7. 단일 블록 수정 시도 및 치명적 오류 발견 (2025-04-20)

*   **Task 로직 수정 시도:** `task/index.ts`의 `presentAssistantMessage` 함수 내 `replace_in_file` 처리 시, `!block.partial` (완료된 블록)일 때 `diff` 파라미터 유효성을 다시 확인하는 로직 추가 시도.
*   **치명적 오류 발생:** `replace_in_file` 도구 실행 시 대상 파일(`src/core/task/index.ts`)의 **전체 내용이 `"undefined"` 문자열로 덮어써지는 현상 발생.**
*   **Diff 시간 초과 알림 확인:** 마스터께서 이 오류 발생 시점에 VS Code에서 "The diff algorithm was stopped early (after 5000 ms.)" 알림이 표시되었음을 확인. 이는 `DiffViewProvider`의 시간 초과 문제와 파일 덮어쓰기 오류 간의 연관성을 시사함.
*   **결정:** `replace_in_file` 도구는 현재 사용하기에 매우 위험하며 불안정함. **해당 도구 사용을 즉시 중단.**

### 8. `DiffViewProvider` 수정 시도 및 `replace_in_file` 완전 중단 (2025-04-20)

*   **`saveChanges` 강화 시도:** `DiffViewProvider.ts`의 `saveChanges` 함수에 저장 전후 내용 유효성 검증 로직을 추가하기 위해 `replace_in_file` 사용 시도.
*   **치명적 오류 재발:** `replace_in_file` 도구가 또다시 실패하며 대상 파일(`src/integrations/editor/DiffViewProvider.ts`)의 **전체 내용을 `"undefined"` 문자열로 덮어쓰는 현상 발생.**
*   **최종 결론:** `replace_in_file` 도구는 예측 불가능한 방식으로 파일 시스템에 심각한 오류를 유발함. **향후 어떠한 경우에도 해당 도구를 사용하지 않음.** 파일 수정은 반드시 `write_to_file` 또는 마스터의 직접 수정을 통해 진행.

### 9. `DiffViewProvider` 오류 처리 강화 (2025-04-20)

*   **`saveChanges` 수정:** `DiffViewProvider.ts`의 `saveChanges` 함수 내 `updatedDocument.save()` 호출 부분을 `try...catch`로 감싸고, `catch` 블록에서 에러 로깅 후 에러를 다시 던지도록(re-throw) 수정 완료 (마스터 직접 수정). 이는 파일 저장 실패 시 오류가 상위로 전파되어 파일 덮어쓰기 문제를 방지하는 데 도움이 될 것으로 기대됨.

## 다음 단계 (2025-04-20, 재정의)

1.  **`replace_in_file` 사용 완전 금지:** 안정성이 완전히 확보되고 검증되기 전까지 절대 사용하지 않음.
2.  **원인 심층 분석:**
    *   `src/core/task/index.ts`의 `presentAssistantMessage` 함수 내 `replace_in_file` 처리 로직과 파서(`parseAssistantMessage`) 간의 동기화 문제 재검토.
    *   `src/integrations/editor/DiffViewProvider.ts` 코드 분석 (특히 diff 계산 및 `saveChanges` 관련 로직, 시간 초과 처리).
    *   VS Code Diff 알고리즘 시간 초과가 파일 덮어쓰기 오류에 미치는 영향 분석 (마스터 지원 필요).
    *   `replace_in_file` 도구 자체의 파일 처리 로직 또는 의존성 문제 가능성 검토 (Node.js fs 모듈 사용 방식 등).
3.  **안전한 대안 사용:** 파일 수정이 필요할 경우, `write_to_file` 사용 또는 마스터의 직접 수정을 요청하는 방식으로 진행.

## ⚠️ 업스트림 코드의 잠재적 문제점

(기존 내용은 생략 - 이전 파일 내용 참조)

## 📍 수정된 파일 (디버깅 중)

1. `src/core/assistant-message/diff.ts`
2. `src/core/assistant-message/parse-assistant-message.ts`
3. `src/core/task/index.ts` (오류 발생 후 복구됨)
4. `src/integrations/editor/DiffViewProvider.ts` (오류 발생 후 복구됨, `saveChanges` 오류 처리 강화됨)
5. `src/core/prompts/sections/EDITING_FILES_GUIDE.json`
6. `src/core/prompts/sections/TOOL_DEFINITIONS.json`

## 🔍 2025-04-14 핵심 버그 원인 발견 및 수정 (초기)

(기존 내용은 생략 - 이전 파일 내용 참조)
