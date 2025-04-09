# 태스크 #018: 빌드 후 실행 문제 디버깅 및 안정화

## 담당자
*   루크 (마스터)
*   알파 (AI)

## 목표
*   빌드 후 애플리케이션이 정상적으로 실행되지 않는 문제의 원인을 파악하고 해결하여 안정성을 확보한다.

## 작업 내용
*   `npm run compile` 실행 시 다수의 TypeScript 컴파일 오류 발생 확인.
*   오류 원인 분석: `ILogger` 인터페이스 도입 후 관련 클래스(`Task`, `TerminalManager`, `BrowserSession`, `DiffViewProvider`) 생성자 호출 시 `logger` 인스턴스 전달 누락 또는 잘못된 위치 전달 문제.
*   `src/core/task/index.ts` 수정:
    *   `Task` 생성자에 `logger: ILogger` 파라미터 추가 및 필수 파라미터 순서 조정.
    *   `logger` 멤버 변수 선언 추가.
    *   `TerminalManager`, `BrowserSession`, `DiffViewProvider` 생성 시 `logger` 인스턴스 전달.
*   `src/core/controller/index.ts` 수정:
    *   `initClineWithTask`, `initClineWithHistoryItem` 메서드에서 `Task` 생성자 호출 시 `this.logger`를 올바른 위치에 전달하도록 수정.
*   `npm run compile` 재실행하여 컴파일 성공 확인.

## 관련 로그
*   [2025-04-09 작업 로그](../2025-04-09.md)

## 상태
*   완료
