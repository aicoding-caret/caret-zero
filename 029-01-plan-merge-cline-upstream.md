- [X] `cline-upstream` 변경 파일 목록 정확히 파악 (`git diff --name-only v3.10.1 v3.16.1` 실행 완료)
    -   **주요 변경 영역 (요약):**
        -   루트 설정 파일 다수 (`.codespellrc`, `.gitignore`, `.mocharc.json`, `package.json`, `tsconfig.json` 등)
    -   (상세 전체 목록은 `git diff --name-only v3.10.1 v3.16.1` 명령 결과 참조)
- [ ] **우리 프로젝트(`caret-zero`)의 `v3.10.1` (커밋 `1cd3bd50` 기준) 이후 변경 사항과 위 `cline-upstream` 변경 목록 비교 분석**
    -   [X] `caret-zero` 변경 파일 목록 추출 (`git diff --name-only 1cd3bd50 HEAD > caret_zero_changes.txt` 실행 및 결과 저장 완료)
    -   [ ] `cline-upstream` 단독 변경 파일 목록 식별 (두 `diff` 결과 비교)
    -   [ ] 양쪽 모두 변경된 파일 목록 식별
    -   [ ] `caret-zero` 단독 변경 파일 목록 식별 (참고용)
- [X] 커스텀 로직 유지 결정 및 Upstream 기능 선택적 가져오기 결정 (마스터와 상의)
    -   **선택적 통합:** API Provider 등 특정 기능에 대해서는 필요에 따라 선택적으로 통합하거나 우선순위를 둘 수 있으며, 이는 각 파일 병합 단계에서 마스터와 논의하여 결정한다.

## 2. 파일별 병합 전략 (File-by-File Merging Strategy)

**병합 우선순위 및 주요 절차:**

- [ ] **1단계: Upstream 단독 변경 파일 우선 적용**
    -   **대상:** "1. 사전 분석" 단계에서 식별된 `cline-upstream`에서만 변경된 파일.
    -   **작업:**
        -   [ ] 해당 파일 목록을 `029-03-report-merge-cline-upstream.md`에 기록.
        -   [ ] 각 파일을 `cline-upstream` 버전으로 `caret-zero`에 덮어쓰기 (`write_to_file`).
            - (주의: 우리 커스텀 로직과 전혀 무관한지 또는 영향도가 낮은 파일인지 간단히 재확인)
        -   [ ] 덮어쓴 파일들에 대해 전역 문자열 치환 수행 (`cline` -> `caret` 등).

- [ ] **2단계: 전역 문자열 치환 (Branding Alignment) - 나머지 파일 대상**
    -   **대상:** 1단계에서 처리되지 않은 `cline-upstream`에서 가져올 나머지 파일들.
    -   **작업:**
        -   [ ] 본격적인 병합 전, 또는 병합 직후 파일 단위로 `cline` -> `caret` (및 대소문자 변형) 문자열 일괄 변경 (`replace_in_file` 또는 마스터 지시 스크립트 사용).

- [ ] **3단계: `package.json` 의존성 관리**
    -   **분석:** 현재 프로젝트와 `cline-upstream`의 `package.json` 비교 완료. 주요 변경 사항은 버전, 이름, 설명, 활성화 이벤트, 명령어, 메뉴, 설정, 빌드 스크립트, 의존성 등 전반에 걸쳐 확인됨. Upstream 버전(3.16.1)은 현재 버전(3.10.1)보다 많은 기능과 개선 사항을 포함.
    -   **전략:** `cline-upstream/package.json` 내용으로 현재 `package.json`을 업데이트.
        -   [ ] 문자열 치환 (`cline` -> `caret` 등) 우선 적용.
        -   [ ] `write_to_file`로 Upstream 버전 덮어쓰기.
    -   **후속 조치 (덮어쓰기 후 필수 확인 및 조정):**
        -   [ ] **프로젝트 식별 정보:** `name` (예: "caret-zero-dev"), `version` (예: "3.16.1-alpha") 등 우리 프로젝트를 식별할 수 있도록 수정 (마스터와 논의).
        -   [ ] **커스텀 로직 의존성:** `ILogger` 등 우리 커스텀 로직에 필요한 특정 의존성이 누락되지 않았는지 확인하고 필요시 추가.
        -   [ ] **빌드 스크립트 호환성:** `esbuild.js` 등 기존 빌드 시스템과 Upstream의 `scripts`가 호환되는지 확인하고 필요한 조정 수행.
        -   [ ] **Webview UI 빌드:** `webview-ui` 관련 빌드 스크립트(예: `build:webview`)가 현재 프로젝트 구조 및 빌드 방식과 맞는지 확인하고 조정.
        -   [ ] **의존성 설치:** 병합 후 `npm install` 또는 `npm update` 실행.

- [ ] **4단계: 나머지 핵심 모듈, UI, 프롬프트, 설정 파일 순차적/분석적 병합**
    -   **대상:** "1. 사전 분석"에서 식별된 양쪽 모두 변경된 파일 및 기타 분석 필요한 파일.
    -   **작업 (파일 유형별 세부 계획은 하위 항목으로 구체화):**
        -   [ ] `src/core` (커스텀 로직 `ILogger` 등 유지하며 병합)
        -   [ ] `src/services` (커스텀 로직 `ILogger` 등 유지하며 병합)
        -   [ ] `src/integrations`
        -   [ ] `src/shared`
        -   [ ] `webview-ui/`
        -   [ ] `src/core/prompts/` (JSON 구조 유지, 내용 분석 반영)
        -   [ ] 기타 설정 파일
        -   **공통 작업:**
            -   [ ] 각 파일 병합 시 `cline-upstream-merging-guide.md`의 지침(커스텀 로직 유지, `replace_in_file` 신중 사용 등) 준수.
            -   [ ] 병합 과정에서 사용되지 않는 코드 식별 및 마스터 확인 후 제거.
            -   [ ] 필요한 신규 코드/로직 통합.
            -   [ ] 각 파일 병합 후 `npm run compile` 실행.

## 3. 빌드 및 테스트 계획 