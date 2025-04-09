# 태스크 #017: Caret의 윈도우가 갑자기 사라져서 아무것도 표기안됨

## 담당자
*   루크 (마스터)
*   알파 (AI)

## 목표
디버깅

## 작업 단계
1.  Cline버전의 알파를 동작시키고, 디버그 모드에서 해당 현상 재현하고 원인파악 진행
    *   코드 분석 결과, 웹뷰 UI의 `CodeBlock` 컴포넌트(`webview-ui/src/components/common/CodeBlock.tsx`)에서 사용하는 구문 강조 라이브러리(`rehype-highlight`)가 특정 코드/diff 처리 중 오류를 발생시키고, 이 오류가 처리되지 않아 전체 웹뷰 렌더링이 중단되는 것이 원인으로 추정됨.
2.  대응
    *   React Error Boundary 패턴을 적용하여 오류 처리 로직 추가:
        *   `webview-ui/src/components/common/ErrorBoundary.tsx` 컴포넌트 신규 생성.
        *   `webview-ui/src/components/common/CodeBlock.tsx` 파일 수정: `ErrorBoundary` 컴포넌트를 사용하여 코드 블록 렌더링 영역을 감싸서, 내부 오류 발생 시 앱 전체가 멈추지 않고 해당 영역만 대체 UI(오류 메시지)를 표시하도록 수정함.
    *   이를 통해 화면 전체가 하얗게 되는 현상(증상)을 방지하는 방어적인 조치를 완료함.
