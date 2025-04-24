# 도구 실행 불안정성 해결 (Tool Execution Instability Fix)

- **태스크 번호**: #008
- **태스크 이름**: 도구 실행 불안정성 해결 (Tool Execution Instability Fix)
- **생성일**: 2025-04-06
- **상태**: 완료
- **우선순위**: 높음
- **담당자**: luke
- **예상 소요 시간**: 3시간

## 문제 상황
Cline/Caret 확장에서 도구 실행 시스템이 불안정하게 작동하는 문제가 발생함. 특히 `<read_file>`, `<apply_edit>`, `<git_log>`, `<fetch_url_content>` 등의 도구가 정상적으로 작동하지 않거나 간헐적으로 실패하는 상황이 관찰됨.

## 예상 원인
1. JSON 파일 누락: 빌드 과정에서 필요한 JSON 설정 파일들이 dist 폴더로 제대로 복사되지 않아 발생하는 문제
2. Rule 누락: 시스템 규칙 파일들의 누락 또는 불완전한 복사
3. 경로 처리 문제: 파일 경로 처리 로직에 문제가 있어 특정 도구가 불안정하게 작동

## 분석 내용
1. **system.ts 분석 결과:**
   - 현재 프로젝트: JSON 파일에서 시스템 프롬프트 섹션과 규칙을 동적으로 로드하는 방식 사용
   - 원본 cline: 모든 프롬프트 내용이 하드코딩되어 있어 외부 파일 의존성 없음
   - 문제점: 현재 방식은 `sections/` 및 `rules/` 디렉토리의 JSON 파일들을 동적으로 로드하는데, 이 파일들이 빌드 결과물에 포함되지 않으면 오류 발생

2. **esbuild.js 분석 결과:**
   - 현재 프로젝트와 업스트림 프로젝트의 esbuild.js 파일이 동일함
   - 두 버전 모두 웹 어셈블리 파일을 복사하는 `copyWasmFiles` 플러그인이 있지만, JSON, 규칙 파일, 에셋 등을 복사하는 플러그인은 없음
   - 원본 cline과의 차이점: 시스템 프롬프트 처리 방식의 차이로 인해 정적 에셋 복사 플러그인이 필요하나 누락됨

3. **핵심 원인:**
   - `esbuild.js`가 정적 에셋(`sections`, `rules`, `assets` 폴더)을 `dist` 폴더로 복사하지 않는 문제
   - 작업 로그에 언급된 프로필 이미지 문제와 프롬프트 섹션 로드 관련 `ENOENT` 오류의 공통 원인

## 분석 대상 파일
1. **빌드 스크립트**: 
   - `esbuild.js` - 빌드 프로세스 및 파일 복사 로직 검토
   - `package.json` - 빌드 스크립트 및 의존성 확인

2. **도구 실행 관련 코드**:
   - `src/core/task/index.ts` - 태스크 실행 핵심 로직
   - `src/core/task/tools/` - 개별 도구 구현 디렉토리
   - `src/core/controller/index.ts` - 확장 기능 컨트롤러 

3. **시스템 프롬프트 및 규칙 파일**:
   - `src/core/prompts/system.ts` - 시스템 프롬프트 로딩 로직
   - `src/core/prompts/sections/` 및 `src/core/prompts/rules/` - 확장에서 참조하는 규칙 파일들

4. **참조 코드**:
   - `cline-upstream/esbuild.js` - 원본 빌드 스크립트
   - `cline-upstream/src/core/prompts/system.ts` - 원본 시스템 프롬프트 로직

## 해결 방안
1. **esbuild.js 수정:** 
   - 정적 에셋 디렉토리(`sections`, `rules`, `assets`)를 빌드 결과물에 포함시키는 플러그인 추가
   - 예시 코드:
   ```javascript
   const copyAssets = {
     name: "copy-assets",
     setup(build) {
       build.onEnd(() => {
         const assetDirs = [
           path.join(__dirname, "src", "core", "prompts", "sections"),
           path.join(__dirname, "src", "core", "prompts", "rules"),
           path.join(__dirname, "assets")
         ];
         
         const targetDir = path.join(__dirname, "dist");
         
         assetDirs.forEach(dir => {
           // 디렉토리 이름 추출 (sections, rules, assets)
           const dirName = path.basename(dir);
           const targetSubDir = path.join(targetDir, dirName);
           
           // 대상 디렉토리 생성
           if (!fs.existsSync(targetSubDir)) {
             fs.mkdirSync(targetSubDir, { recursive: true });
           }
           
           // 파일 복사 로직
           if (fs.existsSync(dir)) {
             const files = fs.readdirSync(dir);
             files.forEach(file => {
               const sourcePath = path.join(dir, file);
               const targetPath = path.join(targetSubDir, file);
               
               if (fs.statSync(sourcePath).isFile()) {
                 fs.copyFileSync(sourcePath, targetPath);
               }
             });
           }
         });
       });
     },
   };
   ```

2. **대안적 접근방식:** 
   - 원본 cline처럼 시스템 프롬프트를 하드코딩하는 방식으로 변경하여 외부 파일 의존성 제거
   - 단기적으로는 더 안정적일 수 있으나, 장기적으로는 프롬프트 모듈화의 이점을 잃게 됨

3. **에셋, 규칙 파일 직접 복사:**
   - 빌드 스크립트와 별개로 package.json의 build 스크립트에 파일 복사 명령 추가
   - 예시: `"build": "esbuild ... && ncp src/core/prompts/sections dist/sections && ncp src/core/prompts/rules dist/rules && ncp assets dist/assets"`

## 성공 기준
- 모든 도구가 안정적으로 작동하는지 확인
- 특히 `<read_file>`, `<apply_edit>`, `<git_log>` 도구의 정상 작동 확인
- 빌드된 패키지에서 에셋 및 설정 파일들이 올바르게 포함되는지 확인

## 테스트 시나리오
문제 해결 후 제대로 수정되었는지 검증하기 위한 테스트 방법입니다.

### 1. 빌드 결과물 검증
1. **수정된 esbuild.js로 빌드 실행**
   ```bash
   npm run build
   ```

2. **dist 폴더에 필요한 파일이 복사되었는지 확인**
   ```bash
   # sections 디렉토리 복사 확인
   ls -la dist/sections
   
   # rules 디렉토리 복사 확인
   ls -la dist/rules
   
   # 중요 JSON 파일 존재 확인
   ls -la dist/sections/TOOL_DEFINITIONS.json
   ```
   
3. **파일 구조 비교**
   - 소스 디렉토리와 빌드 결과물의 구조가 일치하는지 확인
   - 필요한 모든 JSON 파일과 에셋이 올바른 위치에 복사되었는지 확인

### 2. 로그 분석
1. **디버그 로그 활성화 후 확장 실행**
   - VSCode 개발자 도구 콘솔을 열고 확장 로그 확인
   - 이전에 발생했던 `ENOENT` 또는 파일 로드 관련 오류 메시지가 사라졌는지 확인

2. **파일 로드 성공 여부 확인**
   - 시스템 프롬프트 초기화 단계에서 JSON 파일 로드 성공 여부 확인
   - 에러 로그가 없고, 프롬프트 로딩이 정상적으로 완료되어야 함

### 3. 기능 테스트
1. **read_file 도구 테스트** (성공)
   - Cline에 간단한 파일 읽기 명령 실행
   - 예: `이 프로젝트의 package.json 파일을 읽어줘`
   - 결과: 파일 내용이 정상적으로 출력되어야 함

2. **apply_edit 도구 테스트** (성공)
   - 파일 수정 명령 실행
   - 예: `README.md 파일에 "# Test Header" 텍스트를 추가해줘`
   - 결과: 파일 수정이 정상적으로 이루어져야 함

3. **git_log 도구 테스트** (성공)
   - 예: `최근 5개의 git 커밋을 보여줘`
   - 결과: git 로그가 정상적으로 출력되어야 함
   - 로

4. **fetch_url_content 도구 테스트** (성공)
   - 예: `https://example.com의 내용을 가져와줘`
   - 결과: URL 내용이 정상적으로 가져와져야 함
   - 아래와 같이 출력력
