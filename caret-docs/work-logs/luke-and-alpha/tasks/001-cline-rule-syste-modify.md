# 태스크 #001: Cline 규칙 시스템 개선

## 태스크 정보
- **태스크 번호**: #001
- **태스크 이름**: Cline 규칙 시스템 개선
- **생성일**: 2025-03-25
- **작업일**: 2025-04-14
- **상태**: 진행 중
- **우선순위**: 높음
- **담당자**: luke
- **예상 소요 시간**: 3시간

## 태스크 목적
Cline의 규칙 시스템을 개선하여 더 효율적이고 관리하기 쉬운 구조로 재구성합니다. 현재의 다국어 지원 및 복잡한 파일 구조를 단순화하고, JSON 기반의 새로운 규칙 시스템을 구축하여 토큰 사용량을 최적화합니다.

## 실행 단계
1.  **Caret 문서 구조 정의**
    -   [x] 새로운 Caret 전용 문서 폴더 이름 결정: `caret-docs`
    -   [x] Caret 전용 문서 폴더 내 하위 구조 확정: `architecture/`, `development-process/`, `rules-reference/`, `guides/`
2.  **`.clinerules` 내용 정제**
    -   [x] 현재 `.clinerules` 내용 분석 완료 (대부분 업스트림 Cline 기술 가이드)
    -   [x] Caret 개발 방법론 반영 방식 확정:
        *   `.clinerules`는 마크다운 기반 유지, 핵심 개요 및 참조 인덱스 역할 수행.
        *   상세 개발 규칙(TDD, 코딩 컨벤션 등)은 길이와 상관없이 `caret-docs/development-process/` 내 별도 파일로 분리.
    -   [x] `.clinerules` 내 문서 참조 규칙 확정:
        *   마크다운 내 `json-reference` 코드 블록 사용하여 구조화된 JSON 형식으로 참조 정보 명시.
        *   참조 대상 문서는 마크다운 등 원본 형식 유지.
3.  **모드 정의 검토 및 개선**
    -   [x] `agents-rules/alpha/modes.json` 파일 내용 확인 완료.
    -   [x] 현재 모드(`plan`, `do`, `rule`, `talk`) 정의 검토 완료.
    -   [x] `rule` 모드 개선 방안 확정:
        *   아래 규칙들을 `rule` 모드의 `rules` 배열에 추가 예정 (ACT 모드에서):
            - "Collaborate with the user to manage and refine the `.caretrules` file (Markdown format with `json-reference` blocks)." (파일명 `.caretrules`로 수정 반영)
            - "Assist the user in creating, updating, and deleting structured reference blocks (`json-reference`) within `.caretrules`." (파일명 `.caretrules`로 수정 반영)
            - "Ensure consistency between `.caretrules` references and the actual content in `caret-docs` and `docs` folders." (파일명 `.caretrules`로 수정 반영)
    -   [x] 다른 모드(`plan`, `do`, `talk`) 추가 개선 필요 여부 검토 (필요시 논의)
4.  **프로젝트 규칙 파일명 변경**
    -   [x] 프로젝트 규칙 파일명을 `.clinerules`에서 `.caretrules`로 변경하기로 결정.
    -   [x] 파일명 변경 완료.
    -   [x] 코드베이스 전체에서 `.clinerules` 참조를 찾아 `.caretrules`로 수정 완료 (RULE 모드에서 진행, 단 스크립트/소스/upstream/로그/특허 파일 제외).
5.  **문서 파일 위치 정리**
    -   [x] `docs` 폴더와 `cline-upstream/docs` 폴더 비교하여 Caret 전용 문서(`project-vision.*`, `roadmap.*`, `development/`, `patent-materials/`, `releases/`, `reports/`, `sLLM/`, `strategy-archive/`, `testing/`, `work-logs/`, `workingLog/` 등)를 `caret-docs` 폴더로 이동 완료.
    -   [x] `caret-docs`로 이동된 문서 내 `docs/` 경로를 참조하는 링크를 `caret-docs/`로 수정 완료 (`work-logs/luke-and-alpha/tasks/complete/006-cline-project-roadmap-planning.md` 파일 1건 수정).
6.  **`.caretrules` 개선 및 생성**
    -   [x] 기존 `.clinerules.bak` 파일 내용을 참고하여, 프로젝트 구조 및 개발 프로세스 가이드 중심으로 새로운 `.caretrules` (JSON 형식) 구조 설계 및 내용 작성 완료.
    -   [x] `.caretrules` (JSON) 파일 생성 완료.
    -   [x] `.caretrules.md` (마크다운) 파일 생성 완료 (JSON 내용 기반).
    -   [x] `.caretrules`의 구조와 동작 방식을 `caret-docs/rules-reference/caretrules-guide.md` 파일로 문서화 완료.
7.  **다른 규칙 파일 생성**
    -   [x] `.caretrules` 및 `.caretrules.md` 파일을 복사하여 `.windsurfrules`, `.windsurfrules.md` 파일 생성 완료.
    -   [x] `.caretrules` 파일을 복사하여 `.cursorrules` 파일 생성 완료 (마크다운 버전 제외).

## 메모
- 규칙 시스템은 JSON으로 단일화하되, 마크다운 버전도 함께 생성하여 가독성 확보. (`.caretrules`, `.windsurfrules`, `.cursorrules` 모두 해당)
- 버전 관리는 Git 기반으로 구현하여 변경 이력 추적 용이하게 함.
- `.clinerules.bak` 파일은 새로운 규칙 파일 생성 시 참고용으로 유지.
