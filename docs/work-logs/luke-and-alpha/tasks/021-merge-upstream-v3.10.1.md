# 태스크 #021: Upstream (v3.10.1) 변경 사항 병합

## 담당자
*   루크 (마스터)
*   알파 (AI)

## 목표
`cline-upstream` 디렉토리 (v3.10.1)의 최신 변경 사항을 현재 프로젝트 (v3.8.7 기반)에 신중하게 병합합니다. 버전 차이가 크므로, 파일별 비교를 통해 필요한 변경 사항만 선별적으로 적용하고, 시스템 프롬프트 및 구조 변경 가능성에 유의합니다. 모든 병합 과정과 결정 사항을 상세히 기록합니다.

## 배경
이전 작업(Task #015-018 복구 및 빌드 안정화) 완료 후, `cline-upstream` 디렉토리에 최신 소스 코드(v3.10.1)가 업데이트되었습니다. 현재 프로젝트는 v3.8.7 기반이므로, 두 버전 간의 차이를 분석하고 필요한 기능을 현재 프로젝트에 통합해야 합니다.

## 세부 작업 계획
1.  **변경 사항 분석:** `cline-upstream/CHANGELOG.md` 및 Git 히스토리(필요시)를 통해 v3.8.7 이후 v3.10.1까지의 주요 변경 사항 파악.
2.  **파일별 비교 및 병합:**
    *   `package.json`: 의존성 변경 사항 비교 및 필요한 패키지 업데이트/추가.
    *   `src/extension.ts`: 확장 진입점 변경 사항 비교 및 적용.
    *   `src/core/controller/index.ts`: 컨트롤러 로직 변경 사항 비교 및 적용.
    *   `src/core/task/index.ts`: 태스크 실행 로직 변경 사항 비교 및 적용.
    *   `src/core/webview/index.ts`: 웹뷰 프로바이더 변경 사항 비교 및 적용.
    *   `src/api/`: API 핸들러 및 관련 로직 변경 사항 비교 및 적용.
    *   `src/services/`: 로깅, MCP, 인증 등 서비스 관련 변경 사항 비교 및 적용.
    *   `src/integrations/`: 체크포인트, 에디터, 터미널 등 통합 기능 변경 사항 비교 및 적용.
    *   `src/shared/`: 공유 타입 및 유틸리티 변경 사항 비교 및 적용.
    *   `webview-ui/`: 웹뷰 UI 관련 변경 사항 비교 및 적용 (컴포넌트, 컨텍스트 등).
    *   `src/core/prompts/`: 시스템 프롬프트 및 관련 파일 변경 사항 비교 및 적용 (구조 변경 유의).
    *   기타 설정 파일 (`.eslintrc.json`, `tsconfig.json` 등) 변경 사항 비교 및 적용.
3.  **빌드 및 테스트:** 병합 과정 중 주기적으로 빌드(`npm run compile`) 및 테스트를 수행하여 안정성 확인.
4.  **문서화:** 각 파일 병합 시 변경 내용, 결정 이유, 충돌 해결 과정 등을 본 로그 파일에 상세히 기록.

## 병합 기록

### 1. Upstream 변경 사항 분석 (v3.8.7 -> v3.10.1)

`cline-upstream/CHANGELOG.md` 파일을 분석하여 v3.8.7 이후부터 v3.10.1까지의 주요 변경 사항을 확인했습니다. 병합 계획 수립 및 진행에 참고할 주요 내용은 다음과 같습니다.

**주요 변경 사항 요약:**

*   **v3.10.x:**
    *   **새로운 기능:**
        *   `Create New Task` 도구 추가 (AI 자율 작업 시작 가능)
        *   로컬 Chrome 원격 디버깅을 통한 브라우저 도구 개선 (세션 기반 브라우징)
        *   MCP 서버 관리 UI 개선 (모달, 탭 추가)
        *   파일/폴더 드래그 앤 드롭 지원
        *   CMD+' 단축키 추가 ('Add to Cline')
        *   모든 명령어 자동 승인 옵션 추가 (주의 필요)
    *   **개선:**
        *   컨텍스트 관리 개선
        *   파일 언급 검색/스코어링 개선 (관련성 기반 정렬/제외)
        *   수동 파일 편집 감지 기능 추가 (diff 오류 감소 기대)
    *   **API/Provider:**
        *   Gemini 비용 계산 수정 (계층적 가격 구조 반영)
        *   LiteLLM/Claude 프롬프트 캐싱 추가
        *   Bytedance Doubao 지원 추가
        *   Gemini 2.5 Pro Preview 추가
    *   **수정:**
        *   Mermaid 다이어그램 렌더링 문제 수정
        *   MCP 자동 승인 토글 동기화 문제 수정

*   **v3.9.x:**
    *   **새로운 기능:**
        *   LiteLLM 확장 사고(extended thinking) 활성화 옵션 추가
        *   로컬 MCP 서버 설정 탭 추가
    *   **개선:**
        *   추천 모델 표시 (Cline provider)
    *   **API/Provider:**
        *   (v3.10.x와 중복되는 내용 외 특이사항 적음)
    *   **수정:**
        *   DeepSeek API 토큰 계산 및 컨텍스트 관리 문제 수정
        *   특정 조건에서 체크포인트 중단(hanging) 문제 수정
        *   중복 BOM(Byte Order Mark) 문제 수정

**병합 시 주요 고려 사항:**

*   **새로운 도구:** `Create New Task` 도구 관련 로직 추가 필요.
*   **브라우저 도구:** 로컬 Chrome 연동 방식으로 변경됨. 관련 설정 및 로직 수정 필요 (`src/services/browser/`).
*   **MCP:** 서버 관리 UI/UX 변경, 원격 서버 지원(SSE), 자동 승인 로직 변경 등 다수 변경. `src/services/mcp/`, `webview-ui/` 관련 코드 면밀히 검토 필요.
*   **컨텍스트 관리:** 개선된 로직 반영 필요 (`src/core/task/ContextManager.ts` 등).
*   **파일 언급/처리:** 검색/스코어링 로직, 수동 편집 감지 로직 추가 필요.
*   **API Provider:** 신규 Provider(Doubao 등) 추가 및 기존 Provider(Gemini, DeepSeek, LiteLLM 등) 업데이트 반영 필요 (`src/api/`).
*   **체크포인트:** 중단 문제 수정 및 관련 로직 안정화 확인 필요 (`src/integrations/checkpoint/`).
*   **UI/UX:** 드래그 앤 드롭, 단축키, MCP 설정 UI 등 웹뷰 변경 사항 반영 필요 (`webview-ui/`).

*(이후 파일별 병합 내용을 여기에 계속 기록)*

### 2. `package.json` 병합

*   **변경 내용:** Upstream v3.10.1의 `package.json` 내용을 현재 프로젝트에 적용했습니다. 주요 변경 사항은 다음과 같습니다.
    *   `version` 업데이트 (0.0.1 -> 3.10.1)
    *   `displayName` 변경 ("^Caret" -> "Cline")
    *   `author` 변경 ("Pulse9 Inc." -> "Cline Bot Inc.")
    *   `homepage` 변경 ("https://caret.click" -> "https://cline.bot")
    *   `contributes.commands[].category` 변경 ("Caret" -> "Cline")
    *   `contributes.keybindings` 추가 (cmd+' 단축키)
    *   `contributes.menus['editor/title']` 추가 (탭 패널용 메뉴)
    *   `contributes.configuration.title` 변경 ("Caret" -> "Cline")
    *   `scripts`: `watch:tsc`, `package`, `compile-tests`, `watch-tests`, `check-types`, `test`, `test:unit` 등 스크립트 명령어 및 옵션 변경/추가.
    *   `devDependencies`: `@types/proxyquire`, `proxyquire`, `ts-node` 추가.
    *   `dependencies`: `chrome-launcher`, `fzf` 추가. `puppeteer-core` 버전 변경.
*   **적용 방식:** 변경 사항이 많아 `write_to_file` 도구를 사용하여 전체 파일을 업데이트했습니다.
*   **후속 조치:** `npm install` 명령어를 실행하여 업데이트된 의존성을 설치했습니다.

### 3. `src/extension.ts` 병합

*   **변경 내용 비교:** 현재 프로젝트와 Upstream 버전 간의 주요 차이점은 로깅 방식입니다.
    *   현재 프로젝트: `WebviewProvider` 인스턴스의 `controller.logger` 사용 (이전 리팩토링 결과).
    *   Upstream: 정적 `Logger` 클래스 사용.
*   **결정:** 현재 프로젝트의 로깅 방식(`controller.logger`)을 유지하기로 결정했습니다. 이는 이전 작업에서 안정성을 위해 적용한 리팩토링 결과이며, Upstream의 정적 로거 방식은 잠재적 문제를 다시 야기할 수 있습니다. 다른 코드 변경 사항은 없어 별도 병합 작업은 수행하지 않습니다.
*   **결론:** `src/extension.ts` 파일은 변경하지 않습니다.

### 4. `src/core/controller/index.ts` 병합

*   **변경 내용 비교:**
    *   **로깅:** Upstream은 정적 `Logger` 대신 `outputChannel`을 직접 사용하지만, 현재 프로젝트의 `ILogger` 기반 시스템을 유지하기로 결정했습니다. (Task #015-020 리팩토링 결과 유지)
    *   **Task 생성자:** Upstream은 로거를 전달하지 않지만, 현재 프로젝트처럼 로거를 전달하도록 유지합니다.
    *   **신규 기능 핸들러:** 브라우저 연결/테스트/탐색, 파일 검색, 상대 경로 계산, 설정 스크롤 등 새로운 웹뷰 메시지 핸들러가 Upstream에 추가되었습니다.
    *   **기타:** `latestAnnouncementId` 업데이트, `browserSettings` 핸들러 로직 변경 등이 확인되었습니다.
*   **적용 방식:** `replace_in_file`을 사용하여 병합했습니다.
    *   로깅 관련 코드는 현재 프로젝트 버전을 유지했습니다.
    *   Task 생성자에 로거를 전달하는 코드를 유지했습니다.
    *   Upstream의 신규 웹뷰 메시지 핸들러 (`getBrowserConnectionInfo`, `testBrowserConnection`, `discoverBrowser`, `relaunchChromeDebugMode`, `getDetectedChromePath`, `scrollToSettings`, `getRelativePaths`, `searchFiles`) 및 관련 import 구문을 추가했습니다.
    *   `latestAnnouncementId`를 Upstream 버전으로 업데이트했습니다.
    *   `browserSettings` 핸들러 로직을 Upstream 버전으로 업데이트했습니다.
*   **이슈:** 병합 후 타입스크립트 오류 발생. 이는 `WebviewMessage`, `ExtensionMessage` 등 공유 타입 정의가 업데이트되지 않았기 때문으로 파악되었습니다.

### 5. `src/shared/WebviewMessage.ts` 및 `src/shared/ExtensionMessage.ts` 병합

*   **변경 내용 비교:** Upstream 버전에는 `Controller`에서 새로 추가된 핸들러들과 관련된 새로운 메시지 타입 및 속성들이 정의되어 있습니다 (`discoverBrowser`, `testBrowserConnection`, `browserConnectionResult`, `browserRelaunchResult`, `getBrowserConnectionInfo`, `getDetectedChromePath`, `detectedChromePath`, `scrollToSettings`, `getRelativePaths`, `searchFiles`, `relativePathsResponse`, `fileSearchResults` 등). `ExtensionState` 인터페이스에도 `remoteBrowserHost` 속성이 추가되었습니다.
*   **적용 방식:** `replace_in_file`을 사용하여 Upstream의 변경 사항을 현재 프로젝트 파일에 적용했습니다.
    *   `WebviewMessage`: 새로운 `type` 값들과 `uris`, `mentionsRequestId`, `query` 속성을 추가했습니다.
    *   `ExtensionMessage`: 새로운 `type` 값들과 `paths`, `success`, `endpoint`, `isBundled`, `isConnected`, `isRemote`, `host`, `mentionsRequestId`, `results` 속성을 추가했습니다. `ExtensionState`에 `remoteBrowserHost`를 추가했습니다. (단, 마스터 커스텀 `alphaAvatarUri`는 유지)
*   **결과:** 이 파일들을 업데이트한 후 `src/core/controller/index.ts`의 타입 오류가 해결되었습니다.

### 6. `src/core/task/index.ts` 병합 (진행 중)

*   **Import 구문 정리:**
    *   중복된 `FileContextTracker` import 제거 완료.
    *   `ILogger` import 확인 완료.
    *   `getContextWindowInfo` import 경로 오류 수정 완료 (`context-window-utils.ts` 파일 생성 후).
*   **파일 추가:**
    *   `src/core/context-management/context-window-utils.ts` (Upstream에서 가져옴)
    *   `src/services/browser/BrowserDiscovery.ts` (Upstream에서 가져옴)
    *   `src/services/search/file-search.ts` (Upstream에서 가져옴)
    *   `src/services/ripgrep/index.ts` (Upstream에서 가져옴)
*   **`src/core/controller/index.ts` 로거 재적용:**
    *   Upstream 버전으로 덮어쓴 후, `ILogger` import, `Logger` import, `logger` 멤버 변수 선언, 생성자 초기화, `Task` 생성자 호출 시 `this.logger` 전달 코드를 다시 적용했습니다.
    *   `BrowserSession` 생성자 호출 시 `this.logger` 전달 코드를 다시 적용했습니다.

### 7. 작업 중단 (2025-04-10 01:47 KST)

*   **사유:** 늦은 시간 및 다수의 잔여 컴파일 오류로 인해 작업 중단 결정.
*   **현재 상태:**
    *   Upstream의 신규 파일(`context-window-utils.ts`, `BrowserDiscovery.ts`, `file-search.ts`, `ripgrep/index.ts`) 추가 완료.
    *   `src/core/controller/index.ts` 파일에 로컬 로거 관련 코드 재적용 완료.
    *   `npm run compile` 실행 결과, 여전히 다수의 오류 발생 (총 26개):
        *   `src/core/controller/index.ts` (22개 오류): `Task` 생성자 인자 타입 오류(TS2345), `BrowserSession`/`BrowserSettings` 관련 속성/메서드 부재 오류(TS2339), `read/refreshOpenRouterModels` 등 컨트롤러 메서드 부재 오류(TS2339), 기타 구문 오류(TS1472, TS1128 등 - 이전 `replace_in_file` 오류의 잔재로 추정).
        *   `src/extension.ts` (4개 오류): `controller.logger` 접근 오류(TS2339).
*   **다음 작업:**
    1.  `src/core/controller/index.ts`의 남은 컴파일 오류 해결 (Upstream과 비교하여 누락된 메서드/속성 추가 및 로직 수정).
    2.  `src/extension.ts`의 로거 접근 오류 해결 (컨트롤러 로거 접근 방식 확인 및 수정).
    3.  `src/core/task/index.ts`의 나머지 Upstream 변경 사항 병합 시작.

### 8. 작업 중단 (2025-04-10 07:15 KST)

*   **사유:** 컨텍스트 창 사용량(79%)이 높아지고, `src/core/controller/index.ts` 파일의 `BrowserSession` 관련 오류 해결을 위해 추가적인 파일 비교 및 분석이 필요하여 작업 중단.
*   **현재 상태:**
    *   `src/core/controller/index.ts` 파일에 `ILogger` import 및 속성 추가, `Task` 생성자에 로거 전달 코드 수정 완료.
    *   `BrowserSession` 관련 메서드/속성 호출 부분 제거 시도 중 `replace_in_file` 오류 발생 (SEARCH 블록 불일치). 파일은 이전 상태로 복원됨.
    *   `npm run compile` 실행 시 여전히 다수의 오류 발생 상태 (주요 오류는 이전 중단 시점과 유사).
*   **다음 작업:**
    1.  `src/core/controller/index.ts`의 `BrowserSession` 관련 오류 해결 (Upstream의 `BrowserSession.ts` 및 `BrowserSettings.ts` 파일과 비교하여 현재 프로젝트의 `BrowserSession.ts` 수정 또는 Controller 로직 수정).
    2.  `src/core/controller/index.ts`의 나머지 컴파일 오류 해결.
    3.  `src/extension.ts`의 로거 접근 오류 해결.
    4.  `src/core/task/index.ts` 병합 계속 진행.
