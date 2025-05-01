# Caret 유틸리티 가이드

이 문서는 Caret 프로젝트에서 사용할 수 있는 유틸리티 함수들을 정리한 것입니다. 중복 구현을 방지하고 기존 코드를 활용하기 위해 참고하세요.

## 백엔드(Extension) 유틸리티

### 파일 시스템 관련 (`src/utils/fs.ts`)
- `readFile`: 파일 읽기
- `writeFile`: 파일 쓰기
- `fileExists`: 파일 존재 확인
- `ensureDirectory`: 디렉토리 생성 확인

### 경로 관련 (`src/utils/path.ts`)
- `normalizePath`: 경로 정규화
- `getRelativePath`: 상대 경로 가져오기
- `isSubPath`: 하위 경로인지 확인

### 문자열 처리 (`src/utils/string.ts`)
- `truncate`: 문자열 자르기
- `escapeRegExp`: 정규표현식 특수문자 이스케이프
- `formatBytes`: 바이트 형식화

### Git 관련 (`src/utils/git.ts`)
- `getGitInfo`: Git 정보 가져오기
- `getGitDiff`: Git 변경사항 가져오기

### 저장소 관련 (`src/utils/storage.ts`)
- `getGlobalStorage`: 전역 저장소 가져오기
- `getWorkspaceStorage`: 작업공간 저장소 가져오기

### 유효성 검사 (`src/utils/validation.ts`)
- `isValidUrl`: URL 유효성 검사
- `isValidEmail`: 이메일 유효성 검사

## 프론트엔드(Webview) 유틸리티

### VSCode 통신 (`webview-ui/src/utils/vscode.ts`)
- `vscode`: VSCode API와 통신하기 위한 유틸리티

### 로깅 (`webview-ui/src/utils/logger.ts`)
- `WebviewLogger`: 프론트엔드 로깅 유틸리티

### 형식화 (`webview-ui/src/utils/format.ts`)
- `formatDate`: 날짜 형식화
- `formatTime`: 시간 형식화

### React 훅 (`webview-ui/src/utils/hooks.ts`)
- `useLocalStorage`: 로컬 스토리지 훅
- `useDebounce`: 디바운스 훅

### 플랫폼 유틸리티 (`webview-ui/src/utils/platformUtils.ts`)
- `isMac`: Mac 플랫폼 확인
- `isWindows`: Windows 플랫폼 확인

## 유틸리티 사용 및 구현 지침

1. **기존 유틸리티 활용**:
   - 새로운 기능을 구현하기 전에 반드시 이 문서를 참고하여 기존 유틸리티가 있는지 확인하세요.
   - 중복 구현을 방지하고 코드 일관성을 유지하세요.

2. **새로운 유틸리티 구현**:
   - 필요한 유틸리티가 없는 경우, 적절한 위치에 새로운 유틸리티를 구현하세요:
     - 백엔드: `src/utils/` 디렉토리
     - 프론트엔드: `webview-ui/src/utils/` 디렉토리
   - 유틸리티 구현 후 이 문서를 업데이트하여 다른 개발자들이 새로운 유틸리티를 알 수 있도록 하세요.

3. **유틸리티 구현 원칙**:
   - 단일 책임 원칙(SRP)을 준수하세요.
   - 적절한 주석과 테스트 코드를 함께 작성하세요.
   - 유틸리티 함수는 순수 함수(pure function)로 구현하여 테스트와 유지보수를 용이하게 하세요.

4. **유틸리티 문서 업데이트**:
   - 새로운 유틸리티를 구현하거나 기존 유틸리티를 수정한 경우, 이 문서를 함께 업데이트하세요.
   - 유틸리티 이름과 간단한 설명만 추가하면 충분합니다.
