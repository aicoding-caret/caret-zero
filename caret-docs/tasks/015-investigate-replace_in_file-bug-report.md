
# `replace_in_file` 도구 버그 조사 상세 보고서 (2025-04-13)

## 담당자
*   루크 (마스터)
*   알파 (AI)

## 1. 버그 개요

`replace_in_file` 도구가 특정 조건(파일 끝부분에 내용 추가 등)에서 성공 메시지를 반환하거나 오류를 발생시키면서도 실제 파일 내용을 의도대로 수정하지 못하는 버그 발생. 심한 경우 파일 내용이 비워지는 현상도 관찰됨.

## 2. 디버깅 및 분석 과정 요약

### 2.1. 초기 문제 발생 및 분석 (Task #001 진행 중)
*   규칙 시스템 개선 계획을 `docs/.../001-cline-rule-syste-modify.md` 파일 끝에 추가하려 할 때 `replace_in_file` 실패.
*   초기 디버그 로그 분석 결과, `constructNewFileContent` 함수가 빈 문자열 또는 원본과 동일한 내용을 반환하는 것으로 추정됨.

### 2.2. 단위 테스트 환경 설정 및 오류 해결
*   `replace_in_file` 버그 재현 및 디버깅을 위해 단위 테스트 환경 설정 시도.
*   **문제 1:** `npm run test:unit` 실행 시 Windows PowerShell 환경에서 `TS_NODE_PROJECT=...` 명령어 오류 발생.
    *   **시도:** `cross-env` 설치, `package.json` 수정, `npm install`, 캐시 정리, `node_modules` 재설치.
    *   **결과:** 문제 지속. `npm run` 환경 문제로 추정.
*   **문제 2:** `npx mocha` 직접 실행 시도 시 셸 스크립트 호환성 오류 (`SyntaxError`) 발생.
*   **문제 3:** `npx ts-node ... mocha ...` 실행 시 `TypeError: Cannot read properties of undefined (reading 'async')` 발생 (ESM/CJS 모듈 로딩 문제 추정).
*   **문제 4:** TypeScript 타입 오류 (`Cannot find module`, `Cannot find name` 등) 발생.
    *   **해결:** `tsconfig.unit-test.json` 수정 (`lib`, `types`, `include` 옵션 조정), `src/test/extension.test.ts` 타입 가드 추가 (실제 파일 수정은 `replace_in_file` 버그로 실패 후 `write_to_file` 사용).
*   **문제 5:** 단위 테스트 실행기 스크립트(`run-unit-tests.js`) 생성 후 실행 시 `ReferenceError: suite is not defined` 발생.
    *   **해결:** 테스트 파일에 `import { suite, test } from 'mocha'` 추가.
*   **문제 6:** 단위 테스트 실행 시 테스트 파일 내에서 원본 파일 경로(`fs.readFileSync`) 오류 발생.
    *   **해결:** 테스트 파일 내 경로 계산 로직 수정 (`path.resolve(process.cwd(), ...)` 사용).
*   **최종 테스트 환경:** `run-unit-tests.js` (Mocha JS API 사용) 스크립트를 `node run-unit-tests.js`로 실행.

### 2.3. 단위 테스트를 통한 버그 재현 및 원인 분석
*   수정된 단위 테스트 환경에서 `src/test/suite/assistant-message-diff.test.ts` 실행.
*   **결과:** 파일 끝부분 추가 시나리오에서 테스트 실패. `constructNewFileContent` 함수가 `Error: The SEARCH block... does not match anything in the file.` 오류 발생시킴.
*   **로그 분석:** 함수 내 3단계 매칭 로직(Exact, Line-Trimmed, Block Anchor) 모두 실패 확인. 줄바꿈 정규화, 마지막 줄바꿈 처리 방식 변경 시도했으나 동일하게 실패.
*   **최종 결론:** 버그의 근본 원인은 `constructNewFileContent` 함수의 **매칭 로직 자체**에 있으며, 특히 파일 끝 경계(EOF)를 포함하는 패턴을 올바르게 처리하지 못하는 것으로 판단됨.

## 3. 테스트 방법

*   **실행 명령어:** `node run-unit-tests.js`
*   **테스트 파일:** `src/test/suite/assistant-message-diff.test.ts`
*   **테스트 케이스:** `Should correctly append content to the end of the file (Bug Scenario)`
*   **사전 조건:** 테스트 파일 내 `originalContent` 변수가 `docs/work-logs/luke-and-alpha/tasks/001-cline-rule-syste-modify.md`의 실제 내용으로 채워져 있어야 함. `expectedResult` 변수도 올바른 기대값으로 설정되어야 함. `assert.strictEqual` 검증 사용 필요.
*   **상세 로그 확인:** `src/core/assistant-message/diff.ts` 파일에 추가된 `log.debug` 내용 확인.

## 4. 예상 문제 위치

*   **핵심 함수:** `src/core/assistant-message/diff.ts` 내 `constructNewFileContent` 함수.
*   **세부 로직:**
    *   `normalizedOriginalContent.indexOf(currentSearchContent, lastProcessedIndex)`: 파일 끝부분 포함 시 정확 매칭 실패 가능성.
    *   `lineTrimmedFallbackMatch(...)`: 파일 끝부분 라인 처리 로직 검토 필요.
    *   `blockAnchorFallbackMatch(...)`: 파일 끝부분 라인 처리 로직 검토 필요.
    *   파일 끝 경계(EOF) 처리 전반의 로직 검토 필요.

## 5. 추가 고려 사항 (마스터 질문 답변)

*   **한글 문제 가능성:** 실패한 테스트 케이스의 SEARCH/REPLACE 블록에 한글이 포함되어 있습니다. 문자 인코딩(UTF-8 가정) 또는 매칭 로직의 멀티바이트 문자 처리 방식에 문제가 있을 가능성도 **배제할 수 없습니다.** 디버깅 시 이 부분도 함께 고려해볼 가치가 있습니다.
*   **외부 라이브러리 사용 여부:** `constructNewFileContent` 함수 및 관련 매칭 함수(`lineTrimmedFallbackMatch`, `blockAnchorFallbackMatch`)는 **외부 diff/patch 라이브러리를 사용하지 않고 직접 구현된 로직**입니다. Node.js 내장 모듈(`fs`, `path`, `crypto`)만 사용합니다. (테스트 실행 환경인 `mocha`, `ts-node` 등은 외부 라이브러리입니다.)

## 6. 권장 해결 방향

1.  `constructNewFileContent` 함수의 매칭 로직(특히 파일 끝 경계 처리)을 직접 수정합니다. (현재 AI 능력으로는 어려움)
2.  또는, 더 안정적인 외부 diff/patch 라이브러리(예: `diff-match-patch`) 도입을 검토합니다.

## 7. 현재 상태

*   버그 원인 분석 완료.
*   단위 테스트 환경 설정 완료 및 버그 재현 확인.
*   근본적인 코드 수정 또는 라이브러리 교체 결정 대기 중.
*   Task #015 진행 중단.
