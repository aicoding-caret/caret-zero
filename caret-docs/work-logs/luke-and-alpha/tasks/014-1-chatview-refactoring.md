# ChatView 컴포넌트 리팩토링

## 원본 코드 위치와 참고 사항
- **원본 코드 위치**: `c:\dev\private-cline\webview-ui\src\components\chat\ChatView.tsx`
- **리팩토링 대상**: `c:\dev\caret-zero\webview-ui\src\components\chat\ChatView.tsx`
- **중요**: 원본 코드(private-cline)의 동작을 정확히 유지하면서 구조만 개선해야 함

## 리팩토링 목표
1. 큰 ChatView 컴포넌트(1170라인)를 작은 단위로 분할
2. 재사용 가능한 커스텀 훅으로 로직 분리
3. UI 컴포넌트 분리
4. 타입 오류 수정 및 코드 품질 향상

## 현재 디렉토리 구조
```
chat/
├── ChatView.tsx (원본 파일)
├── chat_hooks/ (상태 관리 로직)
│   ├── useChatInputState.ts
│   ├── useBrowserSessionState.ts
│   ├── useCaretAskState.ts
│   ├── useMessageState.ts
│   ├── useModeShortcuts.ts
│   └── useScrollControl.ts
├── chat_ui/ (UI 컴포넌트)
│   ├── ChatHeader.tsx
│   ├── ChatButtons.tsx
│   ├── ScrollControls.tsx
│   └── ModeSelector.tsx
└── chat_utils/ (유틸리티 함수)
    └── messageParser.ts
```

## 완료된 작업
1. **디렉토리 구조 설정**
   - `chat_hooks`, `chat_ui`, `chat_utils` 폴더 생성

2. **커스텀 훅 분리**
   - `useChatInputState` - 텍스트 입력과 이미지 선택 상태 관리
   - `useBrowserSessionState` - 브라우저 세션 관련 상태 관리
   - `useCaretAskState` - 질문 상태 관리
   - `useMessageState` - 메시지 관련 상태 관리
   - `useModeShortcuts` - 모드 단축키 관리
   - `useScrollControl` - 스크롤 컨트롤 관리

3. **UI 컴포넌트 분리**
   - `ChatHeader` - 채팅 헤더 컴포넌트
   - `ChatButtons` - 채팅 인터페이스 버튼 컴포넌트
   - `ScrollControls` - 스크롤 컨트롤 UI 컴포넌트
   - `ModeSelector` - 모드 선택 컴포넌트

4. **버그 수정**
   - `useEvent` 임포트 경로 수정 (`react-use`에서 가져오도록)
   - `MAX_IMAGES_PER_MESSAGE` 상수 추가
   - `vscode.postMessage` 호출의 메시지 타입 수정

## 현재 문제와 진행 중인 작업
- ~~`normalizeApiConfiguration` 함수 관련 문제~~ (해결됨: `apiModelId`, `apiProvider` 사용으로 개선)
- ~~ChatHeader 컴포넌트 관련 문제~~ (`selectedModelInfo` 사용 방식 개선, `apiMetrics` 문제는 별도 확인 필요)
- ~~메시지 타입 문제~~ (해결됨: 주요 핸들러 메시지 타입 및 구조 수정 완료)
- **리팩토링된 컴포넌트 기능 테스트 필요**

## 다음 단계 작업 계획
1. ~~`ApiProvider` 타입 임포트 문제 해결~~ (완료)
2. ~~ChatHeader 컴포넌트의 타입 문제 해결~~ (`selectedModelInfo` 사용 개선, 추가 확인 필요 시 별도 태스크)
3. ~~남은 메시지 핸들러들의 타입 문제 확인 및 수정~~ (완료)
4. ~~전체 빌드 테스트로 최종 오류 확인~~ (완료 - 빌드 성공)
5. **기능 테스트로 원본과 동일하게 작동하는지 확인** (진행 필요)

## 점검 시 주의사항
1. ~~원본 코드와 비교하여 메시지 타입과 핸들러 로직이 정확히 일치하는지 확인~~ (코드 레벨 확인 완료)
2. 메시지가 올바르게 표시되고 사용자 입력이 제대로 처리되는지 확인 (**기능 테스트 필요**)
3. 모든 커스텀 훅의 의존성 배열이 올바르게 설정되었는지 확인 (코드 레벨 확인 완료)
4. UI 컴포넌트가 필요한 props를 모두 받고 있는지 확인 (코드 레벨 확인 완료)
5. **실제 사용 시 엣지 케이스 및 성능 확인** (**기능 테스트 필요**)
