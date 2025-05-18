# 태스크 #011: Cline UI 다국어 관리 시스템 구현

## 설명
*   Cline UI의 다국어 지원을 위해 i18n 라이브러리(예: i18next)를 도입하고, UI 텍스트를 리소스 파일로 분리하여 관리하는 시스템을 구현합니다. 이를 통해 향후 다양한 언어 추가 및 관리를 용이하게 합니다.

### 참고: 수정 대상 UI 컴포넌트 목록 (i18n 적용 시)
*   `webview-ui/src/main.tsx`: React 애플리케이션의 진입점입니다.
*   `webview-ui/src/context/FirebaseAuthContext.tsx`: Firebase 인증 컨텍스트를 제공하는 파일입니다.
*   `webview-ui/src/context/ExtensionStateContext.tsx`: 확장 상태 컨텍스트를 제공하는 파일입니다.
*   `webview-ui/src/components/welcome/WelcomeView.tsx`: Welcome 뷰를 표시하는 파일입니다.
*   `webview-ui/src/components/settings/__tests__/APIOptions.spec.tsx`: API 옵션 컴포넌트 테스트 파일입니다.
*   `webview-ui/src/components/settings/ThinkingBudgetSlider.tsx`: Thinking Budget 슬라이더 컴포넌트 파일입니다.
*   `webview-ui/src/components/settings/TabNavbar.tsx`: 탭 네비게이션 바 컴포넌트 파일입니다.
*   `webview-ui/src/components/chat/ChatRow.tsx`: 채팅 행 컴포넌트 파일입니다.
*   `webview-ui/src/components/chat/ChatTextArea.tsx`: 채팅 텍스트 영역 컴포넌트 파일입니다.
*   `webview-ui/src/components/chat/ChatView.tsx`: 채팅 뷰 컴포넌트 파일입니다.
*   `webview-ui/src/components/chat/ContextMenu.tsx`: 컨텍스트 메뉴 컴포넌트 파일입니다.
*   `webview-ui/src/components/chat/TaskHeader.tsx`: 태스크 헤더 컴포넌트 파일입니다.
*   `webview-ui/src/components/common/CheckmarkControl.tsx`: 체크마크 컨트롤 컴포넌트 파일입니다.
*   `webview-ui/src/components/common/CodeAccordian.tsx`: 코드 아코디언 컴포넌트 파일입니다.
*   `webview-ui/src/components/common/VSCodeButtonLink.tsx`: VSCode 버튼 링크 컴포넌트 파일입니다.
*   `webview-ui/src/components/history/HistoryView.tsx`: 히스토리 뷰 컴포넌트 파일입니다.
*   `webview-ui/src/components/mcp/ImagePreview.tsx`: 이미지 미리보기 컴포넌트 파일입니다.
*   `webview-ui/src/components/mcp/marketplace/McpMarketplaceCard.tsx`: MCP 마켓플레이스 카드 컴포넌트 파일입니다.
*   `webview-ui/src/components/mcp/marketplace/McpMarketplaceView.tsx`: MCP 마켓플레이스 뷰 컴포넌트 파일입니다.
*   `webview-ui/src/components/mcp/McpResponseDisplay.tsx`: MCP 응답 표시 컴포넌트 파일입니다.
*   `webview-ui/src/components/mcp/McpToolRow.tsx`: MCP 도구 행 컴포넌트 파일입니다.
*   `webview-ui/src/components/mcp/McpView.tsx`: MCP 뷰 컴포넌트 파일입니다.
*   `webview-ui/src/components/settings/ApiOptions.tsx`: API 옵션 컴포넌트 파일입니다.
*   `webview-ui/src/components/settings/OpenAiModelPicker.tsx`: OpenAI 모델 선택기 컴포넌트 파일입니다.
*   `webview-ui/src/components/settings/OpenRouterModelPicker.tsx`: OpenRouter 모델 선택기 컴포넌트 파일입니다.
*   `webview-ui/src/components/settings/SettingsView.tsx`: 설정 뷰 컴포넌트 파일입니다.

## 진행 상황
*   [ ] 다국어 관리 라이브러리 선정 및 설치
*   [ ] 다국어 리소스 파일 구조 설계 및 생성 (예: `locales/en/translation.json`, `locales/ko/translation.json`)
*   [ ] UI 컴포넌트에서 텍스트를 직접 사용하는 대신, 다국어 관리 시스템을 통해 가져오도록 수정
*   [ ] 초기 언어 설정 (영어, 한국어) 적용

## 특이사항
*   현재 `webview-ui`에는 별도의 다국어 관리 시스템이 구현되어 있지 않아, UI 텍스트가 코드에 직접 작성되어 있습니다.
*   `locales` 디렉토리는 존재하지만, 문서 파일 번역본만 포함하고 있습니다. UI 텍스트 리소스 관리를 위해 이 디렉토리를 활용하거나 새로운 구조를 만들 수 있습니다.

## 다음 단계
*   다국어 관리 시스템 구현 완료 후, 한국어 리소스 파일(`locales/ko/translation.json`)에 번역된 텍스트 추가 작업 진행 (#011-1)
