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
    -   [x] 다른 모드(`plan`, `do`, `talk`) 추가 개선 필요 여부 검토 (필요시 논의) -> arch, dev, rule. talk 기본 4개 모드 제공으로 변경경
4.  **프로젝트 규칙 파일명 변경**
    -   [x] 프로젝트 규칙 파일명을 `.clinerules`에서 `.caretrules`로 변경하기로 결정.
    -   [x] 파일명 변경 완료.
    -   [x] 코드베이스 전체에서 `.clinerules` 참조를 찾아 `.caretrules`로 수정하는 작업 필요 (ACT 모드에서).
5.  **기존 `.clinerules` 검토 내용 통합** (아래 내용은 새로운 구조 논의 후 재배치 또는 통합 필요)
    -   [x] 기존 `.clinerules` 검토 내용 반영 (`Caret 시스템 프롬프트 구성 사상`, `Caret 시스템 프롬프트 종류` 등) - 새로운 `.caretrules` 구조에 맞게 통합/재배치 필요.
    -   [x] 기존 문서 참조 관련 메모(`project-guide.md` 관련) 처리 방안 결정 (새로운 `caret-docs` 구조에 통합 또는 다른 방식으로 처리)
6.  **실행 계획 확정 및 구현**
    -   [x] 위 논의 기반 구체적인 `.caretrules` 생성/수정 계획 확정.
    -   [x] .clinerules 파일 .caretrules로 변경
    -   [x] 모드 개선 계획 확정 (`agents-rules/alpha/modes.json` 수정).
    -   [x] 실제 파일 수정, 생성, 이동, 이름 변경, 코드 참조 업데이트 작접 진행
    -   [x] 하드코딩된 모드 모두 변경

## 메모
- 규칙 시스템은 JSON으로 단일화하되, 필요시 마크다운으로 변환 가능하도록 구현
- 버전 관리는 Git 기반으로 구현하여 변경 이력 추적 용이하게 함
