# caret-docs/development 인덱스

이 디렉토리는 Caret 확장의 개발/설계/구현 가이드와 각종 표준 문서를 모아둔 곳입니다. 주요 파일을 한눈에 찾고, 빠르게 이동할 수 있도록 인덱스를 제공합니다.

---

## 개발 표준 및 유틸리티

- [logging.md](./logging.md)
  - 백엔드/프론트엔드 로깅 시스템 사용 가이드
  - 로깅 원칙 및 웹뷰 URI 변환 방법
  - **참고시기**: 새로운 기능 개발, 디버깅, 오류 추적 시

- [utilities.md](./utilities.md)
  - 백엔드/프론트엔드 유틸리티 함수 목록
  - 중복 구현 방지 및 유틸리티 구현 지침
  - **참고시기**: 새로운 기능 개발 시, 공통 기능 구현 필요할 때

- [webview-extension-communication.md](./webview-extension-communication.md)
  - 웹뷰-확장 간 메시지 통신 방법
  - 메시지 타입 정의 및 처리 가이드
  - **참고시기**: UI 기능 개발, 웹뷰-확장 통신 구현, 새로운 메시지 타입 추가 시

## i18n/Locale 시스템

Caret는 글로벌 언어 지원을 위해 `DEFAULT_LANGUAGE`(en) 상수 및 템플릿 캐릭터의 언어별 locale 구조를 도입했습니다. 각 캐릭터는 언어별로 name/description/customInstruction을 동적으로 가질 수 있으며, 앱 내에서 현재 선택 언어 → en 순으로 fallback 처리합니다. 자세한 내용은 [locale.md](./locale.md) 참고.

## 리팩토링 원칙 (500라인 넘으면 반드시 고려할 것)

- 토큰 최적화 : 파일이 커지면 AI의 사용 토큰이 크게 증가합니다.
- 기능별 모듈화: 큰 파일은 기능별로 분리하여 별도 파일/디렉토리로 구성
- 책임 분리: 각 모듈은 단일 책임 원칙(SRP)을 따라야 함
- 인터페이스 사용: 의존성 주입을 위해 인터페이스 활용
- 유틸리티 함수: 반복되는 로직은 유틸리티 함수로 추출
- 백업 및 문서화: 코드 변경 전 백업 생성 및 작업 로그에 기록

## UI ↔ Storage 관련 가이드

- [ui-to-storage-flow-core.md](./ui-to-storage-flow-core.md)
  - UI~Storage 표준 핵심 흐름 요약
  - **참고시기**: 새로운 저장 기능 개발 시 개요 파악

- [ui-to-storage-flow-storage-util.md](./ui-to-storage-flow-storage-util.md)
  - 공통 저장/불러오기/Secret 유틸 함수 및 API 정리
  - **참고시기**: 데이터 저장 관련 기능 구현 시

- [ui-to-storage-flow-image.md](./ui-to-storage-flow-image.md)
  - 이미지 파일 저장/불러오기 집중 가이드
  - **참고시기**: 이미지 관련 기능 개발 시

- [ui-to-storage-flow.md](./ui-to-storage-flow.md)
  - 전체 흐름+예시+보안까지 상세 통합본
  - **참고시기**: 보안 관련 기능 개발, 전체 흐름 이해 필요 시

## 기타 개발/설계 관련 문서

- Cline Upstream 병합 전략 가이드 (AI 작업 지침 포함).md
  - 브랜치 전략, 병합, AI 작업 협업 팁 등
  - **참고시기**: 코드 병합, 브랜치 관리 시

---

> 각 문서별로 목적/포커스가 다르니, 필요한 목적에 맞게 빠르게 찾아보세요!
> 시스템 프롬프트나 개발 가이드, 신규 기능 설계 시 인덱스에서 바로 경로 복사해 활용하면 편리합니다~ ｡•ᴗ•｡🌿
