# TASK #029: ChatView UI 버그 수정

## 발견된 문제

1. **사고 과정 표시 문제:**
   - "thinking" 상태가 UI에 표시되지 않음
   - AI가 생각 중일 때 thinking 아이콘으로 변경되지 않음
   - 생각하는 모습이 나왔다가 곧바로 사라지는 현상 발생

2. **선택지 버튼 동작 오류:**
   - 옵션 버튼 클릭해도 반응 없음
   - 버튼 스타일은 변경되지만 실제 클릭 이벤트가 작동하지 않음

3. **내부 메시지 노출 문제:**
   - "The user is asking for options" 같은 내부 처리 메시지가 여전히 화면에 표시됨
   - 메시지 필터링 로직이 제대로 작동하지 않음

4. **세션 제어 버그:**
   - "Start New Task" 버튼이 클릭되지 않음
   - 새 세션으로 이동하는 기능 작동하지 않음

## 관련 파일

- `webview-ui/src/components/chat/ChatView.tsx`
- `webview-ui/src/components/chat/ChatRowContent.tsx` 
- `webview-ui/src/components/chat/OptionsButtons.tsx`
- `webview-ui/src/components/chat/chat_utils/messageParser.ts`
- `webview-ui/src/components/chat/chat_hooks/useCaretAskState.ts`

## 해결 방안

### 1. 사고 과정 표시 문제
- `ChatRowContent.tsx`에서 "ask" 타입의 "completion_result" 케이스 처리 확인
- `isThinking` 상태가 제대로 표시되도록 로직 수정
- `MessageContentWrapper` 스타일링 개선

### 2. 선택지 버튼 동작 문제
- `OptionsButtons.tsx`에서 클릭 이벤트 핸들러 로직 확인
- `vscode.postMessage` 작동 여부 확인
- `isActive` 및 `hasSelected` 상태 검증

### 3. 내부 메시지 필터링
- `messageParser.ts`의 필터링 패턴 확장
- `ChatView.tsx`의 `visibleMessages` 필터링 로직 개선

### 4. 세션 제어 동작
- `ChatButtons` 컴포넌트의 이벤트 핸들러 확인
- `handlePrimaryButtonClick` 함수에서 "completion_result" 케이스 처리 검증

## 우선순위

1. 내부 메시지 필터링 문제 해결
2. 선택지 버튼 기능 복구
3. 생각 중 UI 표시 개선
4. 세션 제어 버튼 동작 수정

## 담당자

- Luke
- Alpha 