# Task 029: Cline Upstream 변경 사항 병합 - 액션 체크리스트

**날짜:** 2024-05-18

## 사전 분석

- [X] `cline-upstream/CHANGELOG.md` 읽고 주요 변경 사항 요약 기록 (계획 문서에 반영 완료)
- [X] **자동화 스크립트 실행:** `scripts/merging-job/run_all_diffs.ps1`를 실행하여 다음 파일들을 `scripts/merging-job/` 폴더에 생성 완료 (이 과정에서 `caret-docs/tasks/029-02-action-git-*-changes.txt` 파일들도 업데이트됨):
    -   `upstream_only_changes.txt`
    -   `both_changed_files.txt`
    -   `caret_only_changes.txt`
- [X] 병합 대상 파일 목록 확정 및 기록 (위 자동화 스크립트 결과 파일들, 특히 `scripts/merging-job/upstream_only_changes.txt`와 `scripts/merging-job/both_changed_files.txt`를 분석하여 진행 - `upstream_only_changes.txt` 내용 분석 완료, `both_changed_files.txt` 분석 예정)
- [X] 마스터와 커스텀 로직/Upstream 기능 논의 결과 기록 (계획 문서에 기본 원칙 반영 완료)

## 파일별 병합 진행

- [ ] **1단계: Upstream 단독 변경 파일 우선 적용 (루트 파일 & Docs)**
    -   [ ] **루트 디렉터리 파일 병합:**
        -   [ ] 대상 파일 식별 완료: `.codespellrc`, `.mocharc.json`, `esbuild.js`, `tsconfig.json`.
        -   [ ] `cline-upstream` 레포지토리에서 해당 파일들 준비 (로컬 경로 확인 또는 clone 필요 시 수행).
        -   [ ] 대상 파일들 (`caret-zero` 프로젝트 내)을 `cline-upstream` 버전으로 덮어쓰기.
        -   [ ] (브랜딩: 루트 설정 파일의 `cline` 관련 문자열은 빌드 성공 후 전체 브랜딩 단계에서 처리 예정)
    -   [ ] **문서 파일 병합 (신규 `cline-docs` 폴더 생성, `caret-docs`는 유지):**
        -   [ ] `caret-zero` 프로젝트 루트에 `cline-docs` 폴더 생성.
        -   [ ] `cline-upstream/docs/` 폴더 내용을 `caret-zero/cline-docs/` 폴더로 전체 복사 (덮어쓰기).
        -   [ ] `caret-zero/cline-docs/` 내에 `old_docs` 폴더 생성.
        -   [ ] `cline-upstream/old_docs/` 폴더 내용을 `caret-zero/cline-docs/old_docs/` 폴더로 전체 복사 (덮어쓰기).
        -   [ ] (`caret-docs` 폴더는 변경 없음 재확인)
        -   [ ] (브랜딩: `cline-docs` 내부 파일 브랜딩은 추후 별도 단계로 진행 예정)
    -   [ ] **빌드 시도:**
        -   [ ] `npm run build` (또는 `npm run compile`) 실행.
        -   [ ] 빌드 오류 발생 시 원인 분석 및 해결.
    -   [ ] **결과 보고:**
        -   [ ] 처리된 파일 목록, 빌드 성공 여부 및 오류 내용을 `029-03-report-merge-cline-upstream.md`에 기록.

**`package.json`**
- [ ] `read_file`로 양쪽 `package.json` 읽기
- [ ] 변경 사항 비교 분석
- [ ] `replace_in_file` 또는 `write_to_file` (마스터 승인 후) 적용
- [ ] `npm install` 실행 요청

**(반복) 핵심 모듈/UI/프롬프트/설정 파일 (파일명: __________)**
- [ ] `read_file`로 양쪽 파일 읽기 (또는 `git diff --no-index` 결과 확인)
- [ ] 변경 내용 분석 (커스텀 로직 식별)
- [ ] `replace_in_file` (작은 단위) 또는 `write_to_file` (마스터 승인 및 백업 후) 적용
    - [ ] `SEARCH` 블록 정확성 확인 (필요시 `read_file` 재확인)
    - [ ] `replace_in_file` 실패 시 (3회 이상) 마스터 보고 및 전략 수정
- [ ] `npm run compile` 실행 요청 및 오류 해결

## 최종 확인

- [ ] 모든 주요 기능 테스트 (마스터와 함께)
- [ ] 관련 문서 업데이트 (필요시) 