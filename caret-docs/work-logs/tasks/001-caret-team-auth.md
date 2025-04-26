# Caret Team 로그인 구현

## 개요
app.caret.team 로그인 처리를 구현합니다.

## 관련 파일
- `webview-ui/src/components/welcome/WelcomeView.tsx`: 로그인 UI 및 초기 처리
- `src/core/controller/index.ts`: 로그인 메시지 처리 및 인증 로직

## 작업 상태
- [ ] WelcomeView에서 app.caret.team 로그인 URL 연결
  - [ ] uriScheme 타입 에러 수정
  - [ ] vscode.Uri 타입 에러 수정
  - [ ] nonce 생성 및 저장 로직 구현
- [ ] 콜백 URL 처리 구현
  - [ ] 인증 상태 검증
  - [ ] 토큰 저장
  - [ ] 사용자 정보 업데이트
- [ ] 에러 처리
  - [ ] 인증 실패 시 에러 메시지 표시
  - [ ] 네트워크 오류 처리
- [ ] 테스트
  - [ ] 로그인 플로우 테스트
  - [ ] 에러 케이스 테스트

## 참고사항
- 현재 WelcomeView.tsx에서 타입 에러가 있어 수정이 필요합니다
- 인증 콜백은 vscode://saoudrizwan.claude-dev/auth로 설정되어 있습니다
- nonce를 사용한 보안 처리가 필요합니다 