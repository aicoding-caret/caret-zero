# 태스크 #015: `replace_in_file` 도구 버그 조사 및 해결

## 담당자
*   루크 (마스터)
*   알파 (AI)

## 목표
`replace_in_file` 도구가 특정 조건(특히 여러 줄로 구성된 복잡한 블록 삭제 시)에서 성공 메시지를 반환함에도 불구하고 실제 파일 내용을 수정하지 못하는 버그의 원인을 파악하고 해결합니다.

## 배경
2025-04-08 시스템 프롬프트 개선 보고서 작업 중, `replace_in_file` 도구를 사용하여 보고서 내 특정 섹션(여러 줄 JSON 블록 및 관련 설명)을 삭제하려고 시도했으나, 도구는 성공 메시지를 반환했음에도 불구하고 실제 파일 내용은 변경되지 않는 현상이 반복적으로 관찰되었습니다. 간단한 한 줄 텍스트 교체는 성공하는 것으로 보아, 복잡한 멀티라인 `SEARCH/REPLACE` 작업에서 문제가 발생하는 것으로 추정됩니다.

## 세부 작업
1.  **재현 테스트:** 다양한 종류의 멀티라인 `SEARCH/REPLACE` 시나리오(삭제, 수정 등)를 통해 `replace_in_file` 도구의 버그를 안정적으로 재현합니다.
2.  **원인 분석:**
    *   `replace_in_file` 도구의 내부 로직 검토 (관련 소스 코드 확인 필요).
    *   `SEARCH` 블록의 정확성, 공백/개행 문자 처리 방식 등 확인.
    *   파일 인코딩 또는 운영체제별 차이점 가능성 검토.
    *   도구 실행 환경 또는 의존성 문제 가능성 검토.
3.  **버그 수정:** 분석된 원인을 바탕으로 `replace_in_file` 도구의 코드를 수정합니다.
4.  **검증:** 수정된 도구를 사용하여 이전에 실패했던 시나리오 및 다양한 테스트 케이스를 실행하여 버그가 해결되었는지 확인합니다.

## 진행 상황

### 1. 문제 파악 및 재현

간단한 테스트 파일을 통해 `replace_in_file` 도구의 버그를 재현했습니다. 다음과 같은 테스트 케이스를 작성하여 문제를 확인했습니다:

1. 테스트 파일 생성: 다음 내용으로 `replace_test_documented.txt` 파일 생성
   ```
   첫 번째 줄입니다.
   두 번째 줄은 조금 더 길어요.
   세 번째 줄입니다.
   마지막 네 번째 줄.
   ```

2. 단순 교체 시도: `"세 번째" -> "3번째"`
   ```
   <<<<<<< SEARCH
   세 번째
   =======
   3번째
   >>>>>>> REPLACE
   ```

3. 결과: 성공 메시지가 표시되었으나, 실제 파일 내용이 `"3번째"` 로만 변경됨. 즉, 파일의 전체 내용이 REPLACE 블록의 내용으로 덮어써짐.

마크다운 파일과 같은 복잡한 구조에서는 파일 내용이 완전히 훼손되는 상황이 발생했습니다.

### 2. 원인 분석

`diff.ts` 파일 분석을 통해 다음과 같은 문제점을 발견했습니다:

1. **프롬프트 형식 문제**:
   - JSON 설정 파일과 마크다운 문서 간에 diff 형식에 대한 일관성이 부족했습니다.
   - AI 에이전트가 다양한 형식으로 diff 내용을 전송하고 있었습니다.

2. **코드 구현 문제**:
   - REPLACE 블록을 처리할 때 줄바꿈(\n)이 잘못 처리되어 원본 파일 내용이 손상됩니다.
   - 정확한 매칭 후에도 결과를 구성하는 과정에서 원본 파일 내용이 유실됩니다.

### 3. 해결 방안

1. **프롬프트 수정**:
   - `TOOL_DEFINITIONS.json`, `EDITING_FILES_GUIDE.json` 파일의 `replace_in_file` 관련 설명을 일관되게 수정했습니다.
   - SEARCH/REPLACE 블록 형식을 명확히 하고 줄바꿈 문자를 명시적으로 표시했습니다.

2. **코드 수정**:
   - `diff.ts` 파일에서 줄바꿈 처리 로직 개선:
     - REPLACE 블록의 마지막 줄바꿈 처리 개선
     - 원본 파일의 줄바꿈 형식 보존 로직 추가
     - 원본 내용 중복 추가 방지 로직 구현
   - 파일 종료 처리 로직 개선:
     - `remainderProcessed` 플래그 추가하여 중복 처리 방지
     - 디버깅을 위한 상세 로깅 추가

### 4. 개선 결과 검증

다음 시나리오에서 개선된 결과를 확인했습니다:

1. **복잡한 멀티라인 REPLACE 블록 처리**:
   - 수정 전: 전체 파일이 REPLACE 블록 내용으로 대체되는 문제
   - 수정 후: 정확히 일치하는 부분만 대체되고 나머지 파일 내용 유지

2. **줄바꿈 처리 정확성**:
   - 수정 전: 줄바꿈이 추가되거나 누락되는 문제
   - 수정 후: 원본 파일의 줄바꿈 구조 정확히 유지

3. **파일 종료 부분 처리**:
   - 수정 전: 파일 종료 처리 시 일부 내용이 중복 추가되는 문제
   - 수정 후: `remainderProcessed` 플래그로 내용 중복 추가 방지

### 5. 핵심 코드 수정 사항

```typescript
// 1. remainderProcessed 플래그 추가 - 중복 처리 방지
let remainderProcessed = false

// 2. 블록 간 나머지 내용 처리 시 플래그 설정
const remainingContent = originalContent.slice(searchEndIndex);
if (remainingContent.length > 0) {
  result += remainingContent;
  remainderProcessed = true; // 남은 내용 처리 완료 표시
}

// 3. 파일 종료 처리 시 중복 방지
if (isFinal && lastProcessedIndex < originalContent.length && !remainderProcessed) {
  // 남은 내용 추가
  result += originalContent.slice(lastProcessedIndex);
} else if (isFinal && remainderProcessed) {
  // 이미 처리된 경우 로그 기록
  log.debug(`[파일 종료 처리] 남은 내용이 이미 처리되어 중복 추가 하지 않음`);
}
```

## 결론 및 후속 작업

1. **해결된 문제**:
   - SEARCH/REPLACE 블록 형식 불일치 문제 해결
   - 줄바꿈 처리 로직 개선으로 파일 내용 손상 방지
   - 원본 내용 중복 추가 문제 해결

2. **남은 개선 사항**:
   - 더 광범위한 테스트 케이스 개발
   - 다양한 언어(특히 유니코드와 다국어) 지원 개선
   - 줄바꿈 처리 자동화 로직 강화

3. **Cline 프로젝트에 기여 계획**:
   - 발견된 버그와 해결 방안에 대한 PR 준비
   - 다양한 OS 환경(특히 Windows)에서의 테스트 결과 공유
   - 문서화 개선 제안

## 예상 결과물
*   수정된 `replace_in_file` 도구 코드.
*   버그 재현 및 해결 검증 테스트 케이스.
*   버그 분석 및 해결 과정 문서.

## 우선순위
*   높음 (AI의 파일 수정 능력에 직접적인 영향을 미치는 핵심 도구 버그)

## 분석 내용

1.  **도구 진입점:** `replace_in_file` 도구는 `src/core/task/index.ts` 파일의 `Task` 클래스 내에서 호출됩니다.

    *   `Task.recursivelyMakeClineRequests` 함수에서 `block.name === "replace_in_file"` 조건에 따라 `replace_in_file` 도구 로직이 실행됩니다.
    *   이때, `block.params.path`에서 파일 경로를 가져오고, `block.params.diff`에서 `diff` 내용을 가져옵니다.
    *   `constructNewFileContent` 함수를 호출하여 새로운 파일 내용을 생성하고, `diffViewProvider`를 사용하여 diff 에디터를 업데이트합니다.
    *   마지막으로, `diffViewProvider.saveChanges()`를 호출하여 파일에 변경 사항을 저장합니다.

2.  **문제 발생 가능 지점 및 해결 아이디어:**

    *   **`constructNewFileContent` 함수:**
        *   **문제:** 여러 줄 블록 삭제 시, 줄 바꿈 문자 처리 또는 정규 표현식 문제로 인해 `SEARCH` 블록과 일치하는 부분을 찾지 못할 수 있습니다.
        *   **해결 아이디어:**
            *   `constructNewFileContent` 함수 내에서 줄 바꿈 문자 처리 로직을 개선합니다. 예를 들어, `\r\n`, `\n` 등 다양한 줄 바꿈 문자를 모두 인식하고 처리할 수 있도록 합니다.
            *   `SEARCH` 블록에 정규 표현식이 포함된 경우, 정규 표현식을 안전하게 처리할 수 있도록 합니다.
        *   **문제:** 파일 시스템 권한 문제, 파일 잠금 문제, 디스크 공간 부족 문제 등으로 인해 파일 저장이 실패할 수 있습니다.
        *   **해결 아이디어:**
            *   `diffViewProvider.saveChanges()` 함수 내에서 파일 저장 시 예외 처리 로직을 강화합니다.
            *   파일 저장 실패 시, 사용자에게 오류 메시지를 표시하고 재시도 옵션을 제공합니다.
            *   파일 저장 전에 파일 시스템 상태를 확인하여 문제가 발생할 가능성을 미리 감지합니다.
    *   **전체 흐름:**
        *   **문제:** `replace_in_file` 도구가 성공 메시지를 반환했지만, 실제 파일 내용은 수정되지 않은 경우, 오류가 제대로 처리되지 않았을 가능성이 있습니다.
        *   **해결 아이디어:**
            *   `replace_in_file` 도구 전체 로직에서 오류 처리 로직을 강화합니다.
            *   각 단계에서 예외가 발생하는 경우, 오류 메시지를 표시하고 도구 실행을 중단합니다.
            *   파일 수정 후, 파일 내용을 다시 읽어와 실제로 수정되었는지 확인합니다.

## 구현 내용

### 1. 코드 수정 (`diff.ts`)

1. **줄바꿈 문자 정규화 개선**
   * **문제**: 기존 코드는 Windows(`\r\n`)와 기타 줄바꿈 문자(`\r`) 처리가 불완전했음
   * **해결**: 모든 줄바꿈 형식을 `\n`으로 일관되게 정규화하도록 개선
   ```typescript
   // 수정 전
   const normalizedOriginalContent = originalContent.replace(/\r\n/g, "\n");
   
   // 수정 후
   const normalizedOriginalContent = originalContent.replace(/\r\n|\r/g, "\n");
   ```

2. **한글 및 유니코드 정규화 추가**
   * **문제**: 한글 등 다국어 문자는 NFC/NFD 두 가지 유니코드 정규화 형태에 따라 동일한 문자도 다르게 처리될 수 있음
   * **해결**: 유니코드 정규화 과정을 추가하여 일관된 처리 보장
   ```typescript
   const normalizedOriginalContent = originalContent
       .replace(/\r\n|\r/g, "\n")
       .normalize('NFC'); // 한글 등 다국어 문자 정규화
   ```

3. **다단계 매칭 전략 구현**
   * **문제**: 정확한 문자열 매칭만으로는 약간의 공백이나 줄바꿈 차이로 인해 매칭 실패
   * **해결**: 3단계 매칭 전략 구현
     * 1단계: 정확한 매칭 시도
     * 2단계: 줄 트림 매칭 (각 줄의 앞뒤 공백 무시)
     * 3단계: 블록 앵커 매칭 (블록의 첫 줄과 마지막 줄만 매칭)

4. **한글 문자 특별 처리**
   * **문제**: 한글이 포함된 콘텐츠는 인코딩 차이로 매칭이 실패할 수 있음
   * **해결**: 한글 포함 여부를 감지하고 NFC/NFD 두 가지 정규화 형태 모두 시도
   ```typescript
   // 한글 감지
   const containsKorean = /[가-힣]/.test(currentSearchContent);
   
   // NFD 정규화 매칭 시도
   if (containsKorean) {
     const nfdNormalizedSearch = currentSearchContent.normalize('NFD');
     const nfdNormalizedOriginal = normalizedOriginalContent.normalize('NFD');
     // NFD 기반 매칭 시도...
   }
   ```

5. **로깅 및 오류 처리 개선**
   * 상세한 디버그 로그 추가로 문제 원인 파악 용이성 향상
   * 매칭 실패 시 더 명확한 오류 메시지 제공
   * 한글 및 특수 유니코드 문자 포함 여부 로깅

### 2. AI 프롬프트 가이드라인 업데이트 (`EDITING_FILES_GUIDE.json`)

1. **replace_in_file 도구에 대한 중요 가이드라인 추가**
   ```json
   "critical_guidelines": [
     "SEARCH block content MUST exactly match the current file content, with matching whitespace and line breaks.",
     "ALWAYS use the latest file content provided by the system for the next SEARCH block.",
     "Apply changes in small, logical units, especially for complex multiline blocks.",
     "Use only one SEARCH/REPLACE block per replace_in_file request for clarity and safety."
   ]
   ```

2. **문제 해결 팁 추가**
   ```json
   "troubleshooting_tips": [
     "If a replace operation fails despite showing correct content, check for invisible characters, line break differences (\r\n vs \n), or trailing whitespace.",
     "For complex multiline blocks, start with the exact content from the file viewer without modifying whitespace.",
     "When adding content to the end of a file, include the last few lines of the file in your SEARCH block to ensure accurate positioning."
   ]
   ```

3. **특별 시나리오 섹션 추가**
   * 파일 끝에 내용 추가하는 방법
   * 복잡한 멀티라인 블록 처리 방법
   * 줄 끝 차이(Windows vs Unix) 인식 방법

### 3. 테스트 및 검증

1. **테스트 파일 생성**
   * 다양한 시나리오를 테스트할 수 있는 파일 (`test/replace-in-file-bug-test.md`) 생성
   * 간단한 텍스트 변경부터 복잡한 JSON 블록 삭제까지 다양한 케이스 포함

2. **테스트 스크립트 구현**
   * JavaScript 기반 테스트 스크립트 (`test/replace-in-file-simple-test.js`) 구현
   * 각 테스트 케이스별로 원본 파일 백업 및 복원 기능 포함
   * 성공/실패 케이스에 대한 자세한 로깅 제공

## 결과 및 향후 계획

### 🎯 주요 성과

* **코어 기능 개선**: 파일 내용 수정 기능의 안정성과 신뢰성을 크게 향상시킴
* **방어 매커니즘 강화**: 다양한 환경과 문자 처리에 대한 견고한 방어 매커니즘 구현
* **사용자 경험 개선**: 오류 발생 시 더 명확한 피드백과 대안 제시

### 📋 남은 과제

1. **추가 방어 전략 고려**
   * 유사도 기반 매칭 알고리즘 추가
   * 파일 끝 추가 시나리오에 대한 특별 처리 개선
   * 더 다양한 인코딩 및 문자셋 대응

2. **성능 최적화**
   * 다단계 매칭 전략의 성능 영향 분석 및 최적화
   * 대용량 파일 처리 시 효율성 개선

3. **추가 테스트 확장**
   * 더 많은 언어 및 문자셋에 대한 테스트 케이스 추가
   * 스트레스 테스트 및 경계 케이스 테스트 확대

## ⚠️ 업스트림 코드의 잠재적 문제점

롤백 후에도 여전히 존재하는 잠재적 문제점들을 아래에 문서화합니다:

1. **Windows 줄바꿈 문자(CRLF) 처리 문제**
   * 업스트림 코드는 Unix 스타일 줄바꿈(LF)만 제대로 처리하며 Windows 줄바꿈(CRLF)을 올바르게 처리하지 못함
   * 특히 `diff.ts`의 `constructNewFileContent()` 함수에서 발생
   * 줄바꿈 처리 시 `\n`으로만 검사하여 CRLF 환경에서 '\r\n'이 올바르게 처리되지 않음

2. **문자열 종료 조건 처리 불완전**
   * SEARCH/REPLACE 블록 처리 시 문자열 종료 조건이 불완전하게 구현됨
   * 문자열 끝 부분의 줄바꿈 문자 처리 로직에 결함이 있음
   * 예: `currentReplaceContent.endsWith("\n")` 확인 시 CRLF를 고려하지 않음

3. **파일 내용 보존 메커니즘 부재**
   * 매칭되지 않는 부분에 대한 파일 내용 보존 로직이 부실함
   * 복잡한 매칭 패턴에서 원본 파일 내용이 유실될 위험 존재
   * 특히 멀티라인 블록에서 정확한 위치 매칭 실패 시 파일 내용 손상 가능성 높음

4. **EOL(End of Line) 일관성 미확보**
   * 파일 시스템의 EOL 설정을 읽어오지 않고 하드코딩된 줄바꿈 문자 사용
   * 결과적으로 OS 간 이동 시 줄바꿈 형식이 손상될 수 있음

이러한 문제들은 향후 `replace_in_file` 도구의 안정적인 사용을 위해 반드시 해결되어야 할 과제입니다.

## 📍 수정된 파일

1. `src/core/assistant-message/diff.ts` - 핵심 파일 내용 수정 로직
2. `src/core/prompts/sections/EDITING_FILES_GUIDE.json` - AI 가이드라인
3. `test/replace-in-file-bug-test.md` - 테스트 케이스 파일
4. `test/replace-in-file-simple-test.js` - 테스트 스크립트

## 🔍 2025-04-14 핵심 버그 원인 발견 및 수정

### 🐛 결정적 버그 원인 발견
1. **프롬프트 불일치 문제**
   * JSON 형식과 마크다운 형식 간의 SEARCH/REPLACE 블록 형식 불일치 발견
   * JSON 프롬프트: `<<<<<<< SEARCH [exact content to find]` (같은 줄에 마커와 내용)
   * 마크다운 프롬프트: `<<<<<<< SEARCH\n[exact content to find]` (줄바꿈 후 내용)

2. **결과적 동작**
   * AI는 JSON 형식(`<<<<<<< SEARCH 다시 테스트`)으로 응답 생성
   * 파서는 마크다운 형식을 기대하고 있어 SEARCH 블록이 비어있다고 잘못 해석
   * 빈 SEARCH 블록은 "파일 전체 대체 시나리오"로 처리되어 원본 내용 손실

### 📝 수정 내용
1. **JSON 프롬프트 파일 수정**
   * `src/core/prompts/sections/TOOL_DEFINITIONS.json` - SEARCH/REPLACE 블록 형식에 줄바꿈 문자(`\n`) 명시적 추가
   * `src/core/prompts/sections/EDITING_FILES_GUIDE.json` - 동일하게 줄바꿈 형식으로 수정

```diff
- "desc": "SEARCH/REPLACE blocks following this exact format: '<<<<<<< SEARCH [exact content to find] ======= [new content to replace with] >>>>>>> REPLACE'"
+ "desc": "SEARCH/REPLACE blocks following this exact format: '<<<<<<< SEARCH\n[exact content to find]\n=======\n[new content to replace with]\n>>>>>>> REPLACE'"
```

### 💡 추가 개선 방향
1. **코드 파서 개선**
   * `diff.ts`의 `constructNewFileContent()` 함수 개선 필요
   * 두 가지 형식(줄바꿈 있는 경우와 없는 경우) 모두 처리 가능하도록 로직 수정
   * SEARCH 마커 뒤에 공백과 내용이 바로 있는 경우도 적절히 처리하는 로직 추가

2. **포괄적인 형식 검사**
   * 프로젝트 전체에서 유사한 형식 불일치가 있는지 확인 필요
   * AI 프롬프트와 실제 파서 간의 기대치 일치 확인
