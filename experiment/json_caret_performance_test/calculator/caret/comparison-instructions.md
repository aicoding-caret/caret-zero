# 작업 지시서

**목표:** 이 지시서에 따라 현재 폴더 내에 지정된 프로젝트 구조와 파일을 정확히 생성합니다. 


**1단계: 요구사항 명세서 작성**

*   **요청:** "간단한 웹 계산기 애플리케이션을 만들기 위한 요구사항 명세서를 `calculator-spec.md` 파일로 작성해주세요. 명세서에는 필요한 기능, 사용자 인터페이스 요소, 기본 동작 방식, 그리고 **테스트해야 할 핵심 로직**들이 포함되어야 합니다."
*   **결과물:** `cline-comparison-test` 폴더 내에 `calculator-spec.md` 파일 생성.

**2단계: 명세서 기반 TDD 코드 구현**

*   **요청:** (1단계 완료 후) "방금 작성한 `calculator-spec.md` 파일의 요구사항에 따라 **테스트 주도 개발(TDD) 방식**으로 웹 계산기 애플리케이션을 구현해주세요.
    1.  먼저 계산기 로직에 대한 **테스트 코드를 작성**해주세요. (UI 테스트 제외, Jest 또는 순수 JS 사용)
    2.  작성한 테스트를 통과하도록 **실제 계산기 로직(JavaScript)을 구현**해주세요.
    3.  마지막으로 계산기의 구조(HTML)와 스타일(CSS)을 구현해주세요."
*   **결과물:** `cline-comparison-test` 폴더 내에 웹 계산기 관련 파일들(예: `index.html`, `style.css`, `script.js`)과 테스트 코드 파일(예: `script.test.js`) 생성.

**3단계: 프로젝트 보고서 작성**

*   **요청:** (2단계 완료 후) "지금까지 생성한 웹 계산기 프로젝트(요구사항 명세서, 소스 코드, 테스트 코드 포함)에 대한 **프로젝트 보고서를 `project-report.md` 파일로 작성**해주세요. 보고서에는 프로젝트 개요, 구현된 기능 목록, 사용된 기술 스택, 프로젝트 구조 설명, TDD 접근 방식 요약 등이 포함되어야 합니다."
*   **결과물:** `cline-comparison-test` 폴더 내에 `project-report.md` 파일 생성.

**완료 확인:**

1.  생성된 `calculator-spec.md` 파일의 내용 확인.
2.  생성된 테스트 코드가 로직을 검증하는지 확인.
3.  생성된 웹 계산기(`index.html`)가 요구사항대로 동작하고 테스트를 통과하는지 확인.
4.  생성된 `project-report.md` 파일의 내용이 프로젝트를 잘 요약하고 있는지 확인.
5.  두 Cline 버전 모두 기능적으로 동일한 최종 결과물(명세서, 앱, 테스트 코드, 보고서)을 생성해야 합니다.

**측정:** 1단계부터 3단계까지 수행하는 전체 과정에서 발생한 모든 API 호출의 총 토큰 사용량과 총 Latency 합계를 기록해주세요.
