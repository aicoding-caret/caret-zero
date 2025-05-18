# Task 029: Cline Upstream 변경 사항 병합 - 액션 체크리스트

**날짜:** 2024-05-18

## 사전 분석

- [X] `cline-upstream/CHANGELOG.md` 읽고 주요 변경 사항 요약 기록 (계획 문서에 반영 완료)
- [X] `cline-upstream` 변경 파일 목록 확보 (`git diff --name-only v3.10.1 v3.16.1 > cline_upstream_changes.txt` 실행 완료)
- [X] `caret-zero` 프로젝트 기준 커밋(`1cd3bd50`) 이후 변경 파일 목록 확보 (`git diff --name-only 1cd3bd50 HEAD > caret_zero_changes.txt` 실행 완료)
- [ ] 병합 대상 파일 목록 확정 및 기록 (위 두 `txt` 파일 비교 분석 후 진행)
- [X] 마스터와 커스텀 로직/Upstream 기능 논의 결과 기록 (계획 문서에 기본 원칙 반영 완료)

## 파일별 병합 진행

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